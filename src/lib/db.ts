import { PrismaClient } from '@prisma/client';

// Para evitar múltiples instancias durante hot reloading en desarrollo
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Opciones específicas para entornos serverless
const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.POSTGRES_PRISMA_URL,
      },
    },
  });

  // Método para reconectar en caso de error
  client.$on('error', (e: Error) => {
    // Aquí especificamos el tipo `Error`
    console.error('Prisma Client error - attempting reconnect:', e);
  });

  return client;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
