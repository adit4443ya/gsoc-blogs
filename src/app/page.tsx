import HomeClient from "@/components/HomeClient";
import Footer from "@/components/Footer";

export default async function Home() {
  const posts = [
    {
      slug: "week-12",
      title: "Week 12 - Making CI work with target_offload backend",
      date: "2025-08-09",
      excerpt: "Improvements and bug fixes for OpenMP support in LFortran.",
    },
    {
      slug: "week-11",
      title: "Week 11 - CPU Emulation of CUDA* specific functionCalls",
      date: "2025-08-02",
      excerpt: "Extended C-backend for dumping CUDA equivalent code of Openmp Target Constructs.",
    },
    {
      slug: "week-10",
      title: "Week 10 - Approach for OpenMP Offloading",
      date: "2025-07-26",
      excerpt: "Extended C-backend for dumping OpenMp Target Offloading constructs.",
    },
    {
      slug: "week-9",
      title: " Week 9 - OpenMP Target Offloading",
      date: "2025-07-19",
      excerpt: "Exploration of OpenMP target offloading for GPU execution.",
    },
    {
      slug: "week-8",
      title: " Week 8 - Schedule and num_threads clause, ATOMIC construct",
      date: "2025-07-12",
      excerpt: "Implementation of different Scheduling modes.",
    },
    {
      slug: "week-7",
      title: " Week 7 - Teams, Distribute and Taskloop",
      date: "2025-07-05",
      excerpt: "Foundational Implementation for hierarchical parallelism via TEAMS construct.",
    },
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
      excerpt: "Implementation of BARRIER, CRITICAL constructs along with Variable access fix.",
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
      excerpt: "Represent SECTIONS construct with new design.",
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
