import React from "react";
import QRCode from "qrcode";

import {
  renderToBuffer,
  type DocumentProps,
} from "@react-pdf/renderer";

import {
  ServiceOrderPdfDocument,
  type ServiceOrderPdfData,
} from "@/components/os/ServiceOrderPdfDocument";

import { getServiceOrderPdfData } from "@/services/service-orders.service";
import {
  resolveServiceOrderSignature,
  type ServiceOrderSignatureType,
} from "@/services/service-order-signatures.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function createAbsoluteUrl(
  url: string,
  requestUrl: string
) {
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  const origin = new URL(requestUrl).origin;

  return new URL(url, origin).toString();
}

function sanitizeFilename(
  value: string
) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

async function resolvePdfSignature(
  serviceOrderId: string,
  type: ServiceOrderSignatureType,
  exists: boolean,
  requestUrl: string
) {
  if (!exists) return null;
  const result = await resolveServiceOrderSignature(serviceOrderId, type);
  if (result.type === "redirect") return createAbsoluteUrl(result.url, requestUrl);
  return `data:${result.mimeType};base64,${result.buffer.toString("base64")}`;
}

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return Response.json(
        {
          error:
            "Ordem de Serviço obrigatória.",
        },
        {
          status: 400,
        }
      );
    }

    const serviceOrder =
      await getServiceOrderPdfData(id);

    const [customerSignature, technicianSignature] = await Promise.all([
      resolvePdfSignature(serviceOrder.id, "client", Boolean(serviceOrder.customerSignatureStorageReference), request.url),
      resolvePdfSignature(serviceOrder.id, "technician", Boolean(serviceOrder.technicianSignatureStorageReference), request.url),
    ]);

    const validationUrl =
      createAbsoluteUrl(
        `/os/validar/${serviceOrder.id}`,
        request.url
      );

    const qrCode =
      await QRCode.toDataURL(
        validationUrl,
        {
          width: 260,
          margin: 1,
          errorCorrectionLevel: "M",
        }
      );

    const pdfData: ServiceOrderPdfData = {
      ...serviceOrder,

      logo: createAbsoluteUrl(
        "/logo-prd.png",
        request.url
      ),

      qrCode,
      customerSignature,
      technicianSignature,

      photos:
        serviceOrder.photos.map(
          (photo) => ({
            ...photo,
            url: photo.accessUrl
              ? createAbsoluteUrl(photo.accessUrl, request.url)
              : "",
          })
        ),
    };

    const document =
      React.createElement(
        ServiceOrderPdfDocument,
        {
          serviceOrder: pdfData,
        }
      );

    const buffer =
      await renderToBuffer(
        document as React.ReactElement<DocumentProps>
      );

    const filename =
      sanitizeFilename(
        `${serviceOrder.number}-${serviceOrder.title}`
      ) || "ordem-de-servico";

    return new Response(
      new Uint8Array(buffer),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `inline; filename="${filename}.pdf"`,

          "Cache-Control":
            "no-store",
        },
      }
    );
  } catch (error) {
    console.error(
      "ERRO AO GERAR PDF DA OS:",
      error
    );

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível gerar o PDF da Ordem de Serviço.",
      },
      {
        status: 500,
      }
    );
  }
}
