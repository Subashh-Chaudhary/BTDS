import React from 'react'
import ExpertDashboard from '@/components/expert-dashboard'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

export const metadata = {
  title: 'Predictions - Expert Dashboard',
}

export default function PredictionsPage() {
  // This page is now only for experts. Admins see dashboard on home page.
  return (
    <main>
      <ExpertDashboard />
    </main>
  )
}
