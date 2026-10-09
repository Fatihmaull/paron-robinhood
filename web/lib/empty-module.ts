export default {};

export function registerExactEvmScheme() {
  return undefined;
}

export function registerExactSvmScheme() {
  return undefined;
}

export function toClientEvmSigner() {
  return undefined;
}

export function createBaseAccountSDK() {
  throw new Error("Base Account is not enabled in this build.");
}
