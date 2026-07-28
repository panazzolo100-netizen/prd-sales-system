import assert from "node:assert/strict";
import test from "node:test";

import { LeadStatus } from "../lib/generated/prisma/enums.ts";
import { calculatePipelineMetrics } from "../lib/pipeline-metrics.ts";

test("retorna métricas zeradas para uma lista vazia", () => {
  assert.deepEqual(calculatePipelineMetrics([]), {
    totalLeads: 0,
    totalValue: 0,
    ticketAverage: 0,
    wonValue: 0,
    lostValue: 0,
  });
});

test("soma valores ganhos e perdidos usando estimatedValue", () => {
  const metrics = calculatePipelineMetrics([
    { status: LeadStatus.GANHO, estimatedValue: 84_800 },
    { status: LeadStatus.GANHO, estimatedValue: 120_000 },
    { status: LeadStatus.PERDIDO, estimatedValue: 30_000 },
    { status: LeadStatus.NEGOCIACAO, estimatedValue: 50_000 },
  ]);

  assert.equal(metrics.wonValue, 204_800);
  assert.equal(metrics.lostValue, 30_000);
  assert.equal(metrics.totalValue, 284_800);
  assert.equal(metrics.ticketAverage, 71_200);
});

test("trata valores nulos e inválidos como zero", () => {
  const metrics = calculatePipelineMetrics([
    { status: LeadStatus.GANHO, estimatedValue: null },
    { status: LeadStatus.PERDIDO, estimatedValue: Number.NaN },
    { status: LeadStatus.GANHO, estimatedValue: Number.POSITIVE_INFINITY },
    { status: LeadStatus.PERDIDO, estimatedValue: 0 },
  ]);

  assert.equal(metrics.wonValue, 0);
  assert.equal(metrics.lostValue, 0);
  assert.equal(metrics.totalValue, 0);
  assert.equal(metrics.ticketAverage, 0);
});

test("uma oportunidade entra em apenas um estágio por vez", () => {
  const won = calculatePipelineMetrics([
    { status: LeadStatus.GANHO, estimatedValue: 90_000 },
  ]);
  const lost = calculatePipelineMetrics([
    { status: LeadStatus.PERDIDO, estimatedValue: 90_000 },
  ]);

  assert.deepEqual(
    { won: won.wonValue, lost: won.lostValue },
    { won: 90_000, lost: 0 }
  );
  assert.deepEqual(
    { won: lost.wonValue, lost: lost.lostValue },
    { won: 0, lost: 90_000 }
  );
});

test("estágios abertos não entram em ganho nem perdido", () => {
  const metrics = calculatePipelineMetrics(
    [
      LeadStatus.NOVO,
      LeadStatus.CONTATO,
      LeadStatus.VISITA,
      LeadStatus.PROPOSTA,
      LeadStatus.NEGOCIACAO,
    ].map((status) => ({ status, estimatedValue: 10_000 }))
  );

  assert.equal(metrics.wonValue, 0);
  assert.equal(metrics.lostValue, 0);
  assert.equal(metrics.totalValue, 50_000);
});
