import { encodeAbiParameters, encodeFunctionData, type Hex } from "viem";
import { conversionTableAbi } from "../src/abi/temporary-event-abis.js";
import { gpuModelHash } from "../src/domain/gpu.js";
import { applyLog, type ApplyContext, type IndexedLog } from "../src/handlers/apply.js";
import { MemoryStore } from "../src/store/memory.js";

const CU = 10n ** 18n;
const USDC = 1_000_000n;

export const CHAIN_ID = 46630;
export const EXPLORER = "https://explorer.testnet.chain.robinhood.com";
export const INDEXED_BLOCK = 130100400n;
export const INDEXED_AT = 1791601450n;
export const DEMO_NOW = 1791601450n;

export const JKT = addr("11");
export const BUY = addr("22");
export const BUY2 = "0x2223222322232223222322232223222322232223" as Hex;
export const TRADER = addr("33");
export const JUDGE = addr("44");
export const TREASURY = addr("55");
export const APPLICANT = addr("66");
export const BTM = addr("77");
export const ARBITRATOR = addr("88");
export const RM = addr("99");
export const VAULT = addr("bb");
export const SGP = "0x7778777877787778777877787778777877787778" as Hex;
export const TOKEN4 = addr("a4");
export const TOKEN1 = addr("a1");
export const TOKEN2 = addr("a2");
export const TOKEN3 = addr("a3");
export const CONVERSION = addr("c0");
export const ADMIN = addr("a0");
export const VERIFIER = addr("aa");

export const E_JKT = word("e1");
export const E_BUY = word("e2");
export const E_TRADER = word("e3");
export const E_KYB = word("e6");
export const E_BTM = word("e8");
export const E_SGP = word("e9");
export const SPEC = word("5e");
export const ZERO = word("00");
export const KYB_UID = word("d6");
export const DATA_HASH = word("d7");
export const APPROVAL_UID = word("ab");
export const PARTICIPANT_SCHEMA = word("51");
export const KYB_SCHEMA = word("5b");
export const OP_ID = word("0d");

export const H100 = gpuModelHash("H100");
export const H200 = gpuModelHash("H200");
export const B200 = gpuModelHash("B200");
export const GB200 = gpuModelHash("GB200");
export const A100 = gpuModelHash("A100");

const ID = "0x4944" as Hex;
const SG = "0x5347" as Hex;

export const ctx: ApplyContext = {
  chainId: CHAIN_ID,
  redemptionManager: RM,
  orderBook: addr("cc"),
  treasury: TREASURY,
  participantSchema: PARTICIPANT_SCHEMA,
  kybSchema: KYB_SCHEMA,
};

export type Phase = "beforeTrade" | "beforeDefault" | "end";

export async function replay(phase: Phase): Promise<MemoryStore> {
  const store = new MemoryStore();
  for (const log of logs()) {
    if (phase === "beforeTrade" && log.phase !== "seed") continue;
    if (phase === "beforeDefault" && log.phase === "settle") continue;
    await applyLog(store, ctx, log.entry);
  }
  return store;
}

function logs(): { phase: "seed" | "live" | "settle"; entry: IndexedLog }[] {
  const out: { phase: "seed" | "live" | "settle"; entry: IndexedLog }[] = [];
  const push = (phase: "seed" | "live" | "settle", entry: IndexedLog) => out.push({ phase, entry });

  push("seed", log("ReferenceFeed", "ReferenceUpdated", word("f5"), 130100100n, 1791601100n, 0, {
    gpuModel: H100,
    value: 3n * USDC,
    observedAt: 1791601200n,
    roundId: 1n,
  }));
  push("seed", log("PrintIndex", "IndexParamsUpdated", word("f6"), 130100101n, 1791601101n, 0, {
    windowLength: 86400n,
    minVolume: CU,
    minParticipants: 2,
    maxCarryForward: 259200n,
  }));
  for (const [model, factor] of [
    [H100, 10000],
    [H200, 14000],
    [B200, 25000],
    [GB200, 35000],
    [A100, 4500],
  ] as const) {
    push("seed", log("ConversionTable", "FactorSet", word("f7"), 130100110n, 1791601110n, 0, {
      gpuModel: model,
      oldFactor: 0,
      newFactor: factor,
    }));
  }
  for (const [who, entity, role] of [
    [JKT, E_JKT, 1],
    [BTM, E_BTM, 1],
    [SGP, E_SGP, 1],
    [BUY, E_BUY, 2],
    [BUY2, E_BUY, 2],
    [TRADER, E_TRADER, 3],
  ] as const) {
    push("seed", log("RegistryGate", "ParticipantSet", word("f8"), 130100120n, 1791601120n, 0, {
      account: who,
      entityId: entity,
      role,
      country: ID,
      expiry: 1822953600n,
    }));
  }
  for (const [who, entity] of [
    [JKT, E_JKT],
    [BTM, E_BTM],
    [SGP, E_SGP],
  ] as const) {
    push("seed", log("ProviderRegistry", "ProviderRegistered", word("f9"), 130100130n, 1791601130n, 0, {
      provider: who,
      entityId: entity,
    }));
  }

  const series1 = seriesArgs({
    seriesId: 1n,
    token: TOKEN1,
    symbol: "CU-JKT-H100-2611",
    provider: JKT,
    gpuModel: H100,
    factor: 10000,
    gpuHours: 720n,
    maxSupply: 720n * CU,
    primaryPrice: 3n * USDC,
    bondPerCU: 4_500_000n,
    windowStart: 1793491200n,
    windowEnd: 1796083200n,
    country: ID,
  });
  push("seed", log("BondVault", "BondDeposited", word("b1"), 130100140n, 1791601140n, 0, {
    seriesId: 1n,
    provider: JKT,
    amount: 3240n * USDC,
  }, VAULT));
  push("seed", log("SeriesFactory", "SeriesCreated", word("b1"), 130100140n, 1791601140n, 1, series1));

  const series2 = seriesArgs({
    seriesId: 2n,
    token: TOKEN2,
    symbol: "CU-BTM-H200-2611",
    provider: BTM,
    gpuModel: H200,
    factor: 14000,
    gpuHours: 1000n,
    maxSupply: 1400n * CU,
    primaryPrice: 4_060_000n,
    bondPerCU: 6_090_000n,
    windowStart: 1793491200n,
    windowEnd: 1796083200n,
    country: ID,
  });
  push("seed", log("BondVault", "BondDeposited", word("b2"), 130100150n, 1791601150n, 0, {
    seriesId: 2n,
    provider: BTM,
    amount: 8526n * USDC,
  }, VAULT));
  push("seed", log("SeriesFactory", "SeriesCreated", word("b2"), 130100150n, 1791601150n, 1, series2));

  const series3 = seriesArgs({
    seriesId: 3n,
    token: TOKEN3,
    symbol: "CU-SGP-B200-2612",
    provider: SGP,
    gpuModel: B200,
    factor: 25000,
    gpuHours: 744n,
    maxSupply: 1860n * CU,
    primaryPrice: 3n * USDC,
    bondPerCU: 4_500_000n,
    windowStart: 1796083200n,
    windowEnd: 1798761600n,
    country: SG,
  });
  push("seed", log("BondVault", "BondDeposited", word("b3"), 130100160n, 1791601160n, 0, {
    seriesId: 3n,
    provider: SGP,
    amount: 8370n * USDC,
  }, VAULT));
  push("seed", log("SeriesFactory", "SeriesCreated", word("b3"), 130100160n, 1791601160n, 1, series3));
  push("seed", log("OrderBook", "OrderPlaced", word("b4"), 130100170n, 1791601170n, 0, {
    orderId: 9n,
    seriesId: 3n,
    maker: BUY2,
    side: 1,
    price: 3n * USDC,
    qty: 10n * CU,
  }));

  const series4 = seriesArgs({
    seriesId: 4n,
    token: TOKEN4,
    symbol: "CU-JKT-H100-2610",
    provider: JKT,
    gpuModel: H100,
    factor: 10000,
    gpuHours: 500n,
    maxSupply: 500n * CU,
    primaryPrice: 3n * USDC,
    bondPerCU: 4_500_000n,
    windowStart: 1790812800n,
    windowEnd: 1793491200n,
    country: ID,
  });
  push("seed", log("BondVault", "BondDeposited", word("c1"), 130100200n, 1791601200n, 0, {
    seriesId: 4n,
    provider: JKT,
    amount: 2250n * USDC,
  }, VAULT));
  push("seed", log("SeriesFactory", "SeriesCreated", word("c1"), 130100200n, 1791601200n, 1, series4));
  push("seed", log("PrimarySale", "PrimaryBuy", word("c2"), 130100230n, 1791601240n, 2, {
    seriesId: 4n,
    buyer: BUY,
    qty: 20n * CU,
    price: 3n * USDC,
    cost: 60n * USDC,
    fee: 600_000n,
  }));
  push("seed", log("CUToken", "Transfer", word("c2"), 130100230n, 1791601240n, 3, {
    from: zeroAddress(),
    to: BUY,
    value: 20n * CU,
  }, TOKEN4));
  push("seed", log("PrimarySale", "PrimaryBuy", word("c3"), 130100235n, 1791601250n, 2, {
    seriesId: 4n,
    buyer: TRADER,
    qty: 10n * CU,
    price: 3n * USDC,
    cost: 30n * USDC,
    fee: 300_000n,
  }));
  push("seed", log("CUToken", "Transfer", word("c3"), 130100235n, 1791601250n, 3, {
    from: zeroAddress(),
    to: TRADER,
    value: 10n * CU,
  }, TOKEN4));
  push("seed", log("OrderBook", "OrderPlaced", word("c4"), 130100240n, 1791601260n, 1, {
    orderId: 1n,
    seriesId: 4n,
    maker: TRADER,
    side: 1,
    price: 3_200_000n,
    qty: 5n * CU,
  }));

  push("live", log("OrderBook", "Trade", word("c5"), 130100250n, 1791601265n, 4, {
    seriesId: 4n,
    makerOrderId: 1n,
    taker: BUY2,
    maker: TRADER,
    makerEntity: E_TRADER,
    takerEntity: E_BUY,
    takerSide: 0,
    cuPrice: 3_200_000n,
    qty: 5n * CU,
    nativePrice: 3_200_000n,
    takerFee: 24_000n,
    eligible: true,
  }));
  push("live", log("CUToken", "Transfer", word("c5"), 130100250n, 1791601265n, 6, {
    from: TRADER,
    to: BUY2,
    value: 5n * CU,
  }, TOKEN4));
  push("live", log("PrintIndex", "IndexUpdated", word("c5"), 130100250n, 1791601265n, 5, {
    gpuModel: H100,
    roundId: 1n,
    answer: 3_200_000n,
    status: 0,
  }));

  push("live", log("RedemptionManager", "RedemptionRequested", word("c6"), 130100260n, 1791601290n, 1, {
    reqId: 1n,
    seriesId: 4n,
    holder: BUY,
    amount: 8n * CU,
    deliveryRef: word("d0"),
    ackDeadline: 1791601350n,
  }, RM));
  push("live", log("CUToken", "Transfer", word("c6"), 130100260n, 1791601290n, 2, {
    from: BUY,
    to: RM,
    value: 8n * CU,
  }, TOKEN4));
  push("live", log("RedemptionManager", "Acknowledged", word("c7"), 130100270n, 1791601293n, 1, {
    reqId: 1n,
    deliveryDeadline: 1791601353n,
  }, RM));
  push("live", log("RedemptionManager", "Delivered", word("c8"), 130100280n, 1791601300n, 1, {
    reqId: 1n,
    seriesId: 4n,
    receiptHash: word("d1"),
    disputeDeadline: 1791601390n,
  }, RM));
  push("live", log("RedemptionManager", "RedemptionFinalized", word("c9"), 130100300n, 1791601320n, 1, {
    reqId: 1n,
    seriesId: 4n,
    amount: 8n * CU,
    bondReleased: 36n * USDC,
    auto_: false,
  }, RM));
  push("live", log("BondVault", "BondReleased", word("c9"), 130100300n, 1791601320n, 2, {
    seriesId: 4n,
    provider: JKT,
    amount: 36n * USDC,
    reqId: 1n,
  }, VAULT));
  push("live", log("CUToken", "Transfer", word("c9"), 130100300n, 1791601320n, 3, {
    from: RM,
    to: zeroAddress(),
    value: 8n * CU,
  }, TOKEN4));
  push("live", log("RedemptionManager", "RedemptionRequested", word("ca"), 130100320n, 1791601380n, 1, {
    reqId: 2n,
    seriesId: 4n,
    holder: BUY,
    amount: 10n * CU,
    deliveryRef: word("d2"),
    ackDeadline: 1791601440n,
  }, RM));
  push("live", log("CUToken", "Transfer", word("ca"), 130100320n, 1791601380n, 2, {
    from: BUY,
    to: RM,
    value: 10n * CU,
  }, TOKEN4));

  push("settle", log("RedemptionManager", "Defaulted", word("cb"), 130100390n, 1791601441n, 1, {
    reqId: 2n,
    seriesId: 4n,
    holder: BUY,
    amount: 10n * CU,
    payout: 45n * USDC,
    voluntary: false,
    viaDispute: false,
    caller: JUDGE,
  }, RM));
  push("settle", log("BondVault", "BondSlashed", word("cb"), 130100390n, 1791601441n, 2, {
    seriesId: 4n,
    recipient: BUY,
    amount: 45n * USDC,
    reqId: 2n,
  }, VAULT));
  push("settle", log("CUToken", "Transfer", word("cb"), 130100390n, 1791601441n, 3, {
    from: RM,
    to: zeroAddress(),
    value: 10n * CU,
  }, TOKEN4));
  push("settle", log("ProviderRegistry", "ReputationUpdated", word("cb"), 130100390n, 1791601441n, 4, {
    provider: JKT,
    deliveredCU: 8n * CU,
    defaultedCU: 10n * CU,
    voluntaryDefaultedCU: 0n,
    disputesLost: 0,
    strikes: 1,
  }));
  return out;
}

export async function kybPending(): Promise<MemoryStore> {
  const store = await replay("end");
  await applyLog(store, ctx, log("EAS", "Attested", word("e0"), 130100410n, 1791601500n, 1, {
    recipient: APPLICANT,
    attester: APPLICANT,
    uid: KYB_UID,
    schemaUID: KYB_SCHEMA,
    refUID: ZERO,
    data: encodeAbiParameters(
      [{ type: "bytes32" }, { type: "uint8" }, { type: "bytes2" }, { type: "bytes32" }],
      [E_KYB, 2, ID, DATA_HASH],
    ),
  }));
  return store;
}

export async function kybApproved(): Promise<MemoryStore> {
  const store = await kybPending();
  await applyLog(store, ctx, log("EAS", "Attested", word("e1"), 130100420n, 1791601560n, 1, {
    recipient: APPLICANT,
    attester: VERIFIER,
    uid: APPROVAL_UID,
    schemaUID: PARTICIPANT_SCHEMA,
    refUID: KYB_UID,
    data: encodeAbiParameters(
      [{ type: "bytes32" }, { type: "uint8" }, { type: "bytes2" }, { type: "uint64" }],
      [E_KYB, 2, ID, 1822953600n],
    ),
  }));
  return store;
}

export function setFactorCalldata(): Hex {
  return encodeFunctionData({
    abi: conversionTableAbi,
    functionName: "setFactor",
    args: [A100, 4500],
  });
}

export async function timelock(executed: boolean): Promise<MemoryStore> {
  const store = new MemoryStore();
  const scheduledAt = 1791601500n;
  await applyLog(store, ctx, log("TimelockController", "CallScheduled", word("f1"), 130100430n, scheduledAt, 0, {
    id: OP_ID,
    index: 0n,
    target: CONVERSION,
    value: 0n,
    data: setFactorCalldata(),
    predecessor: ZERO,
    delay: 300n,
  }, addr("tl"), ADMIN));
  if (executed) {
    await applyLog(store, ctx, log("TimelockController", "CallExecuted", word("f2"), 130100440n, scheduledAt + 300n, 0, {
      id: OP_ID,
      index: 0n,
      target: CONVERSION,
      value: 0n,
      data: setFactorCalldata(),
    }));
  }
  return store;
}

function seriesArgs(input: Record<string, unknown>): Record<string, unknown> {
  return {
    ackWindow: 60n,
    deliveryWindow: 60n,
    disputeWindow: 90n,
    minRedemption: CU,
    arbitrator: ARBITRATOR,
    specHash: SPEC,
    termsHash: ZERO,
    continent: 2,
    institutional: false,
    ...input,
  };
}

function log(
  contractName: string,
  eventName: string,
  txHash: Hex,
  blockNumber: bigint,
  blockTimestamp: bigint,
  logIndex: number,
  args: Record<string, unknown>,
  address: Hex = addr("10"),
  txFrom: Hex = ADMIN,
): IndexedLog {
  return {
    address,
    eventName,
    contractName,
    args,
    blockNumber,
    blockTimestamp,
    txHash,
    txFrom,
    txTo: address,
    logIndex,
  };
}

function addr(byte: string): Hex {
  return `0x${byte.repeat(20)}` as Hex;
}

function word(byte: string): Hex {
  return `0x${byte.repeat(32)}` as Hex;
}

function zeroAddress(): Hex {
  return `0x${"0".repeat(40)}` as Hex;
}
