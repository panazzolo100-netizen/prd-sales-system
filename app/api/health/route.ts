import { NextResponse } from "next/server";
import { getHealthStatus } from "@/services/health.service";
export async function GET() { try { return NextResponse.json(await getHealthStatus()); } catch { return NextResponse.json({ status: "error", database: "unavailable", timestamp: new Date().toISOString() }, { status: 503 }); } }
