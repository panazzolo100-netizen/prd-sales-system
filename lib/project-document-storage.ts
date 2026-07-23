import { unlink } from "fs/promises";
import path from "path";

export async function removeStoredProjectDocument(data: {
  projectId: string;
  url: string;
}) {
  const projectDirectory = path.resolve(
    process.cwd(),
    "public",
    "uploads",
    "projects",
    data.projectId
  );
  const relativeUrl = data.url.replace(/^[/\\]+/, "");
  const filePath = path.resolve(process.cwd(), "public", relativeUrl);
  const expectedPrefix = `${projectDirectory}${path.sep}`;

  if (!filePath.startsWith(expectedPrefix) || filePath === projectDirectory) {
    throw new Error("Caminho de documento inválido.");
  }

  try {
    await unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return;
    throw new Error("Não foi possível remover o arquivo físico do documento.");
  }
}
