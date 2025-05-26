"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
    className="relative text-center py-48 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden"
    style={{
      backgroundImage: "url(https://picsum.photos/1920/600?text=GSOC+Journey)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundBlendMode: "overlay",
    }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-purple-900/80"></div>
    <div className="relative z-10">
      <MotionH1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.8 }}
        className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-purple-200 tracking-tight drop-shadow-lg"
      >
        My GSoC Journey 🚀
      </MotionH1>
      <MotionP
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="text-xl md:text-2xl max-w-3xl mx-auto font-light leading-relaxed drop-shadow-md mt-4"
      >
        A sleek showcase of my Google Summer of Code adventures, challenges, and wins. Let’s dive in! ✨
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
    whileHover={{ y: -10, boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)" }}
    className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-800/20 dark:to-purple-800/20 hover:bg-gradient-to-r hover:from-indigo-500/20 hover:to-purple-500/20 transition-all duration-300"
  >
    <Link href={`/posts/${post.slug}`}>
      <div className="p-8 relative z-10">
        <h3 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100">{post.title}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 font-medium">{post.date}</p>
        <p className="text-gray-700 dark:text-gray-300">{post.excerpt}</p>
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
    <MotionDiv className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 bg-white dark:bg-gray-800 shadow-2xl z-10 border-b border-indigo-200 dark:border-indigo-900">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400 tracking-tight">
            GSoC Portfolio
          </Link>
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg text-gray-700 dark:text-gray-200 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors duration-200"
            >
              <FaHome />
              <span>Home</span>
            </Link>
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 text-indigo-600 dark:text-indigo-300 hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-800 dark:hover:to-purple-800 transition-all duration-200"
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
      <section className="max-w-4xl mx-auto px-4 py-24">
        <MotionH2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-gray-100 tracking-tight border-b-4 border-indigo-500 inline-block pb-2"
        >
          Weekly Progress 📝
        </MotionH2>
        <div className="space-y-12">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </MotionDiv>
  );
}
