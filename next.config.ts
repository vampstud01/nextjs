import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 Turbopack 설정
  turbopack: {
    // Turbopack 기본 설정 (비어 있어도 됨)
  },
  
  // Source map 설정
  productionBrowserSourceMaps: false,
  
  // Webpack 설정 (--webpack 플래그로 실행할 때만 사용됨)
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // 개발 모드에서 source map 경고 억제
      config.ignoreWarnings = [
        { message: /Invalid source map/ },
        { message: /sourceMapURL could not be parsed/ },
      ];
    }
    return config;
  },
};

export default nextConfig;
