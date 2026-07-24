import { NextResponse } from "next/server";

import { accessErrorResponse } from "@/lib/api/access-response";
import { getCurrentUserAccess } from "@/services/auth.service";

export async function GET() {
  try {
    const user = await getCurrentUserAccess();
    return NextResponse.json(
      {
        role: user.role,
        clientConfigured: Boolean(user.clientId),
      },
      {
        headers: {
          "Cache-Control": "private, no-store",
        },
      }
    );
  } catch (error) {
    return (
      accessErrorResponse(error) ??
      NextResponse.json({ error: "Acesso não configurado." }, { status: 403 })
    );
  }
}
