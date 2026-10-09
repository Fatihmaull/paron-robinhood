const KEY_RE = /0x[0-9a-fA-F]{64}/g;

const SECRET_ENV = ["KEEPER_PRIVATE_KEY", "TRADER_BOT_PRIVATE_KEY", "PROVIDER_AGENT_PRIVATE_KEY"];

export function secretValues(env = process.env) {
  return SECRET_ENV.map((name) => env[name]).filter((value) => typeof value === "string" && value.length > 0);
}

export function redact(value, secrets = []) {
  if (typeof value === "bigint") return value.toString();
  if (typeof value === "string") {
    let out = value.replace(KEY_RE, "[redacted]");
    for (const secret of secrets) {
      if (secret) out = out.split(secret).join("[redacted]");
    }
    return out;
  }
  if (Array.isArray(value)) return value.map((item) => redact(item, secrets));
  if (value && typeof value === "object") {
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      if (/private.?key|secret|rpcurl|authorization/i.test(key)) {
        out[key] = "[redacted]";
        continue;
      }
      out[key] = redact(item, secrets);
    }
    return out;
  }
  return value;
}

export function createLogger(stream = process.stdout, secrets = []) {
  const write = (level, msg, fields = {}) => {
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      level,
      msg: redact(msg, secrets),
      ...redact(fields, secrets),
    });
    stream.write(`${line}\n`);
  };
  return {
    info: (msg, fields) => write("info", msg, fields),
    warn: (msg, fields) => write("warn", msg, fields),
    error: (msg, fields) => write("error", msg, fields),
  };
}
