export function formatPhone(value: string | null | undefined) {
  if (!value) return "Telefone não informado";
  const digits = value.replace(/\D/g, "").slice(-11);
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return value;
}

export function titleCase(value: string) {
  return value.toLocaleLowerCase("pt-BR").replace(/(^|[\s-])\p{L}/gu, (letter) => letter.toLocaleUpperCase("pt-BR"));
}
