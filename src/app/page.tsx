import HomeClient from "@/components/HomeClient";
import Footer from "@/components/Footer";

export default async function Home() {
  const posts = [
    {
      slug: "week-2",
      title: "Week 2 - Implementing the OMPRegion ASR node with a stack-based approach",
      date: "2025-05-31",
      excerpt: "Represent Sections construct with new design.",
    },
    {
      slug: "week-1",
      title: "Week 1 - Analysis and Design for OpenMP Support",
      date: "2025-05-24",
      excerpt: "Discussions and Proposal for new design :- The OMPRegion ASR Node.",
    },
  ];

  return (
    <div>
      <HomeClient posts={posts} />
      <Footer />
    </div>
  );
}
