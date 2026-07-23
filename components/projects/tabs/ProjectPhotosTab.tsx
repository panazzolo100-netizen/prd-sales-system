"use client";

import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Camera,
  CheckCircle2,
  FileImage,
  ImagePlus,
  LoaderCircle,
  Maximize2,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";

type PhotoCategory =
  | "ANTES"
  | "DURANTE"
  | "DEPOIS";

type ServiceOrderPhoto = {
  id: string;

  name: string;
  url: string;
  mimeType: string;
  size: number;

  category: PhotoCategory;

  notes: string | null;

  createdAt: Date | string;
  updatedAt?: Date | string;

  serviceOrderId: string;
};

type Props = {
  serviceOrderId: string;
  onPhotosChange?: () => void;
};

type UploadForm = {
  category: PhotoCategory;
  notes: string;
};

type FeedbackMessage = {
  type: "success" | "error";
  text: string;
} | null;

const categories: {
  value: PhotoCategory;
  label: string;
  description: string;
}[] = [
  {
    value: "ANTES",
    label: "Antes",
    description:
      "Registre as condições antes do início dos serviços.",
  },
  {
    value: "DURANTE",
    label: "Durante",
    description:
      "Documente as etapas executadas durante a obra.",
  },
  {
    value: "DEPOIS",
    label: "Depois",
    description:
      "Registre o resultado final e a entrega dos serviços.",
  },
];

function formatDate(
  value: Date | string
) {
  return new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
    }
  ).format(new Date(value));
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(
      size / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    size /
    (1024 * 1024)
  ).toFixed(1)} MB`;
}

export function ProjectPhotosTab({
  serviceOrderId,
  onPhotosChange,
}: Props) {
  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    photos,
    setPhotos,
  ] =
    useState<ServiceOrderPhoto[]>(
      []
    );

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<UploadForm>({
      category: "ANTES",
      notes: "",
    });

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

    const [deletingId, setDeletingId] =
  useState<string | null>(null);

  const [
    selectedPhoto,
    setSelectedPhoto,
  ] =
    useState<ServiceOrderPhoto | null>(
      null
    );

  const [feedback, setFeedback] =
    useState<FeedbackMessage>(null);

  const loadPhotos =
    useCallback(async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/os/photos?serviceOrderId=${encodeURIComponent(
            serviceOrderId
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const responseData =
          await response.json();

        if (!response.ok) {
          throw new Error(
            responseData.error ??
              "Erro ao buscar fotos."
          );
        }

        setPhotos(responseData);
      } catch (error) {
        setFeedback({
          type: "error",
          text:
            error instanceof Error
              ? error.message
              : "Não foi possível buscar as fotos.",
        });
      } finally {
        setLoading(false);
      }
    }, [serviceOrderId]);

  useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(
          previewUrl
        );
      }
    };
  }, [previewUrl]);

  const photosByCategory =
    useMemo(() => {
      return {
        ANTES: photos.filter(
          (photo) =>
            photo.category === "ANTES"
        ),

        DURANTE: photos.filter(
          (photo) =>
            photo.category ===
            "DURANTE"
        ),

        DEPOIS: photos.filter(
          (photo) =>
            photo.category ===
            "DEPOIS"
        ),
      };
    }, [photos]);

  function clearSelectedFile() {
    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setSelectedFile(null);
    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function selectFile(
    file: File | null
  ) {
    if (!file) {
      return;
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      setFeedback({
        type: "error",
        text:
          "O arquivo selecionado precisa ser uma imagem.",
      });

      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      setFeedback({
        type: "error",
        text:
          "A imagem deve ter no máximo 10 MB.",
      });

      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(
        previewUrl
      );
    }

    setSelectedFile(file);

    setPreviewUrl(
      URL.createObjectURL(file)
    );

    setFeedback(null);
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    selectFile(
      event.target.files?.item(0) ??
        null
    );
  }

  async function uploadPhoto() {
    if (
      !selectedFile ||
      uploading
    ) {
      return;
    }
    setUploading(true);
    setFeedback(null);

    try {
      const formData =
        new FormData();

      formData.append(
        "file",
        selectedFile
      );

      formData.append(
        "serviceOrderId",
        serviceOrderId
      );

      formData.append(
        "category",
        form.category
      );

      formData.append(
        "notes",
        form.notes.trim()
      );

      const response = await fetch(
        "/api/os/photos",
        {
          method: "POST",
          body: formData,
        }
      );

      const responseData =
        await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error ??
            "Erro ao enviar foto."
        );
      }

      const uploadedPhoto =
        responseData as ServiceOrderPhoto;

      setPhotos((currentPhotos) => [
        uploadedPhoto,
        ...currentPhotos,
      ]);
      onPhotosChange?.();

      clearSelectedFile();

      setForm((current) => ({
        ...current,
        notes: "",
      }));

      setFeedback({
        type: "success",
        text:
          "Foto enviada com sucesso.",
      });
    } catch (error) {
      setFeedback({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível enviar a foto.",
      });
    } finally {
      setUploading(false);
    }
  }
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
      onPhotosChange?.();

      if (
        selectedPhoto?.id === id
      ) {
        setSelectedPhoto(null);
      }

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
    <>
      <section className="space-y-6 rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
            Registro fotográfico
          </p>

          <h2 className="mt-2 text-2xl font-black text-white">
            Fotos da execução
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
            Registre as condições da obra antes, durante e depois da execução dos serviços.
          </p>
        </div>

        {feedback && (
          <div
            className={`flex items-center gap-3 rounded-2xl border p-4 ${
              feedback.type ===
              "success"
                ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
                : "border-red-500/20 bg-red-500/10 text-red-300"
            }`}
          >
            {feedback.type ===
            "success" ? (
              <CheckCircle2
                size={18}
              />
            ) : (
              <XCircle size={18} />
            )}

            <p className="text-sm font-semibold">
              {feedback.text}
            </p>
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              onDragOver={(event) =>
                event.preventDefault()
              }
              onDrop={(event) => {
                event.preventDefault();

                selectFile(
                  event.dataTransfer.files.item(
                    0
                  )
                );
              }}
              className="group relative flex min-h-72 w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-white/[0.12] bg-zinc-950 p-6 text-center transition hover:border-orange-500/40 hover:bg-orange-500/[0.03]"
            >
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt="Pré-visualização da foto"
                    className="max-h-80 w-full rounded-xl object-contain"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                    <span className="flex items-center gap-2 rounded-xl bg-zinc-950/90 px-4 py-2 text-sm font-semibold text-white">
                      <ImagePlus
                        size={17}
                      />

                      Trocar imagem
                    </span>
                  </div>
                </>
              ) : (
                <div>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-orange-400">
                    <ImagePlus
                      size={27}
                    />
                  </div>

                  <h3 className="mt-5 font-bold text-white">
                    Selecione uma imagem
                  </h3>

                  <p className="mt-2 text-sm text-zinc-500">
                    Clique ou arraste uma foto para esta área.
                  </p>

                  <p className="mt-1 text-xs text-zinc-600">
                    Tamanho máximo de 10 MB.
                  </p>
                </div>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={
                handleFileChange
              }
            />

            {selectedFile && (
              <div className="mt-3 flex items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-zinc-950 p-3">
                <div className="flex min-w-0 items-center gap-3">
                  <FileImage
                    size={18}
                    className="shrink-0 text-orange-400"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {selectedFile.name}
                    </p>

                    <p className="text-xs text-zinc-600">
                      {formatFileSize(
                        selectedFile.size
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={
                    clearSelectedFile
                  }
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
                  aria-label="Remover imagem selecionada"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-zinc-950 p-5">
            <h3 className="font-bold text-white">
              Informações da foto
            </h3>

            <div className="mt-5">
              <label
                htmlFor="photo-category"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
              >
                Etapa da execução
              </label>

              <select
                id="photo-category"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    category:
                      event.target
                        .value as PhotoCategory,
                  }))
                }
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-zinc-900 px-4 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
              >
                {categories.map(
                  (category) => (
                    <option
                      key={
                        category.value
                      }
                      value={
                        category.value
                      }
                    >
                      {category.label}
                    </option>
                  )
                )}
              </select>

              <p className="mt-2 text-xs leading-5 text-zinc-600">
                {
                  categories.find(
                    (category) =>
                      category.value ===
                      form.category
                  )?.description
                }
              </p>
            </div>

            <div className="mt-5">
              <label
                htmlFor="photo-notes"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
              >
                Observação
              </label>

              <textarea
                id="photo-notes"
                value={form.notes}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes:
                      event.target.value,
                  }))
                }
                rows={6}
                placeholder="Descreva o que aparece na foto."
                className="w-full resize-y rounded-xl border border-white/[0.08] bg-zinc-900 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
              />
            </div>

            <button
              type="button"
              onClick={uploadPhoto}
              disabled={
                !selectedFile ||
                uploading
              }
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Upload size={17} />
              )}

              {uploading
                ? "Enviando..."
                : "Enviar foto"}
            </button>
          </div>
        </div>
      </section>

      <section className="mt-6 space-y-6">
        {loading ? (
          <div className="flex min-h-48 items-center justify-center rounded-3xl border border-white/[0.07] bg-zinc-900/60">
            <LoaderCircle className="animate-spin text-orange-400" />
          </div>
        ) : (
          categories.map(
            (category) => (
                            <PhotoCategorySection
                key={category.value}
                category={category}
                photos={
                  photosByCategory[
                    category.value
                  ]
                }
                onOpenPhoto={
                  setSelectedPhoto
                }
                onDeletePhoto={
                  deletePhoto
                }
                deletingId={
                  deletingId
                }
              />
            )
          )
        )}
      </section>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedPhoto(null);
            }
          }}
        >
          <div className="relative max-h-full max-w-6xl">
            <button
              type="button"
              onClick={() =>
                setSelectedPhoto(null)
              }
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-xl bg-black/70 text-white transition hover:bg-red-500"
              aria-label="Fechar imagem"
            >
              <X size={20} />
            </button>

            <img
              src={selectedPhoto.url}
              alt={
                selectedPhoto.name
              }
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
            />

            <div className="mt-3 rounded-xl bg-zinc-950 p-4">
              <p className="font-bold text-white">
                {selectedPhoto.name}
              </p>

              {selectedPhoto.notes && (
                <p className="mt-1 text-sm text-zinc-400">
                  {selectedPhoto.notes}
                </p>
              )}

              <p className="mt-2 text-xs text-zinc-600">
                {formatDate(
                  selectedPhoto.createdAt
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type PhotoCategorySectionProps = {
  category: {
    value: PhotoCategory;
    label: string;
    description: string;
  };

  photos: ServiceOrderPhoto[];

  onOpenPhoto: (
    photo: ServiceOrderPhoto
  ) => void;

  onDeletePhoto: (
    id: string
  ) => Promise<void>;

  deletingId: string | null;
};

function PhotoCategorySection({
  category,
  photos,
  onOpenPhoto,
  onDeletePhoto,
  deletingId,
}: PhotoCategorySectionProps) {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
            {category.label}
          </p>

          <h3 className="mt-2 text-xl font-black text-white">
            {category.label} da execução
          </h3>

          <p className="mt-2 text-sm text-zinc-500">
            {category.description}
          </p>
        </div>

        <span className="rounded-full border border-white/[0.08] bg-zinc-950 px-3 py-1 text-xs font-semibold text-zinc-400">
          {photos.length} foto(s)
        </span>
      </div>

      {photos.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-white/[0.08] bg-zinc-950 p-8 text-center">
          <Camera
            size={23}
            className="mx-auto text-zinc-600"
          />

          <p className="mt-3 text-sm text-zinc-500">
            Nenhuma foto cadastrada nesta etapa.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-950 transition hover:-translate-y-1 hover:border-orange-500/30"
            >
              <button
                type="button"
                onClick={() =>
                  onOpenPhoto(photo)
                }
                className="block w-full text-left"
              >
                <div className="relative aspect-video overflow-hidden bg-black">
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/50 group-hover:opacity-100">
                    <Maximize2
                      size={22}
                      className="text-white"
                    />
                  </div>
                </div>

                <div className="p-4">
                  <p className="truncate font-semibold text-white">
                    {photo.name}
                  </p>

                  {photo.notes && (
                    <p className="mt-2 line-clamp-2 text-sm leading-5 text-zinc-500">
                      {photo.notes}
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-3 text-xs text-zinc-600">
                    <span>
                      {formatDate(
                        photo.createdAt
                      )}
                    </span>

                    <span>
                      {formatFileSize(
                        photo.size
                      )}
                    </span>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();

                  void onDeletePhoto(
                    photo.id
                  );
                }}
                disabled={
                  deletingId === photo.id
                }
                className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-xl bg-black/75 text-zinc-300 transition hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
