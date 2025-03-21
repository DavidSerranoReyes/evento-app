import 'server-only';
import { unstable_cache } from 'next/cache';
import { notFound } from 'next/navigation';
import prisma from './db';
import { capitalize } from './utils';

// Función auxiliar para manejar errores de prepared statements
async function executeQuery<T>(queryFn: () => Promise<T>): Promise<T> {
  try {
    return await queryFn();
  } catch (error: any) {
    if (
      error?.message?.includes('prepared statement') ||
      (error?.kind === 'QueryError' &&
        error?.message?.includes('s0 already exists'))
    ) {
      console.log(
        'Intentando reconectar debido a error de prepared statement...'
      );
      // Pequeña pausa antes de reintentar
      await new Promise((resolve) => setTimeout(resolve, 50));
      try {
        return await queryFn();
      } catch (retryError) {
        console.error('Reintento fallido:', retryError);
        throw retryError;
      }
    }
    throw error;
  }
}

export const getEvents = unstable_cache(async (city: string, page = 1) => {
  const eventsPromise = executeQuery(() =>
    prisma.eventoEvent.findMany({
      where: {
        city: city === 'all' ? undefined : capitalize(city),
      },
      orderBy: {
        date: 'asc',
      },
      take: 6,
      skip: (page - 1) * 6,
    })
  );

  let totalCountPromise;
  if (city === 'all') {
    totalCountPromise = executeQuery(() => prisma.eventoEvent.count());
  } else {
    totalCountPromise = executeQuery(() =>
      prisma.eventoEvent.count({
        where: {
          city: capitalize(city),
        },
      })
    );
  }

  // Ejecutar ambas consultas en paralelo
  const [events, totalCount] = await Promise.all([
    eventsPromise,
    totalCountPromise,
  ]);

  return {
    events,
    totalCount,
  };
});

export const getEvent = unstable_cache(async (slug: string) => {
  const event = await executeQuery(() =>
    prisma.eventoEvent.findUnique({
      where: {
        slug: slug,
      },
    })
  );

  if (!event) {
    return notFound();
  }

  return event;
});
