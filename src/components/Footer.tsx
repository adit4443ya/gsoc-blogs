"use client";

import { motion } from "framer-motion";
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope } from "react-icons/fa";
import { HTMLMotionProps } from "framer-motion";

// Explicitly type MotionFooter to include HTML footer attributes
const MotionFooter = motion.footer as React.ComponentType<HTMLMotionProps<"footer"> & { className?: string }>;

// Explicitly type MotionAnchor to include HTML anchor attributes
const MotionAnchor = motion.a as React.ComponentType<HTMLMotionProps<"a"> & React.AnchorHTMLAttributes<HTMLAnchorElement>>;

export default function Footer() {
  return (
    <MotionFooter
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-gray-800 to-gray-900 dark:from-gray-900 dark:to-black text-gray-200 py-12"
    >
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center gap-8">
        <h3 className="text-xl font-semibold">Connect with Me</h3>
        <div className="flex gap-8">
          <MotionAnchor
            href="mailto:john.doe@example.com"
            whileHover={{ scale: 1.2, color: "#1e40af" }}
            className="text-gray-200 transition-colors"
            aria-label="Email"
          >
            <FaEnvelope size={28} />
          </MotionAnchor>
          <MotionAnchor
            href="https://github.com/johndoe"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, color: "#1e40af" }}
            className="text-gray-200 transition-colors"
            aria-label="GitHub"
          >
            <FaGithub size={28} />
          </MotionAnchor>
          <MotionAnchor
            href="https://linkedin.com/in/johndoe"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, color: "#1e40af" }}
            className="text-gray-200 transition-colors"
            aria-label="LinkedIn"
          >
            <FaLinkedin size={28} />
          </MotionAnchor>
          <MotionAnchor
            href="https://twitter.com/johndoe"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, color: "#1e40af" }}
            className="text-gray-200 transition-colors"
            aria-label="Twitter"
          >
            <FaTwitter size={28} />
          </MotionAnchor>
        </div>
        <p className="text-sm text-gray-400">
          © {new Date().getFullYear()} John Doe. All rights reserved.
        </p>
      </div>
    </MotionFooter>
  );
}
