import * as XLSX from "xlsx";

export type ProposalExcelPreview = {
  client: {
    name: string | null;
    document: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    cityState: string | null;
  };
  system: {
    moduleQuantity: number | null;
    modulePowerWp: number | null;
    moduleModel: string | null;
    systemPowerKwp: number | null;
    requiredAreaM2: number | null;
    inverterQuantity: number | null;
    inverterTotalPower: number | null;
    inverters: Array<{
      quantity: number;
      power: number | null;
      model: string | null;
    }>;
  };
  energy: {
    annualConsumptionKwh: number | null;
    annualGenerationKwh: number | null;
    monthlyGenerationKwh: number | null;
    generationConsumptionRatio: number | null;
  };
  financial: {
    investmentAmount: number | null;
    cashAmount: number | null;
    electricalMaterialsAmount: number | null;
    laborAmount: number | null;
    installments: number | null;
    installmentAmount: number | null;
  };
  source: {
    fileName: string;
    sheetName: string;
    detectedCells: Record<string, string>;
  };
  warnings: string[];
};

type Cell = XLSX.CellObject | undefined;

const ERROR_VALUES = new Set([
  "#REF!",
  "#VALUE!",
  "#N/A",
  "#DIV/0!",
  "#NAME?",
  "#NUM!",
  "#NULL!",
]);

function cellAt(sheet: XLSX.WorkSheet, address: string): Cell {
  return sheet[address] as Cell;
}

function cellValue(cell: Cell) {
  if (!cell || cell.t === "e") return null;
  if (typeof cell.v === "string" && ERROR_VALUES.has(cell.v.toUpperCase())) {
    return null;
  }
  return cell.v ?? null;
}

function readNumber(
  sheet: XLSX.WorkSheet,
  address: string,
  warnings: string[],
  options: { positive?: boolean } = {}
) {
  const cell = cellAt(sheet, address);
  const value = cellValue(cell);
  if (cell?.f && (value === null || value === "")) {
    warnings.push(
      `${address} contém fórmula sem resultado calculado. Abra e salve o arquivo no Excel antes de reenviar.`
    );
    return null;
  }
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value.replace(/\s/g, "").replace(",", "."))
        : Number.NaN;
  if (!Number.isFinite(parsed) || (options.positive && parsed <= 0)) {
    if (value !== null && value !== "") {
      warnings.push(`${address} não contém um valor numérico válido.`);
    }
    return null;
  }
  return parsed;
}

function readText(sheet: XLSX.WorkSheet, address: string) {
  const value = cellValue(cellAt(sheet, address));
  if (value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function findValueByLabel(sheet: XLSX.WorkSheet, label: string) {
  const range = XLSX.utils.decode_range(sheet["!ref"] ?? "A1:A1");
  for (let row = range.s.r; row <= range.e.r; row += 1) {
    for (let col = range.s.c; col <= range.e.c; col += 1) {
      const address = XLSX.utils.encode_cell({ r: row, c: col });
      if (readText(sheet, address)?.toLocaleLowerCase("pt-BR") !== label.toLocaleLowerCase("pt-BR")) {
        continue;
      }
      for (let valueCol = col + 1; valueCol <= range.e.c; valueCol += 1) {
        const valueAddress = XLSX.utils.encode_cell({ r: row, c: valueCol });
        const value = readText(sheet, valueAddress);
        if (value) return { value, address: valueAddress };
      }
      return { value: null, address };
    }
  }
  return { value: null, address: "" };
}

export function parseProposalExcel(
  buffer: Buffer,
  fileName: string
): ProposalExcelPreview {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, {
      type: "buffer",
      cellFormula: true,
      cellText: true,
      cellDates: true,
      dense: false,
    });
  } catch (error) {
    throw new Error("Não foi possível abrir o Excel. O arquivo pode estar corrompido ou protegido.", {
      cause: error,
    });
  }

  const form = workbook.Sheets.Formulario;
  if (!form) {
    throw new Error('Layout incompatível: a aba "Formulario" não foi encontrada.');
  }
  const dimensioning = workbook.Sheets.Dimensionamento;
  const warnings: string[] = [];
  if (!dimensioning) {
    warnings.push('A aba "Dimensionamento" não foi encontrada; dados energéticos não estão disponíveis.');
  }
  const detectedCells: Record<string, string> = {};
  const clientFields = {
    name: "Nome:",
    document: "CPF / CNPJ:",
    phone: "Telefone:",
    email: "E-mail:",
    address: "Endereço:",
    cityState: "Cidade/UF:",
  } as const;
  const client = Object.fromEntries(
    Object.entries(clientFields).map(([key, label]) => {
      const found = findValueByLabel(form, label);
      if (found.address) detectedCells[`client.${key}`] = `Formulario!${found.address}`;
      return [key, found.value];
    })
  ) as ProposalExcelPreview["client"];

  const numeric = (
    sheet: XLSX.WorkSheet | undefined,
    sheetName: string,
    key: string,
    address: string,
    positive = false
  ) => {
    detectedCells[key] = `${sheetName}!${address}`;
    return sheet ? readNumber(sheet, address, warnings, { positive }) : null;
  };
  const text = (key: string, address: string) => {
    detectedCells[key] = `Formulario!${address}`;
    return readText(form, address);
  };
  const inverters = [46, 47, 48]
    .map((row) => ({
      quantity: numeric(form, "Formulario", `system.inverters.${row}.quantity`, `D${row}`) ?? 0,
      power: numeric(form, "Formulario", `system.inverters.${row}.power`, `E${row}`),
      model: text(`system.inverters.${row}.model`, `F${row}`),
    }))
    .filter((item) => item.quantity > 0);

  const preview: ProposalExcelPreview = {
    client,
    system: {
      moduleQuantity: numeric(form, "Formulario", "system.moduleQuantity", "D40", true),
      modulePowerWp: numeric(form, "Formulario", "system.modulePowerWp", "D39", true),
      moduleModel: text("system.moduleModel", "F39"),
      systemPowerKwp: numeric(form, "Formulario", "system.systemPowerKwp", "D41", true),
      requiredAreaM2: numeric(form, "Formulario", "system.requiredAreaM2", "J42", true),
      inverterQuantity: numeric(form, "Formulario", "system.inverterQuantity", "D49", true),
      inverterTotalPower: numeric(form, "Formulario", "system.inverterTotalPower", "E49", true),
      inverters,
    },
    energy: {
      annualConsumptionKwh: numeric(dimensioning, "Dimensionamento", "energy.annualConsumptionKwh", "H6", true),
      annualGenerationKwh: numeric(dimensioning, "Dimensionamento", "energy.annualGenerationKwh", "H20", true),
      monthlyGenerationKwh: numeric(dimensioning, "Dimensionamento", "energy.monthlyGenerationKwh", "H27", true),
      generationConsumptionRatio: numeric(dimensioning, "Dimensionamento", "energy.generationConsumptionRatio", "H21", true),
    },
    financial: {
      investmentAmount: numeric(form, "Formulario", "financial.investmentAmount", "I56", true),
      cashAmount: numeric(form, "Formulario", "financial.cashAmount", "I57", true),
      electricalMaterialsAmount: numeric(form, "Formulario", "financial.electricalMaterialsAmount", "E56"),
      laborAmount: numeric(form, "Formulario", "financial.laborAmount", "E57"),
      installments: numeric(form, "Formulario", "financial.installments", "E59", true),
      installmentAmount: numeric(form, "Formulario", "financial.installmentAmount", "I59", true),
    },
    source: {
      fileName,
      sheetName: "Formulario",
      detectedCells,
    },
    warnings,
  };

  if (!preview.financial.cashAmount) {
    warnings.push("O valor à vista em Formulario!I57 está ausente ou inválido.");
  }
  return preview;
}
