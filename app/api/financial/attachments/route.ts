import { mkdir, writeFile } from "fs/promises";
import path from "path";

import { NextRequest, NextResponse } from "next/server";

import { uploadFinancialAttachment } from "@/services/financial-attachments.service";

export async function POST(
  request: NextRequest
) {
  try {
    const formData =
      await request.formData();

    const file = formData.get("file");

    const financialId = String(
      formData.get("financialId") ?? ""
    );

    const type = String(
      formData.get("type") ??
        "COMPROVANTE"
    );

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "Arquivo inválido.",
        },
        {
          status: 400,
        }
      );
    }

    const directory = path.join(
      process.cwd(),
      "public",
      "uploads",
      "financial",
      financialId
    );

    await mkdir(directory, {
      recursive: true,
    });

    const extension =
      path.extname(file.name);

    const filename = `${Date.now()}-${crypto.randomUUID()}${extension}`;

    const bytes =
      await file.arrayBuffer();

    await writeFile(
      path.join(
        directory,
        filename
      ),
      Buffer.from(bytes)
    );

    const attachment =
      await uploadFinancialAttachment({
        financialId,
        name: file.name,
        url: `/uploads/financial/${financialId}/${filename}`,
        mimeType: file.type,
        size: file.size,
        type,
      });

    return NextResponse.json(
      attachment
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno.",
      },
      {
        status: 500,
      }
    );
  }
}