"use client";

import React from "react";
import { useAuthStore } from "@/lib/store/auth.store";
import { useState, useEffect } from "react";
import { httpClient } from '@/lib/http-client';
import { HistoryItem, HistoryResponse } from '@/lib/types/history.types';
import { FeedbackItem, FeedbackResponse } from '@/lib/types/feedback.types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { Calendar, Eye, FileText, Image as ImageIcon, User, Download, ExternalLink, RefreshCw, ChevronDown, ChevronUp, X as XIcon, MessageSquare, CheckCircle2 } from "lucide-react";
import jsPDF from 'jspdf';
import { useToast } from "@/hooks/use-toast";

export default function HistoryPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [histories, setHistories] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [animatingCards, setAnimatingCards] = useState<Set<string>>(new Set());
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<string, FeedbackItem[]>>({});
  const [loadingFeedbacks, setLoadingFeedbacks] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const fetchFeedback = async (reportId: string) => {
    // Skip if we're already loading this report's feedback
    if (loadingFeedbacks.has(reportId)) return;

    // If we already have feedbacks and they are non-empty, skip fetching again
    if (Object.prototype.hasOwnProperty.call(feedbacks, reportId) && feedbacks[reportId]?.length > 0) return;

    console.debug('fetchFeedback: requesting feedbacks for reportId', reportId);
    setLoadingFeedbacks(prev => new Set(prev).add(reportId));
    try {
      const response = await httpClient.get<FeedbackResponse>(`/feedbacks/report/${reportId}`);
      console.debug('fetchFeedback: response', response?.data);

      const list = Array.isArray(response?.data?.data) ? response.data.data : [];

      setFeedbacks(prev => ({
        ...prev,
        [reportId]: list,
      }));

      console.debug(`fetchFeedback: stored ${list.length} feedback(s) for`, reportId);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      toast({
        title: "Error",
        description: "Failed to load expert feedback",
        variant: "destructive",
      });
    } finally {
      setLoadingFeedbacks(prev => {
        const newSet = new Set(prev);
        newSet.delete(reportId);
        return newSet;
      });
    }
  };

  console.log("Feedbacks:", feedbacks);

  const toggleCardExpansion = (cardId: string, reportId: string) => {
    console.debug('toggleCardExpansion', { cardId, reportId, currentlyExpanded: expandedCards.has(cardId) });
    setAnimatingCards(prev => new Set(prev).add(cardId));

    // Fetch feedback when expanding
    if (!expandedCards.has(cardId)) {
      fetchFeedback(reportId);
    }

    setTimeout(() => {
      setExpandedCards(prev => {
        const newSet = new Set(prev);
        if (newSet.has(cardId)) {
          newSet.delete(cardId);
        } else {
          newSet.add(cardId);
        }
        return newSet;
      });
      setAnimatingCards(prev => {
        const newSet = new Set(prev);
        newSet.delete(cardId);
        return newSet;
      });
    }, 150);
  };

  // If histories already reference a feedback id (some reports may already have feedbacks),
  // pre-fetch them so the UI shows available feedback without requiring user to expand.
  useEffect(() => {
    if (!histories || histories.length === 0) return;
    histories.forEach((item) => {
      try {
        const reportObj = findReportObjectRecursive(item) ?? (item.report as any);
        const rid = reportObj?.id;
        if (!rid) return;
        // If report object contains feedback_id, try prefetching its feedbacks
        if (reportObj.feedback_id) {
          // only fetch if not already loading and not present
          if (!loadingFeedbacks.has(rid) && (!feedbacks[rid] || feedbacks[rid].length === 0)) {
            console.debug('Prefetching feedback for report with feedback_id', { rid, feedback_id: reportObj.feedback_id });
            fetchFeedback(rid);
          }
        }
      } catch (e) {
        // ignore per-item failures
      }
    });
  }, [histories]);

  const openPreview = (src?: string | null) => {
    if (!src) return;
    setPreviewSrc(src);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setTimeout(() => setPreviewSrc(null), 200);
  };

  const downloadReport = async (item: HistoryItem) => {
    try {
      // Create PDF using jsPDF text methods for better reliability
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPosition = margin;

      // Helper function to add text with word wrapping
      const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(text, maxWidth);
        pdf.text(lines, x, y);
        return y + (lines.length * fontSize * 0.4); // Approximate line height
      };

      // Helper function to load image as base64
      const loadImageAsBase64 = async (imageUrl: string): Promise<string | null> => {
        try {
          const response = await fetch(imageUrl, { mode: 'cors' });
          if (!response.ok) throw new Error('Failed to load image');
          const blob = await response.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          });
        } catch (error) {
          console.warn('Failed to load image for PDF:', error);
          return null;
        }
      };

      // Helper function to check if we need a new page
      const checkPageBreak = (currentY: number, requiredSpace: number = 20) => {
        if (currentY + requiredSpace > pageHeight - margin) {
          pdf.addPage();
          return margin;
        }
        return currentY;
      };

      // Title
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Medical Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Report header info
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Report ID: ${item.report.id.slice(0, 12)}...`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Generated: ${new Date(item.report.generated_at).toLocaleString()}`, margin, yPosition);
      yPosition += 8;
      pdf.text(`Viewed: ${new Date(item.viewed_at).toLocaleString()}`, margin, yPosition);
      yPosition += 15;

      // Patient Information Section
      yPosition = checkPageBreak(yPosition, 30);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Patient Information', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Name: ${item.user.name}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Email: ${item.user.email}`, margin, yPosition);
      yPosition += 6;
      if (item.user.age) {
        pdf.text(`Age: ${item.user.age}`, margin, yPosition);
        yPosition += 6;
      }
      if (item.user.phone) {
        pdf.text(`Phone: ${item.user.phone}`, margin, yPosition);
        yPosition += 6;
      }
      if (item.user.address) {
        yPosition = addWrappedText(`Address: ${item.user.address}`, margin, yPosition, pageWidth - 2 * margin);
      }
      yPosition += 10;

      // Scan Details Section
      yPosition = checkPageBreak(yPosition, 30);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Scan Details', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Scan ID: ${item.report.scan.id}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Uploaded: ${new Date(item.report.scan.uploaded_at).toLocaleString()}`, margin, yPosition);
      yPosition += 10;

      // Medical Scan Image Section
      yPosition = checkPageBreak(yPosition, 80); // Reserve space for image
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Medical Scan', margin, yPosition);
      yPosition += 10;

      // Try to load and add the scan image
      try {
        const imageData = await loadImageAsBase64(item.report.scan.image_url);
        if (imageData) {
          // Calculate image dimensions to fit nicely in the PDF
          const imgWidth = pageWidth - 2 * margin; // Full width minus margins
          const imgHeight = 60; // Fixed height for consistency

          pdf.addImage(imageData, 'JPEG', margin, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;

          pdf.setFontSize(8);
          pdf.setFont('helvetica', 'italic');
          pdf.text('Medical scan image from analysis', margin, yPosition);
          yPosition += 8;
        } else {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          pdf.text('Scan image could not be loaded for this report.', margin, yPosition);
          yPosition += 6;
        }
      } catch (imageError) {
        console.warn('Error adding image to PDF:', imageError);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text('Scan image could not be loaded for this report.', margin, yPosition);
        yPosition += 6;
      }

      yPosition += 10;

      // Analysis Results Section
      yPosition = checkPageBreak(yPosition, 40);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Analysis Results', margin, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Prediction: ${item.report.prediction.tumor_type}`, margin, yPosition);
      yPosition += 6;
      pdf.text(`Confidence Score: ${item.report.prediction.confidence_score}`, margin, yPosition);
      yPosition += 8;

      // Description with word wrapping
      yPosition = addWrappedText(`Description: ${item.report.prediction.description}`, margin, yPosition, pageWidth - 2 * margin);
      yPosition += 15;

      // Footer
      yPosition = checkPageBreak(yPosition, 20);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      const footerText = 'This report was generated by BTDS Medical AI System. Please consult with a qualified healthcare professional for medical advice.';
      yPosition = addWrappedText(footerText, margin, yPosition, pageWidth - 2 * margin, 8);

      // Download the PDF
      const fileName = `Medical_Report_${item.report.id.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: 'Download Successful',
        description: 'Medical report with scan image has been downloaded as PDF',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to generate PDF report. Please try again.',
        duration: 4000,
      });
    }
  };

  // Robust recursive finder for nested report objects (some history items vary in shape)
  const findReportObjectRecursive = (obj: any): any | null => {
    if (!obj || typeof obj !== 'object') return null
    if (obj.report && typeof obj.report === 'object') return obj.report
    for (const k of Object.keys(obj)) {
      try {
        const v = (obj as any)[k]
        if (v && typeof v === 'object') {
          const found = findReportObjectRecursive(v)
          if (found) return found
        }
      } catch (e) { }
    }
    return null
  }

  useEffect(() => {
    if (isAuthenticated && user && user.role === 'user') {
      fetchHistories();
    }
  }, [isAuthenticated, user, page]);

  const fetchHistories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await httpClient.get<HistoryResponse>(`/histories/?user_id=${user?.id}&page=${page}&limit=10`);
      const data = response.data;
      if (data.success) {
        setHistories(data.data.items);
        setPagination(data.data.pagination);
      } else {
        setError('Failed to fetch histories');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
            <p className="text-gray-600">Please login to view your history</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== 'user') {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-gray-600">This page is only available for users</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-linear-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-3">
            Your Medical History
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Explore your past predictions and medical reports with detailed insights
          </p>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-200 bg-linear-to-r from-red-50 to-pink-50 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">Oops! Something went wrong</h3>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
                <Button
                  onClick={fetchHistories}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-50 transition-colors duration-200"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="overflow-hidden shadow-lg animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    <Skeleton className="w-24 h-24 rounded-xl" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex gap-4">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-40" />
                      </div>
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && histories.length === 0 && (
          <Card className="text-center py-16 shadow-lg border-dashed border-2 border-gray-200 hover:border-gray-300 transition-colors duration-300">
            <CardContent className="pt-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No History Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Your medical history will appear here once you start getting predictions and viewing reports.
              </p>
            </CardContent>
          </Card>
        )}

        {/* History Cards */}
        <div className="space-y-6">
          {histories.map((item) => {
            const isExpanded = expandedCards.has(item.id);
            const isAnimating = animatingCards.has(item.id);

            // normalize report id for this item (some shapes embed report differently)
            const _reportObj = findReportObjectRecursive(item) ?? (item.report as any);
            const reportId = _reportObj?.id ?? item.report?.id;

            return (
              <Card
                key={item.id}
                className="overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm hover:bg-white group"
              >
                <CardContent className="p-0">
                  <div className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Image Section */}
                      <div className="shrink-0">
                        <div className="relative group/image">
                          <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white/50 group-hover:shadow-xl transition-all duration-300 cursor-zoom-in">
                            <Avatar className="w-full h-full rounded-none">
                              <AvatarImage
                                src={item.report.scan.image_url}
                                alt="Medical Scan"
                                className="object-cover hover:scale-105 transition-transform duration-300 cursor-zoom-in"
                                onClick={() => openPreview(item.report.scan.image_url)}
                              />
                              <AvatarFallback className="rounded-none bg-linear-to-br from-gray-100 to-gray-200 cursor-zoom-in" onClick={() => openPreview(null)}>
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <Badge
                            variant={item.report.prediction.tumor_type === 'none' ? 'secondary' : 'destructive'}
                            className="absolute -top-3 -right-3 shadow-lg animate-pulse"
                          >
                            {item.report.prediction.tumor_type}
                          </Badge>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                              Prediction Result
                            </h3>
                            <p className="text-gray-600 leading-relaxed whitespace-normal max-w-full break-all">
                              {item.report.prediction.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 ml-4 shrink-0 min-w-[140px]">
                            {(() => {
                                // Use normalized report object computed earlier (if available) to avoid mismatches
                                const reportObjLocal = (typeof _reportObj !== 'undefined' && _reportObj) ? _reportObj : (findReportObjectRecursive(item) ?? (item.report as any));
                                if (!reportObjLocal) {
                                  console.debug('No report object found for history item', item.id);
                                  return <span className="inline-flex items-center px-3 py-1 rounded-full bg-yellow-50 text-yellow-700 text-sm font-medium">Unknown</span>;
                                }
                                const isVerified = !!(reportObjLocal && reportObjLocal.is_verified);
                                return isVerified ? (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">Verified</span>
                                ) : (
                                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-medium">Unverified</span>
                                )
                              })()}

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCardExpansion(item.id, reportId)}
                              className="hover:bg-blue-50 transition-colors duration-200"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl hover:bg-blue-50 transition-colors duration-200">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Eye className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Confidence</p>
                              <p className="font-semibold text-gray-900">{item.report.prediction.confidence_score}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-green-50/50 rounded-xl hover:bg-green-50 transition-colors duration-200">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Calendar className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">Viewed</p>
                              <p className="font-semibold text-gray-900 text-sm">
                                {new Date(item.viewed_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadReport(item)}
                            className="hover:bg-green-50 hover:border-green-300 transition-all duration-200"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download Report
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Section */}
                    <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1200px] opacity-100 overflow-auto' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                      <div className="border-t border-gray-100 bg-gray-50/50 p-6 mt-6 rounded-b-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              Report Details
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="font-medium">Report ID:</span> {item.report.id.slice(0, 12)}...</p>
                              <p><span className="font-medium">Generated:</span> {new Date(item.report.generated_at).toLocaleString()}</p>
                              <p><span className="font-medium">Scan ID:</span> {item.report.scan.id.slice(0, 8)}...</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <User className="h-4 w-4" />
                              Patient Info
                            </h4>
                            <div className="space-y-2 text-sm">
                              <p><span className="font-medium">Name:</span> {item.user.name}</p>
                              <p><span className="font-medium">Email:</span> {item.user.email}</p>
                              {item.user.age && <p><span className="font-medium">Age:</span> {item.user.age}</p>}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Feedback Section */}
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Expert Feedback
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => fetchFeedback(reportId)}
                            className="ml-3 text-xs"
                          >
                            <RefreshCw className="h-3 w-3 mr-2" />
                            Refresh
                          </Button>
                        </h4>

                        {(() => { console.debug('rendering feedback for', reportId, feedbacks[reportId]); return null; })()}

                        {loadingFeedbacks.has(reportId) ? (
                          <div className="space-y-3">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                        ) : feedbacks[reportId]?.length > 0 ? (
                          <div className="space-y-4">
                            {feedbacks[reportId].map((feedback) => (
                              <div key={feedback.id} className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
                                <div className="flex items-start gap-3">
                                  <div className="shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                      {feedback.expert.name.charAt(0)}
                                    </div>
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <div>
                                        <h5 className="font-medium text-gray-900">{feedback.expert.name}</h5>
                                        <p className="text-xs text-gray-500">{feedback.expert.email}</p>
                                      </div>
                                      <div className="text-xs text-gray-500 flex items-center gap-2">
                                        {feedback.verified_at ? (
                                          <>
                                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                                            <span>{new Date(feedback.verified_at).toLocaleString()}</span>
                                          </>
                                        ) : (
                                          <span className="text-yellow-600">Unverified</span>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                      {feedback.feedback_text}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-500 text-sm">No expert feedback available for this report yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-12">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center gap-4">
                  <Pagination>
                    <PaginationContent className="gap-2">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage(Math.max(1, page - 1))}
                          className={`transition-all duration-200 ${page === 1
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:shadow-md'
                            }`}
                        />
                      </PaginationItem>

                      {/* Page Numbers */}
                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                        .filter(p => {
                          // Show first, last, current, and adjacent pages
                          return p === 1 || p === pagination.totalPages ||
                            (p >= page - 1 && p <= page + 1);
                        })
                        .map((p, index, arr) => {
                          // Add ellipsis if there's a gap
                          const prev = arr[index - 1];
                          if (prev && p - prev > 1) {
                            return (
                              <React.Fragment key={`ellipsis-${p}`}>
                                <PaginationItem>
                                  <PaginationEllipsis className="text-gray-400" />
                                </PaginationItem>
                                <PaginationItem>
                                  <PaginationLink
                                    onClick={() => setPage(p)}
                                    isActive={p === page}
                                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${p === page
                                      ? 'bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                                      : 'hover:bg-blue-50 hover:text-blue-600'
                                      }`}
                                  >
                                    {p}
                                  </PaginationLink>
                                </PaginationItem>
                              </React.Fragment>
                            );
                          }
                          return (
                            <PaginationItem key={p}>
                              <PaginationLink
                                onClick={() => setPage(p)}
                                isActive={p === page}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${p === page
                                  ? 'bg-linear-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                                  : 'hover:bg-blue-50 hover:text-blue-600'
                                  }`}
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
                          className={`transition-all duration-200 ${page === pagination.totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:shadow-md'
                            }`}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>

                  {/* Page Info */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-full">
                      Showing <span className="font-semibold text-gray-900">{((page - 1) * 10) + 1}</span> to{' '}
                      <span className="font-semibold text-gray-900">{Math.min(page * 10, pagination.total)}</span> of{' '}
                      <span className="font-semibold text-gray-900">{pagination.total}</span> results
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Image preview modal */}
        {previewOpen && previewSrc && (
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={closePreview}
          >
            <div
              className="relative max-w-5xl w-full max-h-[90vh] rounded-md overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                aria-label="Close preview"
                onClick={closePreview}
                className="absolute right-2 top-2 z-50 p-2 bg-black/50 rounded-full hover:bg-black/40 transition"
              >
                <XIcon className="text-white" />
              </button>
              <img src={previewSrc} alt="Preview" className="w-full h-auto max-h-[90vh] object-contain bg-black" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}