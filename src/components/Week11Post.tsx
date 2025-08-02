import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function Week11Post() {
  const offloadingMre = `program openmp_70
    implicit none
    real, allocatable, dimension(:) :: a, b
    integer :: i
    allocate(a(10000000), b(10000000))
    b=5
    !$omp target map(tofrom:a, b)
        !$omp teams
            !$omp distribute parallel do
                do i = 1, 10000000
                    a(i) = i + b(i)*340
                end do
            !$omp end distribute parallel do
        !$omp end teams
    !$omp end target
    print*, a(5), b(5)
    if(a(5) /= 1705) error stop
    if(b(5) /= 5) error stop
end program openmp_70`;

  const cDumpOmp = `#include <inttypes.h>
#include <stdlib.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>
#include <lfortran_intrinsics.h>

struct dimension_descriptor
{
    int32_t lower_bound, length, stride;
};

struct r32
{
    float *data;
    struct dimension_descriptor dims[32];
    int32_t n_dims;
    int32_t offset;
    bool is_allocated;
};

// Implementations
float _lcompilers_real_i32(int32_t x)
{
    float _lcompilers_real_i32;
    _lcompilers_real_i32 = (float)(x);
    return _lcompilers_real_i32;
}

int main(int argc, char* argv[])
{
    _lpython_set_argv(argc, argv);
    int32_t __libasr_index_0_;
    struct r32 a_value;
    struct r32* a = &a_value;
    float *a_data;
    a->data = a_data;
    a->n_dims = 1;
    a->offset = 0;
    a->dims[0].lower_bound = 1;
    a->dims[0].length = 0;
    a->dims[0].stride = 1;
    struct r32 b_value;
    struct r32* b = &b_value;
    float *b_data;
    b->data = b_data;
    b->n_dims = 1;
    b->offset = 0;
    b->dims[0].lower_bound = 1;
    b->dims[0].length = 0;
    b->dims[0].stride = 1;
    int32_t i;
    a->n_dims = 1;
    a->dims[0].lower_bound = 1;
    a->dims[0].length = 10000000;
    a->dims[0].stride = 1;
    a->data = (float*) _lfortran_malloc(1*a->dims[0].length*sizeof(float));
    a->is_allocated = true;
    b->n_dims = 1;
    b->dims[0].lower_bound = 1;
    b->dims[0].length = 10000000;
    b->dims[0].stride = 1;
    b->data = (float*) _lfortran_malloc(1*b->dims[0].length*sizeof(float));
    b->is_allocated = true;
    for (__libasr_index_0_=((int32_t)b->dims[1-1].lower_bound); __libasr_index_0_<=((int32_t) b->dims[1-1].length + b->dims[1-1].lower_bound - 1); __libasr_index_0_++) {
        b->data[((0 + (b->dims[0].stride * (__libasr_index_0_ - b->dims[0].lower_bound))) + b->offset)] = (float)(5);
    }
#pragma omp target map(tofrom:a, b)
#pragma omp teams
#pragma omp distribute parallel for
    for (i=1; i<=10000000; i++) {
        a->data[((0 + (a->dims[0].stride * (i - a->dims[0].lower_bound))) + a->offset)] = _lcompilers_real_i32(i) + b->data[((0 + (b->dims[0].stride * (i - b->dims[0].lower_bound))) + b->offset)]*(float)(340);
    }
    printf("%f%s%f\n", a->data[((0 + (a->dims[0].stride * (5 - a->dims[0].lower_bound))) + a->offset)], " ", b->data[((0 + (b->dims[0].stride * (5 - b->dims[0].lower_bound))) + b->offset)]);
    if (a->data[((0 + (a->dims[0].stride * (5 - a->dims[0].lower_bound))) + a->offset)] != (float)(1705)) {
        fprintf(stderr, "ERROR STOP");
        exit(1);
    }
    if (b->data[((0 + (b->dims[0].stride * (5 - b->dims[0].lower_bound))) + b->offset)] != (float)(5)) {
        fprintf(stderr, "ERROR STOP");
        exit(1);
    }
    // FIXME: implicit deallocate(a, b, );
    return 0;
}
`;

  const cDumpCuda = `#include <inttypes.h>
#include <stdlib.h>
#include <stdbool.h>
#include <stdio.h>
#include <string.h>
#include <lfortran_intrinsics.h>
#ifdef USE_GPU
#include<cuda_runtime.h>
#else
#include"cpu_impl.h"
#endif
struct dimension_descriptor
{
    int32_t lower_bound, length, stride;
};
struct r32
{
    float *data;
    struct dimension_descriptor dims[32];
    int32_t n_dims;
    int32_t offset;
    bool is_allocated;
};
// Implementations
#ifdef USE_GPU
__global__
#endif
void compute_kernel_0(struct r32 *a, struct r32 *b, int i_n) {
    int i = blockIdx.x * blockDim.x + threadIdx.x + 1;
    if (i <= i_n) {
            a->data[((0 + (a->dims[0].stride * (i - a->dims[0].lower_bound))) + a->offset)] = (float)(i) + b->data[((0 + (b->dims[0].stride * (i - b->dims[0].lower_bound))) + b->offset)]*(float)(340);
    }
}
#ifndef USE_GPU
void compute_kernel_0_wrapper(void **args) {
    struct r32 *a = *(struct r32**)args[0];
    struct r32 *b = *(struct r32**)args[1];
    int i_n = *(int*)args[2];
    compute_kernel_0(a, b, i_n);
}
#endif
#ifndef USE_GPU
void compute_kernel_wrapper(void **args, void *func) {
    if (func == (void*)compute_kernel_0) {
        compute_kernel_0_wrapper(args);
        return;
    }
    fprintf(stderr, "Unknown kernel function\n");
    exit(1);
}
#endif
int main(int argc, char* argv[])
{
    _lpython_set_argv(argc, argv);
    int32_t __libasr_index_0_;
    struct r32 a_value;
    struct r32* a = &a_value;
    float *a_data;
    a->data = a_data;
    a->n_dims = 1;
    a->offset = 0;
    a->dims[0].lower_bound = 1;
    a->dims[0].length = 0;
    a->dims[0].stride = 1;
    struct r32 b_value;
    struct r32* b = &b_value;
    float *b_data;
    b->data = b_data;
    b->n_dims = 1;
    b->offset = 0;
    b->dims[0].lower_bound = 1;
    b->dims[0].length = 0;
    b->dims[0].stride = 1;
    int32_t i;
    a->n_dims = 1;
    a->dims[0].lower_bound = 1;
    a->dims[0].length = 10000000;
    a->dims[0].stride = 1;
    a->data = (float*) _lfortran_malloc(1*a->dims[0].length*sizeof(float));
    a->is_allocated = true;
    b->n_dims = 1;
    b->dims[0].lower_bound = 1;
    b->dims[0].length = 10000000;
    b->dims[0].stride = 1;
    b->data = (float*) _lfortran_malloc(1*b->dims[0].length*sizeof(float));
    b->is_allocated = true;
    for (__libasr_index_0_=((int32_t)b->dims[1-1].lower_bound); __libasr_index_0_<=((int32_t) b->dims[1-1].length + b->dims[1-1].lower_bound - 1); __libasr_index_0_++) {
        b->data[((0 + (b->dims[0].stride * (__libasr_index_0_ - b->dims[0].lower_bound))) + b->offset)] = (float)(5);
    }
    float *d_a_data = NULL;
    float *d_b_data = NULL;
    cudaError_t err;
    size_t a_data_size = a->dims[0].length * sizeof(float);
    err = cudaMalloc((void**)&d_a_data, a_data_size);
    if (err != cudaSuccess) {
        fprintf(stderr, "cudaMalloc failed for a_data: %s", cudaGetErrorString(err));
        exit(1);
    }
    size_t b_data_size = b->dims[0].length * sizeof(float);
    err = cudaMalloc((void**)&d_b_data, b_data_size);
    if (err != cudaSuccess) {
        fprintf(stderr, "cudaMalloc failed for b_data: %s", cudaGetErrorString(err));
        exit(1);
    }
    err = cudaMemcpy(d_a_data, a->data, a_data_size, cudaMemcpyHostToDevice);
    if (err != cudaSuccess) {
        fprintf(stderr, "cudaMemcpy H2D failed for a_data: %s", cudaGetErrorString(err));
        exit(1);
    }
    err = cudaMemcpy(d_b_data, b->data, b_data_size, cudaMemcpyHostToDevice);
    if (err != cudaSuccess) {
        fprintf(stderr, "cudaMemcpy H2D failed for b_data: %s", cudaGetErrorString(err));
        exit(1);
    }
    struct r32 h_a_copy = *a;
    h_a_copy.data = d_a_data;
    struct r32 h_b_copy = *b;
    h_b_copy.data = d_b_data;
    struct r32 *d_a_struct = NULL;
    err = cudaMalloc((void**)&d_a_struct, sizeof(struct r32));
    if (err != cudaSuccess) {
        fprintf(stderr, "cudaMalloc failed for d_a_struct: %s", cudaGetErrorString(err));
        exit(1);
    }
    struct r32 *d_b_struct = NULL;
    err = cudaMalloc((void**)&d_b_struct, sizeof(struct r32));
    if (err != cudaSuccess) {
        fprintf(stderr, "cudaMalloc failed for d_b_struct: %s", cudaGetErrorString(err));
        exit(1);
    }
    err = cudaMemcpy(d_a_struct, &h_a_copy, sizeof(struct r32), cudaMemcpyHostToDevice);
    if (err != cudaSuccess) {
        fprintf(stderr, "cudaMemcpy H2D failed for d_a_struct: %s", cudaGetErrorString(err));
        exit(1);
    }
    err = cudaMemcpy(d_b_struct, &h_b_copy, sizeof(struct r32), cudaMemcpyHostToDevice);
    if (err != cudaSuccess) {
        fprintf(stderr, "cudaMemcpy H2D failed for d_b_struct: %s", cudaGetErrorString(err));
        exit(1);
    }
    int i_n = 10000000;
    int threads_per_block = 256;
    int blocks = (i_n + threads_per_block - 1) / threads_per_block;
    dim3 grid_dim = {blocks, 1, 1};
    dim3 block_dim = {threads_per_block, 1, 1};
    void *kernel_args[] = {&d_a_struct, &d_b_struct, &i_n};
    err = cudaLaunchKernel((void*)compute_kernel_0, grid_dim, block_dim, kernel_args, 0, NULL);
    if (err != cudaSuccess) {
        fprintf(stderr, "cudaLaunchKernel failed: %s", cudaGetErrorString(err));
        exit(1);
    }
    err = cudaDeviceSynchronize();
    if (err != cudaSuccess) {
        fprintf(stderr, "cudaDeviceSynchronize failed: %s", cudaGetErrorString(err));
        exit(1);
    }
    err = cudaMemcpy(a->data, d_a_data, a_data_size, cudaMemcpyDeviceToHost);
    if (err != cudaSuccess) {
        fprintf(stderr, "cudaMemcpy D2H failed for a_data: %s", cudaGetErrorString(err));
        exit(1);
    }
    err = cudaMemcpy(b->data, d_b_data, b_data_size, cudaMemcpyDeviceToHost);
    if (err != cudaSuccess) {
        fprintf(stderr, "cudaMemcpy D2H failed for b_data: %s", cudaGetErrorString(err));
        exit(1);
    }
    cudaFree(d_a_data);
    cudaFree(d_a_struct);
    cudaFree(d_b_data);
    cudaFree(d_b_struct);
    printf("%f%s%f", a->data[((0 + (a->dims[0].stride * (5 - a->dims[0].lower_bound))) + a->offset)], " ", b->data[((0 + (b->dims[0].stride * (5 - b->dims[0].lower_bound))) + b->offset)]);
    if (a->data[((0 + (a->dims[0].stride * (5 - a->dims[0].lower_bound))) + a->offset)] != (float)(1705)) {
        fprintf(stderr, "ERROR STOP");
        exit(1);
    }
    if (b->data[((0 + (b->dims[0].stride * (5 - b->dims[0].lower_bound))) + b->offset)] != (float)(5)) {
        fprintf(stderr, "ERROR STOP");
        exit(1);
    }
    // FIXME: implicit deallocate(a, b, );
    return 0;
}
`;

  const cpuImplH = `#ifndef CPU_IMPL_H
#define CPU_IMPL_H
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <omp.h>
#include <math.h>
// CUDA Runtime API Emulation for CPU
typedef enum {
    cudaSuccess = 0,
    cudaErrorMemoryAllocation = 2,
    cudaErrorInvalidValue = 11
} cudaError_t;
// Device execution configuration
typedef struct {
    unsigned int x, y, z;
} dim3;
// Thread and block index emulation
typedef struct {
    unsigned int x, y, z;
} uint3;
// Global thread identifiers (CPU emulation)
extern __thread uint3 threadIdx;
extern __thread uint3 blockIdx;
extern __thread dim3 blockDim;
extern __thread dim3 gridDim;
// Memory management API
cudaError_t cudaMalloc(void **devPtr, size_t size);
cudaError_t cudaFree(void *devPtr);
cudaError_t cudaMemcpy(void *dst, const void *src, size_t count, int kind);
cudaError_t cudaDeviceSynchronize(void);
// Memory copy kinds
#define cudaMemcpyHostToDevice 1
#define cudaMemcpyDeviceToHost 2
#define cudaMemcpyDeviceToDevice 3
// Kernel launch emulation - NOTE: Changed function signature
cudaError_t cudaLaunchKernel(void *func, dim3 gridDim, dim3 blockDim,
                            void **args, size_t sharedMem, void *stream);
// Error handling
const char* cudaGetErrorString(cudaError_t error);
// Device synchronization
#define __syncthreads() _Pragma("omp barrier")
// Memory allocation tracking structure
typedef struct {
    void *cpu_ptr;
    void *device_ptr;
    size_t size;
    int is_allocated;
} memory_tracker_t;
// Initialization function
void cpu_runtime_init(void);
void cpu_runtime_cleanup(void);
#endif // CPU_IMPL_H
`;

  const cpuImplC = `#include "cpu_impl.h"
// Thread-local storage for CUDA-like thread coordinates
__thread uint3 threadIdx = {0, 0, 0};
__thread uint3 blockIdx = {0, 0, 0};
__thread dim3 blockDim = {1, 1, 1};
__thread dim3 gridDim = {1, 1, 1};
int counts=0;
// Memory tracking table
#define MAX_ALLOCATIONS 1024
memory_tracker_t memory_table[MAX_ALLOCATIONS];
int memory_count = 0;
// CPU Runtime initialization
void cpu_runtime_init(void) {
    memory_count = 0;
    for (int i = 0; i < 1024; i++) {
        memory_table[i].cpu_ptr = NULL;
        memory_table[i].device_ptr = NULL;
        memory_table[i].size = 0;
        memory_table[i].is_allocated = 0;
    }
}
void cpu_runtime_cleanup(void) {
    for (int i = 0; i < memory_count; i++) {
        if (memory_table[i].is_allocated && memory_table[i].cpu_ptr) {
            free(memory_table[i].cpu_ptr);
            memory_table[i].is_allocated = 0;
        }
    }
    memory_count = 0;
}
// CUDA Memory Management API Emulation
cudaError_t cudaMalloc(void **devPtr, size_t size) {
    if(memory_count > MAX_ALLOCATIONS) {
        fprintf(stderr, "Error: Exceeded maximum memory allocations (%d)\n", MAX_ALLOCATIONS);
        return cudaErrorMemoryAllocation;
    }
    void *ptr = malloc(size);
    if (!ptr) {
        return cudaErrorMemoryAllocation;
    }
    *devPtr = ptr;
    memory_table[memory_count].cpu_ptr = ptr;
    memory_table[memory_count].device_ptr = ptr; // Same on CPU
    memory_table[memory_count].size = size;
    memory_table[memory_count].is_allocated = 1;
    memory_count++;
    return cudaSuccess;
}
cudaError_t cudaFree(void *devPtr) {
    for (int i = 0; i < memory_count; i++) {
        if (memory_table[i].device_ptr == devPtr && memory_table[i].is_allocated) {
            free(memory_table[i].cpu_ptr);
            memory_table[i].is_allocated = 0;
            return cudaSuccess;
        }
    }
    return cudaErrorInvalidValue;
}
cudaError_t cudaMemcpy(void *dst, const void *src, size_t count, int kind) {
    memcpy(dst, src, count);
    return cudaSuccess;
}
cudaError_t cudaDeviceSynchronize(void) {
    return cudaSuccess;
}
// Forward declaration for the kernel wrapper
void compute_kernel_wrapper(void **args, void *func);
// kernel execution emulation
cudaError_t cudaLaunchKernel(void *func, dim3 grid_dim, dim3 block_dim,
                            void **args, size_t sharedMem, void *stream) {
    long long total_blocks = grid_dim.x * grid_dim.y * grid_dim.z;
    long long threads_per_block = block_dim.x * block_dim.y * block_dim.z;
    long long total_threads = total_blocks * threads_per_block;
    long long max_omp_threads = omp_get_max_threads();
    long long threads_to_use = (total_blocks < max_omp_threads) ? total_blocks : max_omp_threads;
    #pragma omp parallel num_threads(threads_to_use)
    {
        long long omp_thread_id = omp_get_thread_num();
        long long num_omp_threads = omp_get_num_threads();
        for (long long block_id = omp_thread_id; block_id < total_blocks; block_id += num_omp_threads) {
            long long bx = block_id % grid_dim.x;
            long long by = (block_id / grid_dim.x) % grid_dim.y;
            long long bz = block_id / (grid_dim.x * grid_dim.y);
            for (long long thread_in_block = 0; thread_in_block < threads_per_block; thread_in_block++) {
                blockIdx.x = bx;
                blockIdx.y = by;
                blockIdx.z = bz;
                threadIdx.x = thread_in_block % block_dim.x;
                threadIdx.y = (thread_in_block / block_dim.x) % block_dim.y;
                threadIdx.z = thread_in_block / (block_dim.x * block_dim.y);
                blockDim = block_dim;
                gridDim = grid_dim;
                compute_kernel_wrapper(args, func);
            }
        }
    }
    return cudaSuccess;
}
// Error handling
const char* cudaGetErrorString(cudaError_t error) {
    switch (error) {
        case cudaSuccess:
            return "cudaSuccess";
        case cudaErrorMemoryAllocation:
            return "cudaErrorMemoryAllocation";
        case cudaErrorInvalidValue:
            return "cudaErrorInvalidValue";
        default:
            return "Unknown CUDA error";
    }
}
`;

  return (
    <div className="post-content space-y-8">
      {/* Recap and Motivation Section */}
      <div className="relative">
        {/* <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500 dark:from-indigo-400 dark:to-purple-400 mb-6 leading-tight">
          GSoC 2025: Week 11 Contribution to OpenMP Support in LFortran
        </h1> */}
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          Following Week 10’s extension of the C-backend for target offloading, Week 11 focused on finding a way to test this on CI. After a fruitful discussion with my mentors Ondrej and Pranav, we agreed on a dual-mode approach for CPU and GPU testing. I spent about 32 hours adapting the C-backend to generate CUDA-specific code while maintaining CPU compatibility, ensuring the code works on both platforms with a simple switch.
        </p>
      </div>

      {/* Discussion and Strategy */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Discussion and Strategy with Mentors
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          This week, I worked with Ondrej and Pranav to figure out how to test target offloading on CI, since GitHub Actions lacks GPU access. Our conclusion was to generate C-code with API calls, provide our own CPU implementations for CI testing (using a <code className="font-semibold text-indigo-600 dark:text-indigo-400">CPU_ENABLED</code> switch), and use CUDA runtime for GPU testing (with a <code className="font-semibold text-indigo-600 dark:text-indigo-400">GPU_ENABLED</code> switch). The plan was to extend the C-backend to produce CUDA code equivalent to the <code className="font-semibold text-indigo-600 dark:text-indigo-400">target</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">teams</code>, and <code className="font-semibold text-indigo-600 dark:text-indigo-400">distribute parallel do</code> constructs, including <code className="font-semibold text-indigo-600 dark:text-indigo-400">map</code> clauses, while keeping CPU compatibility.
        </p>
      </div>

      {/* Implementation Approach */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Implementation Approach
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          I started by building on last week’s C-backend output, which used OpenMP pragmas like <code className="font-semibold text-indigo-600 dark:text-indigo-400">target</code>. I added a <code className="font-semibold text-indigo-600 dark:text-indigo-400">--target-offload</code> flag to LFortran. When I run <code className="font-semibold text-indigo-600 dark:text-indigo-400">lfortran --openmp --show-c</code>, it generates the usual OpenMP C code. With <code className="font-semibold text-indigo-600 dark:text-indigo-400">lfortran --openmp --show-c --target-offload</code>, it produces CUDA-specific code. This keeps backward compatibility and lets me switch modes easily.
        </p>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          For the CUDA code, I first handwrote a version to test the concept, using LFortran’s array struct (<code className="font-semibold text-indigo-600 dark:text-indigo-400">struct r32</code> for floats) and ensuring the results matched. Initially, I thought to transfer each struct member (like <code className="font-semibold text-indigo-600 dark:text-indigo-400">data</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">dims</code>) to the GPU separately, but this was inefficient and required editing every statement in the kernel. Instead, I copied the whole struct to the device using <code className="font-semibold text-indigo-600 dark:text-indigo-400">cudaMalloc</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">cudaMemcpy</code>, updating only the <code className="font-semibold text-indigo-600 dark:text-indigo-400">data</code> pointer to point to device memory. This simplified the code generation process.
        </p>
      </div>

      {/* Code Structure and Dual-Mode Support */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Code Structure and Dual-Mode Support
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          The generated code uses a macro <code className="font-semibold text-indigo-600 dark:text-indigo-400">USE_GPU</code> to switch between GPU and CPU modes. Here’s how it works:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li><strong>GPU Mode (<code className="font-semibold text-indigo-600 dark:text-indigo-400">USE_GPU</code> defined)</strong>: Includes <code className="font-semibold text-indigo-600 dark:text-indigo-400">cuda_runtime.h</code>, uses CUDA functions like <code className="font-semibold text-indigo-600 dark:text-indigo-400">cudaMalloc</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">cudaLaunchKernel</code>, and compiles with <code className="font-semibold text-indigo-600 dark:text-indigo-400">nvcc</code>. The kernel is marked <code className="font-semibold text-indigo-600 dark:text-indigo-400">__global__</code>, and thread and block IDs are set using CUDA’s grid and block dimensions.</li>
          <li><strong>CPU Mode (<code className="font-semibold text-indigo-600 dark:text-indigo-400">USE_GPU</code> not defined)</strong>: Includes <code className="font-semibold text-indigo-600 dark:text-indigo-400">cpu_impl.h</code>, which provides CPU implementations of CUDA functions using OpenMP. For example, <code className="font-semibold text-indigo-600 dark:text-indigo-400">cudaLaunchKernel</code> emulates parallelism with <code className="font-semibold text-indigo-600 dark:text-indigo-400">#pragma omp parallel</code>, adjusting <code className="font-semibold text-indigo-600 dark:text-indigo-400">blockIdx</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">threadIdx</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">blockDim</code>, and <code className="font-semibold text-indigo-600 dark:text-indigo-400">gridDim</code> to mimic CUDA behavior.</li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          The kernel function <code className="font-semibold text-indigo-600 dark:text-indigo-400">compute_kernel_0</code> is defined with <code className="font-semibold text-indigo-600 dark:text-indigo-400">__global__</code> for GPU or as a regular function for CPU. Memory management uses <code className="font-semibold text-indigo-600 dark:text-indigo-400">cudaMalloc</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">cudaMemcpy</code> on GPU, or <code className="font-semibold text-indigo-600 dark:text-indigo-400">malloc</code> and <code className="font-semibold text-indigo-600 dark:text-indigo-400">memcpy</code> on CPU, tracked in a <code className="font-semibold text-indigo-600 dark:text-indigo-400">memory_tracker_t</code> structure.
        </p>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View MRE for Target Offloading (openmp_70.f90)
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
                    {offloadingMre}
                </SyntaxHighlighter>
            </div>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Generated C Code with OpenMP (with lfortran --openmp --show-c)
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
                    language="c"
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
                    {cDumpOmp}
                </SyntaxHighlighter>
            </div>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View Generated C Code with CUDA (omp_off_gen.c) (with lfortran --openmp --show-c --target-offload)
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
                    language="c"
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
                    {cDumpCuda}
                </SyntaxHighlighter>
            </div>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View CPU Implementation Header (cpu_impl.h)
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
                    language="c"
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
                    {cpuImplH}
                </SyntaxHighlighter>
            </div>
          </div>
        </details>
        <details className="mt-4">
          <summary className="cursor-pointer text-lg font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
            View CPU Implementation Source (cpu_impl.c)
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
                    language="c"
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
                    {cpuImplC}
                </SyntaxHighlighter>
            </div>
          </div>
        </details>
      </div>

      {/* Running the Code */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Running the Generated C-Code in Both Modes
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          The code can run in two modes depending on the compiler and flags:
        </p>
        <ul className="list-disc pl-6 space-y-6 text-lg text-gray-700 dark:text-gray-300">
            <li>
                <strong>GPU Mode</strong>: Compile with <code className="font-semibold text-indigo-600 dark:text-indigo-400">nvcc</code> and define <code className="font-semibold text-indigo-600 dark:text-indigo-400">USE_GPU</code> to use the CUDA runtime.<br />
                <span className="block mt-2 mb-2 font-medium text-gray-800 dark:text-gray-200">Example commands:</span>
                <div className="p-0.5 rounded-lg bg-gradient-to-r from-indigo-100 via-purple-100 to-white dark:from-slate-800 dark:via-indigo-900 dark:to-slate-900 border border-indigo-100 dark:border-indigo-800">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono leading-relaxed space-y-1">
                        <div>
                            <span className="text-indigo-600 dark:text-indigo-400">$</span> gcc -I/lfortran/src/libasr/runtime -I/lfortran/src/ -c /lfortran/src/libasr/runtime/lfortran_intrinsics.c -o intrinsic.o
                        </div>
                        <div>
                            <span className="text-indigo-600 dark:text-indigo-400">$</span> nvcc -O2 -x cu -DUSE_GPU -I/lfortran/src/libasr/runtime -I/lfortran/src/ -c omp_off_gen.c -o omp_off_gen.o
                        </div>
                        <div>
                            <span className="text-indigo-600 dark:text-indigo-400">$</span> nvcc intrinsic.o omp_off_gen.o -lm -o a
                        </div>
                        <div>
                            <span className="text-indigo-600 dark:text-indigo-400">$</span> ./a
                        </div>
                    </div>
                </div>
                <span className="block mt-2">This offloads the computation to the GPU, using CUDA functions for memory management and kernel execution.</span>
            </li>
            <li>
                <strong>CPU Mode</strong>: Compile with <code className="font-semibold text-indigo-600 dark:text-indigo-400">gcc</code> and include <code className="font-semibold text-indigo-600 dark:text-indigo-400">cpu_impl.c</code> for CPU emulation.<br />
                <span className="block mt-2 mb-2 font-medium text-gray-800 dark:text-gray-200">Example commands:</span>
                <div className="p-0.5 rounded-lg bg-gradient-to-r from-indigo-100 via-purple-100 to-white dark:from-slate-800 dark:via-indigo-900 dark:to-slate-900 border border-indigo-100 dark:border-indigo-800">
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm font-mono leading-relaxed space-y-1">
                        <div>
                            <span className="text-indigo-600 dark:text-indigo-400">$</span> gcc -I/lfortran/src/libasr/runtime -I/lfortran/src/ -c /lfortran/src/libasr/runtime/lfortran_intrinsics.c -o intrinsic.o
                        </div>
                        <div>
                            <span className="text-indigo-600 dark:text-indigo-400">$</span> gcc -fopenmp -I/lfortran/src/libasr/runtime -I/lfortran/src/ cpu_impl.c omp_off_gen.c intrinsic.o -lm -o a
                        </div>
                        <div>
                            <span className="text-indigo-600 dark:text-indigo-400">$</span> ./a
                        </div>
                    </div>
                </div>
                <span className="block mt-2">This runs the code on the CPU, using OpenMP for parallelism and emulating CUDA behavior with the provided library.</span>
            </li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          Both modes produce the same result (<code className="font-semibold text-indigo-600 dark:text-indigo-400">a(5) = 1705</code>, <code className="font-semibold text-indigo-600 dark:text-indigo-400">b(5) = 5</code>), ensuring consistency across platforms.
        </p>
      </div>

      {/* Next Steps Section */}
      <div>
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-10 mb-4 border-l-4 border-indigo-500 pl-4">
          Next Steps
        </h2>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
          For Week 12, I plan to:
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li>Prepare a PR with the dual-mode C-backend changes once CI testing is resolved.</li>
          <li>Extend support for more complex offloading scenarios, like nested regions.</li>
        </ul>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
          I thank my mentors, <a href="https://github.com/certik" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Ondrej Certik</a>, <a href="https://github.com/Pranavchiku" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Pranav Goswami</a>, and <a href="https://github.com/gxyd" className="text-indigo-500 dark:text-indigo-400 hover:underline" target="_blank" rel="noopener noreferrer">Gaurav Dhingra</a>, for their valuable insights during our meeting. I also appreciate the LFortran community’s support as I work on this exciting feature.
        </p>
      </div>
    </div>
  );
}