import { prisma } from "@/lib/prisma";

export default async function Clientes() {
  const clientes = await prisma.client.findMany({
    where: {
      companyId: "default-company",
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-zinc-950 p-10 text-white">
      <div className="mb-8 flex items-center justify-between">
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
            {clientes.map((cliente) => (
              <tr
                key={cliente.id}
                className="border-b border-zinc-800 hover:bg-zinc-800"
              >
                <td className="p-5">
                  {cliente.name}
                </td>

                <td className="p-5">
                  {cliente.city
                    ? `${cliente.city}${cliente.state ? ` - ${cliente.state}` : ""}`
                    : "-"}
                </td>

                <td className="p-5">
                  {cliente.phone ?? "-"}
                </td>

                <td className="p-5">
                  {cliente.email ?? "-"}
                </td>
              </tr>
            ))}

            {clientes.length === 0 && (
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