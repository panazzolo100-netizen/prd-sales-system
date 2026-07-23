import { NextResponse } from "next/server";
import { globalSearch } from "@/services/global-search.service";

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams.get("q") ?? "";
    return NextResponse.json(await globalSearch(query));
  } catch (error) {
    console.error("Erro na pesquisa global:", error);
    return NextResponse.json({ error: "Não foi possível realizar a pesquisa." }, { status: 500 });
  }
}
