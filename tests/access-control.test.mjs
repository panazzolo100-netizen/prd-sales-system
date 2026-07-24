import test from "node:test";
import assert from "node:assert/strict";

import {
  PERMISSIONS,
  getDefaultRoute,
  hasPermission,
} from "../lib/auth/permissions.ts";
import { clientServiceOrderScope } from "../lib/auth/data-scope.ts";

test("EXECUTIVO possui acesso integral", () => {
  for (const permission of Object.values(PERMISSIONS)) {
    assert.equal(
      hasPermission("EXECUTIVO", permission),
      permission !== PERMISSIONS.CLIENT_PORTAL
    );
  }
});

test("GESTOR acessa negócio, mas não administração", () => {
  assert.equal(hasPermission("GESTOR", PERMISSIONS.COMMERCIAL), true);
  assert.equal(hasPermission("GESTOR", PERMISSIONS.ENGINEERING), true);
  assert.equal(hasPermission("GESTOR", PERMISSIONS.FINANCIAL), true);
  assert.equal(hasPermission("GESTOR", PERMISSIONS.ADMINISTRATION), false);
});

test("OPERADOR recebe somente módulos comerciais", () => {
  assert.equal(hasPermission("OPERADOR", PERMISSIONS.COMMERCIAL), true);
  assert.equal(hasPermission("OPERADOR", PERMISSIONS.AGENDA), false);
  assert.equal(hasPermission("OPERADOR", PERMISSIONS.FINANCIAL), false);
  assert.equal(hasPermission("OPERADOR", PERMISSIONS.ENGINEERING), false);
  assert.equal(hasPermission("OPERADOR", PERMISSIONS.PROJECTS), false);
  assert.equal(hasPermission("OPERADOR", PERMISSIONS.SERVICE_ORDERS_INTERNAL), false);
});

test("CLIENTE é direcionado ao portal e não acessa módulos internos", () => {
  assert.equal(getDefaultRoute("CLIENTE"), "/portal");
  assert.equal(hasPermission("CLIENTE", PERMISSIONS.CLIENT_PORTAL), true);
  assert.equal(hasPermission("CLIENTE", PERMISSIONS.CLIENT_SIGN_SERVICE_ORDER), true);
  assert.equal(hasPermission("CLIENTE", PERMISSIONS.DASHBOARD_COMMERCIAL), false);
  assert.equal(hasPermission("CLIENTE", PERMISSIONS.COMMERCIAL), false);
});

test("ID alterado na URL não remove os filtros da sessão", () => {
  const scope = clientServiceOrderScope("company-a", "client-a", "os-client-b");
  assert.deepEqual(scope, {
    id: "os-client-b",
    companyId: "company-a",
    project: { clientId: "client-a" },
  });
});

test("dois clientes produzem escopos isolados", () => {
  const clientA = clientServiceOrderScope("company-a", "client-a");
  const clientB = clientServiceOrderScope("company-a", "client-b");
  assert.notDeepEqual(clientA, clientB);
  assert.equal(clientA.project.clientId, "client-a");
  assert.equal(clientB.project.clientId, "client-b");
});
