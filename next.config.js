


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  output: 'standalone', // Correct value for output
};

// Change from ES module export to CommonJS export
module.exports = nextConfig;
