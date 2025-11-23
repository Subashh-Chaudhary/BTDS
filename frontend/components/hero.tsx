"use client";

import { motion } from "framer-motion";
import { ArrowRight, Brain, Zap, Shield, Activity } from "lucide-react";
import Image from "next/image";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const fadeInScaleX = {
  hidden: { opacity: 0, scale: 0.8, x: 50 },
  visible: {
    opacity: 1,
    scale: 1,
    x: 0,
    transition: { duration: 1, ease: "easeOut" },
  },
};

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.2, delayChildren: 0.3 } },
};

const floatingCards = [
  {
    icon: Brain,
    label: "AI Powered",
    color: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: Zap,
    label: "Real-time Monitoring",
    color: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: Shield,
    label: "Secure Data",
    color: "from-green-500/20 to-emerald-500/20",
  },
];

function FloatingCard({ Icon, label, color }: any) {
  return (
    <div
      className={`p-4 rounded-xl bg-gradient-to-br ${color} border border-primary/10 backdrop-blur-sm`}
    >
      <Icon className="text-primary mb-2" size={20} />
      <p className="text-xs font-medium text-foreground">{label}</p>
    </div>
  );
}

function StatCard({ value, label }: any) {
  return (
    <div>
      <div className="text-3xl font-bold text-primary">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-accent/5 relative overflow-hidden">
      {/* Background glow circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-green-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="visible"
        className="max-w-screen-xl mx-auto w-full relative z-10 px-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left Column */}
          <div>
            <motion.div variants={fadeInUp} className="mb-6">
              <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                Advanced AI Technology
              </span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight"
            >
              Predict and Monitor Diabetes with{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Precision AI
              </span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed"
            >
              Our AI-driven system analyzes glucose levels and health data to
              detect early signs of diabetes, providing real-time insights to
              patients and healthcare professionals.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <button className="px-8 py-3 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition flex items-center justify-center gap-2 group">
                Start Monitoring
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition"
                />
              </button>
              <button className="px-8 py-3 rounded-full border border-border text-foreground font-medium hover:bg-accent transition">
                Learn More
              </button>
            </motion.div>

            <motion.div variants={fadeInUp} className="grid grid-cols-3 gap-4">
              {floatingCards.map((card, i) => (
                <FloatingCard
                  key={i}
                  Icon={card.icon}
                  label={card.label}
                  color={card.color}
                />
              ))}
            </motion.div>
          </div>

          {/* Right Column - Diabetes Visualization */}
          <motion.div
            variants={fadeInScaleX}
            className="relative flex items-center justify-center"
          >
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-100/20 to-green-100/20 rounded-3xl blur-3xl"></div>

              <div className="relative bg-gradient-to-br from-blue-50/10 to-green-50/10 rounded-3xl p-8 border border-primary/20 backdrop-blur-sm">
                <Image
                  src="/diabetes-monitoring-dashboard.jpg"
                  alt="Diabetes Monitoring Dashboard"
                  width={400}
                  height={400}
                  className="w-full h-auto rounded-2xl"
                  priority
                />

                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-4 right-4 flex items-center gap-2 bg-primary/80 px-3 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Monitoring
                </motion.div>
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-lg border border-border"
              >
                <div className="flex items-center gap-2">
                  <Activity className="text-primary" size={20} />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Detection Accuracy
                    </p>
                    <p className="text-lg font-bold text-foreground">97.2%</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          variants={fadeInUp}
          className="grid grid-cols-3 gap-4 pt-16 border-t border-border"
        >
          <StatCard value="97.2%" label="Accuracy Rate" />
          <StatCard value="15K+" label="Patients Monitored" />
          <StatCard value="80+" label="Clinics Using System" />
        </motion.div>
      </motion.div>
    </section>
  );
}
