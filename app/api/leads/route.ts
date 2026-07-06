import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("leads")
    .update({ status: body.status })
    .eq("id", body.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}