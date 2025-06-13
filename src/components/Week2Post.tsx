import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Week2Post() {
  const sectionsMre1 = `!$omp parallel sections reduction(+:tid)
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
  !$omp end parallel sections`;

  const sectionsAsr1 = `[(OMPRegion
    Sections
    [(OMPReduction
        ReduceAdd
        [(Var 6 tid)]
    )]
    [(OMPRegion
        Section
        []
        [(SubroutineCall
            6 compute_a
            ()
            []
            ()
        )
        (Assignment
            (Var 6 tid)
            (IntegerBinOp
                (Var 6 tid)
                Add
                (FunctionCall
                    6 omp_get_thread_num
                    ()
                    []
                    (Integer 4)
                    ()
                    ()
                )
                (Integer 4)
                ()
            )
            ()
            .false.
        )
        (Print
            (StringFormat
                ()
                [(StringConstant
                    "Thread ID:"
                    (String 1 (IntegerConstant 10 (Integer 4) Decimal) ExpressionLength PointerString)
                )
                (Var 6 tid)]
                FormatFortran
                (String 1 () ExpressionLength CString)
                ()
            )
        )]
    )
    (OMPRegion
        Section
        []
        [(SubroutineCall
            6 compute_b
            ()
            []
            ()
        )
        (Assignment
            (Var 6 tid)
            (IntegerBinOp
                (Var 6 tid)
                Add
                (FunctionCall
                    6 omp_get_thread_num
                    ()
                    []
                    (Integer 4)
                    ()
                    ()
                )
                (Integer 4)
                ()
            )
            ()
            .false.
        )
        (Print
            (StringFormat
                ()
                [(StringConstant
                    "Thread ID:"
                    (String 1 (IntegerConstant 10 (Integer 4) Decimal) ExpressionLength PointerString)
                )
                (Var 6 tid)]
                FormatFortran
                (String 1 () ExpressionLength CString)
                ()
            )
        )]
    )
    (OMPRegion
        Section
        []
        [(SubroutineCall
            6 compute_c
            ()
            []
            ()
        )
        (Assignment
            (Var 6 tid)
            (IntegerBinOp
                (Var 6 tid)
                Add
                (FunctionCall
                    6 omp_get_thread_num
                    ()
                    []
                    (Integer 4)
                    ()
                    ()
                )
                (Integer 4)
                ()
            )
            ()
            .false.
        )
        (Print
            (StringFormat
                ()
                [(StringConstant
                    "Thread ID:"
                    (String 1 (IntegerConstant 10 (Integer 4) Decimal) ExpressionLength PointerString)
                )
                (Var 6 tid)]
                FormatFortran
                (String 1 () ExpressionLength CString)
                ()
            )
        )]
    )]
)]`;

  const taskMre = `  !$OMP PARALLEL SECTIONS SHARED(array)
    !$OMP SECTION
    do i = 1, n
      !$OMP TASK FIRSTPRIVATE(i) SHARED(array)
        array(i) = array(i) * real(i)
        print *, "Task: i = ", i, ", computed by thread ", omp_get_thread_num()
      !$OMP END TASK
    end do
    !$OMP SECTION
    print*, "All tasks submitted. Waiting for completion."
  !$OMP END PARALLEL SECTIONS
`;

  const taskAsr = `[(OMPRegion
    Sections
    [(OMPShared
        [(Var 2 array)]
    )]
    [(OMPRegion
        Section
        []
        [(DoLoop
            ()
            ((Var 2 i)
            (IntegerConstant 1 (Integer 4) Decimal)
            (Var 2 n)
            ())
            [(OMPRegion
                Task
                [(OMPFirstPrivate
                    [(Var 2 i)]
                )
                (OMPShared
                    [(Var 2 array)]
                )]
                [(Assignment
                    (ArrayItem
                        (Var 2 array)
                        [(()
                        (Var 2 i)
                        ())]
                        (Real 4)
                        ColMajor
                        ()
                    )
                    (RealBinOp
                        (ArrayItem
                            (Var 2 array)
                            [(()
                            (Var 2 i)
                            ())]
                            (Real 4)
                            ColMajor
                            ()
                        )
                        Mul
                        (IntrinsicElementalFunction
                            Real
                            [(Var 2 i)]
                            0
                            (Real 4)
                            ()
                        )
                        (Real 4)
                        ()
                    )
                    ()
                    .false.
                )
                (Print
                    (StringFormat
                        ()
                        [(StringConstant
                            "Task: i = "
                            (String 1 (IntegerConstant 10 (Integer 4) Decimal) ExpressionLength PointerString)
                        )
                        (Var 2 i)
                        (StringConstant
                            ", computed by thread "
                            (String 1 (IntegerConstant 21 (Integer 4) Decimal) ExpressionLength PointerString)
                        )
                        (FunctionCall
                            2 omp_get_thread_num
                            ()
                            []
                            (Integer 4)
                            ()
                            ()
                        )]
                        FormatFortran
                        (String 1 () ExpressionLength CString)
                        ()
                    )
                )]
            )]
            []
        )]
    )
    (OMPRegion
        Section
        []
        [(Print
            (StringConstant
                "All tasks submitted. Waiting for completion."
                (String 1 (IntegerConstant 44 (Integer 4) Decimal) ExpressionLength PointerString)
            )
        )]
    )]
)]`;

  return (
    <div className="post-content space-y-8">
      {/* Recap and Motivation Section */}
      <div className="relative">
        {/* <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400 mb-6 leading-tight">
          GSoC 2025: Week 2 Contribution to OpenMP Support in LFortran
        </h1> */}
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Following the foundation laid in Week 1, where I proposed the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> ASR node to address the limitations of LFortran’s existing OpenMP support, Week 2 focused on implementing this design. In my previous blog post, I outlined a plan to represent the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node in the Abstract Semantic Representation (ASR) for the <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct and validate minimal reproducible examples (MREs) against GFortran and Clang outputs. This week, I successfully implemented the foundational structure for the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node through PR <a href="https://github.com/lfortran/lfortran/pull/7449" className="text-indigo-500 dark:text-indigo-400 hover:underline">#7449</a>, dedicating approximately 25 hours to this task.
        </p>
      </div>

      {/* Choice of Sections Construct Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Choice of Sections Construct for Implementation
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          I chose to implement the <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct first for several strategic reasons. The <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel sections</code> constructs represent fundamentally different paradigms: the former is loop-based, while the latter is non-loop-based, allowing independent code blocks to execute concurrently. The existing design in LFortran was heavily adapted to the <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> construct, directly mapping it to a <code className="font-semibold text-indigo-600 dark:text-indigo-400">DoConcurrentLoop</code> node in the ASR. Shifting <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> to the new <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> design would have required significant changes to the OpenMP pass, which requires longer PRs and possibly regression (which means the testcases which we compile now of parallel do may not be compiled till openmp pass gets matured enough to process OMPRegion), which is not my intention to do for now.
        </p>
        {/* <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          By selecting the <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct, I could represent it in the ASR without affecting the <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> implementation, thereby avoiding regression in existing functionality. This approach also sets the stage for future extensions, as the OpenMP pass can be adapted to process the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node once the foundational implementation is merged, enabling broader support for other constructs in a systematic manner.
        </p> */}
      </div>

      {/* Implementation Journey Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Implementation
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          The previous design in LFortran was tailored specifically for the <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> construct, which limited its flexibility. When a <code className="font-semibold text-indigo-600 dark:text-indigo-400">parallel do</code> directive was encountered, the <code className="font-semibold text-indigo-600 dark:text-indigo-400">visit_Pragma</code> function assumed the immediate presence of a do loop, collecting its body through a <code className="font-semibold text-indigo-600 dark:text-indigo-400">visit_DoLoop</code> and converting it into a <code className="font-semibold text-indigo-600 dark:text-indigo-400">DoConcurrentLoop</code> node in the ASR. This approach was restrictive because OpenMP constructs like <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> or <code className="font-semibold text-indigo-600 dark:text-indigo-400">task</code> can contain arbitrary statements or nested directives, which do not fit the loop-centric model.
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          In my initial attempt to implement the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node, I focused on a special case for the <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct, aiming to represent its structure in the ASR. However, during discussions with my mentor Pranav Goswami in our weekly calls, we recognized that this approach lacked the generality needed to support a wider range of OpenMP constructs, especially those with nested structures.
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          Following this feedback, I revised the implementation to adopt a stack-based approach for collecting the body of an <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> from <code className="font-semibold text-indigo-600 dark:text-indigo-400">transform_stmts</code> visitor which can be used to collect any type of stmts.The stack-based approach ensures that the implementation is generic and extensible, capable of representing any OpenMP construct, including nested structures, in a robust manner. This design has been implemented in PR <a href="https://github.com/lfortran/lfortran/pull/7449" className="text-indigo-500 dark:text-indigo-400 hover:underline">#7449</a>, providing a solid foundation for further OpenMP enhancements in LFortran.
        </p>
      </div>

      {/* Minimal Reproducible Examples (MREs) Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Minimal Reproducible Examples (MREs)
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          To validate the stack-based approach and the new <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> implementation, I developed three MREs, focusing on the <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">task</code> constructs. These examples demonstrate the ability of the new design to handle both simple and nested OpenMP directives, accurately representing them in the ASR.
        </p>

        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-8 mb-3">MRE 1: Sections Construct with Reduction Clause</h3>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          The first MRE illustrates a <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct with a <code className="font-semibold text-indigo-600 dark:text-indigo-400">reduction</code> clause, distributing independent tasks across multiple threads:
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Fortran Code for Sections Construct
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {sectionsMre1}
            </SyntaxHighlighter>
          </div>
        </details>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          The corresponding ASR representation captures the nested structure of the <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct, including the <code className="font-semibold text-indigo-600 dark:text-indigo-400">reduction</code> clause and individual <code className="font-semibold text-indigo-600 dark:text-indigo-400">section</code> regions:
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View ASR Representation for Sections Construct
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="plaintext" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {sectionsAsr1}
            </SyntaxHighlighter>
          </div>
        </details>

        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-8 mb-3">MRE 2: Task Construct with Nested Sections</h3>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          The second MRE demonstrates a more complex scenario involving a <code className="font-semibold text-indigo-600 dark:text-indigo-400">task</code> construct nested within a <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> directive, using <code className="font-semibold text-indigo-600 dark:text-indigo-400">firstprivate</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">shared</code> clauses to manage variable scoping:
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Fortran Code for Task Construct
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="fortran" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {taskMre}
            </SyntaxHighlighter>
          </div>
        </details>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          The ASR representation below showcases the nested structure, with the <code className="font-semibold text-indigo-600 dark:text-indigo-400">task</code> construct properly embedded within a <code className="font-semibold text-indigo-600 dark:text-indigo-400">section</code> region:
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View ASR Representation for Task Construct
          </summary>
          <div className="relative mt-2">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg"></div>
            <SyntaxHighlighter language="plaintext" style={dracula} customStyle={{ padding: "16px", borderRadius: "8px", overflowX: "auto", background: "#1e293b" }}>
              {taskAsr}
            </SyntaxHighlighter>
          </div>
        </details>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          The third MRE, also focusing on the <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct, follows a similar structure and is included in PR <a href="https://github.com/lfortran/lfortran/pull/7449" className="text-indigo-500 dark:text-indigo-400 hover:underline">#7449</a>. These MREs validate the stack-based approach’s ability to handle nested OpenMP directives, ensuring that LFortran can accurately represent complex parallel constructs in the ASR.
        </p>
      </div>

      {/* Next Steps Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Next Steps
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          In Week 3, I plan to focus on the following tasks:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li>Extend the OpenMP pass to visit the <code className="font-semibold text-indigo-600 dark:text-indigo-400">OMPRegion</code> node and support the <code className="font-semibold text-indigo-600 dark:text-indigo-400">sections</code> construct, lowering it to appropriate runtime calls.</li>
          {/* <li>Collaborate with the LFortran community to refine the implementation, incorporating feedback from PR reviews and discussions in <a href="https://github.com/lfortran/lfortran/issues/7332" className="text-indigo-500 dark:text-indigo-400 hover:underline">Issue #7332</a>.</li> */}
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          I would like to thank my mentors, <a href="https://github.com/certik" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Ondrej Certik</a>, <a href="https://github.com/Pranavchiku" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Pranav Goswami</a>, and <a href="https://github.com/gxyd" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Gaurav Dhingra</a>, for their critical reviews and guidance, which played an important role in shaping the stack-based approach. I also thank the other contributors of LFortran for their support and help whenever needed.
        </p>
      </div>
    </div>
  );
}