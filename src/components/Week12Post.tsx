import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Week12Post() {
  const cmakeListsSnippet = `elseif (LFORTRAN_BACKEND STREQUAL "target_offload")
            set(c_file "\${CURRENT_BINARY_DIR}/\${file_name}.c")
            execute_process(
                COMMAND lfortran \${extra_args} --openmp --show-c --target-offload
                        \${CMAKE_CURRENT_SOURCE_DIR}/\${file_name}.f90
                OUTPUT_FILE \${c_file}
                RESULT_VARIABLE convert_result
            )
            configure_file(
                \${CMAKE_SOURCE_DIR}/../src/libasr/config.h.in
                \${CMAKE_SOURCE_DIR}/../src/libasr/config.h
                @ONLY
            )
            add_executable(\${name}
                \${CMAKE_SOURCE_DIR}/../src/libasr/runtime/lfortran_intrinsics.c
                \${CMAKE_SOURCE_DIR}/../src/libasr/runtime/cuda_runtime_impl.c
                \${c_file}
            )
            target_include_directories(\${name} PUBLIC
                \${CMAKE_SOURCE_DIR}/../src/
                \${CMAKE_SOURCE_DIR}/../src/libasr/runtime
            )
            target_compile_options(\${name} PUBLIC -fopenmp)
            target_link_libraries(\${name} PUBLIC m)
            target_link_options(\${name} PUBLIC -fopenmp)
            target_link_options(\${name} PUBLIC -L$ENV{CONDA_PREFIX}/lib \${extra_args})
            add_test(NAME \${name} COMMAND \${name})
`;

  return (
    <div className="post-content space-y-8">
      {/* Recap and Motivation Section */}
      <div className="relative">
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Following Week 11’s development of the dual-mode C-backend for CPU and GPU offloading, Week 12, the final week of GSoC, focused on cleaning up the branch and preparing PR <a href="https://github.com/lfortran/lfortran/pull/8243" className="text-indigo-500 dark:text-indigo-400 hover:underline">#8243</a> for merge. Last week, I planned to refine the backend and explore CI solutions. This week, I fixed CI failures in the target offload backend, renamed the CPU implementation file, merged a PR for the combined <code className="font-semibold text-indigo-600 dark:text-indigo-400">TEAMS DISTRIBUTE</code> construct, and documented steps for using the C-backend to dump OMP and CUDA code, spending about 24 hours wrapping up these tasks.
        </p>
      </div>

      {/* Implementation Details and Fixes */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Implementation Details and Fixes
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          In PR <a href="https://github.com/lfortran/lfortran/pull/8243" className="text-indigo-500 dark:text-indigo-400 hover:underline">#8243</a>, I addressed CI failures caused by missing runtime dependencies, specifically the <code className="font-semibold text-indigo-600 dark:text-indigo-400">config.h</code> file, which CMake generates from <code className="font-semibold text-indigo-600 dark:text-indigo-400">config.h.in</code> during the LFortran build. After debugging, I configured it in the <code className="font-semibold text-indigo-600 dark:text-indigo-400">CMakeLists.txt</code> for the target_offload backend, ensuring it’s included only for that case. This fixed the issues, and the CI passed. I also renamed <code className="font-semibold text-indigo-600 dark:text-indigo-400">cpu_impl.h</code> to <code className="font-semibold text-indigo-600 dark:text-indigo-400">cuda_runtime_impl.h</code>.
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Updated CMakeLists.txt for Target Offload Backend
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
                    {cmakeListsSnippet}
                </SyntaxHighlighter>
            </div>
            </div>
        </details>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          In a separate PR, I implemented the combined <code className="font-semibold text-indigo-600 dark:text-indigo-400">TEAMS DISTRIBUTE</code> construct, as individual <code className="font-semibold text-indigo-600 dark:text-indigo-400">TEAMS</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">DISTRIBUTE</code> worked, but not their combined form. This ensures consistent behavior for nested and combined directives. I also documented steps to generate OMP and CUDA code using the C-backend in <a href="https://github.com/lfortran/lfortran/issues/4497#issuecomment-3166812375" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #4497</a>.
        </p>
      </div>

      {/* Next Steps Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Next Steps
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          As this is the final week of GSoC, my focus will shift to wrapping up documentation, preparing for the final evaluation, and planning post-GSoC contributions.
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li>Finalize any open issues and merge remaining features.</li>
          <li>Expand the documentation for OpenMP support in LFortran.</li>
          <li>Explore additional OpenMP constructs for future work.</li>
        </ul>
      </div>

      {/* Concluding Reflections Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Reflections on the 12-Week Journey
        </h2>
        <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            Over these 12 weeks, I made significant progress in enhancing OpenMP support in LFortran. I implemented 12 constructs—<code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">do</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">tasks</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">taskloop</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">teams</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">distribute</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">section/sections</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">single</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">master</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">critical</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">atomic</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">barrier</code>, and <code className="font-semibold text-indigo-600 dark:text-indigo-400">taskwait</code>—along with 8 clauses—<code className="font-semibold text-indigo-600 dark:text-indigo-400">reduction</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">private</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">num_teams</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">num_threads</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">collapse</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">thread_limit</code>, and <code className="font-semibold text-indigo-600 dark:text-indigo-400">schedule</code>, as detailed in <a href="https://github.com/lfortran/lfortran/issues/7332#issuecomment-3039301414" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7332</a>. This work has transformed LFortran into a more capable tool for parallel programming, paving the way for high-performance computing and GPU acceleration.
          </p>
          <p>
            The project began with designing the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> ASR node, a structure designed to support nested and combined directives with a stack-based approach for scalability. Then, I began to implement these features in the OpenMP pass, resolving challenges like shared data handling, segmentation faults and variable scoping to ensure smooth execution. The final phase involved exploring target offloading, where I studied Clang’s LLVM-based system, host-device models, memory management, and runtime dependencies like <code className="font-semibold text-indigo-600 dark:text-indigo-400">libomptarget</code>. This led to extending the C-backend for GPU code in PR <a href="https://github.com/lfortran/lfortran/pull/8243" className="text-indigo-500 dark:text-indigo-400 hover:underline">#8243</a>, detailed in <a href="https://github.com/lfortran/lfortran/issues/4497" className="text-indigo-500 dark:text-indigo-900 px-1 py-0.5 rounded">Issue #4497</a>, using a dual-mode switch for CPU/GPU testing and dumping equivalent OMP-C/CUDA code for given input.
          </p>
          <p>
        This experience has taught me that designing anything—be it an ASR node or a feature implementation—is the most critical and foundational step, which requires lots of research and vision, as the entire progress and feature set depends on it. Also, I learned that it requires patience and multiple iterations, especially when implementing those proposed designs to bring out the most optimal solutions. 

        </p>
        <p>
        I’m grateful for this opportunity to introduce a wide range of OpenMP features, contributing to the HPC domain and paving the path for LFortran to compile and run Parallel Fortran Codes. This journey has fueled my growth in skills—from Designing ASR Nodes to Implementations of OpenMP Features to GPU programming—and I extend my sincere thanks to my mentors, <a href="https://github.com/certik" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Ondrej Certik</a>, <a href="https://github.com/Pranavchiku" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Pranav Goswami</a>, and <a href="https://github.com/gxyd" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Gaurav Dhingra</a>, for their invaluable guidance, and to the LFortran community for their support throughout this rewarding project.
      </p>
        </div>
      </div>
    </div>
  );
}
