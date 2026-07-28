import { NextResponse } from "next/server";

import { listCompanyLeadOwners } from "@/services/leads.service";

export async function GET() {
  try {
    const users =
      await listCompanyLeadOwners();

    return NextResponse.json({
      users,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Não foi possível carregar os responsáveis.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 500,
      }
    );
  }
}