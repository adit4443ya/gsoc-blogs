"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { motion } from "framer-motion";
import { HTMLMotionProps } from "framer-motion";

type Props = {
  mdxSource: MDXRemoteSerializeResult;
};

const MotionArticle = motion.article as React.ComponentType<HTMLMotionProps<"article"> & React.HTMLAttributes<HTMLElement>>;

export default function PostContentClient({ mdxSource }: Props) {
  return (
    <MotionArticle
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="prose prose-lg dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg"
    >
      <MDXRemote {...mdxSource} />
    </MotionArticle>
  );
}
