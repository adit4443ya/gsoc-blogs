import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Week8Post() {
  const scheduleMre1 = `program openmp_63
    use omp_lib
    implicit none
    integer, parameter :: n = 100
    integer, parameter :: max_threads = 8
    integer :: i, tid, nthreads
    integer :: thread_iterations(1:max_threads) = 0
    integer :: thread_first(1:max_threads) = 1000
    integer :: thread_last(1:max_threads) = -1
    integer :: expected_chunk_size
    logical :: test_passed = .true.

    call omp_set_num_threads(4)
    nthreads=0

    !$omp parallel private(tid)
    !$omp single
    nthreads = omp_get_num_threads()
    !$omp end single
    !$omp end parallel
    print *, "Testing STATIC schedule with", nthreads, "threads"

    !$omp parallel do schedule(static) private(tid)
    do i = 1, n
        tid = omp_get_thread_num() + 1
        !$omp critical
        thread_iterations(tid) = thread_iterations(tid) + 1
        if (i < thread_first(tid)) thread_first(tid) = i
        if (i > thread_last(tid)) thread_last(tid) = i
        !$omp end critical
    end do
    !$omp end parallel do

    print*, thread_first(1:nthreads)
    print*, thread_last(1:nthreads)
    print*, thread_iterations(1:nthreads)

    print *, "=== STATIC Schedule Results ==="
    expected_chunk_size = (n + nthreads - 1) / nthreads

    do i = 1, nthreads
        print '(A,I1,A,I3,A,I3,A,I3)', &
            "Thread ", i, ": iterations=", thread_iterations(i), &
            ", first=", thread_first(i), ", last=", thread_last(i)

        if (thread_iterations(i) > 0) then
            if (thread_last(i) - thread_first(i) + 1 /= thread_iterations(i)) then
                print *, "ERROR: Thread", i, "did not get contiguous iterations!"
                test_passed = .false.
            end if
            if (abs(thread_iterations(i) - expected_chunk_size) > 1) then
                print *, "ERROR: Thread", i, "chunk size deviates too much!"
                test_passed = .false.
            end if
        end if
    end do

    if (.not. test_passed) then
        error stop "STATIC schedule test FAILED!"
    end if
    print *, "STATIC schedule test PASSED!"
end program openmp_63`;

  const scheduleMre2 = `program openmp_64
    use omp_lib
    implicit none
    integer, parameter :: n = 100
    integer :: i, tid, j
    real :: delay
    integer :: thread_iterations(0:7) = 0
    integer :: iteration_order(n)
    integer :: order_counter
    integer :: consecutive_count, max_consecutive
    real :: work_array(n)

    call omp_set_num_threads(4)
    order_counter = 0

    print *, "=== DYNAMIC Schedule Test ==="

    !$omp parallel do schedule(dynamic, 1) private(tid, delay)
    do i = 1, n
        tid = omp_get_thread_num()

        if (mod(i, 10) == 0) then
            delay = 0.0
            do j = 1, 1000
                delay = delay + sin(real(j))
            end do
            work_array(i) = delay
        end if

        !$omp critical
        thread_iterations(tid) = thread_iterations(tid) + 1
        order_counter = order_counter + 1
        iteration_order(order_counter) = tid
        !$omp end critical
    end do
    !$omp end parallel do

    print *, "Thread iteration counts:"
    do i = 0, omp_get_max_threads()-1
        print *, "Thread", i, ":", thread_iterations(i), "iterations"
    end do

    max_consecutive = 0
    consecutive_count = 1

    do i = 2, n
        if (iteration_order(i) == iteration_order(i-1)) then
            consecutive_count = consecutive_count + 1
        else
            if (consecutive_count > max_consecutive) then
                max_consecutive = consecutive_count
            end if
            consecutive_count = 1
        end if
    end do

    print *, "Maximum consecutive iterations by same thread:", max_consecutive

    if (max_consecutive > 10) then
        print *, "WARNING: Dynamic schedule showing large consecutive blocks"
    end if

    print *, "DYNAMIC schedule test completed"
end program openmp_64`;

  const scheduleMre3 = `program openmp_65
    use omp_lib
    implicit none
    integer, parameter :: n = 1000
    integer :: i, tid, j
    integer :: chunk_count
    integer :: chunk_size_array(100) = 0
    integer :: chunk_thread(100) = -1
    integer :: current_pos
    integer :: thread_iterations(0:7) = 0
    logical :: test_passed = .true.
    logical :: decreasing_trend = .true.
    integer :: last_thread = -1
    integer :: current_chunk_size
    integer :: iterations_done
    call omp_set_num_threads(4)

    print *, "=== GUIDED Schedule Test ==="
    print *, "Iterations:", n, "Threads:", omp_get_max_threads()
    chunk_count=0
    current_chunk_size =0
    iterations_done = 0
    current_pos = 1
    !$omp parallel private(tid)
    !$omp do schedule(guided)
    do i = 1, n
        tid = omp_get_thread_num()

        !$omp critical
        if (i == current_pos) then
            chunk_count = chunk_count + 1
            chunk_thread(chunk_count) = tid
            do j = i, n
                if (j == n) then
                    chunk_size_array(chunk_count) = j - i + 1
                    current_pos = n + 1
                    exit
                end if
            end do
        end if
        thread_iterations(tid) = thread_iterations(tid) + 1
        !$omp end critical
    end do
    !$omp end do
    !$omp end parallel

    chunk_count = 0
    current_pos = 1

    !$omp parallel private(tid, i)
    tid = omp_get_thread_num()
    if (tid == 0) then        
        do while (iterations_done < n)
            chunk_count = chunk_count + 1
            current_chunk_size = max(1, (n - iterations_done) / (2 * omp_get_num_threads()))
            chunk_size_array(chunk_count) = current_chunk_size
            iterations_done = iterations_done + current_chunk_size
        end do
    end if
    !$omp end parallel

    print *, "Expected guided chunk sizes (first 10):"
    do i = 1, min(10, chunk_count)
        print *,"Chunk ", i, ": size = ", chunk_size_array(i)
    end do

    do i = 2, min(chunk_count-1, 20)
        if (chunk_size_array(i) > chunk_size_array(i-1) * 1.5) then
            decreasing_trend = .false.
        end if
    end do

    if (chunk_count > 5) then
        if (chunk_size_array(1) < chunk_size_array(chunk_count-2) * 2) then
            print *, "ERROR: Guided schedule not showing expected decreasing chunk sizes!"
            test_passed = .false.
        end if
    end if

    if (.not. test_passed) then
        error stop "GUIDED schedule test FAILED!"
    end if

    if (.not. decreasing_trend) then
        print *, "WARNING: Guided chunks did not show clear decreasing trend"
    else
        print *, "Guided schedule showing expected decreasing chunk pattern"
    end if

    print *, "GUIDED schedule test completed"
end program openmp_65`;

  const atomicMre1 = `program openmp_66
  implicit none
  integer, parameter :: N = 100
  integer :: i, sum_expected, sum_actual

  sum_actual = 0
  sum_expected = (N*(N+1)) / 2

  !$omp parallel do private(i)
  do i = 1, N
    !$omp atomic
    sum_actual = sum_actual + i
    !$omp end atomic
  end do
  !$omp end parallel do

  if (sum_actual /= sum_expected) then
    print *, 'Error: Incorrect result from atomic addition.'
    print *, 'Expected:', sum_expected, ' Got:', sum_actual
    error stop
  else
    print *, 'Test passed: atomic addition is correct. Sum =', sum_actual
  end if
end program openmp_66`;

  const scheduleMre4 = `program openmp_67
    use omp_lib
    implicit none
    integer, parameter :: n = 10000
    integer :: i, j
    real :: static_time, dynamic_time, guided_time
    double precision :: start_time
    real :: a(n), b(n), c(n)

    call omp_set_num_threads(4)

    print *, "=== Schedule Comparison Test ==="
    print *, "Comparing performance of different schedules"
    print *, "Array size:", n, "Threads:", omp_get_max_threads()

    do i = 1, n
        b(i) = real(i)
        c(i) = real(n - i + 1)
    end do

    start_time = omp_get_wtime()
    !$omp parallel do schedule(static)
    do i = 1, n
        a(i) = sqrt(b(i)) + log(abs(c(i)) + 1.0)
    end do
    !$omp end parallel do
    static_time = omp_get_wtime() - start_time

    start_time = omp_get_wtime()
    !$omp parallel do schedule(dynamic)
    do i = 1, n
        a(i) = sqrt(b(i)) + log(abs(c(i)) + 1.0)
    end do
    !$omp end parallel do
    dynamic_time = omp_get_wtime() - start_time

    start_time = omp_get_wtime()
    !$omp parallel do schedule(guided)
    do i = 1, n
        a(i) = sqrt(b(i)) + log(abs(c(i)) + 1.0)
    end do
    !$omp end parallel do
    guided_time = omp_get_wtime() - start_time

    print '(A,F8.6,A)', "STATIC  time: ", static_time, " seconds"
    print '(A,F8.6,A)', "DYNAMIC time: ", dynamic_time, " seconds"
    print '(A,F8.6,A)', "GUIDED  time: ", guided_time, " seconds"

    if (static_time < dynamic_time * 0.9 .and. static_time < guided_time * 0.9) then
        print *, "✓ STATIC is fastest for uniform workload"
    else if (dynamic_time < static_time * 0.9) then
        print *, "! DYNAMIC is fastest"
    else if (guided_time < static_time * 0.9) then
        print *, "! GUIDED is fastest"
    else
        print *, "- All schedules perform similarly"
    end if

    do i = 1, n
        if (mod(i, 10) == 0) then
            b(i) = b(i) * 1000.0
        end if
    end do

    start_time = omp_get_wtime()
    !$omp parallel do schedule(static)
    do i = 1, n
        if (mod(i, 10) == 0) then
            a(i) = 0.0
            do j = 1, 100
                a(i) = a(i) + sqrt(b(i)) + log(abs(c(i)) + 1.0)
            end do
        else
            a(i) = sqrt(b(i)) + log(abs(c(i)) + 1.0)
        end if
    end do
    !$omp end parallel do
    static_time = omp_get_wtime() - start_time

    start_time = omp_get_wtime()
    !$omp parallel do schedule(dynamic)
    do i = 1, n
        if (mod(i, 10) == 0) then
            a(i) = 0.0
            do j = 1, 100
                a(i) = a(i) + sqrt(b(i)) + log(abs(c(i)) + 1.0)
            end do
        else
            a(i) = sqrt(b(i)) + log(abs(c(i)) + 1.0)
        end if
    end do
    !$omp end parallel do
    dynamic_time = omp_get_wtime() - start_time

    print *, ""
    print *, "Non-uniform workload results:"
    print '(A,F8.6,A)', "STATIC  time: ", static_time, " seconds"
    print '(A,F8.6,A)', "DYNAMIC time: ", dynamic_time, " seconds"
end program openmp_67`;

  const scheduleMre5 = `program openmp_68
    use omp_lib
    implicit none
    integer, parameter :: n = 100
    integer :: i, tid, j
    integer :: thread_chunks(0:7) = 0
    integer :: chunk_sizes(100) = 0
    integer :: chunk_count
    integer :: current_iteration
    integer :: chunk_start(100), chunk_thread(100)
    logical :: test_passed = .true.
    logical :: looks_like_static = .true.
    current_iteration = 1
    chunk_count = 0
    call omp_set_num_threads(4)

    print *, "=== DYNAMIC Schedule with chunk=", 5, "==="

    !$omp parallel private(tid)
    !$omp do schedule(dynamic, 5)
    do i = 1, n
        tid = omp_get_thread_num()

        !$omp critical
        if (i == current_iteration) then
            chunk_count = chunk_count + 1
            chunk_start(chunk_count) = i
            chunk_thread(chunk_count) = tid
            thread_chunks(tid) = thread_chunks(tid) + 1
            if (i + 5 - 1 <= n) then
                chunk_sizes(chunk_count) = 5
                current_iteration = i + 5
            else
                chunk_sizes(chunk_count) = n - i + 1
                current_iteration = n + 1
            end if
        end if
        !$omp end critical
    end do
    !$omp end do
    !$omp end parallel

    print *, "Total chunks distributed:", chunk_count
    print *, "Chunks per thread:"
    do i = 0, omp_get_max_threads()-1
        print *, "Thread", i, ":", thread_chunks(i), "chunks"
    end do

    do i = 1, chunk_count-1
        if (chunk_sizes(i) /= 5) then
            print *, "ERROR: Chunk", i, "has size", chunk_sizes(i), "expected", 5
            test_passed = .false.
        end if
    end do

    if (chunk_sizes(chunk_count) > 5) then
        print *, "ERROR: Last chunk too large!"
        test_passed = .false.
    end if

    do i = 2, min(chunk_count, 8)
        if (chunk_thread(i) /= mod(chunk_thread(1) + i - 1, omp_get_max_threads())) then
            looks_like_static = .false.
            exit
        end if
    end do

    if (looks_like_static .and. chunk_count > 4) then
        print *, "WARNING: Dynamic schedule showing static-like round-robin pattern!"
    end if

    if (.not. test_passed) then
        error stop "DYNAMIC chunk schedule test FAILED!"
    end if
    print *, "DYNAMIC chunk schedule test completed"
end program openmp_68`;

  const numThreadsMre = `program openmp_69
    use omp_lib
  implicit none
  integer :: flags(4)
  integer :: i

  flags = 0

  !$omp parallel num_threads(4) private(i)
  i = omp_get_thread_num()
  !$omp critical
  flags(i+1) = 1
  !$omp end critical
  !$omp end parallel

  do i = 1, 4
    if (flags(i) /= 1) then
      print *, 'Error: Thread ', i-1, ' did not execute!'
      error stop
    end if
  end do

  print *, 'Test passed: num_threads(', 4, ') used correctly.'
end program openmp_69`;

  return (
    <div className="post-content space-y-8">
      {/* Recap and Motivation Section */}
      <div className="relative">
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Following Week 7’s implementation of the <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASKLOOP</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">TEAMS</code>, and <code className="font-semibold text-indigo-600 dark:text-indigo-400">DISTRIBUTE</code> constructs, Week 8 focused on the <code className="font-semibold text-indigo-600 dark:text-indigo-400">schedule</code> clause with its various modes, the <code className="font-semibold text-indigo-600 dark:text-indigo-400">num_threads</code> clause, and the <code className="font-semibold text-indigo-600 dark:text-indigo-400">atomic</code> construct. Last week, I planned to optimize those constructs, but I extended the work to these features for better loop handling. This week, I completed these implementations via<a href="https://github.com/lfortran/lfortran/pull/8039" className="text-indigo-500 dark:text-indigo-400 hover:underline">#8039</a>, spending about 29 hours to ensure they integrate well with existing OpenMP support.
        </p>
      </div>

      {/* Implementation Details and Bug Fix */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Implementation Details and Bug Fix
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          This week, I added the <code className="font-semibold text-indigo-600 dark:text-indigo-400">schedule</code> clause to control how loop iterations are divided among threads. I supported all modes from the OpenMP 6.0 reference: <code className="font-semibold text-indigo-600 dark:text-indigo-400">static</code> (divides iterations into equal chunks assigned in round-robin), <code className="font-semibold text-indigo-600 dark:text-indigo-400">dynamic</code> (threads request chunks as they finish), <code className="font-semibold text-indigo-600 dark:text-indigo-400">guided</code> (like dynamic but chunks decrease over time), <code className="font-semibold text-indigo-600 dark:text-indigo-400">runtime</code> (uses the run-sched-var ICV), and <code className="font-semibold text-indigo-600 dark:text-indigo-400">auto</code> (compiler or runtime decides). I also implemented the <code className="font-semibold text-indigo-600 dark:text-indigo-400">num_threads</code> clause to dynamically set the number of threads for a <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> region at runtime. The <code className="font-semibold text-indigo-600 dark:text-indigo-400">atomic</code> construct was added to ensure thread-safe updates. Additionally, I fixed a bug in ASR generation for nested IF statements inside nested pragmas, which was tested in existing cases like <code className="font-semibold text-indigo-600 dark:text-indigo-400">openmp_65.f90</code>.
        </p>
      </div>

      {/* Example Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Examples: SCHEDULE, NUM_THREADS, and ATOMIC Constructs
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Below are the seven MREs I compiled and ran successfully to test the new constructs.
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">SCHEDULE(STATIC)</code> (openmp_63.f90)
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
                    {scheduleMre1}
                </SyntaxHighlighter>
            </div>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">SCHEDULE(DYNAMIC)</code> (openmp_64.f90)
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
                    {scheduleMre2}
                </SyntaxHighlighter>
            </div>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">SCHEDULE(GUIDED)</code> (openmp_65.f90)
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
                    {scheduleMre3}
                </SyntaxHighlighter>
            </div>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">ATOMIC</code> (openmp_66.f90)
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
                    {atomicMre1}
                </SyntaxHighlighter>
            </div>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for Schedule Comparison (openmp_67.f90)
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
                    {scheduleMre4}
                </SyntaxHighlighter>
            </div>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">SCHEDULE(DYNAMIC, 5)</code> (openmp_68.f90)
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
                    {scheduleMre5}
                </SyntaxHighlighter>
            </div>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">NUM_THREADS</code> (openmp_69.f90)
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
                    {numThreadsMre}
                </SyntaxHighlighter>
            </div>
          </div>
        </details>
      </div>

      {/* Next Steps Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Next Steps
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          For Week 9, I plan to:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
            <li>Figure out a way to test <code className="font-semibold text-indigo-600 dark:text-indigo-400">Target Offloading</code> at CI.</li>
            <li>Figure Out some way to implement Target constructs without any dedicated GPU (If any).</li>
          I thank my mentors, <a href="https://github.com/certik" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Ondrej Certik</a>, <a href="https://github.com/Pranavchiku" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Pranav Goswami</a>, and <a href="https://github.com/gxyd" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Gaurav Dhingra</a>, for their guidance. I also appreciate the LFortran community’s support.
        </p>
      </div>
    </div>
  );
}