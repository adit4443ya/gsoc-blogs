import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Week6Post() {
  const taskMre1 = `module thread_data_module_tasks
  use, intrinsic :: iso_c_binding
  implicit none
  type :: thread_data
    type(c_ptr) :: i_ptr
  end type thread_data
end module thread_data_module_tasks

program bindc5
    use thread_data_module_tasks
    use, intrinsic :: iso_c_binding
    implicit none
    integer, target :: i
    integer, pointer :: ptr_i, ptr_i2
    type(thread_data), pointer :: d,d1
    type(thread_data), target :: threadData, taskData
    type(c_ptr) :: threadPtr, taskPtr

    i=0

    threadData%i_ptr = c_loc(i)
    threadPtr = c_loc(threadData)
    call c_f_pointer(threadPtr, d)
    call c_f_pointer(d%i_ptr, ptr_i)

    ptr_i=2

    taskData%i_ptr = d%i_ptr
    taskPtr = c_loc(taskData)
    call c_f_pointer(taskPtr, d1)
    call c_f_pointer(d1%i_ptr, ptr_i2)

    ptr_i2=3

    print*, i,ptr_i2,ptr_i
    if(i/=ptr_i2 .and. i/=ptr_i) error stop
end program bindc5`;

  const taskMre2 = `program openmp_55
    use omp_lib
    implicit none
    integer :: i,n=10,counter
    call omp_set_num_threads(8)
counter=0
  !$OMP PARALLEL 
    !$OMP MASTER
      do i = 1, n
          !$OMP TASK shared(counter)
                counter=counter+1
              print *, "Task Done by TID:-",omp_get_thread_num()
          !$OMP END TASK
      end do
    !$OMP END MASTER
  !$OMP END PARALLEL
      if(counter/=10) error stop
end program openmp_55`;

  const taskMre3 = `program openmp_56
    use omp_lib
    implicit none
    integer :: counter
    counter=0
    call omp_set_num_threads(10)

    !$omp parallel
        !$omp task shared(counter)
            counter=counter+1
            print *, "Task done by TID:-",omp_get_thread_num()
        !$omp end task
    !$omp end parallel
    if(counter/=10) error stop
end program openmp_56`;

  const taskMre4 = `program openmp_57
  use omp_lib
  implicit none
  integer, parameter :: N = 5
  integer :: A(N)
  integer :: i, index,total

  A = 1
  total=0
  index=1

  !$omp parallel
  !$omp single
  do i = 1, N
    !$omp task shared(A)
        total = total + A(index) * 2
        index=index+1
    !$omp end task
  end do
  !$omp end single
  !$omp taskwait
  !$omp end parallel

  print *, "Total = ", total, index
  if(total/=10) error stop
end program openmp_57`;

  return (
    <div className="post-content space-y-8">
      {/* Recap and Motivation Section */}
      <div className="relative">
        {/* <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400 mb-6 leading-tight">
          GSoC 2025: Week 6 Contribution to OpenMP Support in LFortran
        </h1> */}
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Building on Week 5’s work with the <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> construct and fixes for <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code>/<code className="font-semibold text-indigo-600 dark:text-indigo-400">private</code> variables, Week 6 focused on making <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> variables work reliably in the <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> construct and adding the <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASKWAIT</code> construct. Last week, I planned to enhance <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> support and implement <code className="font-semibold text-indigo-600 dark:text-indigo-400">teams</code>, but debugging <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> issues took priority. This week, I made PR <a href="https://github.com/lfortran/lfortran/pull/7905" className="text-indigo-500 dark:text-indigo-400 hover:underline">#7905</a>, and spent about 25 hours tackling these challenges through careful debugging and implementation.
        </p>
      </div>

      {/* Debugging and Fixing TASK Construct Issues */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Debugging and Fixing TASK Construct Issues
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          This week, I worked on ensuring <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> variables function correctly in the <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> construct, a task that proved more complex than expected. I faced multiple segfaults and struggled to pinpoint the cause, eventually realizing it was a mix of two or three bugs. To tackle this, I took a step-by-step approach, starting from scratch by writing lowered Fortran code with GOMP calls for <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code>. This revealed the first issue: the task data struct size sent to <code className="font-semibold text-indigo-600 dark:text-indigo-400">GOMP_TASK</code> was incorrect, causing segfaults. The second problem was that <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> variables in <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> had garbage initial values. Debugging the LLVM IR showed that <code className="font-semibold text-indigo-600 dark:text-indigo-400">c_f_pointer</code> was using the address of the struct member instead of its value for non-array <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> variables, leading to junk data.
        </p>
      </div>

      {/* Implementation Details and Fixes */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Implementation Details and Fixes in PR #7905
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          In PR <a href="https://github.com/lfortran/lfortran/pull/7905" className="text-indigo-500 dark:text-indigo-400 hover:underline">#7905</a>, I addressed these issues to support <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> variables in the <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> construct and implemented the <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASKWAIT</code> construct, contributing to <a href="https://github.com/lfortran/lfortran/issues/7332" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7332</a> and <a href="https://github.com/lfortran/lfortran/issues/7365" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7365</a> while fixing <a href="https://github.com/lfortran/lfortran/issues/7904" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7904</a>. I corrected the task data struct size calculation for <code className="font-semibold text-indigo-600 dark:text-indigo-400">GOMP_TASK</code> calls and fixed the <code className="font-semibold text-indigo-600 dark:text-indigo-400">c_f_pointer</code> issue in <code className="font-semibold text-indigo-600 dark:text-indigo-400">asr_to_llvm.cpp</code> by ensuring it references the correct memory address for non-array <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> variables. This required debugging of the LLVM IR to identify all failure scenarios. Additionally, I added <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASKWAIT</code> to synchronize tasks, ensuring proper execution flow.
        </p>
      </div>

      {/* Example Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Examples: TASK and TASKWAIT Constructs
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Below are the MREs from PR #7905 that demonstrate the improved <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> construct with <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> variables and the new <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASKWAIT</code> construct.
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> with Pointers (bindc5.f90)
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
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> with Shared Counter (openmp_55.f90)
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
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> with Shared Counter (openmp_56.f90)
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {taskMre3}
            </SyntaxHighlighter>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> with <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASKWAIT</code> (openmp_57.f90)
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {taskMre4}
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
          For Week 7, I plan to:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li>Implement the <code className="font-semibold text-indigo-600 dark:text-indigo-400">teams</code> construct using the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node (<a href="https://github.com/lfortran/lfortran/issues/7363" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7363</a>).</li>
          <li>Fix more bugs and implement other clauses if possible for <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASKS</code></li>
          {/* <li>Validate the implementation against GFortran and Clang outputs using appropriate tools.</li>
          <li>Explore additional optimizations for <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASKWAIT</code> constructs based on community feedback.</li> */}
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          I am grateful to my mentors, <a href="https://github.com/certik" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Ondrej Certik</a>, <a href="https://github.com/Pranavchiku" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Pranav Goswami</a>, and <a href="https://github.com/gxyd" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Gaurav Dhingra</a>, for their expert guidance during this debugging process. I also thank the LFortran community for their support and encouragement.
        </p>
      </div>
    </div>
  );
}