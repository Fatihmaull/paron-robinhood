export type Meta = {
  chain_id: number;
  indexed_block: number;
  indexed_at_ms: number;
  server_now_ms: number;
};

export type Envelope<T> = {
  data: T;
  next_cursor?: string | null;
  meta: Meta;
};

export type ProviderBrief = {
  address: string;
  verified: boolean;
  status: string;
  delivered_cu: string;
  defaulted_cu: string;
  voluntary_defaulted_cu: string;
};

export type SeriesRow = {
  series_id: string;
  symbol: string;
  token: string;
  gpu: string;
  gpu_type: string;
  factor: string;
  region: string;
  country: string;
  delivery_window: string;
  window_start_ms: number;
  window_end_ms: number;
  primary_price: string;
  native_primary_price: string;
  max_supply: string;
  paused: boolean;
  finalized: boolean;
  institutional: boolean;
  sale_open: boolean;
  last_price: string | null;
  volume_24h_cu: string;
  volume_24h_usd: string;
  bond_per_cu: string;
  coverage: string;
  sold_supply: string;
  total_supply: string;
  provider: ProviderBrief;
};

export type SeriesBond = {
  deposited: string;
  balance: string;
  released: string;
  slashed: string;
  health: string;
  finalized: boolean;
  withdrawn: boolean;
};

export type SeriesDetail = SeriesRow & {
  gpu_hours: string;
  terms: {
    ack_window_secs: number;
    delivery_window_secs: number;
    dispute_window_secs: number;
    min_redemption_cu: string;
    arbitrator: string;
    spec_hash: string;
    terms_hash: string;
  } | null;
  bond: SeriesBond | null;
  redemption_stats: {
    requested_cu: string;
    delivered_cu: string;
    defaulted_cu: string;
    open_requests: number;
    locked_cu: string;
  } | null;
  index: { status: string; value: string | null } | null;
  created_at_ms: number | null;
  created_tx: string | null;
  explorer_url: string | null;
};

export type BookLevel = { price: string; qty_cu: string; orders: number };

export type OrderBook = {
  series_id: string;
  symbol: string;
  tick: string;
  bids: BookLevel[];
  asks: BookLevel[];
  best_bid: string | null;
  best_ask: string | null;
  spread: string | null;
};

export type Redemption = {
  req_id: string;
  series_id: string;
  symbol: string;
  holder: string;
  provider: string;
  amount_cu: string;
  claim_usd: string;
  state: string;
  stored_state: string;
  requested_at_ms: number;
  ack_deadline_ms: number | null;
  acknowledged_at_ms: number | null;
  delivery_deadline_ms: number | null;
  delivered_at_ms: number | null;
  dispute_deadline_ms: number | null;
  disputed_at_ms: number | null;
  ruling_deadline_ms: number | null;
  resolved_at_ms: number | null;
  next_deadline_ms: number | null;
  delivery_ref: string | null;
  receipt_hash: string | null;
  dispute_bond: string | null;
  ruling: string | null;
  payout: string | null;
  bond_released: string | null;
  voluntary: boolean | null;
  via_dispute: boolean | null;
  auto_finalized: boolean | null;
  default_caller: string | null;
  refunded_after_window: boolean | null;
  reopened_from_req_id: string | null;
  reopened_to_req_id: string | null;
  actions: string[];
  timeline?: TimelineEvent[];
};

export type TimelineEvent = {
  event: string;
  ts_ms: number;
  tx_hash: string;
  explorer_url?: string;
  args?: Record<string, string>;
};

export type Holding = {
  series: Omit<SeriesRow, "provider"> & { provider?: ProviderBrief };
  balance_cu: string;
  redeemable_now: boolean;
  open_requests: number;
  locked_cu: string;
  value_at_last_usd: string;
};

export type IndexStrip = {
  gpu: string;
  gpu_type?: string;
  status: string;
  value: string | null;
  participants: number;
  eligible_volume_cu: string;
  last_ok_at_ms?: number | null;
  reference?: { value: string | null; label: string; observed_at_ms?: number };
};

export type PrintRow = {
  id: string;
  kind: string;
  gpu: string;
  cu_price: string;
  qty_cu: string;
  ts_ms: number;
  ts_iso?: string;
  series_id: string;
  series?: string;
  notional_usd: string;
  side?: string;
  tx_hash?: string;
  explorer_url?: string;
};

export type StatementRow = {
  ts_ms: number;
  ts_iso: string;
  kind: string;
  series_id: string;
  symbol: string;
  req_id: string | null;
  order_id: string | null;
  usdc_delta: string;
  cu_delta: string;
  counterparty: string;
  tx_hash: string;
  explorer_url: string;
};

export type ProviderAccount = {
  address: string;
  entity_id: string;
  status: string;
  verified: boolean;
  reputation: {
    delivered_cu: string;
    defaulted_cu: string;
    voluntary_defaulted_cu: string;
    disputes_lost: number;
    strikes: number;
  };
  bond: { deposited: string; balance: string; released: string; slashed: string };
  proceeds: { gross: string; fees: string; net: string };
  open_requests: number;
  series: Array<Omit<SeriesRow, "provider">>;
};

export type Participant = {
  address: string;
  verified: boolean;
  entity_id: string | null;
  role: { code: number; name: string } | null;
  country: string | null;
  expiry_ms: number | null;
  source: string | null;
  attestation_uid: string | null;
  attester: string | null;
  revoked: boolean;
};

export type TimelockOp = {
  operation_id: string;
  target: string;
  target_name: string;
  value: string;
  data: string;
  decoded: { function: string; args: Record<string, string> };
  predecessor: string;
  salt: string;
  delay_s: number;
  scheduled_at_ms: number;
  ready_at_ms: number;
  status: string;
  scheduled_tx: string | null;
  executed_tx: string | null;
};

export type GpuRow = {
  gpu: string;
  gpu_type: string;
  factor: string;
  updated_at_ms: number;
};

export type LoadResult<T> = Envelope<T> & {
  origin: "mock" | "live" | "onchain";
};

export type Snap = "t0" | "t1" | "t2" | "t3";
