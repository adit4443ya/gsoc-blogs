import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Week1Post() {
  const fortranCodeWithPragmas = `program parallel_processing
    use omp_lib
    implicit none

    integer, parameter :: N = 10
    integer :: i

    !$omp parallel
    !$omp single
    do i = 1, N
        !$omp task
        call process_item(i)
        !$omp end task
    end do
    !$omp end single
    !$omp end parallel

contains

    subroutine process_item(i)
        integer, intent(in) :: i
        integer :: thread_num

        thread_num = omp_get_thread_num()
        print *, "Processing item ", i, " on thread ", thread_num
    end subroutine process_item

end program parallel_processing`;

  const fortranCodeWithoutPragmas = `module thread_data_module_tasks
  use, intrinsic :: iso_c_binding
  implicit none
  type, bind(C) :: thread_data
    integer(c_int) :: i
  end type thread_data
  integer(c_long), parameter :: THREAD_DATA_SIZE = 4  ! Size of thread_data (bytes)
  integer(c_long), parameter :: THREAD_DATA_ALIGN = 4 ! Alignment of thread_data (bytes)
end module thread_data_module_tasks

module omp_lib
  use iso_c_binding
  implicit none
  interface
    subroutine GOMP_parallel(fn, data, num_threads, flags) bind(C, name="GOMP_parallel")
      import :: c_funptr, c_ptr, c_int
      type(c_funptr), value :: fn
      type(c_ptr), value :: data
      integer(c_int), value :: num_threads
      integer(c_int), value :: flags
    end subroutine
    subroutine GOMP_task(fn, data, cpyfn, arg_size, arg_align, if_clause, flags, depend) &
                         bind(C, name="GOMP_task")
      use, intrinsic :: iso_c_binding
      type(c_ptr), value :: fn, data, cpyfn, depend
      integer(c_long), value :: arg_size, arg_align
      logical(c_bool), value :: if_clause
      integer(c_int), value :: flags
    end subroutine
    function omp_get_thread_num() bind(c, name="omp_get_thread_num")
      import :: c_int
      integer(c_int) :: omp_get_thread_num
    end function
  end interface
end module omp_lib

subroutine process_item(i)
  use omp_lib
  implicit none
  integer, intent(in) :: i
  print *, "Processing item ", i, " on thread ", omp_get_thread_num()
end subroutine process_item

subroutine task_fn(data) bind(C)
  use thread_data_module_tasks
  implicit none
  type(c_ptr), value :: data
  type(thread_data), pointer :: d
  call c_f_pointer(data, d)
  call process_item(d%i)
end subroutine task_fn

subroutine parallel_region(data) bind(C)
  use thread_data_module_tasks
  use omp_lib
  implicit none
  type(c_ptr), value :: data
  integer(c_int), pointer :: n
  integer :: i
  type(thread_data), target :: task_data
  type(c_ptr) :: task_ptr

  interface
    subroutine task_fn(data) bind(C)
      use thread_data_module_tasks
      type(c_ptr), value :: data
    end subroutine task_fn
  end interface

  call c_f_pointer(data, n)
  if (omp_get_thread_num() == 0) then
    do i = 1, n
      task_data%i = i
      task_ptr = c_loc(task_data)
      call GOMP_task(c_funloc(task_fn), task_ptr, c_null_ptr, THREAD_DATA_SIZE, &
                     THREAD_DATA_ALIGN, .true._c_bool, 0, c_null_ptr)
    end do
  end if
end subroutine parallel_region

program main
  use thread_data_module_tasks
  use omp_lib
  use, intrinsic :: iso_c_binding
  implicit none
  integer, target :: n = 10
  type(c_ptr) :: ptr

  interface
    subroutine parallel_region(data) bind(C)
      use thread_data_module_tasks
      type(c_ptr), value :: data
    end subroutine parallel_region
  end interface

  ptr = c_loc(n)
  call GOMP_parallel(c_funloc(parallel_region), ptr, 0, 0)
end program main`;

  const clangAst = `  |-OMPParallelDirective 0x5dcc678e58f0 <line:12:5, col:25>
  | \`-CapturedStmt 0x5dcc678e5870 <line:13:5, line:23:5>
  |   |-CapturedDecl 0x5dcc678e44b8 <<invalid sloc>> <invalid sloc> nothrow
  |   | |-CompoundStmt 0x5dcc678e57d0 <line:13:5, line:23:5>
  |   | | \`-OMPSingleDirective 0x5dcc678e5798 <line:14:9, col:27>
  |   | |   \`-CapturedStmt 0x5dcc678e5738 <line:15:9, line:22:9>
  |   | |     |-CapturedDecl 0x5dcc678e4ae8 <<invalid sloc>> <invalid sloc>
  |   | |     | |-CompoundStmt 0x5dcc678e5698 <line:15:9, line:22:9>
  |   | |     | | \`-ForStmt 0x5dcc678e5660 <line:16:13, line:21:13>
  |   | |     | |   |-DeclStmt 0x5dcc678e4c88 <line:16:18, col:27>
  |   | |     | |   | \`-VarDecl 0x5dcc678e4c00 <col:18, col:26> col:22 used i 'int' cinit
  |   | |     | |   \`-CompoundStmt 0x5dcc678e5648 <col:42, line:21:13>
  |   | |     | |     \`-OMPTaskDirective 0x5dcc678e5600 <line:17:17, col:33>
  |   | |     | |       |-OMPFirstprivateClause 0x5dcc678e55c0 <<invalid sloc>> <implicit>
  |   | |     | |       \`-CapturedStmt 0x5dcc678e53e0 <line:18:17, line:20:17>
  |   | |     | |         \`-CapturedDecl 0x5dcc678e4f78 <<invalid sloc>> <invalid sloc> nothrow
  |   | |     | |           |-CompoundStmt 0x5dcc678e53c8 <line:18:17, line:20:17>
  |   | |     | |           | \`-CallExpr 0x5dcc678e5388 <line:19:21, col:35> 'void'
  |   | |     | |           |   |-ImplicitCastExpr 0x5dcc678e5370 <col:21> 'void (*)(int)' <FunctionToPointerDecay>
  |   | |     | |           |   | \`-DeclRefExpr 0x5dcc678e5300 <col:21> 'void (int)' Function 0x5dcc678e3f08 'process_item' 'void (int)'
  |   | |     | |           |   \`-ImplicitCastExpr 0x5dcc678e53b0 <col:34> 'int' <LValueToRValue>`;

  const lfortranAsrWithPragmas = `OMPRegion(
  region = Parallel,
  clauses = [],
  body = [
    OMPRegion(
      region = Single,
      clauses = [],
      body = [
        DoLoop(
          head = [{v = "i", start = IntegerConstant(1), end = IntegerConstant(10)}],
          body = [
            OMPRegion(
              region = Task,
              clauses = [],
              body = [Call(symbol="process_item")]
            )
          ]
        )
      ]
    )
  ]
)`;

  const ompRegionStructure = `stmt
  = ...
  | OMPRegion(omp_region_type region, omp_clause* clauses, stmt* body)

omp_region_type
  = Parallel | Do | ParallelDo | Sections | Single | Task | Simd | Teams | Target | TargetData

omp_clause
  = OMPPrivate(expr* vars) | OMPShared(expr* vars) | OMPReduction(reduction_op operator, expr* vars) |

reduction_op
  = ReduceAdd | ReduceSub | ReduceMul | ReduceMIN | ReduceMAX

schedule_type
  = Static | Dynamic | Guided | Auto | Runtime

  ...`;

  return (
    <div className="post-content space-y-8">
      {/* Introduction Section */}
      <div className="relative">
        {/* <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400 mb-6 leading-tight">
          GSoC 2025 Kickoff: Week 1 Contribution to OpenMP Support in LFortran
        </h1> */}
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          I am <code className="font-semibold text-indigo-600 dark:text-indigo-400">Aditya Trivedi</code>, a contributor to the Google Summer of Code (GSoC) 2025, working on enhancing OpenMP support in LFortran, a LLVM based Fortran compiler. This blog post provides a summary of my progress during the first week, where I have focused on laying the groundwork for extending OpenMP features such as teams, tasks, and sections. My project aims to build upon LFortran’s existing OpenMP capabilities, positioning it as a robust tool for high-performance computing (HPC).
        </p>
      </div>

      {/* Objective Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Objective
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          The primary goal of this project is to expand LFortran’s OpenMP support to include constructs beyond the existing parallel do, such as teams, tasks, sections, single, and SIMD, in alignment with the <a href="https://www.openmp.org/wp-content/uploads/OpenMP-RefGuide-6.0-OMP60SC24-web.pdf" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">OpenMP 6.0 standard</a>. This enhancement will enable LFortran to handle complex parallel workloads, making it competitive with established compilers like GFortran and Clang for HPC applications. During Week 1, I worked for 38 Hours and efforts were concentrated on analyzing the current design, identifying its limitations, proposing a new approach, and studying how other compilers implement OpenMP, thereby establishing a foundation for the upcoming implementation phase.
        </p>
      </div>

      {/* Current Design Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Current Design
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          LFortran currently supports the <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">parallel do</code> construct with clauses such as <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">private</code>, <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">shared</code>, <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">reduction</code>, and <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">collapse</code>. The implementation, as detailed in <a href="https://github.com/lfortran/lfortran/issues/3777" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #3777</a>, operates as follows:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
            <li>
            <code className="font-semibold text-indigo-600 dark:text-indigo-400">Parsing:</code> The <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">visit_Pragma</code> function in <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">ast_body_visitor.cpp</code> recognizes <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">!$omp parallel do</code> and converts it to a <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">DoConcurrentLoop</code> node in the Abstract Semantic Representation (ASR), capturing clauses and loop details.
            </li>
          <li><code className="font-semibold text-indigo-600 dark:text-indigo-400">Backend:</code> The OpenMP pass (<code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">openmp.cpp</code>) outlines the loop body into a function, partitions iterations across threads using <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">omp_get_thread_num</code> and <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">omp_get_num_threads</code>, and generates <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">GOMP_parallel</code> calls to the <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">libgomp</code> runtime.</li>
          <li><code className="font-semibold text-indigo-600 dark:text-indigo-400">Example:</code> A <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">parallel do</code> loop is transformed into a <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">DoConcurrentLoop</code> node, lowered to a function with thread partitioning, as described in <a href="https://github.com/lfortran/lfortran/issues/3777#issuecomment-2104814180" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #3777, Comment #2104814180</a>.</li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          While this design is effective for loop-based parallelism, it presents limitations when attempting to support other OpenMP constructs.
        </p>
            </div>

            {/* Challenges Section */}
            <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Challenges in the Current Design
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          While the <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">DoConcurrentLoop</code> approach is suitable for <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">parallel do</code>, extending it to support new constructs such as <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">teams</code>, <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">tasks</code>, and <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">sections</code> introduces several challenges:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li><code className="font-semibold text-indigo-600 dark:text-indigo-400">Non-Loop Constructs:</code> Constructs like <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">sections</code> (independent blocks) and <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">tasks</code> (dynamic scheduling) do not fit the loop-centric <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">DoConcurrentLoop</code> structure, necessitating complex workarounds.</li>
          <li><code className="font-semibold text-indigo-600 dark:text-indigo-400">Clause Support:</code> New clauses (e.g., <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">num_teams</code> for <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">teams</code>, <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">depend</code> for <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">tasks</code>) are difficult to integrate into the existing node’s clause arrays.</li>
          <li><code className="font-semibold text-indigo-600 dark:text-indigo-400">Nesting:</code> Handling nested constructs (e.g., <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">parallel do</code> inside <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">teams</code>) is challenging, as <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">DoConcurrentLoop</code> assumes a single loop level.</li>
          <li><code className="font-semibold text-indigo-600 dark:text-indigo-400">Scalability:</code> Adapting a loop-based node for diverse constructs risks creating a convoluted design, which could complicate maintenance as OpenMP continues to evolve.</li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          These limitations, which are further discussed in <a href="https://github.com/lfortran/lfortran/issues/7332" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7332</a>, necessitated the exploration of alternative designs to better accommodate a wider range of OpenMP constructs.
        </p>
            </div>

            {/* Proposed Design Section */}
            <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Proposed Design: <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMPRegion</code> ASR Node
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          To address the identified challenges, I propose the introduction of a new <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMPRegion</code> ASR node, designed to handle all OpenMP constructs in a flexible manner. The proposed node structure is outlined below:
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMPRegion</code> Node Structure
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="plaintext" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {ompRegionStructure}
            </SyntaxHighlighter>
          </div>
        </details>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          The benefits of this approach include:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li><code className="font-semibold text-indigo-600 dark:text-indigo-400">Flexibility:</code> The node supports both loop-based constructs (e.g., <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">parallel do</code>) and non-loop constructs (e.g., <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">sections</code>, <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">tasks</code>) naturally.</li>
          <li><code className="font-semibold text-indigo-600 dark:text-indigo-400">Extensibility:</code> It facilitates the addition of new constructs and clauses by extending enums, ensuring alignment with the OpenMP 6.0 specification.</li>
          <li><code className="font-semibold text-indigo-600 dark:text-indigo-400">Nesting:</code> Nested directives are managed effectively through recursive <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMPRegion</code> nodes, making it suitable for complex scenarios such as <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">teams</code> containing a <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">parallel do</code>.</li>
          <li><code className="font-semibold text-indigo-600 dark:text-indigo-400">Standards Alignment:</code> The design mirrors GFortran’s tree nodes (e.g., <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMP_SECTIONS</code>, <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMP_TASK</code>) and Clang’s AST classes (e.g., <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMPSectionsDirective</code>, <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMPTaskDirective</code>), simplifying integration with the <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">libgomp</code> runtime.</li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          This proposed design, along with prototype minimal reproducible examples (MREs), has been detailed in <a href="https://github.com/lfortran/lfortran/issues/7332" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7332</a>, demonstrating its feasibility for implementation.
        </p>
            </div>

            {/* Exploration Section */}
            <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Exploration of Clang and GFortran’s OpenMP Handling
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          To inform the design of the <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMPRegion</code> node, I conducted an analysis of how <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">Clang</code> and <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">GFortran</code> process OpenMP constructs, focusing on <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">teams</code>, <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">tasks</code>, and <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">sections</code>:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-4 text-lg text-gray-700 dark:text-gray-300">
          <li>
            <code className="font-semibold text-indigo-600 dark:text-indigo-400">GFortran:</code>
            <ul className="list-circle pl-6 mt-2 space-y-2">
              <li><code className="font-medium">Frontend:</code> Directives are parsed into specific tree nodes (e.g., <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMP_TEAMS</code>, <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMP_SECTIONS</code>) with <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMP_CLAUSE</code> nodes to represent associated clauses.</li>
              <li><code className="font-medium">Backend:</code> These nodes are lowered to <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">GIMPLE</code>, where the directive bodies are outlined into functions, and <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">libgomp</code> calls (e.g., <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">GOMP_teams</code>, <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">GOMP_sections_start</code>) are generated.</li>
              <li><code className="font-medium">Example:</code> A <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">sections</code> directive is transformed into an <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMP_SECTIONS</code> node, which is then lowered to a switch statement with <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">GOMP_sections_start</code>, as documented in <a href="https://github.com/lfortran/lfortran/issues/7332" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7332</a>.</li>
            </ul>
          </li>
          <li>
            <code className="font-semibold text-indigo-600 dark:text-indigo-400">Clang:</code>
            <ul className="list-circle pl-6 mt-2 space-y-2">
              <li><code className="font-medium">Frontend:</code> OpenMP directives are represented as AST classes (e.g., <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMPTeamsDirective</code>, <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMPTaskDirective</code>), with separate objects for clauses.</li>
              <li><code className="font-medium">Backend:</code> The AST is lowered to <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">LLVM IR</code>, generating <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">libomp</code> calls (e.g., <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">__kmpc_fork_teams</code>). LFortran, however, uses <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">libgomp</code> due to issues with variadic functions in <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">libomp</code>.</li>
              <li><code className="font-medium">Example:</code> A <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">task</code> directive is represented as an <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMPTaskDirective</code>, which is lowered to <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">__kmpc_omp_task</code> calls.</li>
            </ul>
          </li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          This analysis, documented in <a href="https://github.com/lfortran/lfortran/issues/7332" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7332</a>, highlights the advantages of using specific nodes for each construct, as it enhances type safety and modularity. These findings support the adoption of the <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">OMPRegion</code> approach for LFortran.
        </p>
            </div>

      {/* Issues Opened Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Issues Opened
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          To track progress and facilitate collaboration, I have opened the following issues, each accompanied by minimal reproducible examples (MREs) in C and Fortran, both with and without pragmas, as well as GOMP-based implementations:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li><a href="https://github.com/lfortran/lfortran/issues/7363" className="text-indigo-500 dark:text-indigo-400 hover:underline">[OPENMP] TEAM Construct #7363</a>: Proposes support for the teams construct with clauses such as num_teams and thread_limit.</li>
          <li><a href="https://github.com/lfortran/lfortran/issues/7365" className="text-indigo-500 dark:text-indigo-400 hover:underline">[OPENMP] TASK Construct #7365</a>: Focuses on implementing the task construct to enable dynamic scheduling.</li>
          <li><a href="https://github.com/lfortran/lfortran/issues/7366" className="text-indigo-500 dark:text-indigo-400 hover:underline">[OPENMP] SECTIONS Construct #7366</a>: Addresses the sections construct for concurrent execution of independent code blocks.</li>
          <li><a href="https://github.com/lfortran/lfortran/issues/7332" className="text-indigo-500 dark:text-indigo-400 hover:underline">OpenMP Support Design Discussion #7332</a>: Serves as the central hub for design discussions, MREs, and analysis of Clang and GFortran’s OpenMP implementations.</li>
        </ul>
      </div>

      {/* Proposal: Processing DO CONCURRENT Section */}
      {/* <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Proposal: Processing DO CONCURRENT
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          LFortran currently maps the parallel do construct to a DoConcurrentLoop node in the ASR. However, DO CONCURRENT is a distinct Fortran construct with its own semantics. To extend OpenMP support while maintaining clarity, I propose the following approach for handling DO CONCURRENT loops:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li><code className="font-semibold text-indigo-600 dark:text-indigo-400">Approach:</code> Parse DO CONCURRENT into DoConcurrentLoop nodes, applying the same loop-partitioning logic as parallel do (e.g., distributing iterations using omp_get_thread_num).</li>
          <li><code className="font-semibold text-indigo-600 dark:text-indigo-400">Benefits:</code> This approach reuses the proven backend logic for loop partitioning, keeps OpenMP directives (via OMPRegion) separate from DO CONCURRENT (via DoConcurrentLoop), and allows for independent optimization of DO CONCURRENT constructs.</li>
        </ul>
      </div> */}

      {/* Example Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Example: Task Construct Representations
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          To illustrate the application of the proposed OMPRegion node, this section presents an example of the task construct as detailed in <a href="https://github.com/lfortran/lfortran/issues/7366" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7366</a>. The example is provided in multiple forms: Fortran code with OpenMP pragmas, Fortran code using GOMP runtime calls, the corresponding Clang AST representation, and the proposed LFortran ASR design.
        </p>

        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-8 mb-3">Fortran Code with Pragmas</h3>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Fortran Code with Pragmas
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {fortranCodeWithPragmas}
            </SyntaxHighlighter>
          </div>
        </details>

        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-8 mb-3">Fortran Code without Pragmas (Using GOMP Calls)</h3>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Fortran Code with GOMP Calls
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {fortranCodeWithoutPragmas}
            </SyntaxHighlighter>
          </div>
        </details>

        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-8 mb-3">Clang AST Representation</h3>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Clang AST Representation
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="plaintext" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {clangAst}
            </SyntaxHighlighter>
          </div>
        </details>

        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-8 mb-3">Proposed LFortran ASR Design</h3>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Proposed LFortran ASR Design
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="plaintext" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {lfortranAsrWithPragmas}
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
          In Week 2, I plan to focus on the following tasks:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li>Represent the OMPRegion node in ASR for the sections construct (<a href="https://github.com/lfortran/lfortran/issues/7366" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7366</a>) with good and proper design of implementation in AST visitor such that it can be easily extended to represent other constructs and clauses in ASR easily.</li>
          <li>Validate the MREs against the outputs of GFortran and Clang, using flags such as <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">-fdump-tree-all</code> and <code className="bg-indigo-100 dark:bg-indigo-900/40 px-1 rounded font-mono text-indigo-700 dark:text-indigo-300">-Xclang -ast-dump</code> to ensure correctness.</li>
          {/* <li>Propose a shared partitioning module for DoConcurrentLoop and OMPRegion nodes to streamline loop distribution logic.</li> */}
        </ul>
        {/* <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          The work completed in Week 1 establishes a strong foundation for enhancing LFortran’s OpenMP capabilities. I welcome feedback on the OMPRegion design and the DO CONCURRENT proposal in <a href="https://github.com/lfortran/lfortran/issues/7332" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7332</a>.
        </p> */}
        <p>
          I would like to thank my mentors,{" "}
          <a
            href="https://github.com/certik"
            className="text-indigo-500 dark:text-indigo-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ondrej Certik
          </a>
          {", "}
          <a
            href="https://github.com/Pranavchiku"
            className="text-indigo-500 dark:text-indigo-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pranav Goswami
          </a>
          {" and "}
          <a
            href="https://github.com/gxyd"
            className="text-indigo-500 dark:text-indigo-400 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Gaurav Dhingra
          </a>
          {" for their critical reviews and guidance, which played an important role in improving the design of OMPRegion. I also thank the other contributors of LFortran for their support and help whenever needed."}
        </p>
      </div>
    </div>
  );
}