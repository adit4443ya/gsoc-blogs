import HomeClient from "@/components/HomeClient";
import Footer from "@/components/Footer";

export default async function Home() {
  const posts = [
    {
      slug: "week-1",
      title: "Week 1 - Kickoff Contributions to OpenMP Support in LFortran",
      date: "2025-05-24",
      excerpt: "Analyze and Design for OpenMP Support.",
    },
  ];

  return (
    <div>
      <HomeClient posts={posts} />
      <Footer />
    </div>
  );
}
