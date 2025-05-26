/** @type {import("next").NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  output: 'export',
  // basePath: '/gsoc-blogs',
  // assetPrefix: '/gsoc-blogs/',
  trailingSlash: true,
};

module.exports = nextConfig;
