import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Enhanced Prisma client configuration with connection pooling and error handling
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    errorFormat: 'pretty',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Database connection state tracking
let isConnected = false;
let connectionRetries = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Enhanced connection function with retry logic
export async function connectToDatabase(): Promise<{ success: boolean; error?: string }> {
  if (isConnected) {
    return { success: true };
  }

  try {
    await db.$connect();
    await db.$queryRaw`SELECT 1`; // Test the connection
    isConnected = true;
    connectionRetries = 0;
    // eslint-disable-next-line no-console
    console.log('✅ Database connected successfully');
    return { success: true };
  } catch (error) {
    connectionRetries++;
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    console.error(`❌ Database connection attempt ${connectionRetries}/${MAX_RETRIES} failed:`, errorMessage);

    if (connectionRetries < MAX_RETRIES) {
      // eslint-disable-next-line no-console
    console.log(`⏳ Retrying connection in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectToDatabase(); // Recursive retry
    }

    return { success: false, error: errorMessage };
  }
}

// Enhanced disconnect function
export async function disconnectFromDatabase(): Promise<{ success: boolean; error?: string }> {
  try {
    await db.$disconnect();
    isConnected = false;
    // eslint-disable-next-line no-console
    console.log('✅ Database disconnected successfully');
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown disconnect error';
    console.error('❌ Failed to disconnect from database:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// Comprehensive health check function
export async function checkDatabaseHealth() {
  try {
    const startTime = Date.now();
    
    // Test basic connectivity
    await db.$queryRaw`SELECT 1`;
    
    // Test database info
    const result = await db.$queryRaw<Array<{ version: string }>>`SELECT version()`;
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy' as const,
      message: 'Database connection is working',
      responseTime,
      version: result[0]?.version || 'Unknown',
      connectionPool: {
        isConnected,
        retries: connectionRetries,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      status: 'unhealthy' as const,
      message: `Database connection failed: ${errorMessage}`,
      responseTime: null,
      version: null,
      connectionPool: {
        isConnected,
        retries: connectionRetries,
      },
      error: errorMessage,
    };
  }
}

// Database transaction wrapper with error handling
export async function withTransaction<T>(
  operation: (_tx: any) => Promise<T>,
  maxRetries = 3
): Promise<{ success: boolean; data?: T; error?: string }> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      const result = await db.$transaction(async (prismaTransaction) => {
        return await operation(prismaTransaction);
      });
      
      return { success: true, data: result };
    } catch (error) {
      attempt++;
      const errorMessage = error instanceof Error ? error.message : 'Transaction failed';
      
      // Check if error is retryable (connection issues, deadlocks)
      const isRetryable = errorMessage.includes('connection') || 
                         errorMessage.includes('deadlock') ||
                         errorMessage.includes('timeout');
      
      if (attempt >= maxRetries || !isRetryable) {
        // eslint-disable-next-line no-console
        console.error(`❌ Transaction failed after ${attempt} attempts:`, errorMessage);
        return { success: false, error: errorMessage };
      }
      
      // eslint-disable-next-line no-console
      console.warn(`⚠️ Transaction attempt ${attempt} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // Exponential backoff
    }
  }
  
  return { success: false, error: 'Max retries exceeded' };
}

// Database query optimization helpers
export const queryHelpers = {
  // Common booking queries with optimized includes
  getBookingWithDetails: (id: string) =>
    db.booking.findUnique({
      where: { id },
      include: {
        calendarAvailability: {
          select: { date: true, isAvailable: true },
        },
        emailNotifications: {
          select: { 
            status: true, 
            templateName: true, 
            sentAt: true,
            createdAt: true 
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    }),

  // Optimized booking list query
  getBookingsList: (filters: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    limit?: number;
    offset?: number;
  } = {}) => {
    const { status, dateFrom, dateTo, limit = 50, offset = 0 } = filters;
    
    return db.booking.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(dateFrom && dateTo && {
          eventDate: {
            gte: dateFrom,
            lte: dateTo,
          },
        }),
      },
      select: {
        id: true,
        bookingReference: true,
        clientName: true,
        clientEmail: true,
        eventDate: true,
        eventType: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,
      },
      orderBy: [
        { eventDate: 'asc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    });
  },

  // Calendar availability with performance optimization
  getCalendarAvailability: (startDate: Date, endDate: Date) =>
    db.calendarAvailability.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        date: true,
        isAvailable: true,
        blockedReason: true,
        booking: {
          select: {
            id: true,
            clientName: true,
            eventType: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    }),
};

// Connection cleanup on process termination
process.on('SIGINT', async () => {
  // eslint-disable-next-line no-console
  console.log('🔄 Gracefully shutting down database connections...');
  await disconnectFromDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  // eslint-disable-next-line no-console
  console.log('🔄 Gracefully shutting down database connections...');
  await disconnectFromDatabase();
  process.exit(0);
});
