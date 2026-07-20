import type { ProjectDocumentItem } from "@/types/project";

export const PROJECT_DOCUMENT_CATEGORIES = [
  { value: "CONTRATO", label: "Contrato" },
  { value: "ART", label: "ART" },
  { value: "PROJETO", label: "Projeto" },
  { value: "MEMORIAL", label: "Memorial" },
  { value: "NOTA_FISCAL", label: "Nota Fiscal" },
  { value: "FOTOS", label: "Fotos" },
  { value: "GARANTIA", label: "Garantia" },
  { value: "MANUAL", label: "Manual" },
  { value: "OUTRO", label: "Outros" },
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
