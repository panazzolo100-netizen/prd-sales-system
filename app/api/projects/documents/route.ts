import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextRequest, NextResponse } from "next/server";

import { ProjectDocumentType } from "@/lib/generated/prisma/enums";
import { uploadProjectDocument } from "../../../../services/project-documents.service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    const projectId = String(
      formData.get("projectId") ?? ""
    ).trim();

    const type = String(
      formData.get("type") ?? ""
    ).trim() as ProjectDocumentType;

    const notes = String(
      formData.get("notes") ?? ""
    ).trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Arquivo inválido." },
        { status: 400 }
      );
    }

    await mkdir(
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "projects",
        projectId
      ),
      {
        recursive: true,
      }
    );

    const extension =
      path.extname(file.name) || ".pdf";

    const fileName = `${Date.now()}-${crypto.randomUUID()}${extension}`;

    const bytes = await file.arrayBuffer();

    await writeFile(
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "projects",
        projectId,
        fileName
      ),
      Buffer.from(bytes)
    );

    const document =
      await uploadProjectDocument({
        projectId,
        name: file.name,
        url: `/uploads/projects/${projectId}/${fileName}`,
        mimeType: file.type,
        size: file.size,
        type,
        notes: notes || null,
      });

    return NextResponse.json(document);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao enviar documento.",
      },
      {
        status: 500,
      }
    );
  }
}