/** Read a private key from the environment. Never include the secret in an error. */

export function normalizePrivateKey(raw) {
  if (raw == null || String(raw).trim() === "") {
    throw new Error("Private key is not set");
  }
  let hex = String(raw).trim();
  if (/^0x/i.test(hex)) hex = hex.slice(2);
  if (!/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw new Error("Private key must be 64 hex characters, with or without 0x");
  }
  return `0x${hex.toLowerCase()}`;
}

export function readEnvKey(env, name) {
  try {
    return normalizePrivateKey(env[name]);
  } catch (err) {
    throw new Error(`${name}: ${err.message}`);
  }
}

export function readDeployerKey(env = process.env) {
  return readEnvKey(env, "PARON_DEPLOYER_PK");
}

export const SEED_SIGNER_ENV = {
  "W-DEP": "PARON_DEPLOYER_PK",
  "W-VERIFIER": "KEY_W_VERIFIER",
  "W-P-JKT": "KEY_W_P_JKT",
  "W-P-BTM": "KEY_W_P_BTM",
  "W-P-SGP": "KEY_W_P_SGP",
  "W-BUY": "KEY_W_BUY",
  "W-BUY2": "KEY_W_BUY2",
  "W-TRD": "KEY_W_TRD",
  "W-FEED": "KEY_W_FEED",
};

export function missingSeedKeys(signers, env = process.env) {
  const names = [];
  for (const signer of signers) {
    const envName = SEED_SIGNER_ENV[signer];
    if (!envName) continue;
    if (names.includes(envName)) continue;
    try {
      readEnvKey(env, envName);
    } catch {
      names.push(envName);
    }
  }
  return names;
}

export function redact(text, secrets) {
  let out = String(text);
  for (const secret of secrets) {
    if (!secret) continue;
    const raw = String(secret).replace(/^0x/i, "");
    if (raw.length >= 8) out = out.split(raw).join("[redacted]");
    out = out.split(String(secret)).join("[redacted]");
  }
  return out;
}
