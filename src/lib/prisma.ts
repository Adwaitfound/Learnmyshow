import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

export function getPrisma() {
  if (!prisma) {
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
  }

  return prisma;
}

// For backward compatibility, export a getter
export const prisma = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrisma();
    return (client as any)[prop];
  },
});
