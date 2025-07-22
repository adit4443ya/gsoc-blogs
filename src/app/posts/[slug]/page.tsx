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
    "week-2": {
      title: "Week 2 - Contribution to OpenMP Support in LFortran",
      date: "2025-05-31",
    },
    "week-3": {
      title: "Week 3 - Contribution to OpenMP Support in LFortran",
      date: "2025-06-06",
    },
    "week-4": {
      title: "Week 4 Contribution to OpenMP Support in LFortran",
      date: "2025-06-14",
    },
    "week-5": {
      title: "Week 5 Contribution to OpenMP Support in LFortran",
      date: "2025-06-21",
    },
    "week-6": {
      title: "Week 6 Contribution to OpenMP Support in LFortran",
      date: "2025-06-28", // Adjusted to current week based on today's date
    },
    "week-7": {
      title: "Week 7 Contribution to OpenMP Support in LFortran",
      date: "2025-07-05", // Adjusted to current week based on today's date
    },
    "week-8": {
      title: "Week 8 Contribution to OpenMP Support in LFortran",
      date: "2025-07-12", 
    },
    "week-9": {
      title: "Week 9 Contribution to OpenMP Support in LFortran",
      date: "2025-07-19",
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
  return [{ slug: "week-1" }, { slug: "week-2" }, { slug: "week-3" }, { slug: "week-4" }, { slug: "week-5" }, { slug: "week-6" }, { slug: "week-7" }, { slug: "week-8" }, { slug: "week-9" }];
}
