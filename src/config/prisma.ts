import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';
import config from './app.config';

const connectionString = config.DATABASE === 'POSTGRES' ? config.POSTGRES_URL : config.POSTGRES_URL;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter, log: ['query', 'info', 'warn', 'error'] });

export { prisma };
