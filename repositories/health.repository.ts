import { prisma } from "@/lib/prisma";
export async function checkDatabaseConnection() { await prisma.$queryRaw`SELECT 1`; return true; }
