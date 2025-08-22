import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Helper function to handle database connection errors
export async function connectToDatabase() {
  try {
    await db.$connect();
    console.warn('✅ Connected to database successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    return false;
  }
}

// Helper function to disconnect from database
export async function disconnectFromDatabase() {
  try {
    await db.$disconnect();
    console.warn('✅ Disconnected from database successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to disconnect from database:', error);
    return false;
  }
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    await db.$queryRaw`SELECT 1`;
    return { status: 'healthy', message: 'Database connection is working' };
  } catch (error) {
    return {
      status: 'unhealthy',
      message: `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
