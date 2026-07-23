import { NextResponse } from "next/server";

import {
  listCompanyProjects,
  updateCompanyProject,
  deleteCompanyProject,
} from "@/services/projects.service";

export async function GET() {
  try {
    const projects =
      await listCompanyProjects();

    return NextResponse.json(
      projects
    );
  } catch (error) {
    console.error(
      "ERRO AO BUSCAR PROJETOS:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erro ao buscar projetos.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    if (!body.id) {
      return NextResponse.json(
        {
          error:
            "Projeto obrigatório.",
        },
        {
          status: 400,
        }
      );
    }

    const project =
      await updateCompanyProject(
        body.id,
        {
          title: body.title,
          status: body.status,
          description:
            body.description,
        }
      );

    return NextResponse.json(
      project
    );
  } catch (error) {
    console.error(
      "ERRO AO SALVAR PROJETO:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erro ao salvar projeto.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Projeto obrigatório." }, { status: 400 });
    await deleteCompanyProject(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao excluir projeto.";
    return NextResponse.json({ error: message }, { status: message.includes("vinculado") ? 409 : 400 });
  }
}
