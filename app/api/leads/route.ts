import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("ERRO AO BUSCAR LEADS:", error);
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
    console.log("ERRO AO CRIAR LEAD:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: Request) {
  const body = await request.json();

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .update({ status: body.status })
    .eq("id", body.id)
    .select()
    .single();

  if (leadError) {
    console.log("ERRO AO ATUALIZAR LEAD:", leadError);
    return NextResponse.json({ error: leadError.message }, { status: 500 });
  }

  if (body.status === "Ganho") {
    console.log("CRIANDO CLIENTE A PARTIR DO LEAD:", lead);

    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .insert({
        nome: lead.nome,
        telefone: lead.telefone,
        email: lead.email,
        cidade: lead.cidade,
        tipo: "Cliente Solar",
        observacoes: `Convertido automaticamente do lead. Origem: ${
          lead.origem || "-"
        }`,
      })
      .select()
      .single();

    if (clienteError) {
      console.log("ERRO AO CRIAR CLIENTE:", clienteError);

      return NextResponse.json(
        { error: clienteError.message },
        { status: 500 }
      );
    }

    console.log("CLIENTE CRIADO COM SUCESSO:", cliente);

    return NextResponse.json({ lead, cliente });
  }

  return NextResponse.json({ lead });
}