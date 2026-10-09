# Paron: data contract, schema Ponder + spesifikasi API (dev doc 03)

Status: **APPROVED-SYNCED, spec saja (bukan kode).** Keputusan 07 dan usulan P3-xx disetujui Fatih (Jum 9 Okt 2026 ~09:40 WIB); disinkronkan dengan 01 Jum 9 Okt ~10:30 WIB: E23 tidak lagi terblokir (tabel T19, handler H42), T20 + H43 untuk role, H44 `GateUpdated`, `strikes` dari `ReputationUpdated` (cadangan: `.bak-2026-10-09-pre-approval/`). Disusun awal Kamis 8 Okt 2026, ~21:15 WIB. Ditambah ~21:50 WIB: endpoint E19–E24 dari sitemap §10 S-6 (`paron-sitemap.md`), tabel T17–T18, handler H40–H41, P3-41..P3-50. Kode produk baru mulai Jumat 9 Okt 09:00 WIB.

**Catatan Jum 9 Okt 2026 ~11:07 WIB (audit Principal Engineer, 07 §11):** perubahan audit D-46, D-48, D-49, D-51, D-53, D-56, D-58 ditambahkan; D-54 dan D-59 APPROVED ~11:05 WIB (07 §10.4) tanpa perubahan schema/API selain catatan di §5. Cadangan: `.bak-2026-10-09-pre-audit/`. Ringkasan di §8 X-11..X-17.

**Changelog Jum 9 Okt 2026 ~11:16 WIB:** semua D di atas **APPROVED** Fatih ~11:12 WIB (07 §10.5) dan kini spec (tag `[D-xx]`). Digantikan: `DEFAULTABLE` versi "jam server tanpa field" → `meta.server_now_ms` + aturan jam tunggal (D-48); makna `refunded_after_window` (kini info saja; request ulang lewat reopen H45, D-46); H44 kini empat kontrak (D-49). Field baru `redemption.reopened_from_req_id` / `reopened_to_req_id` (D-46). T5-06 dan T5-08 terjawab (D-51, D-56). Cadangan: `.bak-2026-10-09-pre-1112/`.
**Changelog Jum 9 Okt 2026 ~11:30 WIB (cadangan `.bak-2026-10-09-pre-1130/`):** D-58 host = Vercel+Railway; ownership Scout (§0 tabel Hosting, CORS).
**Changelog Jum 9 Okt 2026 ~11:33 WIB (cadangan `.bak-2026-10-09-pre-1133/`):** D-58: Vercel+Railway sudah login di komputer Scout (tanpa kartu); project Railway `paron` + Postgres; indexer `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (nilai mentah tidak dioper); Scout serahkan URL publik Railway ke PE; PE kirim env Railway lain ke Scout setelah deploy (§0 Hosting).
**Changelog Jum 9 Okt 2026 ~13:10 WIB (cadangan `.bak-2026-10-09-pre-1310/`):** URL produksi terisi (Scout ~13:08 WIB): frontend `https://paron.vercel.app` (D-10); API `https://paron-robinhood-production.up.railway.app/v1` (D-58) (§0 Hosting).
**Changelog Jum 9 Okt 2026 ~13:11 WIB (cadangan `.bak-2026-10-09-pre-1310/` sebagai `*.pre-cors-fix-1311.md`):** PE di grup ~13:09 WIB: `API_CORS_ORIGIN` **kosong dulu (historis; final: CORS = `https://paron.vercel.app` [D-58/D-10], `*` hanya default lokal)** (allow all origins; data publik); dikunci ke `https://paron.vercel.app` belakangan saat final (§0 Hosting, §3.1).
**Catatan Jum 9 Okt 2026 ~14:02 WIB (PE di grup 13:59 WIB; cadangan `.bak-2026-10-09-pre-1402/`):** `DATABASE_SCHEMA` **tidak** lagi tetap `paron`. Penyebab kegagalan sebelumnya: Ponder menolak boot di schema `paron` yang dipakai build lama, sehingga Railway terus melayani container lama. Fix PR #30 (merge): tiap build memakai schema `paron_<sha8>` (8 karakter pertama commit sha). Indexer sehat: `/v1/health` 200 `synced:true`, `/v1/series` mengembalikan 3 series (`CU-JKT-H100-2611`, `CU-BTM-H200-2611`, `CU-SGP-B200-2612`). Tiap deploy backfill ±1 menit, jadi `503 INDEXER_SYNCING` sebentar itu normal.

**[D-82, APPROVED ~15:34 WIB]** Nama series demo yang live = `CU-JKT-H100-2611` (sudah yang dikembalikan `/v1/series`; seed kontrak series 1 tidak diubah). Contoh di bawah yang menulis `CU-JKT-H100-2610` tetap, bersama `series_id` 4 dan window 2026-10: itu catatan D-19 (historis), bukan seed series 1.

**Sumber:** kanonik `paron-design.md` **(design §x)**, `paron-stack.md` **(stack §x)**, `paron-product-knowledge.md` **(PK §x)**, `paron-gaps.md` **(gaps Gx)**, `open-questions-research.md` **(OQR §x)**; plus konsistensi dengan dev doc **01** (`01-contract-interfaces.md`: event, tipe, P-xx) dan **07** (`07-decisions-log.md`: keputusan D-xx, semuanya APPROVED Jum 9 Okt ~09:40 WIB kecuali D-10).

**Legenda:**
- **[D-xx]** = keputusan 07, **APPROVED** (Jum 9 Okt 2026 ~09:40 WIB, Fatih).
- **[APPROVED P3-xx]** = usulan dokumen ini, disetujui bersama rekomendasi 07 (Jum 9 Okt ~09:40 WIB). Sebelumnya `[PENDING P3-xx]`.
- **[TBD T3-xx]** = belum ada rekomendasi (daftar yang masih terbuka di §7 dan 07 §10).
- **(src)** = nama/field disebut langsung di dokumen kanonik.
- **CONTOH DATA** = semua angka contoh memakai skenario demo kanonik (500 CU @ $3.00, bond $2,250, beli 20 CU, ask $3.20, default 10 CU → $45; design §7.4) dan ID series rekomendasi 07 (D-19, D-25). Alamat, hash, timestamp, dan jumlah yang tidak disebut sumber adalah **fiktif** dan ditandai.

---

## 0. Ringkasan

| Hal | Nilai | Sumber |
|---|---|---|
| Indexer | **Ponder 0.17.12** (package `ponder`, bukan `@ponder/core`), TypeScript | stack §4.2 |
| Database | PGlite saat dev → **Postgres 16/17** saat deploy | stack §4.2 |
| API | Route **Hono 4.13.13** bawaan Ponder + GraphQL/SQL-over-HTTP Ponder | stack §4.2, PK §5.7 |
| Chain | Satu chain aktif: Robinhood Chain Testnet (46630) atau Arbitrum Sepolia (421614), dipilih lewat `CHAIN=robinhoodTestnet\|arbitrumSepolia` | design §11.1, stack §3.1 |
| RPC indexer | `INDEXER_RPC_URL`, ulang jeda 400/800/1600 ms, cadangan opsional `INDEXER_RPC_URL_BACKUP` [D-89, APPROVED handler]. Nama env final. Kosong pada cadangan = hanya URL utama. Nilai URL tidak ditulis di dokumen | 04 §4.4, PR #48 |
| Hosting | **Vercel** project `paron` (frontend, root `web/`) + **Railway** project `paron` (Ponder/API + Postgres, root `indexer/`; tidak tidur). Vercel tidak bisa menjalankan Ponder. **[D-58 / D-10, terisi ~13:08 WIB]** Frontend produksi: `https://paron.vercel.app` (commit `b18b3d4`). API produksi: `https://paron-robinhood-production.up.railway.app/v1` (health 200; `synced:false` sampai kontrak di-deploy; ~14:02 WIB sudah `synced:true`, schema Ponder per build `paron_<sha8>`). Env Vercel yang dipakai: `NEXT_PUBLIC_RPC_URL` + `NEXT_PUBLIC_API_BASE_URL` saja — **`NEXT_PUBLIC_DATA_SOURCE=mock` dilarang di Vercel** (`live` opsional). **CORS (PE ~13:09 WIB):** `API_CORS_ORIGIN` **kosong dulu (historis; final: CORS = `https://paron.vercel.app` [D-58/D-10], `*` hanya default lokal)** (allow all origins; data publik, selaras P3-22); dikunci ke `https://paron.vercel.app` belakangan saat final. Akun login Scout (~11:32 WIB, tanpa kartu); `DATABASE_URL` via `${{Postgres.DATABASE_URL}}` (nilai mentah **tidak** dioper); fallback onchain frontend (05 P5-23) S0-kritis | stack §4.5; AUDIT EN-4; 07 §10.5; Scout ~13:08 WIB |
| Alternatif | Goldsky subgraph (CLI 13.15.1) / graph-cli 0.98.1, hanya kalau hosting Ponder gagal | stack §4.2 |
| Endpoint yang disebut sumber | `GET /v1/prints?gpu=&region=&from=&to=&format=csv`, `GET /v1/index/{gpu}` (dengan status), `GET /v1/series/{id}`, `GET /v1/accounts/{addr}/statement` | design §10.3, stack §4.2 |
| Konsumen | Frontend Next.js (S1–S7), keeper default (poll Ponder), demo `curl` di panggung, index provider pihak ketiga ("could ingest") | design §7.2, §10.5; stack §4.4 |

Prinsip: **indexer hanya membaca event**; tidak ada data indexer yang dipakai untuk payout (payout hanya dari `BondVault` onchain, design §1). Angka yang dipakai uang (bond, payout) selalu bisa dicek ulang onchain.

---

## 1. Konvensi data

| Hal | Konvensi | Sumber / status |
|---|---|---|
| Penyimpanan jumlah | Disimpan **raw** sebagai `bigint`: USDC 6 desimal, CU 18 desimal, faktor 1e4 | 01 §1 (design §3 #2/#4/#12) |
| Jumlah di API | **String desimal** (bukan float JSON): USDC 6 angka di belakang koma (`"3.000000"`), CU dinormalisasi tanpa nol berlebih (`"20"`, `"0.5"`) | [APPROVED P3-01] |
| Nama field API | `snake_case` (sumber memakai `delivery_window`, `tx_hash`) | design §10.5 #1 |
| Timestamp | `ts_ms` = `block.timestamp × 1000` (integer milidetik, tuple OCPI memakai ms). Presisi sebenarnya **detik** (timestamp blok). Plus `ts_iso` (UTC, ISO-8601) untuk keterbacaan | design §10.2 G1, §10.4 #1; `ts_iso` = [APPROVED P3-02] |
| Kelas GPU di API | Nama pendek `H100`, `H200`, `B200`, `GB200`, `A100` (contoh sumber: `gpu=H100`). Dipetakan ke `gpu_model` bytes32 = `keccak256` string kanonik: `H100-SXM-80GB` (01 P-05), `H200-SXM-141GB`, `B200-SXM-180GB`, `GB200-NVL72`, `A100-SXM-80GB` | design §1.1, §10.3; string selain H100 = [APPROVED P3-03]. RTX 4090 tidak ada kalau [D-09] disetujui |
| Region | `region` = kode benua 2 huruf (contoh sumber `region=AS`); `country` = ISO-3166 alpha-2 (`ID`, `SG`). Pemetaan `uint8 continent` → `AF, AN, AS, EU, NA, OC, SA` | design §10.3 (contoh `region=AS`), §10.2 G4; urutan enum = [APPROVED P3-04] (01 P-06) |
| `delivery_window` | `YYYY-MM` dari `windowStart` (UTC), karena window = bulan kalender | design §10.5 #1 (nama field), [D-02] |
| ID series di path | Terima `series_id` numerik **atau** simbol (`CU-JKT-H100-2610`) | [APPROVED P3-05] |
| ID print | `"{chain_id}-{tx_hash}-{log_index}"` | [APPROVED P3-06] |
| Alamat | Hex lowercase `0x…` (40 hex) | [APPROVED P3-07] |
| Status redemption | `REQUESTED`, `ACKNOWLEDGED`, `DELIVERED`, `DEFAULTABLE`, `DISPUTED`, `DEFAULTED`, `FINALIZED`, `REFUNDED` | design §4.1, 01 §5 |
| Status indeks | `OK`, `THIN`, `DISRUPTED` | [D-15]; stack §4.2 hanya `OK\|THIN` |

---

## 2. Schema Ponder

### 2.1 Konfigurasi indexer

| Item | Nilai | Sumber / status |
|---|---|---|
| Chain | `robinhoodTestnet` (46630) atau `arbitrumSepolia` (421614), satu aktif | design §11.1, stack §4.2 |
| Kontrak statis | `SeriesFactory`, `PrimarySale`, `OrderBook`, `RedemptionManager`, `BondVault`, `ProviderRegistry`, `ConversionTable`, `PrintIndex`, `ReferenceFeed`, `PanelArbitrator`, gate (`EASGate` **atau** `RegistryGate`), **`TimelockController`** (OZ 5.6.1, 01 §7.1), EAS (`Attested`/`Revoked`, difilter `schemaUID`) | 01 §3, §7.1, §11; stack §4.2 (`Attested`) |
| Kontrak dinamis | Clone `CUToken` per series: alamat diambil dari `SeriesCreated.token` (pola factory Ponder), untuk event `Transfer` → saldo holder | [APPROVED P3-08] |
| Alamat + start block | Dari output `DeployAll` / `DEPLOYMENTS.md` per chain (doc 04) | stack §4.7 |
| Alamat EAS | RH Testnet: self-deploy (alamat dari deploy). Arbitrum Sepolia: EAS `0x2521021fc8BF070473E1e1801D3c7B4aB701E1dE` | design §11.1 |
| RPC | `INDEXER_RPC_URL` plus opsional `INDEXER_RPC_URL_BACKUP` [D-89]. Nilai URL tidak ditulis di dokumen | 04 §4.4 |

**Reorg / finality (hanya yang dinyatakan sumber):** Robinhood Chain memakai soft confirmation sequencer (~100 ms, klaim docs ⚠️, belum diukur); finality L1 mengikuti batch posting (stack §1.1). RPC publik RH Testnet berperilaku **non-archive** untuk blok lama (OQR, catatan housekeeping: fork anvil gagal "fork from an older block with a non-archive node" sampai di-pin `--fork-block-number = latest-20`). Konfigurasi finality/reorg Ponder dan kebutuhan RPC archive untuk sync historis tidak dinyatakan sumber → **[TBD T3-01]** (cek di go/no-go cek 5 "Ponder syncs one event", design §11.3).

### 2.2 Tabel

Tipe kolom memakai tipe Ponder (`hex`, `bigint`, `text`, `integer`, `boolean`, `json`). Semua tabel menyimpan `chain_id` implisit lewat deployment (satu chain aktif); kalau suatu saat multi-chain, `chain_id` masuk PK [APPROVED P3-09].

#### T1 `series`
| Kolom | Tipe | Keterangan / derivasi |
|---|---|---|
| `series_id` **PK** | `bigint` | `SeriesCreated.seriesId` |
| `token` | `hex` | alamat clone `CUToken` |
| `symbol` | `text` | mis. `CU-JKT-H100-2610` |
| `provider` | `hex` | |
| `gpu_model` | `hex` | bytes32 |
| `gpu` | `text` | nama pendek (lookup `gpu_factor.name`) |
| `factor` | `integer` | snapshot 1e4 |
| `gpu_hours` | `bigint` | native |
| `max_supply` | `bigint` | CU 18 desimal |
| `primary_price` | `bigint` | USDC/CU; di-update `PrimaryPriceRaised` |
| `bond_per_cu` | `bigint` | |
| `window_start`, `window_end` | `bigint` | detik |
| `delivery_window` | `text` | `YYYY-MM` [D-02] |
| `ack_window`, `delivery_window_secs`, `dispute_window` | `bigint` | detik |
| `min_redemption` | `bigint` | |
| `arbitrator` | `hex` | |
| `spec_hash`, `terms_hash` | `hex` | |
| `country` | `text` | ISO |
| `continent` | `text` | kode benua (P3-04) |
| `institutional` | `boolean` | |
| `paused`, `finalized` | `boolean` | `SeriesPaused`/`SeriesUnpaused`/`SeriesFinalized` |
| `sold_supply` | `bigint` | Σ `PrimaryBuy.qty` |
| `total_supply` | `bigint` | dari `Transfer` mint/burn clone |
| `locked_supply` | `bigint` | saldo `RedemptionManager` di token ini (CU terkunci) |
| `last_price` | `bigint` | `cu_price` print TRADE terakhir (null kalau belum ada) |
| `created_at`, `created_tx` | `bigint`, `hex` | |

Index: `provider`, `gpu_model`, `delivery_window`, `(continent, country)`.
Diisi oleh: `SeriesCreated`, `PrimaryPriceRaised`, `SeriesPaused`, `SeriesUnpaused`, `SeriesFinalized`, `PrimaryBuy`, `Trade`, `Transfer` (clone).

#### T2 `bond`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `series_id` **PK** | `bigint` | |
| `provider` | `hex` | |
| `deposited`, `balance`, `released`, `slashed`, `withdrawn_amount` | `bigint` | USDC raw |
| `finalized`, `withdrawn` | `boolean` | |
| `updated_at` | `bigint` | |

Diisi oleh: `BondDeposited`, `BondReleased`, `BondSlashed`, `BondFinalized`, `BondWithdrawn` (01 §6.5). Bar kesehatan bond S3 = `balance / deposited`.

#### T3 `print`
Satu baris per fill order book (`TRADE`) dan per pembelian primer (`PRIMARY`).
| Kolom | Tipe | Keterangan / derivasi |
|---|---|---|
| `id` **PK** | `text` | `{chain_id}-{tx_hash}-{log_index}` (P3-06) |
| `kind` | `text` | `PRIMARY` \| `TRADE` (PK §5.3 "print PRIMARY"; 01 P-22) |
| `series_id` | `bigint` | |
| `gpu_model`, `gpu` | `hex`, `text` | join `series` |
| `factor` | `integer` | snapshot series |
| `cu_price` | `bigint` | `Trade.cuPrice` atau `PrimaryBuy.price` |
| `native_price` | `bigint` | `Trade.nativePrice`; untuk PRIMARY dihitung `price × factor / 1e4` (design §10.2 G1) [D-22] |
| `qty_cu` | `bigint` | |
| `native_gpu_hours` | `bigint` (1e18) | `qty × 1e4 / factor` (design §1: 14 CU H200 = 10 jam) |
| `notional` | `bigint` | `qty × cu_price / 1e18` (USDC) |
| `fee` | `bigint` | `Trade.takerFee` / `PrimaryBuy.fee` |
| `taker_side` | `text` | `BUY` (= `Side.Bid` di event) \| `SELL` (= `Side.Ask`); PRIMARY selalu `BUY` [APPROVED P3-15: label API] |
| `maker`, `taker` | `hex` | PRIMARY: `maker` = provider, `taker` = buyer |
| `maker_entity`, `taker_entity` | `hex` | dari `Trade`; PRIMARY: lookup `participant` [D-22, D-31] |
| `eligible` | `boolean` | `Trade.eligible` (01 P-45, [D-35]); PRIMARY selalu `false` (tidak masuk VWAP, 01 P-22) |
| `ineligible_reason` | `text` | `null` \| `PRIMARY` \| `SAME_ENTITY` \| `UNVERIFIED` [APPROVED P3-10] |
| `index_status` | `text` | status `PrintIndex` kelas GPU itu **setelah** print ini (dari `IndexUpdated` di tx yang sama; kalau tidak ada, status terakhir) [D-15] |
| `thin` | `boolean` | `index_status != 'OK'` [APPROVED P3-11] |
| `country`, `continent`, `delivery_window` | `text` | join `series` |
| `block_number` | `bigint` | |
| `ts` | `bigint` | detik blok |
| `tx_hash`, `log_index` | `hex`, `integer` | |

Index: `(gpu_model, ts)`, `(series_id, ts)`, `(continent, ts)`, `(eligible, ts)`, `taker`, `maker`.
Diisi oleh: `Trade` (OrderBook), `PrimaryBuy` (PrimarySale); kolom status dari `IndexUpdated` (PrintIndex).

#### T4 `order`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `order_id` **PK** | `bigint` | |
| `series_id` | `bigint` | |
| `maker` | `hex` | |
| `side` | `text` | `BID` \| `ASK` |
| `price` | `bigint` | USDC/CU |
| `qty_initial`, `qty_remaining` | `bigint` | |
| `status` | `text` | `OPEN` \| `PARTIAL` \| `FILLED` \| `CANCELLED` |
| `created_at`, `updated_at` | `bigint` | |

Index: `(series_id, side, price, created_at)` (price-time priority), `maker`.
Diisi oleh: `OrderPlaced` (qty sisa yang di-rest), `Trade` (kurangi `qty_remaining` order maker via `makerOrderId`), `OrderCancelled`.
Catatan: depth order book di API dihitung dari tabel ini; sumber kebenaran tetap view onchain `OrderBook.getLevels` (01 §6.7). Kalau keduanya beda saat demo, frontend S3 membaca onchain [APPROVED P3-12].

#### T5 `holding`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `series_id` + `account` **PK komposit** | `bigint`, `hex` | |
| `balance` | `bigint` | CU 18 desimal |
| `updated_at` | `bigint` | |

Diisi oleh: `Transfer` clone `CUToken` (P3-08). Alamat `RedemptionManager` dan `OrderBook` ikut tercatat (CU terkunci / escrow ask) dan ditandai `system = true` di API.

#### T6 `redemption`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `req_id` **PK** | `bigint` | |
| `series_id`, `holder`, `provider` | `bigint`, `hex`, `hex` | `provider` join `series` |
| `amount` | `bigint` | CU |
| `claim` | `bigint` | `bond_per_cu × amount / 1e18` (USDC) |
| `delivery_ref`, `receipt_hash` | `hex` | [D-26] hanya hash |
| `state` | `text` | state tersimpan (tanpa `DEFAULTABLE`) |
| `requested_at`, `ack_deadline`, `acknowledged_at`, `delivery_deadline`, `delivered_at`, `dispute_deadline`, `disputed_at`, `ruling_deadline`, `resolved_at` | `bigint` | detik, null kalau belum |
| `dispute_bond` | `bigint` | |
| `ruling` | `text` | `DELIVERED` \| `NOT_DELIVERED` \| null |
| `payout` | `bigint` | `Defaulted.payout` |
| `bond_released` | `bigint` | `RedemptionFinalized.bondReleased` |
| `voluntary`, `via_dispute`, `auto_finalized` | `boolean` | |
| `default_caller` | `hex` | siapa yang memanggil `claimDefault` (demo: wallet juri) |
| `refunded_after_window` | `boolean` | [D-29]; info saja sejak D-46 (refund terjadi saat `ts ≥ series.window_end`; request ulang hanya lewat reopen) |
| `reopened_from_req_id` | `bigint` null | [D-46] request asal kalau baris ini hasil reopen T12b (H45) |
| `reopened_to_req_id` | `bigint` null | [D-46] request baru hasil reopen dari baris ini (H45) |
| `updated_at` | `bigint` | |

Index: `holder`, `provider`, `series_id`, `(state, ack_deadline)`, `(state, delivery_deadline)`, `(state, dispute_deadline)`, `(state, ruling_deadline)` (untuk keeper).
Diisi oleh: `RedemptionRequested`, `Acknowledged`, `Delivered`, `Disputed`, `Ruled`, `RedemptionFinalized`, `Defaulted`, `Refunded` (01 §6.8.3).
**`DEFAULTABLE` dihitung saat query**, sama dengan `stateOf()` onchain (01 P-21): `state = REQUESTED ∧ now > ack_deadline` atau `state = ACKNOWLEDGED ∧ now > delivery_deadline`.

#### T7 `dispute`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `req_id` **PK** | `bigint` | |
| `arbitrator` | `hex` | |
| `dispute_bond` | `bigint` | |
| `ruling_deadline` | `bigint` | |
| `ruling` | `text` | |
| `signers` | `json` | array alamat dari `RulingSubmitted` |
| `opened_at`, `ruled_at` | `bigint` | |

Diisi oleh: `Disputed` (RM), `DisputeReceived`, `RulingSubmitted` (PanelArbitrator), `Ruled`/`Refunded` (RM). Untuk S7 (NICE).

#### T8 `provider`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `address` **PK** | `hex` | |
| `entity_id` | `hex` | |
| `status` | `text` | `ACTIVE` \| `SUSPENDED` \| `BANNED` (design §3 #1) |
| `delivered_cu`, `defaulted_cu`, `voluntary_defaulted_cu` | `bigint` | (design §3 #1; voluntary = [D-33]) |
| `disputes_lost`, `strikes` | `integer` | `strikes` = [D-33]. Diambil langsung dari field `strikes` di `ReputationUpdated` (ditambahkan ke 01 §6.1 saat sinkronisasi, X-1). Turunan dari `Defaulted` (P3-34) hanya dipakai sebagai cek rekonsiliasi |
| `registered_at`, `updated_at` | `bigint` | |

Diisi oleh: `ProviderRegistered`, `ProviderStatusChanged`, `ReputationUpdated` (01 §6.1, termasuk `strikes`).

#### T9 `participant`
| Kolom | Tipe | Keterangan |
|---|---|---|
| `address` **PK** | `hex` | |
| `entity_id` | `hex` | |
| `role` | `integer` | 1 Provider, 2 Buyer, 3 Trader, 4 MarketMaker [D-24] |
| `country` | `text` | |
| `expiry` | `bigint` | |
| `source` | `text` | `EAS` \| `REGISTRY` |
| `attestation_uid` | `hex` | null untuk `REGISTRY` |
| `revoked` | `boolean` | |
| `updated_at` | `bigint` | |

Diisi oleh: `AttestationLinked` (EASGate), EAS `Attested`/`Revoked` (difilter schema `ParticipantVerified`; stack §4.2), `ParticipantSet`/`ParticipantRevoked` (RegistryGate). `verified` di API = `!revoked ∧ expiry > now` (approksimasi; kebenaran = `gate.isVerified` onchain).

#### T10 `index_state` dan T11 `index_round`
`index_state` (PK `gpu_model`): `gpu`, `answer` (`bigint`, USDC/CU), `round_id`, `status`, `last_ok_at`, `delivered_cu`, `defaulted_cu`, `updated_at`.
`index_round` (PK komposit `gpu_model` + `round_id`): `answer`, `status`, `ts`.
Diisi oleh: `IndexUpdated`, `IndexStatusChanged`, `DeliveryRecorded`, `DefaultRecorded` (PrintIndex, 01 §6.10).
Tambahan offchain: VWAP winsorized dihitung saat query dari `print` eligible (α dari `METHODOLOGY.md`) [D-16].

#### T12 `reference_price`
PK komposit `gpu_model` + `round_id`: `value` (`bigint`, USDC per jam H100-equivalent [D-34]), `observed_at`, `label` (`text`, mis. `"synthetic demo data"`), `ts`.
Diisi oleh: `ReferenceUpdated`, `LabelUpdated` (01 §6.11). NICE [D-06]; kalau `ReferenceFeed` tidak di-deploy, tabel kosong.

#### T13 `ledger_entry` (untuk statement)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` **PK** | `text` | `{tx_hash}-{log_index}-{account}-{kind}` |
| `account` | `hex` | |
| `kind` | `text` | `PRIMARY_BUY`, `PRIMARY_PROCEEDS`, `TRADE_BUY`, `TRADE_SELL`, `FEE_PAID`, `FEE_RECEIVED`, `BOND_DEPOSIT`, `BOND_RELEASE`, `BOND_WITHDRAW`, `DEFAULT_PAYOUT`, `BOND_SLASHED`, `DISPUTE_BOND_PAID`, `DISPUTE_BOND_RETURNED`, `DISPUTE_BOND_FORFEITED`, `DISPUTE_BOND_AWARDED`, `REDEMPTION_LOCK`, `REDEMPTION_BURN`, `REDEMPTION_UNLOCK` [APPROVED P3-13] |
| `series_id`, `req_id`, `order_id` | `bigint` | null kalau tidak relevan |
| `usdc_delta` | `bigint` | bertanda (+ masuk, − keluar) |
| `cu_delta` | `bigint` | bertanda |
| `counterparty` | `hex` | |
| `ts`, `tx_hash` | `bigint`, `hex` | |

Index: `(account, ts)`.
Diturunkan dari: `PrimaryBuy`, `Trade`, `BondDeposited`, `BondReleased`, `BondSlashed`, `BondWithdrawn`, `Disputed`, `Ruled`, `Refunded`, `RedemptionRequested`, `RedemptionFinalized`, `Defaulted`. Isi statement mengikuti G10: "trades, fees, redemptions, defaults" (design §10.2). Penerima fee = alamat treasury [D-13].

#### T14 `delivery_record` (agregat)
PK komposit `series_id` + `month` (`YYYY-MM`): `gpu`, `delivered_cu`, `delivered_gpu_hours`, `defaulted_cu`, `default_count`, `finalized_count`.
Diturunkan dari: `RedemptionFinalized`, `Defaulted` (design §10.2 G6: "delivered GPU-hours per series and month"). Bulan = bulan `resolved_at` (UTC) [APPROVED P3-14].

#### T15 `gpu_factor`
PK `gpu_model`: `name` (`H100`, …), `factor` (`integer`), `updated_at`. Diisi oleh `FactorSet` (01 §6.2). Nilai awal A100/RTX 4090 bergantung [D-09].

#### T16 `config_change` (log admin)
PK `id` (`{tx_hash}-{log_index}`): `contract`, `event`, `args` (`json`), `ts`, `tx_hash`; ditambah ~21:50 WIB untuk E22: `contract_address`, `tx_from`, `tx_to` (dari data transaksi event Ponder) [P3-45].
Diisi oleh: `FactorSet`, `ArbitratorAllowlistUpdated`, `TreasuryUpdated`, `PrimaryFeeUpdated`, `TakerFeeUpdated`, `PanelUpdated`, `IndexParamsUpdated`, `AttesterUpdated`, `LabelUpdated`, `ProviderStatusChanged`, `SeriesPaused`, `SeriesUnpaused`, `GateUpdated` (H44), `MinDelayChange` (H42). Untuk jejak audit governance (design §10.2 G12/G13).

#### T17 `kyb_application` (pengajuan KYB, [D-41])
| Kolom | Tipe | Keterangan |
|---|---|---|
| `uid` **PK** | `hex` | UID attestation EAS pengajuan |
| `applicant` | `hex` | `recipient` attestation; harus sama dengan `attester` (self-attestation), kalau tidak baris ditandai `valid = false` [APPROVED P3-42] |
| `valid` | `boolean` | |
| `entity_id`, `role`, `country`, `data_hash` | `hex`, `integer`, `text`, `hex` | decode data schema `KybApplication(bytes32 entityId, uint8 role, bytes2 country, bytes32 dataHash)` (07 D-41 opsi B). Tanpa nama/dokumen (data pribadi tetap offchain) |
| `submitted_at`, `tx_hash` | `bigint`, `hex` | |
| `withdrawn` | `boolean` | pemohon me-revoke attestation pengajuannya sendiri |
| `approval_uid`, `approver`, `approved_at`, `approval_expiry`, `approval_revoked` | `hex`, `hex`, `bigint`, `bigint`, `boolean` | dari attestation `ParticipantVerified` yang `refUID` = `uid` (07 D-41); null kalau belum disetujui |

Diisi oleh: EAS `Attested`/`Revoked` (01 §11) difilter schema `KybApplication` (H40) dan schema `ParticipantVerified` ber-`refUID` (H36 diperluas). Schema `KybApplication` sendiri belum ada di 01/04 (status [D-41]); kalau D-41 tidak memilih opsi B, tabel ini tidak dibuat.

#### T18 `event_log` (event mentah, FULL)
PK `id` (`{tx_hash}-{log_index}`): `contract` (nama, mis. `RedemptionManager`), `contract_address`, `event`, `args` (`json`, jumlah sebagai string desimal raw), `series_id`, `req_id` (`bigint`, null kalau tidak relevan), `block_number`, `ts`, `tx_hash`, `tx_from`. Index: `(ts)`, `(contract, event, ts)`, `(series_id, ts)`.
Diisi oleh: **semua** handler H01–H38, H40 dan H42–H44 (satu baris per log yang diproses, H41). Tidak ada event baru; hanya salinan mentah dari event yang sudah ada di 01 [APPROVED P3-49].

#### T19 `timelock_operation` (antrian Timelock, ditambah Jum 9 Okt setelah 01 §7.1)
| Kolom | Tipe | Keterangan |
|---|---|---|
| `operation_id` **PK** | `hex` | `id` dari `CallScheduled` |
| `target`, `value`, `data` | `hex`, `bigint`, `hex` | dari `CallScheduled` (operasi batch: satu baris per `index`, kolom `index` `integer`) |
| `predecessor`, `salt` | `hex`, `hex` | `salt` dari `CallSalt` (event yang sama tx-nya) |
| `delay_s`, `scheduled_at`, `ready_at` | `bigint` | `ready_at = scheduled_at + delay_s` |
| `executed_at`, `cancelled_at` | `bigint` | null kalau belum |
| `scheduled_tx`, `executed_tx`, `cancelled_tx`, `proposer` | `hex` | `proposer` = `tx_from` tx penjadwalan (Safe atau EOA proposer) |

Diisi oleh: H42. Status (`PENDING`/`READY`/`DONE`/`CANCELLED`) dihitung saat query (§3.26).

#### T20 `role_member` (pemegang role, ditambah Jum 9 Okt setelah 01 §7.1)
PK `id` (`{contract_address}-{role}-{account}`): `contract`, `contract_address`, `role` (`hex`), `role_name` (`DEFAULT_ADMIN_ROLE`, `ADMIN_ROLE`, `VERIFIER_ROLE`, `ARBITER_ROLE`, `PAUSER_ROLE`, `FEED_SIGNER_ROLE`, `MINTER_ROLE`, `PROPOSER_ROLE`, `EXECUTOR_ROLE`, `CANCELLER_ROLE`; tidak dikenal → hex), `account`, `active` (`boolean`), `granted_at`, `revoked_at`, `tx_hash`.
Diisi oleh: H43. Dipakai `/verifier` (allowlist `VERIFIER_ROLE` di `RegistryGate`) dan `/admin/roles` (FULL). Tidak ada endpoint baru di 27 jam: `/verifier` membaca lewat E22 (event) atau `hasRole` onchain.

### 2.3 Pemetaan event → handler

Kolom "Sumber" mengikuti 01 §11: **src** = event disebut dokumen kanonik (stack §4.2 / design §10.3), **usulan** = event baru dari 01. Signature lengkap ada di 01 §6.

| # | Event (kontrak) | Sumber | Tabel yang ditulis | Efek handler |
|---|---|---|---|---|
| H01 | `SeriesCreated` (SeriesFactory) | src | `series` (insert), `bond` (insert baris nol) | Simpan semua field; `delivery_window` = `YYYY-MM` dari `windowStart`; mulai index clone `CUToken` (P3-08) |
| H02 | `PrimaryPriceRaised` (SeriesFactory) | usulan | `series` | Update `primary_price` |
| H03 | `SeriesPaused` / `SeriesUnpaused` (SeriesFactory) | usulan | `series`, `config_change` | Update `paused` |
| H04 | `SeriesFinalized` (SeriesFactory) | usulan [D-14] | `series` | `finalized = true` |
| H05 | `ArbitratorAllowlistUpdated` (SeriesFactory) | usulan | `config_change` | Log |
| H06 | `ProviderRegistered` (ProviderRegistry) | usulan | `provider` | Insert, `status = ACTIVE` |
| H07 | `ProviderStatusChanged` (ProviderRegistry) | usulan | `provider`, `config_change` | Update `status` |
| H08 | `ReputationUpdated` (ProviderRegistry) | usulan [D-33] | `provider` | Timpa counter dengan nilai event, termasuk `strikes` (event membawa total, bukan delta; 01 §6.1) |
| H09 | `FactorSet` (ConversionTable) | usulan | `gpu_factor`, `config_change` | Upsert faktor |
| H10 | `BondDeposited` (BondVault) | usulan | `bond`, `ledger_entry` (`BOND_DEPOSIT`) | `deposited += amount`, `balance += amount` |
| H11 | `BondReleased` (BondVault) | usulan [01 P-39] | `bond`, `ledger_entry` (`BOND_RELEASE` untuk provider) | `balance −= amount`, `released += amount` |
| H12 | `BondSlashed` (BondVault) | usulan [01 P-39] | `bond`, `ledger_entry` (`BOND_SLASHED` provider) | `balance −= amount`, `slashed += amount`. Baris `DEFAULT_PAYOUT` untuk holder ditulis H24 (hindari dobel) |
| H13 | `BondFinalized` (BondVault) | usulan | `bond` | `finalized = true` |
| H14 | `BondWithdrawn` (BondVault) | usulan [D-14] | `bond`, `ledger_entry` (`BOND_WITHDRAW`) | `withdrawn = true`, `balance = 0` |
| H15 | `PrimaryBuy` (PrimarySale) | src | `print` (`kind = PRIMARY`), `series.sold_supply`, `ledger_entry` (`PRIMARY_BUY` buyer; `PRIMARY_PROCEEDS` bruto + `FEE_PAID` untuk provider, karena fee 1% dipotong dari provider; `FEE_RECEIVED` treasury) | `eligible = false`, `ineligible_reason = PRIMARY` |
| H16 | `OrderPlaced` (OrderBook) | usulan | `order` | Insert `OPEN` dengan `qty_remaining = qty` (bagian yang di-rest). **[D-51]** 01 §6.7 kini menetapkan `OrderPlaced` hanya untuk sisa yang di-rest dengan `qty` = qty yang di-rest; taker IOC/terisi penuh tidak punya baris `order` (cukup `print`). Handler ini tidak berubah |
| H17 | `OrderCancelled` (OrderBook) | usulan | `order` | `status = CANCELLED` |
| H18 | `Trade` (OrderBook) | src, field diperluas [D-22] | `print` (`kind = TRADE`), `order` (maker), `series.last_price`, `ledger_entry` (`TRADE_BUY`/`TRADE_SELL` dua pihak, `FEE_PAID` taker, `FEE_RECEIVED` treasury) | `eligible` dan entity langsung dari event; `ineligible_reason` diturunkan (§2.4) |
| H19 | `RedemptionRequested` (RedemptionManager) | src | `redemption` (insert `REQUESTED`), `ledger_entry` (`REDEMPTION_LOCK`) | `claim = bondPerCU × amount / 1e18` |
| H20 | `Acknowledged` (RedemptionManager) | usulan | `redemption` | `ACKNOWLEDGED`, `delivery_deadline` |
| H21 | `Delivered` (RedemptionManager) | src | `redemption` | `DELIVERED`, `receipt_hash`, `dispute_deadline` [D-26] |
| H22 | `Disputed` (RedemptionManager) | src | `redemption`, `dispute`, `ledger_entry` (`DISPUTE_BOND_PAID`) | `DISPUTED`, `ruling_deadline` [D-21, D-37] |
| H23 | `RedemptionFinalized` (RedemptionManager) | usulan | `redemption`, `delivery_record`, `ledger_entry` (`REDEMPTION_BURN`) | `FINALIZED`, `bond_released`, `auto_finalized` |
| H24 | `Defaulted` (RedemptionManager) | src | `redemption`, `delivery_record`, `ledger_entry` (`DEFAULT_PAYOUT` holder, `REDEMPTION_BURN`) | `DEFAULTED`, `payout`, `voluntary`, `via_dispute`, `default_caller`. **[D-56]** kalau `via_dispute`, `default_caller` = alamat `PanelArbitrator` (`msg.sender` di `onRuling`), bukan relayer |
| H25 | `Refunded` (RedemptionManager) | usulan | `redemption`, `dispute`, `ledger_entry` (`REDEMPTION_UNLOCK`, `DISPUTE_BOND_RETURNED`) | `REFUNDED`; `refunded_after_window = ts ≥ series.window_end` [D-29]. **[D-46]** Kalau tx yang sama mengemit `RedemptionReopened`, CU tidak keluar dari RM: tidak ada `REDEMPTION_UNLOCK` (hanya `DISPUTE_BOND_RETURNED`); request baru dibuat H19 dari `RedemptionRequested` dan ditautkan H45 |
| H26 | `Ruled` (RedemptionManager) | usulan | `redemption`, `dispute`, `ledger_entry` (dispute bond hangus/diberikan, [D-21]) | Simpan `ruling`. Transisi state final ditulis oleh event lanjutan di tx yang sama (`RedemptionFinalized` / `Defaulted` / `Refunded`) |
| H27 | `DisputeReceived`, `RulingSubmitted`, `PanelUpdated` (PanelArbitrator) | usulan | `dispute`, `config_change` | `signers` dari `RulingSubmitted` |
| H28 | `PrintRecorded` (PrintIndex) | usulan | — (tidak ditulis; dipakai hanya untuk rekonsiliasi `print`) | [APPROVED P3-16]: abaikan, karena `Trade` sudah membawa semua field |
| H29 | `IndexUpdated` (PrintIndex) | usulan | `index_state`, `index_round`, `print.index_status`/`thin` (print di tx yang sama) | |
| H30 | `IndexStatusChanged` (PrintIndex) | usulan [D-15] | `index_state` | |
| H31 | `DeliveryRecorded` / `DefaultRecorded` (PrintIndex) | usulan | `index_state` | Counter per kelas GPU (sinyal DISRUPTED) |
| H32 | `IndexParamsUpdated` (PrintIndex) | usulan | `config_change` | |
| H33 | `ReferenceUpdated`, `LabelUpdated` (ReferenceFeed) | usulan, NICE [D-06] | `reference_price`, `config_change` | |
| H34 | `AttestationLinked`, `AttesterUpdated` (EASGate) | usulan [D-23] | `participant`, `config_change` | |
| H35 | `ParticipantSet`, `ParticipantRevoked` (RegistryGate) | usulan [D-23] | `participant` | |
| H36 | `Attested`, `Revoked` (EAS) | `Attested` src | `participant` | Filter `schemaUID` `ParticipantVerified`/`ProviderVerified` [D-24]; decode data attestation |
| H37 | `Transfer` (clone `CUToken`) | usulan (ERC-20 standar) | `holding`, `series.total_supply`, `series.locked_supply` | Mint/burn = `from`/`to` nol |
| H38 | `TakerFeeUpdated`, `TreasuryUpdated` (OrderBook), `PrimaryFeeUpdated` (PrimarySale) | usulan | `config_change` | |
| H39 | `FaucetDrip`, `Transfer` (MockUSDC) | usulan | — (tidak di-index) [APPROVED P3-17] | Saldo USDC dibaca langsung onchain oleh frontend |
| H40 | `Attested`, `Revoked` (EAS), schema `KybApplication` | event 01 §11; schema [D-41] | `kyb_application` | `Attested`: baca `EAS.getAttestation(uid)` → decode data, cek `attester == recipient`; `Revoked`: `withdrawn = true`. H36 diperluas: `ParticipantVerified` dengan `refUID` ≠ 0 yang menunjuk baris T17 → isi kolom `approval_*`; revoke-nya → `approval_revoked = true` [APPROVED P3-42] |
| H42 | `CallScheduled`, `CallSalt`, `CallExecuted`, `Cancelled`, `MinDelayChange` (`TimelockController`, OZ) | event 01 §7.1 | `timelock_operation`, `config_change` (`MinDelayChange`) | Insert saat `CallScheduled`; `CallSalt` mengisi `salt`; `CallExecuted` → `executed_at`; `Cancelled` → `cancelled_at` |
| H43 | `RoleGranted`, `RoleRevoked`, `RoleAdminChanged` (semua kontrak `AccessControl` + Timelock) | event 01 §7.1 | `role_member`, `config_change` | Upsert `active` |
| H44 | `GateUpdated` (`ProviderRegistry`, `PrimarySale`, `OrderBook`; **[D-49]** + `SeriesFactory`) | event 01 §6.1/§7 (P-64) | `config_change` | Log |
| H45 **[D-46]** | `RedemptionReopened` (RedemptionManager) | APPROVED D-46 (audit SC-2) | `redemption` | Isi `reopened_from_req_id` di baris request baru dan `reopened_to_req_id` di baris lama (tautan timeline E11). NICE: tanpa handler ini, request baru tetap muncul lewat H19 |
| H46 **[D-53]** | `IndexUpdateFailed` (OrderBook, RedemptionManager) | APPROVED D-53 (audit SC-10) | `config_change` (log) + flag `index_update_failures` di E18 | NICE; tanda bahwa `PrintIndex` gagal mencatat tanpa menghentikan trade/default |
| H41 | (semua event H01–H38, H40, H42–H44) | — | `event_log` | Tambah satu baris mentah per log, di samping efek handler utama (FULL; boleh dimatikan di build 27 jam) [P3-49] |

**Event governance (RESOLVED Jum 9 Okt):** event OZ `TimelockController`, `AccessControl` dan `GateUpdated` kini terdaftar di 01 §7.1/§11, jadi diberi handler H42–H44 dan tabel T19–T20; `TimelockController` masuk kontrak statis §2.1 (X-8, X-9 selesai).

**Urutan dalam satu tx.** Ponder memproses log berurutan per `log_index`. Handler tidak boleh mengandalkan event "sesudahnya" kecuali lewat update (contoh: `Trade` menulis print dengan `index_status` = status terakhir; `IndexUpdated` di tx yang sama lalu menimpa `index_status` print ber-`tx_hash` sama).

### 2.4 Aturan turunan

| Field | Aturan | Sumber / status |
|---|---|---|
| `eligible` (TRADE) | Diambil apa adanya dari `Trade.eligible`. Definisi onchain: kedua `entityId` ≠ 0 dan berbeda | [D-35], 01 P-45, design §10.4 MUST #2 |
| `ineligible_reason` | `PRIMARY` kalau kind PRIMARY; `UNVERIFIED` kalau salah satu entity = 0; `SAME_ENTITY` kalau entity sama (tidak terjadi kalau self-match direvert, [D-35]); selain itu `null` | P3-10 |
| `thin` | `index_status ∈ {THIN, DISRUPTED}` pada saat print | P3-11, [D-15] |
| `native_price` | `cu_price × factor / 1e4` (USDC per jam GPU native) | design §10.2 G1, 01 K-11 |
| `native_gpu_hours` | `qty_cu × 1e4 / factor` | design §1 |
| `delivery_window` | `YYYY-MM` dari `window_start` UTC | [D-02] |
| state `DEFAULTABLE` | `REQUESTED ∧ now > ack_deadline` atau `ACKNOWLEDGED ∧ now > delivery_deadline`; `now` = `meta.server_now_ms` respons itu, dibulatkan ke detik (bukan waktu blok) [D-48]. Aturan tunggal untuk semua klien: tombol "Claim default" tampil kalau `wallclock > deadline + 2 dtk` (jam klien disinkronkan ke `server_now_ms`), lalu simulasi `claimDefault`; tx yang memutuskan. Tidak pernah memakai waktu blok `latest` sebagai jam | 01 P-21, design §4.1; AUDIT SC-4; D-48 |
| `coverage` | `bond_per_cu ÷ reference` dengan `reference` per jam H100-equivalent (= per CU); null kalau tidak ada referensi | [D-34], design §4.4 |
| `bond_health` | `bond.balance ÷ bond.deposited` | design §7.2 S3 (bar kesehatan bond) |
| Indeks winsorized | Dihitung di API dari `print` eligible kelas GPU itu dalam `windowLength`; α di `METHODOLOGY.md` | [D-16], design §10.2 G13 |
| `gpu_count` (tuple OCPI) | Tidak bisa diturunkan dari event (CU tidak membawa jumlah GPU) → selalu `null` di MVP | T3-02 diselesaikan oleh X-7 (APPROVED) |

---

## 3. Spesifikasi API

### 3.1 Konvensi umum

| Hal | Spesifikasi | Sumber / status |
|---|---|---|
| Base URL | `https://<paron-api>/v1`; host = URL bawaan hosting, tanpa domain kustom (D-10 APPROVED Jum 9 Okt ~10:33 WIB) | design §10.5 #1 (`curl https://<paron-api>/v1/prints…`) |
| Implementasi | Route Hono di dalam service Ponder (bukan service terpisah) | stack §4.2 |
| Auth | Tidak ada; semua endpoint read-only dan publik ("Any index provider can ingest it permissionlessly") | design §6 #2 |
| Metode | Semua `GET`. Tidak ada endpoint tulis; semua aksi lewat transaksi onchain dari wallet | design §2 |
| Format | JSON default (`Content-Type: application/json`). `format=csv` di endpoint yang mendukung → `text/csv; charset=utf-8`, header baris pertama = nama field JSON, urutan kolom sama dengan tabel field, RFC 4180 | stack §4.2 (`format=csv`); detail CSV = [APPROVED P3-18] |
| Envelope list | `{ "data": [...], "next_cursor": "<opaque>\|null", "meta": { "chain_id", "indexed_block", "indexed_at_ms" } }` | [APPROVED P3-19] |
| `meta.server_now_ms` **[D-48]** | Field tambahan di semua envelope: jam server saat respons dibuat (ms). Berbeda dengan `indexed_at_ms` (kapan indexer terakhir memproses data, yang berhenti maju saat chain sepi). Mode anvil: waktu chain (05 P5-15). Dipakai klien untuk menyinkronkan countdown | AUDIT SC-4 + koreksi Spec Writer |
| Envelope objek tunggal | `{ "data": {...}, "meta": {...} }` | P3-19 |
| Pagination | `limit` (default 100, maks 1000) + `cursor` (opaque, dari `next_cursor`). CSV: cursor berikutnya di header `X-Next-Cursor` | `limit` src (design §10.5 #1); sisanya [APPROVED P3-20] |
| Urutan | Terbaru dulu (`ts` desc, lalu `log_index` desc) kecuali disebut lain | P3-20 (supaya `curl …&limit=3` menampilkan 3 print terakhir) |
| Waktu di query | `from`/`to` menerima integer ms **atau** ISO-8601 UTC; `from` inklusif, `to` eksklusif | `from`/`to` src; format = [APPROVED P3-21] |
| Jumlah | String desimal (§1, P3-01) | |
| Link explorer | Field `explorer_url` = `<explorer>/tx/<tx_hash>` dari `chains.json` (Blockscout RH Testnet `https://explorer.testnet.chain.robinhood.com`, atau `https://sepolia.arbiscan.io`) | design §10.2 G10, §11.1; PK §5.10 |
| Caching / rate limit | **Tidak dinyatakan sumber** → [TBD T3-03]. RPC publik bisa rate-limit. Indexer mengulang panggilan (jeda 400/800/1600 ms) dan memakai `INDEXER_RPC_URL_BACKUP` hanya kalau terisi [D-89] | |
| CORS | Tidak dinyatakan sumber; frontend Vercel memanggil API di Railway (beda origin) → [APPROVED P3-22, **diperbarui**: CORS = `https://paron.vercel.app` (D-58/D-10); `*` hanya default lokal] (data publik). **PE ~13:09 WIB:** `API_CORS_ORIGIN` **kosong dulu (historis; final: CORS = `https://paron.vercel.app` [D-58/D-10], `*` hanya default lokal)** (allow all origins); dikunci ke `https://paron.vercel.app` belakangan saat final (§0 Hosting) | stack §4.5; 04 `API_CORS_ORIGIN` |
| GraphQL / SQL-over-HTTP Ponder | Tetap aktif (bawaan Ponder), tetapi **kontrak stabil = REST `/v1`**. Nama di GraphQL mengikuti nama tabel §2.2 dan boleh berubah | stack §4.2; stabilitas = [APPROVED P3-23] |

**Format error** [APPROVED P3-24]:

```json
{ "error": { "code": "INVALID_PARAM", "message": "unknown gpu 'H900'", "details": { "param": "gpu", "allowed": ["H100","H200","B200","GB200","A100"] } } }
```

| HTTP | `code` | Kapan |
|---|---|---|
| 400 | `INVALID_PARAM` | Parameter tidak dikenal / format salah / `limit > 1000` / cursor rusak |
| 404 | `NOT_FOUND` | ID series/redemption/alamat/GPU di path tidak ada |
| 503 | `INDEXER_SYNCING` | Ponder belum selesai backfill (`/v1/health.synced = false`) |
| 500 | `INTERNAL` | Lainnya |

### 3.2 Daftar endpoint

| # | Method + path | Prioritas | Konsumen | Sumber |
|---|---|---|---|---|
| E1 | `GET /v1/prints` | MUST | S3 tape, S6, `curl` di panggung, pihak ketiga | src (design §10.3, §10.4 MUST #1, stack §4.2) |
| E2 | `GET /v1/index/{gpu}` | MUST | Strip S1, S6, `curl` | src (status: stack §4.2, [D-15]) |
| E3 | `GET /v1/index/{gpu}/history` | NICE | Chart PrintIndex S6 | usulan (design §7.1 nice #3 "PrintIndex chart") |
| E4 | `GET /v1/series` | MVP (layar) | Tabel S1 | usulan (design §7.2 S1) |
| E5 | `GET /v1/series/{id}` | MUST | S3, halaman transparansi series | src (design §10.3) |
| E6 | `GET /v1/series/{id}/orderbook` | MVP | S3 order book; read API G11 | usulan (design §10.2 G11 "Read API (order book, prints) in the MVP") |
| E7 | `GET /v1/orders` | MVP | S3/S4 "order saya" + tombol cancel | usulan |
| E8 | `GET /v1/accounts/{addr}/holdings` | MVP (layar) | S4 holding | usulan (design §7.2 S4) |
| E9 | `GET /v1/accounts/{addr}/statement` | MUST (JSON), NICE (CSV) | Auditor, S4/S5 export | src (design §10.3; PK §6.6) |
| E10 | `GET /v1/redemptions` | MVP | S4 timeline, S5 request masuk, keeper default | usulan (design §7.2 S4/S5; stack §4.4 keeper "polls Ponder") |
| E11 | `GET /v1/redemptions/{reqId}` | MVP | Timeline per request S4, S7 | usulan |
| E12 | `GET /v1/providers/{addr}` | MVP (layar) | S3 reputasi, S5 console | usulan (design §3 #1, §7.2) |
| E13 | `GET /v1/participants/{addr}` | MVP (layar) | Badge verified S1 + attestation drawer | usulan (stack §3.3 "S1 verified badge plus an attestation drawer") |
| E14 | `GET /v1/gpus` | MVP | Wizard S2 (preview konversi), filter | usulan (design §1.1) |
| E15 | `GET /v1/reference/{gpu}` | NICE [D-06] | Strip S1 (garis referensi), coverage | usulan (design §3 #11) |
| E16 | `GET /v1/deliveries` | NICE | S6 statistik default rate; G6 delivered GPU-hours per series/bulan | usulan (design §10.2 G6) |
| E17 | `GET /v1/disputes` | NICE | S7 Arbitration view | usulan (design §7.2 S7) |
| E18 | `GET /v1/health` | MVP (ops) | Go/no-go cek 5, monitoring demo | usulan (design §11.3) |
| E19 | `GET /v1/providers` | MVP-27h (karena `/admin/providers`); `/providers` = FULL | `/admin/providers`, `/providers` | usulan (sitemap §4.1, §4.8, S-6) [P3-41] |
| E20 | `GET /v1/kyb/applications` | MVP-27h [D-41] | `/verifier`, `/onboarding/kyb` | usulan (sitemap §4.2, §4.7, S-1, S-6) [P3-42] |
| E21 | `GET /v1/kyb/applications/{uid}` | MVP-27h [D-41] | `/verifier/applications/[id]` | usulan (sitemap §4.7) [P3-42] |
| E22 | `GET /v1/config-changes` | MVP-27h (`/admin`); FULL di `/ops/events` | `/admin`, `/admin/*` histori, `/ops/events` | usulan; tabel T16 sudah ada (sitemap §4.8, §4.9, S-6) [P3-44] |
| E23 | `GET /v1/timelock/operations` | MVP-27h (must-not-cut: satu eksekusi Timelock dari `/admin`, sitemap §9.1); tidak lagi terblokir (01 §7.1) | `/admin`, `/admin/proposals` | usulan (sitemap §4.8, S-6) [P3-46] |
| E24 | `GET /v1/events` | FULL | `/ops/events`, `/transparency/[seriesId]` | usulan (sitemap §4.1, §4.9, S-6) [P3-49] |

Endpoint yang tidak dibuat: kalkulasi harga primer, saldo USDC, `isSaleOpen`, `disputeBondFor`. Frontend membaca langsung dari kontrak (view di 01) [APPROVED P3-25].

---

### 3.3 CONTOH DATA bersama (dipakai semua contoh di bawah)

> **CONTOH DATA.** Angka produk dari naskah demo (design §7.4, PK §11.1). Simbol/urutan series dari 07 D-19/D-25 (urutan ID final ada di doc 05). Alamat, hash, nomor blok, `seriesId` 1–4, dan timestamp **fiktif**. Timeline = gladi Sabtu 10 Okt 2026, 10:00 WIB (03:00Z). Parameter waktu demo: ack 60 dtk, delivery 60 dtk, dispute 90 dtk ([D-20]). **[D-82]** Penamaan series demo yang live = `CU-JKT-H100-2611`. Baris series 4 dan payload yang menyertakan `series_id` serta window tidak ditulis ulang.

| Label | Nilai |
|---|---|
| Series 1 / 2 / 3 (seed, forward) | `CU-JKT-H100-2611` / `CU-BTM-H200-2611` / `CU-SGP-B200-2612` [D-25] |
| Series 4 (di-forge di panggung) | `CU-JKT-H100-2610`, H100 factor 1.0000, 500 CU @ $3.00, `bondPerCU` $4.50, bond $2,250, window 2026-10-01T00:00Z (1790812800) – 2026-11-01T00:00Z (1793491200) [D-19, D-02] |
| Series 2 H200 | $4.06/CU, factor 1.4000 → native $5.684/jam (design: "$5.69/hour shows as $4.06/CU"); 1,000 jam H200 = 1,400 CU (design §7.2 S2) |
| Provider JKT | `0x1111111111111111111111111111111111111111`, entity `0xe1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1e1` |
| Buyer | `0x2222222222222222222222222222222222222222`, entity `0xe2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2` |
| Buyer wallet 2 (entity sama dengan buyer, [D-31]) | `0x2223222322232223222322232223222322232223` |
| Trader (entity lain) | `0x3333333333333333333333333333333333333333`, entity `0xe3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3e3` |
| Wallet juri (pemanggil `claimDefault`) | `0x4444444444444444444444444444444444444444` |
| Treasury (Safe, [D-13]) | `0x5555555555555555555555555555555555555555` |
| `RedemptionManager` / `BondVault` | `0x9999999999999999999999999999999999999999` / `0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb` |
| Token series 4 | `0xa4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4` |

Timeline (UTC, WIB = +7):

| Waktu (Z) | `ts_ms` | Event | Angka |
|---|---|---|---|
| 03:00:00 | 1791601200000 | `SeriesCreated` #4 + `BondDeposited` | bond 2,250.000000 |
| 03:00:40 | 1791601240000 | `PrimaryBuy` buyer | 20 CU × 3.00 = 60.000000; fee 0.600000; provider neto 59.400000 |
| 03:00:50 | 1791601250000 | `PrimaryBuy` trader (fiktif, supaya trader punya CU) | 10 CU × 3.00 = 30.000000; fee 0.300000 |
| 03:01:00 | 1791601260000 | `OrderPlaced` #1 trader ASK | 5 CU @ 3.20 (qty 5 = fiktif) |
| 03:01:05 | 1791601265000 | `Trade` (buyer wallet 2 lift) + `IndexUpdated` H100 | 5 × 3.20 = 16.000000; taker fee 0.15% = 0.024000; eligible; indeks H100 = 3.20 OK |
| 03:01:30 | 1791601290000 | `RedemptionRequested` #1 buyer | 8 CU; ack deadline 03:02:30 |
| 03:01:33 | 1791601293000 | `Acknowledged` #1 | "ack dalam 3 detik"; delivery deadline 03:02:33 |
| 03:01:40 | 1791601300000 | `Delivered` #1 | receipt hash; dispute deadline 03:03:10 |
| 03:02:00 | 1791601320000 | `RedemptionFinalized` #1 (holder `confirm`) + `BondReleased` | bond dilepas 8 × 4.50 = 36.000000 ke provider |
| 03:03:00 | 1791601380000 | `RedemptionRequested` #2 buyer (agent provider mati) | 10 CU; ack deadline 03:04:00 |
| 03:04:01 | 1791601441000 | `Defaulted` #2 (`claimDefault` oleh juri) + `BondSlashed` | payout **45.000000** ke buyer (holder, bukan pemanggil) |

State akhir: bond 2,250 − 36 − 45 = **2,169.000000** (health 0.964); provider `delivered_cu` 8, `defaulted_cu` 10; buyer 2 CU, buyer wallet 2 5 CU, trader 5 CU; `sold_supply` 30, `total_supply` 12; referensi sintetis H100 3.00 → coverage series 4 = 4.50 ÷ 3.00 = **1.50** [D-34].

---

### 3.4 E1 `GET /v1/prints`

Feed print mesin-baca (G1). Field mencerminkan tuple OCPI publik (harga per jam GPU, jumlah GPU, region, tipe GPU, timestamp ms) plus ekstra Paron `eligible`, `series`, `delivery_window`, `tx_hash` (design §10.5 #1).

**Query params**

| Param | Tipe | Default | Keterangan | Sumber / status |
|---|---|---|---|---|
| `gpu` | `H100\|H200\|B200\|GB200\|A100` | semua | Kelas GPU | src |
| `region` | kode benua (`AS`, `EU`, `NA`, …) | semua | | src |
| `country` | ISO alpha-2 | semua | | usulan (G1 "continent + ISO country") |
| `from`, `to` | ms / ISO | semua | rentang `ts` | src |
| `series` | `series_id` atau simbol, bisa koma | semua | | usulan P3-05 |
| `delivery_window` | `YYYY-MM` | semua | | usulan [D-02] |
| `side` | `BUY\|SELL` | semua | sisi taker | usulan P3-15 |
| `eligible` | `true\|false` | semua | `true` = hanya print yang boleh masuk indeks | usulan (PK §6.8 "eligible + THIN") |
| `kind` | `PRIMARY\|TRADE` | semua | | usulan (01 P-22) |
| `account` | alamat | semua | print di mana alamat ini `maker` **atau** `taker` (pakai index `maker`/`taker` tabel `print` §2.2). Dipakai riwayat trade per akun di sitemap | usulan [APPROVED P3-38] |
| `limit`, `cursor` | | 100 | | `limit` src |
| `format` | `json\|csv` | `json` | | src |

**Field print**

| Field | Tipe JSON | Keterangan |
|---|---|---|
| `id` | string | `{chain_id}-{tx_hash}-{log_index}` (P3-06) |
| `kind` | string | `PRIMARY` \| `TRADE` |
| `gpu_type` | string | tipe GPU native kanonik, mis. `H100-SXM-80GB` (P3-03) |
| `gpu` | string | nama pendek |
| `price_per_gpu_hour` | string USD | harga native USD/jam GPU (`native_price`) (G1) |
| `cu_price` | string USD | harga per CU |
| `factor` | string | 4 desimal |
| `qty_cu` | string | |
| `native_gpu_hours` | string | `qty_cu ÷ factor` |
| `gpu_count` | null | tuple OCPI; tidak bisa diturunkan → selalu `null` di MVP (T3-02 selesai, X-7) |
| `region` | string | kode benua |
| `country` | string | ISO alpha-2 |
| `ts_ms` | integer | ms (presisi detik) |
| `ts_iso` | string | UTC |
| `series` | string | simbol |
| `series_id` | string | |
| `delivery_window` | string | `YYYY-MM` |
| `side` | string | sisi taker `BUY`/`SELL` |
| `notional_usd` | string | |
| `fee_usd` | string | taker fee (TRADE) / primary fee (PRIMARY) |
| `maker`, `taker` | string | alamat (print "attributable", design §6 #2) [APPROVED P3-26] |
| `eligible` | boolean | §2.4 |
| `ineligible_reason` | string\|null | `PRIMARY`, `SAME_ENTITY`, `UNVERIFIED` |
| `index_status` | string | status indeks kelas GPU itu setelah print |
| `thin` | boolean | `index_status != "OK"` |
| `block_number` | integer | |
| `tx_hash` | string | |
| `explorer_url` | string | |

**Contoh** (CONTOH DATA): `curl 'https://<paron-api>/v1/prints?gpu=H100&limit=3'`

```json
{
  "data": [
    {
      "id": "46630-0xc5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5-4",
      "kind": "TRADE",
      "gpu_type": "H100-SXM-80GB",
      "gpu": "H100",
      "price_per_gpu_hour": "3.200000",
      "cu_price": "3.200000",
      "factor": "1.0000",
      "qty_cu": "5",
      "native_gpu_hours": "5",
      "gpu_count": null,
      "region": "AS",
      "country": "ID",
      "ts_ms": 1791601265000,
      "ts_iso": "2026-10-10T03:01:05Z",
      "series": "CU-JKT-H100-2610",
      "series_id": "4",
      "delivery_window": "2026-10",
      "side": "BUY",
      "notional_usd": "16.000000",
      "fee_usd": "0.024000",
      "maker": "0x3333333333333333333333333333333333333333",
      "taker": "0x2223222322232223222322232223222322232223",
      "eligible": true,
      "ineligible_reason": null,
      "index_status": "OK",
      "thin": false,
      "block_number": 130100250,
      "tx_hash": "0xc5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5",
      "explorer_url": "https://explorer.testnet.chain.robinhood.com/tx/0xc5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5"
    },
    {
      "id": "46630-0xc3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3-2",
      "kind": "PRIMARY",
      "gpu_type": "H100-SXM-80GB",
      "gpu": "H100",
      "price_per_gpu_hour": "3.000000",
      "cu_price": "3.000000",
      "factor": "1.0000",
      "qty_cu": "10",
      "native_gpu_hours": "10",
      "gpu_count": null,
      "region": "AS",
      "country": "ID",
      "ts_ms": 1791601250000,
      "ts_iso": "2026-10-10T03:00:50Z",
      "series": "CU-JKT-H100-2610",
      "series_id": "4",
      "delivery_window": "2026-10",
      "side": "BUY",
      "notional_usd": "30.000000",
      "fee_usd": "0.300000",
      "maker": "0x1111111111111111111111111111111111111111",
      "taker": "0x3333333333333333333333333333333333333333",
      "eligible": false,
      "ineligible_reason": "PRIMARY",
      "index_status": "THIN",
      "thin": true,
      "block_number": 130100235,
      "tx_hash": "0xc3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3",
      "explorer_url": "https://explorer.testnet.chain.robinhood.com/tx/0xc3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3c3"
    },
    {
      "id": "46630-0xc2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2-2",
      "kind": "PRIMARY",
      "gpu_type": "H100-SXM-80GB",
      "gpu": "H100",
      "price_per_gpu_hour": "3.000000",
      "cu_price": "3.000000",
      "factor": "1.0000",
      "qty_cu": "20",
      "native_gpu_hours": "20",
      "gpu_count": null,
      "region": "AS",
      "country": "ID",
      "ts_ms": 1791601240000,
      "ts_iso": "2026-10-10T03:00:40Z",
      "series": "CU-JKT-H100-2610",
      "series_id": "4",
      "delivery_window": "2026-10",
      "side": "BUY",
      "notional_usd": "60.000000",
      "fee_usd": "0.600000",
      "maker": "0x1111111111111111111111111111111111111111",
      "taker": "0x2222222222222222222222222222222222222222",
      "eligible": false,
      "ineligible_reason": "PRIMARY",
      "index_status": "THIN",
      "thin": true,
      "block_number": 130100230,
      "tx_hash": "0xc2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2",
      "explorer_url": "https://explorer.testnet.chain.robinhood.com/tx/0xc2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2"
    }
  ],
  "next_cursor": "eyJ0cyI6MTc5MTYwMTI0MCwibCI6Mn0",
  "meta": { "chain_id": 46630, "indexed_block": 130100400, "indexed_at_ms": 1791601450000 }
}
```

Catatan contoh: `index_status` print primer = `THIN` karena saat itu belum ada fill eligible (asumsi tidak ada print H100 eligible lain dalam 24 jam; seed sebenarnya bisa berbeda, doc 05).

**Contoh CSV** (`…/v1/prints?series=CU-JKT-H100-2610&kind=TRADE&format=csv`, CONTOH DATA, kolom dipotong untuk dokumen ini; file asli memuat semua field di atas dengan urutan yang sama):

```csv
id,kind,gpu_type,gpu,price_per_gpu_hour,cu_price,factor,qty_cu,native_gpu_hours,gpu_count,region,country,ts_ms,ts_iso,series,series_id,delivery_window,side,notional_usd,fee_usd,eligible,ineligible_reason,index_status,thin,tx_hash
46630-0xc5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5-4,TRADE,H100-SXM-80GB,H100,3.200000,3.200000,1.0000,5,5,,AS,ID,1791601265000,2026-10-10T03:01:05Z,CU-JKT-H100-2610,4,2026-10,BUY,16.000000,0.024000,true,,OK,false,0xc5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5c5
```

`null` di CSV = sel kosong [P3-18].

**Contoh H200** (hanya baris inti; CONTOH DATA, kalau ada fill di series 2): `"gpu":"H200","gpu_type":"H200-SXM-141GB","cu_price":"4.060000","factor":"1.4000","price_per_gpu_hour":"5.684000","qty_cu":"14","native_gpu_hours":"10"`. Kontrak menghitung 5.684; design membulatkan menjadi $5.69 untuk narasi.

---

### 3.5 E2 `GET /v1/index/{gpu}`

PrintIndex per kelas GPU, dalam USD per CU (jam H100-equivalent).

| Param | Keterangan |
|---|---|
| `{gpu}` | nama pendek; 404 kalau tidak dikenal |

**Field**

| Field | Tipe | Keterangan | Sumber / status |
|---|---|---|---|
| `gpu`, `gpu_type` | string | | |
| `unit` | string | `"USD per CU (H100-equivalent GPU-hour)"` | design §1 |
| `status` | string | `OK` \| `THIN` \| `DISRUPTED` | [D-15] (stack §4.2: `OK\|THIN`) |
| `value` | string\|null | **headline** = VWAP winsorized offchain atas print eligible dalam `window_secs`; kalau `status != OK` = nilai OK terakhir (carry-forward); `null` kalau belum pernah OK | [D-16], [D-15] |
| `onchain_vwap` | string\|null | `answer` terakhir `PrintIndex` (VWAP biasa onchain) | 01 §6.10, [D-16] |
| `round_id` | string | round onchain terakhir | |
| `updated_at_ms` | integer | | |
| `last_ok_at_ms` | integer\|null | | [D-15] |
| `window_secs` | integer | demo 86400 | [D-15] |
| `eligible_volume_cu` | string | volume eligible di window | |
| `participants` | integer | jumlah entity unik di window | [D-15] |
| `thresholds` | object | `min_volume_cu`, `min_participants`, `max_carry_forward_secs` | [D-15] |
| `method` | object | `{ "type": "winsorized_vwap", "alpha": <string\|null>, "methodology": "METHODOLOGY.md@<versi>" }`; α belum ada angkanya → [TBD T3-04] | design §10.2 G3, [D-16] |
| `reference` | object\|null | ringkasan E15 (nilai, label sintetis); `null` kalau `ReferenceFeed` tidak di-deploy | [D-06] |

Cross-class index (satu kurva CU gabungan semua kelas GPU, untuk strip "H100-equivalent VWAP" di S1) tidak didefinisikan sumber. Usulan: strip S1 memakai `/v1/index/H100` saja → [APPROVED P3-27].

**Contoh** (CONTOH DATA, setelah trade 03:01:05Z):

```json
{
  "data": {
    "gpu": "H100",
    "gpu_type": "H100-SXM-80GB",
    "unit": "USD per CU (H100-equivalent GPU-hour)",
    "status": "OK",
    "value": "3.200000",
    "onchain_vwap": "3.200000",
    "round_id": "1",
    "updated_at_ms": 1791601265000,
    "last_ok_at_ms": 1791601265000,
    "window_secs": 86400,
    "eligible_volume_cu": "5",
    "participants": 2,
    "thresholds": { "min_volume_cu": "1", "min_participants": 2, "max_carry_forward_secs": 259200 },
    "method": { "type": "winsorized_vwap", "alpha": null, "methodology": "METHODOLOGY.md" },
    "reference": { "value": "3.000000", "label": "synthetic demo data", "observed_at_ms": 1791601200000 }
  },
  "meta": { "chain_id": 46630, "indexed_block": 130100400, "indexed_at_ms": 1791601450000 }
}
```

Contoh `THIN` (sebelum trade): `"status":"THIN","value":null,"onchain_vwap":null,"last_ok_at_ms":null,"eligible_volume_cu":"0","participants":0`. Status `DISRUPTED`: `value` tetap diisi nilai terakhir tetapi konsumen wajib menganggapnya tidak valid ([D-15]).

### 3.6 E3 `GET /v1/index/{gpu}/history` (NICE)

Params: `from`, `to`, `interval` (`1m\|1h\|1d`, default `1h`) [APPROVED P3-28], `format=json|csv`. Data: `[{ "ts_ms", "value", "onchain_vwap", "status", "eligible_volume_cu" }]`, satu titik per interval (titik terakhir di interval, carry-forward kalau kosong). Sumber: `index_round` + `print`. Chart S6: garis indeks vs garis referensi (design §7.1 nice #3).

---

### 3.7 E4 `GET /v1/series`

Tabel S1: provider (badge verified), GPU + faktor, region, window, harga terakhir/CU, volume 24 jam, bond/CU, coverage, rekor delivered/default (design §7.2 S1).

| Param | Keterangan |
|---|---|
| `gpu`, `region`, `country`, `delivery_window`, `provider` | filter |
| `status` | `active` (default; belum `finalized`) \| `paused` \| `finalized` \| `all` |
| `sale_open` | `true\|false`: filter field `sale_open` (definisi di tabel field bawah), dihitung server dengan `now` dalam detik seperti P3-33 [APPROVED P3-39] |
| `expired` | `true\|false`: `true` = `now ≥ window_end` ∧ belum `finalized`. Antrian finalize (`windowEnd + grace`) tetap dicek klien/onchain karena `grace` dan `openRequestCount` menentukan [APPROVED P3-39] |
| `limit`, `cursor` | urutan default: `delivery_window` asc, lalu `series_id` asc [P3-20] |

**Field ringkas series** (dipakai juga di E5, E8)

| Field | Keterangan |
|---|---|
| `series_id`, `symbol`, `token` | |
| `gpu`, `gpu_type`, `factor` | |
| `region`, `country` | |
| `delivery_window`, `window_start_ms`, `window_end_ms` | |
| `primary_price`, `native_primary_price` | USD/CU dan USD/jam native |
| `last_price` | print TRADE terakhir, `null` kalau belum ada |
| `volume_24h_cu`, `volume_24h_usd` | print TRADE 24 jam terakhir (PRIMARY tidak dihitung) [APPROVED P3-29] |
| `bond_per_cu`, `coverage` | coverage per [D-34]; `null` tanpa referensi |
| `max_supply`, `sold_supply`, `total_supply` | |
| `paused`, `finalized`, `sale_open` | `sale_open` = tidak paused ∧ `now < window_end − leadTime` [D-39] ∧ `sold < max` |
| `institutional` | |
| `provider` | `{ "address", "verified", "status", "delivered_cu", "defaulted_cu", "voluntary_defaulted_cu" }` ([D-33]) |

**Contoh** (CONTOH DATA; series 1 dan 3 dipotong):

```json
{
  "data": [
    {
      "series_id": "4", "symbol": "CU-JKT-H100-2610", "token": "0xa4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4a4",
      "gpu": "H100", "gpu_type": "H100-SXM-80GB", "factor": "1.0000",
      "region": "AS", "country": "ID",
      "delivery_window": "2026-10", "window_start_ms": 1790812800000, "window_end_ms": 1793491200000,
      "primary_price": "3.000000", "native_primary_price": "3.000000",
      "last_price": "3.200000", "volume_24h_cu": "5", "volume_24h_usd": "16.000000",
      "bond_per_cu": "4.500000", "coverage": "1.50",
      "max_supply": "500", "sold_supply": "30", "total_supply": "12",
      "paused": false, "finalized": false, "sale_open": true, "institutional": false,
      "provider": { "address": "0x1111111111111111111111111111111111111111", "verified": true, "status": "ACTIVE", "delivered_cu": "8", "defaulted_cu": "10", "voluntary_defaulted_cu": "0" }
    },
    {
      "series_id": "2", "symbol": "CU-BTM-H200-2611", "token": "0xa2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2a2",
      "gpu": "H200", "gpu_type": "H200-SXM-141GB", "factor": "1.4000",
      "region": "AS", "country": "ID",
      "delivery_window": "2026-11", "window_start_ms": 1793491200000, "window_end_ms": 1796083200000,
      "primary_price": "4.060000", "native_primary_price": "5.684000",
      "last_price": null, "volume_24h_cu": "0", "volume_24h_usd": "0.000000",
      "bond_per_cu": "6.090000", "coverage": "2.03",
      "max_supply": "1400", "sold_supply": "0", "total_supply": "0",
      "paused": false, "finalized": false, "sale_open": true, "institutional": false,
      "provider": { "address": "0x7777777777777777777777777777777777777777", "verified": true, "status": "ACTIVE", "delivered_cu": "0", "defaulted_cu": "0", "voluntary_defaulted_cu": "0" }
    }
  ],
  "next_cursor": null,
  "meta": { "chain_id": 46630, "indexed_block": 130100400, "indexed_at_ms": 1791601450000 }
}
```

Catatan contoh: `bond_per_cu` series 2 = 1.5 × 4.06 (batas bawah bond floor, fiktif); `max_supply` 1,400 = 1,000 jam H200 (design §7.2 S2). Format `coverage` 2 desimal [P3-01]. Pembulatan rasio = [APPROVED P3-30]: dibulatkan ke bawah (konservatif).

### 3.8 E5 `GET /v1/series/{id}`

`{id}` = `series_id` atau simbol (P3-05). Isi = field ringkas E4 **plus**:

| Field | Keterangan | Sumber |
|---|---|---|
| `gpu_hours` | jam GPU native | 01 §5.1 |
| `terms` | `{ "ack_window_secs", "delivery_window_secs", "dispute_window_secs", "min_redemption_cu", "arbitrator", "spec_hash", "terms_hash" }` | design §7.2 S3 (redemption terms) |
| `bond` | `{ "deposited", "balance", "released", "slashed", "health", "finalized", "withdrawn" }`; `health = balance ÷ deposited` | design §7.2 S3 (bond health bar) |
| `redemption_stats` | `{ "requested_cu", "delivered_cu", "defaulted_cu", "open_requests", "locked_cu" }` | PK §5.10 (riwayat redemption/default) |
| `index` | `{ "status", "value" }` kelas GPU ini (dari E2) | |
| `created_at_ms`, `created_tx`, `explorer_url` | | G10 |

Trade tape dan order book **tidak** di-embed; frontend memanggil E1 (`?series=`) dan E6. Isi JSON `paron-spec/v1` dari `spec_hash` tidak di-serve karena lokasi penyimpanannya tidak dinyatakan sumber → [TBD T3-05].

**Contoh** (CONTOH DATA, hanya field tambahan; field E4 sama dengan contoh di atas):

```json
{
  "data": {
    "series_id": "4", "symbol": "CU-JKT-H100-2610",
    "gpu_hours": "500",
    "terms": { "ack_window_secs": 60, "delivery_window_secs": 60, "dispute_window_secs": 90, "min_redemption_cu": "1", "arbitrator": "0x8888888888888888888888888888888888888888", "spec_hash": "0x5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e5e", "terms_hash": "0x0000000000000000000000000000000000000000000000000000000000000000" },
    "bond": { "deposited": "2250.000000", "balance": "2169.000000", "released": "36.000000", "slashed": "45.000000", "health": "0.964", "finalized": false, "withdrawn": false },
    "redemption_stats": { "requested_cu": "18", "delivered_cu": "8", "defaulted_cu": "10", "open_requests": 0, "locked_cu": "0" },
    "index": { "status": "OK", "value": "3.200000" },
    "created_at_ms": 1791601200000,
    "created_tx": "0xc1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1",
    "explorer_url": "https://explorer.testnet.chain.robinhood.com/tx/0xc1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1"
  },
  "meta": { "chain_id": 46630, "indexed_block": 130100400, "indexed_at_ms": 1791601450000 }
}
```

Error: `404 NOT_FOUND` kalau series tidak ada.

### 3.9 E6 `GET /v1/series/{id}/orderbook`

| Param | Default | Keterangan |
|---|---|---|
| `depth` | 10 | jumlah level per sisi; maks = batas level aktif onchain [D-17] |

Field: `bids`/`asks` = array `{ "price", "qty_cu", "orders" }` (bids harga turun, asks harga naik), `best_bid`, `best_ask`, `spread`, `tick` (`"0.010000"`, 01 §6.7). Sumber: tabel `order` (status `OPEN`/`PARTIAL`). Fallback: frontend boleh membaca `OrderBook.getLevels` langsung (P3-12).

**Contoh** (CONTOH DATA, sebelum trade 03:01:05Z):

```json
{
  "data": {
    "series_id": "4", "symbol": "CU-JKT-H100-2610", "tick": "0.010000",
    "bids": [],
    "asks": [ { "price": "3.200000", "qty_cu": "5", "orders": 1 } ],
    "best_bid": null, "best_ask": "3.200000", "spread": null
  },
  "meta": { "chain_id": 46630, "indexed_block": 130100245, "indexed_at_ms": 1791601262000 }
}
```

Setelah trade: `"asks": []`, `"best_ask": null`.

### 3.10 E7 `GET /v1/orders`

Params: `maker` (wajib salah satu dari `maker`/`series`), `series`, `side` (`BID\|ASK`), `status` (`OPEN,PARTIAL` default), `limit`, `cursor`. Data: `[{ "order_id", "series_id", "symbol", "maker", "side", "price", "qty_initial", "qty_remaining", "status", "created_at_ms", "updated_at_ms", "tx_hash" }]`.

Contoh baris (CONTOH DATA, setelah trade): `{ "order_id": "1", "series_id": "4", "symbol": "CU-JKT-H100-2610", "maker": "0x3333333333333333333333333333333333333333", "side": "ASK", "price": "3.200000", "qty_initial": "5", "qty_remaining": "0", "status": "FILLED", "created_at_ms": 1791601260000, "updated_at_ms": 1791601265000, "tx_hash": "0xc4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4c4" }`.

---

### 3.11 E8 `GET /v1/accounts/{addr}/holdings`

Data: `[{ "series": <ringkas E4 tanpa provider>, "balance_cu", "redeemable_now", "open_requests", "locked_cu", "value_at_last_usd" }]`. `redeemable_now` = `window_start ≤ now < window_end` ∧ `balance ≥ min_redemption`. `locked_cu` = CU akun ini yang sedang di `RedemptionManager` (dari `redemption` terbuka). Saldo `0` disembunyikan kecuali `include_zero=true` [P3-31].

Contoh (CONTOH DATA, buyer `0x2222222222222222222222222222222222222222` di akhir demo): `{ "series": { "series_id": "4", "symbol": "CU-JKT-H100-2610", … }, "balance_cu": "2", "redeemable_now": true, "open_requests": 0, "locked_cu": "0", "value_at_last_usd": "6.400000" }`.

### 3.12 E9 `GET /v1/accounts/{addr}/statement` (src)

Statement per akun: trade, fee, redemption, default (design §10.2 G10), dengan link explorer. JSON = MUST, CSV = NICE (PK §6.6).

| Param | Keterangan |
|---|---|
| `from`, `to` | rentang waktu |
| `series` | filter |
| `kind` | filter, koma (nilai = `ledger_entry.kind`, P3-13) |
| `format` | `json\|csv` |
| `limit`, `cursor` | urutan **lama → baru** (statement) [P3-20] |

Field baris: `ts_ms`, `ts_iso`, `kind`, `series_id`, `symbol`, `req_id`, `order_id`, `usdc_delta`, `cu_delta`, `counterparty`, `tx_hash`, `explorer_url`. Plus `summary` (hanya JSON): `{ "usdc_in", "usdc_out", "fees_paid", "cu_bought", "cu_sold", "cu_redeemed", "default_payouts" }`.

**Contoh JSON** (CONTOH DATA, buyer `0x2222222222222222222222222222222222222222`):

```json
{
  "data": [
    { "ts_ms": 1791601240000, "ts_iso": "2026-10-10T03:00:40Z", "kind": "PRIMARY_BUY", "series_id": "4", "symbol": "CU-JKT-H100-2610", "req_id": null, "order_id": null, "usdc_delta": "-60.000000", "cu_delta": "20", "counterparty": "0x1111111111111111111111111111111111111111", "tx_hash": "0xc2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2", "explorer_url": "https://explorer.testnet.chain.robinhood.com/tx/0xc2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2" },
    { "ts_ms": 1791601290000, "ts_iso": "2026-10-10T03:01:30Z", "kind": "REDEMPTION_LOCK", "series_id": "4", "symbol": "CU-JKT-H100-2610", "req_id": "1", "order_id": null, "usdc_delta": "0.000000", "cu_delta": "-8", "counterparty": "0x9999999999999999999999999999999999999999", "tx_hash": "0xc6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6", "explorer_url": "https://explorer.testnet.chain.robinhood.com/tx/0xc6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6c6" },
    { "ts_ms": 1791601320000, "ts_iso": "2026-10-10T03:02:00Z", "kind": "REDEMPTION_BURN", "series_id": "4", "symbol": "CU-JKT-H100-2610", "req_id": "1", "order_id": null, "usdc_delta": "0.000000", "cu_delta": "0", "counterparty": "0x1111111111111111111111111111111111111111", "tx_hash": "0xc9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9", "explorer_url": "https://explorer.testnet.chain.robinhood.com/tx/0xc9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9" },
    { "ts_ms": 1791601380000, "ts_iso": "2026-10-10T03:03:00Z", "kind": "REDEMPTION_LOCK", "series_id": "4", "symbol": "CU-JKT-H100-2610", "req_id": "2", "order_id": null, "usdc_delta": "0.000000", "cu_delta": "-10", "counterparty": "0x9999999999999999999999999999999999999999", "tx_hash": "0xcacacacacacacacacacacacacacacacacacacacacacacacacacacacacacacaca", "explorer_url": "https://explorer.testnet.chain.robinhood.com/tx/0xcacacacacacacacacacacacacacacacacacacacacacacacacacacacacacacaca" },
    { "ts_ms": 1791601441000, "ts_iso": "2026-10-10T03:04:01Z", "kind": "DEFAULT_PAYOUT", "series_id": "4", "symbol": "CU-JKT-H100-2610", "req_id": "2", "order_id": null, "usdc_delta": "45.000000", "cu_delta": "0", "counterparty": "0x1111111111111111111111111111111111111111", "tx_hash": "0xcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcb", "explorer_url": "https://explorer.testnet.chain.robinhood.com/tx/0xcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcb" }
  ],
  "summary": { "usdc_in": "45.000000", "usdc_out": "60.000000", "fees_paid": "0.000000", "cu_bought": "20", "cu_sold": "0", "cu_redeemed": "18", "default_payouts": "45.000000" },
  "next_cursor": null,
  "meta": { "chain_id": 46630, "indexed_block": 130100400, "indexed_at_ms": 1791601450000 }
}
```

Konvensi `cu_delta`: CU dihitung keluar saat dikunci (`REDEMPTION_LOCK`), burn tidak mengubah lagi, refund mengembalikan (`REDEMPTION_UNLOCK`). Jadi Σ `cu_delta` = saldo bebas (P3-13). Buyer wallet 2 punya statement sendiri (`TRADE_BUY` 5 CU −16.000000, `FEE_PAID` −0.024000); agregasi per entity tidak didefinisikan sumber → [TBD T3-06].

**Contoh CSV** (provider `0x1111111111111111111111111111111111111111`, CONTOH DATA):

```csv
ts_ms,ts_iso,kind,series_id,symbol,req_id,order_id,usdc_delta,cu_delta,counterparty,tx_hash,explorer_url
1791601200000,2026-10-10T03:00:00Z,BOND_DEPOSIT,4,CU-JKT-H100-2610,,,-2250.000000,0,0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb,0xc1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1,https://explorer.testnet.chain.robinhood.com/tx/0xc1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1
1791601240000,2026-10-10T03:00:40Z,PRIMARY_PROCEEDS,4,CU-JKT-H100-2610,,,60.000000,0,0x2222222222222222222222222222222222222222,0xc2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2,https://explorer.testnet.chain.robinhood.com/tx/0xc2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2
1791601240000,2026-10-10T03:00:40Z,FEE_PAID,4,CU-JKT-H100-2610,,,-0.600000,0,0x5555555555555555555555555555555555555555,0xc2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2,https://explorer.testnet.chain.robinhood.com/tx/0xc2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2c2
1791601320000,2026-10-10T03:02:00Z,BOND_RELEASE,4,CU-JKT-H100-2610,1,,36.000000,0,0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb,0xc9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9,https://explorer.testnet.chain.robinhood.com/tx/0xc9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9c9
1791601441000,2026-10-10T03:04:01Z,BOND_SLASHED,4,CU-JKT-H100-2610,2,,0.000000,0,0x2222222222222222222222222222222222222222,0xcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcb,https://explorer.testnet.chain.robinhood.com/tx/0xcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcb
```

(Baris primer trader 03:00:50Z dihilangkan dari potongan ini.) `BOND_SLASHED` bernilai `usdc_delta` 0 karena USDC itu sudah keluar dari wallet provider saat `BOND_DEPOSIT`; jumlah slash (45.000000) ada di `/v1/series/{id}` `bond.slashed`. Apakah statement memuat kolom `amount` terpisah untuk baris non-kas = [APPROVED P3-32].

---

### 3.13 E10 `GET /v1/redemptions`

| Param | Keterangan |
|---|---|
| `holder`, `provider`, `series` | filter (minimal satu, kecuali `actionable` dipakai) |
| `state` | koma; nilai §1 termasuk `DEFAULTABLE` (turunan) |
| `actionable` | `CLAIM_DEFAULT` \| `FINALIZE` \| `RESOLVE_NO_RULING`: untuk keeper (stack §4.4: "Polls Ponder for redemptions past `ackDeadline`/`deliveryDeadline`") |
| `limit`, `cursor` | urutan default `requested_at` desc |

**Field redemption**

| Field | Keterangan |
|---|---|
| `req_id`, `series_id`, `symbol`, `holder`, `provider` | |
| `amount_cu`, `claim_usd` | `claim = bond_per_cu × amount` |
| `state` | state efektif (bisa `DEFAULTABLE`) |
| `stored_state` | state tersimpan onchain |
| `requested_at_ms`, `ack_deadline_ms`, `acknowledged_at_ms`, `delivery_deadline_ms`, `delivered_at_ms`, `dispute_deadline_ms`, `disputed_at_ms`, `ruling_deadline_ms`, `resolved_at_ms` | `null` kalau belum |
| `next_deadline_ms` | deadline aktif untuk countdown S4/S5 |
| `delivery_ref`, `receipt_hash` | [D-26] |
| `dispute_bond`, `ruling` | |
| `payout`, `bond_released` | |
| `voluntary`, `via_dispute`, `auto_finalized`, `default_caller`, `refunded_after_window`, `reopened_from_req_id`, `reopened_to_req_id` | [D-29], [D-33], [D-46], [D-56] |
| `actions` | aksi yang valid **sekarang**: `ACK`, `MARK_DELIVERED`, `DECLINE_AND_PAY` (provider); `CONFIRM`, `DISPUTE` (holder); `CLAIM_DEFAULT`, `FINALIZE`, `RESOLVE_NO_RULING` (siapa saja) |

Aturan waktu: `DEFAULTABLE` dan `actions` dihitung dengan `now` server dalam **detik** dan perbandingan ketat (`now_s > deadline`), sama dengan kontrak, supaya tombol tidak muncul sebelum blok bisa menerimanya [APPROVED P3-33; `now` = `meta.server_now_ms`, D-48]. Frontend tetap memanggil `stateOf(reqId)` onchain sebelum mengirim tx (01 §6.8). **[D-48]** `stateOf` lewat `eth_call` bisa memakai blok basi di chain sepi (06 T6-01), jadi hasil `NotDefaultable` dari simulasi **tidak** memblokir tombol kalau `server_now_s > deadline + 2`; tx tetap boleh dikirim dan kontrak yang memutuskan. Nama `RESOLVE_NO_RULING`/`FINALIZE` mengikuti fungsi 01 (`resolveNoRuling`, `finalizeRedemption` [01 P-47]).

**Contoh** (CONTOH DATA): `GET /v1/redemptions?holder=0x2222222222222222222222222222222222222222&state=DEFAULTABLE` pada 03:04:01Z (sebelum juri menekan "Claim default"):

```json
{
  "data": [
    {
      "req_id": "2", "series_id": "4", "symbol": "CU-JKT-H100-2610",
      "holder": "0x2222222222222222222222222222222222222222", "provider": "0x1111111111111111111111111111111111111111",
      "amount_cu": "10", "claim_usd": "45.000000",
      "state": "DEFAULTABLE", "stored_state": "REQUESTED",
      "requested_at_ms": 1791601380000, "ack_deadline_ms": 1791601440000,
      "acknowledged_at_ms": null, "delivery_deadline_ms": null, "delivered_at_ms": null,
      "dispute_deadline_ms": null, "disputed_at_ms": null, "ruling_deadline_ms": null, "resolved_at_ms": null,
      "next_deadline_ms": null,
      "delivery_ref": "0xd2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2d2", "receipt_hash": null,
      "dispute_bond": null, "ruling": null, "payout": null, "bond_released": null,
      "voluntary": null, "via_dispute": null, "auto_finalized": null, "default_caller": null, "refunded_after_window": null, "reopened_from_req_id": null, "reopened_to_req_id": null,
      "actions": ["CLAIM_DEFAULT"]
    }
  ],
  "next_cursor": null,
  "meta": { "chain_id": 46630, "indexed_block": 130100398, "indexed_at_ms": 1791601441000 }
}
```

Setelah `Defaulted`: `state`/`stored_state` = `DEFAULTED`, `payout` `"45.000000"`, `voluntary` `false`, `via_dispute` `false`, `default_caller` `"0x4444444444444444444444444444444444444444"`, `resolved_at_ms` 1791601441000, `actions` `[]`.

### 3.14 E11 `GET /v1/redemptions/{reqId}`

Objek E10 **plus** `timeline`: array `{ "event", "ts_ms", "tx_hash", "explorer_url", "args" }` urut waktu, dari semua event RM/BondVault/Arbitrator untuk `reqId` itu.

Contoh `timeline` req 1 (CONTOH DATA): `RedemptionRequested` 1791601290000 → `Acknowledged` 1791601293000 → `Delivered` 1791601300000 (`receipt_hash` `0xd1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1d1`) → `RedemptionFinalized` 1791601320000 (`bond_released` `"36.000000"`, `auto` `false`) → `BondReleased` 1791601320000.

### 3.15 E12 `GET /v1/providers/{addr}`

| Field | Keterangan |
|---|---|
| `address`, `entity_id`, `status`, `verified` | `verified` dari `participant`/gate |
| `reputation` | `{ "delivered_cu", "defaulted_cu", "voluntary_defaulted_cu", "disputes_lost", "strikes" }` ([D-33], P3-34) |
| `series` | array ringkas E4 (tanpa objek `provider`) |
| `bond` | total semua series `{ "deposited", "balance", "released", "slashed" }` |
| `proceeds` | `{ "gross", "fees", "net" }` primer (S5 "proceeds") |
| `open_requests` | jumlah redemption non-terminal (S5 "request masuk"; detail lewat E10 `?provider=`) |

Contoh (CONTOH DATA, akhir demo, provider Jakarta `0x1111…1111` yang memegang series 1 `CU-JKT-H100-2611` **dan** series 4 `CU-JKT-H100-2610`; seed per 05 §3.3): `"reputation": { "delivered_cu": "8", "defaulted_cu": "10", "voluntary_defaulted_cu": "0", "disputes_lost": 0, "strikes": 1 }`, `"bond": { "deposited": "5490.000000", "balance": "5409.000000", "released": "36.000000", "slashed": "45.000000" }`, `"proceeds": { "gross": "90.000000", "fees": "0.900000", "net": "89.100000" }`, `"open_requests": 0`.

Rincian per series untuk contoh di atas (`bond` = jumlah semua series milik provider; rincian per series dibaca dari E5 `/v1/series/{id}` → `bond`):

| Series | `deposited` | `balance` | `released` | `slashed` | `proceeds.gross` |
|---|---|---|---|---|---|
| 1 `CU-JKT-H100-2611` (720 CU × $4.50, belum terjual) | 3240.000000 | 3240.000000 | 0.000000 | 0.000000 | 0.000000 |
| 4 `CU-JKT-H100-2610` (500 CU × $4.50) | 2250.000000 | 2169.000000 | 36.000000 | 45.000000 | 90.000000 |
| **Total (E12)** | **5490.000000** | **5409.000000** | **36.000000** | **45.000000** | **90.000000** |

### 3.16 E13 `GET /v1/participants/{addr}`

Field: `address`, `verified`, `entity_id`, `role` (`{ "code": 2, "name": "Buyer" }`, [D-24]), `country`, `expiry_ms`, `source` (`EAS`\|`REGISTRY`, [D-23]/[D-04]), `attestation_uid`, `attester`, `revoked`, `explorer_url`. Tanpa EASScan di RH Testnet, data ini mengisi attestation drawer S1 (stack §3.3). Alamat yang tidak dikenal → `200` dengan `verified: false` (bukan 404) [APPROVED P3-35].

Contoh (CONTOH DATA): `{ "address": "0x2223222322232223222322232223222322232223", "verified": true, "entity_id": "0xe2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2e2", "role": { "code": 2, "name": "Buyer" }, "country": "ID", "expiry_ms": 1822953600000, "source": "EAS", "attestation_uid": "0xabababababababababababababababababababababababababababababababab", "revoked": false }`. `entity_id` sama dengan buyer utama ([D-31]).

### 3.17 E14 `GET /v1/gpus`

Data: `[{ "gpu", "gpu_type", "factor", "updated_at_ms" }]` dari `gpu_factor`. Nilai = faktor `ConversionTable` saat ini (design §1.1): H100 1.0000, H200 1.4000, B200 2.5000, GB200 3.5000, A100 0.6000 (→ 0.4500 kalau [D-09] disetujui), RTX4090 0.3500 (tidak di-seed kalau [D-09] disetujui). Untuk preview wizard S2 ("1,000 H200-hours = 1,400 CU").

### 3.18 E15 `GET /v1/reference/{gpu}` (NICE)

Field: `gpu`, `value` (USD per jam H100-equivalent, [D-34]), `unit`, `observed_at_ms`, `round_id`, `label` (wajib tampil di UI: "Spot reference (synthetic demo data)", design §10.5 #2), `synthetic: true`. 404 kalau feed tidak di-deploy atau tidak ada nilai. Contoh (CONTOH DATA): `{ "gpu": "H100", "value": "3.000000", "observed_at_ms": 1791601200000, "round_id": "1", "label": "synthetic demo data", "synthetic": true }`.

### 3.19 E16 `GET /v1/deliveries` (NICE)

Params: `series`, `gpu`, `provider`, `month` (`YYYY-MM`), `format=json|csv`. Data dari `delivery_record`: `{ "series_id", "symbol", "gpu", "month", "delivered_cu", "delivered_gpu_hours", "defaulted_cu", "default_count", "finalized_count", "default_rate" }`, `default_rate = defaulted_cu ÷ (delivered_cu + defaulted_cu)` [APPROVED P3-36]. Contoh (CONTOH DATA): series 4, `2026-10`: delivered 8 CU (8 jam), defaulted 10 CU, 1 default, 1 finalized, `default_rate` `"0.556"`.

### 3.20 E17 `GET /v1/disputes` (NICE, S7)

Params: `arbitrator`, `holder`, `provider` (alamat; boleh digabung, semuanya AND) [APPROVED P3-40], `status` (`open`\|`ruled`\|`all`). Data: `{ "req_id", "series_id", "holder", "provider", "dispute_bond", "opened_at_ms", "ruling_deadline_ms", "ruling", "signers", "receipt_hash", "delivery_ref" }`. Naskah demo tidak memuat dispute, jadi fixture memakai satu dispute fiktif yang ditandai.

### 3.21 E18 `GET /v1/health`

Data: `{ "chain_id", "chain": "robinhoodTestnet", "synced", "indexed_block", "head_block", "lag_blocks", "indexed_at_ms", "api_version": "v1" }`. Dipakai untuk go/no-go cek 5 ("Ponder syncs one event", design §11.3) dan pengecekan sebelum demo.

### 3.22 E19 `GET /v1/providers`

Daftar provider untuk direktori publik `/providers` (FULL) dan tabel status `/admin/providers` (MVP-27h). Sitemap §4.1 mencatat endpoint ini [TBD] dan sementara menurunkannya dari E4 + E12; E19 menggantikan cara itu [APPROVED P3-41].

Params: `status` (`ACTIVE`\|`SUSPENDED`\|`BANNED`\|`all`, default `all`), `verified` (`true`\|`false`), `limit`, `cursor`. Urutan default: `registered_at` naik.
Data (dari T8 `provider` + hitung T1 `series` + T9 `participant`): `{ "address", "entity_id", "status", "verified", "reputation": { "delivered_cu", "defaulted_cu", "voluntary_defaulted_cu", "disputes_lost", "strikes" }, "series_count", "active_series_count", "registered_at_ms", "updated_at_ms" }`. `active_series_count` = series milik provider yang belum `finalized`. Objek `reputation` sama dengan E12; rincian bond/proceeds tetap di E12.

Contoh (CONTOH DATA, t3; alamat BTM dari 05 §1, angka BTM fiktif): `[{ "address": "0x1111111111111111111111111111111111111111", "status": "ACTIVE", "verified": true, "reputation": { "delivered_cu": "8", "defaulted_cu": "10", "voluntary_defaulted_cu": "0", "disputes_lost": 0, "strikes": 1 }, "series_count": 2, "active_series_count": 2 }, { "address": "0x7777777777777777777777777777777777777777", "status": "ACTIVE", "verified": true, "reputation": { "delivered_cu": "0", "defaulted_cu": "0", "voluntary_defaulted_cu": "0", "disputes_lost": 0, "strikes": 0 }, "series_count": 1, "active_series_count": 1 }]`.

### 3.23 E20 `GET /v1/kyb/applications` [D-41]

Antrian pengajuan KYB untuk `/verifier` dan status pengajuan di `/onboarding/kyb`. 07 D-41 APPROVED opsi B (self-attestation EAS `KybApplication`), dengan D sebagai cadangan. Build solo mengerjakan D (penerbitan manual) dulu di S1 (sitemap §9.1); E20/E21 menyusul kalau waktu cukup, dan selama belum ada `/verifier` hanya menerbitkan manual (sitemap §4.7).

Params: `status` (`PENDING`\|`APPROVED`\|`EXPIRED`\|`REVOKED`\|`WITHDRAWN`\|`all`, default `PENDING`), `applicant`, `role` (kode), `country`, `limit`, `cursor`. Urutan default: `submitted_at` naik (antrian tertua dulu). Baris `valid = false` tidak dikembalikan kecuali `include_invalid=true`.
Data (T17): `{ "uid", "applicant", "entity_id", "role": { "code", "name" }, "country", "data_hash", "submitted_at_ms", "status", "approval": { "attestation_uid", "attester", "approved_at_ms", "expiry_ms" } | null, "tx_hash", "explorer_url" }`.
`status` diturunkan saat query [APPROVED P3-43]: `WITHDRAWN` kalau `withdrawn`; `REVOKED` kalau `approval_revoked`; `EXPIRED` kalau disetujui dan `approval_expiry ≤ now`; `APPROVED` kalau `approval_uid` ada; selain itu `PENDING`. Status "Ditolak" tidak ada di MVP (07 D-41: NICE).

Tidak ada data pribadi di respons: nama entitas dan dokumen tidak pernah onchain (07 D-41); `/verifier` read-only untuk publik tetap aman (sitemap §4.7 "tanpa data pribadi").

Contoh (CONTOH DATA; UID, waktu, entity, dan pemohon fiktif = wallet baru di alur "Coba sendiri", sitemap §4.10): `{ "uid": "0xc1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1c1", "applicant": "0x6666666666666666666666666666666666666666", "entity_id": "0xe6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6e6", "role": { "code": 2, "name": "Buyer" }, "country": "ID", "data_hash": "0xd6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6d6", "submitted_at_ms": 1791601500000, "status": "PENDING", "approval": null }`. `W-JUDGE` (`0x4444…4444`) tetap **tanpa** KYB di naskah panggung (05 §1).

### 3.24 E21 `GET /v1/kyb/applications/{uid}` [D-41]

Objek E20 **plus** `participant` (objek E13 untuk `applicant`, supaya verifier melihat status gate onchain saat ini) dan `history`: array `{ "event", "ts_ms", "tx_hash" }` (`Attested` pengajuan, `Attested` persetujuan, `Revoked`). 404 kalau `uid` bukan pengajuan `KybApplication`.

### 3.25 E22 `GET /v1/config-changes`

Log perubahan admin/governance dari T16 `config_change` (tabel dan handler sudah ada; sitemap §4.8 `/admin` mencatat "endpoint [TBD]").

Params: `contract` (nama), `event`, `from`, `to`, `limit`, `cursor`, `format=json|csv`. Urutan default: terbaru dulu.
Data: `{ "id", "contract", "contract_address", "event", "args", "ts_ms", "ts_iso", "tx_hash", "tx_from", "tx_to", "explorer_url" }`. `args` = argumen event ter-decode (jumlah string desimal, faktor 1e4 ditampilkan juga sebagai desimal, mis. `{ "gpu": "A100", "old_factor": "0.6000", "new_factor": "0.4500" }`).
Event yang masuk (semua ada di 01): `FactorSet`, `ArbitratorAllowlistUpdated`, `TreasuryUpdated`, `PrimaryFeeUpdated`, `TakerFeeUpdated`, `PanelUpdated`, `IndexParamsUpdated`, `AttesterUpdated`, `LabelUpdated`, `ProviderStatusChanged`, `SeriesPaused`, `SeriesUnpaused`, `GateUpdated`, `MinDelayChange` (T16).
Batasan [APPROVED P3-45]: event tidak membawa pengirim (`msg.sender`), jadi "siapa yang mengubah" hanya terlihat dari `tx_from`/`tx_to` transaksi (EOA proposer, Safe, atau Timelock); perubahan lewat Timelock tercatat di tx `execute`. `setDisrupted` memancarkan `IndexStatusChanged` yang sama dengan perubahan status otomatis, jadi disruption manual tidak dibedakan lewat field event. **T3-07 APPROVED (Jum 9 Okt ~09:40 WIB): tidak ada field tambahan di `IndexStatusChanged`**; UI/API boleh menandai "manual" kalau tx yang sama memanggil `setDisrupted` (dibaca dari `tx_to`/calldata), tanpa perubahan kontrak.

Contoh (CONTOH DATA; fiktif, sesuai skenario sitemap §4.8 "proposal faktor dijadwalkan sebelum demo, dieksekusi live setelah 5 menit" dan revisi faktor 07 D-09): `{ "contract": "ConversionTable", "event": "FactorSet", "args": { "gpu": "A100", "old_factor": "0.6000", "new_factor": "0.4500" }, "ts_ms": 1791601560000, "tx_hash": "0xf0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0" }`.

### 3.26 E23 `GET /v1/timelock/operations`

Antrian operasi `TimelockController` untuk `/admin/proposals` (Pending / Ready / Done / Cancelled, sitemap §4.8; demo live: satu eksekusi timelock dari UI, sitemap §8).

**Status: tidak lagi terblokir (Jum 9 Okt ~10:30 WIB).** 01 §7.1 kini mendaftar event OZ `CallScheduled`, `CallSalt`, `CallExecuted`, `Cancelled`, `MinDelayChange`, dan `TimelockController` masuk kontrak statis (§2.1). Sumber data = T19 `timelock_operation` (H42) [APPROVED P3-46]. Bentuk respons:

Params: `status` (`PENDING`\|`READY`\|`DONE`\|`CANCELLED`\|`all`), `target`, `limit`, `cursor`.
Data: `{ "operation_id", "target", "target_name", "value", "data", "decoded": { "function", "args" } | null, "predecessor", "salt", "delay_s", "scheduled_at_ms", "ready_at_ms", "status", "scheduled_tx", "executed_tx", "cancelled_tx" }`. `READY` dihitung saat query (`now ≥ ready_at_ms` dan belum dieksekusi), kebenaran = `isOperationReady` onchain (sitemap §4.8). `decoded` memakai ABI kontrak Paron yang dikenal; tidak dikenal → `null` [APPROVED P3-47].

Fallback kalau indexer tertinggal atau Timelock belum ter-index saat demo [APPROVED P3-48]: `/admin/proposals` membaca operasi dari daftar `operation_id` yang dicatat saat menjadwalkan (manifest demo untuk proposal yang dijadwalkan sebelum giliran demo, plus localStorage untuk proposal dari UI), lalu status dari `getTimestamp` / `isOperationPending` / `isOperationReady` onchain. Antrian Safe (tanda tangan "1/2") tetap dari Safe tx-service di RH, bukan dari API ini.

### 3.27 E24 `GET /v1/events` (FULL)

Stream event mentah untuk `/ops/events` dan jejak audit `/transparency/[seriesId]` (sitemap §4.1, §4.9; keduanya FULL). Sumber T18 `event_log` (H41).

Params: `contract`, `event`, `series`, `req_id`, `tx_hash`, `from`, `to`, `limit`, `cursor`, `format=json|csv`. Urutan default: terbaru dulu (`block_number` desc, `log_index` desc).
Data: `{ "id", "contract", "contract_address", "event", "args", "series_id", "req_id", "block_number", "ts_ms", "tx_hash", "tx_from", "explorer_url" }`.
Cakupan = hanya event yang di-index (01 §11 + daftar §2.3), kini termasuk event Timelock/AccessControl/`GateUpdated` (H42–H44). Tidak ada fixture (FULL).

---

## 4. Mock fixtures (frontend dan backend paralel)

Build plan menjadwalkan "S1 skeleton with mock data" di Jum 10:30–12, sebelum indexer jadi (design §7.3). Usulan [APPROVED P3-37]:

| Aturan | Isi |
|---|---|
| Lokasi | satu folder `fixtures/v1/` di repo (path final = doc 04) |
| Bentuk | Setiap file = **respons lengkap** (dengan envelope `data`/`meta`) persis seperti §3, termasuk CSV |
| Data | Hanya CONTOH DATA §3.3, dibagi per snapshot waktu |
| Snapshot | `t0` setelah listing + primer (03:00:50Z), `t1` setelah trade (03:01:05Z), `t2` default bisa diklaim (03:04:01Z sebelum klaim), `t3` akhir demo |
| Switch | Frontend memilih `mock` atau `live` lewat satu env var (nama di doc 04) |
| Kontrak | Fixture = sumber kebenaran bentuk respons sampai API live; perubahan field mengubah fixture + doc ini di PR yang sama |
| Validasi | Backend memvalidasi respons live terhadap bentuk fixture (schema dari fixture) sebelum frontend pindah ke `live` |

| File | Endpoint | Snapshot | Isi kunci |
|---|---|---|---|
| `prints.H100.limit3.json` | E1 | t1 | 3 print §3.4 |
| `prints.series-4.trade.csv` | E1 CSV | t1 | 1 baris trade |
| `prints.empty.json` | E1 | — | `data: []` |
| `index.H100.thin.json` | E2 | t0 | THIN, `value: null` |
| `index.H100.ok.json` | E2 | t1 | OK 3.200000 |
| `index.H100.disrupted.json` | E2 | — | DISRUPTED (fiktif, untuk badge) |
| `series.list.json` | E4 | t3 | 4 series [D-25] |
| `series.4.json` | E5 | t3 | bond 2169, coverage 1.50 |
| `orderbook.4.t0.json` / `orderbook.4.t1.json` | E6 | t0/t1 | ask 5 @ 3.20 / kosong |
| `orders.trader.json` | E7 | t1 | order #1 FILLED |
| `holdings.buyer.t0.json` / `holdings.buyer.t3.json` | E8 | t0/t3 | 20 CU / 2 CU |
| `statement.buyer.json`, `statement.provider.csv` | E9 | t3 | §3.12 |
| `redemptions.buyer.t2.json` | E10 | t2 | req 2 DEFAULTABLE |
| `redemptions.provider.t1.json` | E10 | 03:01:30Z | req 1 REQUESTED, `actions: ["ACK","DECLINE_AND_PAY"]` |
| `redemption.1.json`, `redemption.2.t3.json` | E11 | t3 | timeline |
| `provider.jkt.json` | E12 | t3 | 8 delivered / 10 defaulted |
| `participant.buyer2.json`, `participant.unknown.json` | E13 | — | verified / tidak |
| `gpus.json` | E14 | — | faktor [D-09] |
| `reference.H100.json` | E15 | — | 3.000000 sintetis |
| `deliveries.json` | E16 | t3 | §3.19 |
| `health.json` | E18 | — | synced |
| `providers.list.json` | E19 | t3 | JKT (8 / 10, strike 1) + BTM |
| `kyb.applications.pending.json`, `kyb.applications.empty.json` | E20 | — | 1 pengajuan PENDING (fiktif) / `data: []` [D-41] |
| `kyb.application.c1c1.json` | E21 | — | objek E20 + `participant` (`verified: false`) + `history` [D-41] |
| `config-changes.json` | E22 | — | `FactorSet` A100 (fiktif) + `ArbitratorAllowlistUpdated` + `PanelUpdated` dari fase 0 |
| `timelock.operations.json` | E23 | — | 1 operasi `setFactor` A100 `PENDING` → `READY` (bentuk final; X-8 selesai) |
| `error.400.json`, `error.404.json`, `error.503.json` | semua | — | §3.1 |

Konstanta fixture (alamat, hash) = nilai fiktif §3.3. Setelah `DeployAll` + seed (doc 05) jalan di anvil/testnet, fixture boleh diganti hasil rekaman API live, tetapi angka produk (500, 3.00, 2250, 20, 3.20, 45) harus tetap sama.

---

## 5. Ketergantungan pada keputusan 07

Semua D-xx di bawah **APPROVED** (Jum 9 Okt 2026 ~09:40 WIB) dengan opsi rekomendasi; kolom kanan dipertahankan sebagai catatan kalau keputusan dibuka ulang. D-13/D-36 tim solo: "EOA tim" = EOA milik Fatih.

| D-xx | Bagian 03 yang terdampak | Kalau keputusan berbeda |
|---|---|---|
| D-02 | `delivery_window` `YYYY-MM`, filter `delivery_window`, E16 `month` | Window bebas → `delivery_window` jadi rentang tanggal |
| D-06 | E15, `reference` di E2, `coverage` | Tanpa `ReferenceFeed`: `coverage`/`reference` = `null` |
| D-09 | E14, `gpu` enum | Faktor A100 / RTX4090 berubah di fixture |
| D-10 | Base URL (APPROVED ~10:33 WIB: URL bawaan host) | Domain menyusul → hanya base URL berubah |
| D-13 | `FEE_RECEIVED` ke alamat treasury | Kalau fee ditarik (bukan push), perlu event + `ledger_entry` withdraw |
| D-14 | H04, H14, `finalized`/`withdrawn` | Pemilik fungsi lain → kontrak sumber event berubah |
| D-15 | `status` 3 nilai, `thresholds`, `thin`, fixture DISRUPTED | Dua status: hapus `DISRUPTED` |
| D-16 | `value` vs `onchain_vwap`, `method.alpha` | Winsorized onchain → `value = onchain_vwap` |
| D-17 | E6 `depth` maks | 10 vs 20 |
| D-19 | Contoh series 4 `CU-JKT-H100-2610`. Penamaan live digantikan D-82 (`CU-JKT-H100-2611`); baris ini tetap catatan historis | Kalau tetap `2611`: contoh redemption tidak mungkin terjadi di Okt |
| D-20 | `terms` (60/60/90 dtk) dan timeline contoh | — |
| D-21, D-37 | `ledger_entry` dispute bond, E17 | Tujuan dispute bond menentukan baris statement |
| D-22 | Hampir seluruh `print` (entity, `nativePrice`, `takerFee`, `eligible`) | Tanpa event diperluas: Ponder harus `readContract`/lookup per print, `eligible` dihitung offchain |
| D-23, D-04 | H34–H36, `participant.source` | Gate tunggal → hanya satu jalur handler |
| D-24 | `role` codes | |
| D-25 | Daftar series di fixture | 3 vs 4 series |
| D-26 | `receipt_hash` saja | EAS receipt → tambah `receipt_uid` |
| D-29 | `refunded_after_window` (info; mekanisme D-46) | |
| D-31 | `taker_entity` PRIMARY via `participant`; contoh entity wallet 2 | Tanpa KYB di primer → entity PRIMARY bisa `0x0` |
| D-33 | `voluntary_defaulted_cu`, `strikes`, aksi `DECLINE_AND_PAY` | Satu counter saja |
| D-34 | `coverage` | Rumus lain → angka 1.50 berubah |
| D-35 | `eligible`, `ineligible_reason` | Opsi B (skip resting) → `SAME_ENTITY` tidak pernah muncul juga, tetapi order resting bisa dibatalkan → event `OrderCancelled` dari matching |
| D-38 | `locked_supply` lewat `Transfer` ke RM | Opsi approve: sama untuk indexer |
| D-39 | `sale_open` | |
| D-54 (APPROVED ~11:05 WIB, hackathon) | T9 `participant.attester` = `W-VERIFIER`; E22/E23 `tx_from` proposer bisa `W-ADMIN`, executor siapa saja | Tidak ada perubahan schema |
| D-41 (APPROVED B, D cadangan) | T17, H40, E20, E21 | Opsi A (tabel tulis di API) → endpoint tulis baru, melanggar §3.1 "semua GET"; opsi D → E20/E21 dihapus |
| D-13, D-36 | E22 `tx_from`/`tx_to` (Safe vs EOA proposer) | Fallback opsi B (EOA proposer) → `tx_from` = EOA tim |

**Keputusan audit PE yang menyentuh 03 (07 §11; APPROVED Fatih ~11:12 WIB, 07 §10.5):**

| D-xx | Bagian 03 | Kalau dibuka ulang |
|---|---|---|
| D-46 | H25, H45 (baru), E11 timeline | H45 dihapus; `refunded_after_window` tetap |
| D-48 | §2.4 `DEFAULTABLE`, §3.1 `meta.server_now_ms`, aturan waktu E10 | Field baru dihapus; aturan P3-33 lama |
| D-49 | H44 sumber + `SeriesFactory` | H44 tetap tiga kontrak |
| D-51 | H16 (catatan) | T5-06 kembali TBD |
| D-53 | H46 (baru) | H46 dihapus |
| D-56 | H24 `default_caller` | T5-08 kembali TBD |
| D-58 | §0 hosting | Hosting tanpa blok khusus di 08 |

---

## 6. Register usulan P3-xx (APPROVED Jum 9 Okt 2026 ~09:40 WIB)

Semua P3-01..P3-50 disetujui. Catatan sinkronisasi: P3-34 digantikan field `strikes` di event (X-1); P3-46 sekarang = tabel T19 + H42; P3-48 tetap sebagai fallback.

| ID | Usulan | § |
|---|---|---|
| P3-01 | Jumlah = string desimal; USDC 6 desimal; CU dinormalisasi; rasio (coverage) 2 desimal | §1 |
| P3-02 | `ts_iso` di samping `ts_ms` | §1 |
| P3-03 | String kanonik GPU selain H100 (`H200-SXM-141GB`, `B200-SXM-180GB`, `GB200-NVL72`, `A100-SXM-80GB`) + nama pendek API | §1 |
| P3-04 | Urutan enum `uint8 continent` → kode benua (`AF, AN, AS, EU, NA, OC, SA`), terkait 01 P-06 | §1 |
| P3-05 | Path series terima `series_id` atau simbol | §1 |
| P3-06 | ID print `{chain_id}-{tx_hash}-{log_index}` | §2.2 |
| P3-07 | Alamat lowercase | §1 |
| P3-08 | Clone `CUToken` di-index lewat pola factory dari `SeriesCreated.token` | §2.1 |
| P3-09 | `chain_id` masuk PK hanya kalau multi-chain | §2.2 |
| P3-10 | `ineligible_reason` = `PRIMARY` \| `SAME_ENTITY` \| `UNVERIFIED` | §2.2 |
| P3-11 | `thin` per print = `index_status != OK` saat print | §2.2 |
| P3-12 | Order book dari indexer; fallback `getLevels` onchain | §2.2, §3.9 |
| P3-13 | Jenis `ledger_entry` + konvensi `cu_delta` | §2.2, §3.12 |
| P3-14 | Bulan `delivery_record` = bulan penyelesaian (UTC) | §2.2 |
| P3-15 | Sisi taker di API `BUY`/`SELL` (enum kontrak `Bid`/`Ask`) | §2.2 |
| P3-16 | `PrintRecorded` tidak dipakai indexer | §2.3 |
| P3-17 | MockUSDC tidak di-index | §2.3 |
| P3-18 | Detail CSV: RFC 4180, header = nama field, `null` = sel kosong | §3.1 |
| P3-19 | Envelope `data`/`next_cursor`/`meta` | §3.1 |
| P3-20 | Pagination cursor, `limit` 100/1000, urutan default per endpoint | §3.1 |
| P3-21 | `from`/`to` terima ms atau ISO; `to` eksklusif | §3.1 |
| P3-22 | CORS `*` | §3.1 |
| P3-23 | REST `/v1` = kontrak stabil; GraphQL bawaan tanpa jaminan | §3.1 |
| P3-24 | Format error + kode | §3.1 |
| P3-25 | Data yang dibaca frontend langsung dari kontrak (bukan API) | §3.2 |
| P3-26 | Alamat `maker`/`taker` ikut di print publik | §3.4 |
| P3-27 | Strip S1 = `/v1/index/H100` (tanpa indeks gabungan) | §3.5 |
| P3-28 | `interval` history `1m\|1h\|1d` | §3.6 |
| P3-29 | Volume 24 jam hanya print TRADE | §3.7 |
| P3-30 | Rasio dibulatkan ke bawah | §3.7 |
| P3-31 | Holding nol disembunyikan default | §3.11 |
| P3-32 | Kolom `amount` untuk baris statement non-kas (`BOND_SLASHED`) | §3.12 |
| P3-33 | `DEFAULTABLE`/`actions` dihitung per detik, perbandingan ketat | §3.13 |
| P3-34 | ~~`strikes` diturunkan dari `Defaulted`~~ → digantikan: `strikes` dibaca dari `ReputationUpdated` (01 §6.1, X-1); turunan hanya untuk rekonsiliasi | §2.2 |
| P3-35 | Participant tidak dikenal → `200 verified:false` | §3.16 |
| P3-36 | Rumus `default_rate` | §3.19 |
| P3-37 | Aturan mock fixture (§4) | §4 |
| P3-38 | Filter `account` di E1 (maker atau taker), dari sinkron sitemap | §3.4 |
| P3-39 | Filter server `sale_open` dan `expired` di E4, dari sinkron sitemap | §3.7 |
| P3-40 | Filter `holder`/`provider` di E17, dari sinkron sitemap | §3.20 |
| P3-41 | E19 `GET /v1/providers` (daftar dari T8 + hitung series), tier MVP karena `/admin/providers` | §3.22 |
| P3-42 | Pengajuan KYB = T17 dari EAS `KybApplication`; validasi `attester == recipient`; persetujuan dihubungkan lewat `refUID` `ParticipantVerified`; E20/E21 | §2.2, §2.3, §3.23–3.24 |
| P3-43 | Aturan turunan `status` pengajuan KYB (PENDING/APPROVED/EXPIRED/REVOKED/WITHDRAWN; tanpa "Ditolak" di MVP) | §3.23 |
| P3-44 | E22 `GET /v1/config-changes` di atas T16 yang sudah ada | §3.25 |
| P3-45 | "Siapa yang mengubah" di log admin = `tx_from`/`tx_to`, karena event tidak membawa pengirim | §3.25 |
| P3-46 | E23 antrian Timelock: tabel T19 + handler H42 (01 §7.1 sudah menambahkan event) | §3.26 |
| P3-47 | `decoded` calldata operasi Timelock memakai ABI kontrak Paron; tidak dikenal → `null` | §3.26 |
| P3-48 | Fallback `/admin/proposals` kalau E23 tertinggal: daftar `operation_id` dari manifest demo + localStorage, status dari view onchain | §3.26 |
| P3-49 | T18 `event_log` + H41 + E24 (salinan mentah semua event yang di-index), FULL | §2.2, §2.3, §3.27 |
| P3-50 | Path baru memakai kebab-case/segmen (`/v1/config-changes`, `/v1/kyb/applications`, `/v1/timelock/operations`); field tetap `snake_case` | §3.2 |

## 7. TBD baru (T3-xx)

Setelah approval (Jum 9 Okt ~09:40 WIB): **T3-02** selesai (`gpu_count = null`, X-7), **T3-07** APPROVED (tanpa field tambahan), **T3-08** selesai (04 §7.3 + DP-2). Masih TBD: T3-01, T3-03, T3-04, T3-05, T3-06 (lihat 07 §10).

| ID | Item | Kenapa |
|---|---|---|
| T3-01 | Konfigurasi finality/reorg Ponder dan kebutuhan RPC archive untuk sync dari start block | Sumber hanya menyebut soft confirmation ~100 ms (⚠ belum diukur) dan RPC publik non-archive |
| T3-02 | `gpu_count` (tuple OCPI) | Tidak bisa diturunkan dari CU; mungkin dari `paron-spec/v1` atau ditiadakan |
| T3-03 | Caching dan rate limit API | Tidak dinyatakan sumber |
| T3-04 | Nilai α winsorization (dan parameter indeks prod) | Belum ada angka; ditulis di `METHODOLOGY.md` ([D-15], [D-16]) |
| T3-05 | Tempat menyimpan/menyajikan JSON `paron-spec/v1` di balik `spec_hash` | Tidak dinyatakan sumber |
| T3-06 | Statement per entity KYB (gabungan beberapa wallet) | G10 hanya menyebut "per-account" |
| T3-07 | Membedakan disruption manual (`setDisrupted`) dari perubahan status otomatis di log admin | Keduanya memancarkan `IndexStatusChanged` (01 §6.10); perlu field tambahan di event atau dibiarkan |
| T3-08 | UID schema `KybApplication` di manifest (`infra.json.schemas`, 04 §7.3) dan kapan didaftarkan | **Selesai:** 04 §7.3 `schemas.KybApplication`, didaftarkan di DP-2 (setelah `ParticipantVerified`, sebelum seed) |

---

## 8. Divergensi / catatan terhadap 01 dan 07

| # | Temuan | Rekomendasi |
|---|---|---|
| X-1 | 01 §6.1: `ReputationUpdated` tidak membawa `strikes` padahal 01/07 D-33 menambah counter `strikes` | **RESOLVED** (Jum 9 Okt): 01 §6.1 menambah `uint32 strikes`; H08 membacanya |
| X-2 | 01 §6.8 tabel fungsi menulis bentuk singkat `RedemptionFinalized(reqId, false/true)`, sedangkan daftar event 01 memakai `RedemptionFinalized(reqId, seriesId, amount, bondReleased, auto_)` | **RESOLVED** (Jum 9 Okt): tabel fungsi 01 §6.8.1 kini memakai bentuk lengkap |
| X-3 | Enum kontrak `Side { Bid, Ask }` vs API `side` `BUY`/`SELL` (sisi taker) | Pemetaan saja (P3-15); tidak mengubah 01 |
| X-4 | `PrintRecorded` (01 §6.10) tidak dibutuhkan indexer karena `Trade` sudah lengkap [D-22] | **RESOLVED**: 01 §6.10 menandai `PrintRecorded` opsional; H28 tetap mengabaikannya |
| X-5 | Stack §4.2 menulis `status: OK\|THIN`; 03 mengikuti 07 D-15 (tiga status) | Sudah tercatat di 07 (K-03), bukan divergensi baru |
| X-6 | Design menyebut H200 "$5.69/hour → $4.06/CU"; dengan order per CU di tick 0.01, `nativePrice` = 5.684 | Hanya pembulatan narasi; API menampilkan 5.684000 |
| X-7 | Tuple OCPI menyebut "GPU count" dan "ms timestamp"; Paron hanya punya presisi detik dan tanpa jumlah GPU | `ts_ms` = detik × 1000; `gpu_count: null` (T3-02) |
| X-8 | Sitemap §4.8 `/admin/proposals` (MVP-27h, demo live) butuh daftar operasi Timelock, tetapi 01 tidak mendaftar event `TimelockController` dan alamatnya tidak ada di kontrak statis Ponder | **RESOLVED** (Jum 9 Okt): 01 §7.1/§11 mendaftar event OZ `TimelockController` 5.6.1 + Timelock = kontrak statis; 03 menambah T19, H42, E23 aktif |
| X-9 | Sitemap `/admin/roles` (FULL) dan `/verifier` (allowlist `VERIFIER_ROLE` di `RegistryGate`) butuh event grant/revoke role; `setGate` (P-64) juga tanpa event di 01 | **RESOLVED**: 01 §7.1 mendaftar `RoleGranted`/`RoleRevoked`/`RoleAdminChanged` dan `GateUpdated` (P-64); 03 menambah T20, H43, H44 |
| X-10 | Schema EAS `KybApplication` (07 D-41 opsi B) belum ada di 01 §6.13 maupun 04 DP-2 | **RESOLVED**: 01 §6.13 mencatat schema `KybApplication` (bukan kontrak); 04 §7.3 `schemas` + DP-2 (T3-08) |
| X-11 | AUDIT SC-4: 03 §2.4 (jam server) vs 05 P5-16 (blok terakhir) vs 06 §10 (blok + ekstrapolasi) | **Selesai, D-48 APPROVED:** satu aturan jam + `meta.server_now_ms` |
| X-12 | AUDIT SC-5: H44 tidak mencakup `SeriesFactory` padahal factory memegang `gate` | **Selesai, D-49 APPROVED:** H44 + `SeriesFactory` |
| X-13 | AUDIT SC-18: H16 mengasumsikan `qty` = bagian yang di-rest, 01 belum menetapkan | **Selesai, D-51 APPROVED:** 01 §6.7 menetapkan; H16 tidak berubah |
| X-14 | AUDIT SC-2: `refunded_after_window` (D-29) bergantung pada jalur request ulang yang tidak bisa jalan | **Selesai, D-46 APPROVED:** reopen di RM + H45; field jadi info |
| X-15 | AUDIT §5 #3 / 05 T5-08: `default_caller` lewat putusan | **Selesai, D-56 APPROVED:** alamat arbitrator |
| X-16 | AUDIT SC-10: event `IndexUpdateFailed` baru | **Selesai, D-53 APPROVED:** H46 NICE |
| X-17 | AUDIT EN-4: hosting Ponder tidak terjadwal | **Selesai, D-58 APPROVED:** blok hosting di 08 (L4) |

Status Jum 9 Okt ~10:30 WIB: X-1, X-2, X-4, X-8, X-9, X-10 RESOLVED lewat sinkronisasi 01/04; X-3, X-5, X-6, X-7 hanya catatan pemetaan (tidak perlu aksi). Selain itu tidak ada divergensi lain: nama event, tipe, satuan (USDC 6, CU 18, faktor 1e4), state redemption, kode role, dan simbol series mengikuti 01 dan 07.
