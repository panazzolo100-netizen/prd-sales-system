"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  LoaderCircle,
  Save,
  UserRound,
  Wrench,
} from "lucide-react";

import type {
  ProjectListItem,
  ProjectServiceOrder,
} from "@/types/project";

import { ProjectPhotosTab } from "@/components/projects/tabs/ProjectPhotosTab";

type Props = {
  project: ProjectListItem;

  onProjectChange?: (
    project: ProjectListItem
  ) => void;
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
}[] = [
  {
    key: "checklistArt",
    label: "ART",
  },
  {
    key: "checklistProjectApproved",
    label: "Projeto aprovado",
  },
  {
    key: "checklistMaterialsSeparated",
    label: "Materiais separados",
  },
  {
    key: "checklistStructureInstalled",
    label: "Estrutura instalada",
  },
  {
    key: "checklistModulesInstalled",
    label: "Módulos instalados",
  },
  {
    key: "checklistInverterInstalled",
    label: "Inversor instalado",
  },
  {
    key: "checklistDcCabling",
    label: "Cabeamento CC",
  },
  {
    key: "checklistAcCabling",
    label: "Cabeamento CA",
  },
  {
    key: "checklistCommissioning",
    label: "Comissionamento",
  },
  {
    key: "checklistCustomerTraining",
    label: "Treinamento do cliente",
  },
  {
    key: "checklistDelivered",
    label: "Entrega concluída",
  },
];

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

      <section className="rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-6">
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
        <section className="rounded-3xl border border-white/[0.07] bg-zinc-900/60 p-6">
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

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {checklistDefinitions.map(
              (item) => {
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
              }
            )}
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
          <ProjectPhotosTab
            serviceOrderId={
              currentServiceOrder.id
            }
          />

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