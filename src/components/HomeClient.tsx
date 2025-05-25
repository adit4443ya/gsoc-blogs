"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaHome, FaSun, FaMoon } from "react-icons/fa";
import { useTheme } from "@/lib/ThemeContext";
import { motion } from "framer-motion";
import { HTMLMotionProps } from "framer-motion";

// Define typed motion components
const MotionSection = motion.section as React.ComponentType<HTMLMotionProps<"section"> & React.HTMLAttributes<HTMLElement>>;
const MotionH1 = motion.h1 as React.ComponentType<HTMLMotionProps<"h1"> & React.HTMLAttributes<HTMLHeadingElement>>;
const MotionH2 = motion.h2 as React.ComponentType<HTMLMotionProps<"h2"> & React.HTMLAttributes<HTMLHeadingElement>>;
const MotionP = motion.p as React.ComponentType<HTMLMotionProps<"p"> & React.HTMLAttributes<HTMLParagraphElement>>;
const MotionDiv = motion.div as React.ComponentType<HTMLMotionProps<"div"> & React.HTMLAttributes<HTMLDivElement>>;

// Hero Section Component
const Hero = () => (
  <MotionSection
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1, ease: "easeOut" }}
    className="relative text-center py-32 bg-gradient-to-b from-primary to-blue-700 dark:from-primary dark:to-blue-900 text-white"
    style={{
      backgroundImage: "url(https://picsum.photos/1920/600?text=GSOC+Journey)",
      backgroundSize: "cover",
      backgroundPosition: "center",
    }}
  >
    <div className="absolute inset-0 bg-black opacity-50"></div>
    <div className="relative z-10">
      <MotionH1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-5xl md:text-7xl font-bold mb-4"
      >
        My GSOC Journey
      </MotionH1>
      <MotionP
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-xl md:text-2xl max-w-3xl mx-auto"
      >
        A professional showcase of my Google Summer of Code contributions, challenges, and achievements.
      </MotionP>
    </div>
  </MotionSection>
);

// Post Card Component
const PostCard = ({ post }: { post: { slug: string; title: string; date: string; excerpt: string } }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    whileHover={{ y: -5, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)" }}
    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-l-4 border-primary"
  >
    <Link href={`/posts/${post.slug}`}>
      <div className="p-8">
        <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">{post.title}</h3>
        <p className="text-secondary dark:text-gray-400 mb-4">{post.date}</p>
        <p className="text-gray-700 dark:text-gray-300 line-clamp-3">{post.excerpt}</p>
      </div>
    </Link>
  </MotionDiv>
);

// Home Client Component
export default function HomeClient({ posts }: { posts: { slug: string; title: string; date: string; excerpt: string }[] }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <MotionDiv
      className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300"
    >
      {/* Navbar */}
      <nav className="sticky top-0 bg-white dark:bg-gray-800 shadow-lg z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-bold text-primary">
            GSOC Portfolio
          </Link>
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg text-gray-700 dark:text-gray-200 hover:text-primary transition-colors"
            >
              <FaHome />
              <span>Home</span>
            </Link>
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:text-primary transition-colors"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <FaSun size={20} /> : <FaMoon size={20} />}
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero />

      {/* Posts Section */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <MotionH2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100"
        >
          Weekly Progress
        </MotionH2>
        <div className="space-y-8">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </MotionDiv>
  );
}
