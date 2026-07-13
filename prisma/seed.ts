import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import { LeadStatus } from "../lib/generated/prisma/enums";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  console.log("🌱 Executando Seed...");

  const company = await prisma.company.upsert({
    where: {
      id: "default-company",
    },
    update: {},
    create: {
      id: "default-company",
      name: "PRD Energia Solar",
      document: "00.000.000/0001-00",
      phone: "(66) 99999-0000",
      email: "comercial@prd.com.br",
    },
  });

  await prisma.lead.createMany({
    data: [
      {
        companyId: company.id,
        companyName: "Fazenda São João",
        contactName: "Carlos Mendes",
        phone: "(66) 99999-1111",
        city: "Rondonópolis",
        state: "MT",
        source: "Indicação",
        status: LeadStatus.NOVO,
        consumptionKwh: 3200,
        estimatedValue: 118000,
        notes: "Cliente rural interessado em energia solar para redução da conta.",
      },
      {
        companyId: company.id,
        companyName: "Auto Posto Brasil",
        contactName: "João Pedro",
        phone: "(66) 99999-2222",
        city: "Cuiabá",
        state: "MT",
        source: "Tráfego pago",
        status: LeadStatus.PROPOSTA,
        consumptionKwh: 8900,
        estimatedValue: 295000,
        notes: "Possível projeto com energia solar e carregador veicular.",
      },
      {
        companyId: company.id,
        companyName: "Supermercado Ideal",
        contactName: "Marcos Silva",
        phone: "(66) 99999-3333",
        city: "Primavera do Leste",
        state: "MT",
        source: "WhatsApp",
        status: LeadStatus.CONTATO,
        consumptionKwh: 5700,
        estimatedValue: 176000,
        notes: "Cliente pediu análise de economia e proposta rápida.",
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed executado com sucesso.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });