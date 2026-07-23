"use client";

import { useState } from "react";

import { ProjectDocumentsTab } from "@/components/projects/tabs/ProjectDocumentsTab";
import type { ProjectDocumentItem } from "@/types/project";

type Props = {
  projectId: string;
  initialDocuments: ProjectDocumentItem[];
};

export function EngineeringProjectDocuments({
  projectId,
  initialDocuments,
}: Props) {
  const [documents, setDocuments] = useState(initialDocuments);

  return (
    <ProjectDocumentsTab
      projectId={projectId}
      documents={documents}
      onDocumentsChange={setDocuments}
    />
  );
}
