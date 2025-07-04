import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Week7Post() {
  const taskloopMre = `program openmp_58
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
  !$omp taskloop shared(A)
  do i = 1, N
        total = total + A(index) * 2
        index=index+1
    end do
  !$omp end taskloop
  !$omp end single
  !$omp taskwait
  !$omp end parallel

  print *, "Total = ", total, index
  if(total/=10) error stop
end program openmp_58`;

  const teamsMre1 = `program openmp_59
  use omp_lib
  integer :: sum=0
  !$omp teams num_teams(3) reduction(+:sum)
    print*, omp_get_team_num()
    sum=sum+omp_get_team_num()
  !$omp end teams
  if(sum/=3) error stop
end program openmp_59`;

  const teamsMre2 = `program openmp_60
  use omp_lib
  implicit none
integer :: sum , team_sums(4) = 0, local_sum=0
sum=0
!$omp teams num_teams(4) thread_limit(3) shared(team_sums) private(local_sum) reduction(+:sum)
!$omp parallel shared(team_sums) private(local_sum) reduction(+:sum)
  local_sum = omp_get_thread_num() * 10 + omp_get_team_num()
  sum = sum + local_sum
  !$omp critical
  team_sums(omp_get_team_num() + 1) = team_sums(omp_get_team_num() + 1) + local_sum
  !$omp end critical
  !$omp end parallel
!$omp end teams
  print*, team_sums
  print*,sum
  if(sum/=138) error stop
  if(team_sums(1) /= 30) error stop
  if(team_sums(2) /= 33) error stop
  if(team_sums(3) /= 36) error stop
  if(team_sums(4) /= 39) error stop
end program openmp_60`;

  const distributeMre1 = `program openmp_61
    use omp_lib
    implicit none
integer :: array(1005), i,sum=0
!$omp teams num_teams(4)
!$omp distribute
do i = 1, 1000
  array(i) = i * 2
end do
!$omp end distribute
!$omp end teams

! Sum of all elements
!$omp parallel do reduction(+:sum)
do i=1,1000
sum=sum+array(i)
end do
!$omp end parallel do

print *,sum
if(sum/=1001000) error stop
end program openmp_61`;

  const distributeMre2 = `program openmp_62
    use omp_lib
    implicit none
integer :: array(1000), i, j, sum=0
array(1)=3
!$omp teams num_teams(2) thread_limit(5)
!$omp distribute
do i = 1, 1000, 100
    print*,omp_get_num_threads(), omp_get_max_threads()
  !$omp parallel do
  do j = i, min(i+99, 1000)
    array(j) = j * 3
  end do
  !$omp end parallel do
end do
!$omp end distribute
!$omp end teams

! Sum of all elements
!$omp parallel do reduction(+:sum)
do i=1,1000
sum=sum+array(i)
end do
!$omp end parallel do

print*, sum
if(sum/=1501500) error stop
end program openmp_62`;

  return (
    <div className="post-content space-y-8">
      {/* Recap and Motivation Section */}
      <div className="relative">
        {/* <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400 mb-6 leading-tight">
          GSoC 2025: Week 7 Contribution to OpenMP Support in LFortran
        </h1> */}
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Following Week 6’s enhancements to the <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASKWAIT</code> constructs, Week 7 focused on implementing the <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASKLOOP</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">TEAMS</code>, and <code className="font-semibold text-indigo-600 dark:text-indigo-400">DISTRIBUTE</code> constructs. Last week, I planned to work on <code className="font-semibold text-indigo-600 dark:text-indigo-400">teams</code> and optimize <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> support, but I expanded the scope to include these additional constructs. This week, I successfully compiled and ran five MREs, spending about 27 hours to ensure <code className="font-semibold text-indigo-600 dark:text-indigo-400">reduction</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> variables work smoothly, including <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> regions within <code className="font-semibold text-indigo-600 dark:text-indigo-400">teams</code>.
        </p>
      </div>

      {/* Implementation of TASKLOOP, TEAMS, and DISTRIBUTE Constructs */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Implementing <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASKLOOP</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">TEAMS</code>, and <code className="font-semibold text-indigo-600 dark:text-indigo-400">DISTRIBUTE</code> Constructs
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          This week, I worked on adding support for the <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASKLOOP</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">TEAMS</code>, and <code className="font-semibold text-indigo-600 dark:text-indigo-400">DISTRIBUTE</code> constructs to LFortran. For <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASKLOOP</code>, I noticed it’s very similar to the <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> construct, with just a couple of extra clauses. I reused the existing <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> implementation by transforming <code className="font-semibold text-indigo-600 dark:text-indigo-400">!$omp taskloop</code> into a <code className="font-semibold text-indigo-600 dark:text-indigo-400">do</code> loop with nested <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASK</code> directives, keeping the approach simple and effective. For <code className="font-semibold text-indigo-600 dark:text-indigo-400">TEAMS</code>, I used a <code className="font-semibold text-indigo-600 dark:text-indigo-400">GOMP_teams</code> call with a function pointer for the body and handled <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> data, similar to <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> regions. Since <code className="font-semibold text-indigo-600 dark:text-indigo-400">TEAMS</code> sits higher in the hierarchy, each team can spawn multiple threads with a <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> construct. The <code className="font-semibold text-indigo-600 dark:text-indigo-400">DISTRIBUTE</code> construct was integrated to divide work across teams, ensuring proper work distribution.
        </p>
      </div>

      {/* Bug Fix and Improvements */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Bug Fix and Improvements
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          During implementation, I found a small bug: the <code className="font-semibold text-indigo-600 dark:text-indigo-400">DO</code> construct’s worksharing logic divided iterations by <code className="font-semibold text-indigo-600 dark:text-indigo-400">omp_get_max_threads</code> instead of <code className="font-semibold text-indigo-600 dark:text-indigo-400">omp_get_num_threads</code>, which returns the current team’s thread count. This caused wrong distribution and incorrect results. I fixed this to use the correct function, ensuring accurate work sharing. I also confirmed that <code className="font-semibold text-indigo-600 dark:text-indigo-400">reduction</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> variables work properly across all constructs, including <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel</code> regions inside <code className="font-semibold text-indigo-600 dark:text-indigo-400">teams</code>. To set the <code className="font-semibold text-indigo-600 dark:text-indigo-400">thread_limit</code> for CI testing, I added the environment variable <code className="font-semibold text-indigo-600 dark:text-indigo-400">KMP_TEAMS_THREAD_LIMIT=32</code> in <code className="font-semibold text-indigo-600 dark:text-indigo-400">CMakeLists.txt</code>, applying it only to the LLVM-OMP backend for OpenMP tests.
        </p>
      </div>

      {/* Example Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Examples: <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASKLOOP</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">TEAMS</code>, and <code className="font-semibold text-indigo-600 dark:text-indigo-400">DISTRIBUTE</code> Constructs
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Below are the five MREs I compiled and ran successfully this week to test the new constructs and fixes.
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">TASKLOOP</code> (openmp_58.f90)
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {taskloopMre}
            </SyntaxHighlighter>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">TEAMS</code> (openmp_59.f90)
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {teamsMre1}
            </SyntaxHighlighter>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">TEAMS</code> with <code className="font-semibold text-indigo-600 dark:text-indigo-400">PARALLEL</code> (openmp_60.f90)
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {teamsMre2}
            </SyntaxHighlighter>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">DISTRIBUTE</code> (openmp_61.f90)
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {distributeMre1}
            </SyntaxHighlighter>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for <code className="font-semibold text-indigo-600 dark:text-indigo-400">DISTRIBUTE</code> with Nested <code className="font-semibold text-indigo-600 dark:text-indigo-400">PARALLEL DO</code> (openmp_62.f90)
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {distributeMre2}
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
          For Week 8, I plan to:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li>Implement the <code className="font-semibold text-indigo-600 dark:text-indigo-400">SIMD</code> construct using the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node (<a href="https://github.com/lfortran/lfortran/issues/7332" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7332</a>).</li>
            <li>Fix more bugs and implement other clauses if possible.</li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          I thank my mentors, <a href="https://github.com/certik" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Ondrej Certik</a>, <a href="https://github.com/Pranavchiku" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Pranav Goswami</a>, and <a href="https://github.com/gxyd" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Gaurav Dhingra</a>, for their guidance and support. I also appreciate the LFortran community’s support throughout this process.
        </p>
      </div>
    </div>
  );
}