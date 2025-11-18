import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack과 Prisma 소스맵 호환성 문제 해결
  experimental: {
    turbo: {
      rules: {
        '*.js': {
          loaders: [],
        },
      },
    },
  },
  // 또는 개발 중 소스맵 비활성화
  productionBrowserSourceMaps: false,
};

export default nextConfig;
