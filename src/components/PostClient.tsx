"use client";

import { motion } from "framer-motion";
import { MDXRemoteSerializeResult } from "next-mdx-remote";
import { HTMLMotionProps } from "framer-motion";
import dynamic from "next/dist/shared/lib/dynamic";

// Define typed motion components
const MotionDiv = motion.div as React.ComponentType<HTMLMotionProps<"div"> & React.HTMLAttributes<HTMLDivElement>>;
const MotionH1 = motion.h1 as React.ComponentType<HTMLMotionProps<"h1"> & React.HTMLAttributes<HTMLHeadingElement>>;
const MotionP = motion.p as React.ComponentType<HTMLMotionProps<"p"> & React.HTMLAttributes<HTMLParagraphElement>>;
const MotionArticle = motion.article as React.ComponentType<HTMLMotionProps<"article"> & React.HTMLAttributes<HTMLElement>>;

type Props = {
  title: string;
  date: string;
  mdxSource: MDXRemoteSerializeResult;
};

const PostContentClient = dynamic(() => import("./PostContentClient"), {
  ssr: false,
});

export default function PostClient({ title, date, mdxSource }: Props) {
  return (
    <MotionDiv
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-background-light dark:bg-background-dark py-20"
    >
      <div className="max-w-5xl mx-auto px-4">
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
          className="text-lg text-secondary dark:text-gray-400 mb-8"
        >
          {date}
        </MotionP>
        <MotionArticle
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg"
        >
          <PostContentClient mdxSource={mdxSource} />
        </MotionArticle>
      </div>
    </MotionDiv>
  );
}
