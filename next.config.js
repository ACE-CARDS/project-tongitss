/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [
      {
        source: "/rest/:path*",
        destination: "http://localhost:3001/:path*",
      },
      {
        source: "/storage/:path*",
        destination: "http://localhost:9000/:path*",
      },
      {
        source: "/files/:path*",
        destination: "http://localhost:9000/:path*",
      },
    ];
  },
};

module.exports = nextConfig;