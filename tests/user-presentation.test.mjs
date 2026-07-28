import assert from "node:assert/strict";
import test from "node:test";

import {
  getGreetingForHour,
  getUserInitials,
  getUserPresentation,
} from "../lib/auth/user-presentation.ts";

test("calcula iniciais com primeiro e último nome", () => {
  assert.equal(getUserInitials("Murillo Pivotto"), "MP");
  assert.equal(getUserInitials("Daniel Panazzolo"), "DP");
  assert.equal(getUserInitials("  Gilmar   da Silva  "), "GS");
});

test("calcula iniciais para nome único e vazio", () => {
  assert.equal(getUserInitials("Murillo"), "MU");
  assert.equal(getUserInitials(""), "US");
});

test("prioriza displayName, name, e-mail e fallback final", () => {
  assert.equal(
    getUserPresentation({
      displayName: "Murillo P.",
      name: "Murillo Pivotto",
      email: "murillo@example.com",
    }).displayName,
    "Murillo P."
  );
  assert.equal(
    getUserPresentation({ name: "Daniel Panazzolo", email: "daniel@example.com" })
      .displayName,
    "Daniel Panazzolo"
  );
  assert.equal(
    getUserPresentation({ email: "murillo.pivotto@example.com" }).firstName,
    "Murillo"
  );
  assert.equal(getUserPresentation({}).displayName, "Usuário");
});

test("prioriza cargo e formata a role quando ele não existe", () => {
  assert.equal(
    getUserPresentation({ name: "Murillo", jobTitle: "Consultor", role: "OPERADOR" })
      .roleLabel,
    "Consultor"
  );
  assert.equal(
    getUserPresentation({ name: "Murillo", role: "OPERADOR" }).roleLabel,
    "Operador"
  );
});

test("aplica corretamente manhã, tarde e noite", () => {
  assert.equal(getGreetingForHour(5), "Bom dia");
  assert.equal(getGreetingForHour(11), "Bom dia");
  assert.equal(getGreetingForHour(12), "Boa tarde");
  assert.equal(getGreetingForHour(17), "Boa tarde");
  assert.equal(getGreetingForHour(18), "Boa noite");
  assert.equal(getGreetingForHour(4), "Boa noite");
});
