export function clientServiceOrderScope(
  companyId: string,
  clientId: string,
  serviceOrderId?: string
) {
  return {
    ...(serviceOrderId ? { id: serviceOrderId } : {}),
    companyId,
    project: { clientId },
  };
}
