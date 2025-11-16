/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Important for Docker!
  experimental: {
    // Optional: if you want server actions
  },
};

module.exports = nextConfig;
