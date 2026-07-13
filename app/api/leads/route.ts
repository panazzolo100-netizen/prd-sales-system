import { NextResponse } from "next/server";
import {
  createCompanyLead,
  listCompanyLeads,
  updateCompanyLead,
} from "@/services/leads.service";
import {
  createLeadSchema,
  updateLeadSchema,
} from "@/validators/lead.schema";

const TEMP_COMPANY_ID = "default-company";

export async function GET() {
  try {
    const leads = await listCompanyLeads(TEMP_COMPANY_ID);

    return NextResponse.json(leads);
  } catch (error) {
    console.error("ERRO AO BUSCAR LEADS:", error);

    return NextResponse.json(
      { error: "Erro ao buscar leads." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = createLeadSchema.safeParse({
      ...body,
      companyId: TEMP_COMPANY_ID,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const lead = await createCompanyLead(parsed.data);

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("ERRO AO CRIAR LEAD:", error);

    return NextResponse.json(
      { error: "Erro ao criar lead." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "ID do lead é obrigatório." },
        { status: 400 }
      );
    }

    const parsed = updateLeadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const lead = await updateCompanyLead(
      body.id,
      TEMP_COMPANY_ID,
      parsed.data
    );

    return NextResponse.json(lead);
  } catch (error) {
    console.error("ERRO AO ATUALIZAR LEAD:", error);

    return NextResponse.json(
      { error: "Erro ao atualizar lead." },
      { status: 500 }
    );
  }
}