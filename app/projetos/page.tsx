import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectsClient } from "@/components/projects/ProjectsClient";
import { listCompanyProjects } from "@/services/projects.service";

export default async function ProjetosPage() {
  const projects =
    await listCompanyProjects();

  return (
    <AppLayout>
      <ProjectsClient
        initialProjects={projects}
      />
    </AppLayout>
  );
}