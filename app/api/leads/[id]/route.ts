import { NextResponse } from "next/server";
import { getCompanyLeadById } from "@/services/leads.service";

const TEMP_COMPANY_ID = "default-company";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  context: Context
) {
  try {
    const { id } = await context.params;

    const lead = await getCompanyLeadById(
      id,
      TEMP_COMPANY_ID
    );

    return NextResponse.json(lead);

  } catch (error) {

    console.error(
      "ERRO AO BUSCAR LEAD:",
      error
    );

    return NextResponse.json(
      {
        error: "Erro ao buscar lead.",
      },
      {
        status: 500,
      }
    );
  }
}