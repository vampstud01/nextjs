import { PrismaClient } from "@prisma/client";

// 개발 환경에서 hot reload 시 PrismaClient가 여러 번 생성되지 않도록 글로벌 캐시 사용
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}


