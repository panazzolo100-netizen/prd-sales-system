"use client";

import {
  useState,
} from "react";
import {
  LoaderCircle,
  Trash2,
} from "lucide-react";

type PhotoGalleryPhoto = {
  id: string;
  name: string;
  storageReference: string;
  accessUrl: string | null;
  notes: string | null;
  createdAt: Date | string;
};

type Props = {
  title: string;
  photos: PhotoGalleryPhoto[];
};

type Feedback = {
  type: "success" | "error";
  text: string;
} | null;

export function ServiceOrderPhotoGallery({
  title,
  photos: initialPhotos,
}: Props) {
  const [photos, setPhotos] =
    useState<PhotoGalleryPhoto[]>(
      initialPhotos
    );

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [feedback, setFeedback] =
    useState<Feedback>(null);

  async function deletePhoto(
    id: string
  ) {
    if (deletingId) {
      return;
    }

    const confirmed =
      window.confirm(
        "Deseja excluir esta foto?"
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(id);
    setFeedback(null);

    try {
      const response = await fetch(
        "/api/os/photos",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id,
          }),
        }
      );

      const responseData =
        await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error ??
            "Erro ao excluir foto."
        );
      }

      setPhotos((currentPhotos) =>
        currentPhotos.filter(
          (photo) =>
            photo.id !== id
        )
      );

      setFeedback({
        type: "success",
        text:
          "Foto removida com sucesso.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível excluir a foto.",
      });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white">
          {title}
        </h3>

        <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-semibold text-zinc-300">
          {photos.length}{" "}
          {photos.length === 1
            ? "foto"
            : "fotos"}
        </span>
      </div>

      {feedback && (
        <div
          className={`mt-4 rounded-xl border p-3 text-sm font-semibold ${
            feedback.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/20 bg-red-500/10 text-red-300"
          }`}
        >
          {feedback.text}
        </div>
      )}

      {photos.length > 0 ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {photos.map((photo) => (
            <article
              key={photo.id}
              className="relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
            >
              <a
                href={`/api/os/photos?photoId=${encodeURIComponent(photo.id)}`}
                target="_blank"
                rel="noreferrer"
                className="block overflow-hidden"
              >
                <img
                  src={`/api/os/photos?photoId=${encodeURIComponent(photo.id)}`}
                  alt={photo.name}
                  className="h-52 w-full object-cover transition hover:scale-105"
                />
              </a>

              <button
                type="button"
                onClick={() => {
                  void deletePhoto(
                    photo.id
                  );
                }}
                disabled={
                  deletingId === photo.id
                }
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-black/75 text-zinc-300 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Excluir foto"
              >
                {deletingId ===
                photo.id ? (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={17} />
                )}
              </button>

              <div className="p-4">
                <p className="truncate font-semibold text-white">
                  {photo.name}
                </p>

                <p className="mt-1 text-xs text-zinc-500">
                  {new Intl.DateTimeFormat(
                    "pt-BR",
                    {
                      dateStyle: "short",
                      timeStyle: "short",
                    }
                  ).format(
                    new Date(
                      photo.createdAt
                    )
                  )}
                </p>

                {photo.notes && (
                  <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-400">
                    {photo.notes}
                  </p>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 p-8 text-center">
          <p className="text-zinc-500">
            Nenhuma foto adicionada nesta etapa.
          </p>
        </div>
      )}
    </div>
  );
}
