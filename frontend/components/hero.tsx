"use client"

import { motion } from "framer-motion"
import { ArrowRight, Brain, Zap, Shield, Activity } from "lucide-react"
import Image from "next/image"

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8, x: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { duration: 1, ease: "easeOut" },
    },
  }

  const floatingCards = [
    { icon: Brain, label: "AI Powered", color: "from-blue-500/20 to-cyan-500/20" },
    { icon: Zap, label: "Real-time", color: "from-purple-500/20 to-pink-500/20" },
    { icon: Shield, label: "Secure", color: "from-green-500/20 to-emerald-500/20" },
  ]

  return (
    <section className="min-h-screen flex items-center justify-center pt-20 px-4 bg-gradient-to-b from-background via-background to-accent/5 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto w-full relative z-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
          {/* Left Column - Text Content */}
          <div>
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Advanced AI Technology
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Detect Brain Tumors with{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Precision AI
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
              Our advanced machine learning model analyzes medical imaging with exceptional accuracy, helping healthcare
              professionals make informed decisions faster.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-12">
              <button className="px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2 group">
                Start Detection
                <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
              </button>
              <button className="px-8 py-3 rounded-full border border-border text-foreground font-medium hover:bg-accent transition">
                Learn More
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
              {floatingCards.map((card, index) => {
                const Icon = card.icon
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-xl bg-gradient-to-br ${card.color} border border-primary/10 backdrop-blur-sm`}
                  >
                    <Icon className="text-primary mb-2" size={20} />
                    <p className="text-xs font-medium text-foreground">{card.label}</p>
                  </div>
                )
              })}
            </motion.div>
          </div>

          {/* Right Column - Brain Scan Visualization */}
          <motion.div variants={imageVariants} className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Glow background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-3xl"></div>

              {/* Brain scan image container */}
              <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl p-8 border border-primary/20 backdrop-blur-sm">
                <Image
                  src="/brain-scan-mri-medical-imaging-tumor-detection.jpg"
                  alt="Brain MRI Scan"
                  width={400}
                  height={400}
                  className="w-full h-auto rounded-2xl"
                  priority
                />

                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="absolute top-4 right-4 flex items-center gap-2 bg-primary/80 px-3 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Scanning
                </motion.div>

                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/40 rounded-tl-2xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent/40 rounded-br-2xl"></div>
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-lg border border-border"
              >
                <div className="flex items-center gap-2">
                  <Activity className="text-primary" size={20} />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Detection Rate</p>
                    <p className="text-lg font-bold text-foreground">98.5%</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 pt-16 border-t border-border">
          <div>
            <div className="text-3xl font-bold text-primary">98.5%</div>
            <div className="text-sm text-muted-foreground">Accuracy Rate</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">10K+</div>
            <div className="text-sm text-muted-foreground">Scans Analyzed</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">50+</div>
            <div className="text-sm text-muted-foreground">Hospitals</div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}
