import { PrismaClient } from '@prisma/client';

// Para evitar múltiples instancias durante hot reloading en desarrollo
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configurar Prisma Client con eventos de log
const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // Logs de diferentes niveles
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL,
      },
    },
  });

  // Deja que Prisma maneje los logs automáticamente
  return client;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
