"use client";

export function LeadStatusButton({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  async function alterarStatus() {
    await fetch("/api/leads", {
      method: "PATCH",
      body: JSON.stringify({ id, status }),
    });

    window.location.reload();
  }

  return (
    <button
      onClick={alterarStatus}
      className="rounded-lg bg-zinc-700 px-3 py-2 text-sm transition hover:bg-orange-500"
    >
      Mover para {status}
    </button>
  );
}