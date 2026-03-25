import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create a mock Prisma client for build time
const createMockClient = () => {
  const mockQuery = () => Promise.resolve([]);
  const mockModel = {
    findMany: mockQuery,
    findUnique: mockQuery,
    findFirst: mockQuery,
    create: mockQuery,
    update: mockQuery,
    delete: mockQuery,
    count: () => Promise.resolve(0),
  };

  return {
    user: mockModel,
    event: mockModel,
    eventOccurrence: mockModel,
    track: mockModel,
    session: mockModel,
    booking: mockModel,
    resource: mockModel,
    question: mockModel,
    certificate: mockModel,
    $connect: () => Promise.resolve(),
    $disconnect: () => Promise.resolve(),
  } as unknown as PrismaClient;
};

// Only create real Prisma client in runtime, not build time
let prisma: PrismaClient;

if (typeof window === 'undefined' && process.env.DATABASE_URL && process.env.NODE_ENV === 'production') {
  // Production runtime - create real client
  prisma = globalForPrisma.prisma ??
    new PrismaClient({
      log: ["error"],
    });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
} else {
  // Build time or client side - use mock
  prisma = createMockClient();
}

export { prisma };
