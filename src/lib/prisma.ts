import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Lazy-loaded Prisma client
class LazyPrismaClient {
  private client: PrismaClient | null = null;

  private getClient(): PrismaClient {
    if (!this.client) {
      // Only create client when actually needed
      if (typeof window === 'undefined' && process.env.DATABASE_URL) {
        this.client = globalForPrisma.prisma ??
          new PrismaClient({
            log: ["error"],
          });

        if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = this.client;
      } else {
        // During build/static generation, return a minimal mock
        this.client = new Proxy({} as PrismaClient, {
          get: (target, prop) => {
            if (typeof prop === 'string' && prop.startsWith('$')) {
              // Prisma methods like $connect, $disconnect
              return () => Promise.resolve();
            }
            // Return a function that throws during build time
            return (...args: any[]) => {
              throw new Error(`Prisma client not available during build. Property: ${String(prop)}`);
            };
          }
        });
      }
    }
    return this.client;
  }

  get $connect() { return this.getClient().$connect; }
  get $disconnect() { return this.getClient().$disconnect; }
  get user() { return this.getClient().user; }
  get event() { return this.getClient().event; }
  get eventOccurrence() { return this.getClient().eventOccurrence; }
  get track() { return this.getClient().track; }
  get session() { return this.getClient().session; }
  get booking() { return this.getClient().booking; }
  get resource() { return this.getClient().resource; }
  get question() { return this.getClient().question; }
  get certificate() { return this.getClient().certificate; }
}

export const prisma = new LazyPrismaClient();
