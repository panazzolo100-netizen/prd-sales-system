import { NextResponse } from "next/server";

import {
  finishCurrentUserFirstAccess,
  getCurrentUserPasswordStatus,
} from "@/services/users.service";

export async function GET() {
  try {
    return NextResponse.json(
      await getCurrentUserPasswordStatus()
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível verificar o primeiro acesso.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 401,
      }
    );
  }
}

export async function PATCH() {
  try {
    return NextResponse.json(
      await finishCurrentUserFirstAccess()
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível concluir o primeiro acesso.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      }
    );
  }
}