import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Week10Post() {
  const targetOffloadingMre = `program openmp_70
    implicit none
    real, allocatable, dimension(:) :: a, b
    integer :: i
    allocate(a(10000000), b(10000000))
    b=5
    !$omp target map(tofrom:a, b)
    !$omp teams
    !$omp distribute parallel do
    do i = 1, 10000000
        a(i) = real(i) + b(i)*340
    end do
    !$omp end distribute parallel do
    !$omp end teams
    !$omp end target
    print*, a(5), b(5)
    if(a(5) /= 1705) error stop
    if(b(5) /= 5) error stop
end program openmp_70`;

  const cDump = `#include <inttypes.h>

#include <stdlib.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>
#include <lfortran_intrinsics.h>

struct dimension_descriptor
{
    int32_t lower_bound, length, stride;
};

struct r32
{
    float *data;
    struct dimension_descriptor dims[32];
    int32_t n_dims;
    int32_t offset;
    bool is_allocated;
};

float _lcompilers_real_i32(int32_t x);

float _lcompilers_real_i32(int32_t x)
{
    float _lcompilers_real_i32;
    _lcompilers_real_i32 = (float)(x);
    return _lcompilers_real_i32;
}

int main(int argc, char* argv[])
{
    _lpython_set_argv(argc, argv);
    int32_t __libasr_index_0_;
    struct r32 a_value;
    struct r32* a = &a_value;
    float *a_data;
    a->data = a_data;
    a->n_dims = 1;
    a->offset = 0;
    a->dims[0].lower_bound = 1;
    a->dims[0].length = 0;
    a->dims[0].stride = 1;
    struct r32 b_value;
    struct r32* b = &b_value;
    float *b_data;
    b->data = b_data;
    b->n_dims = 1;
    b->offset = 0;
    b->dims[0].lower_bound = 1;
    b->dims[0].length = 0;
    b->dims[0].stride = 1;
    int32_t i;
    a->n_dims = 1;
    a->dims[0].lower_bound = 1;
    a->dims[0].length = 10000000;
    a->dims[0].stride = 1;
    a->data = (float*) _lfortran_malloc(1*a->dims[0].length*sizeof(float));
    a->is_allocated = true;
    b->n_dims = 1;
    b->dims[0].lower_bound = 1;
    b->dims[0].length = 10000000;
    b->dims[0].stride = 1;
    b->data = (float*) _lfortran_malloc(1*b->dims[0].length*sizeof(float));
    b->is_allocated = true;
    for (__libasr_index_0_=((int32_t)b->dims[1-1].lower_bound); __libasr_index_0_<=((int32_t) b->dims[1-1].length + b->dims[1-1].lower_bound - 1); __libasr_index_0_++) {
        b->data[((0 + (b->dims[0].stride * (__libasr_index_0_ - b->dims[0].lower_bound))) + b->offset)] = (float)(5);
    }
#pragma omp target  map(tofrom: a->data[0:a->dims[0].length-1]) map(to: a->dims[0].lower_bound, a->dims[0].length, a->dims[0].stride) map(to: a->n_dims) map(from: a->offset) map(tofrom: b->data[0:b->dims[0].length-1]) map(to: b->dims[0].lower_bound, b->dims[0].length, b->dims[0].stride) map(to: b->n_dims) map(from: b->offset)
#pragma omp teams
#pragma omp distribute parallel for
    for (i=1; i<=10000000; i++) {
        a->data[((0 + (a->dims[0].stride * (i - a->dims[0].lower_bound))) + a->offset)] = _lcompilers_real_i32(i) + b->data[((0 + (b->dims[0].stride * (i - b->dims[0].lower_bound))) + b->offset)]*(float)(340);
    }

    printf("%f%s%f\n", a->data[((0 + (a->dims[0].stride * (5 - a->dims[0].lower_bound))) + a->offset)], " ", b->data[((0 + (b->dims[0].stride * (5 - b->dims[0].lower_bound))) + b->offset)]);
    if (a->data[((0 + (a->dims[0].stride * (5 - a->dims[0].lower_bound))) + a->offset)] != (float)(1705)) {
        fprintf(stderr, "ERROR STOP");
        exit(1);
    }
    if (b->data[((0 + (b->dims[0].stride * (5 - b->dims[0].lower_bound))) + b->offset)] != (float)(5)) {
        fprintf(stderr, "ERROR STOP");
        exit(1);
    }
    // FIXME: implicit deallocate(a, b, );
    return 0;
}`;

  return (
    <div className="post-content space-y-8">
      {/* Recap and Motivation Section */}
      <div className="relative">
        {/* <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400 mb-6 leading-tight">
          GSoC 2025: Week 10 Contribution to OpenMP Support in LFortran
        </h1> */}
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          After Week 9’s research into OpenMP target offloading with Clang, Week 10 focused on using LFortran’s C-backend to generate code for GPU offloading. Last week, I planned to test a simple offloading example and start adapting the OpenMP pass. This week, I worked on extending the C-backend to produce code that Clang can offload to my GPU-enabled machine, spending about 26 hours tackling challenges and learning new details about array handling and the <code className="font-semibold text-indigo-600 dark:text-indigo-400">map</code> clause.
        </p>
      </div>

      {/* Planning and Approach */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Approach for Target Offloading
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          This week, we decided to use LFortran’s C-backend to create C code that can be offloaded to a GPU using Clang. The plan was to generate proper C code from the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> ASR node, which Clang could then process to run on NVIDIA GPU. This approach lets us build on the existing C-backend and use Clang for offloading , which I researched last week. It was a new challenge, but it felt like a good step toward adding GPU support to LFortran.
        </p>
      </div>

      {/* Implementation and Challenges */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Implementation and Challenges Faced
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          I extended the C-backend to handle <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> nodes for target offloading. This meant adding support for OpenMP directives like <code className="font-semibold text-indigo-600 dark:text-indigo-400">target</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">teams</code>, and <code className="font-semibold text-indigo-600 dark:text-indigo-400">distribute parallel do</code>. However, I ran into several difficulties. LFortran arrays are stored as custom structs with fields like data, dimensions, strides, and lengths. To offload these to the GPU, I needed to send all these fields, not just the data, so the GPU could understand the array’s structure. Another issue was with statically allocated arrays (fixed-size arrays). These are not allocated with <code className="font-semibold text-indigo-600 dark:text-indigo-400">malloc</code>, so their pointers caused conflicts when sending or receiving data. As it seems that GPU-device can't access the Stack of the Host memory, but the Heap of it. Switching to allocatable arrays solved this problem, as they are dynamically allocated and accessible via GPU.
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          During this process, I also learned about the <code className="font-semibold text-indigo-600 dark:text-indigo-400">map</code> clause, which controls how data moves between host and device. The attributes <code className="font-semibold text-indigo-600 dark:text-indigo-400">to</code> (read-only on GPU), <code className="font-semibold text-indigo-600 dark:text-indigo-400">from</code> (write-only), and <code className="font-semibold text-indigo-600 dark:text-indigo-400">tofrom</code> (read and write) are key. For my array structs, I set the <code className="font-semibold text-indigo-600 dark:text-indigo-400">data</code> field to <code className="font-semibold text-indigo-600 dark:text-indigo-400">tofrom</code> since it needs to be updated, and fields like <code className="font-semibold text-indigo-600 dark:text-indigo-400">lower_bound</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">length</code>, and <code className="font-semibold text-indigo-600 dark:text-indigo-400">stride</code> to <code className="font-semibold text-indigo-600 dark:text-indigo-400">to</code> because they are only read by the GPU.
        </p>
      </div>

      {/* CI Setup Challenges */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Challenges with CI Setup
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          I tried to set up this offloading support in the Continuous Integration (CI) system, but I hit a roadblock. GitHub’s CI runners don’t have GPU access, which is needed to test offloading. I have a Conda setup script that works on GPU-enabled machines, and I looked into GitLab, which can support GPU runners. However, LFortran moved away from GitLab a while ago, so that option isn’t available right now. I’m still searching for a way to test this in CI, perhaps by finding a different platform or runner with GPU support, but for now, I haven’t made a PR since testing is limited to my local GPU machine.
        </p>
      </div>

      {/* Example Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Example: Target Offloading with C-Backend
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Below is the MRE I used to test the C-backend’s target offloading, along with the generated C code. This example offloads a large array computation to the GPU.
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for Target Offloading (openmp_70.f90)
          </summary>

          
          <div className="relative mt-2">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <div className="relative mt-2">
                {/* Contrasting, visually appealing background for code block */}
                <div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                        background: "#0f172a", // solid contrasting color (slate-900)
                        opacity: 0.92,
                        boxShadow: "0 4px 32px 0 rgba(79,70,229,0.10), 0 1.5px 4px 0 rgba(30,41,59,0.15)"
                    }}
                ></div>
                <SyntaxHighlighter
                    language="fortran"
                    style={dracula}
                    customStyle={{
                        padding: "20px 18px",
                        borderRadius: "10px",
                        overflowX: "auto",
                        background: "transparent",
                        fontSize: "1.08rem",
                        fontFamily: "Fira Mono, Menlo, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
                        color: "#f8fafc",
                        zIndex: 1,
                        position: "relative"
                    }}
                    showLineNumbers
                >
                    {targetOffloadingMre}
                </SyntaxHighlighter>
            </div>
            </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Generated C Code (C-DUMP)
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <div className="relative mt-2">
                {/* Contrasting, visually appealing background for code block */}
                <div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                        background: "#0f172a", // solid contrasting color (slate-900)
                        opacity: 0.92,
                        boxShadow: "0 4px 32px 0 rgba(79,70,229,0.10), 0 1.5px 4px 0 rgba(30,41,59,0.15)"
                    }}
                ></div>
                <SyntaxHighlighter
                    language="c"
                    style={dracula}
                    customStyle={{
                        padding: "20px 18px",
                        borderRadius: "10px",
                        overflowX: "auto",
                        background: "transparent",
                        fontSize: "1.08rem",
                        fontFamily: "Fira Mono, Menlo, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace",
                        color: "#f8fafc",
                        zIndex: 1,
                        position: "relative"
                    }}
                    showLineNumbers
                >
                    {cDump}
                </SyntaxHighlighter>
            </div>
            </div>
        </details>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          The C code shows how arrays <code className="font-semibold text-indigo-600 dark:text-indigo-400">a</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">b</code> are handled as <code className="font-semibold text-indigo-600 dark:text-indigo-400">struct r32</code> with <code className="font-semibold text-indigo-600 dark:text-indigo-400">data</code> mapped as <code className="font-semibold text-indigo-600 dark:text-indigo-400">tofrom</code> and descriptors like <code className="font-semibold text-indigo-600 dark:text-indigo-400">length</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">stride</code> as <code className="font-semibold text-indigo-600 dark:text-indigo-400">to</code>. The loop is offloaded using OpenMP directives, and the result is verified.
        </p>
      </div>

      {/* Next Steps Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Next Steps
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          For Week 11, I plan to:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li>Create a PR with the C-backend changes once CI testing is feasible.</li>
          <li>Explore another way for testing of Target Offloading.</li>
          <li>Test more complex offloading examples, including multiple arrays and clauses.</li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          I am thankful to my mentors, <a href="https://github.com/certik" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Ondrej Certik</a>, <a href="https://github.com/Pranavchiku" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Pranav Goswami</a>, and <a href="https://github.com/gxyd" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Gaurav Dhingra</a>, for their guidance as I navigated this complex setup. I also appreciate the LFortran community’s support during this learning phase.
        </p>
      </div>
    </div>
  );
}