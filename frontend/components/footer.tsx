"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { FaLinkedin, FaGithub, FaTwitter } from "react-icons/fa"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <footer className="bg-gradient-to-b from-accent/10 to-background border-t border-border py-14 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Top Section */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-4 gap-10 mb-12"
        >
          {/* Brand */}
          <motion.div variants={item}>
            <div className="flex items-center gap-3 mb-4">
              <motion.div
                className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md"
                whileHover={{ rotate: 8, scale: 1.05 }}
              >
                <span className="text-white font-bold text-base">BT</span>
              </motion.div>
              <span className="text-lg font-bold text-foreground tracking-wide">
                BrainDetect
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Advanced AI-powered brain tumor detection for healthcare innovation.
            </p>
          </motion.div>

          {/* Product */}
          <motion.div variants={item}>
            <h4 className="font-bold text-foreground mb-4 text-base">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/product/mri-analysis" className="hover:text-foreground transition">MRI Analysis</Link></li>
              <li><Link href="/product/model-accuracy" className="hover:text-foreground transition">Model Accuracy</Link></li>
              <li><Link href="/product/guidelines" className="hover:text-foreground transition">Guidelines</Link></li>
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div variants={item}>
            <h4 className="font-bold text-foreground mb-4 text-base">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/company/our-work" className="hover:text-foreground transition">Our Work</Link></li>
              <li><Link href="/company/publications" className="hover:text-foreground transition">Publications</Link></li>
              <li><Link href="/company/team" className="hover:text-foreground transition">Team</Link></li>
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div variants={item}>
            <h4 className="font-bold text-foreground mb-4 text-base">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/legal/help-center" className="hover:text-foreground transition">Help Center</Link></li>
              
            </ul>
          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} BrainDetect. All rights reserved.</p>

          <div className="flex gap-6 mt-5 md:mt-0">
            <motion.a
              href="https://linkedin.com"
              target="_blank"
              whileHover={{ scale: 1.2 }}
              className="text-xl hover:text-primary transition"
            >
              <FaLinkedin />
            </motion.a>

            <motion.a
              href="https://github.com"
              target="_blank"
              whileHover={{ scale: 1.2 }}
              className="text-xl hover:text-primary transition"
            >
              <FaGithub />
            </motion.a>

            <motion.a
              href="https://twitter.com"
              target="_blank"
              whileHover={{ scale: 1.2 }}
              className="text-xl hover:text-primary transition"
            >
              <FaTwitter />
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  )
}
