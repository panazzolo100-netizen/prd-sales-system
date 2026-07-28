import assert from "node:assert/strict";
import test from "node:test";
import * as XLSX from "xlsx";

import { parseProposalExcel } from "../lib/proposal-excel.ts";

function referenceWorkbook() {
  const workbook = XLSX.utils.book_new();
  const form = XLSX.utils.aoa_to_sheet([]);
  const dimensioning = XLSX.utils.aoa_to_sheet([]);
  const set = (sheet, address, value) => {
    sheet[address] =
      typeof value === "number"
        ? { t: "n", v: value }
        : { t: "s", v: value };
  };
  set(form, "D39", 605);
  set(form, "F39", "610 Wp - TONGWEI BIFACIAL");
  set(form, "D40", 20);
  set(form, "D41", 12.1);
  set(form, "J42", 57.61904761904762);
  set(form, "D46", 1);
  set(form, "E46", 8);
  set(form, "F46", "SIW300 M060 W00");
  set(form, "D47", 0);
  set(form, "D48", 0);
  set(form, "D49", 1);
  set(form, "E49", 8);
  set(form, "E56", 1200);
  set(form, "E57", 1644.8331625);
  set(form, "I56", 27022);
  set(form, "I57", 22997);
  set(form, "E59", 60);
  set(form, "I59", 830.9496521);
  set(dimensioning, "H6", 18000);
  set(dimensioning, "H20", 17943.6345);
  set(dimensioning, "H27", 1495.302875);
  set(dimensioning, "H21", 0.9968685833333334);
  form["!ref"] = "A1:J59";
  dimensioning["!ref"] = "A1:H27";
  XLSX.utils.book_append_sheet(workbook, form, "Formulario");
  XLSX.utils.book_append_sheet(workbook, dimensioning, "Dimensionamento");
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
}

test("extrai os valores confirmados do modelo de proposta SFV", () => {
  const preview = parseProposalExcel(referenceWorkbook(), "proposta-anonima.xlsx");
  assert.equal(preview.system.moduleQuantity, 20);
  assert.equal(preview.system.modulePowerWp, 605);
  assert.equal(preview.system.systemPowerKwp, 12.1);
  assert.equal(preview.system.inverters[0]?.model, "SIW300 M060 W00");
  assert.equal(preview.financial.investmentAmount, 27022);
  assert.equal(preview.financial.cashAmount, 22997);
  assert.equal(preview.financial.installments, 60);
  assert.equal(preview.energy.annualConsumptionKwh, 18000);
  assert.equal(preview.energy.annualGenerationKwh, 17943.6345);
});

test("não aceita valor à vista ausente", () => {
  const workbook = XLSX.read(referenceWorkbook(), { type: "buffer" });
  delete workbook.Sheets.Formulario.I57;
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
  const preview = parseProposalExcel(buffer, "sem-valor.xlsx");
  assert.equal(preview.financial.cashAmount, null);
  assert.ok(preview.warnings.some((warning) => warning.includes("I57")));
});
