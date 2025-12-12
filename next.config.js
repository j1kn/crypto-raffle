/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'puofbkubhtkynvdlwquu.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // Netlify plugin handles the build output
  // Don't use 'standalone' output for Netlify
};

module.exports = nextConfig;

