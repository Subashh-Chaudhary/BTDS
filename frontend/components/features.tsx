"use client"

import { motion } from "framer-motion"
import { Brain, Zap, Shield, Clock } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "Advanced AI Model",
    description: "State-of-the-art deep learning trained on thousands of medical images for superior accuracy.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Get results in seconds, not hours. Real-time analysis for urgent medical decisions.",
  },
  {
    icon: Shield,
    title: "HIPAA Compliant",
    description: "Enterprise-grade security ensuring patient data privacy and regulatory compliance.",
  },
  {
    icon: Clock,
    title: "Continuous Learning",
    description: "Our model improves continuously with new data while maintaining strict privacy standards.",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 px-4 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Powerful Features for Healthcare</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Designed specifically for medical professionals who need reliable, fast, and secure tumor detection.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-accent/5 border border-border hover:border-primary/50 transition group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition">
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
