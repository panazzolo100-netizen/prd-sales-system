import { NextRequest, NextResponse } from "next/server";

import { ServiceOrderPhotoCategory } from "@/lib/generated/prisma/enums";
import { PrivateStorageError } from "@/lib/storage/storage.errors";
import {
  getServiceOrderPhotoAccess,
  listServiceOrderPhotos,
  removeServiceOrderPhoto,
  uploadServiceOrderPhoto,
} from "@/services/service-order-photos.service";

const PHOTO_CATEGORIES = Object.values(ServiceOrderPhotoCategory);

function photoErrorResponse(error: unknown, fallback: string) {
  if (error instanceof PrivateStorageError) {
    const invalidCodes = new Set([
      "INVALID_FILE",
      "FILE_TYPE_NOT_ALLOWED",
      "FILE_SIZE_EXCEEDED",
      "INVALID_STORAGE_PATH",
    ]);
    return NextResponse.json(
      { error: error.message },
      { status: invalidCodes.has(error.code) ? 400 : error.code === "FILE_NOT_FOUND" ? 404 : 502 }
    );
  }
  const message = error instanceof Error ? error.message : fallback;
  const safeMessages = new Set(["Ordem de Serviço não encontrada.", "Foto não encontrada."]);
  return NextResponse.json(
    { error: safeMessages.has(message) ? message : fallback },
    { status: message.endsWith("não encontrada.") ? 404 : 500 }
  );
}

export async function GET(request: NextRequest) {
  try {
    const photoId = request.nextUrl.searchParams.get("photoId")?.trim();
    if (photoId) {
      const accessUrl = await getServiceOrderPhotoAccess(photoId);
      return NextResponse.redirect(new URL(accessUrl, request.url));
    }
    const serviceOrderId = request.nextUrl.searchParams.get("serviceOrderId")?.trim();
    if (!serviceOrderId) {
      return NextResponse.json({ error: "Ordem de Serviço obrigatória." }, { status: 400 });
    }
    return NextResponse.json(await listServiceOrderPhotos(serviceOrderId));
  } catch (error) {
    return photoErrorResponse(error, "Erro ao buscar fotos.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const serviceOrderId = String(formData.get("serviceOrderId") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim() as ServiceOrderPhotoCategory;
    const notes = String(formData.get("notes") ?? "").trim();
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Selecione uma imagem." }, { status: 400 });
    }
    if (!serviceOrderId) {
      return NextResponse.json({ error: "OS não identificada." }, { status: 400 });
    }
    if (!PHOTO_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Categoria inválida." }, { status: 400 });
    }
    const photo = await uploadServiceOrderPhoto({
      serviceOrderId,
      name: file.name,
      mimeType: file.type,
      size: file.size,
      buffer: Buffer.from(await file.arrayBuffer()),
      category,
      notes: notes || null,
    });
    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    return photoErrorResponse(error, "Erro ao enviar imagem.");
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    }
    const id = String((body as Record<string, unknown>).id ?? "").trim();
    if (!id) {
      return NextResponse.json({ error: "Foto não identificada." }, { status: 400 });
    }
    const photo = await removeServiceOrderPhoto(id);
    return NextResponse.json({ success: true, id: photo.id });
  } catch (error) {
    return photoErrorResponse(error, "Erro ao excluir foto.");
  }
}
