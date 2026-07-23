"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type FinancialUploadProps = {
  financialId: string;
};

export function FinancialUpload({
  financialId,
}: FinancialUploadProps) {
  const router = useRouter();

  const inputRef =
    useRef<HTMLInputElement>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [type, setType] =
    useState("COMPROVANTE");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  async function upload() {
    if (!file) {
      setMessage("Selecione um arquivo.");
      return;
    }

    setLoading(true);
    setMessage("");

    const formData = new FormData();

    formData.append("file", file);
    formData.append(
      "financialId",
      financialId
    );
    formData.append("type", type);

    const response = await fetch(
      "/api/financial/attachments",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();

    setLoading(false);

    if (!response.ok) {
      setMessage(
        result.error ??
          "Erro ao enviar arquivo."
      );

      return;
    }

    setFile(null);
    setMessage(
      "Arquivo enviado com sucesso."
    );

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    router.refresh();
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <h3 className="font-bold text-white">
        Anexos financeiros
      </h3>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <select
          value={type}
          onChange={(event) =>
            setType(event.target.value)
          }
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white outline-none focus:border-orange-500"
        >
          <option value="COMPROVANTE">
            Comprovante
          </option>

          <option value="BOLETO">
            Boleto
          </option>

          <option value="PIX">
            PIX
          </option>

          <option value="NOTA_FISCAL">
            Nota Fiscal
          </option>

          <option value="RECIBO">
            Recibo
          </option>

          <option value="OUTRO">
            Outro
          </option>
        </select>

        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.txt"
          onChange={(event) => {
            setFile(
              event.target.files?.[0] ??
                null
            );

            setMessage("");
          }}
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-sm text-white"
        />
      </div>

      <button
        type="button"
        disabled={!file || loading}
        onClick={upload}
        className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Enviando..."
          : "Enviar anexo"}
      </button>

      {message && (
        <p
          className={`mt-3 text-sm ${
            message.includes("sucesso")
              ? "text-emerald-400"
              : "text-red-400"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
