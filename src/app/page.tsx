import HomeClient from "@/components/HomeClient";
import Footer from "@/components/Footer";

export default async function Home() {
  const posts = [
    {
      slug: "week-6",
      title: " Week 6 - Enhance Task construct with handling Shared vars",
      date: "2025-06-28",
      excerpt: "Improved TASK construct with shared variables and added TASKWAIT.",
    },
    {
      slug: "week-5",
      title: "Week 5 - Task construct and Shared/Private Clauses in Parallel Region",
      date: "2025-06-21",
      excerpt: "Implementation of Barrier, Critical constructs along with Variable access fix.",
    },
    {
      slug: "week-4",
      title: "Week 4 - Section/s, Single and Master Constructs in OpenMP",
      date: "2025-06-14",
      excerpt: "Implemention via GOMP calls.",
    },
    {
      slug: "week-3",
      title: "Week 3 - Extension of OPENMP pass to support OMPRegion ASR node for PARALLEL and DO construct",
      date: "2025-06-06",
      excerpt: "Decoupling of DonconcurrentLoop from Openmp Pragmas, processing with newer design.",
    },
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
