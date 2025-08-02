"use client";

import { motion } from "framer-motion";
import { HTMLMotionProps } from "framer-motion";
import Week1Post from "./Week1Post";
import Week2Post from "./Week2Post";
import Week3Post from "./Week3Post";
import Week4Post from "./Week4Post";
import Week6Post from "./Week6Post";
import Link from "next/link";
import Week5Post from "./Week5Post";
import Week7Post from "./Week7Post";
import Week8Post from "./Week8Post";
import Week9Post from "./Week9Post";
import Week10Post from "./Week10Post";
import Week11Post from "./Week11Post";

const MotionDiv = motion.div as React.ComponentType<HTMLMotionProps<"div"> & React.HTMLAttributes<HTMLDivElement>>;
const MotionH1 = motion.h1 as React.ComponentType<HTMLMotionProps<"h1"> & React.HTMLAttributes<HTMLHeadingElement>>;
const MotionP = motion.p as React.ComponentType<HTMLMotionProps<"p"> & React.HTMLAttributes<HTMLParagraphElement>>;
const MotionArticle = motion.article as React.ComponentType<HTMLMotionProps<"article"> & React.HTMLAttributes<HTMLElement>>;

type Props = {
  title: string;
  date: string;
  slug: string;
};

export default function PostClient({ title, date, slug }: Props) {
  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-20 relative"
    >
      <div className="max-w-5xl mx-auto px-4">
        {/* Home Button in Top-Right Corner */}
        <Link href="/" className="absolute top-6 right-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:from-indigo-600 hover:to-purple-600 transition duration-300 z-10">
          Home
        </Link>

        <MotionH1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-gray-100"
        >
          {title}
        </MotionH1>
        <MotionP
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-lg text-gray-600 dark:text-gray-400 mb-8"
        >
          {date}
        </MotionP>
        <MotionArticle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl"
        >
          {slug === "week-1" ? (
            <Week1Post />
          ) : slug === "week-2" ? (
            <Week2Post />
          ) : slug === "week-3" ? (
            <Week3Post />
          ) : slug === "week-4" ? (
            <Week4Post />
          ) : slug === "week-5" ? (
            <Week5Post />
          ) : slug === "week-6" ? (
            <Week6Post />
          ) : slug === "week-7" ? (
            <Week7Post />
          ) : slug === "week-7" ? (
            <Week7Post />
          ) : slug === "week-8" ? (
            <Week8Post />
          ) : slug === "week-8" ? (
            <Week8Post />
          ) : slug === "week-9" ? (
            <Week9Post />
          ) : slug === "week-10" ? (
            <Week10Post />
          ) : slug === "week-11" ? (
            <Week11Post />
          ) : (
            <p>Post content not available.</p>
          )}
        </MotionArticle>
      </div>
    </MotionDiv>
  );
}