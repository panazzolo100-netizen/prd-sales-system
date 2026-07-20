import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

type ServiceOrderPdfPhoto = {
  id: string;
  name: string;
  url: string;
  category: string;
  notes: string | null;
  createdAt: Date | string;
};

type ServiceOrderPdfTimeline = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  createdAt: Date | string;
};

export type ServiceOrderPdfData = {
  logo: string;
  qrCode: string;

  id: string;
  number: string;
  title: string;
  status: string;

  responsible: string | null;
  team: string | null;

  scheduledDate: Date | string | null;
  startedDate: Date | string | null;
  completedDate: Date | string | null;

  services: string | null;
  materials: string | null;
  notes: string | null;

  checklistArt: boolean;
  checklistProjectApproved: boolean;
  checklistMaterialsSeparated: boolean;
  checklistStructureInstalled: boolean;
  checklistModulesInstalled: boolean;
  checklistInverterInstalled: boolean;
  checklistDcCabling: boolean;
  checklistAcCabling: boolean;
  checklistCommissioning: boolean;
  checklistCustomerTraining: boolean;
  checklistDelivered: boolean;

  customerName: string | null;
  customerDocument: string | null;
  customerSignature: string | null;

  technicianName: string | null;
  technicianSignature: string | null;

  signedAt: Date | string | null;

  createdAt: Date | string;

  project: {
    id: string;
    title: string;
    status: string;
    description: string | null;

    client: {
      id: string;
      name: string;
      document: string | null;
      phone: string | null;
      email: string | null;
      city: string | null;
      state: string | null;
      address: string | null;
    };
  };

  photos: ServiceOrderPdfPhoto[];
  timeline: ServiceOrderPdfTimeline[];
};

type Props = {
  serviceOrder: ServiceOrderPdfData;
};

const ORANGE = "#ea580c";
const DARK = "#18181b";
const TEXT = "#27272a";
const MUTED = "#71717a";
const BORDER = "#e4e4e7";
const LIGHT = "#fafafa";

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingRight: 34,
    paddingBottom: 48,
    paddingLeft: 34,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: TEXT,
    backgroundColor: "#ffffff",
  },

  topAccent: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    height: 8,
    backgroundColor: ORANGE,
  },

  coverPanel: {
    marginTop: 16,
    marginBottom: 16,
    paddingTop: 20,
    paddingRight: 18,
    paddingBottom: 18,
    paddingLeft: 18,
    borderRadius: 8,
    backgroundColor: DARK,
  },

  coverTop: {
    flexDirection: "column",
  },

  coverNumberBlock: {
    width: "100%",
    marginBottom: 16,
  },

  coverTitleBlock: {
    width: "100%",
  },

  coverSmallLabel: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: "#a1a1aa",
    letterSpacing: 1,
    textTransform: "uppercase",
  },

  coverNumber: {
    marginTop: 5,
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: ORANGE,
  },

  coverTitle: {
    fontSize: 19,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    lineHeight: 1.15,
  },

  coverProject: {
    marginTop: 5,
    fontSize: 8.5,
    color: "#d4d4d8",
  },

  coverDivider: {
    marginTop: 16,
    marginBottom: 14,
    height: 1,
    backgroundColor: "#3f3f46",
  },

  coverMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  coverMeta: {
    width: "23%",
  },

  coverMetaLabel: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: "#a1a1aa",
    textTransform: "uppercase",
  },

  coverMetaValue: {
    marginTop: 4,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: ORANGE,
  },

  brandBlock: {
    flexDirection: "row",
    alignItems: "center",
  },

  logo: {
    width: 48,
    height: 48,
    marginRight: 11,
    objectFit: "contain",
  },

  companyName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },

  companySubtitle: {
    marginTop: 3,
    fontSize: 7.5,
    color: MUTED,
  },

  headerRight: {
    alignItems: "flex-end",
  },

  documentType: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: MUTED,
    letterSpacing: 1.1,
  },

  documentNumber: {
    marginTop: 3,
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: ORANGE,
  },

  issueDate: {
    marginTop: 3,
    fontSize: 7,
    color: MUTED,
  },

  hero: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 7,
    backgroundColor: DARK,
  },

  heroEyebrow: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#fdba74",
    letterSpacing: 1,
  },

  heroTitle: {
    marginTop: 5,
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },

  heroClient: {
    marginTop: 5,
    fontSize: 9,
    color: "#d4d4d8",
  },

  heroBottom: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  heroStatusBlock: {
    width: "35%",
  },

  heroProgressBlock: {
    width: "61%",
  },

  heroLabel: {
    marginBottom: 4,
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: "#a1a1aa",
    textTransform: "uppercase",
  },

  statusBadge: {
    alignSelf: "flex-start",
    paddingTop: 4,
    paddingRight: 8,
    paddingBottom: 4,
    paddingLeft: 8,
    borderRadius: 10,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },

  progressText: {
    fontSize: 7,
    color: "#d4d4d8",
  },

  progressPercent: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },

  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: "#3f3f46",
    overflow: "hidden",
  },

  progressFill: {
    height: 7,
    borderRadius: 4,
    backgroundColor: ORANGE,
  },

  summaryGrid: {
    flexDirection: "row",
    marginBottom: 14,
  },

  summaryCard: {
    width: "24%",
    marginRight: "1.33%",
    padding: 9,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    backgroundColor: LIGHT,
  },

  summaryCardLast: {
    width: "24%",
    padding: 9,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    backgroundColor: LIGHT,
  },

  summaryLabel: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: MUTED,
    textTransform: "uppercase",
  },

  summaryValue: {
    marginTop: 4,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },

  section: {
    marginBottom: 14,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  sectionNumber: {
    width: 18,
    height: 18,
    marginRight: 7,
    paddingTop: 4,
    borderRadius: 9,
    backgroundColor: ORANGE,
    color: "#ffffff",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },

  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 7,
    color: MUTED,
  },

  informationBox: {
    padding: 11,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
  },

  row: {
    flexDirection: "row",
    marginBottom: 8,
  },

  rowLast: {
    flexDirection: "row",
  },

  column: {
    width: "50%",
    paddingRight: 12,
  },

  fullColumn: {
    width: "100%",
  },

  label: {
    marginBottom: 3,
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: MUTED,
    textTransform: "uppercase",
  },

  value: {
    fontSize: 9,
    color: TEXT,
  },

  textBox: {
    minHeight: 38,
    padding: 9,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    backgroundColor: LIGHT,
    fontSize: 8.5,
    lineHeight: 1.45,
  },

  fieldSpacing: {
    marginTop: 8,
  },

  checklistSummary: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 9,
    padding: 10,
    borderRadius: 5,
    backgroundColor: "#fff7ed",
  },

  checklistSummaryTitle: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#9a3412",
  },

  checklistSummaryText: {
    marginTop: 2,
    fontSize: 7,
    color: "#c2410c",
  },

  checklistPercent: {
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
    color: ORANGE,
  },

  checklistGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  checklistItem: {
    width: "50%",
    paddingRight: 8,
    marginBottom: 7,
    flexDirection: "row",
    alignItems: "center",
  },

  checklistMark: {
    width: 14,
    height: 14,
    marginRight: 7,
    paddingTop: 2,
    borderWidth: 1,
    borderRadius: 7,
    textAlign: "center",
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
  },

  checklistDone: {
    backgroundColor: "#dcfce7",
    borderColor: "#16a34a",
    color: "#166534",
  },

  checklistPending: {
    backgroundColor: "#fafafa",
    borderColor: "#d4d4d8",
    color: "#a1a1aa",
  },

  checklistTable: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    overflow: "hidden",
  },

  checklistTableHeader: {
    flexDirection: "row",
    backgroundColor: DARK,
  },

  checklistTableHeaderStep: {
    width: "72%",
    padding: 7,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
  },

  checklistTableHeaderStatus: {
    width: "28%",
    padding: 7,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textAlign: "center",
    textTransform: "uppercase",
  },

  checklistTableRow: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: "#ffffff",
  },

  checklistTableRowAlt: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    backgroundColor: LIGHT,
  },

  checklistTableStep: {
    width: "72%",
    padding: 7,
    fontSize: 8,
  },

  checklistTableStatus: {
    width: "28%",
    padding: 7,
    textAlign: "center",
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
  },

  statusDoneText: {
    color: "#166534",
  },

  statusPendingText: {
    color: "#a1a1aa",
  },

  photoCategory: {
    marginTop: 5,
    marginBottom: 7,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: ORANGE,
  },

  photosGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  photoCard: {
    width: "48%",
    marginRight: "2%",
    marginBottom: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
    backgroundColor: "#ffffff",
  },

  photo: {
    width: "100%",
    height: 145,
    objectFit: "cover",
  },

  photoName: {
    marginTop: 5,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },

  photoNotes: {
    marginTop: 3,
    fontSize: 7,
    color: MUTED,
  },

  timelineItem: {
    flexDirection: "row",
    marginBottom: 8,
  },

  timelineMarkerColumn: {
    width: 18,
    alignItems: "center",
  },

  timelineDot: {
    width: 8,
    height: 8,
    marginTop: 2,
    borderRadius: 4,
    backgroundColor: ORANGE,
  },

  timelineLine: {
    width: 1,
    height: 34,
    marginTop: 2,
    backgroundColor: BORDER,
  },

  timelineContent: {
    width: "96%",
    paddingBottom: 4,
  },

  timelineTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },

  timelineDescription: {
    marginTop: 2,
    fontSize: 7.5,
    color: "#52525b",
    lineHeight: 1.35,
  },

  timelineDate: {
    marginTop: 3,
    fontSize: 6.5,
    color: MUTED,
  },

  signaturesRow: {
    flexDirection: "row",
  },

  signatureCard: {
    width: "48%",
    minHeight: 128,
    marginRight: "2%",
    padding: 9,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 5,
  },

  signatureImage: {
    width: "100%",
    height: 65,
    objectFit: "contain",
  },

  signaturePlaceholder: {
    height: 65,
    paddingTop: 27,
    textAlign: "center",
    fontSize: 8,
    color: "#a1a1aa",
  },

  signatureLine: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#a1a1aa",
    textAlign: "center",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
  },

  signatureDocument: {
    marginTop: 3,
    textAlign: "center",
    fontSize: 7,
    color: MUTED,
  },

  signedAt: {
    marginTop: 7,
    fontSize: 7,
    color: MUTED,
  },

  validationBox: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    backgroundColor: LIGHT,
    flexDirection: "row",
    alignItems: "center",
  },

  qrCode: {
    width: 72,
    height: 72,
    marginRight: 12,
  },

  validationContent: {
    flex: 1,
  },

  validationTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: DARK,
  },

  validationText: {
    marginTop: 4,
    fontSize: 7.5,
    color: MUTED,
    lineHeight: 1.35,
  },

  validationCode: {
    marginTop: 6,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: ORANGE,
  },

  footer: {
    position: "absolute",
    right: 34,
    bottom: 18,
    left: 34,
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#a1a1aa",
  },
});

function formatDate(
  value: Date | string | null
) {
  if (!value) {
    return "Não informado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Cuiaba",
  }).format(new Date(value));
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLocaleLowerCase("pt-BR")
    .replace(/\b\w/g, (letter) =>
      letter.toLocaleUpperCase("pt-BR")
    );
}

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    ANTES: "Antes da execução",
    DURANTE: "Durante a execução",
    DEPOIS: "Após a execução",
  };

  return labels[category] ?? formatStatus(category);
}

function getStatusStyle(status: string) {
  switch (status) {
    case "CONCLUIDA":
      return {
        backgroundColor: "#dcfce7",
        color: "#166534",
      };

    case "EM_ANDAMENTO":
      return {
        backgroundColor: "#e0f2fe",
        color: "#075985",
      };

    case "CANCELADA":
      return {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
      };

    case "AGENDADA":
      return {
        backgroundColor: "#ede9fe",
        color: "#5b21b6",
      };

    default:
      return {
        backgroundColor: "#ffedd5",
        color: "#9a3412",
      };
  }
}

function ChecklistTableRow({
  label,
  completed,
  alternate,
}: {
  label: string;
  completed: boolean;
  alternate: boolean;
}) {
  return (
    <View
      style={
        alternate
          ? styles.checklistTableRowAlt
          : styles.checklistTableRow
      }
      wrap={false}
    >
      <Text style={styles.checklistTableStep}>
        {label}
      </Text>

      <Text
        style={[
          styles.checklistTableStatus,
          completed
            ? styles.statusDoneText
            : styles.statusPendingText,
        ]}
      >
        {completed ? "CONCLUÍDO" : "PENDENTE"}
      </Text>
    </View>
  );
}

function ChecklistItem({
  label,
  completed,
}: {
  label: string;
  completed: boolean;
}) {
  return (
    <View style={styles.checklistItem}>
      <Text
        style={[
          styles.checklistMark,
          completed
            ? styles.checklistDone
            : styles.checklistPending,
        ]}
      >
        {completed ? "OK" : ""}
      </Text>

      <Text>{label}</Text>
    </View>
  );
}

function InformationField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <View style={styles.column}>
      <Text style={styles.label}>
        {label}
      </Text>

      <Text style={styles.value}>
        {value || "Não informado"}
      </Text>
    </View>
  );
}

function SectionHeader({
  number,
  title,
  subtitle,
}: {
  number: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionNumber}>
        {number}
      </Text>

      <View>
        <Text style={styles.sectionTitle}>
          {title}
        </Text>

        {subtitle && (
          <Text style={styles.sectionSubtitle}>
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

function SummaryCard({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      style={
        last
          ? styles.summaryCardLast
          : styles.summaryCard
      }
    >
      <Text style={styles.summaryLabel}>
        {label}
      </Text>

      <Text style={styles.summaryValue}>
        {value}
      </Text>
    </View>
  );
}

export function ServiceOrderPdfDocument({
  serviceOrder,
}: Props) {
  const checklistItems = [
    serviceOrder.checklistArt,
    serviceOrder.checklistProjectApproved,
    serviceOrder.checklistMaterialsSeparated,
    serviceOrder.checklistStructureInstalled,
    serviceOrder.checklistModulesInstalled,
    serviceOrder.checklistInverterInstalled,
    serviceOrder.checklistDcCabling,
    serviceOrder.checklistAcCabling,
    serviceOrder.checklistCommissioning,
    serviceOrder.checklistCustomerTraining,
    serviceOrder.checklistDelivered,
  ];

  const checklistCompleted =
    checklistItems.filter(Boolean).length;

  const checklistTotal =
    checklistItems.length;

  const checklistPercentage = Math.round(
    (checklistCompleted / checklistTotal) * 100
  );

  const photoCategories = Array.from(
    new Set(
      serviceOrder.photos.map(
        (photo) => photo.category
      )
    )
  );

  const statusStyle =
    getStatusStyle(serviceOrder.status);

  const generatedAt = new Intl.DateTimeFormat(
    "pt-BR",
    {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "America/Cuiaba",
    }
  ).format(new Date());

  const location = [
    serviceOrder.project.client.city,
    serviceOrder.project.client.state,
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <Document
      title={`${serviceOrder.number} - ${serviceOrder.title}`}
      author="PRD Soluções em Engenharia"
      subject="Relatório técnico de Ordem de Serviço"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.topAccent} fixed />

        <View style={styles.header}>
          <View style={styles.brandBlock}>
            <Image
              src={serviceOrder.logo}
              style={styles.logo}
            />

            <View>
              <Text style={styles.companyName}>
                PRD Soluções em Engenharia
              </Text>

              <Text style={styles.companySubtitle}>
                Engenharia elétrica, energia e soluções técnicas
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <Text style={styles.documentType}>
              ORDEM DE SERVIÇO
            </Text>

            <Text style={styles.documentNumber}>
              {serviceOrder.number}
            </Text>

            <Text style={styles.issueDate}>
              Emitido em{" "}
              {new Date().toLocaleDateString(
                "pt-BR"
              )}
            </Text>
          </View>
        </View>

        <View style={styles.coverPanel}>
          <View style={styles.coverTop}>
            <View style={styles.coverNumberBlock}>
              <Text style={styles.coverSmallLabel}>
                Ordem de Serviço
              </Text>

              <Text style={styles.coverNumber}>
                {serviceOrder.number}
              </Text>

              <Text
                style={[
                  styles.statusBadge,
                  statusStyle,
                  { marginTop: 9 },
                ]}
              >
                {formatStatus(serviceOrder.status)}
              </Text>
            </View>

            <View style={styles.coverTitleBlock}>
              <Text style={[styles.coverTitle,{ marginTop: 2 }]}>
                {serviceOrder.title}
              </Text>

              <Text style={styles.coverProject}>
                {serviceOrder.project.client.name}
                {"  •  "}
                {serviceOrder.project.title}
              </Text>

              <View style={{ marginTop: 14 }}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressText}>
                    Progresso da execução
                  </Text>

                  <Text style={styles.progressPercent}>
                    {checklistPercentage}%
                  </Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${checklistPercentage}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.coverDivider} />

          <View style={styles.coverMetaRow}>
            <View style={styles.coverMeta}>
              <Text style={styles.coverMetaLabel}>
                Responsável
              </Text>

              <Text style={styles.coverMetaValue}>
                {serviceOrder.responsible ||
                  "Não informado"}
              </Text>
            </View>

            <View style={styles.coverMeta}>
              <Text style={styles.coverMetaLabel}>
                Agendamento
              </Text>

              <Text style={styles.coverMetaValue}>
                {formatDate(
                  serviceOrder.scheduledDate
                )}
              </Text>
            </View>

            <View style={styles.coverMeta}>
              <Text style={styles.coverMetaLabel}>
                Checklist
              </Text>

              <Text style={styles.coverMetaValue}>
                {checklistCompleted}/
                {checklistTotal} etapas
              </Text>
            </View>

            <View style={styles.coverMeta}>
              <Text style={styles.coverMetaLabel}>
                Evidências
              </Text>

              <Text style={styles.coverMetaValue}>
                {serviceOrder.photos.length} fotos
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          <SummaryCard
            label="Progresso"
            value={`${checklistPercentage}%`}
          />

          <SummaryCard
            label="Etapas concluídas"
            value={`${checklistCompleted}/${checklistTotal}`}
          />

          <SummaryCard
            label="Fotos"
            value={String(
              serviceOrder.photos.length
            )}
          />

          <SummaryCard
            label="Eventos"
            value={String(
              serviceOrder.timeline.length
            )}
            last
          />
        </View>

        <View style={styles.section}>
          <SectionHeader
            number="1"
            title="Identificação da Ordem de Serviço"
            subtitle="Dados gerais, equipe e datas da execução"
          />

          <View style={styles.informationBox}>
            <View style={styles.row}>
              <InformationField
                label="Número da OS"
                value={serviceOrder.number}
              />

              <InformationField
                label="Status"
                value={formatStatus(
                  serviceOrder.status
                )}
              />
            </View>

            <View style={styles.row}>
              <InformationField
                label="Responsável"
                value={
                  serviceOrder.responsible
                }
              />

              <InformationField
                label="Equipe"
                value={serviceOrder.team}
              />
            </View>

            <View style={styles.row}>
              <InformationField
                label="Data agendada"
                value={formatDate(
                  serviceOrder.scheduledDate
                )}
              />

              <InformationField
                label="Início da execução"
                value={formatDate(
                  serviceOrder.startedDate
                )}
              />
            </View>

            <View style={styles.rowLast}>
              <InformationField
                label="Conclusão"
                value={formatDate(
                  serviceOrder.completedDate
                )}
              />

              <InformationField
                label="Criação da OS"
                value={formatDate(
                  serviceOrder.createdAt
                )}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            number="2"
            title="Projeto e cliente"
            subtitle="Informações cadastrais e local da execução"
          />

          <View style={styles.informationBox}>
            <View style={styles.row}>
              <InformationField
                label="Projeto"
                value={
                  serviceOrder.project.title
                }
              />

              <InformationField
                label="Cliente"
                value={
                  serviceOrder.project.client
                    .name
                }
              />
            </View>

            <View style={styles.row}>
              <InformationField
                label="CPF / CNPJ"
                value={
                  serviceOrder.project.client
                    .document
                }
              />

              <InformationField
                label="Telefone"
                value={
                  serviceOrder.project.client
                    .phone
                }
              />
            </View>

            <View style={styles.row}>
              <InformationField
                label="E-mail"
                value={
                  serviceOrder.project.client
                    .email
                }
              />

              <InformationField
                label="Cidade / Estado"
                value={location}
              />
            </View>

            <View style={styles.fullColumn}>
              <Text style={styles.label}>
                Endereço
              </Text>

              <Text style={styles.value}>
                {serviceOrder.project.client
                  .address || "Não informado"}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader
            number="3"
            title="Escopo da execução"
            subtitle="Serviços, materiais e observações registrados"
          />

          <Text style={styles.label}>
            Serviços
          </Text>

          <Text style={styles.textBox}>
            {serviceOrder.services ||
              "Nenhum serviço informado."}
          </Text>

          <Text
            style={[
              styles.label,
              styles.fieldSpacing,
            ]}
          >
            Materiais
          </Text>

          <Text style={styles.textBox}>
            {serviceOrder.materials ||
              "Nenhum material informado."}
          </Text>

          <Text
            style={[
              styles.label,
              styles.fieldSpacing,
            ]}
          >
            Observações
          </Text>

          <Text style={styles.textBox}>
            {serviceOrder.notes ||
              "Nenhuma observação informada."}
          </Text>
        </View>

        <View
          style={styles.section}
          break
        >
          <SectionHeader
            number="4"
            title="Checklist de execução"
            subtitle="Controle das principais etapas técnicas"
          />

          <View style={styles.checklistSummary}>
            <View>
              <Text style={styles.checklistSummaryTitle}>
                Progresso operacional
              </Text>

              <Text style={styles.checklistSummaryText}>
                {checklistCompleted} de{" "}
                {checklistTotal} etapas concluídas
              </Text>
            </View>

            <Text style={styles.checklistPercent}>
              {checklistPercentage}%
            </Text>
          </View>

          <View style={styles.checklistTable}>
            <View style={styles.checklistTableHeader}>
              <Text style={styles.checklistTableHeaderStep}>
                Etapa técnica
              </Text>

              <Text style={styles.checklistTableHeaderStatus}>
                Situação
              </Text>
            </View>

            {[
              ["ART emitida", serviceOrder.checklistArt],
              [
                "Projeto aprovado",
                serviceOrder.checklistProjectApproved,
              ],
              [
                "Materiais separados",
                serviceOrder.checklistMaterialsSeparated,
              ],
              [
                "Estrutura instalada",
                serviceOrder.checklistStructureInstalled,
              ],
              [
                "Módulos instalados",
                serviceOrder.checklistModulesInstalled,
              ],
              [
                "Inversor instalado",
                serviceOrder.checklistInverterInstalled,
              ],
              [
                "Cabeamento CC",
                serviceOrder.checklistDcCabling,
              ],
              [
                "Cabeamento CA",
                serviceOrder.checklistAcCabling,
              ],
              [
                "Comissionamento",
                serviceOrder.checklistCommissioning,
              ],
              [
                "Treinamento do cliente",
                serviceOrder.checklistCustomerTraining,
              ],
              [
                "Entrega concluída",
                serviceOrder.checklistDelivered,
              ],
            ].map(([label, completed], index) => (
              <ChecklistTableRow
                key={String(label)}
                label={String(label)}
                completed={Boolean(completed)}
                alternate={index % 2 === 1}
              />
            ))}
          </View>
        </View>

        {serviceOrder.photos.length > 0 && (
          <View
            style={styles.section}
            break
          >
            <SectionHeader
              number="5"
              title="Registro fotográfico"
              subtitle="Evidências organizadas por etapa da execução"
            />

            {photoCategories.map(
              (category) => {
                const photos =
                  serviceOrder.photos.filter(
                    (photo) =>
                      photo.category === category
                  );

                return (
                  <View key={category}>
                    <Text style={styles.photoCategory}>
                      {categoryLabel(category)}
                    </Text>

                    <View style={styles.photosGrid}>
                      {photos.map((photo) => (
                        <View
                          key={photo.id}
                          style={styles.photoCard}
                          wrap={false}
                        >
                          <Image
                            src={photo.url}
                            style={styles.photo}
                          />

                          <Text style={styles.photoName}>
                            {photo.name}
                          </Text>

                          {photo.notes && (
                            <Text style={styles.photoNotes}>
                              {photo.notes}
                            </Text>
                          )}

                          <Text style={styles.photoNotes}>
                            Registrada em{" "}
                            {formatDate(
                              photo.createdAt
                            )}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              }
            )}
          </View>
        )}

        {serviceOrder.timeline.length > 0 && (
          <View
            style={styles.section}
            break
          >
            <SectionHeader
              number={
                serviceOrder.photos.length > 0
                  ? "6"
                  : "5"
              }
              title="Histórico da execução"
              subtitle="Eventos e atualizações registrados na timeline"
            />

            {serviceOrder.timeline.map(
              (event, index) => (
                <View
                  key={event.id}
                  style={styles.timelineItem}
                  wrap={false}
                >
                  <View style={styles.timelineMarkerColumn}>
                    <View style={styles.timelineDot} />

                    {index <
                      serviceOrder.timeline.length -
                        1 && (
                      <View style={styles.timelineLine} />
                    )}
                  </View>

                  <View style={styles.timelineContent}>
                    <Text style={styles.timelineTitle}>
                      {event.title}
                    </Text>

                    {event.description && (
                      <Text
                        style={
                          styles.timelineDescription
                        }
                      >
                        {event.description}
                      </Text>
                    )}

                    <Text style={styles.timelineDate}>
                      {formatStatus(event.type)}
                      {"  •  "}
                      {formatDate(event.createdAt)}
                    </Text>
                  </View>
                </View>
              )
            )}
          </View>
        )}

        <View
          style={styles.section}
          break
        >
          <SectionHeader
            number={String(
              5 +
                (serviceOrder.photos.length > 0
                  ? 1
                  : 0) +
                (serviceOrder.timeline.length > 0
                  ? 1
                  : 0)
            )}
            title="Assinaturas"
            subtitle="Validação do cliente e do responsável pela execução"
          />

          <View style={styles.signaturesRow}>
            <View
              style={styles.signatureCard}
              wrap={false}
            >
              {serviceOrder.customerSignature ? (
                <Image
                  src={
                    serviceOrder.customerSignature
                  }
                  style={styles.signatureImage}
                />
              ) : (
                <Text
                  style={
                    styles.signaturePlaceholder
                  }
                >
                  Assinatura não registrada
                </Text>
              )}

              <Text style={styles.signatureLine}>
                {serviceOrder.customerName ||
                  serviceOrder.project.client
                    .name ||
                  "Cliente"}
              </Text>

              <Text style={styles.signatureDocument}>
                {serviceOrder.customerDocument ||
                  serviceOrder.project.client
                    .document ||
                  "CPF / CNPJ não informado"}
              </Text>
            </View>

            <View
              style={styles.signatureCard}
              wrap={false}
            >
              {serviceOrder.technicianSignature ? (
                <Image
                  src={
                    serviceOrder.technicianSignature
                  }
                  style={styles.signatureImage}
                />
              ) : (
                <Text
                  style={
                    styles.signaturePlaceholder
                  }
                >
                  Assinatura não registrada
                </Text>
              )}

              <Text style={styles.signatureLine}>
                {serviceOrder.technicianName ||
                  serviceOrder.responsible ||
                  "Técnico responsável"}
              </Text>

              <Text style={styles.signatureDocument}>
                Responsável pela execução
              </Text>
            </View>
          </View>

          <Text style={styles.signedAt}>
            Data das assinaturas:{" "}
            {formatDate(serviceOrder.signedAt)}
          </Text>

          <View style={styles.validationBox} wrap={false}>
            <Image
              src={serviceOrder.qrCode}
              style={styles.qrCode}
            />

            <View style={styles.validationContent}>
              <Text style={styles.validationTitle}>
                Validação digital da Ordem de Serviço
              </Text>

              <Text style={styles.validationText}>
                Escaneie o QR Code para consultar os dados públicos
                desta OS e confirmar a autenticidade do documento.
              </Text>

              <Text style={styles.validationCode}>
                Código de referência: {serviceOrder.id}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>
            PRD Soluções em Engenharia
          </Text>

          <Text>
            PRD OS • versão 1.0 • Gerado em {generatedAt}
          </Text>

          <Text
            render={({
              pageNumber,
              totalPages,
            }) =>
              `Página ${pageNumber} de ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}