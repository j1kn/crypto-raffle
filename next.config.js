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
  webpack: (config) => {
    // Ignore all optional connector dependencies that aren't installed
    const optionalDeps = [
      'porto/internal',
      'porto',
      '@base-org/account',
      '@coinbase/wallet-sdk',
      '@gemini-wallet/core',
      '@metamask/sdk',
      '@safe-global/safe-apps-sdk',
      '@safe-global/safe-apps-provider',
      'pino-pretty',
    ];
    
    config.resolve.fallback = {
      ...config.resolve.fallback,
      ...optionalDeps.reduce((acc, dep) => {
        acc[dep] = false;
        return acc;
      }, {}),
    };
    
    return config;
  },
  // Netlify plugin handles the build output
  // Don't use 'standalone' output for Netlify
};

module.exports = nextConfig;

