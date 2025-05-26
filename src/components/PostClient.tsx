"use client";

import { motion } from "framer-motion";
import { HTMLMotionProps } from "framer-motion";
import Week1Post from "./Week1Post";

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
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 py-20"
    >
      <div className="max-w-6xl mx-auto px-2 md:px-8">
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
          className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-xl w-full"
        >
          {slug === "week-1" ? <Week1Post /> : <p>Post content not available.</p>}
        </MotionArticle>
      </div>
    </MotionDiv>
  );
}
