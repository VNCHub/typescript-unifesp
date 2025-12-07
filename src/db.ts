// src/db.ts
import { PrismaClient } from '@prisma/client';

declare global {
  namespace NodeJS {
    interface Global {
      __prisma?: PrismaClient;
    }
  }
}

export const prisma: PrismaClient = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}
