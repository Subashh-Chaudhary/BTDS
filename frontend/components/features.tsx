"use client";

import { motion } from "framer-motion";
import { Brain, Zap, Shield, Clock } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Clinical Risk Model",
    description:
      "Predict diabetes risk from routine clinical measurements using validated algorithms.",
  },
  {
    icon: Zap,
    title: "Fast Screening",
    description:
      "Screen large patient cohorts quickly to prioritize follow-up and preventive care.",
  },
  {
    icon: Shield,
    title: "Privacy Focused",
    description:
      "Built with data privacy in mind and designed to integrate with secure clinical workflows.",
  },
  {
    icon: Clock,
    title: "Continuous Improvement",
    description:
      "Models update as new data arrives to keep predictions accurate and clinically relevant.",
  },
];

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
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Features for Diabetes Care
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Designed for clinicians and care teams to quickly assess diabetes
            risk and take timely action.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-2xl bg-accent/5 border border-border hover:border-primary/50 transition group"
              >
                <div className="w-12 h-12 rounded-lg bg-rose-50 flex items-center justify-center mb-4">
                  <Icon className="text-rose-500" size={24} />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
