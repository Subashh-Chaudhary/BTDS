import { httpClient } from '@/lib/http-client'

export async function updateReport(reportId: string, payload: any) {
  const res = await httpClient.put(`/reports/${reportId}`, payload)
  return res.data
}

export default {
  updateReport,
}
