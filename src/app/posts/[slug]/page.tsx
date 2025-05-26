import Footer from "@/components/Footer";
import PostClient from "@/components/PostClient";

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Hardcoded post data for Week 1 (can be expanded for more posts)
  const posts: { [key: string]: { title: string; date: string } } = {
    "week-1": {
      title: "Week 1 - Kickoff Contributions to OpenMP Support in LFortran",
      date: "2025-05-24",
    },
  };

  const post = posts[slug] || { title: "Post Not Found", date: "N/A" };

  return (
    <div>
      <PostClient title={post.title} date={post.date} slug={slug} />
      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  return [{ slug: "week-1" }];
}
