import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient();
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

// Configuración para evitar el error de prepared statements
if (prisma.$use) {
  prisma.$use(async (params, next) => {
    // Aquí podrías añadir lógica adicional en el futuro si es necesario
    return next(params);
  });
}

export default prisma;

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
