"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type PhotoCategory = "ANTES" | "DURANTE" | "DEPOIS";

type PhotoUploadProps = {
  serviceOrderId: string;
  category: PhotoCategory;
  title: string;
};

export function PhotoUpload({
  serviceOrderId,
  category,
  title,
}: PhotoUploadProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  function selectFile(selectedFile: File | null) {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setMessage("Selecione uma imagem válida.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setMessage("A imagem deve ter no máximo 10 MB.");
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setMessage("");
  }

  async function handleSubmit() {
    if (!file) {
      setMessage("Selecione uma imagem.");
      return;
    }

    try {
      setIsUploading(true);
      setMessage("");

      const formData = new FormData();

      formData.append("file", file);
      formData.append("serviceOrderId", serviceOrderId);
      formData.append("category", category);
      formData.append("notes", notes);

      const response = await fetch("/api/os/photos", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Erro ao enviar imagem."
        );
      }

      if (preview) {
        URL.revokeObjectURL(preview);
      }

      setFile(null);
      setPreview(null);
      setNotes("");
      setMessage("Imagem enviada com sucesso.");

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Erro ao enviar imagem."
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <h3 className="text-lg font-bold text-white">
        {title}
      </h3>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={(event) => {
          event.preventDefault();

          selectFile(
            event.dataTransfer.files.item(0)
          );
        }}
        className="mt-4 flex min-h-44 w-full flex-col items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-950 p-5 text-center transition hover:border-orange-500"
      >
        {preview ? (
          <img
            src={preview}
            alt="Pré-visualização"
            className="max-h-56 rounded-lg object-contain"
          />
        ) : (
          <>
            <span className="text-3xl text-orange-500">
              +
            </span>

            <span className="mt-2 font-semibold text-zinc-200">
              Selecionar imagem
            </span>

            <span className="mt-1 text-sm text-zinc-500">
              Clique ou arraste uma foto
            </span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          selectFile(
            event.currentTarget.files?.item(0) ??
              null
          );
        }}
      />

      <textarea
        value={notes}
        onChange={(event) => {
          setNotes(event.target.value);
        }}
        rows={3}
        placeholder="Observação da foto"
        className="mt-4 w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-white outline-none focus:border-orange-500"
      />

      <button
        type="button"
        disabled={!file || isUploading}
        onClick={handleSubmit}
        className="mt-4 w-full rounded-xl bg-orange-500 px-5 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading
          ? "Enviando..."
          : "Enviar foto"}
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