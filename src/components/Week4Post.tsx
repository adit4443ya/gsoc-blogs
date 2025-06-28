import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Week4Post() {
  const openmp47Mre = `program openmp_47
    use omp_lib
    implicit none
    real::res
    res=1
    call omp_set_num_threads(16)
    !$omp parallel reduction(*:res)
        res=res*1.5
    !$omp end parallel 
    if(res /= 1.5**16) error stop
    print *, res
end program openmp_47`;

  const openmp47Lowered = `module thread_data_module_openmp_47
  use, intrinsic :: iso_c_binding
  implicit none
  type, bind(C) :: thread_data
    real(c_float) :: res
  end type thread_data
end module thread_data_module_openmp_47

interface
  subroutine GOMP_parallel(fn, data, num_threads, flags) bind(C, name="GOMP_parallel")
    use, intrinsic :: iso_c_binding
    type(c_ptr), value :: fn, data
    integer(c_int), value :: num_threads, flags
  end subroutine
  subroutine GOMP_atomic_start() bind(C, name="gomp_atomic_start")
  end subroutine
  subroutine GOMP_atomic_end() bind(C, name="gomp_atomic_end")
  end subroutine
end interface

subroutine parallel_region(data) bind(C)
  use omp_lib
  use thread_data_module_openmp_47
  implicit none
  type(c_ptr), value :: data
  type(thread_data), pointer :: d
  real :: res_local

  call c_f_pointer(data, d)
  res_local = 1.5 ! Local computation for reduction

  ! Perform atomic update for reduction
  call GOMP_atomic_start()
  d%res = d%res * res_local
  call GOMP_atomic_end()
end subroutine

program openmp_47
  use omp_lib
  use thread_data_module_openmp_47
  implicit none
  real :: res
  type(thread_data), target :: data
  type(c_ptr) :: ptr

  res = 1
  call omp_set_num_threads(16)
  data%res = 1
  ptr = c_loc(data)

  call GOMP_parallel(c_funloc(parallel_region), ptr, 0, 0)
  res = data%res

  if (res /= 1.5**16) error stop
  print *, res
end program openmp_47`;

  const openmp44Mre = `module openmp_44_parallel_sections
  implicit none

contains

  subroutine compute_a()
    print *, "Computing A"
  end subroutine compute_a

  subroutine compute_b()
    print *, "Computing B"
  end subroutine compute_b

  subroutine compute_c()
    print *, "Computing C"
  end subroutine compute_c

end module openmp_44_parallel_sections

program openmp_44
  use omp_lib
  use openmp_44_parallel_sections
  implicit none
  integer :: tid=0

  !$omp parallel sections reduction(+:tid)
  !$omp section
  call compute_a()
  tid = tid + omp_get_thread_num()
  print *, "Thread ID:", tid

  !$omp section
  call compute_b()
  tid = tid + omp_get_thread_num()
  print *, "Thread ID:", tid

  !$omp section
  call compute_c()
  tid = tid + omp_get_thread_num()
  print *, "Thread ID:", tid    
  !$omp end parallel sections
  print *, "Final Thread ID:", tid

end program openmp_44`;

  const openmp44Lowered = `module openmp_44_parallel_sections
  implicit none
contains
  subroutine compute_a()
    print *, "Computing A"
  end subroutine compute_a
  subroutine compute_b()
    print *, "Computing B"
  end subroutine compute_b
  subroutine compute_c()
    print *, "Computing C"
  end subroutine compute_c
end module openmp_44_parallel_sections

module thread_data_module_openmp_44
  use, intrinsic :: iso_c_binding
  implicit none
  type, bind(C) :: thread_data
    integer(c_int) :: tid
  end type thread_data
end module thread_data_module_openmp_44

interface
  subroutine GOMP_parallel(fn, data, num_threads, flags) bind(C, name="GOMP_parallel")
    use, intrinsic :: iso_c_binding
    type(c_ptr), value :: fn, data
    integer(c_int), value :: num_threads, flags
  end subroutine
  integer(c_int) function GOMP_sections_start(count) bind(C, name="GOMP_sections_start")
    use, intrinsic :: iso_c_binding
    integer(c_int), value :: count
  end function
  integer(c_int) function GOMP_sections_next() bind(C, name="GOMP_sections_next")
    use, intrinsic :: iso_c_binding
  end function
  subroutine GOMP_sections_end() bind(C, name="GOMP_sections_end")
  end subroutine
  subroutine GOMP_atomic_start() bind(C, name="gomp_atomic_start")
  end subroutine
  subroutine GOMP_atomic_end() bind(C, name="gomp_atomic_end")
  end subroutine
end interface

subroutine parallel_sections(data) bind(C)
  use omp_lib
  use thread_data_module_openmp_44
  use openmp_44_parallel_sections
  implicit none
  type(c_ptr), value :: data
  type(thread_data), pointer :: d
  integer(c_int) :: section_id
  integer :: tid_local

  call c_f_pointer(data, d)
  tid_local = 0 ! Initialize local reduction variable

  section_id = GOMP_sections_start(3)
  do while (section_id /= 0)
    if (section_id == 1) then
      call compute_a()
      tid_local = tid_local + omp_get_thread_num()
      print *, "Thread ID:", tid_local
    else if (section_id == 2) then
      call compute_b()
      tid_local = tid_local + omp_get_thread_num()
      print *, "Thread ID:", tid_local
    else if (section_id == 3) then
      call compute_c()
      tid_local = tid_local + omp_get_thread_num()
      print *, "Thread ID:", tid_local
    end if
    section_id = GOMP_sections_next()
  end do
  call GOMP_sections_end()

  ! Perform atomic update for reduction
  call GOMP_atomic_start()
  d%tid = d%tid + tid_local
  call GOMP_atomic_end()
end subroutine

program openmp_44
  use omp_lib
  use thread_data_module_openmp_44
  implicit none
  integer :: tid = 0
  type(thread_data), target :: data
  type(c_ptr) :: ptr

  data%tid = 0
  ptr = c_loc(data)

  call GOMP_parallel(c_funloc(parallel_sections), ptr, 0, 0)
  tid = data%tid
  print *, "Final Thread ID:", tid
end program openmp_44`;

  return (
    <div className="post-content space-y-8">
      {/* Recap and Motivation Section */}
      <div className="relative">
        {/* <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400 mb-6 leading-tight">
          GSoC 2025: Week 4 Contribution to OpenMP Support in LFortran
        </h1> */}
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Continuing from Week 3, where I shifted the <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> logic to the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node and extended the OpenMP pass, Week 4 focused on implementing the <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct and adding support for the <code className="font-semibold text-indigo-600 dark:text-indigo-400">single</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">master</code> constructs. In my previous blog, I planned to implement <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> by lowering it to <code className="font-semibold text-indigo-600 dark:text-indigo-400">GOMP_sections_start</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">GOMP_sections_end</code> calls. This week, I completed this task through PR <a href="https://github.com/lfortran/lfortran/pull/7619" className="text-indigo-500 dark:text-indigo-400 hover:underline">#7619</a> and extended support for <code className="font-semibold text-indigo-600 dark:text-indigo-400">single</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">master</code> in PR <a href="https://github.com/lfortran/lfortran/pull/7638" className="text-indigo-500 dark:text-indigo-400 hover:underline">#7638</a>, spending around 19 hours on these updates.
        </p>
      </div>

      {/* Choice of Implementing Sections Construct Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Choice of Implementing Sections Construct
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          I started Week 4 aiming to add the <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct, which lets different threads run separate code blocks at the same time, unlike the loop-based <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code>. But then I thought it made more sense to build on the <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> work from last week first. Since <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> needs the <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> construct anyway, tackling it early helped set a strong base. Here’s why this choice mattered:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li><span className="font-semibold text-indigo-600 dark:text-indigo-400">Solid Foundation:</span> Shifting <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> to <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> first made it easier to add <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> later.</li>
          <li><span className="font-semibold text-indigo-600 dark:text-indigo-400">Kept Things Working:</span> I ensured all current tests still ran smoothly, avoiding any setbacks.</li>
          <li><span className="font-semibold text-indigo-600 dark:text-indigo-400">Saved Time:</span> Handling <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> early meant less rework when adding other constructs.</li>
        </ul>
      </div>

      {/* Implementation Details and Results Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Implementation Details and Results
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          In PR <a href="https://github.com/lfortran/lfortran/pull/7619" className="text-indigo-500 dark:text-indigo-400 hover:underline">#7619</a>, I implemented the <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct in the OpenMP pass, addressing <a href="https://github.com/lfortran/lfortran/issues/7366" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7366</a> and contributing to <a href="https://github.com/lfortran/lfortran/issues/7332" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7332</a>. I added test cases <code className="font-semibold text-indigo-600 dark:text-indigo-400">openmp_44.f90</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">openmp_45.f90</code> to verify the implementation. Additionally, I fixed a bug in the <code className="font-semibold text-indigo-600 dark:text-indigo-400">reduction</code> clause for standalone <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> constructs (reported in <a href="https://github.com/lfortran/lfortran/issues/7618" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7618</a>) by maintaining a map of clauses based on nesting levels, ensuring proper hierarchical application across <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code>, and standalone <code className="font-semibold text-indigo-600 dark:text-indigo-400">do</code> constructs.
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          In PR <a href="https://github.com/lfortran/lfortran/pull/7638" className="text-indigo-500 dark:text-indigo-400 hover:underline">#7638</a>, I implemented the <code className="font-semibold text-indigo-600 dark:text-indigo-400">single</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">master</code> constructs using a similar approach. For <code className="font-semibold text-indigo-600 dark:text-indigo-400">single</code>, I assigned execution to the thread with ID 0, aligning it with the <code className="font-semibold text-indigo-600 dark:text-indigo-400">master</code> construct for consistency. This choice was supported by the OpenMP 6.0 specification (page 405), which notes that the thread executing a <code className="font-semibold text-indigo-600 dark:text-indigo-400">single</code> block can be implementation-dependent. If needed, this can be refined in future updates based on further feedback or requirements.
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          The results are promising. Both PRs ensure no regression in existing OpenMP test cases, with updated ASR representations handled seamlessly by the extended OpenMP pass. The <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct now supports concurrent execution of independent code blocks, while the bug fix enables correct <code className="font-semibold text-indigo-600 dark:text-indigo-400">reduction</code> behavior. The <code className="font-semibold text-indigo-600 dark:text-indigo-400">single</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">master</code> constructs are now supported, with threadID 0 executing the designated blocks, providing a good step toward implementing <code className="font-semibold text-indigo-600 dark:text-indigo-400">tasks</code> construct.
        </p>
      </div>

      {/* Example Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Example: Sections and Reduction Constructs
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          To demonstrate the new implementations, consider the following MREs from PR <a href="https://github.com/lfortran/lfortran/pull/7619" className="text-indigo-500 dark:text-indigo-400 hover:underline">#7619</a>. The first example tests the bug fix for the <code className="font-semibold text-indigo-600 dark:text-indigo-400">reduction</code> clause in a standalone <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> construct:
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">Reduction</code> Bug Fix
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {openmp47Mre}
            </SyntaxHighlighter>
          </div>
        </details>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          The OpenMP pass lowers this to the following Fortran code using GOMP calls, ensuring the <code className="font-semibold text-indigo-600 dark:text-indigo-400">reduction(*:res)</code> operates correctly across threads:
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Lowered Fortran Code for <code className="font-semibold text-indigo-600 dark:text-indigo-400">Reduction</code> Bug Fix
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {openmp47Lowered}
            </SyntaxHighlighter>
          </div>
        </details>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          The second example showcases the <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct with a <code className="font-semibold text-indigo-600 dark:text-indigo-400">reduction(+:tid)</code> clause:
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">Sections</code> Construct
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {openmp44Mre}
            </SyntaxHighlighter>
          </div>
        </details>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          The OpenMP pass lowers this to the following Fortran code using GOMP calls, distributing the sections across threads:
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Lowered Fortran Code for <code className="font-semibold text-indigo-600 dark:text-indigo-400">Sections</code> Construct
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {openmp44Lowered}
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
          In Week 5, I plan to focus on the following tasks:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li>Implement the <code className="font-semibold text-indigo-600 dark:text-indigo-400">tasks</code> construct using the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node, lowering it to <code className="font-semibold text-indigo-600 dark:text-indigo-400">GOMP_task</code> calls (<a href="https://github.com/lfortran/lfortran/issues/7365" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7365</a>).</li>
          <li>Fix some bugs related do the ASR gen of complicated nested Pragmas and updating of variables which are not in the reduction clause</li>
          {/* <li>Validate the implementation against GFortran and Clang outputs using <code className="font-semibold text-indigo-600 dark:text-indigo-400">-fdump-tree-all</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">-Xclang -ast-dump</code>.</li>
          <li>Refine the <code className="font-semibold text-indigo-600 dark:text-indigo-400">single</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">master</code> implementations based on community feedback and the OpenMP 6.0 specification.</li> */}
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          I would like to thank my mentors, <a href="https://github.com/certik" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Ondrej Certik</a>, <a href="https://github.com/Pranavchiku" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Pranav Goswami</a>, and <a href="https://github.com/gxyd" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Gaurav Dhingra</a>, for their valuable guidance and reviews, which helped shape these implementations. I also thank the LFortran community for their ongoing support.
        </p>
      </div>
    </div>
  );
}