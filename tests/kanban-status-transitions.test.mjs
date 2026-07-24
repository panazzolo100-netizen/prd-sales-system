import assert from "node:assert/strict";
import test from "node:test";
import { canTransitionStatus } from "../lib/kanban/status-transitions.ts";

test("fluxo principal de propostas", () => {
  assert.equal(canTransitionStatus("proposals", "RASCUNHO", "ENVIADA"), true);
  assert.equal(canTransitionStatus("proposals", "ENVIADA", "EM_NEGOCIACAO"), true);
  assert.equal(canTransitionStatus("proposals", "EM_NEGOCIACAO", "APROVADA"), true);
  assert.equal(canTransitionStatus("proposals", "APROVADA", "CONCLUIDA"), true);
});

test("fluxos operacionais e transições inválidas", () => {
  assert.equal(canTransitionStatus("engineering", "NOVO", "EM_ANDAMENTO"), true);
  assert.equal(canTransitionStatus("engineering", "EM_ANDAMENTO", "AGUARDANDO"), true);
  assert.equal(canTransitionStatus("projects", "AGUARDANDO", "EM_ANDAMENTO"), true);
  assert.equal(canTransitionStatus("service-orders", "ABERTA", "CONCLUIDA"), false);
  assert.equal(canTransitionStatus("projects", "NOVO", "CONCLUIDO"), false);
  assert.equal(canTransitionStatus("proposals", "RASCUNHO", "APROVADA"), false);
});
