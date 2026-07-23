import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type PdfChecklistItem = {
  description: string;
  status: string;
  observation: string | null;
  responsible: string | null;
  completedAt: Date | string | null;
};

type PdfTechnicalDetail = {
  key: string;
  label: string;
  value: string;
};

export type ServiceOrderPdfData = {
  logo: string;
  qrCode: string;
  id: string;
  number: string;
  title: string;
  status: string;
  priority: string;
  scheduleType: string;
  responsible: string | null;
  team: string | null;
  scheduledDate: Date | string | null;
  startedDate: Date | string | null;
  completedDate: Date | string | null;
  services: string | null;
  executedServices: string | null;
  materials: string | null;
  notes: string | null;
  customerName: string | null;
  customerDocument: string | null;
  customerSignature: string | null;
  technicianName: string | null;
  technicianSignature: string | null;
  signedAt: Date | string | null;
  createdAt: Date | string;
  serviceType: string;
  serviceTypeLabel: string;
  technicalDetails: PdfTechnicalDetail[];
  checklist: PdfChecklistItem[];
  documentsCount: number;
  project: {
    id: string;
    title: string;
    status: string;
    description: string | null;
    company: {
      name: string;
      tradeName: string | null;
      document: string | null;
      phone: string | null;
      email: string | null;
      address: string | null;
    };
    client: {
      id: string;
      name: string;
      document: string | null;
      phone: string | null;
      email: string | null;
      city: string | null;
      state: string | null;
      address: string | null;
      lead: { contactName: string } | null;
    };
  };
  photos: Array<{ id: string }>;
};

type Props = { serviceOrder: ServiceOrderPdfData };

const ORANGE = "#e85d04";
const INK = "#18181b";
const MUTED = "#62626b";
const BORDER = "#d7d7dc";
const SOFT = "#f7f7f8";

const styles = StyleSheet.create({
  page: {
    paddingTop: 19,
    paddingRight: 30,
    paddingBottom: 42,
    paddingLeft: 30,
    fontFamily: "Helvetica",
    fontSize: 7.8,
    lineHeight: 1.3,
    color: INK,
    backgroundColor: "#ffffff",
  },
  accent: { position: "absolute", top: 0, left: 0, right: 0, height: 5, backgroundColor: ORANGE },
  header: { flexDirection: "row", alignItems: "center", paddingBottom: 7, borderBottomWidth: 1.5, borderBottomColor: ORANGE },
  brand: { width: "57%", flexDirection: "row", alignItems: "center" },
  logo: { width: 36, height: 36, marginRight: 8, objectFit: "contain" },
  companyName: { fontFamily: "Helvetica-Bold", fontSize: 11.5 },
  companyLine: { marginTop: 2, fontSize: 6.7, color: MUTED },
  documentIdentity: { width: "43%", minHeight: 58, flexDirection: "column", alignItems: "center", justifyContent: "flex-start" },
  documentTitle: { width: "100%", fontFamily: "Helvetica-Bold", fontSize: 8, letterSpacing: 0.7, color: "#3f3f46", textAlign: "center" },
  documentNumber: { width: "100%", marginTop: 5, fontFamily: "Helvetica-Bold", fontSize: 17, color: ORANGE, textAlign: "center" },
  headerMeta: { width: "100%", marginTop: 5, fontSize: 6.8, color: MUTED, textAlign: "center" },
  status: { marginTop: 6, paddingVertical: 2.5, paddingHorizontal: 9, borderWidth: 1, borderColor: ORANGE, fontFamily: "Helvetica-Bold", fontSize: 7, color: INK, textAlign: "center" },
  section: { marginTop: 7 },
  sectionHeading: { marginBottom: 5, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: ORANGE, flexDirection: "row", justifyContent: "space-between" },
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 8.2, letterSpacing: 0.4, color: INK },
  sectionHint: { fontSize: 6.5, color: MUTED },
  grid: { flexDirection: "row", flexWrap: "wrap", borderTopWidth: 1, borderLeftWidth: 1, borderColor: BORDER },
  field: { width: "50%", minHeight: 24, padding: 4, borderRightWidth: 1, borderBottomWidth: 1, borderColor: BORDER },
  fieldThird: { width: "33.333%", minHeight: 24, padding: 4, borderRightWidth: 1, borderBottomWidth: 1, borderColor: BORDER },
  fieldFull: { width: "100%", minHeight: 24, padding: 4, borderRightWidth: 1, borderBottomWidth: 1, borderColor: BORDER },
  label: { fontFamily: "Helvetica-Bold", fontSize: 6.2, color: MUTED, textTransform: "uppercase" },
  value: { marginTop: 2, fontSize: 8.1 },
  textArea: { minHeight: 27, padding: 5, borderWidth: 1, borderColor: BORDER, backgroundColor: "#ffffff" },
  textAreaManual: { minHeight: 32, padding: 5, borderWidth: 1, borderColor: BORDER, backgroundColor: SOFT, color: MUTED },
  technicalGrid: { flexDirection: "row", flexWrap: "wrap", borderTopWidth: 1, borderLeftWidth: 1, borderColor: BORDER },
  technicalField: { width: "33.333%", padding: 5, borderRightWidth: 1, borderBottomWidth: 1, borderColor: BORDER },
  table: { borderTopWidth: 1, borderLeftWidth: 1, borderColor: BORDER },
  tableHeader: { flexDirection: "row", backgroundColor: "#ededf0", borderBottomWidth: 1, borderColor: BORDER },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: BORDER },
  cell: { paddingVertical: 3, paddingHorizontal: 4, borderRightWidth: 1, borderColor: BORDER },
  cellHeader: { fontFamily: "Helvetica-Bold", fontSize: 6.4, textTransform: "uppercase" },
  checklistItem: { width: "40%" },
  checklistStatus: { width: "16%", fontFamily: "Helvetica-Bold" },
  checklistObservation: { width: "29%" },
  checklistResponsible: { width: "15%" },
  evidence: { flexDirection: "row", alignItems: "center", padding: 7, borderWidth: 1, borderColor: BORDER },
  evidenceText: { flex: 1 },
  evidenceTitle: { fontFamily: "Helvetica-Bold", fontSize: 8 },
  evidenceDescription: { marginTop: 2, fontSize: 6.8, color: MUTED },
  qr: { width: 39, height: 39, marginLeft: 10 },
  signatures: { flexDirection: "row", justifyContent: "space-between" },
  signature: { width: "48%", minHeight: 78, padding: 6, borderWidth: 1, borderColor: BORDER },
  signatureRole: { fontFamily: "Helvetica-Bold", fontSize: 7, color: ORANGE, textTransform: "uppercase" },
  signatureImage: { width: "100%", height: 36, marginTop: 3, objectFit: "contain" },
  signatureBlank: { height: 38 },
  signatureLine: { paddingTop: 4, borderTopWidth: 1, borderTopColor: INK, textAlign: "center", fontFamily: "Helvetica-Bold", fontSize: 7.4 },
  signatureMeta: { marginTop: 2, textAlign: "center", fontSize: 6.5, color: MUTED },
  footer: { position: "absolute", left: 30, right: 30, bottom: 16, paddingTop: 5, borderTopWidth: 1, borderTopColor: BORDER, flexDirection: "row", justifyContent: "space-between", fontSize: 6.3, color: MUTED },
});

function clean(value: unknown) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized && !["undefined", "null", "nan", "invalid date"].includes(normalized.toLowerCase()) ? normalized : null;
}

function formatDate(value: Date | string | null, includeTime = false) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    ...(includeTime ? { timeStyle: "short" as const } : {}),
    timeZone: "America/Cuiaba",
  }).format(date);
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").toLocaleLowerCase("pt-BR").replace(/(^|\s)\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

function Field({ label, value, width = "half" }: { label: string; value: unknown; width?: "half" | "third" | "full" }) {
  const text = clean(value);
  if (!text) return null;
  return (
    <View style={width === "full" ? styles.fieldFull : width === "third" ? styles.fieldThird : styles.field} wrap={false}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{text}</Text>
    </View>
  );
}

function SectionTitle({ title, hint, minPresenceAhead = 35 }: { title: string; hint?: string; minPresenceAhead?: number }) {
  return (
    <View style={styles.sectionHeading} wrap={false} minPresenceAhead={minPresenceAhead}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

function TextSection({ title, value, emptyText }: { title: string; value: string | null; emptyText?: string }) {
  const content = clean(value) ?? emptyText;
  if (!content) return null;
  return (
    <View style={styles.section} wrap={content.length > 420}>
      <SectionTitle title={title} />
      <Text style={emptyText && !clean(value) ? styles.textAreaManual : styles.textArea}>{content}</Text>
    </View>
  );
}

export function ServiceOrderPdfDocument({ serviceOrder }: Props) {
  const company = serviceOrder.project.company;
  const client = serviceOrder.project.client;
  const companyName = company.tradeName ?? company.name;
  const location = [client.address, client.city, client.state].filter(Boolean).join(" - ");
  const generatedAt = formatDate(new Date(), true) ?? "";
  const isCompleted = serviceOrder.status === "CONCLUIDA";
  const checklistGroups = serviceOrder.checklist.length > 10
    ? Array.from(
        { length: Math.ceil(serviceOrder.checklist.length / 8) },
        (_, index) => serviceOrder.checklist.slice(index * 8, index * 8 + 8)
      )
    : [serviceOrder.checklist];

  return (
    <Document
      title={`${serviceOrder.number} - ${serviceOrder.title}`}
      author={companyName}
      subject="Ordem de Serviço operacional"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.accent} fixed />
        <View style={styles.footer} fixed>
          <Text>{companyName} | {serviceOrder.number}</Text>
          <Text>Emitido em {generatedAt}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>

        <View style={styles.header} wrap={false}>
          <View style={styles.brand}>
            <Image src={serviceOrder.logo} style={styles.logo} />
            <View>
              <Text style={styles.companyName}>{companyName}</Text>
              {company.name !== companyName ? <Text style={styles.companyLine}>{company.name}</Text> : null}
              {clean(company.document) ? <Text style={styles.companyLine}>CNPJ: {company.document}</Text> : null}
              {clean([company.phone, company.email].filter(Boolean).join(" | ")) ? <Text style={styles.companyLine}>{[company.phone, company.email].filter(Boolean).join(" | ")}</Text> : null}
            </View>
          </View>
          <View style={styles.documentIdentity}>
            <Text style={styles.documentTitle}>ORDEM DE SERVIÇO</Text>
            <Text style={styles.documentNumber}>{serviceOrder.number}</Text>
            <Text style={styles.headerMeta}>Emitida em {formatDate(serviceOrder.createdAt) ?? generatedAt}</Text>
            <Text style={styles.status}>{formatLabel(serviceOrder.status)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="DADOS DO CLIENTE" />
          <View style={styles.grid}>
            <Field label="Cliente" value={client.name} />
            <Field label="Contato" value={client.lead?.contactName} />
            <Field label="Telefone" value={client.phone} />
            <Field label="E-mail" value={client.email} />
            <Field label="CPF / CNPJ" value={client.document} />
            <Field label="Local de execução" value={location} />
          </View>
        </View>

        <View style={styles.section}>
          <SectionTitle title="PROJETO E SERVIÇO" />
          <View style={styles.grid}>
            <Field label="Projeto" value={serviceOrder.project.title} />
            <Field label="Tipo do serviço" value={serviceOrder.serviceTypeLabel} />
            <Field label="Responsável" value={serviceOrder.responsible} />
            <Field label="Equipe" value={serviceOrder.team} />
            <Field label="Data agendada" value={formatDate(serviceOrder.scheduledDate, true)} width="third" />
            <Field label="Início" value={formatDate(serviceOrder.startedDate, true)} width="third" />
            <Field label="Conclusão" value={formatDate(serviceOrder.completedDate, true)} width="third" />
            <Field label="Prioridade" value={formatLabel(serviceOrder.priority)} width="third" />
            <Field label="Agendamento" value={formatLabel(serviceOrder.scheduleType)} width="third" />
            <Field label="Status" value={formatLabel(serviceOrder.status)} width="third" />
          </View>
        </View>

        <TextSection title="ESCOPO DO SERVIÇO" value={serviceOrder.services ?? serviceOrder.project.description} emptyText="Área destinada ao registro do escopo e das solicitações do cliente." />

        {serviceOrder.technicalDetails.length > 0 ? (
          <View style={styles.section}>
            <SectionTitle title={`DADOS TÉCNICOS - ${serviceOrder.serviceTypeLabel.toLocaleUpperCase("pt-BR")}`} />
            <View style={styles.technicalGrid}>
              {serviceOrder.technicalDetails.map((detail) => (
                <View key={detail.key} style={styles.technicalField} wrap={false}>
                  <Text style={styles.label}>{detail.label}</Text>
                  <Text style={styles.value}>{detail.value}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <TextSection
          title="SERVIÇOS EXECUTADOS"
          value={serviceOrder.executedServices}
          emptyText={isCompleted ? "Execução concluída sem descrição detalhada registrada." : "Execução em andamento. Área destinada ao registro dos serviços realizados."}
        />

        {serviceOrder.checklist.length > 0 ? (
          <View style={styles.section}>
            <SectionTitle title="CHECKLIST DE EXECUÇÃO" hint={`${serviceOrder.checklist.filter((item) => item.status === "CONCLUIDO").length}/${serviceOrder.checklist.length} concluídos`} minPresenceAhead={serviceOrder.checklist.length > 10 ? 220 : 70} />
            {checklistGroups.map((group, groupIndex) => (
              <View key={groupIndex} style={[styles.table, groupIndex > 0 ? { marginTop: 4 } : {}]} wrap={false}>
                <View style={styles.tableHeader} wrap={false}>
                  <Text style={[styles.cell, styles.cellHeader, styles.checklistItem]}>Item técnico</Text>
                  <Text style={[styles.cell, styles.cellHeader, styles.checklistStatus]}>Situação</Text>
                  <Text style={[styles.cell, styles.cellHeader, styles.checklistObservation]}>Observação</Text>
                  <Text style={[styles.cell, styles.cellHeader, styles.checklistResponsible]}>Responsável</Text>
                </View>
                {group.map((item, index) => (
                  <View key={`${item.description}-${index}`} style={styles.tableRow} wrap={false}>
                    <Text style={[styles.cell, styles.checklistItem]}>{item.description}</Text>
                    <Text style={[styles.cell, styles.checklistStatus]}>{formatLabel(item.status)}</Text>
                    <Text style={[styles.cell, styles.checklistObservation]}>{item.observation ?? ""}</Text>
                    <Text style={[styles.cell, styles.checklistResponsible]}>{item.responsible ?? ""}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        <TextSection title="MATERIAIS E EQUIPAMENTOS UTILIZADOS" value={serviceOrder.materials} />

        <View style={styles.section} wrap={false}>
          <SectionTitle title="APONTAMENTO DE EXECUÇÃO" />
          <View style={styles.grid}>
            <Field label="Data" value={formatDate(serviceOrder.startedDate)} width="third" />
            <Field label="Início" value={formatDate(serviceOrder.startedDate, true)} width="third" />
            <Field label="Término" value={formatDate(serviceOrder.completedDate, true)} width="third" />
            <Field label="Responsável" value={serviceOrder.responsible} />
            <Field label="Equipe" value={serviceOrder.team} />
          </View>
        </View>

        <TextSection title="OBSERVAÇÕES" value={serviceOrder.notes} />

        <View style={styles.section} wrap={false}>
          <SectionTitle title="EVIDÊNCIAS E CONSULTA DIGITAL" />
          <View style={styles.evidence}>
            <View style={styles.evidenceText}>
              <Text style={styles.evidenceTitle}>{serviceOrder.photos.length} foto(s) e {serviceOrder.documentsCount} documento(s) vinculados</Text>
              <Text style={styles.evidenceDescription}>Escaneie o QR Code para consultar e validar digitalmente esta Ordem de Serviço.</Text>
              <Text style={styles.evidenceDescription}>Referência: {serviceOrder.id}</Text>
            </View>
            <Image src={serviceOrder.qrCode} style={styles.qr} />
          </View>
        </View>

        <View style={styles.section} wrap={false} minPresenceAhead={110}>
          <SectionTitle title="ASSINATURAS" />
          <View style={styles.signatures}>
            <View style={styles.signature} wrap={false}>
              <Text style={styles.signatureRole}>Responsável técnico</Text>
              {serviceOrder.technicianSignature ? <Image src={serviceOrder.technicianSignature} style={styles.signatureImage} /> : <View style={styles.signatureBlank} />}
              <Text style={styles.signatureLine}>{serviceOrder.technicianName ?? serviceOrder.responsible ?? "Responsável técnico"}</Text>
              <Text style={styles.signatureMeta}>Função: responsável pela execução</Text>
              <Text style={styles.signatureMeta}>Data: {formatDate(serviceOrder.signedAt) ?? "____/____/________"}</Text>
            </View>
            <View style={styles.signature} wrap={false}>
              <Text style={styles.signatureRole}>Cliente</Text>
              {serviceOrder.customerSignature ? <Image src={serviceOrder.customerSignature} style={styles.signatureImage} /> : <View style={styles.signatureBlank} />}
              <Text style={styles.signatureLine}>{serviceOrder.customerName ?? client.name}</Text>
              <Text style={styles.signatureMeta}>Documento: {serviceOrder.customerDocument ?? client.document ?? "________________________"}</Text>
              <Text style={styles.signatureMeta}>Data: {formatDate(serviceOrder.signedAt) ?? "____/____/________"}</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
}
