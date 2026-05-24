import * as PrismaPkg from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import logger from '../utils/logger.js';

// Support different export shapes from @prisma/client (named or default)
const PrismaClient: any = (PrismaPkg as any).PrismaClient ?? (PrismaPkg as any).default ?? PrismaPkg;

// Cloudflare D1 adapter configuration
const getAdapter = () => {
  const globalCtx = globalThis as any;
  if (process.env.NODE_ENV === 'production' && globalCtx.db) {
    // Production: use Cloudflare Workers D1 binding
    return new PrismaD1(globalCtx.db);
  }
  
  // Development: use local SQLite via LibSQL (require dynamically for CommonJS)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pkg = (() => {
    try { return require('@prisma/adapter-libsql'); } catch (e) { return undefined; }
  })();
  const PrismaLibSql = pkg?.PrismaLibSql;
  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
  return new PrismaLibSql({ url: dbUrl });
};

const adapter = getAdapter();

// Global Prisma instance — бир марта яратилади, қайта ишлатилади
const globalForPrisma = globalThis as unknown as {
  prisma: any | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Database connection check
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully (SQLite via Prisma + LibSQL)');
  } catch (error: any) {
    logger.error(`❌ Database connection failed: ${error.message}`);
    throw error;
  }
}

/**
 * Graceful disconnect
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Database disconnected');
}

export default prisma;
