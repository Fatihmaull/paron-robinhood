/** ParticipantVerified role codes. Role 1 is the only role that can register as a provider. */
export const PROVIDER_ROLE = 1;

export function attestationRole(value: number | bigint | null | undefined): number | null {
  if (value == null) return null;
  const role = Number(value);
  if (!Number.isInteger(role) || role < 0) return null;
  return role;
}

export function canRegisterAsProvider(role: number | null | undefined): boolean {
  return role === PROVIDER_ROLE;
}
