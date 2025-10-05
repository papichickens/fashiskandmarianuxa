import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**', // Allow all paths from this hostname
      },
      // You will add your Firebase Storage hostname here later!
      // Example for Firebase Storage (adjust bucket name):
      // {
      //   protocol: 'https',
      //   hostname: 'firebasestorage.googleapis.com',
      //   port: '',
      //   pathname: '/v0/b/your-firebase-project.appspot.com/o/**',
      // },
    ],
  },
};

export default nextConfig;
