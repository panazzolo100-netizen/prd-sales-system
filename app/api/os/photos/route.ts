import {
  mkdir,
  unlink,
  writeFile,
} from "fs/promises";
import path from "path";

import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  ServiceOrderPhotoCategory,
} from "@/lib/generated/prisma/enums";

import {
  listServiceOrderPhotos,
  removeServiceOrderPhoto,
  uploadServiceOrderPhoto,
} from "@/services/service-order-photos.service";

export async function GET(
  request: NextRequest
) {
  try {
    const serviceOrderId =
      request.nextUrl.searchParams
        .get("serviceOrderId")
        ?.trim();

    if (!serviceOrderId) {
      return NextResponse.json(
        {
          error:
            "Ordem de Serviço obrigatória.",
        },
        {
          status: 400,
        }
      );
    }

    const photos =
      await listServiceOrderPhotos(
        serviceOrderId
      );

    return NextResponse.json(
      photos,
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "ERRO AO BUSCAR FOTOS DA OS:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao buscar fotos.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const formData =
      await request.formData();

    const file =
      formData.get("file");

    const serviceOrderId =
      String(
        formData.get(
          "serviceOrderId"
        ) ?? ""
      ).trim();

    const category =
      String(
        formData.get("category") ??
          ""
      ).trim() as ServiceOrderPhotoCategory;

    const notes =
      String(
        formData.get("notes") ??
          ""
      ).trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "Selecione uma imagem.",
        },
        {
          status: 400,
        }
      );
    }

    if (!serviceOrderId) {
      return NextResponse.json(
        {
          error:
            "OS não identificada.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      ![
        "ANTES",
        "DURANTE",
        "DEPOIS",
      ].includes(category)
    ) {
      return NextResponse.json(
        {
          error:
            "Categoria inválida.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !file.type.startsWith(
        "image/"
      )
    ) {
      return NextResponse.json(
        {
          error:
            "O arquivo precisa ser uma imagem.",
        },
        {
          status: 400,
        }
      );
    }

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error:
            "A imagem deve ter no máximo 10 MB.",
        },
        {
          status: 400,
        }
      );
    }

    const extension =
      path
        .extname(file.name)
        .toLowerCase() || ".jpg";

    const fileName =
      `${Date.now()}-${crypto.randomUUID()}${extension}`;

    const uploadDirectory =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "os",
        serviceOrderId
      );

    await mkdir(
      uploadDirectory,
      {
        recursive: true,
      }
    );

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    await writeFile(
      path.join(
        uploadDirectory,
        fileName
      ),
      buffer
    );

    const url =
      `/uploads/os/${serviceOrderId}/${fileName}`;

    const photo =
      await uploadServiceOrderPhoto({
        serviceOrderId,
        name: file.name,
        url,
        mimeType: file.type,
        size: file.size,
        category,
        notes:
          notes || null,
      });

    return NextResponse.json(
      photo,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "ERRO AO ENVIAR FOTO DA OS:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erro ao enviar imagem.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const id =
      String(body.id ?? "").trim();

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Foto não identificada.",
        },
        {
          status: 400,
        }
      );
    }

    const photo =
      await removeServiceOrderPhoto(
        id
      );

    if (
      photo.url.startsWith(
        "/uploads/os/"
      )
    ) {
      const publicDirectory =
        path.resolve(
          process.cwd(),
          "public"
        );

      const filePath =
        path.resolve(
          publicDirectory,
          photo.url.replace(
            /^\/+/,
            ""
          )
        );

      const allowedDirectory =
        path.resolve(
          publicDirectory,
          "uploads",
          "os"
        );

      if (
        filePath.startsWith(
          allowedDirectory
        )
      ) {
        try {
          await unlink(filePath);
        } catch (fileError) {
          console.error(
            "FOTO REMOVIDA DO BANCO, MAS O ARQUIVO NÃO FOI ENCONTRADO:",
            fileError
          );
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        photo,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "ERRO AO EXCLUIR FOTO DA OS:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Erro ao excluir foto.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status:
          message ===
          "Foto não encontrada."
            ? 404
            : 500,
      }
    );
  }
}