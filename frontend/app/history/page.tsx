"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/auth.store";
import { httpClient } from "@/lib/http-client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Calendar,
  Eye,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X as XIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ModelResult = {
  model_name: string;
  prediction_value: number;
  probability: number | null;
};

type PredictionRecord = {
  id: string;
  user_id: string;
  pregnancies?: number;
  glucose?: number;
  blood_pressure?: number;
  skin_thickness?: number;
  insulin?: number;
  bmi?: number;
  diabetes_pedigree_function?: number;
  age?: number;
  created_at: string;
  updated_at?: string;
  results?: ModelResult[];
  ml_response?: any;
};

export default function HistoryPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [histories, setHistories] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && user) fetchHistories();
  }, [isAuthenticated, user, page]);

  const fetchHistories = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch diabetes prediction history from backend histories endpoint
      // Use the authenticated user's histories route which reads the token
      const res = await httpClient.get(`/histories/user?page=${page}&limit=10`);
      const body = res.data;
      if (body?.success) {
        // Support different shapes: { data: { items, pagination } } or data as array
        if (body.data?.items) {
          setHistories(body.data.items);
          setPagination(body.data.pagination ?? null);
        } else if (Array.isArray(body.data)) {
          setHistories(body.data);
        } else if (body.data?.predictions) {
          setHistories(body.data.predictions);
        } else {
          // Single record
          if (body.data?.prediction)
            setHistories([
              {
                ...body.data.prediction,
                results: body.data.results,
                ml_response: body.data.ml_response,
              },
            ]);
        }
      } else {
        setError(body?.message ?? "Failed to fetch history");
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred while fetching history");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else s.add(id);
      return s;
    });
  };

  const exportJSON = (item: PredictionRecord) => {
    const blob = new Blob([JSON.stringify(item, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prediction-${item.id || item.created_at}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported", description: "Prediction exported as JSON" });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600">
              Please login to view your diabetes prediction history
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Diabetes Prediction History
          </h1>
          <p className="text-gray-600">
            All past diabetes predictions, confidence scores and model
            comparisons
          </p>
        </div>

        {error && (
          <Card className="mb-6">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-red-700">{error}</p>
                <p className="text-sm text-gray-600">
                  Try refreshing the page.
                </p>
              </div>
              <Button variant="ghost" onClick={fetchHistories}>
                <RefreshCw />
              </Button>
            </CardContent>
          </Card>
        )}

        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden shadow-lg animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <Skeleton className="w-20 h-20 rounded-md" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-6 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-36" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && histories.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-gray-600">
                You don't have any diabetes predictions yet.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {histories.map((h) => {
            const isExpanded = expanded.has(h.id);
            const ensemble =
              h.ml_response?.ensemble_prediction ??
              h.ml_response?.confidence ??
              null;
            const confidence =
              h.ml_response?.confidence ??
              (h.results && h.results.length
                ? h.results.reduce(
                    (acc: number, r: ModelResult) => acc + (r.probability || 0),
                    0
                  ) / (h.results?.length || 1)
                : null);
            return (
              <Card key={h.id} className="p-0 overflow-hidden shadow-sm">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {new Date(h.created_at).toLocaleString()}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Age: {h.age ?? "—"} • BMI: {h.bmi ?? "—"} • Glucose:{" "}
                          {h.glucose ?? "—"}
                        </p>
                      </div>
                      <div className="ml-2">
                        <Badge
                          variant={
                            h.ml_response?.ensemble_prediction === 1
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {h.ml_response?.ensemble_prediction === 1
                            ? "Positive"
                            : "Negative"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-gray-500 uppercase">
                          Ensemble Confidence
                        </p>
                        <p className="font-semibold">
                          {typeof h.ml_response?.confidence === "number"
                            ? `${(h.ml_response.confidence * 100).toFixed(1)}%`
                            : "—"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggle(h.id)}
                      >
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => exportJSON(h)}
                      >
                        Export JSON
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 border-t pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2">Input Features</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                          <div>
                            <span className="font-medium">Pregnancies:</span>{" "}
                            {h.pregnancies ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium">Glucose:</span>{" "}
                            {h.glucose ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium">Blood Pressure:</span>{" "}
                            {h.blood_pressure ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium">Skin Thickness:</span>{" "}
                            {h.skin_thickness ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium">Insulin:</span>{" "}
                            {h.insulin ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium">BMI:</span>{" "}
                            {h.bmi ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium">
                              Diabetes Pedigree:
                            </span>{" "}
                            {h.diabetes_pedigree_function ?? "—"}
                          </div>
                          <div>
                            <span className="font-medium">Age:</span>{" "}
                            {h.age ?? "—"}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2">
                          Model Comparisons
                        </h4>
                        <div className="space-y-2 text-sm">
                          {h.results && h.results.length ? (
                            h.results.map((r) => (
                              <div
                                key={r.model_name}
                                className="flex items-center justify-between"
                              >
                                <div className="capitalize">
                                  {r.model_name.replace("_", " ")}
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-gray-500">
                                    Prediction:{" "}
                                    {r.prediction_value === 1
                                      ? "Positive"
                                      : "Negative"}
                                  </div>
                                  <div className="font-medium">
                                    {typeof r.probability === "number"
                                      ? `${(r.probability * 100).toFixed(1)}%`
                                      : "—"}
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-gray-600">
                              No model results available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage(Math.max(1, page - 1))}
                        />
                      </PaginationItem>
                      {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1
                      ).map((p) => (
                        <PaginationItem key={p}>
                          <PaginationLink
                            onClick={() => setPage(p)}
                            isActive={p === page}
                          >
                            {p}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            setPage(Math.min(pagination.totalPages, page + 1))
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
