import { NextResponse } from "next/server";
import { listNotifications } from "@/services/notifications.service";

export async function GET(request: Request) {
  try {
    const requestedLimit = Number(new URL(request.url).searchParams.get("limit"));
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 20) : undefined;
    return NextResponse.json(await listNotifications(limit));
  } catch (error) {
    console.error("Erro ao carregar notificações:", error);
    return NextResponse.json({ error: "Não foi possível carregar as notificações." }, { status: 500 });
  }
}
