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

  return (
    <div className="post-content space-y-8">
      {/* Introduction Section with a Gradient Header */}
      <div className="relative">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400 mb-6 leading-tight">
          GSoC 2025 Week 1: Kickoff Contributions to OpenMP Support in LFortran 🚀
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Hey there! I’m <span className="font-semibold text-indigo-600 dark:text-indigo-400">Aditya Trivedi</span>, a pre-final year B.Tech student at IIT Jodhpur, and I’m thrilled to dive into my Google Summer of Code (GSoC) 2025 journey with <span className="font-medium text-purple-600 dark:text-purple-400">LFortran</span>! My mission? To supercharge OpenMP support in LFortran, a cutting-edge Fortran compiler, by adding advanced parallel programming constructs like <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">teams</code>, <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">tasks</code>, and <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">sections</code>. Let’s break down my Week 1 progress—covering the goals, current setup, challenges, a fresh design proposal, and some insights from digging into Clang and GFortran. Buckle up! 🚀
        </p>
      </div>

      {/* Objective Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          🎯 The Mission: What We’re Aiming For
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          The big goal here is to level up LFortran’s OpenMP capabilities. Right now, it supports the <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">parallel do</code> construct, but we’re taking it further by adding <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">teams</code>, <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">tasks</code>, <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">sections</code>, <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">single</code>, and <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">simd</code>—all aligned with the OpenMP 6.0 spec. This upgrade will let LFortran users tackle complex parallel workloads with hierarchical parallelism and dynamic task scheduling, making it a go-to tool for high-performance computing (HPC) enthusiasts. 💻
        </p>
      </div>

      {/* Current Design Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          🛠️ The Current Setup: Where We Stand
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          LFortran’s got a solid foundation with the <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">parallel do</code> construct, supporting clauses like <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">private</code>, <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">shared</code>, <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">reduction</code>, and <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">collapse</code>. Here’s the workflow:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li><span className="font-semibold text-indigo-600 dark:text-indigo-400">Parsing:</span> The <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">visit_Pragma</code> function in <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">ast_body_visitor.cpp</code> spots <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">!$omp parallel do</code> and its clauses, turning them into a <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">DoConcurrentLoop</code> node in the Abstract Semantic Representation (ASR).</li>
          <li><span className="font-semibold text-indigo-600 dark:text-indigo-400">Semantic Analysis:</span> Checks loop variables and clauses for correct types and declarations.</li>
          <li><span className="font-semibold text-indigo-600 dark:text-indigo-400">Backend (OpenMP Pass):</span> The <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">openmp.cpp</code> pass outlines the loop body into a function, splits iterations using <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">omp_get_thread_num</code> and <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">omp_get_num_threads</code>, and generates <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">GOMP_parallel</code> calls to the GNU OpenMP library (<code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">libgomp</code>).</li>
          <li><span className="font-semibold text-indigo-600 dark:text-indigo-400">Example:</span> A <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">parallel do</code> loop becomes a <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">DoConcurrentLoop</code> node, lowered to a function with thread partitioning—check out <a href="https://github.com/lfortran/lfortran/issues/3777#issuecomment-2104814180" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #3777</a> for details.</li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          This setup works great for loop-based parallelism, but it’s got limits when we try to add other OpenMP constructs. Let’s dive into those challenges next! 🔍
        </p>
      </div>

      {/* Challenges Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          ⚠️ Challenges: What’s Holding Us Back?
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          The <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">DoConcurrentLoop</code> approach hits some roadblocks when we try to expand OpenMP support. Here’s the breakdown:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li><span className="font-semibold text-indigo-600 dark:text-indigo-400">Non-Loop Constructs:</span> Stuff like <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">sections</code> (independent code blocks) and <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">tasks</code> (dynamic scheduling) doesn’t fit the loop-focused <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">DoConcurrentLoop</code> node—trying to make it work feels like forcing a square peg into a round hole. 🟦🟥</li>
          <li><span className="font-semibold text-indigo-600 dark:text-indigo-400">Clause Support:</span> New clauses like <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">num_teams</code> for <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">teams</code> or <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">depend</code> for <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">tasks</code> are tough to integrate into the current node structure.</li>
          <li><span className="font-semibold text-indigo-600 dark:text-indigo-400">Nesting:</span> Handling nested constructs—like a <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">parallel do</code> inside <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">teams</code>—gets messy since <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">DoConcurrentLoop</code> expects a single loop level.</li>
          <li><span className="font-semibold text-indigo-600 dark:text-indigo-400">Maintainability:</span> Shoehorning diverse constructs into a loop-based node risks turning the design into a tangled mess, making it harder to maintain as OpenMP evolves. 🕸️</li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          These hurdles got me thinking—it’s time for a fresh approach to handle OpenMP like a pro. Let’s talk about my proposed solution! 💡
        </p>
      </div>

      {/* Proposed Design Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          🌟 The Big Idea: Introducing the <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">OMPRegion</code> ASR Node
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          To tackle these challenges, I’m proposing a shiny new <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">OMPRegion</code> ASR node—a flexible, all-purpose solution for OpenMP constructs. Check out the structure below:
        </p>
        <div className="mt-4">
          <SyntaxHighlighter language="plaintext" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
            {`stmt
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

  ...`}
          </SyntaxHighlighter>
        </div>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Why It’s Awesome:</span>
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li><span className="font-semibold text-indigo-600 dark:text-indigo-400">Flexibility:</span> It handles both loop-based stuff like <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">parallel do</code> and non-loop constructs like <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">sections</code> and <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">tasks</code> with ease. 🛠️</li>
          <li><span className="font-semibold text-indigo-600 dark:text-indigo-400">Extensibility:</span> Adding new constructs and clauses is a breeze—just extend <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">omp_region_type</code> and <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">omp_clause</code>. It’s ready for OpenMP 6.0 and beyond! 🚀</li>
          <li><span className="font-semibold text-indigo-600 dark:text-indigo-400">Nesting:</span> Nested directives? No problem! Recursive <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">OMPRegion</code> nodes in the body handle them like a champ. 🌳</li>
          <li><span className="font-semibold text-indigo-600 dark:text-indigo-400">Standards Alignment:</span> It mirrors GFortran’s tree nodes (e.g., <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">OMP_SECTIONS</code>) and Clang’s AST classes (e.g., <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">OMPSectionsDirective</code>), making <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">libgomp</code> integration smooth. 🔄</li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          The <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">OMPRegion</code> node will be processed in a new OpenMP pass, mapping each <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">region</code> type to the right GOMP calls—like <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">GOMP_teams</code> or <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">GOMP_task</code>. It’s a game-changer for LFortran’s OpenMP support! ⚡
        </p>
      </div>

      {/* Exploration Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          🔍 Digging Deep: Lessons from Clang and GFortran
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          To shape this design, I took a deep dive into how Clang and GFortran handle OpenMP constructs. Here’s what I found:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-4 text-lg text-gray-700 dark:text-gray-300">
          <li>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">GFortran (GCC):</span>
            <ul className="list-circle pl-6 mt-2 space-y-2">
              <li><span className="font-medium">Frontend:</span> Parses directives into specific tree nodes (e.g., <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">OMP_TEAMS</code>, <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">OMP_SECTIONS</code>) with <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">OMP_CLAUSE</code> nodes for clauses.</li>
              <li><span className="font-medium">Middle-End:</span> Lowers to GIMPLE, outlining bodies into functions and generating <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">libgomp</code> calls (e.g., <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">GOMP_sections_start</code>).</li>
              <li><span className="font-medium">Backend:</span> Produces assembly with runtime calls for thread management.</li>
              <li><span className="font-medium">Tools:</span> Used <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">gfortran -fdump-tree-all</code> to peek at the tree nodes. 🔎</li>
            </ul>
          </li>
          <li>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">Clang (LLVM):</span>
            <ul className="list-circle pl-6 mt-2 space-y-2">
              <li><span className="font-medium">Frontend:</span> Creates AST classes (e.g., <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">OMPTeamsDirective</code>, <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">OMPTaskDirective</code>) with separate clause objects.</li>
              <li><span className="font-medium">Code Generation:</span> Outlines bodies and generates LLVM IR with <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">libomp</code> calls (e.g., <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">__kmpc_fork_teams</code>). LFortran uses <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">libgomp</code> instead due to variadic function quirks.</li>
              <li><span className="font-medium">Tools:</span> Used <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">clang -fopenmp -Xclang -ast-dump</code> to analyze ASTs and <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">-emit-llvm</code> for IR.</li>
            </ul>
          </li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          Both compilers use specific nodes per directive, which inspired the flexible <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">OMPRegion</code> design—a perfect fit for LFortran’s evolving OpenMP needs. I’m hashing out the details in <a href="https://github.com/lfortran/lfortran/issues/7332" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7332</a>. 🗣️
        </p>
      </div>

      {/* Example Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          💻 Let’s See It in Action: Tasks Construct Breakdown
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          To show how this all comes together, let’s look at the <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">Tasks</code> construct MRE from <a href="https://github.com/lfortran/lfortran/issues/7366" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7366</a>. I’ll break it down with and without pragmas—plus some cool visuals to make it pop! 🎨
        </p>

        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-8 mb-3">With Pragmas (Fortran Code)</h3>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
          <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
            {fortranCodeWithPragmas}
          </SyntaxHighlighter>
        </div>

        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-8 mb-3">Clang AST (Simplified, from <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">flang-new -fopenmp -Xclang -ast-dump</code>)</h3>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
          <SyntaxHighlighter language="plaintext" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
            {clangAst}
          </SyntaxHighlighter>
        </div>

        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-8 mb-3">Proposed LFortran ASR</h3>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
          <SyntaxHighlighter language="plaintext" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
            {lfortranAsrWithPragmas}
          </SyntaxHighlighter>
        </div>

        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-8 mb-3">Without Pragmas (Fortran with GOMP Calls)</h3>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
          <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
            {fortranCodeWithoutPragmas}
          </SyntaxHighlighter>
        </div>

        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-8 mb-3">Proposed LFortran ASR</h3>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Same as above, since the <code className="bg-indigo-100 dark:bg-indigo-900 px-1 py-0.5 rounded">OMPRegion</code> node captures the directive’s intent, which gets lowered to GOMP calls in the backend. Pretty neat, right? 😎
        </p>
      </div>

      {/* Progress and Issues Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          📈 Progress So Far & Issues to Tackle
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          To keep things on track, I’ve opened a few issues to guide the work:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li><a href="https://github.com/lfortran/lfortran/issues/7363" className="text-indigo-500 dark:text-indigo-400 hover:underline">[OPENMP] TEAM Construct [#7363]</a> 🏟️</li>
          <li><a href="https://github.com/lfortran/lfortran/issues/7365" className="text-indigo-500 dark:text-indigo-400 hover:underline">[OPENMP] TASK Construct [#7365]</a> 📋</li>
          <li><a href="https://github.com/lfortran/lfortran/issues/7366" className="text-indigo-500 dark:text-indigo-400 hover:underline">[OPENMP] SECTIONS Construct [#7366]</a> 🧩</li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          The main convo is happening in <a href="https://github.com/lfortran/lfortran/issues/7332" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7332</a>, where I’ve shared MREs (C and Fortran, with and without pragmas) and analyzed how Clang and GFortran handle OpenMP. These issues come with detailed MREs and GOMP-based implementations to steer the design in the right direction. Let’s keep the momentum going! 💪
        </p>
      </div>
    </div>
  );
}