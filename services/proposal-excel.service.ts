import { parseProposalExcel } from "@/lib/proposal-excel";
import { parseSupabaseStorageReference } from "@/lib/storage/storage-reference";
import { downloadPrivateFile } from "@/lib/storage/private-storage.service";
import { createLeadActivity, findCompanyLeadFileById, findLeadById } from "@/repositories/leads.repository";
import { upsertProposal } from "@/repositories/proposals.repository";
import { requirePermission } from "@/services/auth.service";
import { PERMISSIONS } from "@/lib/auth/permissions";

const EXCEL_MIME_TYPES = new Set([
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

async function loadInternalProposalFile(leadId: string, fileId: string) {
  const user = await requirePermission(PERMISSIONS.COMMERCIAL);
  const lead = await findLeadById(leadId, user.companyId);
  if (!lead) throw new Error("Lead não encontrado.");
  const file = await findCompanyLeadFileById(fileId, user.companyId);
  if (!file || file.leadId !== leadId) {
    throw new Error("O arquivo não pertence a esta oportunidade.");
  }
  if (!EXCEL_MIME_TYPES.has(file.mimeType)) {
    throw new Error("O arquivo selecionado não é um Excel válido.");
  }
  let path: string;
  try {
    path = parseSupabaseStorageReference(file.url).path;
  } catch {
    throw new Error("A proposta interna não possui uma referência privada válida.");
  }
  const expectedPrefix = `companies/${user.companyId}/leads/${leadId}/proposal-internal/`;
  if (!path.startsWith(expectedPrefix)) {
    throw new Error("O arquivo não foi enviado como proposta interna.");
  }
  const downloaded = await downloadPrivateFile({
    companyId: user.companyId,
    reference: file.url,
  });
  return { file, buffer: downloaded.buffer, lead, user };
}

export async function previewProposalExcel(leadId: string, fileId: string) {
  const { file, buffer } = await loadInternalProposalFile(leadId, fileId);
  return parseProposalExcel(buffer, file.name);
}

export async function confirmProposalExcel(leadId: string, fileId: string) {
  const { file, buffer, lead, user } = await loadInternalProposalFile(leadId, fileId);
  const preview = parseProposalExcel(buffer, file.name);
  const cashAmount = preview.financial.cashAmount;
  if (!cashAmount || !Number.isFinite(cashAmount) || cashAmount <= 0) {
    throw new Error(
      "O valor à vista não pôde ser confirmado. Abra e salve a planilha no Excel antes de reenviar."
    );
  }
  const proposal = await upsertProposal(leadId, { amount: cashAmount });
  if (!lead.proposal) {
    await createLeadActivity({
      leadId,
      userId: user.id,
      type: "PROPOSAL_CREATED",
      title: "Proposta criada",
      notes: `${proposal.title} · ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(proposal.amount)}`,
    });
  }
  await createLeadActivity({
    leadId,
    userId: user.id,
    type: "PROPOSAL_EXCEL_IMPORTED",
    title: "Excel importado na proposta",
    notes: `${file.name} · ${new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cashAmount)}`,
  });
  if (cashAmount !== lead.estimatedValue) {
    await createLeadActivity({
      leadId,
      userId: user.id,
      type: "ESTIMATED_VALUE_UPDATED",
      title: "Valor estimado alterado",
      notes: new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(cashAmount),
    });
  }
  return {
    proposal,
    leadEstimatedValue: proposal.leadEstimatedValue,
    leadUpdatedAt: proposal.leadUpdatedAt,
    preview,
  };
}
