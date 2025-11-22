"use client"

import { useEffect } from "react"
import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import Features from "@/components/features"
import HowItWorks from "@/components/how-it-works"
import UploadSection from "@/components/upload-section"
import AdminDashboard from "@/components/admin-users"
import { useAuthStore } from '@/lib/store/auth.store'
import Footer from "@/components/footer"

export default function Home() {
  useEffect(() => {
    // Initialize Locomotive Scroll
    const loadLocomotiveScroll = async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default
      new LocomotiveScroll()
    }
    loadLocomotiveScroll()
  }, [])

  const user = useAuthStore((s) => s.user)
  const isAdmin = !!user?.is_admin

  // If user is admin, show dashboard instead of landing page
  if (isAdmin) {
    return (
      <main>
        <AdminDashboard />
      </main>
    )
  }

  return (
    <main data-scroll-container>
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      {user?.role !== 'expert' && <UploadSection />}
      <Footer />
    </main>
  )
}
