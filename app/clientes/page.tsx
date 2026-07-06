import { supabase } from "@/lib/supabase";

export default async function Clientes() {
  const { data: clientes } = await supabase
    .from("clientes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-zinc-950 p-10 text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">Clientes</h1>
          <p className="text-zinc-400">
            Cadastro de clientes da PRD Engenharia
          </p>
        </div>

        <button className="rounded-xl bg-orange-500 px-5 py-3 font-semibold hover:bg-orange-600">
          Novo Cliente
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <table className="w-full">
          <thead className="border-b border-zinc-800">
            <tr>
              <th className="p-5 text-left">Nome</th>
              <th className="p-5 text-left">Cidade</th>
              <th className="p-5 text-left">Telefone</th>
              <th className="p-5 text-left">Email</th>
            </tr>
          </thead>

          <tbody>
            {clientes?.map((cliente) => (
              <tr
                key={cliente.id}
                className="border-b border-zinc-800 hover:bg-zinc-800"
              >
                <td className="p-5">{cliente.nome}</td>
                <td className="p-5">{cliente.cidade}</td>
                <td className="p-5">{cliente.telefone}</td>
                <td className="p-5">{cliente.email}</td>
              </tr>
            ))}

            {clientes?.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="p-8 text-center text-zinc-500"
                >
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}