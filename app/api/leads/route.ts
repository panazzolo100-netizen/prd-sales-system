import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("ERRO AO BUSCAR LEADS:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from("leads")
      .insert({
        nome: body.nome,
        telefone: body.telefone,
        email: body.email,
        cidade: body.cidade,
        origem: body.origem,
        status: "Novo",
        observacoes: body.observacao,
      })
      .select()
      .single();

    if (error) {
      console.log("ERRO AO SALVAR LEAD:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.log(err);

    return NextResponse.json(
      { error: "Erro interno." },
      { status: 500 }
    );
  }
}