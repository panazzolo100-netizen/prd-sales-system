import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { uploadCompanyLeadFile } from "../../../../services/leads.files.service";

const TEMP_COMPANY_ID = "default-company";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const leadId = String(formData.get("leadId") ?? "");
    const file = formData.get("file");

    if (!leadId) {
      return NextResponse.json(
        { error: "ID do lead é obrigatório." },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Arquivo obrigatório." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "leads");
    await mkdir(uploadDir, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "-");
    const fileName = `${Date.now()}-${safeName}`;
    const filePath = path.join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const savedFile = await uploadCompanyLeadFile({
      leadId,
      companyId: TEMP_COMPANY_ID,
      name: file.name,
      url: `/uploads/leads/${fileName}`,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    });

    return NextResponse.json(savedFile, { status: 201 });
  } catch (error) {
    console.error("ERRO AO ENVIAR ARQUIVO:", error);

    return NextResponse.json(
      { error: "Erro ao enviar arquivo." },
      { status: 500 }
    );
  }
}