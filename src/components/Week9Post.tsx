import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Week9Post() {
  return (
    <div className="post-content space-y-8">
      {/* Recap and Motivation Section */}
      <div className="relative">
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          After last week’s work on the <code className="font-semibold text-indigo-600 dark:text-indigo-400">schedule</code> clause, <code className="font-semibold text-indigo-600 dark:text-indigo-400">num_threads</code>, and <code className="font-semibold text-indigo-600 dark:text-indigo-400">atomic</code> construct, Week 9 took a different turn. I decided to dive into researching OpenMP target offloading, which lets us run code on GPUs. Last week, I planned to add more constructs like <code className="font-semibold text-indigo-600 dark:text-indigo-400">simd</code>, but I shifted focus to understand how offloading works, especially since I have access to an NVIDIA GPU through my institute’s HPC server. This week, I spent about 21 hours exploring this new area and setting up the tools needed, which can be found at <a href="https://github.com/lfortran/lfortran/issues/4497#issuecomment-3089155987" className="font-semibold text-indigo-600 dark:text-indigo-400">#4497(comment)</a>.
        </p>
      </div>

      {/* Research and Decision Process */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Researching Target Offloading
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          I started by figuring out how to explore OpenMP target offloading. I had two choices: look at how GCC handles it or check out Clang’s approach. Since GCC has limited support for NVIDIA GPUs (the only type I can use), I went with Clang because it works better with NVIDIA and is based on LLVM, which fits well with LFortran’s backend. This felt like a good starting point to learn how to offload code to my GPU.
        </p>
      </div>

      {/* Setting Up Clang for Target Offloading */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Setting Up Clang for GPU Offloading
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          My goal was to get Clang working for target offloading on my NVIDIA GPU. This meant installing all the right tools, but I wanted to keep it simple using Conda so others can follow along easily. First, I tried building the LLVM project from scratch, but it kept failing. I think it was because I couldn’t find the perfect mix of versions and build flags. I also struggled a lot with installing different versions of Clang, LLVM, CUDA Toolkit, and other tools to find combinations that work together. After many tries, I decided to use prebuilt binaries instead, which saved me time and worked better.
        </p>
      </div>

      {/* Findings on OpenMP Target Offloading */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          What I Learned About Target Offloading
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Here’s what I discovered about how OpenMP target offloading works:
        </p>
        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">1. OpenMP Target Offloading Architecture</h3>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          OpenMP offloading creates two sets of code: one for the host (CPU) and one for the target device (GPU). The GPU code is embedded into the host code to make a “fat object.” A special tool then pulls out the GPU code, links it, and adds it back into the final program so the host can use it on the GPU.
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
          The setup looks like this:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li>
            <strong>Host (CPU)</strong> runs the main program and uses a runtime library called <code className="font-semibold text-indigo-600 dark:text-indigo-400">libomptarget</code>.
          </li>
          <li>
            <strong>Device (GPU)</strong> runs special kernels (like CUDA code) with its own runtime support.
          </li>
          <li>
            They connect through a plugin that talks to the GPU.
          </li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
          This system has three main parts:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li>
            <strong>Host Runtime (<code className="font-semibold text-indigo-600 dark:text-indigo-400">libomptarget.so</code>)</strong>: Handles device setup, memory moves, and kernel launches. Without it, OpenMP target commands wouldn’t work.
          </li>
          <li>
            <strong>CUDA Plugin (<code className="font-semibold text-indigo-600 dark:text-indigo-400">libomptarget.rtl.cuda.so</code>)</strong>: Links the runtime to NVIDIA’s CUDA system, managing GPU memory and launches.
          </li>
          <li>
            <strong>Device Runtime (<code className="font-semibold text-indigo-600 dark:text-indigo-400">libomptarget.devicertl.a</code>)</strong>: Runs OpenMP features like thread teams on the GPU.
          </li>
        </ul>

        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">2. Key Components</h3>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Each part has specific jobs:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li><strong><code className="font-semibold text-indigo-600 dark:text-indigo-400">libomptarget.so</code></strong>: Sets up the GPU, moves data, and runs kernels. It’s the heart of the system.</li>
          <li><strong><code className="font-semibold text-indigo-600 dark:text-indigo-400">libomptarget.rtl.cuda.so</code></strong>: Connects to CUDA for GPU tasks like memory and context management.</li>
          <li><strong><code className="font-semibold text-indigo-600 dark:text-indigo-400">libomptarget.devicertl.a</code></strong>: Handles GPU-side OpenMP features like synchronization and memory.</li>
          <li><strong>Bitcode Files (<code className="font-semibold text-indigo-600 dark:text-indigo-400">.bc</code>)</strong>: Special files like <code className="font-semibold text-indigo-600 dark:text-indigo-400">libomptarget-nvptx-sm_89.bc</code> for different GPU types (e.g., sm_89 for my NVIDIA L4).</li>
          <li><strong><code className="font-semibold text-indigo-600 dark:text-indigo-400">clang-offload-packager</code></strong>: Puts GPU code into the host file.</li>
          <li><strong><code className="font-semibold text-indigo-600 dark:text-indigo-400">clang-linker-wrapper</code></strong>: Links the GPU code and adds it to the final program.</li>
          <li><strong><code className="font-semibold text-indigo-600 dark:text-indigo-400">clang-offload-bundler</code></strong>: Combines host and GPU code into one file.</li>
        </ul>

        <h3 className="text-2xl font-medium text-gray-900 dark:text-gray-100 mt-6 mb-3">3. How Compilation Works</h3>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          The process to create a program with GPU support has four steps:
        </p>
        <ul className="list-disc pl-6 mt-2 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li><strong>Host Compilation</strong>: Turns the code into a CPU object file and prepares offloading parts.</li>
          <li><strong>Device Compilation</strong>: Makes GPU code and links it with the device runtime.</li>
          <li><strong>Bundling</strong>: Combines CPU and GPU code into a fat object.</li>
          <li><strong>Final Linking</strong>: Links the GPU code and builds the final program.</li>
        </ul>
      </div>

      {/* Setup Steps and Findings */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Steps to Set Up and My Findings
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Here’s how I set up Clang for target offloading on my system, which has an AMD EPYC 7742 CPU and two NVIDIA L4 GPUs:
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
          I created a Conda environment called <code className="font-semibold text-indigo-600 dark:text-indigo-400">openmp-llvm18_tt</code> with these commands:
        </p>
        <SyntaxHighlighter language="bash" style={dracula} wrapLongLines={true} customStyle={{ fontSize: "1rem", padding: "1.5rem", borderRadius: "0.75rem", background: "#282a36" }}>
    {`conda create -n openmp-llvm18_tt -c conda-forge -y \\
        python=3.11 \\
        clang=18.1.8 \\
        llvm=18.1.8 \\
        llvm-openmp=18.1.8 \\
        cuda-toolkit=12.4 \\
        cuda-nvcc=12.4 \\
        cmake=3.27 \\
        wget \\
        tar
    conda activate openmp-llvm18_tt`}
        </SyntaxHighlighter>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
          Then, I downloaded prebuilt LLVM 18.1.8 with Clang support and set it up:
        </p>
        <SyntaxHighlighter language="bash" style={dracula} wrapLongLines={true} customStyle={{ fontSize: "1rem", padding: "1.5rem", borderRadius: "0.75rem", background: "#282a36" }}>
    {`cd /tmp/clang_llvm_18
    wget -q --show-progress 
    https://github.com/llvm/llvm-project/releases/download/llvmorg-18.1.8/clang+llvm-18.1.8-x86_64-linux-gnu-ubuntu-18.04.tar.xz
    tar -xvf clang+llvm-18.1.8-x86_64-linux-gnu-ubuntu-18.04.tar.xz
    export LLVM_DIR="$PWD/clang+llvm-18.1.8-x86_64-linux-gnu-ubuntu-18.04"`}
        </SyntaxHighlighter>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
          I copied the runtime libraries, bitcode files, and offloading tools to the Conda environment:
        </p>
        <SyntaxHighlighter language="bash" style={dracula} wrapLongLines={true} customStyle={{ fontSize: "1rem", padding: "1.5rem", borderRadius: "0.75rem", background: "#282a36" }}>
    {`cp $LLVM_DIR/lib/libomp.so* $CONDA_PREFIX/lib/
    cp $LLVM_DIR/lib/libomptarget.so* $CONDA_PREFIX/lib/
    cp $LLVM_DIR/lib/libomptarget.rtl.*.so* $CONDA_PREFIX/lib/
    mkdir -p $CONDA_PREFIX/lib/clang/18.1.8/lib/
    mkdir -p $CONDA_PREFIX/lib/clang/18.1.8/lib/nvptx64-nvidia-cuda
    cp $LLVM_DIR/lib/libomptarget.devicertl.a $CONDA_PREFIX/lib/
    cp $LLVM_DIR/lib/libomptarget.devicertl.a $CONDA_PREFIX/lib/clang/18.1.8/lib/
    cp $LLVM_DIR/lib/libomptarget-nvptx-sm_*.bc $CONDA_PREFIX/lib/clang/18.1.8/lib/nvptx64-nvidia-cuda
    cp $LLVM_DIR/bin/clang-linker-wrapper $CONDA_PREFIX/bin/
    cp $LLVM_DIR/bin/clang-offload-packager $CONDA_PREFIX/bin/`}
        </SyntaxHighlighter>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
          I also added activation and deactivation scripts to set environment variables:
        </p>
        <SyntaxHighlighter language="bash" style={dracula} wrapLongLines={true} customStyle={{ fontSize: "1rem", padding: "1.5rem", borderRadius: "0.75rem", background: "#282a36" }}>
    {`mkdir -p $CONDA_PREFIX/etc/conda/activate.d
    cat > $CONDA_PREFIX/etc/conda/activate.d/openmp_llvm18_tt.sh << 'EOF'
    export CUDA_HOME=$CONDA_PREFIX
    export CUDA_PATH=$CONDA_PREFIX
    export LD_LIBRARY_PATH=$CONDA_PREFIX/lib:$CONDA_PREFIX/lib/clang/18.1.8/lib:$LD_LIBRARY_PATH
    export LD_LIBRARY_PATH="/usr/lib/x86_64-linux-gnu:$CONDA_PREFIX/lib:$LD_LIBRARY_PATH"
    export LIBRARY_PATH=$CONDA_PREFIX/lib:$CONDA_PREFIX/lib/clang/18.1.8/lib:$LIBRARY_PATH
    export OMP_TARGET_OFFLOAD=MANDATORY
    export LIBOMPTARGET_DEVICE_ARCHITECTURES=sm_89
    export LIBOMPTARGET_INFO=1
    export LIBOMPTARGET_NVPTX_BC_PATH=$CONDA_PREFIX/lib/clang/18.1.8/lib/nvptx64-nvidia-cuda
    export CLANG_OPENMP_NVPTX_DEFAULT_ARCH=sm_89
    echo "✓ OpenMP GPU environment activated"
    EOF
    chmod +x $CONDA_PREFIX/etc/conda/activate.d/openmp_llvm18_tt.sh

mkdir -p $CONDA_PREFIX/etc/conda/deactivate.d
    cat > $CONDA_PREFIX/etc/conda/deactivate.d/openmp_llvm18_tt.sh << 'EOF'
    #!/bin/bash
    unset CUDA_HOME CUDA_PATH OMP_TARGET_OFFLOAD
    unset LIBOMPTARGET_DEVICE_ARCHITECTURES LIBOMPTARGET_INFO LIBOMPTARGET_NVPTX_BC_PATH
    unset CLANG_OPENMP_NVPTX_DEFAULT_ARCH
    EOF
    chmod +x $CONDA_PREFIX/etc/conda/deactivate.d/openmp_llvm18_tt.sh

    conda deactivate
    conda activate openmp-llvm18_tt`}
        </SyntaxHighlighter>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-2">
          These steps worked on my system, and I hope they can help others get started too. The setup ensures Clang can compile code for my NVIDIA L4 GPU with the sm_89 architecture.
        </p>
      </div>

      {/* Next Steps Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Next Steps
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          For Week 10, I plan to:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li>Figure out a way to make LFortran work with the same.</li>
          <li>Document any challenges or additional setup steps I find.</li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          I thank my mentors, <a href="https://github.com/certik" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Ondrej Certik</a>, <a href="https://github.com/Pranavchiku" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Pranav Goswami</a>, and <a href="https://github.com/gxyd" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Gaurav Dhingra</a>, for their support as I explored this new area. I also appreciate the LFortran community for their encouragement.
        </p>
      </div>
    </div>
  );
}