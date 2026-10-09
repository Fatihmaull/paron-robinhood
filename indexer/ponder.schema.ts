import { index, onchainTable, primaryKey } from "ponder";

export const series = onchainTable(
  "series",
  (t) => ({
    seriesId: t.bigint().primaryKey(),
    token: t.hex().notNull(),
    symbol: t.text().notNull(),
    provider: t.hex().notNull(),
    gpuModel: t.hex().notNull(),
    gpu: t.text().notNull(),
    factor: t.integer().notNull(),
    gpuHours: t.bigint().notNull(),
    maxSupply: t.bigint().notNull(),
    primaryPrice: t.bigint().notNull(),
    bondPerCu: t.bigint().notNull(),
    windowStart: t.bigint().notNull(),
    windowEnd: t.bigint().notNull(),
    deliveryWindow: t.text().notNull(),
    ackWindow: t.bigint().notNull(),
    deliveryWindowSecs: t.bigint().notNull(),
    disputeWindow: t.bigint().notNull(),
    minRedemption: t.bigint().notNull(),
    arbitrator: t.hex().notNull(),
    specHash: t.hex().notNull(),
    termsHash: t.hex().notNull(),
    country: t.text().notNull(),
    continent: t.text().notNull(),
    institutional: t.boolean().notNull(),
    paused: t.boolean().notNull(),
    finalized: t.boolean().notNull(),
    soldSupply: t.bigint().notNull(),
    totalSupply: t.bigint().notNull(),
    lockedSupply: t.bigint().notNull(),
    lastPrice: t.bigint(),
    createdAt: t.bigint().notNull(),
    createdTx: t.hex().notNull(),
  }),
  (table) => ({
    providerIdx: index().on(table.provider),
    gpuIdx: index().on(table.gpuModel),
    windowIdx: index().on(table.deliveryWindow),
    placeIdx: index().on(table.continent, table.country),
    tokenIdx: index().on(table.token),
  }),
);

export const bond = onchainTable("bond", (t) => ({
  seriesId: t.bigint().primaryKey(),
  provider: t.hex().notNull(),
  deposited: t.bigint().notNull(),
  balance: t.bigint().notNull(),
  released: t.bigint().notNull(),
  slashed: t.bigint().notNull(),
  withdrawnAmount: t.bigint().notNull(),
  finalized: t.boolean().notNull(),
  withdrawn: t.boolean().notNull(),
  updatedAt: t.bigint().notNull(),
}));

export const print = onchainTable(
  "print",
  (t) => ({
    id: t.text().primaryKey(),
    kind: t.text().notNull(),
    seriesId: t.bigint().notNull(),
    gpuModel: t.hex().notNull(),
    gpu: t.text().notNull(),
    factor: t.integer().notNull(),
    cuPrice: t.bigint().notNull(),
    nativePrice: t.bigint().notNull(),
    qtyCu: t.bigint().notNull(),
    nativeGpuHours: t.bigint().notNull(),
    notional: t.bigint().notNull(),
    fee: t.bigint().notNull(),
    takerSide: t.text().notNull(),
    maker: t.hex().notNull(),
    taker: t.hex().notNull(),
    makerEntity: t.hex().notNull(),
    takerEntity: t.hex().notNull(),
    eligible: t.boolean().notNull(),
    ineligibleReason: t.text(),
    indexStatus: t.text().notNull(),
    thin: t.boolean().notNull(),
    country: t.text().notNull(),
    continent: t.text().notNull(),
    deliveryWindow: t.text().notNull(),
    blockNumber: t.bigint().notNull(),
    ts: t.bigint().notNull(),
    txHash: t.hex().notNull(),
    logIndex: t.integer().notNull(),
  }),
  (table) => ({
    gpuTs: index().on(table.gpuModel, table.ts),
    seriesTs: index().on(table.seriesId, table.ts),
    txIdx: index().on(table.txHash),
    makerIdx: index().on(table.maker),
    takerIdx: index().on(table.taker),
  }),
);

export const order = onchainTable(
  "order",
  (t) => ({
    orderId: t.bigint().primaryKey(),
    seriesId: t.bigint().notNull(),
    maker: t.hex().notNull(),
    side: t.text().notNull(),
    price: t.bigint().notNull(),
    qtyInitial: t.bigint().notNull(),
    qtyRemaining: t.bigint().notNull(),
    status: t.text().notNull(),
    createdAt: t.bigint().notNull(),
    updatedAt: t.bigint().notNull(),
    txHash: t.hex().notNull(),
  }),
  (table) => ({
    bookIdx: index().on(table.seriesId, table.side, table.price, table.createdAt),
    makerIdx: index().on(table.maker),
  }),
);

export const holding = onchainTable(
  "holding",
  (t) => ({
    seriesId: t.bigint().notNull(),
    account: t.hex().notNull(),
    balance: t.bigint().notNull(),
    updatedAt: t.bigint().notNull(),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.seriesId, table.account] }),
  }),
);

export const redemption = onchainTable(
  "redemption",
  (t) => ({
    reqId: t.bigint().primaryKey(),
    seriesId: t.bigint().notNull(),
    holder: t.hex().notNull(),
    provider: t.hex().notNull(),
    amount: t.bigint().notNull(),
    claim: t.bigint().notNull(),
    deliveryRef: t.hex().notNull(),
    receiptHash: t.hex(),
    state: t.text().notNull(),
    requestedAt: t.bigint().notNull(),
    ackDeadline: t.bigint().notNull(),
    acknowledgedAt: t.bigint(),
    deliveryDeadline: t.bigint(),
    deliveredAt: t.bigint(),
    disputeDeadline: t.bigint(),
    disputedAt: t.bigint(),
    rulingDeadline: t.bigint(),
    resolvedAt: t.bigint(),
    disputeBond: t.bigint(),
    ruling: t.text(),
    payout: t.bigint(),
    bondReleased: t.bigint(),
    voluntary: t.boolean(),
    viaDispute: t.boolean(),
    autoFinalized: t.boolean(),
    defaultCaller: t.hex(),
    refundedAfterWindow: t.boolean(),
    reopenedFromReqId: t.bigint(),
    reopenedToReqId: t.bigint(),
    updatedAt: t.bigint().notNull(),
  }),
  (table) => ({
    holderIdx: index().on(table.holder),
    providerIdx: index().on(table.provider),
    seriesIdx: index().on(table.seriesId),
    ackIdx: index().on(table.state, table.ackDeadline),
    deliveryIdx: index().on(table.state, table.deliveryDeadline),
  }),
);

export const dispute = onchainTable("dispute", (t) => ({
  reqId: t.bigint().primaryKey(),
  arbitrator: t.hex().notNull(),
  disputeBond: t.bigint().notNull(),
  rulingDeadline: t.bigint().notNull(),
  ruling: t.text(),
  signers: t.json().notNull(),
  openedAt: t.bigint().notNull(),
  ruledAt: t.bigint(),
}));

export const provider = onchainTable("provider", (t) => ({
  address: t.hex().primaryKey(),
  entityId: t.hex().notNull(),
  status: t.text().notNull(),
  deliveredCu: t.bigint().notNull(),
  defaultedCu: t.bigint().notNull(),
  voluntaryDefaultedCu: t.bigint().notNull(),
  disputesLost: t.integer().notNull(),
  strikes: t.integer().notNull(),
  registeredAt: t.bigint().notNull(),
  updatedAt: t.bigint().notNull(),
}));

export const participant = onchainTable("participant", (t) => ({
  address: t.hex().primaryKey(),
  entityId: t.hex().notNull(),
  role: t.integer().notNull(),
  country: t.text().notNull(),
  expiry: t.bigint().notNull(),
  source: t.text().notNull(),
  attestationUid: t.hex(),
  attester: t.hex(),
  txHash: t.hex(),
  revoked: t.boolean().notNull(),
  updatedAt: t.bigint().notNull(),
}));

export const indexState = onchainTable("index_state", (t) => ({
  gpuModel: t.hex().primaryKey(),
  gpu: t.text().notNull(),
  answer: t.bigint(),
  roundId: t.bigint().notNull(),
  status: t.text().notNull(),
  lastOkAt: t.bigint(),
  lastOkAnswer: t.bigint(),
  deliveredCu: t.bigint().notNull(),
  defaultedCu: t.bigint().notNull(),
  updatedAt: t.bigint().notNull(),
}));

export const indexRound = onchainTable(
  "index_round",
  (t) => ({
    gpuModel: t.hex().notNull(),
    roundId: t.bigint().notNull(),
    answer: t.bigint(),
    status: t.text().notNull(),
    ts: t.bigint().notNull(),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.gpuModel, table.roundId] }),
  }),
);

export const referencePrice = onchainTable(
  "reference_price",
  (t) => ({
    gpuModel: t.hex().notNull(),
    roundId: t.bigint().notNull(),
    value: t.bigint().notNull(),
    observedAt: t.bigint().notNull(),
    label: t.text().notNull(),
    ts: t.bigint().notNull(),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.gpuModel, table.roundId] }),
  }),
);

export const ledgerEntry = onchainTable(
  "ledger_entry",
  (t) => ({
    id: t.text().primaryKey(),
    account: t.hex().notNull(),
    kind: t.text().notNull(),
    seriesId: t.bigint(),
    reqId: t.bigint(),
    orderId: t.bigint(),
    usdcDelta: t.bigint().notNull(),
    cuDelta: t.bigint().notNull(),
    counterparty: t.hex().notNull(),
    ts: t.bigint().notNull(),
    txHash: t.hex().notNull(),
    logIndex: t.integer().notNull(),
  }),
  (table) => ({
    accountTs: index().on(table.account, table.ts),
  }),
);

export const deliveryRecord = onchainTable(
  "delivery_record",
  (t) => ({
    seriesId: t.bigint().notNull(),
    month: t.text().notNull(),
    gpu: t.text().notNull(),
    deliveredCu: t.bigint().notNull(),
    deliveredGpuHours: t.bigint().notNull(),
    defaultedCu: t.bigint().notNull(),
    defaultCount: t.integer().notNull(),
    finalizedCount: t.integer().notNull(),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.seriesId, table.month] }),
  }),
);

export const gpuFactor = onchainTable("gpu_factor", (t) => ({
  gpuModel: t.hex().primaryKey(),
  name: t.text().notNull(),
  factor: t.integer().notNull(),
  updatedAt: t.bigint().notNull(),
}));

export const configChange = onchainTable(
  "config_change",
  (t) => ({
    id: t.text().primaryKey(),
    contract: t.text().notNull(),
    contractAddress: t.hex().notNull(),
    event: t.text().notNull(),
    args: t.json().notNull(),
    ts: t.bigint().notNull(),
    txHash: t.hex().notNull(),
    txFrom: t.hex().notNull(),
    txTo: t.hex(),
    logIndex: t.integer().notNull(),
  }),
  (table) => ({
    tsIdx: index().on(table.ts),
  }),
);

export const kybApplication = onchainTable("kyb_application", (t) => ({
  uid: t.hex().primaryKey(),
  applicant: t.hex().notNull(),
  valid: t.boolean().notNull(),
  entityId: t.hex().notNull(),
  role: t.integer().notNull(),
  country: t.text().notNull(),
  dataHash: t.hex().notNull(),
  submittedAt: t.bigint().notNull(),
  txHash: t.hex().notNull(),
  withdrawn: t.boolean().notNull(),
  approvalUid: t.hex(),
  approver: t.hex(),
  approvedAt: t.bigint(),
  approvalExpiry: t.bigint(),
  approvalRevoked: t.boolean().notNull(),
}));

export const eventLog = onchainTable(
  "event_log",
  (t) => ({
    id: t.text().primaryKey(),
    contract: t.text().notNull(),
    contractAddress: t.hex().notNull(),
    event: t.text().notNull(),
    args: t.json().notNull(),
    seriesId: t.bigint(),
    reqId: t.bigint(),
    blockNumber: t.bigint().notNull(),
    ts: t.bigint().notNull(),
    txHash: t.hex().notNull(),
    txFrom: t.hex().notNull(),
    logIndex: t.integer().notNull(),
  }),
  (table) => ({
    tsIdx: index().on(table.ts),
    seriesIdx: index().on(table.seriesId, table.ts),
    reqIdx: index().on(table.reqId),
  }),
);

export const timelockOperation = onchainTable("timelock_operation", (t) => ({
  id: t.text().primaryKey(),
  // Ponder reserves the SQL name operation_id. The API still exposes operation_id.
  timelockId: t.hex().notNull(),
  index: t.integer().notNull(),
  target: t.hex().notNull(),
  value: t.bigint().notNull(),
  data: t.hex().notNull(),
  predecessor: t.hex().notNull(),
  salt: t.hex(),
  delayS: t.bigint().notNull(),
  scheduledAt: t.bigint().notNull(),
  readyAt: t.bigint().notNull(),
  executedAt: t.bigint(),
  cancelledAt: t.bigint(),
  scheduledTx: t.hex().notNull(),
  executedTx: t.hex(),
  cancelledTx: t.hex(),
  proposer: t.hex().notNull(),
}));

export const roleMember = onchainTable("role_member", (t) => ({
  id: t.text().primaryKey(),
  contract: t.text().notNull(),
  contractAddress: t.hex().notNull(),
  role: t.hex().notNull(),
  roleName: t.text().notNull(),
  account: t.hex().notNull(),
  active: t.boolean().notNull(),
  grantedAt: t.bigint(),
  revokedAt: t.bigint(),
  txHash: t.hex().notNull(),
}));

/** Current PrintIndex thresholds (D-15). Not an API table; E2 reads it. */
export const indexParams = onchainTable("index_params", (t) => ({
  id: t.text().primaryKey(),
  windowSecs: t.bigint().notNull(),
  minVolume: t.bigint().notNull(),
  minParticipants: t.integer().notNull(),
  maxCarryForwardSecs: t.bigint().notNull(),
}));
