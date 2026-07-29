import type { ProjectDocumentItem } from "@/types/project";

export const PROJECT_DOCUMENT_CATEGORIES = [
  { value: "UNIFILAR", label: "Projeto Unifilar" },
  { value: "TRIFILAR", label: "Projeto Trifilar" },
  { value: "PLANTA_BAIXA", label: "Planta Baixa" },
  { value: "CARTA_APROVACAO", label: "Carta de Aprovação" },
  { value: "OUTROS_TECNICOS", label: "Outros Arquivos" },
] as const;

export type ProjectDocumentCategory =
  (typeof PROJECT_DOCUMENT_CATEGORIES)[number]["value"];

export function getProjectDocumentCategoryLabel(type: string) {
  return (
    PROJECT_DOCUMENT_CATEGORIES.find((category) => category.value === type)
      ?.label ?? "Outros"
  );
}

export function isImageDocument(document: ProjectDocumentItem) {
  return document.mimeType.startsWith("image/");
}

export function isPdfDocument(document: ProjectDocumentItem) {
  return (
    document.mimeType === "application/pdf" ||
    document.name.toLocaleLowerCase("pt-BR").endsWith(".pdf")
  );
}
