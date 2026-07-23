export const OPPORTUNITY_SERVICE_TYPES = [
  "USINA_SOLAR", "PROJETO_SOLAR", "PROJETO_ELETRICO", "SPDA", "ATERRAMENTO",
  "SUBESTACAO", "ENTRADA_ENERGIA", "PADRAO_MEDICAO", "LAUDO_TECNICO",
  "INSPECAO_ELETRICA", "NR10", "EFICIENCIA_ENERGETICA", "FATOR_POTENCIA",
  "INSTALACAO_ELETRICA", "MANUTENCAO_ELETRICA", "CONSULTORIA", "OUTRO",
] as const;

export type OpportunityServiceType = typeof OPPORTUNITY_SERVICE_TYPES[number];
export type ServiceFieldType = "text" | "number" | "textarea" | "boolean" | "select";
export type ServiceField = { key: string; label: string; type?: ServiceFieldType; options?: string[]; unit?: string };

const f = (key: string, label: string, type: ServiceFieldType = "text", options?: string[], unit?: string): ServiceField => ({ key, label, type, options, unit });

const solar = [f("distributor","Distribuidora"),f("consumerUnit","Unidade consumidora"),f("monthlyConsumption","Consumo mensal","number",undefined,"kWh"),f("demand","Demanda","number",undefined,"kW"),f("tariff","Tarifa","number"),f("installationType","Tipo de instalação"),f("voltage","Tensão"),f("targetSaving","Economia pretendida","number"),f("availableArea","Área disponível","number",undefined,"m²"),f("technicalNotes","Observações técnicas solares","textarea")];
const solarEngineering = [
  f("installedPower", "Potência instalada", "number", undefined, "kWp"),
  f("modules", "Quantidade de módulos", "number"),
  f("modulePower", "Potência do módulo", "number", undefined, "W"),
  f("moduleBrand", "Marca dos módulos"),
  f("inverter", "Inversor"),
  f("systemType", "Tipo de sistema"),
  ...solar,
  f("phase", "Fase"),
  f("roofType", "Tipo de telhado"),
  f("roofArea", "Área do telhado", "number", undefined, "m²"),
];
const deadline = f("deadline","Prazo desejado");
const art = f("needsArt","Necessidade de ART","boolean");

export const serviceTypeConfig: Record<OpportunityServiceType, { label: string; category: string; solar: boolean; fields: ServiceField[]; engineeringFields: ServiceField[] }> = {
  USINA_SOLAR:{label:"Usina solar",category:"Solar",solar:true,fields:solar,engineeringFields:solarEngineering},
  PROJETO_SOLAR:{label:"Projeto solar",category:"Solar",solar:true,fields:solar,engineeringFields:solarEngineering},
  PROJETO_ELETRICO:{label:"Projeto elétrico",category:"Projetos",solar:false,fields:[f("buildingType","Tipo de edificação"),f("area","Área aproximada","number",undefined,"m²"),f("voltage","Tensão"),f("installedLoad","Carga instalada","number"),f("estimatedDemand","Demanda estimada","number"),f("purpose","Finalidade"),f("utility","Concessionária"),deadline,art,f("technicalNotes","Observações técnicas","textarea")],engineeringFields:[f("buildingType","Edificação"),f("area","Área"),f("voltage","Tensão"),f("installedLoad","Carga"),f("estimatedDemand","Demanda"),f("panels","Quadros"),f("circuits","Circuitos"),f("diagrams","Diagramas"),f("memorial","Memorial"),art,f("technicalNotes","Observações","textarea")]},
  SPDA:{label:"SPDA",category:"Proteção",solar:false,fields:[f("buildingType","Tipo de edificação"),f("height","Altura","number",undefined,"m"),f("area","Área","number",undefined,"m²"),f("existingSystem","Existe SPDA","boolean"),f("needType","Tipo de necessidade","select",["Inspeção","Projeto","Adequação","Execução","Laudo"]),f("riskAnalysis","Análise de risco","boolean"),f("needsMeasurement","Necessidade de medição","boolean"),art,deadline,f("technicalNotes","Observações","textarea")],engineeringFields:[f("buildingType","Edificação"),f("height","Altura"),f("area","Área"),f("existingSystem","Sistema existente"),f("riskAnalysis","Análise de risco"),f("capture","Captação"),f("downConductors","Descidas"),f("grounding","Aterramento"),f("measurements","Medições"),f("adjustments","Adequações"),art,f("technicalNotes","Observações","textarea")]},
  ATERRAMENTO:{label:"Aterramento",category:"Proteção",solar:false,fields:[f("installationType","Tipo de instalação"),f("purpose","Finalidade"),f("pointCount","Quantidade de pontos","number"),f("existingMeasurement","Medição existente"),f("needsProject","Necessidade de projeto","boolean"),f("needsReport","Necessidade de laudo","boolean"),art,deadline,f("technicalNotes","Observações","textarea")],engineeringFields:[]},
  SUBESTACAO:{label:"Subestação",category:"Infraestrutura",solar:false,fields:[f("powerKva","Potência desejada","number",undefined,"kVA"),f("primaryVoltage","Tensão primária"),f("secondaryVoltage","Tensão secundária"),f("currentDemand","Demanda atual","number"),f("futureDemand","Demanda futura","number"),f("substationType","Tipo de subestação"),f("utility","Concessionária"),f("needType","Necessidade","select",["Projeto","Aprovação","Execução","Manutenção","Ampliação"]),deadline,f("technicalNotes","Observações","textarea")],engineeringFields:[f("powerKva","Potência"),f("primaryVoltage","Tensão primária"),f("secondaryVoltage","Tensão secundária"),f("currentDemand","Demanda"),f("utility","Concessionária"),f("substationType","Tipo"),f("transformer","Transformador"),f("protection","Proteção"),f("measurement","Medição"),f("approval","Aprovação"),f("execution","Execução"),f("tests","Testes"),f("technicalNotes","Observações","textarea")]},
  ENTRADA_ENERGIA:{label:"Entrada de energia",category:"Infraestrutura",solar:false,fields:[],engineeringFields:[]},
  PADRAO_MEDICAO:{label:"Padrão de medição",category:"Infraestrutura",solar:false,fields:[],engineeringFields:[]},
  LAUDO_TECNICO:{label:"Laudo técnico",category:"Laudos",solar:false,fields:[],engineeringFields:[]},
  INSPECAO_ELETRICA:{label:"Inspeção elétrica",category:"Laudos",solar:false,fields:[],engineeringFields:[]},
  NR10:{label:"Adequação NR-10",category:"Segurança",solar:false,fields:[],engineeringFields:[]},
  EFICIENCIA_ENERGETICA:{label:"Eficiência energética",category:"Estudos",solar:false,fields:[],engineeringFields:[]},
  FATOR_POTENCIA:{label:"Correção de fator de potência",category:"Estudos",solar:false,fields:[],engineeringFields:[]},
  INSTALACAO_ELETRICA:{label:"Instalação elétrica",category:"Execução",solar:false,fields:[],engineeringFields:[]},
  MANUTENCAO_ELETRICA:{label:"Manutenção elétrica",category:"Execução",solar:false,fields:[],engineeringFields:[]},
  CONSULTORIA:{label:"Consultoria",category:"Consultoria",solar:false,fields:[f("subject","Assunto"),f("scope","Escopo","textarea"),f("purpose","Finalidade"),deadline,f("needsReport","Necessidade de relatório","boolean"),art,f("technicalNotes","Observações","textarea")],engineeringFields:[]},
  OUTRO:{label:"Outro",category:"Outros",solar:false,fields:[f("serviceDescription","Descrição do serviço","textarea"),f("scope","Escopo","textarea"),f("specifications","Especificações","textarea"),deadline,f("technicalNotes","Observações","textarea")],engineeringFields:[]},
};

const energyEntry = [f("connectionType","Tipo de ligação"),f("voltage","Tensão"),f("breaker","Corrente ou disjuntor"),f("installedPower","Potência instalada","number"),f("demand","Demanda","number"),f("utility","Concessionária"),f("existingStandard","Padrão existente"),f("needType","Necessidade","select",["Novo padrão","Aumento de carga","Adequação","Regularização"]),deadline,f("technicalNotes","Observações","textarea")];
const report = [f("reportType","Tipo de laudo"),f("purpose","Finalidade"),f("inspectionLocation","Local da inspeção"),f("equipment","Equipamentos ou instalações","textarea"),f("needsMeasurement","Necessidade de medições","boolean"),art,deadline,f("technicalNotes","Observações","textarea")];
const genericEngineering = [f("technicalScope","Escopo técnico","textarea"),f("specifications","Especificações","textarea"),f("standards","Normas aplicáveis"),f("materials","Materiais","textarea"),f("responsibles","Responsáveis"),deadline,f("technicalNotes","Observações","textarea")];
for (const type of ["ENTRADA_ENERGIA","PADRAO_MEDICAO"] as const) serviceTypeConfig[type].fields = energyEntry;
for (const type of ["LAUDO_TECNICO","INSPECAO_ELETRICA"] as const) { serviceTypeConfig[type].fields = report; serviceTypeConfig[type].engineeringFields = report; }
serviceTypeConfig.NR10.fields=[f("installationType","Tipo de instalação"),f("workerCount","Quantidade de trabalhadores","number"),f("existingDocuments","Documentação existente"),f("existingRecord","Prontuário existente"),f("existingDiagrams","Diagramas existentes"),f("needsInspection","Necessidade de inspeção","boolean"),f("needsAdjustment","Necessidade de adequação","boolean"),f("needsTraining","Necessidade de treinamento","boolean"),deadline,f("technicalNotes","Observações","textarea")];
const efficiency=[f("averageConsumption","Consumo médio","number"),f("demand","Demanda","number"),f("averageBill","Valor médio da fatura","number"),f("powerFactor","Fator de potência atual","number"),f("capacitorBank","Banco de capacitores existente","boolean"),f("mainEquipment","Equipamentos principais","textarea"),f("studyGoal","Objetivo do estudo"),deadline,f("technicalNotes","Observações","textarea")];
for(const type of ["EFICIENCIA_ENERGETICA","FATOR_POTENCIA"] as const) serviceTypeConfig[type].fields=efficiency;
const execution=[f("workType","Tipo de serviço"),f("location","Local"),f("problemDescription","Descrição do problema","textarea"),f("equipment","Equipamentos envolvidos","textarea"),f("urgency","Urgência","select",["Baixa","Normal","Alta","Emergencial"]),f("needsMaterial","Necessidade de material","boolean"),deadline,f("technicalNotes","Observações","textarea")];
for(const type of ["INSTALACAO_ELETRICA","MANUTENCAO_ELETRICA"] as const) serviceTypeConfig[type].fields=execution;
for(const type of OPPORTUNITY_SERVICE_TYPES) if (!serviceTypeConfig[type].engineeringFields.length) serviceTypeConfig[type].engineeringFields=genericEngineering;

export function isServiceType(value: unknown): value is OpportunityServiceType { return typeof value === "string" && OPPORTUNITY_SERVICE_TYPES.includes(value as OpportunityServiceType); }
const LEGACY_SERVICE_TYPE_ALIASES: Record<string, OpportunityServiceType> = {
  OUTROS: "OUTRO",
  ESTUDO_DEMANDA: "EFICIENCIA_ENERGETICA",
  ESTUDO_SELETIVIDADE: "CONSULTORIA",
};

export function normalizeServiceType(value: unknown): OpportunityServiceType | null {
  if (isServiceType(value)) return value;
  if (typeof value !== "string") return null;
  return LEGACY_SERVICE_TYPE_ALIASES[value.trim().toUpperCase()] ?? null;
}
export function isSolarService(type: string | null | undefined) { return type === "USINA_SOLAR" || type === "PROJETO_SOLAR"; }
export function serviceTypeLabel(type: string | null | undefined) { const normalized = normalizeServiceType(type); return normalized ? serviceTypeConfig[normalized].label : "Não definido"; }
export function inferLegacyServiceType(lead: { serviceType?: string | null; consumptionKwh?: number | null; distributor?: string | null; consumerUnit?: string | null; engineering?: { installedPower?: number | null; modules?: number | null; inverter?: string | null } | null }): OpportunityServiceType | null { if(isServiceType(lead.serviceType)) return lead.serviceType; return lead.consumptionKwh || lead.distributor || lead.consumerUnit || lead.engineering?.installedPower || lead.engineering?.modules || lead.engineering?.inverter ? "USINA_SOLAR" : null; }
export function sanitizeServiceDetails(type: OpportunityServiceType, value: unknown): Record<string,string|number|boolean> { const source = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}; const allowed = new Set([...serviceTypeConfig[type].fields,...serviceTypeConfig[type].engineeringFields].map(x=>x.key)); return Object.fromEntries(Object.entries(source).filter(([key,val])=>allowed.has(key) && ["string","number","boolean"].includes(typeof val))) as Record<string,string|number|boolean>; }
