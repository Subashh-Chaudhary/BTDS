"use client"

import { useEffect } from "react"
import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import Features from "@/components/features"
import HowItWorks from "@/components/how-it-works"
import UploadSection from "@/components/upload-section"
import ExpertDashboard from "@/components/expert-dashboard"
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
