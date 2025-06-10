import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Añadido para permitir la conexión desde el entorno de vista previa de Firebase Studio
  allowedDevOrigins: ['https://6000-firebase-studio-1748007214601.cluster-pgviq6mvsncnqxx6kr7pbz65v6.cloudworkstations.dev'],
};

export default nextConfig;
