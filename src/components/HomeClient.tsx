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
const MotionH3 = motion.h3 as React.ComponentType<HTMLMotionProps<"h3"> & React.HTMLAttributes<HTMLHeadingElement>>;
const MotionP = motion.p as React.ComponentType<HTMLMotionProps<"p"> & React.HTMLAttributes<HTMLParagraphElement>>;
const MotionDiv = motion.div as React.ComponentType<HTMLMotionProps<"div"> & React.HTMLAttributes<HTMLDivElement>>;

// Hero Section Component
const Hero = () => {
  const { theme } = useTheme();

  // Dynamic class names and styles based on theme
  const overlayClass = theme === "dark"
    ? "bg-gradient-to-r from-indigo-900/80 to-purple-900/80"
    : "bg-gradient-to-r from-indigo-100/60 to-purple-100/60";

  const titleGradient = theme === "dark"
    ? "from-indigo-200 via-purple-450 to-blue-500"
    : "from-indigo-700 via-purple-900 to-black-100";

  const titleShadow = theme === "dark"
    ? "0 4px 32px rgba(99, 102, 241, 0.4), 0 2px 8px rgba(139, 92, 246, 0.25)"
    : "0 3px 12px rgba(55, 65, 81, 0.4), 0 1px 6px rgba(99, 102, 241, 0.15)";

  const badgeBg = theme === "dark"
    ? "from-indigo-600/80 via-purple-600/80 to-blue-600/80"
    : "from-indigo-500/90 via-purple-500/90 to-blue-500/90";

  const subtitleBg = theme === "dark"
    ? "bg-white/10 dark:bg-gray-900/20"
    : "bg-white/20";

  const subtitleBorder = theme === "dark"
    ? "border-indigo-200/30 dark:border-indigo-900/40"
    : "border-indigo-300/50";

  const subtitleTextHighlight = theme === "dark"
    ? "text-indigo-300 dark:text-indigo-200"
    : "text-indigo-600";

  const subtitleTextHighlight2 = theme === "dark"
    ? "text-purple-300 dark:text-purple-200"
    : "text-purple-600";

  const byTextBg = theme === "dark"
    ? "from-indigo-700/60 via-purple-700/60 to-blue-700/60"
    : "from-indigo-300/60 via-purple-300/60 to-blue-300/60";

  const byTextColor = theme === "dark" ? "text-indigo-100 dark:text-indigo-200" : "text-indigo-900";

  return (
    <MotionSection
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`relative text-center py-48 text-white overflow-hidden`}
      style={{
        backgroundImage:
          "url(https://cdn.pixabay.com/photo/2012/10/29/15/36/ball-63527_1280.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
      }}
    >
      {/* Overlay */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${overlayClass}`}
      ></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-6 px-4 md:px-0 max-w-5xl mx-auto">
        {/* Title */}
        <MotionH1
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className={`text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${titleGradient} tracking-tight drop-shadow-2xl shadow-indigo-500/40`}
          style={{
            textShadow: titleShadow,
          }}
        >
          GSOC&apos;25&nbsp;
          <span
            className={`inline-block px-4 py-1 rounded-xl bg-gradient-to-r ${badgeBg} text-white shadow-lg ml-2 align-middle`}
            style={{
              fontSize: "2.8rem", // matches md:text-7xl (44px)
              lineHeight: "1.5",
              verticalAlign: "middle",
            }}
          >
            @FORTRAN-LANG
          </span>
        </MotionH1>

        {/* Subtitle */}
        <MotionH2
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className={`text-xl md:text-3xl max-w-2xl mx-auto font-light leading-relaxed drop-shadow-lg mt-2 ${subtitleBg} rounded-xl px-6 py-3 backdrop-blur-md border ${subtitleBorder}`}
        >
          <span className={`font-semibold ${subtitleTextHighlight}`}>
            Enhancing OpenMP Support
          </span>{" "}
          in{" "}
          <span className={`font-semibold ${subtitleTextHighlight2}`}>
            LFortran
          </span>
        </MotionH2>

        {/* Byline */}
        <MotionH3
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className={`text-lg md:text-xl max-w-xl mx-auto mt-2 font-medium tracking-wide bg-gradient-to-r ${byTextBg} px-4 py-2 rounded-lg shadow-md ${byTextColor}`}
        >
          BY ADITYA TRIVEDI
        </MotionH3>
      </div>
    </MotionSection>
  );
};

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
      <nav className=" sticky bg-transparent top-0 bg-white dark:bg-gray-800 shadow-2xl z-10 border-b border-indigo-200 dark:border-indigo-900 ">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400 tracking-tight">
            GSoC BLOGS
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
          Weekly Progress
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
