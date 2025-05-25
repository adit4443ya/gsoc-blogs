import { getAllPosts } from "@/lib/mdx";
import HomeClient from "@/components/HomeClient";
import Footer from "@/components/Footer";

export default async function Home() {
  const posts = getAllPosts().map((post) => ({
    slug: post.slug,
    title: post.frontmatter.title,
    date: String(post.frontmatter.date),
    excerpt: post.frontmatter.excerpt || "No excerpt available.",
  }));

  return (
    <div>
      <HomeClient posts={posts} />
      <Footer />
    </div>
  );
}
