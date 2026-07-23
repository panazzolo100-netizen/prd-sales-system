"use client";

import Image from "next/image";
import { memo, useMemo, useState } from "react";
import {
  CalendarDays,
  Download,
  ExternalLink,
  File,
  FileImage,
  FileText,
  Search,
  Star,
  Trash2,
  Upload,
  UserRound,
  X,
} from "lucide-react";

import { DocumentUpload } from "@/components/projects/DocumentUpload";
import {
  getProjectDocumentCategoryLabel,
  isImageDocument,
  isPdfDocument,
  PROJECT_DOCUMENT_CATEGORIES,
  type ProjectDocumentCategory,
} from "@/components/projects/project-document-config";
import type { ProjectDocumentItem } from "@/types/project";

type DocumentCategoryFilter = "TODOS" | ProjectDocumentCategory;
type DocumentSort = "RECENT" | "OLDEST" | "NAME_ASC" | "NAME_DESC";

type Props = {
  projectId: string;
  documents: ProjectDocumentItem[];
  onDocumentsChange: (documents: ProjectDocumentItem[]) => void;
};

const SORT_OPTIONS: { value: DocumentSort; label: string }[] = [
  { value: "RECENT", label: "Mais recentes" },
  { value: "OLDEST", label: "Mais antigos" },
  { value: "NAME_ASC", label: "Nome A-Z" },
  { value: "NAME_DESC", label: "Nome Z-A" },
];

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function ProjectDocumentsTab({
  projectId,
  documents,
  onDocumentsChange,
}: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<DocumentCategoryFilter>("TODOS");
  const [sort, setSort] = useState<DocumentSort>("RECENT");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<ProjectDocumentCategory>("OUTRO");
  const [previewDocument, setPreviewDocument] =
    useState<ProjectDocumentItem | null>(null);
  const [favoriteLoadingId, setFavoriteLoadingId] =
    useState<string | null>(null);
  const [favoriteError, setFavoriteError] = useState<string | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<string | null>(null);

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    return documents
      .filter((document) => {
        const matchesSearch =
          !normalizedSearch ||
          document.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch);
        const matchesCategory =
          category === "TODOS" || document.type === category;

        return matchesSearch && matchesCategory;
      })
      .sort((first, second) => {
        if (sort === "NAME_ASC" || sort === "NAME_DESC") {
          const comparison = first.name.localeCompare(second.name, "pt-BR");
          return sort === "NAME_ASC" ? comparison : -comparison;
        }

        const comparison =
          new Date(second.createdAt).getTime() -
          new Date(first.createdAt).getTime();
        return sort === "RECENT" ? comparison : -comparison;
      });
  }, [category, documents, search, sort]);

  const favoriteCount = useMemo(
    () => documents.filter((document) => document.isFavorite).length,
    [documents]
  );

  function handleUploaded(document: ProjectDocumentItem) {
    onDocumentsChange([document, ...documents]);
    setShowUpload(false);
  }

  async function toggleFavorite(document: ProjectDocumentItem) {
    if (favoriteLoadingId) return;

    setFavoriteLoadingId(document.id);
    setFavoriteError(null);

    try {
      const response = await fetch("/api/projects/documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: document.id,
          isFavorite: !document.isFavorite,
        }),
      });
      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error ?? "Erro ao atualizar favorito.");
      }

      onDocumentsChange(
        documents.map((item) =>
          item.id === document.id
            ? (responseData as ProjectDocumentItem)
            : item
        )
      );
    } catch (error) {
      setFavoriteError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar o favorito."
      );
    } finally {
      setFavoriteLoadingId(null);
    }
  }

  async function deleteDocument(document: ProjectDocumentItem) {
    if (deleteLoadingId) return;
    if (!window.confirm(`Excluir o documento “${document.name}”? Esta ação não pode ser desfeita.`)) return;

    setDeleteLoadingId(document.id);
    setFavoriteError(null);
    setDeleteFeedback(null);

    try {
      const response = await fetch(
        `/api/projects/documents?id=${encodeURIComponent(document.id)}`,
        { method: "DELETE" }
      );
      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.error ?? "Erro ao excluir documento.");
      }
      onDocumentsChange(documents.filter((item) => item.id !== document.id));
      if (previewDocument?.id === document.id) setPreviewDocument(null);
      setDeleteFeedback(`${document.name} foi excluído com sucesso.`);
    } catch (error) {
      setFavoriteError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o documento."
      );
    } finally {
      setDeleteLoadingId(null);
    }
  }

  const hasFilters = search.trim().length > 0 || category !== "TODOS";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
              Centro de documentos
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Documentos do Projeto
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              {documents.length} documento(s) · {favoriteCount} favorito(s)
            </p>
          </div>

          <button
            type="button"
            onClick={() => { setUploadCategory("OUTRO"); setShowUpload(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-400"
          >
            <Upload size={17} />
            Adicionar documento
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
          {PROJECT_DOCUMENT_CATEGORIES.map((item) => <button key={item.value} type="button" onClick={() => { setUploadCategory(item.value); setShowUpload(true); }} className="rounded-lg border border-white/[0.08] bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-400 transition hover:border-orange-500/30 hover:text-orange-400">{item.label}</button>)}
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(240px,1fr)_210px_190px]">
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome..."
              className="h-12 w-full rounded-xl border border-white/[0.08] bg-zinc-950 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-700 focus:border-orange-500/50"
            />
          </div>

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value as DocumentCategoryFilter)
            }
            className="h-12 rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none focus:border-orange-500/50"
          >
            <option value="TODOS">Todas as categorias</option>
            {PROJECT_DOCUMENT_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) => setSort(event.target.value as DocumentSort)}
            className="h-12 rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none focus:border-orange-500/50"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      {showUpload && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center overflow-y-auto bg-black/80 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowUpload(false); }}>
          <div className="w-full max-w-3xl"><DocumentUpload key={uploadCategory} projectId={projectId} type={uploadCategory} onUploaded={handleUploaded} onCancel={() => setShowUpload(false)} /></div>
        </div>
      )}

      {favoriteError && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
          {favoriteError}
        </p>
      )}
      {deleteFeedback && (
        <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
          {deleteFeedback}
        </p>
      )}

      {filteredDocuments.length === 0 ? (
        <DocumentEmptyState
          hasFilters={hasFilters}
          onUpload={() => setShowUpload(true)}
        />
      ) : (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document.id}
              document={document}
              favoriteLoading={favoriteLoadingId === document.id}
              deleteLoading={deleteLoadingId === document.id}
              onToggleFavorite={toggleFavorite}
              onDelete={deleteDocument}
              onPreview={setPreviewDocument}
            />
          ))}
        </section>
      )}

      {previewDocument && (
        <ImagePreview
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
}

type DocumentCardProps = {
  document: ProjectDocumentItem;
  favoriteLoading: boolean;
  deleteLoading: boolean;
  onToggleFavorite: (document: ProjectDocumentItem) => Promise<void>;
  onDelete: (document: ProjectDocumentItem) => Promise<void>;
  onPreview: (document: ProjectDocumentItem) => void;
};

const DocumentCard = memo(function DocumentCard({
  document,
  favoriteLoading,
  deleteLoading,
  onToggleFavorite,
  onDelete,
  onPreview,
}: DocumentCardProps) {
  const isImage = isImageDocument(document);
  const isPdf = isPdfDocument(document);
  const Icon = isImage ? FileImage : isPdf ? FileText : File;
  const accessEndpoint = `/api/projects/documents?id=${encodeURIComponent(document.id)}`;

  return (
    <article className="group flex min-h-64 flex-col rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-5 transition duration-200 hover:-translate-y-1 hover:border-orange-500/25 hover:shadow-[0_18px_50px_rgba(0,0,0,0.25)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-zinc-950 text-orange-400">
          <Icon size={21} />
        </div>
        <button
          type="button"
          onClick={() => void onToggleFavorite(document)}
          disabled={favoriteLoading}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
            document.isFavorite
              ? "bg-amber-500/10 text-amber-400"
              : "text-zinc-600 hover:bg-amber-500/10 hover:text-amber-400"
          } disabled:opacity-50`}
          aria-label={
            document.isFavorite
              ? "Remover dos favoritos"
              : "Adicionar aos favoritos"
          }
        >
          <Star size={18} fill={document.isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="mt-5 min-w-0 flex-1">
        <span className="rounded-full border border-white/[0.07] bg-zinc-950 px-2.5 py-1 text-[11px] font-semibold text-zinc-400">
          {getProjectDocumentCategoryLabel(document.type)}
        </span>
        <h3 className="mt-3 line-clamp-2 font-bold leading-6 text-white">
          {document.name}
        </h3>
        {document.notes && (
          <p className="mt-2 line-clamp-2 text-sm leading-5 text-zinc-500">
            {document.notes}
          </p>
        )}
      </div>

      <div className="mt-5 space-y-2 border-t border-white/[0.06] pt-4 text-xs text-zinc-600">
        <p className="flex items-center gap-2">
          <CalendarDays size={14} />
          {formatDate(document.createdAt)} · {formatFileSize(document.size)}
        </p>
        <p className="flex items-center gap-2">
          <UserRound size={14} />
          {document.uploadedBy?.name ?? "Usuário não registrado"}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => void onDelete(document)}
          disabled={deleteLoading}
          className="inline-flex h-9 items-center gap-2 rounded-xl border border-red-500/15 bg-red-500/5 px-3 text-xs font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-wait disabled:opacity-50"
          aria-label={`Excluir ${document.name}`}
        >
          <Trash2 size={14} className={deleteLoading ? "animate-pulse" : ""} />
          {deleteLoading ? "Excluindo..." : "Excluir"}
        </button>
        {isImage ? (
          <button
            type="button"
            onClick={() => onPreview(document)}
            disabled={!document.accessUrl}
            className="rounded-xl border border-white/[0.08] bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-orange-500/30 hover:text-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Visualizar
          </button>
        ) : isPdf ? (
          <a
            href={document.accessUrl ? accessEndpoint : undefined}
            target="_blank"
            rel="noreferrer"
            aria-disabled={!document.accessUrl}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-orange-500/30 hover:text-orange-400 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            <ExternalLink size={14} />
            Abrir PDF
          </a>
        ) : (
          <a
            href={document.accessUrl ? accessEndpoint : undefined}
            download={document.name}
            aria-disabled={!document.accessUrl}
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-300 transition hover:border-orange-500/30 hover:text-orange-400 aria-disabled:pointer-events-none aria-disabled:opacity-50"
          >
            <Download size={14} />
            Download
          </a>
        )}
      </div>
    </article>
  );
});

function DocumentEmptyState({
  hasFilters,
  onUpload,
}: {
  hasFilters: boolean;
  onUpload: () => void;
}) {
  return (
    <section className="rounded-3xl border border-dashed border-white/[0.09] bg-zinc-900/40 p-12 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-950 text-zinc-600">
        <FileText size={24} />
      </div>
      <h3 className="mt-5 text-lg font-bold text-white">
        Nenhum documento encontrado
      </h3>
      <p className="mt-2 text-sm text-zinc-500">
        {hasFilters
          ? "Tente ajustar a busca ou a categoria selecionada."
          : "Envie o primeiro arquivo para iniciar o centro de documentos."}
      </p>
      <button
        type="button"
        onClick={onUpload}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-400"
      >
        <Upload size={16} />
        Enviar documento
      </button>
    </section>
  );
}

function ImagePreview({
  document,
  onClose,
}: {
  document: ProjectDocumentItem;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/[0.1] bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.07] p-4">
          <div className="min-w-0">
            <p className="truncate font-bold text-white">{document.name}</p>
            <p className="mt-1 text-xs text-zinc-600">
              {getProjectDocumentCategoryLabel(document.type)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-red-500/10 hover:text-red-400"
            aria-label="Fechar visualização"
          >
            <X size={19} />
          </button>
        </div>
        <div className="flex max-h-[78vh] items-center justify-center bg-black p-4">
          <Image
            src={`/api/projects/documents?id=${encodeURIComponent(document.id)}`}
            alt={document.name}
            width={1600}
            height={1000}
            unoptimized
            className="max-h-[72vh] w-auto max-w-full rounded-xl object-contain"
          />
        </div>
      </div>
    </div>
  );
}
