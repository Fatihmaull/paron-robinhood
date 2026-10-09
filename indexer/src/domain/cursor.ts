export type Cursor = Record<string, string | number>;

export function encodeCursor(value: Cursor): string {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64").replace(/=+$/, "");
}

export function decodeCursor(value: string): Cursor {
  const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    throw new CursorError();
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new CursorError();
  return parsed as Cursor;
}

export class CursorError extends Error {
  constructor() {
    super("cursor is not valid");
  }
}
