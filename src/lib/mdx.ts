import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { serialize } from "next-mdx-remote/serialize";

const postsDirectory = path.join(process.cwd(), "posts");

// Define the shape of frontmatter
interface Frontmatter {
  title: string;
  date: string;
  excerpt?: string;
}

export function getAllPosts() {
  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.mdx$/, "");
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);
    return {
      slug,
      frontmatter: {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString().split("T")[0] : data.date,
      } as Frontmatter,
    };
  });
  return posts.sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
}

export async function getPostBySlug(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const mdxSource = await serialize(content);
  return {
    frontmatter: {
      ...data,
      date: data.date instanceof Date ? data.date.toISOString().split("T")[0] : data.date,
    } as Frontmatter,
    mdxSource,
  };
}
