"use client";

import Image from "next/image";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  ClipboardCheck,
  ExternalLink,
  FileText,
  ImageIcon,
  LoaderCircle,
  MapPin,
  Pencil,
  Phone,
  Save,
  UserRound,
  Wrench,
  X,
} from "lucide-react";

import type {
  ProjectListItem,
  ProjectServiceOrder,
  ServiceOrderDashboard,
  ServiceOrderRecentPhoto,
} from "@/types/project";

import { ProjectPhotosTab } from "@/components/projects/tabs/ProjectPhotosTab";

type Props = {
  project: ProjectListItem;

  onProjectChange?: (
    project: ProjectListItem
  ) => void;
  onOpenProjectHistory?: () => void;
};

type ServiceOrderForm = {
  title: string;
  status: string;
  responsible: string;
  team: string;
  scheduledDate: string;
  services: string;
  materials: string;
  notes: string;
};

type ChecklistData = {
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
};

type Message = {
  type: "success" | "error";
  text: string;
} | null;

const statusOptions = [
  {
    value: "ABERTA",
    label: "Aberta",
  },
  {
    value: "AGENDADA",
    label: "Agendada",
  },
  {
    value: "EM_ANDAMENTO",
    label: "Em andamento",
  },
  {
    value: "CONCLUIDA",
    label: "Concluída",
  },
  {
    value: "CANCELADA",
    label: "Cancelada",
  },
];

const checklistDefinitions: {
  key: keyof ChecklistData;
  label: string;
  group: "Documentação" | "Preparação" | "Instalação" | "Finalização";
}[] = [
  {
    key: "checklistArt",
    label: "ART",
    group: "Documentação",
  },
  {
    key: "checklistProjectApproved",
    label: "Projeto aprovado",
    group: "Documentação",
  },
  {
    key: "checklistMaterialsSeparated",
    label: "Materiais separados",
    group: "Preparação",
  },
  {
    key: "checklistStructureInstalled",
    label: "Estrutura instalada",
    group: "Instalação",
  },
  {
    key: "checklistModulesInstalled",
    label: "Módulos instalados",
    group: "Instalação",
  },
  {
    key: "checklistInverterInstalled",
    label: "Inversor instalado",
    group: "Instalação",
  },
  {
    key: "checklistDcCabling",
    label: "Cabeamento CC",
    group: "Instalação",
  },
  {
    key: "checklistAcCabling",
    label: "Cabeamento CA",
    group: "Instalação",
  },
  {
    key: "checklistCommissioning",
    label: "Comissionamento",
    group: "Finalização",
  },
  {
    key: "checklistCustomerTraining",
    label: "Treinamento do cliente",
    group: "Finalização",
  },
  {
    key: "checklistDelivered",
    label: "Entrega concluída",
    group: "Finalização",
  },
];

const CHECKLIST_GROUPS = [
  "Documentação",
  "Preparação",
  "Instalação",
  "Finalização",
] as const;

function formatDateInput(
  value: Date | string | null
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function nullableText(value: string) {
  const text = value.trim();

  return text.length > 0
    ? text
    : null;
}

function createForm(
  project: ProjectListItem,
  serviceOrder: ProjectServiceOrder | null
): ServiceOrderForm {
  return {
    title:
      serviceOrder?.title ??
      `Execução - ${project.title}`,

    status:
      serviceOrder?.status ??
      "ABERTA",

    responsible:
      serviceOrder?.responsible ?? "",

    team:
      serviceOrder?.team ?? "",

    scheduledDate:
      formatDateInput(
        serviceOrder?.scheduledDate ??
          null
      ),

    services:
      serviceOrder?.services ?? "",

    materials:
      serviceOrder?.materials ?? "",

    notes:
      serviceOrder?.notes ?? "",
  };
}

function createChecklist(
  serviceOrder: ProjectServiceOrder | null
): ChecklistData {
  return {
    checklistArt:
      serviceOrder?.checklistArt ??
      false,

    checklistProjectApproved:
      serviceOrder
        ?.checklistProjectApproved ??
      false,

    checklistMaterialsSeparated:
      serviceOrder
        ?.checklistMaterialsSeparated ??
      false,

    checklistStructureInstalled:
      serviceOrder
        ?.checklistStructureInstalled ??
      false,

    checklistModulesInstalled:
      serviceOrder
        ?.checklistModulesInstalled ??
      false,

    checklistInverterInstalled:
      serviceOrder
        ?.checklistInverterInstalled ??
      false,

    checklistDcCabling:
      serviceOrder
        ?.checklistDcCabling ??
      false,

    checklistAcCabling:
      serviceOrder
        ?.checklistAcCabling ??
      false,

    checklistCommissioning:
      serviceOrder
        ?.checklistCommissioning ??
      false,

    checklistCustomerTraining:
      serviceOrder
        ?.checklistCustomerTraining ??
      false,

    checklistDelivered:
      serviceOrder
        ?.checklistDelivered ??
      false,
  };
}

function getStatusLabel(status: string) {
  return (
    statusOptions.find(
      (option) =>
        option.value === status
    )?.label ?? status
  );
}

function completeServiceOrderData(
  serviceOrder:
    | ProjectServiceOrder
    | null,
  savedData: Partial<ProjectServiceOrder>
): ProjectServiceOrder {
  const now =
    new Date().toISOString();

  return {
    id: savedData.id ?? serviceOrder?.id ?? "",

    number:
      savedData.number ??
      serviceOrder?.number ??
      "",

    title:
      savedData.title ??
      serviceOrder?.title ??
      "",

    status:
      savedData.status ??
      serviceOrder?.status ??
      "ABERTA",

    responsible:
      savedData.responsible ??
      serviceOrder?.responsible ??
      null,

    team:
      savedData.team ??
      serviceOrder?.team ??
      null,

    scheduledDate:
      savedData.scheduledDate ??
      serviceOrder?.scheduledDate ??
      null,

    startedDate:
      savedData.startedDate ??
      serviceOrder?.startedDate ??
      null,

    completedDate:
      savedData.completedDate ??
      serviceOrder?.completedDate ??
      null,

    services:
      savedData.services ??
      serviceOrder?.services ??
      null,

    materials:
      savedData.materials ??
      serviceOrder?.materials ??
      null,

    notes:
      savedData.notes ??
      serviceOrder?.notes ??
      null,

    checklistArt:
      savedData.checklistArt ??
      serviceOrder?.checklistArt ??
      false,

    checklistProjectApproved:
      savedData
        .checklistProjectApproved ??
      serviceOrder
        ?.checklistProjectApproved ??
      false,

    checklistMaterialsSeparated:
      savedData
        .checklistMaterialsSeparated ??
      serviceOrder
        ?.checklistMaterialsSeparated ??
      false,

    checklistStructureInstalled:
      savedData
        .checklistStructureInstalled ??
      serviceOrder
        ?.checklistStructureInstalled ??
      false,

    checklistModulesInstalled:
      savedData
        .checklistModulesInstalled ??
      serviceOrder
        ?.checklistModulesInstalled ??
      false,

    checklistInverterInstalled:
      savedData
        .checklistInverterInstalled ??
      serviceOrder
        ?.checklistInverterInstalled ??
      false,

    checklistDcCabling:
      savedData.checklistDcCabling ??
      serviceOrder?.checklistDcCabling ??
      false,

    checklistAcCabling:
      savedData.checklistAcCabling ??
      serviceOrder?.checklistAcCabling ??
      false,

    checklistCommissioning:
      savedData
        .checklistCommissioning ??
      serviceOrder
        ?.checklistCommissioning ??
      false,

    checklistCustomerTraining:
      savedData
        .checklistCustomerTraining ??
      serviceOrder
        ?.checklistCustomerTraining ??
      false,

    checklistDelivered:
      savedData.checklistDelivered ??
      serviceOrder?.checklistDelivered ??
      false,

    customerName:
      savedData.customerName ??
      serviceOrder?.customerName ??
      null,

    customerDocument:
      savedData.customerDocument ??
      serviceOrder?.customerDocument ??
      null,

    customerSignature:
      savedData.customerSignature ??
      serviceOrder?.customerSignature ??
      null,

    technicianName:
      savedData.technicianName ??
      serviceOrder?.technicianName ??
      null,

    technicianSignature:
      savedData.technicianSignature ??
      serviceOrder
        ?.technicianSignature ??
      null,

    signedAt:
      savedData.signedAt ??
      serviceOrder?.signedAt ??
      null,

    createdAt:
      savedData.createdAt ??
      serviceOrder?.createdAt ??
      now,

    updatedAt:
      savedData.updatedAt ?? now,

    companyId:
      savedData.companyId ??
      serviceOrder?.companyId ??
      "",

    projectId:
      savedData.projectId ??
      serviceOrder?.projectId ??
      "",
  };
}

export function ProjectServiceOrderTab({
  project,
  onProjectChange,
  onOpenProjectHistory,
}: Props) {
  const [
    currentServiceOrder,
    setCurrentServiceOrder,
  ] =
    useState<ProjectServiceOrder | null>(
      project.serviceOrder
    );

  const [form, setForm] =
    useState<ServiceOrderForm>(
      createForm(
        project,
        project.serviceOrder
      )
    );

  const [checklist, setChecklist] =
    useState<ChecklistData>(
      createChecklist(
        project.serviceOrder
      )
    );

  const [saving, setSaving] =
    useState(false);

  const [
    savingChecklist,
    setSavingChecklist,
  ] = useState(false);

  const [message, setMessage] =
    useState<Message>(null);

  const [dashboard, setDashboard] =
    useState<ServiceOrderDashboard | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [previewPhoto, setPreviewPhoto] =
    useState<ServiceOrderRecentPhoto | null>(null);

  useEffect(() => {
    setCurrentServiceOrder(
      project.serviceOrder
    );

    setForm(
      createForm(
        project,
        project.serviceOrder
      )
    );

    setChecklist(
      createChecklist(
        project.serviceOrder
      )
    );

    setMessage(null);
  }, [project]);

  const currentServiceOrderId = currentServiceOrder?.id;

  useEffect(() => {
    if (!currentServiceOrderId) {
      setDashboard(null);
      return;
    }

    const controller = new AbortController();
    const serviceOrderId = currentServiceOrderId;

    async function loadDashboard() {
      setDashboardLoading(true);
      setDashboardError(null);

      try {
        const response = await fetch(
          `/api/os/dashboard?id=${encodeURIComponent(serviceOrderId)}`,
          { signal: controller.signal }
        );
        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error ?? "Erro ao carregar painel.");
        }

        setDashboard(responseData as ServiceOrderDashboard);
      } catch (error) {
        if (!controller.signal.aborted) {
          setDashboardError(
            error instanceof Error
              ? error.message
              : "Não foi possível carregar o painel."
          );
        }
      } finally {
        if (!controller.signal.aborted) setDashboardLoading(false);
      }
    }

    void loadDashboard();
    return () => controller.abort();
  }, [currentServiceOrderId, dashboardRefreshKey]);

  const checklistProgress =
    useMemo(() => {
      const completed =
        checklistDefinitions.filter(
          (item) =>
            checklist[item.key]
        ).length;

      return Math.round(
        (completed /
          checklistDefinitions.length) *
          100
      );
    }, [checklist]);

  const checklistCompleted = useMemo(
    () => checklistDefinitions.filter((item) => checklist[item.key]).length,
    [checklist]
  );
  const checklistTotal = checklistDefinitions.length;
  const checklistPending = checklistTotal - checklistCompleted;
  const deadline = getDeadlineStatus(
    currentServiceOrder?.scheduledDate ?? null,
    currentServiceOrder?.status ?? "ABERTA"
  );

  function updateProjectWithServiceOrder(
  serviceOrder: ProjectServiceOrder
) {
  const items = [
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

  const completed = items.filter(Boolean).length;
  const total = items.length;

  const updatedProject: ProjectListItem = {
    ...project,

    serviceOrder,

    checklistProgress: {
      total,
      completed,
      percentage: Math.round(
        (completed / total) * 100
      ),
    },

    status:
      serviceOrder.status ===
      "CONCLUIDA"
        ? "CONCLUIDO"
        : project.status,

    updatedAt:
      new Date().toISOString(),
  };

  setCurrentServiceOrder(
    serviceOrder
  );

  onProjectChange?.(
    updatedProject
  );

  return updatedProject;
}

  async function saveServiceOrder() {
    if (saving) {
      return;
    }

    const title = form.title.trim();

    if (!title) {
      setMessage({
        type: "error",
        text:
          "O título da Ordem de Serviço é obrigatório.",
      });

      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const isCreating =
        currentServiceOrder === null;

      const response = await fetch(
        "/api/os",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            isCreating
              ? {
                  action: "CREATE",
                  projectId: project.id,
                  title,
                  responsible:
                    nullableText(
                      form.responsible
                    ),
                  scheduledDate:
                    form.scheduledDate ||
                    null,
                  services:
                    nullableText(
                      form.services
                    ),
                }
              : {
                  action: "UPDATE",
                  id:
                    currentServiceOrder.id,
                  status: form.status,
                  responsible:
                    nullableText(
                      form.responsible
                    ),
                  team:
                    nullableText(
                      form.team
                    ),
                  scheduledDate:
                    form.scheduledDate ||
                    null,
                  services:
                    nullableText(
                      form.services
                    ),
                  materials:
                    nullableText(
                      form.materials
                    ),
                  notes:
                    nullableText(
                      form.notes
                    ),
                }
          ),
        }
      );

      const responseData =
        await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error ??
            "Erro ao salvar Ordem de Serviço."
        );
      }

      const savedServiceOrder =
        completeServiceOrderData(
          currentServiceOrder,
          responseData
        );

      const updatedProject =
        updateProjectWithServiceOrder(
          savedServiceOrder
        );

      setForm(
        createForm(
          updatedProject,
          savedServiceOrder
        )
      );

      setChecklist(
        createChecklist(
          savedServiceOrder
        )
      );

      setMessage({
        type: "success",
        text: isCreating
          ? "Ordem de Serviço criada com sucesso."
          : "Ordem de Serviço atualizada com sucesso.",
      });
      setDashboardRefreshKey((current) => current + 1);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar a Ordem de Serviço.",
      });
    } finally {
      setSaving(false);
    }
  }

  async function saveChecklist() {
    if (
      !currentServiceOrder ||
      savingChecklist
    ) {
      return;
    }

    setSavingChecklist(true);
    setMessage(null);

    try {
      const response = await fetch(
        "/api/os/checklist",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id:
              currentServiceOrder.id,
            ...checklist,
          }),
        }
      );

      const responseData =
        await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error ??
            "Erro ao salvar checklist."
        );
      }

      const updatedServiceOrder =
        completeServiceOrderData(
          currentServiceOrder,
          responseData
        );

      updateProjectWithServiceOrder(
        updatedServiceOrder
      );

      setChecklist(
        createChecklist(
          updatedServiceOrder
        )
      );

      setForm((current) => ({
        ...current,
        status:
          updatedServiceOrder.status,
      }));

      setMessage({
        type: "success",
        text:
          "Checklist atualizado com sucesso.",
      });
      setDashboardRefreshKey((current) => current + 1);
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar o checklist.",
      });
    } finally {
      setSavingChecklist(false);
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div
          className={`rounded-2xl border p-4 text-sm font-semibold ${
            message.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/20 bg-red-500/10 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {currentServiceOrder ? (
        <ServiceOrderOperationalDashboard
          project={project}
          serviceOrder={currentServiceOrder}
          checklistProgress={checklistProgress}
          checklistCompleted={checklistCompleted}
          checklistTotal={checklistTotal}
          checklistPending={checklistPending}
          deadline={deadline}
          dashboard={dashboard}
          loading={dashboardLoading}
          error={dashboardError}
          onRetry={() => setDashboardRefreshKey((current) => current + 1)}
          onOpenPhoto={setPreviewPhoto}
          onOpenProjectHistory={onOpenProjectHistory}
        />
      ) : (
        <NoServiceOrderState
          projectTitle={project.title}
          onCreate={() =>
            document
              .getElementById("os-data-section")
              ?.scrollIntoView({ behavior: "smooth", block: "start" })
          }
        />
      )}

      <section
        id="os-data-section"
        className="scroll-mt-36 rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
              {currentServiceOrder
                ? currentServiceOrder.number
                : "Nova Ordem de Serviço"}
            </p>

            <h2 className="mt-2 text-2xl font-black text-white">
              {currentServiceOrder
                ? "Editar Ordem de Serviço"
                : "Criar Ordem de Serviço"}
            </h2>

            <p className="mt-2 text-sm text-zinc-500">
              Projeto: {project.title}
            </p>
          </div>

          {currentServiceOrder && (
            <span className="rounded-full border border-orange-500/20 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
              {getStatusLabel(
                currentServiceOrder.status
              )}
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <FormField
            id="os-title"
            label="Título"
            value={form.title}
            required
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                title: value,
              }))
            }
          />

          {currentServiceOrder && (
            <div>
              <label
                htmlFor="os-status"
                className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
              >
                Status
              </label>

              <select
                id="os-status"
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status:
                      event.target.value,
                  }))
                }
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
              >
                {statusOptions.map(
                  (option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  )
                )}
              </select>
            </div>
          )}

          <FormField
            id="os-responsible"
            label="Responsável"
            value={form.responsible}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                responsible: value,
              }))
            }
          />

          {currentServiceOrder && (
            <FormField
              id="os-team"
              label="Equipe"
              value={form.team}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  team: value,
                }))
              }
            />
          )}

          <div>
            <label
              htmlFor="os-scheduled-date"
              className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
            >
              Data agendada
            </label>

            <div className="relative">
              <CalendarDays
                size={17}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />

              <input
                id="os-scheduled-date"
                type="date"
                value={
                  form.scheduledDate
                }
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    scheduledDate:
                      event.target.value,
                  }))
                }
                className="h-12 w-full rounded-xl border border-white/[0.08] bg-zinc-950 pl-11 pr-4 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
              />
            </div>
          </div>
        </div>

        <TextAreaField
          id="os-services"
          label="Serviços"
          value={form.services}
          placeholder="Descreva os serviços previstos na execução."
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              services: value,
            }))
          }
        />

        {currentServiceOrder && (
          <>
            <TextAreaField
              id="os-materials"
              label="Materiais"
              value={form.materials}
              placeholder="Informe os materiais utilizados ou previstos."
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  materials: value,
                }))
              }
            />

            <TextAreaField
              id="os-notes"
              label="Observações"
              value={form.notes}
              placeholder="Informações complementares da execução."
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  notes: value,
                }))
              }
            />
          </>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={saveServiceOrder}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            ) : (
              <Save size={17} />
            )}

            {saving
              ? "Salvando..."
              : currentServiceOrder
                ? "Salvar Ordem de Serviço"
                : "Criar Ordem de Serviço"}
          </button>
        </div>
      </section>

      {currentServiceOrder && (
        <section
          id="os-checklist-section"
          className="scroll-mt-36 rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-6"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">
                Checklist
              </p>

              <h2 className="mt-2 text-xl font-black text-white">
                Progresso da execução
              </h2>
            </div>

            <span className="text-2xl font-black text-orange-400">
              {checklistProgress}%
            </span>
          </div>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-950">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-500"
              style={{
                width: `${checklistProgress}%`,
              }}
            />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {CHECKLIST_GROUPS.map((group) => (
              <div
                key={group}
                className="rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-4"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  {group}
                </p>
                <div className="space-y-2">
                  {checklistDefinitions
                    .filter((item) => item.group === group)
                    .map((item) => {
                const checked =
                  checklist[item.key];

                return (
                  <button
                    key={item.key}
                    type="button"
                    disabled={
                      savingChecklist
                    }
                    onClick={() =>
                      setChecklist(
                        (current) => ({
                          ...current,
                          [item.key]:
                            !current[
                              item.key
                            ],
                        })
                      )
                    }
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                      checked
                        ? "border-emerald-500/20 bg-emerald-500/[0.06]"
                        : "border-white/[0.06] bg-zinc-950 hover:border-orange-500/25"
                    }`}
                  >
                    {checked ? (
                      <CheckCircle2
                        size={17}
                        className="text-emerald-400"
                      />
                    ) : (
                      <ClipboardCheck
                        size={17}
                        className="text-zinc-600"
                      />
                    )}

                    <span
                      className={`text-sm ${
                        checked
                          ? "font-semibold text-emerald-300"
                          : "text-zinc-500"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
                    })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={saveChecklist}
              disabled={savingChecklist}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {savingChecklist ? (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <Save size={17} />
              )}

              {savingChecklist
                ? "Salvando..."
                : "Salvar checklist"}
            </button>
          </div>
        </section>
      )}

      {currentServiceOrder && (
        <>
          <div id="os-photos-section" className="scroll-mt-36">
            <ProjectPhotosTab
              serviceOrderId={currentServiceOrder.id}
              onPhotosChange={() =>
                setDashboardRefreshKey((current) => current + 1)
              }
            />
          </div>

          <section className="grid gap-4 sm:grid-cols-2">
            <InfoCard
              icon={Wrench}
              label="Número"
              value={
                currentServiceOrder.number
              }
            />

            <InfoCard
              icon={UserRound}
              label="Responsável"
              value={
                currentServiceOrder
                  .responsible ??
                "Não informado"
              }
            />

            <InfoCard
              icon={UserRound}
              label="Equipe"
              value={
                currentServiceOrder.team ??
                "Não informada"
              }
            />

            <InfoCard
              icon={CalendarDays}
              label="Agendamento"
              value={
                form.scheduledDate ||
                "Não informado"
              }
            />
          </section>
        </>
      )}

      {previewPhoto && (
        <RecentPhotoPreview
          photo={previewPhoto}
          onClose={() => setPreviewPhoto(null)}
        />
      )}
    </div>
  );
}

type OperationalDashboardProps = {
  project: ProjectListItem;
  serviceOrder: ProjectServiceOrder;
  checklistProgress: number;
  checklistCompleted: number;
  checklistTotal: number;
  checklistPending: number;
  deadline: ReturnType<typeof getDeadlineStatus>;
  dashboard: ServiceOrderDashboard | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpenPhoto: (photo: ServiceOrderRecentPhoto) => void;
  onOpenProjectHistory?: () => void;
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

function ServiceOrderOperationalDashboard({
  project,
  serviceOrder,
  checklistProgress,
  checklistCompleted,
  checklistTotal,
  checklistPending,
  deadline,
  dashboard,
  loading,
  error,
  onRetry,
  onOpenPhoto,
  onOpenProjectHistory,
}: OperationalDashboardProps) {
  const statusClassName =
    serviceOrder.status === "CONCLUIDA"
      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
      : serviceOrder.status === "CANCELADA"
        ? "border-red-500/20 bg-red-500/10 text-red-400"
        : "border-orange-500/20 bg-orange-500/10 text-orange-400";

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-3xl border border-white/[0.07] bg-gradient-to-br from-zinc-900 via-zinc-900 to-orange-500/[0.06]">
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                Painel operacional · {serviceOrder.number}
              </p>
              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                {serviceOrder.title}
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                {project.client.name} · {project.title}
              </p>
            </div>
            <span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${statusClassName}`}>
              {getStatusLabel(serviceOrder.status)}
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <OperationalInfo icon={UserRound} label="Responsável" value={serviceOrder.responsible ?? "Não informado"} />
            <OperationalInfo icon={CalendarDays} label="Data prevista" value={formatDisplayDate(serviceOrder.scheduledDate)} />
            <OperationalInfo icon={MapPin} label="Endereço da execução" value={project.client.address ?? "Não informado"} />
            <OperationalInfo icon={Phone} label="Telefone do cliente" value={project.client.phone ?? "Não informado"} />
          </div>
        </div>

        <div className="border-t border-white/[0.07] bg-zinc-950/40 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <QuickAction icon={ClipboardCheck} label="Atualizar checklist" onClick={() => scrollToSection("os-checklist-section")} />
            <QuickAction icon={Camera} label="Adicionar foto" onClick={() => scrollToSection("os-photos-section")} />
            <a
              href={`/api/os/${serviceOrder.id}/pdf`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-900 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 transition hover:border-orange-500/30 hover:text-orange-400"
            >
              <FileText size={15} />
              Gerar PDF
              <ExternalLink size={13} />
            </a>
            <QuickAction icon={Pencil} label="Editar dados" onClick={() => scrollToSection("os-data-section")} />
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <OperationalMetric icon={ClipboardCheck} label="Progresso" value={`${checklistProgress}%`} detail={`${checklistCompleted}/${checklistTotal} etapas`} highlight />
        <OperationalMetric icon={CheckCircle2} label="Concluídos" value={String(checklistCompleted)} detail="Itens finalizados" />
        <OperationalMetric icon={Clock3} label="Pendentes" value={String(checklistPending)} detail="Itens restantes" />
        <OperationalMetric icon={CalendarDays} label="Prazo" value={deadline.label} detail={deadline.detail} valueClassName={deadline.className} />
        <OperationalMetric icon={ImageIcon} label="Fotos" value={loading ? "..." : String(dashboard?.photoCount ?? 0)} detail="Evidências da OS" />
        <OperationalMetric icon={FileText} label="Documentos" value={String(project.documents.length)} detail="Vinculados ao projeto" />
      </section>

      <section className="rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Checklist real</p>
            <h3 className="mt-2 text-xl font-black text-white">Progresso da execução</h3>
          </div>
          <span className="text-3xl font-black text-orange-400">{checklistProgress}%</span>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-950">
          <div className="h-full rounded-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-500" style={{ width: `${checklistProgress}%` }} />
        </div>
        <p className="mt-3 text-sm text-zinc-500">
          {checklistCompleted} de {checklistTotal} itens concluídos.
        </p>
      </section>

      {error && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.06] p-4 text-sm text-red-300">
          <span>{error}</span>
          <button type="button" onClick={onRetry} className="font-bold hover:text-white">Tentar novamente</button>
        </div>
      )}

      <section className="grid gap-5 xl:grid-cols-2">
        <RecentActivities
          events={dashboard?.recentEvents ?? []}
          loading={loading}
          onOpenProjectHistory={onOpenProjectHistory}
        />
        <RecentPhotos
          photos={dashboard?.recentPhotos ?? []}
          loading={loading}
          onOpenPhoto={onOpenPhoto}
        />
      </section>
    </div>
  );
}

function OperationalInfo({ icon: Icon, label, value }: { icon: typeof Wrench; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-zinc-950/60 p-4">
      <Icon size={16} className="text-orange-400" />
      <p className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-zinc-600">{label}</p>
      <p className="mt-1 line-clamp-2 text-sm font-semibold text-zinc-200">{value}</p>
    </div>
  );
}

function OperationalMetric({ icon: Icon, label, value, detail, highlight = false, valueClassName }: { icon: typeof Wrench; label: string; value: string; detail: string; highlight?: boolean; valueClassName?: string }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-orange-500/20 bg-orange-500/[0.06]" : "border-white/[0.07] bg-zinc-900/60"}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-600">{label}</p>
        <Icon size={16} className={highlight ? "text-orange-400" : "text-zinc-600"} />
      </div>
      <p className={`mt-3 truncate text-xl font-black ${valueClassName ?? (highlight ? "text-orange-400" : "text-white")}`}>{value}</p>
      <p className="mt-1 truncate text-xs text-zinc-600">{detail}</p>
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: typeof Wrench; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-zinc-900 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 transition hover:border-orange-500/30 hover:text-orange-400">
      <Icon size={15} />
      {label}
    </button>
  );
}

function RecentActivities({ events, loading, onOpenProjectHistory }: { events: ServiceOrderDashboard["recentEvents"]; loading: boolean; onOpenProjectHistory?: () => void }) {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Atividades</p>
          <h3 className="mt-2 text-lg font-black text-white">Eventos recentes</h3>
        </div>
        {onOpenProjectHistory && (
          <button type="button" onClick={onOpenProjectHistory} className="text-xs font-semibold text-zinc-500 transition hover:text-orange-400">Ver histórico completo</button>
        )}
      </div>
      <div className="mt-5 space-y-3">
        {loading ? (
          <LoaderCircle className="mx-auto my-10 animate-spin text-orange-400" />
        ) : events.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-white/[0.08] p-8 text-center text-sm text-zinc-600">Nenhuma atividade registrada.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} className="flex gap-3 rounded-xl border border-white/[0.05] bg-zinc-950/60 p-3">
              <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-orange-500" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white">{event.title}</p>
                {event.description && <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{event.description}</p>}
                <p className="mt-2 text-[11px] text-zinc-700">{formatDisplayDate(event.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RecentPhotos({ photos, loading, onOpenPhoto }: { photos: ServiceOrderDashboard["recentPhotos"]; loading: boolean; onOpenPhoto: (photo: ServiceOrderRecentPhoto) => void }) {
  return (
    <div className="rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Evidências</p>
      <h3 className="mt-2 text-lg font-black text-white">Fotos recentes</h3>
      {loading ? (
        <LoaderCircle className="mx-auto my-14 animate-spin text-orange-400" />
      ) : photos.length === 0 ? (
        <p className="mt-5 rounded-2xl border border-dashed border-white/[0.08] p-8 text-center text-sm text-zinc-600">Nenhuma foto registrada.</p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {photos.map((photo) => (
            <button key={photo.id} type="button" onClick={() => onOpenPhoto(photo)} className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-zinc-950 text-left transition hover:border-orange-500/30">
              <div className="relative aspect-video overflow-hidden">
                <Image src={`/api/os/photos?photoId=${encodeURIComponent(photo.id)}`} alt={photo.name} fill unoptimized className="object-cover transition duration-300 group-hover:scale-105" />
              </div>
              <div className="p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-orange-400">{photo.category}</p>
                <p className="mt-1 truncate text-xs text-zinc-600">{formatDisplayDate(photo.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NoServiceOrderState({ projectTitle, onCreate }: { projectTitle: string; onCreate: () => void }) {
  return (
    <section className="rounded-3xl border border-dashed border-orange-500/20 bg-gradient-to-br from-zinc-900 to-orange-500/[0.05] p-10 text-center sm:p-14">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400"><Wrench size={28} /></div>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-orange-500">Execução operacional</p>
      <h2 className="mt-2 text-2xl font-black text-white">Nenhuma Ordem de Serviço criada</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-zinc-500">Crie a OS de {projectTitle} para controlar checklist, equipe, fotos, prazo e documentação da execução.</p>
      <button type="button" onClick={onCreate} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-400"><Wrench size={17} />Criar Ordem de Serviço</button>
    </section>
  );
}

function RecentPhotoPreview({ photo, onClose }: { photo: ServiceOrderRecentPhoto; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/[0.1] bg-zinc-950">
        <div className="flex items-center justify-between border-b border-white/[0.07] p-4">
          <div><p className="font-bold text-white">{photo.name}</p><p className="mt-1 text-xs text-zinc-600">{photo.category} · {formatDisplayDate(photo.createdAt)}</p></div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-red-500/10 hover:text-red-400" aria-label="Fechar foto"><X size={19} /></button>
        </div>
        <div className="flex max-h-[78vh] items-center justify-center bg-black p-4">
          <Image src={`/api/os/photos?photoId=${encodeURIComponent(photo.id)}`} alt={photo.name} width={1600} height={1000} unoptimized className="max-h-[72vh] w-auto max-w-full rounded-xl object-contain" />
        </div>
      </div>
    </div>
  );
}

type FormFieldProps = {
  id: string;
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
};

function FormField({
  id,
  label,
  value,
  required = false,
  onChange,
}: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
      >
        {label}

        {required && (
          <span className="ml-1 text-orange-400">
            *
          </span>
        )}
      </label>

      <input
        id={id}
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-12 w-full rounded-xl border border-white/[0.08] bg-zinc-950 px-4 text-sm text-white outline-none transition focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
      />
    </div>
  );
}

type TextAreaFieldProps = {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
};

function TextAreaField({
  id,
  label,
  value,
  placeholder,
  onChange,
}: TextAreaFieldProps) {
  return (
    <div className="mt-5">
      <label
        htmlFor={id}
        className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500"
      >
        {label}
      </label>

      <textarea
        id={id}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={5}
        className="w-full resize-y rounded-xl border border-white/[0.08] bg-zinc-950 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-zinc-600 focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5"
      />
    </div>
  );
}

type InfoCardProps = {
  icon: typeof Wrench;
  label: string;
  value: string;
};

function InfoCard({
  icon: Icon,
  label,
  value,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-zinc-900/60 p-5">
      <Icon
        size={19}
        className="text-zinc-500"
      />

      <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {label}
      </p>

      <p className="mt-2 font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function formatDisplayDate(value: Date | string | null) {
  if (!value) return "Não informada";
  return new Intl.DateTimeFormat("pt-BR").format(new Date(value));
}

function getDeadlineStatus(
  scheduledDate: Date | string | null,
  status: string
) {
  if (status === "CONCLUIDA") {
    return { label: "Concluída", detail: "Execução finalizada", className: "text-emerald-400" };
  }

  if (!scheduledDate) {
    return { label: "Sem data definida", detail: "Agendamento pendente", className: "text-zinc-400" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const scheduled = new Date(scheduledDate);
  scheduled.setHours(0, 0, 0, 0);
  const days = Math.round(
    (scheduled.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (days < 0) {
    return { label: "Atrasada", detail: `${Math.abs(days)} dia(s) de atraso`, className: "text-red-400" };
  }

  if (days === 0) {
    return { label: "Vence hoje", detail: "Execução prevista para hoje", className: "text-amber-400" };
  }

  return { label: "No prazo", detail: `${days} dia(s) restante(s)`, className: "text-sky-400" };
}
