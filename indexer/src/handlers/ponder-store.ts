import type { Hex } from "viem";
import type { Store } from "../store/memory.js";

type Db = {
  find: (table: unknown, key: Record<string, unknown>) => Promise<unknown>;
  insert: (table: unknown) => {
    values: (row: unknown) => Promise<unknown>;
  };
  update: (table: unknown, key: Record<string, unknown>) => {
    set: (patch: unknown) => Promise<unknown>;
  };
  delete: (table: unknown, key: Record<string, unknown>) => Promise<unknown>;
  sql: {
    select: () => {
      from: (table: unknown) => Promise<unknown[]>;
    };
  };
};

const TABLES: Record<string, string> = {
  series: "series",
  bond: "bond",
  print: "print",
  order: "order",
  holding: "holding",
  redemption: "redemption",
  dispute: "dispute",
  provider: "provider",
  participant: "participant",
  index_state: "indexState",
  index_round: "indexRound",
  reference_price: "referencePrice",
  ledger_entry: "ledgerEntry",
  delivery_record: "deliveryRecord",
  gpu_factor: "gpuFactor",
  config_change: "configChange",
  kyb_application: "kybApplication",
  event_log: "eventLog",
  timelock_operation: "timelockOperation",
  role_member: "roleMember",
  index_params: "indexParams",
};

function split(key: string): [string, string] {
  const index = key.indexOf("|");
  return [key.slice(0, index), key.slice(index + 1)];
}

function primaryKey(table: string, key: string): Record<string, unknown> {
  switch (table) {
    case "series":
    case "bond":
      return { seriesId: BigInt(key) };
    case "order":
    case "redemption":
    case "dispute":
      return { [table === "order" ? "orderId" : "reqId"]: BigInt(key) };
    case "holding": {
      const [seriesId, account] = split(key);
      return { seriesId: BigInt(seriesId), account };
    }
    case "index_round":
    case "reference_price": {
      const [gpuModel, roundId] = split(key);
      return { gpuModel, roundId: BigInt(roundId) };
    }
    case "delivery_record": {
      const [seriesId, month] = split(key);
      return { seriesId: BigInt(seriesId), month };
    }
    case "provider":
    case "participant":
      return { address: key };
    case "index_state":
    case "gpu_factor":
      return { gpuModel: key };
    case "kyb_application":
      // kyb_application is keyed by `uid`, not `id`. A wrong key made every find() miss,
      // so approvals never linked to their application.
      return { uid: key };
    case "index_params":
      return { id: key };
    default:
      return { id: key };
  }
}

/** Indexing `Store` backed by Ponder's `context.db`. */
export class PonderStore implements Store {
  constructor(
    private readonly db: Db,
    private readonly schema: Record<string, unknown>,
  ) {}

  private table(name: string): unknown {
    const key = TABLES[name];
    const table = key ? this.schema[key] : undefined;
    if (!table) throw new Error(`Unknown table ${name}`);
    return table;
  }

  async get<T>(table: string, key: string): Promise<T | undefined> {
    const row = await this.db.find(this.table(table), primaryKey(table, key));
    return (row ?? undefined) as T | undefined;
  }

  async put<T>(table: string, key: string, row: T): Promise<void> {
    const existing = await this.get(table, key);
    if (existing) {
      const patch = { ...(row as Record<string, unknown>) };
      for (const column of Object.keys(primaryKey(table, key))) delete patch[column];
      await this.db.update(this.table(table), primaryKey(table, key)).set(patch);
      return;
    }
    await this.db.insert(this.table(table)).values(row);
  }

  async delete(table: string, key: string): Promise<void> {
    await this.db.delete(this.table(table), primaryKey(table, key));
  }

  async list<T>(table: string): Promise<T[]> {
    const rows = await this.db.sql.select().from(this.table(table));
    return rows as T[];
  }
}

export type TxRef = {
  hash: Hex;
  from: Hex;
  to: Hex | null;
};
