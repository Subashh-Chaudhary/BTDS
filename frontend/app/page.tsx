"use client"

import { useEffect } from "react"
import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import Features from "@/components/features"
import HowItWorks from "@/components/how-it-works"
import UploadSection from "@/components/upload-section"
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

  return (
    <main data-scroll-container>
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      <UploadSection />
      <Footer />
    </main>
  )
}
