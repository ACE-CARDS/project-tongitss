// Merge these settings into your existing next.config.js
const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  output: 'standalone',            // required by the Dockerfile
  images: {
    remotePatterns: [
      // Allow images from MinIO (replace with your files domain; localhost for dev)
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      // { protocol: 'https', hostname: 'files.example.com' },
    ],
  },
  // Development only: replaces Caddy's /rest/v1 -> PostgREST routing
  async rewrites() {
    if (!isDev) return [];
    return [{ source: '/rest/v1/:path*', destination: 'http://localhost:3001/:path*' }];
  },
};
