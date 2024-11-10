/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      appDir: true,
    },
    webpack: (config) => {
      config.externals = [...config.externals, { canvas: 'canvas' }];  // required for Chart.js
      return config;
    },
  };
  
  export default nextConfig;
  