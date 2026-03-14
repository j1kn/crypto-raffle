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
  webpack: (config, { isServer }) => {
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
    
    // Fix for indexedDB during SSR
    if (isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  // Disable static optimization for pages using Web3Modal
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

module.exports = nextConfig;

