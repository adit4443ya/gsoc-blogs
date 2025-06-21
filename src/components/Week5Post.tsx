import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Week5Post() {
  const taskMre1 = `program openmp_51
    use omp_lib
    implicit none
    call omp_set_num_threads(10)

    !$omp parallel
        if(omp_get_thread_num() == 0) then
            !$omp task
                print *, "Task 0 done by TID:-",omp_get_thread_num()
            !$omp end task
        end if
        
        if(omp_get_thread_num() == 1) then
            !$omp task
                print *, "Task 1 done by TID:-",omp_get_thread_num()
            !$omp end task
        end if
    !$omp end parallel 
end program openmp_51`;

  const taskMre2 = `program openmp_50
    use omp_lib
    implicit none
    integer :: i=0,n=10
    call omp_set_num_threads(8)

  !$OMP PARALLEL 
    !$OMP MASTER
      do i = 1, n
          !$OMP TASK  private(i)
              print *, "Task ",i,"done by TID:-",omp_get_thread_num()
          !$OMP END TASK
      end do
    !$OMP END MASTER
  !$OMP END PARALLEL

end program openmp_50`;

  const sharedPrivateMre1 = `program openmp_52
  use omp_lib
  implicit none
  integer, parameter :: N = 100, init=0
  integer :: a(N), i, total
  a = 1  ! Initialize all elements to 1

  !$omp parallel shared(a, total) private(i)
    total = init  ! Initialize total to 0
    !$omp barrier
    
    !$omp do
        do i = 1, N
            !$omp critical
            total = total + a(i)
            !$omp end critical
        end do
    !$omp end do
  !$omp end parallel

  print *, "Total sum:", total
  if (total /= N) error stop "Incorrect sum"
end program openmp_52`;

  const sharedPrivateMre2 = `program openmp_53
  use omp_lib
  implicit none
  integer :: x
  integer, parameter:: N = 0

  !$omp parallel shared(x)
  x=N
  !$omp barrier
    !$omp critical
    x = x + 1
    !$omp end critical
  !$omp end parallel

  print *, "Final x:", x
  if (x /= omp_get_max_threads()) error stop "x is not equal to number of threads"
end program openmp_53`;

  const sharedPrivateMre3 = `program openmp_54
  use omp_lib
  implicit none

  integer, parameter :: N = 1000
  integer :: i, tid
  integer :: total_sum
  integer :: partial_sum

  !$omp parallel shared(total_sum) private(i, partial_sum, tid)
    tid = omp_get_thread_num()
    partial_sum = 0
    total_sum = 0
    !$omp barrier

    !$omp do
        do i = 1, N
            partial_sum = partial_sum + i
        end do
    !$omp end do

    ! Critical update to the shared total_sum
    !$omp critical
        total_sum = total_sum + partial_sum
        print *, "Thread ", tid, " added partial_sum ", partial_sum
    !$omp end critical

    !$omp barrier

    !$omp single
        if (total_sum /= N*(N+1)/2) then
            print *, "ERROR: total_sum = ", total_sum, " expected = ", N*(N+1)/2
            error stop
        else
            print *, "Success! total_sum = ", total_sum
        end if
    !$omp end single

  !$omp end parallel

end program openmp_54`;

  return (
    <div className="post-content space-y-8">
      {/* Recap and Motivation Section */}
      <div className="relative">
        {/* <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400 mb-6 leading-tight">
          GSoC 2025: Week 5 Contribution to OpenMP Support in LFortran
        </h1> */}
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Following Week 4’s implementation of the <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">single</code>, and <code className="font-semibold text-indigo-600 dark:text-indigo-400">master</code> constructs, Week 5 shifted focus to the <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> construct and resolving issues with <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">private</code> variables in <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> regions. Initially, I planned to work on the <code className="font-semibold text-indigo-600 dark:text-indigo-400">teams</code> construct, but addressing these foundational issues took precedence. This week, I successfully merged PR <a href="https://github.com/lfortran/lfortran/pull/7760" className="text-indigo-500 dark:text-indigo-400 hover:underline">#7760</a> and made significant progress on PR <a href="https://github.com/lfortran/lfortran/pull/7832" className="text-indigo-500 dark:text-indigo-400 hover:underline">#7832</a>, which now passes all tests. Approximately 37 hours were invested in these efforts to enhance LFortran’s OpenMP capabilities.
        </p>
      </div>

      {/* Implementation of TASK Construct */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Implementing the TASK Construct
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          In PR <a href="https://github.com/lfortran/lfortran/pull/7760" className="text-indigo-500 dark:text-indigo-400 hover:underline">#7760</a>, I implemented the <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> construct, contributing to <a href="https://github.com/lfortran/lfortran/issues/7365" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7365</a> and <a href="https://github.com/lfortran/lfortran/issues/7332" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7332</a>. This involved compiling and running two simple minimal reproducible examples (MREs), <code className="font-semibold text-indigo-600 dark:text-indigo-400">openmp_50.f90</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">openmp_51.f90</code>. Additional changes included fixing a bug in ASR generation, adding a utility to visit the body of an <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code>, and extending <code className="font-semibold text-indigo-600 dark:text-indigo-400">visit_If_t</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">visit_DoLoop_t</code> to handle nested <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> statements. The PR was successfully merged, enabling basic task parallelism in LFortran.
        </p>
      </div>

      {/* Discrepancies Found */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Discrepancies in TASK and PARALLEL Constructs
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          After merging PR #7760, I noticed that the <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> construct worked only for MREs without <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> variables. More complex examples involving <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> variables failed, suggesting an issue with passing the <code className="font-semibold text-indigo-600 dark:text-indigo-400">thread_data</code> struct to GOMP calls. To investigate further, I examined the <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> construct independently. I found that only arrays were correctly treated as <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code>, while non-array variables were incorrectly handled as <code className="font-semibold text-indigo-600 dark:text-indigo-400">private</code>. This revealed a deeper flaw in the existing OpenMP logic that needed immediate attention.
        </p>
      </div>

      {/* Faulty Logic and Fixes */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Addressing Faulty Logic in shared and private Clauses
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          The root cause was very tricky to find , but it was one outdated assumption in the OpenMP pass: all variables within a <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> region were treated as <code className="font-semibold text-indigo-600 dark:text-indigo-400">private</code> except for arrays. This logic was insufficient for robust OpenMP support. In PR <a href="https://github.com/lfortran/lfortran/pull/7832" className="text-indigo-500 dark:text-indigo-400 hover:underline">#7832</a>, I tackled the handling of <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">private</code> variables. I first tried that, why not just copy back those private vars back to original vars? It turned out this approach was completely wrong as what if the changes done by one thread is needed by other thread? What if we have a critical section? In those scenarios it failed completely. Hence, I adopted a pointer-based approach for <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> variables, creating pointers in the <code className="font-semibold text-indigo-600 dark:text-indigo-400">lcompilers_parallel_func</code> and defining corresponding <code className="font-semibold text-indigo-600 dark:text-indigo-400">CPtr</code>-typed members in the <code className="font-semibold text-indigo-600 dark:text-indigo-400">thread_data</code> struct. This ensured all threads could access the same memory location. For <code className="font-semibold text-indigo-600 dark:text-indigo-400">private</code> variables, I retained their original types in the struct. Additionally, I implemented the <code className="font-semibold text-indigo-600 dark:text-indigo-400">barrier</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">critical</code> constructs to support synchronization in these scenarios. This approach enabled LFortran to compile and run three complex MREs, validating the fixes.
        </p>
      </div>

      {/* Example Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Examples: TASK Construct and shared/private Fixes
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Below are the MREs showcasing the Week 5 contributions. The first two demonstrate the <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> construct from PR #7760, while the subsequent three illustrate the fixes for <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">private</code> variables from PR #7832.
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> Construct (openmp_51.f90)
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {taskMre1}
            </SyntaxHighlighter>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> Construct (openmp_50.f90)
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {taskMre2}
            </SyntaxHighlighter>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code>/<code className="font-semibold text-indigo-600 dark:text-indigo-400">private</code> Fix (openmp_52.f90)
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {sharedPrivateMre1}
            </SyntaxHighlighter>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code>/<code className="font-semibold text-indigo-600 dark:text-indigo-400">private</code> Fix (openmp_53.f90)
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {sharedPrivateMre2}
            </SyntaxHighlighter>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code>/<code className="font-semibold text-indigo-600 dark:text-indigo-400">private</code> Fix (openmp_54.f90)
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {sharedPrivateMre3}
            </SyntaxHighlighter>
          </div>
        </details>
      </div>

      {/* Next Steps Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Next Steps
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          For Week 6, I plan to:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li>Enhance the <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> construct to support <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">private</code> variables, using and building upon the fixes from PR #7832.</li>
          <li>Implement the <code className="font-semibold text-indigo-600 dark:text-indigo-400">teams</code> construct using the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node (<a href="https://github.com/lfortran/lfortran/issues/7363" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7363</a>).</li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          I express my gratitude to my mentors, <a href="https://github.com/certik" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Ondrej Certik</a>, <a href="https://github.com/Pranavchiku" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Pranav Goswami</a>, and <a href="https://github.com/gxyd" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Gaurav Dhingra</a>, for their guidance and thorough reviews, which were instrumental in resolving these issues. I also thank the LFortran community for their continued support.
        </p>
      </div>
    </div>
  );
}