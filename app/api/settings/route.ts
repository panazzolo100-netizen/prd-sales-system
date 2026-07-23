import { NextResponse } from "next/server";
import { saveCompanySettings, saveUserPreferences, saveUserProfile } from "@/services/settings.service";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (body.section === "company") return NextResponse.json(await saveCompanySettings(body));
    if (body.section === "profile") return NextResponse.json(await saveUserProfile(body));
    if (body.section === "preferences") return NextResponse.json(await saveUserPreferences(body));
    return NextResponse.json({ error: "Seção inválida." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível salvar." }, { status: 400 });
  }
}
