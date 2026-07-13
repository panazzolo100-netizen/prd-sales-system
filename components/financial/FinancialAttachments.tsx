"use client";

type Props = {
  attachments: {
    id: string;
    name: string;
    url: string;
    type: string;
    createdAt: Date;
  }[];
};

export function FinancialAttachments({
  attachments,
}: Props) {
  if (attachments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-zinc-500">
        Nenhum anexo financeiro.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {attachments.map((file) => (
        <a
          key={file.id}
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 transition hover:border-orange-500"
        >
          <p className="font-semibold text-white">
            {file.name}
          </p>

          <p className="mt-2 text-sm text-orange-500">
            {file.type}
          </p>

          <p className="mt-2 text-xs text-zinc-500">
            {new Intl.DateTimeFormat(
              "pt-BR"
            ).format(
              new Date(file.createdAt)
            )}
          </p>
        </a>
      ))}
    </div>
  );
}