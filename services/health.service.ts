import { checkDatabaseConnection } from "@/repositories/health.repository";
export async function getHealthStatus() { const startedAt = Date.now(); await checkDatabaseConnection(); return { status: "ok", database: "connected", responseTimeMs: Date.now() - startedAt, timestamp: new Date().toISOString() }; }
