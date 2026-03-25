import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Only create Prisma client if not in build environment
let prisma: PrismaClient | null = null;

if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  // Development environment - create client
  prisma = globalForPrisma.prisma ??
    new PrismaClient({
      log: ["error"],
    });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
}

// Export a proxy that creates client on demand
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    if (!prisma) {
      // Create client on first access
      if (typeof window === 'undefined') {
        if (!process.env.DATABASE_URL && !process.env.DIRECT_URL) {
          throw new Error(
            "DATABASE_URL and DIRECT_URL are not set. Prisma cannot connect without a valid database connection string."
          );
        }

        prisma = globalForPrisma.prisma ??
          new PrismaClient({
            log: ["error"],
          });

        if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
      } else {
        throw new Error('Prisma client not available on client side');
      }
    }

    const value = (prisma as any)[prop];
    if (typeof value === 'function') {
      return value.bind(prisma);
    }
    return value;
  },
});
