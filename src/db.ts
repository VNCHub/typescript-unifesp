// src/db.ts
import { PrismaClient, Prisma } from './client/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:./prisma/dev.db'
});

const options: Prisma.PrismaClientOptions = {
  adapter,
  accelerateUrl: undefined,
  log: ['error', 'warn'],
};

export const prisma = new PrismaClient(options);