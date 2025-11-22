import { httpClient } from '@/lib/http-client'

export type CreateReportFeedbackResponse = any

/**
 * Create feedback for a report
 * POST /feedbacks/report/:reportId
 */
export async function createReportFeedback(reportId: string, feedbackText: string) {
  const res = await httpClient.post(`/feedbacks/report/${reportId}`, { feedback_text: feedbackText })
  return res.data
}

export default {
  createReportFeedback,
}
