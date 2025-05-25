import { getAllPosts, getPostBySlug } from "@/lib/mdx";
import PostClient from "@/components/PostClient";
import Footer from "@/components/Footer";

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  return (
    <div>
      <PostClient
        title={post.frontmatter.title}
        date={String(post.frontmatter.date)}
        mdxSource={post.mdxSource}
      />
      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}
