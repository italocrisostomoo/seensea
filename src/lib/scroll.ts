// Decide se vale restaurar a rolagem salva: precisa ser um número positivo e o
// documento precisa ser alto o bastante para alcançá-la (senão o scroll seria
// limitado ao fim da página e disparia buscas em cadeia).
export function scrollTargetToRestore(
  saved: string | null,
  documentHeight: number,
  viewportHeight: number,
): number | null {
  if (saved === null) return null;
  const y = Number(saved);
  if (!Number.isFinite(y) || y <= 0) return null;
  return documentHeight - viewportHeight >= y ? y : null;
}
