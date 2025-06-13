import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Week3Post() {
  const originalFortranCode = `subroutine increment_ctr(n, ctr)
    use omp_lib
    implicit none
    integer, intent(in) :: n
    real, intent(out) :: ctr
    
    real :: local_ctr
    
    integer :: i
    
    local_ctr = 1
    !$omp parallel private(i) reduction(*:local_ctr)
    !$omp do
    do i = 1, n
        local_ctr = local_ctr * 1.5
    end do
    !$omp end do
    !$omp end parallel
    
    ctr = ctr + local_ctr
end subroutine
    
program openmp_08
    use omp_lib
    integer, parameter :: n = 10
    real :: ctr
    real :: res = 1.5**10
    
    call omp_set_num_threads(8)
    ctr = 0
    call increment_ctr(n, ctr)
    print *, ctr
    if(abs((ctr - res)) > 0.0002 ) error stop
end program`;

  const loweredFortranCode = `module thread_data_module
  use, intrinsic :: iso_c_binding
  implicit none
  type, bind(C) :: thread_data
    integer(c_int) :: i
    real(c_float) :: local_ctr
    integer(c_int) :: n
  end type thread_data
end module thread_data_module

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
    subroutine GOMP_atomic_start() bind(C, name="GOMP_atomic_start")
    end subroutine
    subroutine GOMP_atomic_end() bind(C, name="GOMP_atomic_end")
    end subroutine
    subroutine GOMP_barrier() bind(C, name="GOMP_barrier")
    end subroutine
    function omp_get_max_threads() bind(C, name="omp_get_max_threads")
      import :: c_int
      integer(c_int) :: omp_get_max_threads
    end function
    function omp_get_thread_num() bind(C, name="omp_get_thread_num")
      import :: c_int
      integer(c_int) :: omp_get_thread_num
    end function
    subroutine omp_set_num_threads(n) bind(C, name="omp_set_num_threads")
      import :: c_int
      integer(c_int), value :: n
    end subroutine
  end interface
end module omp_lib

subroutine lcompilers_parallel_func(data) bind(C)
  use thread_data_module
  use omp_lib
  implicit none
  type(c_ptr), value :: data
  type(thread_data), pointer :: tdata
  integer :: i, n, num_threads, thread_num, start, end, chunk, leftovers, I
  real :: local_ctr

  call c_f_pointer(data, tdata)

  ! Extract variables from thread_data
  i = tdata%i
  local_ctr = tdata%local_ctr
  n = tdata%n

  ! Thread partitioning logic
  num_threads = omp_get_max_threads()
  chunk = (1 * ((n - 1) + 1)) / num_threads
  leftovers = mod(1 * ((n - 1) + 1), num_threads)
  thread_num = omp_get_thread_num()

  start = chunk * thread_num
  if (thread_num < leftovers) then
    start = start + thread_num
  else
    start = start + leftovers
  end if

  end = start + chunk
  if (thread_num < leftovers) then
    end = end + 1
  end if

  ! Initialize local reduction variable
  local_ctr = 1.0

  ! Loop over assigned iterations
  do I = start + 1, end
    i = mod(I, (n - 1) + 1) + 1
    local_ctr = local_ctr * 1.5
  end do

  ! Atomic update for reduction
  call GOMP_atomic_start()
  tdata%local_ctr = tdata%local_ctr * local_ctr
  call GOMP_atomic_end()

  ! Barrier synchronization
  call GOMP_barrier()
end subroutine lcompilers_parallel_func

subroutine increment_ctr(n, ctr)
  use thread_data_module
  use omp_lib
  implicit none
  integer, intent(in) :: n
  real, intent(out) :: ctr

  real :: local_ctr
  integer :: i
  type(thread_data), target :: data
  type(c_ptr) :: tdata

  local_ctr = 1.0

  ! Populate thread_data structure
  data%i = i
  data%local_ctr = local_ctr
  data%n = n

  ! Convert to C pointer
  tdata = c_loc(data)

  ! Call GOMP_parallel to execute the parallel region
  call GOMP_parallel(c_funloc(lcompilers_parallel_func), tdata, 0, 0)

  ! Retrieve updated local_ctr after parallel execution
  local_ctr = data%local_ctr

  ! Update output variable
  ctr = ctr + local_ctr
end subroutine increment_ctr

program openmp_08
  use omp_lib
  implicit none
  integer, parameter :: n = 10
  real :: ctr
  real :: res = 1.5**10

  call omp_set_num_threads(8)
  ctr = 0.0
  call increment_ctr(n, ctr)
  print *, ctr
  if (abs(ctr - res) > 0.0002) then
    error stop
  end if
end program openmp_08`;

  const asrIncrementCtr = `[(Assignment
    (Var 2 local_ctr)
    (Cast
        (IntegerConstant 1 (Integer 4) Decimal)
        IntegerToReal
        (Real 4)
        (RealConstant 1.000000 (Real 4))
    )
    ()
    .false.
)
(Assignment
    (StructInstanceMember (Var 2 data) 2 thread_data_i (Integer 4) ())
    (Var 2 i)
    ()
    .false.
)
(Assignment
    (StructInstanceMember (Var 2 data) 2 thread_data_local_ctr (Real 4) ())
    (Var 2 local_ctr)
    ()
    .false.
)
(Assignment
    (StructInstanceMember (Var 2 data) 2 thread_data_n (Integer 4) ())
    (Var 2 n)
    ()
    .false.
)
(Assignment
    (Var 2 tdata)
    (PointerToCPtr
        (GetPointer (Var 2 data) (Pointer (StructType [] [] .true. 2 thread_data)))
        (CPtr)
        ()
    )
    ()
    .false.
)
(SubroutineCall
    2 gomp_parallel
    ()
    [((PointerToCPtr
        (GetPointer (Var 2 lcompilers_parallel_func)
            (Pointer (FunctionType [(CPtr)] () BindC Interface () .false. .false. .false. .false. .false. [] .false.)))
        (CPtr)
        ()
    ))
    ((Var 2 tdata))
    ((IntegerConstant 0 (Integer 4) Decimal))
    ((IntegerConstant 0 (Integer 4) Decimal))]
    ()
)
(Assignment
    (Var 2 local_ctr)
    (StructInstanceMember (Var 2 data) 2 thread_data_local_ctr (Real 4) ())
    ()
    .false.
)
(Assignment
    (Var 2 ctr)
    (RealBinOp (Var 2 ctr) Add (Var 2 local_ctr) (Real 4) ())
    ()
    .false.
)]`;

  const asrParallelFunc = `[(CPtrToPointer
    (Var 30 data)
    (Var 30 tdata)
    ()
    ()
)
(Assignment
    (Var 30 i)
    (StructInstanceMember (Var 30 tdata) 30 thread_data_i (Integer 4) ())
    ()
    .false.
)
(Assignment
    (Var 30 local_ctr)
    (StructInstanceMember (Var 30 tdata) 30 thread_data_local_ctr (Real 4) ())
    ()
    .false.
)
(Assignment
    (Var 30 n)
    (StructInstanceMember (Var 30 tdata) 30 thread_data_n (Integer 4) ())
    ()
    .false.
)
(Assignment
    (Var 30 num_threads)
    (FunctionCall 30 omp_get_max_threads 30 omp_get_max_threads [] (Integer 4) () ())
    ()
    .false.
)
(Assignment
    (Var 30 chunk)
    (IntegerBinOp
        (IntegerBinOp
            (IntegerConstant 1 (Integer 4) Decimal)
            Mul
            (IntegerBinOp
                (IntegerBinOp (Var 30 n) Sub (IntegerConstant 1 (Integer 4) Decimal) (Integer 4) ())
                Add
                (IntegerConstant 1 (Integer 4) Decimal)
                (Integer 4)
                ()
            )
            (Integer 4)
            ()
        )
        Div
        (Var 30 num_threads)
        (Integer 4)
        ()
    )
    ()
    .false.
)
(Assignment
    (Var 30 leftovers)
    (IntrinsicElementalFunction
        Mod
        [(IntegerBinOp
            (IntegerConstant 1 (Integer 4) Decimal)
            Mul
            (IntegerBinOp
                (IntegerBinOp (Var 30 n) Sub (IntegerConstant 1 (Integer 4) Decimal) (Integer 4) ())
                Add
                (IntegerConstant 1 (Integer 4) Decimal)
                (Integer 4)
                ()
            )
            (Integer 4)
            ())
        (Var 30 num_threads)]
        0
        (Integer 4)
        ()
    )
    ()
    .false.
)
(Assignment
    (Var 30 thread_num)
    (FunctionCall 30 omp_get_thread_num 30 omp_get_thread_num [] (Integer 4) () ())
    ()
    .false.
)
(Assignment
    (Var 30 start)
    (IntegerBinOp (Var 30 chunk) Mul (Var 30 thread_num) (Integer 4) ())
    ()
    .false.
)
(If
    (IntegerCompare (Var 30 thread_num) Lt (Var 30 leftovers) (Logical 4) ())
    [(Assignment
        (Var 30 start)
        (IntegerBinOp (Var 30 start) Add (Var 30 thread_num) (Integer 4) ())
        ()
        .false.
    )]
    [(Assignment
        (Var 30 start)
        (IntegerBinOp (Var 30 start) Add (Var 30 leftovers) (Integer 4) ())
        ()
        .false.
    )]
)
(Assignment
    (Var 30 end)
    (IntegerBinOp (Var 30 start) Add (Var 30 chunk) (Integer 4) ())
    ()
    .false.
)
(If
    (IntegerCompare (Var 30 thread_num) Lt (Var 30 leftovers) (Logical 4) ())
    [(Assignment
        (Var 30 end)
        (IntegerBinOp (Var 30 end) Add (IntegerConstant 1 (Integer 4) Decimal) (Integer 4) ())
        ()
        .false.
    )]
    []
)
(Assignment
    (Var 30 local_ctr)
    (RealConstant 1.000000 (Real 4))
    ()
    .false.
)
(DoLoop
    ()
    ((Var 30 I)
    (IntegerBinOp (Var 30 start) Add (IntegerConstant 1 (Integer 4) Decimal) (Integer 4) ())
    (Var 30 end)
    ())
    [(Assignment
        (Var 30 i)
        (IntegerBinOp
            (IntrinsicElementalFunction
                Mod
                [(Var 30 I)
                (IntegerBinOp
                    (IntegerBinOp (Var 30 n) Sub (IntegerConstant 1 (Integer 4) Decimal) (Integer 4) ())
                    Add
                    (IntegerConstant 1 (Integer 4) Decimal)
                    (Integer 4)
                    ()
                )]
                0
                (Integer 4)
                ()
            )
            Add
            (IntegerConstant 1 (Integer 4) Decimal)
            (Integer 4)
            ()
        )
        ()
        .false.
    )
    (Assignment
        (Var 30 local_ctr)
        (RealBinOp (Var 30 local_ctr) Mul (RealConstant 1.500000 (Real 4)) (Real 4) ())
        ()
        .false.
    )]
    []
)
(SubroutineCall 30 gomp_atomic_start () [] ())
(Assignment
    (StructInstanceMember (Var 30 tdata) 30 thread_data_local_ctr (Real 4) ())
    (RealBinOp
        (StructInstanceMember (Var 30 tdata) 30 thread_data_local_ctr (Real 4) ())
        Mul
        (Var 30 local_ctr)
        (Real 4)
        ()
    )
    ()
    .false.
)
(SubroutineCall 30 gomp_atomic_end () [] ())
(SubroutineCall 30 gomp_barrier () [] ())]`;

  const asrMainProgram = `[(SubroutineCall
    27 omp_set_num_threads
    ()
    [((IntegerConstant 8 (Integer 4) Decimal))]
    ()
)
(Assignment
    (Var 27 ctr)
    (Cast
        (IntegerConstant 0 (Integer 4) Decimal)
        IntegerToReal
        (Real 4)
        (RealConstant 0.000000 (Real 4))
    )
    ()
    .false.
)
(SubroutineCall
    1 increment_ctr
    ()
    [((Var 27 n)) ((Var 27 ctr))]
    ()
)
(Print
    (StringFormat () [(Var 27 ctr)] FormatFortran (String 1 () ExpressionLength CString) ())
)
(If
    (RealCompare
        (IntrinsicElementalFunction
            Abs
            [(RealBinOp (Var 27 ctr) Sub (Var 27 res) (Real 4) ())]
            0
            (Real 4)
            ()
        )
        Gt
        (RealConstant 0.000200 (Real 4))
        (Logical 4)
        ()
    )
    [(ErrorStop ())]
    []
)]`;

  return (
    <div className="post-content space-y-8">
      {/* Recap and Motivation Section */}
      <div className="relative">
        {/* <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400 mb-6 leading-tight">
          GSoC 2025: Week 3 Contribution to OpenMP Support in LFortran
        </h1> */}
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Building on the progress made in Week 2, where I implemented the foundational structure for the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> ASR node and adopted a stack-based approach to handle nested OpenMP constructs, Week 3 focused on integrating the existing <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> logic into this new design. In my previous blog post, I outlined a plan to extend the OpenMP pass to visit the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node and support the <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct. However, I decided to first shift the existing <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> logic to use the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node, as this would lay the groundwork for implementing all other constructs, including <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code>. This week, I successfully completed this transition through PR <a href="https://github.com/lfortran/lfortran/pull/7593" className="text-indigo-500 dark:text-indigo-400 hover:underline">#7593</a>, dedicating approximately 32 hours to ensure no regression in existing test cases while extending the OpenMP pass to handle <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">do</code> constructs in both nested and combined forms.
        </p>
      </div>

      {/* Rationale for Shifting Parallel Do Logic Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Choice of Shifting Parallel Do Logic First
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Initially, my plan was to implement the <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct in OpenMp pass, as it represents a non-loop-based paradigm distinct from the existing <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> implementation. However, upon further consideration, I realized that implementing <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> would anyway require support for the standalone <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> construct, which is a fundamental component of many OpenMP directives, including <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code>. So, rather than diving straight into <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct I chose to first shift the existing <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> logic from converting directly to a <code className="font-semibold text-indigo-600 dark:text-indigo-400">DoConcurrentLoop</code> node to the more adaptable <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node and then lower down this new ASR node in the OpenMp pass.
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          This shift was crucial for several reasons. First, it ensures a unified representation of all OpenMP constructs under the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node, facilitating future extensions for constructs like <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">teams</code>. Second, I needed to guarantee that all existing OpenMP test cases, which currently compile successfully, would not break during this transition. I anticipated that this would be a longer PR, as it required updating all reference test cases to reflect the new ASR node and ensuring that the extended OpenMP pass could handle the updated structure without regression.
        </p>
      </div>

      {/* Implementation Details and Results Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Implementation Details and Results
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          In PR <a href="https://github.com/lfortran/lfortran/pull/7593" className="text-indigo-500 dark:text-indigo-400 hover:underline">#7593</a>, I made significant changes to de-couple the <code className="font-semibold text-indigo-600 dark:text-indigo-400">DoConcurrentLoop</code> logic from <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMP Pragmas</code>. The key changes included:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li>Removed the older logic in the AST -{">"} ASR conversion that directly converted <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> pragmas to a <code className="font-semibold text-indigo-600 dark:text-indigo-400">DoConcurrentLoop</code> node, replacing it with a conversion to an <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node.</li>
          <li>Extended the OpenMP pass to visit the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node, handling <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> constructs in a manner equivalent to the previous <code className="font-semibold text-indigo-600 dark:text-indigo-400">DoConcurrentLoop</code> approach with moderate changes.</li>
          <li>Updated all ASR of all existing OpenMP test cases to reflect the new changes, verifying that each test case compiles successfully with the extended OpenMP pass, thereby ensuring no regression in existing functionality.</li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          The results of this implementation are significant. First, the transition to the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node allows LFortran to handle standalone <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> constructs, as well as <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> in both nested and combined forms, without disrupting existing test cases. For example, a standalone <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> region can now be represented and executed correctly, also nested constructs like <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> containing a <code className="font-semibold text-indigo-600 dark:text-indigo-400">do</code> loop, or combined constructs like <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> are too handled. Additionally, intermediate statements within parallel regions, which previously posed challenges (e.g., as seen in <code className="font-semibold text-indigo-600 dark:text-indigo-400">openmp_06.f90</code>), are now handled seamlessly, addressing issues like those in <a href="https://github.com/lfortran/lfortran/issues/4147" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #4147</a>. This PR also lays the groundwork for implementing other constructs like <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code>, for which placeholder functions have been added to demonstrate the intended approach.
        </p>
      </div>

      {/* Example Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Example: Parallel Do Construct with Reduction
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          To illustrate the new <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> implementation for the <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> construct, consider the following example program, <code className="font-semibold text-indigo-600 dark:text-indigo-400">openmp_08.f90</code>, which uses a <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> construct with a <code className="font-semibold text-indigo-600 dark:text-indigo-400">reduction</code> clause:
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Original Fortran Code
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {originalFortranCode}
            </SyntaxHighlighter>
          </div>
        </details>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          The OpenMP pass now converts this <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> construct into an <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node and lowers it to use GOMP runtime calls. The equivalent lowered Fortran code, which explicitly uses GOMP calls to achieve the same parallelism, is shown below:
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Lowered Fortran Code Using GOMP Calls
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {loweredFortranCode}
            </SyntaxHighlighter>
          </div>
        </details>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          In the lowered code, the <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> construct is replaced with explicit GOMP runtime calls. A <code className="font-semibold text-indigo-600 dark:text-indigo-400">thread_data</code> structure is used to pass variables between the main function and the parallel function, ensuring thread-safe access. The <code className="font-semibold text-indigo-600 dark:text-indigo-400">GOMP_parallel</code> call invokes the parallel region by executing <code className="font-semibold text-indigo-600 dark:text-indigo-400">lcompilers_parallel_func</code>, which handles thread partitioning by calculating each thread’s <code className="font-semibold text-indigo-600 dark:text-indigo-400">start</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">end</code> indices based on the number of threads and loop iterations. The <code className="font-semibold text-indigo-600 dark:text-indigo-400">reduction(*:local_ctr)</code> clause is implemented using <code className="font-semibold text-indigo-600 dark:text-indigo-400">GOMP_atomic_start</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">GOMP_atomic_end</code> to atomically update the shared <code className="font-semibold text-indigo-600 dark:text-indigo-400">local_ctr</code> variable, and a <code className="font-semibold text-indigo-600 dark:text-indigo-400">GOMP_barrier</code> ensures all threads synchronize before proceeding.
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          Below are the relevant portions of the ASR generated by OpenMp pass, for the <code className="font-semibold text-indigo-600 dark:text-indigo-400">increment_ctr</code> subroutine, the parallel function <code className="font-semibold text-indigo-600 dark:text-indigo-400">lcompilers_parallel_func</code>, and the main program <code className="font-semibold text-indigo-600 dark:text-indigo-400">openmp_08</code>:
        </p>
        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-8 mb-3">ASR for <code className="font-semibold text-indigo-600 dark:text-indigo-400">increment_ctr</code> Subroutine</h3>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View ASR for <code className="font-semibold text-indigo-600 dark:text-indigo-400">increment_ctr</code>
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="plaintext" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {asrIncrementCtr}
            </SyntaxHighlighter>
          </div>
        </details>
        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-8 mb-3">ASR for <code className="font-semibold text-indigo-600 dark:text-indigo-400">lcompilers_parallel_func</code></h3>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View ASR for <code className="font-semibold text-indigo-600 dark:text-indigo-400">lcompilers_parallel_func</code>
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="plaintext" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {asrParallelFunc}
            </SyntaxHighlighter>
          </div>
        </details>
        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-8 mb-3">ASR for <code className="font-semibold text-indigo-600 dark:text-indigo-400">openmp_08</code> Program</h3>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View ASR for <code className="font-semibold text-indigo-600 dark:text-indigo-400">openmp_08</code>
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="plaintext" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {asrMainProgram}
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
          In Week 4, I plan to focus on the following tasks:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
            <li>While completing this PR I came across various cases where some clauses didn't work in parallel construct, hence it seems that we need to handle the clauses for each, nested as well as combined constructs, for which I will further investigate, report and fix MREs for the same</li>
          <li>Implement the <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct using the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node, lowering it to <code className="font-semibold text-indigo-600 dark:text-indigo-400">GOMP_sections_start</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">GOMP_sections_end</code> calls.</li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          I would like to thank my mentors, <a href="https://github.com/certik" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Ondrej Certik</a>, <a href="https://github.com/Pranavchiku" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Pranav Goswami</a>, and <a href="https://github.com/gxyd" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Gaurav Dhingra</a>, for their critical reviews and guidance, which were instrumental in ensuring the success of this PR. I also thank the other contributors of LFortran for their support and help whenever needed.
        </p>
      </div>
    </div>
  );
}