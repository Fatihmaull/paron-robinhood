import { describe, expect, it } from "vitest";
import type { Hex } from "viem";
import { applyLog, type ApplyContext, type IndexedLog } from "../src/handlers/apply.js";
import { PonderStore } from "../src/handlers/ponder-store.js";

// Real data from chain 46630 (deployments/46630/seed-extra.json, wallet P5).
const EAS = "0x52532ddcf56e5cada383b5ba15cdbac2fe85a349" as Hex;
const SCHEMA_KYB = "0xe1590b17b6320150804a7e1e13e6828f01146fc7cf18bb234aa546c2db2b577d" as Hex;
const SCHEMA_PART = "0x58aa312e14d11b14c0739620c263f5785c00d6a6bb4f5bcc7a1a76ab4a67eee9" as Hex;
const APPLICANT = "0xd458ae8ba6e76023893e6334f512fb16f171d86b" as Hex;
const ATTESTER = "0xfab1bb1f3de24231e61b814decA106dac892716f" as Hex;
const APP_UID = "0x2cec2a8e966b6fb287a1b00a7bc95b99cac57b6ec478f49cacb98351109c871a" as Hex;
const APPR_UID = "0xc4bbbe717417e76997f1f2db10f76d73c1f99a383fb7464dc3183d273f7ffa92" as Hex;
const KYB_DATA =
  "0x5e353d09ecb177d65a57328368fe5ba6b34afb5d85c68bc45cd0aa3c3a3a9fa60000000000000000000000000000000000000000000000000000000000000001494400000000000000000000000000000000000000000000000000000000000078cf5f07916da2cdf0a686652874a62656f6cdb772d8ed1279b6ecaf2f10390c" as Hex;
const PART_DATA =
  "0x5e353d09ecb177d65a57328368fe5ba6b34afb5d85c68bc45cd0aa3c3a3a9fa600000000000000000000000000000000000000000000000000000000000000014944000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000006ca81080" as Hex;

/** Fake Ponder db that, like the real one, only finds rows by the table's real primary key. */
function fakeDb() {
  const pkOf = (table: { pk: string }) => table.pk;
  const rows = new Map<string, Map<string, Record<string, unknown>>>();
  const bucket = (t: { name: string }) => {
    if (!rows.has(t.name)) rows.set(t.name, new Map());
    return rows.get(t.name)!;
  };
  const keyOf = (t: { pk: string }, key: Record<string, unknown>) => {
    const v = key[pkOf(t)];
    return v === undefined ? undefined : String(v);
  };
  const db = {
    find: async (t: never, key: Record<string, unknown>) => {
      const k = keyOf(t, key);
      return k === undefined ? null : (bucket(t).get(k) ?? null);
    },
    insert: (t: never) => ({
      values: async (row: Record<string, unknown>) => {
        bucket(t).set(String(row[pkOf(t)]), { ...row });
      },
    }),
    update: (t: never, key: Record<string, unknown>) => ({
      set: async (patch: Record<string, unknown>) => {
        const k = keyOf(t, key)!;
        bucket(t).set(k, { ...bucket(t).get(k), ...patch });
      },
    }),
    delete: async () => undefined,
    sql: { select: () => ({ from: async (t: never) => [...bucket(t).values()] }) },
  };
  return db;
}

const schema = {
  kybApplication: { name: "kyb_application", pk: "uid" },
  participant: { name: "participant", pk: "address" },
  eventLog: { name: "event_log", pk: "id" },
};

const ctx = {
  chainId: 46630,
  participantSchema: SCHEMA_PART,
  kybSchema: SCHEMA_KYB,
} as unknown as ApplyContext;

function log(args: Record<string, unknown>, blockTimestamp: bigint, logIndex: number): IndexedLog {
  return {
    address: EAS,
    eventName: "Attested",
    contractName: "EAS",
    args,
    blockNumber: 1n,
    blockTimestamp,
    txHash: `0x${"ab".repeat(32)}` as Hex,
    txFrom: ATTESTER,
    txTo: EAS,
    logIndex,
  } as IndexedLog;
}

describe("PonderStore kyb_application", () => {
  it("links an approval attestation to its application via refUID", async () => {
    const db = fakeDb();
    const store = new PonderStore(db as never, schema as never);
    await applyLog(
      store,
      ctx,
      log({ uid: APP_UID, schemaUID: SCHEMA_KYB, recipient: APPLICANT, attester: APPLICANT, data: KYB_DATA, refUID: `0x${"00".repeat(32)}` }, 1791643983n, 0),
    );
    await applyLog(
      store,
      ctx,
      log({ uid: APPR_UID, schemaUID: SCHEMA_PART, recipient: APPLICANT, attester: ATTESTER, data: PART_DATA, refUID: APP_UID }, 1791644022n, 1),
    );
    const app = await store.get<Record<string, unknown>>("kyb_application", APP_UID);
    expect(app?.approvalUid).toBe(APPR_UID);
    expect(app?.approvalExpiry).toBe(1822953600n);
    expect(app?.approvedAt).toBe(1791644022n);
    expect(app?.approvalRevoked).toBe(false);
  });
});
