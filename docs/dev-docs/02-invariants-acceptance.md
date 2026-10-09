# Paron: invariant, acceptance criteria, dan daftar test (dev doc 02)

Status: **APPROVED-SYNCED, spec saja.** Keputusan 07 APPROVED oleh Fatih (Jum 9 Okt 2026 ~09:40 WIB); disinkronkan dengan 01 Jum 9 Okt ~10:30 WIB (cadangan: `.bak-2026-10-09-pre-approval/`). Hanya nama test + maksud satu baris + desain handler dalam prosa. **Tidak ada body Solidity**; kode test baru ditulis mulai Jumat 9 Okt 09:00 WIB. Disusun Kamis 8 Okt 2026, ~21:30 WIB.

**Catatan Jum 9 Okt 2026 ~11:05 WIB (audit Principal Engineer):** ditambah 11 test Foundry, 1 invariant (INV-OB-9) dan 1 cek API (API-17) untuk D-45..D-56 (07 §11). D-54 APPROVED ~11:05 WIB (fixture attester `W-VERIFIER`, assert executor terbuka; tidak menambah jumlah test). Cadangan: `.bak-2026-10-09-pre-audit/`.

**Changelog Jum 9 Okt 2026 ~11:15 WIB:** Fatih meng-APPROVE D-45..D-53, D-55, D-56, D-58 (~11:12 WIB, 07 §10.5). Semua test/invariant/cek audit kini **spec** (penanda usulan diganti tag `[D-xx]`). Yang digantikan: `test_RefundAfterWindowEnd_AllowsReRequestInGrace` → `test_RefundAfterWindowEnd_ReopensRequestInGrace` (D-46); klausa `declineAndPay` setelah deadline (D-47); `ARBITER_ROLE` di test mode Safe (D-55c). T5-06 dan T5-08 terjawab (D-51, D-56). Rekap final §6: **75 invariant / 40 MUST / 80 SHOULD / 27 NICE / 147 test Foundry; API 8/8/1 = 17** (dihitung ulang dari tabel). Cadangan: `.bak-2026-10-09-pre-1112/`.

**Sumber:**
- dokumen kanonik: `paron-design.md` **(design §x)**, `paron-stack.md` **(stack §x)**, `paron-product-knowledge.md` **(PK §x)**;
- konsistensi dengan **01** (fungsi, error, event, transisi T1–T13, invariant I1–I6 di 01 §10), **03** (endpoint E1–E18), **05** (langkah panggung S-01..S-13, langkah dispute D-01..D-04 di 05 §3.6, angka akhir) dan **07** (D-xx, semuanya APPROVED Jum 9 Okt ~09:40 WIB kecuali D-10 yang tidak memengaruhi test).

**Legenda:**
- **[D-xx]** (dalam kurung siku) = bergantung keputusan 07 (kini **APPROVED**, Jum 9 Okt ~09:40 WIB). Tanpa kurung, "D-01..D-04" / "D-04a" = **langkah dispute 05 §3.6**, bukan keputusan. **[APPROVED P2-xx]** = usulan dokumen ini, disetujui bersama rekomendasi 07 (Jum 9 Okt ~09:40 WIB). **[T2-xx]** = angka kerja yang disetujui, disetel ulang saat build.
- **Prioritas** (selaras MVP 27 jam, design §7.1, stack §4.6):
  - **MUST** = disebut sebagai test wajib di design §7.1 / invariant wajib di stack §4.6, atau menjaga angka/adegan demo;
  - **SHOULD** = revert/akses/batas yang mencegah bug memalukan, ditulis kalau MUST selesai;
  - **NICE** = setelah freeze atau tidak sempat tidak apa-apa.
- **Jenis:** `unit` (satu kontrak, mock), `integ` (beberapa kontrak nyata, lokal), `fuzz` (input acak + `bound`), `invariant` (handler stateful), `fork` (anvil fork RH Testnet / Arbitrum Sepolia, stack §4.6), `e2e` (urutan 05).
- **Konvensi nama:** `test_<Perilaku>`, `test_RevertWhen_<Kondisi>`, `testFuzz_<Perilaku>`, `invariant_<Sifat>`, `testFork_<Perilaku>`. File test per kontrak (`ProviderRegistry.t.sol`, …), invariant di `invariant/`, e2e di `e2e/`. Struktur folder final = doc 04.
- **Satuan:** USDC 6 desimal, CU 18 desimal, faktor 1e4, harga = USDC raw per 1 CU (01 §1). Angka contoh = 05 §3.

---

## 0. "2 jam pertama": shortlist test MUST

Jadwal build: Registry/ConversionTable/Factory/BondVault/CUToken di Jum 10:30–12, PrimarySale + RedemptionManager + tests di 12–16, OrderBook/PrintIndex/PanelArbitrator + invariant tests di 16–20 (design §7.3).
- Shortlist ini ditulis begitu `RedemptionManager` bisa dikompilasi (≈ Jum 13:00–15:00).
- `PanelArbitrator` diganti **mock `IArbitrator`** (memanggil `onRuling` langsung), supaya test dispute tidak menunggu slot 16–20.
- Fixture bersama: `setUp` membuat 2 provider terverifikasi (gate mock), 2 series H100 (500 CU @ $3.00, bond/CU $4.50, window terbuka, ack 60/delivery 60/dispute 90 dtk [D-19, D-20]), dan buyer dengan mUSDC.

| # | Test | Jenis | Membuktikan | Sumber |
|---|---|---|---|---|
| 1 | `test_CreateSeries_LocksFullBond` | integ | 500 CU × $4.50 → `bondOf.balance == 2_250_000_000`, USDC provider berkurang sama persis | design §7.4, I1 |
| 2 | `test_RevertWhen_BondBelowFloor` | unit | `bondPerCU < 1,5 × primaryPrice` → `BondBelowFloor` | design §3 #3 |
| 3 | `test_RevertWhen_BuyWithZeroMaxCost` | unit | `maxCost == 0` → `MaxCostRequired` ("`maxCost` required", design §7.1) | design §7.1 |
| 4 | `test_Buy_SplitsFeeAndMints` | integ | beli 20 CU: buyer −60.000000, provider +59.400000, treasury +0.600000, CU +20e18 | 05 S-02 |
| 5 | `test_HappyPath_ConfirmReleasesBondAndBurns` | integ | redeem 8 → ack → delivered → confirm: burn 8 CU, bond −36.000000 ke provider, `deliveredCU = 8e18` | design §7.1 "Happy path" |
| 6 | `test_ClaimDefault_AfterMissedAck` | integ | redeem 10, lewat `ackDeadline`, **orang lain** klaim: holder +45.000000, pemanggil +0 | design §7.1 "Missed ack → default" |
| 7 | `test_ClaimDefault_AfterMissedDelivery` | integ | ack lalu lewat `deliveryDeadline` → default dibayar | design §7.1 |
| 8 | `test_RevertWhen_ClaimDefaultTwice` | integ | klaim kedua revert; payout tepat sekali | stack §4.6 inv (6) |
| 9 | `test_RevertWhen_ClaimDefaultAtDeadline` | integ | `now == ackDeadline` → `NotDefaultable` (perbandingan ketat `>`) | 01 T3 |
| 10 | `test_Dispute_RulingDelivered_FinalizesAndPaysDisputeBond` | integ (mock arbitrator) | T10: release ke provider + dispute bond ke provider [D-21] | design §7.1 "Dispute → both rulings" |
| 11 | `test_Dispute_RulingNotDelivered_DefaultsAndRefundsDisputeBond` | integ (mock arbitrator) | T11: slash ke holder, dispute bond kembali, `disputesLost++` | design §7.1 |
| 12 | `test_ResolveNoRuling_RefundsWithoutSlash` | integ | T12: CU + dispute bond kembali, bond tidak berubah | design §7.1 "Arbitrator timeout" |
| 13 | `test_RevertWhen_TransferAfterWindowEnd` | unit | transfer CU setelah `windowEnd` → `TransfersClosed` | design §7.1 "Expiry blocks transfers" |
| 14 | `test_BondIsolation_DefaultTouchesOnlyOwnSeries` | integ | default di series A tidak mengubah `bondOf(B)` sama sekali | design §7.1, stack §4.6 inv (2) |
| 15 | `test_RevertWhen_SetFactorNotTimelock` | unit | `setFactor` dari non-Timelock revert; lewat Timelock butuh delay | design §7.1 "Factor timelock" |
| 16 | `invariant_BondCoversSupply` (versi awal, handler 4 aksi: buy/request/confirm/claimDefault) | invariant | `bond[s] ≥ bondPerCU × totalSupply[s]` [D-18] | design §7.1, stack §4.6 inv (1) |

Kalau waktu tinggal 1 jam: #1, #3, #5, #6, #8, #13, #14, #16 (inilah yang langsung muncul di pitch "code enforces").

---

## 1. Konvensi invariant

| Hal | Aturan | Status |
|---|---|---|
| Bentuk invariant bond | Bentuk kerja D-18: `bondOf(s).balance ≥ bondPerCU × totalSupply(s) / 1e18` selama series belum `finalized`. `totalSupply` **sudah** memuat CU terkunci di RM, jadi tidak ditambah `locked` lagi | [D-18], 01 P-36 |
| Bentuk akuntansi persis | Sebelum `withdrawn`: `balance = deposited − released − slashed` (field `SeriesBond` 01 §6.5); sesudah: `balance = 0`. Juga `released + slashed = Σ claim` request terminal yang dibayar dari bond | [APPROVED P2-01] |
| Pembulatan klaim | `claim = floor(bondPerCU × amount / 1e18)`. Floor membuat sisa debu tetap di vault, jadi invariant bond tidak pernah terlanggar oleh pembulatan. 01 belum menyebut arah pembulatan | [APPROVED P2-02] |
| Pembulatan biaya | `cost = ceil(qty × primaryPrice / 1e18)` (01 §6.6), `fee = floor(cost × bps / 10_000)`. Notional fill order book: `ceil` untuk taker beli, `floor` untuk taker jual (protokol tidak pernah kurang bayar) | cost = 01; sisanya [APPROVED P2-03] |
| `DEFAULTABLE` | Tidak pernah disimpan; hanya `stateOf()` | 01 P-21 |
| Waktu | Semua deadline dibandingkan dengan `block.timestamp` dalam detik. "Lewat deadline" = `>` ketat; "dalam deadline" = `≤` | 01 §6.8 |

---

## 2. Per kontrak

Format tiap subbagian: **Invariant** (ID `INV-<K>-n`), **Acceptance** (Given/When/Then singkat, ID `AC-<K>-n`), **Test** (tabel). Nama error/event = 01 §6.

### 2.1 `ProviderRegistry` (REG)

**Invariant**
- INV-REG-1: `status` hanya `None → Active` lewat `registerProvider` oleh akun dengan `gate.isVerified = true`; transisi lain hanya lewat `setStatus` (`ADMIN_ROLE`). **[D-45]** juga `participantOf(a).role == 1`.
- INV-REG-2: `deliveredCU`, `defaultedCU`, `voluntaryDefaultedCU`, `disputesLost`, `strikes` tidak pernah turun, dan hanya berubah karena panggilan `RedemptionManager` [D-33].
- INV-REG-3: `isListable(p) ⇒ status == Active ∧ gate.isVerified(p)`. **[D-45]** `∧ participantOf(p).role == 1`.

**Acceptance**
- AC-REG-1: Given akun terverifikasi role 1 [D-24], When `registerProvider()`, Then status `Active` dan `ProviderRegistered(provider, entityId)`.
- AC-REG-2: Given provider `Suspended`, When `createSeries`, Then revert `ProviderNotListable`.

| Test | Jenis | Prio | Maksud | Ref |
|---|---|---|---|---|
| `test_RegisterProvider_SetsActiveAndEntity` | unit | SHOULD | AC-REG-1 | [D-24] |
| `test_RevertWhen_RegisterUnverified` | unit | SHOULD | `NotVerified` | |
| `test_RevertWhen_BuyerRegistersAsProvider` **[D-45]** | unit | SHOULD | akun KYB role 2 (dan 3, 4) → `registerProvider` revert `NotProviderRole`; `isListable` false untuk role ≠ 1 | AUDIT SC-1, 01 §6.1 |
| `test_RevertWhen_RegisterTwice` | unit | NICE | `AlreadyRegistered` | |
| `test_RevertWhen_RecordCalledByNonRM` | unit | SHOULD | `OnlyRedemptionManager` untuk `record*` | INV-REG-2 |
| `test_ReputationUpdated_IncludesStrikes` | unit | SHOULD | event `ReputationUpdated` membawa `strikes` (naik 1 pada default paksa, tetap pada voluntary) | 01 §6.1 (03 X-1) |
| `test_SetGate_OnlyTimelockEmitsGateUpdated` | unit | NICE | `setGate` dari non-Timelock revert; lewat Timelock emit `GateUpdated` (sama untuk `PrimarySale`, `OrderBook`; **[D-49]** + `SeriesFactory`) | 01 P-64, §7.1 |
| `test_RecordDefault_VoluntaryVsForced` | unit | SHOULD | voluntary menaikkan `voluntaryDefaultedCU` tanpa strike; paksa menaikkan `defaultedCU` + `strikes` | [D-33] |
| `test_SuspendedProviderNotListable` | unit | SHOULD | AC-REG-2 | |

### 2.2 `ConversionTable` (CT)

**Invariant**
- INV-CT-1: `setFactor` hanya bisa dieksekusi lewat `TimelockController` setelah delay (48 jam prod / 5 menit demo).
- INV-CT-2: Mengubah faktor tidak mengubah `factor` series yang sudah ada (snapshot di `createSeries`).
- INV-CT-3: Faktor terdaftar selalu > 0.

**Acceptance**
- AC-CT-1: Given series H100 sudah dibuat, When Timelock mengubah faktor H100, Then `getSeries(s).factor` dan `maxSupply` tidak berubah, dan series baru memakai faktor baru.

| Test | Jenis | Prio | Maksud | Ref |
|---|---|---|---|---|
| `test_RevertWhen_SetFactorNotTimelock` | unit | **MUST** | "Factor timelock" | design §7.1 |
| `test_SetFactor_ViaTimelockAfterDelay` | integ | **MUST** | schedule → `warp(delay)` → execute berhasil; sebelum delay revert; event `CallScheduled` lalu `CallExecuted` dengan `id` sama (dibaca indexer untuk `/admin`, 01 §7.1) | design §3 #2, sitemap §9.1 must-not-cut |
| `test_FactorChange_DoesNotAffectExistingSeries` | integ | SHOULD | AC-CT-1 | 01 §6.2 |
| `test_RevertWhen_FactorZero` | unit | NICE | `InvalidFactor` | |
| `test_InitialFactors` | unit | SHOULD | H100 10_000, H200 14_000, B200 25_000, GB200 35_000, A100 4_500; RTX 4090 `UnknownGpuModel` | [D-09] |

### 2.3 `SeriesFactory` (SF)

**Invariant**
- INV-SF-1: Struct series immutable kecuali `primaryPrice` (hanya naik, dan selalu `bondPerCU ≥ 1,5 × primaryPrice` [D-28]), `paused`, `finalized`.
- INV-SF-2: Untuk setiap series: `bondPerCU ≥ primaryPrice × 15_000 / 10_000`; `maxSupply = gpuHours × factor × 1e18 / 1e4` > 0; arbitrator ada di allowlist saat listing.
- INV-SF-3: `bondVault.deposited(s) == bondPerCU × maxSupply / 1e18` sejak tx `createSeries` ("bond exists before the units do", design §8).
- INV-SF-4: `seriesId` berurutan mulai 1; token = `predictTokenAddress(seriesId)` (01 P-29).
- INV-SF-5: `finalized ⇒ now ≥ windowEnd + grace ∧ openRequestCount == 0` saat finalisasi [D-14].
- INV-SF-6: Window: `windowStart < windowEnd`; prod: `windowStart > now`; demo (`allowOpenWindow`): `windowEnd > now + leadTime` [D-19, D-39]; ack/delivery/dispute dalam batas set deployment [D-20].

**Acceptance**
- AC-SF-1: Given provider aktif dengan 2,250 mUSDC + permit untuk `BondVault`, When `createSeriesWithPermit` 500 jam H100 @ 3.00, bond/CU 4.50, Then 1 tx, `SeriesCreated`, bond 2,250.000000, sale terbuka [D-30].
- AC-SF-2: Given deployment demo, When window Oktober yang sudah berjalan, Then diterima. Given deployment prod, Then `InvalidWindow` [D-19].
- AC-SF-3: Given series sudah lewat `windowEnd + grace` dengan 0 request terbuka, When siapa saja memanggil `finalizeSeries`, Then `finalized`, `BondFinalized`, provider bisa `withdrawRemaining` [D-14].

| Test | Jenis | Prio | Maksud | Ref |
|---|---|---|---|---|
| `test_CreateSeries_LocksFullBond` | integ | **MUST** | INV-SF-3, angka 2,250 | shortlist #1 |
| `test_RevertWhen_BondBelowFloor` | unit | **MUST** | INV-SF-2 | shortlist #2 |
| `testFuzz_CreateSeries_Bounds` | fuzz | **MUST** | fuzz `gpuHours`, harga, bond/CU, window, ack/delivery/dispute: valid ⇒ deposit = `bondPerCU × maxSupply`; tidak valid ⇒ error yang tepat. Kalau window bulan kalender dipaksa, fuzz window diganti fuzz bulan | stack §4.6 "fuzzing on createSeries bounds", [D-02], [D-20] |
| `test_CreateSeriesWithPermit_SingleTx` | integ | SHOULD | AC-SF-1 | [D-30] |
| `test_RevertWhen_ArbitratorNotAllowed` | unit | SHOULD | `ArbitratorNotAllowed` | |
| `test_RevertWhen_UnknownGpuModel` | unit | SHOULD | `UnknownGpuModel` | |
| `test_RevertWhen_WindowsOutOfBounds` | unit | SHOULD | `AckWindowOutOfBounds` / `DeliveryWindowOutOfBounds` / `DisputeWindowOutOfBounds` dengan set demo 60/60/90 dtk sebagai batas bawah | [D-20] |
| `test_DemoDeployment_AllowsOpenWindow` / `test_RevertWhen_ProdDeploymentOpenWindow` | unit | **MUST** | AC-SF-2; adegan 2610 bergantung pada ini | [D-19] |
| `test_RevertWhen_NotCalendarMonth` | unit | SHOULD | `enforceCalendarMonth == true`: window bukan tanggal 1 00:00 UTC s.d. tanggal 1 bulan berikutnya → `InvalidWindow` | [D-02], 01 §6.3 |
| `test_Views_BoundsFlagsAndArbitrators` | unit | SHOULD | `bounds()`, `allowOpenWindow()`, `enforceCalendarMonth()`, `leadTime()`, `rulingWindow()` sama dengan set parameter; `allowedArbitrators()` berisi `PanelArbitrator`; `seriesCount()` naik per `createSeries` | 01 §6.3/§6.8 (06 X6-11, 04 P4-12) |
| `test_RaisePrimaryPrice_OnlyUpAndWithinFloor` | unit | SHOULD | `PriceCanOnlyIncrease`, `BondBelowFloor` | [D-28] |
| `test_FinalizeSeries_AfterGraceWithNoOpenRequests` | integ | SHOULD | AC-SF-3 | [D-14] |
| `test_RevertWhen_FinalizeWithOpenRequests` | integ | SHOULD | `OpenRequestsRemaining` | [D-14] |
| `test_RevertWhen_FinalizeBeforeGrace` | unit | SHOULD | `SeriesNotExpired` | 01 P-11 |
| `test_Pause_BlocksBuyAndNewOrdersOnly` | integ | SHOULD | pause tidak memblokir redemption, `claimDefault`, dispute, cancel, withdraw | [D-32] |
| `test_PredictTokenAddress_MatchesClone` | unit | NICE | INV-SF-4 | 01 P-29 |
| `test_SetGate_NewSeriesUseNewGate` **[D-49]** | integ | NICE | setelah `SeriesFactory.setGate` via Timelock, clone baru meng-`initialize` gate baru; series lama tetap gate lama | AUDIT SC-5, 01 §6.3 |
| `test_CreateSeriesWithPermit_PermitAlreadyUsed` **[D-55d]** | unit | NICE | permit dipakai lebih dulu (front-run/retry) dan allowance cukup → `createSeriesWithPermit` tetap sukses; allowance kurang → revert | AUDIT SC-15, 01 §6.3 |

### 2.4 `CUToken` (CU)

**Invariant**
- INV-CU-1: `totalSupply ≤ maxSupply`; `totalSupply = minted − burned`.
- INV-CU-2: Mint hanya oleh `PrimarySale`; burn hanya oleh `RedemptionManager` (dari saldonya sendiri).
- INV-CU-3: Setelah `windowEnd`, saldo hanya bisa berubah lewat burn RM, transfer keluar dari RM (refund) atau transfer keluar dari `OrderBook` (cancel) [D-29].
- INV-CU-4: Series `institutional`: penerima non-sistem wajib terverifikasi gate. **[D-50]** kecuali pengirim = RM atau `OrderBook` (refund/cancel ke pemilik aset).
- INV-CU-5: `decimals() == 18`.

**Acceptance**
- AC-CU-1: Given CU di wallet setelah `windowEnd`, When transfer ke siapa pun, Then `TransfersClosed`. Given order ask yang masih ada, When `cancelOrder` setelah `windowEnd`, Then CU kembali ke maker [D-29].

| Test | Jenis | Prio | Maksud | Ref |
|---|---|---|---|---|
| `test_RevertWhen_TransferAfterWindowEnd` | unit | **MUST** | "Expiry blocks transfers" | design §7.1 |
| `test_RevertWhen_MintByNonPrimarySale` | unit | **MUST** | "no CU without backing" (mint di luar `PrimarySale` mustahil) | INV-CU-2 |
| `test_RevertWhen_BurnByNonRM` | unit | SHOULD | `OnlyRedemptionManager` | |
| `test_LockFrom_MovesToRMWithoutAllowance` | unit | SHOULD | 1 tx redeem | [D-38] |
| `test_SystemTransfersAllowedAfterWindowEnd` | integ | SHOULD | refund dari RM + cancel dari `OrderBook` tetap jalan | [D-29] |
| `test_RevertWhen_InstitutionalTransferToUnverified` | unit | NICE | `RecipientNotVerified` | design §10.2 G8 |
| `testFuzz_TransferBeforeWindowEnd` | fuzz | NICE | transfer bebas sebelum `windowEnd` untuk series non-institusional | |
| `testFuzz_InstitutionalReturnToRevokedHolder` **[D-50]** | fuzz | NICE | series institusional, KYB holder/maker dicabut di titik acak: `resolveNoRuling` dan `cancelOrder` tetap sukses; transfer P2P ke alamat itu tetap `RecipientNotVerified` | AUDIT SC-6, 01 §6.4 |

### 2.5 `BondVault` (BV)

**Invariant**
- INV-BV-1 (akuntansi): `!withdrawn ⇒ balance = deposited − released − slashed`; `withdrawn ⇒ balance == 0` [P2-01].
- INV-BV-2 (solvency): `USDC.balanceOf(BondVault) == Σ_s balance[s]`.
- INV-BV-3 (isolasi): setiap fungsi hanya menyentuh satu `seriesId`; tidak ada sweep (01 I2).
- INV-BV-4: `release`/`slash` hanya dari RM; `deposit` sekali per series hanya dari Factory; `withdrawRemaining` hanya oleh provider series dan hanya setelah `finalized`, sekali.
- INV-BV-5 (D-18): sebelum final, `balance[s] ≥ bondPerCU × totalSupply(s) / 1e18`.

**Acceptance**
- AC-BV-1: Given dua series A dan B, When default di A, Then `bondOf(B)` identik bit demi bit sebelum dan sesudah.
- AC-BV-2: Given series final, When provider `withdrawRemaining`, Then seluruh `balance` ke provider dan panggilan kedua revert `AlreadyWithdrawn`.

| Test | Jenis | Prio | Maksud | Ref |
|---|---|---|---|---|
| `test_BondIsolation_DefaultTouchesOnlyOwnSeries` | integ | **MUST** | AC-BV-1 | design §7.1, stack §4.6 (2) |
| `test_RevertWhen_ReleaseOrSlashByNonRM` | unit | **MUST** | INV-BV-4 | |
| `test_RevertWhen_SlashExceedsBalance` | unit | SHOULD | `InsufficientBond` | |
| `test_RevertWhen_DepositTwice` | unit | SHOULD | `BondAlreadyExists` | |
| `test_WithdrawRemaining_OnlyAfterFinalizeOnce` | integ | SHOULD | AC-BV-2, `NotFinalized` | [D-14] |
| `test_RevertWhen_ReleaseAfterFinalized` | unit | NICE | `AlreadyFinalized` | 01 P-38 |

### 2.6 `PrimarySale` (PS)

**Invariant**
- INV-PS-1: `sold[s] ≤ maxSupply[s]`; `sold[s] == CU minted[s]`.
- INV-PS-2: Setiap `buy`: USDC buyer turun tepat `cost`, provider naik `cost − fee`, treasury naik `fee`; saldo USDC `PrimarySale` selalu 0 (pass-through).
- INV-PS-3: `maxCost > 0` wajib dan `cost ≤ maxCost`.
- INV-PS-4: Buyer wajib terverifikasi [D-31]; tidak bisa beli saat paused atau setelah `windowEnd − leadTime` [D-39].

**Acceptance**
- AC-PS-1: Given series 4 terbuka, When buyer `buy(4, 20e18, 60_000_000)`, Then `cost 60_000_000`, `fee 600_000`, provider +59.400000, `PrimaryBuy` (05 S-02).
- AC-PS-2: Given `maxCost` < cost, Then `SlippageExceeded(cost, maxCost)`.

| Test | Jenis | Prio | Maksud | Ref |
|---|---|---|---|---|
| `test_RevertWhen_BuyWithZeroMaxCost` | unit | **MUST** | INV-PS-3 | design §7.1 |
| `test_Buy_SplitsFeeAndMints` | integ | **MUST** | AC-PS-1 (proceeds langsung ke provider) | 05 S-02, [D-01] |
| `testFuzz_Buy_Slippage` | fuzz | **MUST** | fuzz `qty`, `maxCost`: lolos ⇔ `ceil(qty × price / 1e18) ≤ maxCost` | stack §4.6 "buy slippage" |
| `testFuzz_Buy_NeverExceedsMaxSupply` | fuzz | SHOULD | `SupplyExceeded(remaining)` | INV-PS-1 |
| `test_RevertWhen_BuyerNotVerified` | unit | SHOULD | `BuyerNotVerified` | [D-31] |
| `test_RevertWhen_SaleClosed` | unit | SHOULD | lewat `windowEnd − leadTime` | [D-39] |
| `test_RevertWhen_BuyNotWholeLot` **[D-52]** | unit | SHOULD | `buy` 0.5 CU atau 20.5 CU → `InvalidLot`; 20 CU lolos | AUDIT SC-16, 01 §1 |
| `test_Buy_PrimaryBalanceIsZeroAfter` | unit | SHOULD | INV-PS-2 | |
| `test_RevertWhen_SetPrimaryFeeAboveCap` | unit | NICE | `FeeTooHigh` (`≤ 500` bps) | [D-40] |
| `test_RevertWhen_SetTakerFeeAboveCap` | unit | NICE | `FeeTooHigh` (`≤ 100` bps) | [D-40] |

### 2.7 `OrderBook` (OB)

**Invariant**
- INV-OB-1 (escrow CU): `CU.balanceOf(OrderBook)[s] == Σ qtyRemaining` ask aktif series s.
- INV-OB-2 (escrow USDC): bid meng-escrow `ceil(qty × price / 1e18)` (01 §6.7). Karena pembulatan ke atas per order, partial fill bisa meninggalkan debu. Usulan [APPROVED P2-04]: simpan `escrowRemaining` USDC per order (bukan dihitung ulang dari `qtyRemaining`), kurangi tepat sebesar notional tiap fill, kembalikan sisa saat cancel/IOC/filled. Invariant: `USDC.balanceOf(OrderBook) == Σ escrowRemaining` order bid aktif.
- INV-OB-3: Tidak ada `Trade` dengan `makerEntity == takerEntity ≠ 0`; percobaan seperti itu revert `SelfMatch()` (01 I3) [D-35].
- INV-OB-4: `eligible == (makerEntity ≠ 0 ∧ takerEntity ≠ 0 ∧ makerEntity ≠ takerEntity)` [D-35].
- INV-OB-5: Harga kelipatan tick 0,01 USDC (`10_000`); level aktif per sisi ≤ 10 [D-17]; fill per tx ≤ `maxFillsPerTx` (01 T-02). **[D-52]** `qtyRemaining` setiap order aktif kelipatan `1e18`.
- INV-OB-6: Maker menerima notional penuh (fee 0); taker beli membayar `notional + fee`, taker jual menerima `notional − fee`; fee → treasury (01 P-43) [D-13].
- INV-OB-7: Tidak ada order baru setelah `windowEnd` (`OrderBookClosed`); `cancelOrder` tetap jalan [D-29].
- INV-OB-8: Setiap fill memanggil `PrintIndex.recordTrade` dengan `eligible` yang sama dengan event `Trade` [D-22]. **[D-53]** kalau panggilan itu revert, tx tetap sukses dan ada `IndexUpdateFailed` untuk fill tersebut.
- INV-OB-9 **[D-51]** setelah setiap tx, book tidak menyilang: `bestBid < bestAsk` (kalau keduanya ada). `OrderPlaced` hanya ada untuk order yang di-rest, dengan `qty` = qty yang di-rest.

**Acceptance**
- AC-OB-1: Given ask trader 5 @ 3.20 (entity E3), When wallet ke-2 buyer (entity E2) bid IOC 5 @ 3.20, Then satu `Trade` eligible, wallet 2 −16.024000, trader +16.000000, treasury +0.024000 (05 S-06).
- AC-OB-2: Given ask milik wallet 2 buyer (E2), When buyer (E2) bid, Then revert `SelfMatch()` dan tidak ada print (05 S-12).

| Test | Jenis | Prio | Maksud | Ref |
|---|---|---|---|---|
| `test_Fill_TransfersAndTakerFee` | integ | **MUST** | AC-OB-1 (adegan trade demo) | 05 S-06 |
| `test_RevertWhen_SelfMatchSameEntity` | integ | **MUST** | AC-OB-2, invariant (3) | stack §4.6 (3), design §10.5 #5 |
| `test_Trade_EligibleFlagMatchesEntities` | unit | SHOULD | INV-OB-4 | [D-35] |
| `test_PriceTimePriority` | unit | SHOULD | harga terbaik dulu, FIFO dalam satu harga | design §3 #7 |
| `test_PartialFillRestsRemainder` / `test_IOC_ReturnsRemainder` | unit | SHOULD | sisa di-rest atau dikembalikan | 01 §6.7 |
| `test_Cancel_ReturnsEscrow` | unit | SHOULD | `OrderCancelled`, escrow kembali | |
| `test_RevertWhen_InvalidTick` | unit | SHOULD | `InvalidTick` | |
| `test_RevertWhen_TooManyPriceLevels` | unit | SHOULD | level ke-11 revert | [D-17] |
| `test_RevertWhen_OrderAfterWindowEnd` / `test_CancelAfterWindowEnd` | unit | SHOULD | INV-OB-7 | [D-29] |
| `test_RevertWhen_TraderNotVerified` | unit | SHOULD | `TraderNotVerified` | [D-31] |
| `testFuzz_Matching_ConservesEscrow` | fuzz | SHOULD | urutan order acak: INV-OB-1/2 tetap | |
| `test_Gas_MatchingLoopBounded` | unit (`forge snapshot`) | SHOULD | gas fill maksimum tetap di bawah batas blok, penentu `maxFillsPerTx` | stack §4.6, 01 T-02 |
| `test_MaxFills_NoCrossedBook` **[D-51]** | unit | SHOULD | bid non-IOC menyapu > `maxFillsPerTx` ask: sisa yang masih menyilang dikembalikan (escrow kembali), tidak ada `OrderPlaced`, INV-OB-9 berlaku | AUDIT SC-7, 01 §6.7 |
| `test_RevertWhen_OrderBelowMinQty` **[D-52]** | unit | SHOULD | `placeOrder` qty 1 wei / 0.5 CU → `InvalidLot`; 10 ask debu di 10 tick tidak mungkin lagi | AUDIT SC-8, 01 §6.7 |
| `test_IndexFailure_DoesNotBlockTrade` **[D-53]** | unit (mock `PrintIndex` yang revert) | SHOULD | fill tetap sukses, `Trade` + `IndexUpdateFailed` diemit; sama untuk `claimDefault` di RM | AUDIT SC-10, 01 C14/C21 |
| `test_FallbackBoard_TakeEmitsSameTrade` | unit | NICE | kalau fallback "list at price, take" dipakai, event `Trade` sama | 01 §6.7, design §8 |

### 2.8 `RedemptionManager` (RM)

**Invariant**
- INV-RM-1 (transisi): state tersimpan hanya berubah menurut T1–T13 + T12b (01 §6.8). `None→Requested`, `Requested→Acknowledged`, `Acknowledged→Delivered`, `Delivered→{Finalized, Disputed}`, `Disputed→{Finalized, Defaulted, Refunded}`, `{Requested, Acknowledged}→Defaulted` (`claimDefault` setelah deadline, atau `declineAndPay` [D-33] hanya selama belum `Defaultable` [D-47]). T12b [D-46]: `Disputed → Refunded` + record baru `Requested` dalam satu tx, hanya sekali dan hanya di `[windowEnd, windowEnd + grace)`. Tidak ada transisi lain.
- INV-RM-2: `Defaulted`, `Finalized`, `Refunded` terminal: tidak ada fungsi yang berhasil setelahnya.
- INV-RM-3: `Defaultable` tidak pernah disimpan; `stateOf` = `Defaultable` ⇔ (`Requested ∧ now > ackDeadline`) ∨ (`Acknowledged ∧ now > deliveryDeadline`).
- INV-RM-4: `CU.balanceOf(RM)[s] == Σ amount` request non-terminal series s.
- INV-RM-5: `USDC.balanceOf(RM) == Σ disputeBond` request `Disputed` [D-37].
- INV-RM-6: `openRequestCount[s] == #` request non-terminal series s.
- INV-RM-7: Setiap request dibayar **paling banyak sekali**: tepat satu dari {release `claim` ke provider, slash `claim` ke holder, refund CU}. `claim = floor(bondPerCU × amount / 1e18)` [P2-02].
- INV-RM-8: Payout default selalu ke **holder** request, bukan pemanggil.
- INV-RM-9: `disputeBond = max(claim × 500 / 10_000, 5_000_000)` (01 P-02).

**Acceptance (mirip naskah)**
- AC-RM-1 (happy): Given holder 20 CU, When redeem 8 → ack → `markDelivered` → `confirm`, Then burn 8, provider +36.000000, `deliveredCU = 8e18`.
- AC-RM-2 (missed ack): Given request 10 CU tanpa ack, When `now > ackDeadline` dan akun tanpa KYB memanggil `claimDefault`, Then holder +45.000000, pemanggil +0, `strikes +1`.
- AC-RM-3 (dispute Delivered): Given `Delivered` dan dispute dengan bond 5.000000, When panel memutus Delivered, Then provider menerima claim + dispute bond [D-21].
- AC-RM-4 (dispute NotDelivered): Then holder menerima claim + dispute bond kembali, `disputesLost +1`.
- AC-RM-5 (timeout): Given `Disputed` tanpa putusan, When `now > rulingDeadline` dan siapa saja `resolveNoRuling`, Then CU + dispute bond kembali, bond vault tetap.

| Test | Jenis | Prio | Maksud | Ref |
|---|---|---|---|---|
| `test_HappyPath_ConfirmReleasesBondAndBurns` | integ | **MUST** | AC-RM-1, T1/T2/T4/T7 | design §7.1 |
| `test_AutoFinalize_AfterDisputeWindow` | integ | **MUST** | T8 (holder diam) | design §2 Flow C |
| `test_ClaimDefault_AfterMissedAck` | integ | **MUST** | AC-RM-2, T3/T6 | design §7.1 |
| `test_ClaimDefault_AfterMissedDelivery` | integ | **MUST** | T5/T6 | design §7.1 |
| `test_RevertWhen_ClaimDefaultTwice` | integ | **MUST** | INV-RM-7 | stack §4.6 (6) |
| `test_RevertWhen_ClaimDefaultAtDeadline` | integ | **MUST** | batas `>` ketat (`NotDefaultable`) | INV-RM-3 |
| `test_Dispute_RulingDelivered_FinalizesAndPaysDisputeBond` | integ | **MUST** | AC-RM-3, T9/T10 | design §7.1, [D-21] |
| `test_Dispute_RulingNotDelivered_DefaultsAndRefundsDisputeBond` | integ | **MUST** | AC-RM-4, T11 | design §7.1 |
| `test_ResolveNoRuling_RefundsWithoutSlash` | integ | **MUST** | AC-RM-5, T12 | design §7.1 |
| `test_DeclineAndPay_VoluntaryDefault` | integ | SHOULD | T13, counter voluntary | [D-33] |
| `test_RevertWhen_DeclineAndPayAfterDeadline` **[D-47]** | integ | SHOULD | `now > ackDeadline` (REQUESTED) atau `now > deliveryDeadline` (ACKNOWLEDGED): `declineAndPay` revert `InvalidState(Defaultable)`; `claimDefault` tetap sukses dengan strike | AUDIT SC-3, 01 T13 |
| `test_RevertWhen_AckAfterDeadline` / `test_RevertWhen_MarkDeliveredAfterDeadline` | unit | SHOULD | `AckDeadlinePassed`, `DeliveryDeadlinePassed` | |
| `test_RevertWhen_DisputeAfterWindow` | unit | SHOULD | `DisputeWindowClosed` | |
| `test_RevertWhen_RuleAfterDeadline` | unit | SHOULD | `RulingDeadlinePassed` | |
| `test_RevertWhen_RequestOutsideWindow` / `test_RevertWhen_BelowMinRedemption` | unit | SHOULD | `OutsideRedemptionWindow`, `BelowMinRedemption` | |
| `test_RevertWhen_NonHolderConfirmsOrDisputes` / `test_RevertWhen_NonProviderAcks` | unit | SHOULD | `NotHolder`, `NotProvider` | |
| `test_RevertWhen_MarkDeliveredZeroReceipt` | unit | NICE | `ZeroReceipt` | [D-26] |
| `test_DisputeBond_MinimumFiveDollars` | unit | SHOULD | INV-RM-9 (18 → 5.00; 1000 → 50) | design §4.2 |
| `test_StateOf_DerivesDefaultable` | unit | SHOULD | INV-RM-3, tidak ada penulisan state | 01 P-21 |
| `test_RefundAfterWindowEnd_ReopensRequestInGrace` **[D-46]** | integ | NICE | dispute tanpa putusan diselesaikan `resolveNoRuling` setelah `windowEnd`: CU tetap di RM, record lama `Refunded`, reqId baru `Requested` + `RedemptionReopened`; reopen hanya sekali dan hanya sebelum `windowEnd + grace`; setelah itu REFUNDED biasa (menggantikan test D-29 lama yang tidak bisa lulus karena `lockFrom` pasca-window diblokir `_update` aturan 1) | [D-29], [D-46], AUDIT SC-2 |
| `testFuzz_StateMachine_RandomActionsAndTimes` | fuzz | **MUST** | urutan aksi + `warp` acak pada satu request: hanya transisi T1–T13 yang berhasil | stack §4.6 "dispute state machine" |

### 2.9 `PanelArbitrator` (ARB)

**Invariant**
- INV-ARB-1: Tepat satu putusan per `reqId`; hanya sebelum `rulingDeadline`.
- INV-ARB-2: `ruleWithSignatures` butuh ≥ `threshold` tanda tangan unik dari `members` (EIP-712, `SignatureChecker`) [D-36].
- INV-ARB-3: `setPanel` (Timelock) tidak mengubah dispute yang sudah terbuka (01 P-51).
- INV-ARB-4: Arbitrator tidak pernah memindahkan dana; dana hanya bergerak lewat `RedemptionManager.onRuling`.

| Test | Jenis | Prio | Maksud | Ref |
|---|---|---|---|---|
| `test_RuleWithTwoOfThreeSignatures` | integ | **MUST** | jalur putusan demo/fallback | design §11.4, [D-03], [D-36] |
| `test_RevertWhen_InsufficientSignatures` | unit | SHOULD | 1 tanda tangan | |
| `test_RevertWhen_DuplicateSigner` / `test_RevertWhen_NonMemberSignature` | unit | SHOULD | `DuplicateSigner`, `InvalidSignature` | |
| `test_RevertWhen_RuleTwice` | unit | SHOULD | `AlreadyRuled` | INV-ARB-1 |
| `test_SafeModeRule_ThresholdOne` | unit | NICE | `rule` oleh Safe sebagai anggota tunggal; otorisasi = keanggotaan `members` + `threshold == 1` (tanpa `ARBITER_ROLE`) [D-55c]; non-anggota → `NotPanelMember` | [D-36], [D-55c] |
| `test_SetPanel_DoesNotAffectOpenDispute` | integ | NICE | INV-ARB-3 | 01 P-51 |
| `test_ERC1271MemberSignature` | unit | NICE | anggota berupa kontrak (Safe) | stack §4.1 |

### 2.10 `PrintIndex` (PI)

**Invariant**
- INV-PI-1: Print tidak eligible tidak pernah mengubah `answer` (01 I4, stack §4.6 (4)).
- INV-PI-2: `recordTrade` hanya dari `OrderBook`; `recordDelivery`/`recordDefault` hanya dari RM.
- INV-PI-3: Status mengikuti definisi D-15: `OK` ⇔ volume eligible di window ≥ `minVolume` ∧ entity unik ≥ `minParticipants`; `THIN` = carry-forward; `DISRUPTED` = carry-forward > `maxCarryForward` atau set admin [D-15]. **[D-53]** "window" = window tumbling (reset saat `now ≥ windowStart + windowLength`); entity unik dihitung lewat set per window; `recordTrade`/`poke` tidak pernah revert untuk input valid.
- INV-PI-4: Tidak ada kontrak Paron yang membaca `PrintIndex` di jalur payout (design §1, 01 §8).

| Test | Jenis | Prio | Maksud | Ref |
|---|---|---|---|---|
| `test_IneligiblePrintIgnored` | unit | **MUST** | invariant (4) | stack §4.6 (4) |
| `test_FirstEligibleFill_ThinToOk` | integ | **MUST** | 1 fill 5 CU antar 2 entity → `OK` 3.20 dengan parameter demo (adegan "ticks") | [D-15], 05 S-06 |
| `test_CarryForward_ThenDisrupted` | unit | SHOULD | `poke` setelah window kosong → THIN; > 72 jam → DISRUPTED | [D-15] |
| `test_RevertWhen_RecordTradeNotOrderBook` | unit | SHOULD | `OnlyOrderBook` | |
| `test_TumblingWindow_ResetsAndCountsUniqueEntities` **[D-53]** | unit | SHOULD | entity yang sama 3× di satu window = 1 partisipan; lewat `windowLength` akumulator reset, answer OK terakhir dibawa (THIN), entity dihitung ulang | AUDIT SC-9, 01 §6.10 |
| `test_LatestRoundData_Shape` | unit | NICE | `latestRoundData(gpuModel)`, `decimals` | 01 P-55 |
| `test_SetDisrupted_AdminOnly` | unit | NICE | | 01 P-54 |

Winsorization = offchain di API ([D-16]), diuji di §5, bukan di Foundry.

### 2.11 `ReferenceFeed` (RF) (NICE, [D-06])

- INV-RF-1: Hanya `FEED_SIGNER_ROLE` (atau tanda tangan signer lewat `pushSigned`) yang bisa mengubah nilai; `observedAt` tidak boleh mundur (`StaleObservation`).
- INV-RF-2: Tidak ada kontrak Paron yang memanggil `ReferenceFeed` (display dan coverage saja, design §3 #11).

| Test | Jenis | Prio | Maksud | Ref |
|---|---|---|---|---|
| `test_Push_OnlySigner` | unit | NICE | INV-RF-1 | 01 P-14 |
| `test_RevertWhen_StaleObservation` | unit | NICE | | |
| `test_IsSyntheticAndLabel` | unit | NICE | label "synthetic demo data" | design §10.5 #2 |

### 2.12 `MockUSDC` (USD)

- INV-USD-1: `decimals() == 6`; `totalSupply` hanya naik lewat `mint` (`MINTER_ROLE`) dan `faucet` (sekali per cooldown).
- INV-USD-2: `permit` EIP-2612 bekerja dengan domain chain aktif [D-30].

| Test | Jenis | Prio | Maksud | Ref |
|---|---|---|---|---|
| `test_Decimals6` | unit | SHOULD | | design §3 #12 |
| `test_RevertWhen_MintWithoutRole` | unit | SHOULD | | 01 P-15 |
| `test_Faucet_Cooldown` | unit | NICE | `FaucetCooldown(nextAt)`; jumlah per [D-40] | |
| `test_Permit_SetsAllowanceForBondVault` | unit | SHOULD | spender = `BondVault` (05 X-7) | [D-30] |

### 2.13 `IParticipantGate`: `EASGate` / `RegistryGate` (GATE)

**Invariant**
- INV-GATE-1: `isVerified(a)` ⇔ attestation/entry: schema `ParticipantVerified`, attester tepercaya, penerima = `a`, belum dicabut, `expiry > now` [D-23, D-24].
- INV-GATE-2: `entityId(a) == 0` ⇔ `!isVerified(a)`.
- INV-GATE-3: Kedua implementasi lolos suite perilaku yang sama (mengganti gate = satu argumen constructor, stack §3.3).

**Acceptance**
- AC-GATE-1: Given attestation valid dari verifier, When `linkAttestation(uid)`, Then `isVerified = true` dan `entityId` sesuai data attestation (go/no-go cek 3, design §11.3).
- AC-GATE-2: Given attestation dicabut atau kedaluwarsa, Then `isVerified = false`, dan `buy`/`placeOrder` revert.

| Test | Jenis | Prio | Maksud | Ref |
|---|---|---|---|---|
| `test_LinkAttestation_Verifies` | integ (EAS lokal) | **MUST** | AC-GATE-1; prasyarat semua test KYB | design §11.3 cek 3 |
| `test_RevertWhen_WrongSchemaOrUntrustedAttester` | unit | SHOULD | `WrongSchema`, `UntrustedAttester` (attester tepercaya = Safe tim; **[APPROVED D-54, Jum 9 Okt ~11:05 WIB, hackathon saja]**: fixture deployment hackathon = EOA `W-VERIFIER`) | [D-04] |
| `test_RevokedOrExpired_NotVerified` | unit | SHOULD | AC-GATE-2 | |
| `test_RevertWhen_RecipientMismatch` | unit | SHOULD | `RecipientMismatch` | |
| `test_LinkAttestation_RejectsOlderUid` **[D-55b]** | unit | NICE | link uid baru lalu coba link uid lama (masih valid) → `StaleAttestation`; uid lama boleh kalau yang baru sudah dicabut | AUDIT SC-13, 01 §6.13 |
| `test_RegistryGate_SameBehaviour` | unit | SHOULD | INV-GATE-3 (suite perilaku yang sama dijalankan pada `RegistryGate`) | [D-23] |
| `testFork_EASGate_OnExistingEASArbSepolia` | fork | NICE | EAS v1.3.0 di `0x2521…E1dE` | design §11.1 |

---

## 3. Invariant sistem (lintas kontrak) + desain handler

### 3.1 Daftar invariant sistem

| ID | Invariant | Fungsi invariant | Prio | Ref |
|---|---|---|---|---|
| SYS-1 | Untuk setiap series belum final: `bondOf(s).balance ≥ bondPerCU × totalSupply(s) / 1e18` | `invariant_BondCoversSupply` | **MUST** | stack §4.6 (1), [D-18] |
| SYS-2 | Sebelum withdraw: `bondOf(s).balance == deposited − released − slashed` dan `released == ghost_released[s]`, `slashed == ghost_slashed[s]`; sesudah withdraw `balance == 0` dan provider menerima `ghost_withdrawn[s]`; `deposited == bondPerCU × maxSupply / 1e18` | `invariant_BondAccountingExact` | SHOULD | P2-01 |
| SYS-3 | "Tidak ada CU tanpa backing": `ghost_cuMinted[s] == sold[s] ≤ maxSupply[s]`, dan setiap mint berasal dari `PrimaryBuy` | `invariant_NoUnbackedCU` | **MUST** | design §8 |
| SYS-4 | Konservasi CU: `totalSupply(s) == Σ saldo aktor + escrow OrderBook + terkunci RM == ghost_cuMinted[s] − ghost_cuBurned[s]` | `invariant_CUConservation` | SHOULD | |
| SYS-5 | Konservasi USDC: `MockUSDC.totalSupply == ghost_usdcMinted == Σ saldo semua aktor + treasury + BondVault + OrderBook + RM + PrimarySale`; saldo `PrimarySale == 0` | `invariant_USDCConservation` | **MUST** | 05 §3.5 |
| SYS-6 | Isolasi bond: aksi apa pun pada series s tidak mengubah `bondOf(s')` untuk s' ≠ s | `invariant_BondIsolation` | **MUST** | stack §4.6 (2) |
| SYS-7 | Tidak ada print dengan `makerEntity == takerEntity ≠ 0` | `invariant_NoSelfMatchPrints` | **MUST** | stack §4.6 (3) |
| SYS-8 | `PrintIndex` mengabaikan print tidak eligible | `invariant_IndexIgnoresIneligible` | **MUST** | stack §4.6 (4) |
| SYS-9 | CU tidak berpindah setelah `windowEnd` kecuali burn RM, refund RM, atau cancel OrderBook. Daftar pengecualian **tetap tiga ini**; request ulang pasca-window terjadi di dalam RM (T12b, D-46) tanpa transfer CU | `invariant_NoTransferAfterWindowEnd` | **MUST** | stack §4.6 (5), [D-29], [D-46] |
| SYS-10 | `claimDefault` (dan setiap jalur default) membayar tepat `floor(bondPerCU × amount / 1e18)` ke holder, sekali per `reqId` | `invariant_DefaultPaysExactlyOnce` | **MUST** | stack §4.6 (6), P2-02 |
| SYS-11 | Setiap perubahan state request yang diamati adalah salah satu dari T1–T13; state terminal tidak pernah berubah | `invariant_ValidTransitionsOnly` | **MUST** | 01 §6.8 |
| SYS-12 | Escrow RM: CU terkunci == Σ amount request non-terminal; USDC RM == Σ dispute bond request `Disputed`; `openRequestCount` cocok | `invariant_RMEscrowMatchesOpenRequests` | SHOULD | [D-37], [D-38] |
| SYS-13 | Escrow OrderBook == Σ order aktif (CU dan USDC) | `invariant_OrderBookEscrow` | SHOULD | P2-04 |
| SYS-14 | Treasury USDC == Σ fee `PrimaryBuy` + Σ `takerFee` `Trade` | `invariant_TreasuryEqualsFees` | SHOULD | [D-13] |
| SYS-15 | Counter reputasi == jumlah ghost (`deliveredCU`, `defaultedCU`, `voluntaryDefaultedCU`, `disputesLost`, `strikes`) | `invariant_ReputationMatchesGhosts` | NICE | [D-33] |
| SYS-16 | Tidak ada kontrak Paron yang membaca `PrintIndex`/`ReferenceFeed` di jalur payout (diuji statis: daftar call graph 01 §8, bukan runtime) | review / Slither | NICE | design §1 |

### 3.2 Desain handler (prosa)

**Setup.** Deploy semua kontrak nyata (bukan mock) dengan set parameter **demo** (ack 60, delivery 60, dispute 90, ruling 120 dtk, timelock 5 menit) [D-20], `allowOpenWindow` [D-19], gate `RegistryGate` (cepat, tanpa EAS) dengan perilaku yang sama dengan `EASGate` (INV-GATE-3). Buat 3 series yang window-nya sudah terbuka:
- `A1`: provider A, H100, 500 CU @ 3.00, bond 4.50;
- `A2`: provider A, H200, 140 CU @ 4.06, bond 6.09;
- `B1`: provider B, H100, 200 CU @ 3.00, bond 4.50.

Dua series milik provider yang sama menguji isolasi bond dalam satu provider, bukan hanya antar provider. `PanelArbitrator` nyata dengan 3 kunci panel.

**Aktor.**
- `providerA`, `providerB`: entity berbeda, juga bertindak sebagai agent.
- `holder1` dan `holder1b`: **satu entity**, untuk memancing self-match.
- `trader`: entity lain.
- `outsider`: tanpa KYB; dipakai untuk `claimDefault`, `finalizeRedemption`, `resolveNoRuling`, `finalizeSeries`, `poke`, relayer putusan.
- `panel1..3`: kunci yang menandatangani putusan.
- `treasury`.

Semua aktor terverifikasi kecuali `outsider` dan `treasury`.

**Aksi handler** (input di-`bound`; handler memilih objek yang ada dan menyaring prasyarat dasar supaya sebagian besar panggilan tidak revert sia-sia; `fail_on_revert = false`):
1. `buy(actor, series, qty)`: qty 1–50 CU, `maxCost` = quote persis. **[D-52]** qty dibulatkan ke kelipatan `1e18` (sesekali qty pecahan untuk memastikan `InvalidLot`).
2. `placeOrder(actor, series, side, priceTicks, qty, ioc)`: harga 2.50–4.50 di tick 0.01, qty 1–20 CU.
3. `cancelOrder(orderSeed)`.
4. `transferCU(from, to, series, amount)`: termasuk sesekali setelah `windowEnd` untuk SYS-9.
5. `requestRedemption(holder, series, amount)`.
6. `acknowledge(reqSeed)`, `markDelivered(reqSeed)`: oleh provider; kadang "agent mati" (dilewati).
7. `confirm(reqSeed)`, `dispute(reqSeed)`: oleh holder.
8. `finalizeRedemption(reqSeed)`, `claimDefault(reqSeed)`, `resolveNoRuling(reqSeed)`: oleh `outsider`.
9. `rule(reqSeed, outcome)`: 2 dari 3 tanda tangan panel, direlay `outsider`.
10. `declineAndPay(reqSeed)`: oleh provider [D-33]; hanya sukses sebelum deadline aktif [D-47]; setelah deadline harus revert, ghost transisi menandai pelanggaran.
11. `warp(seconds)`: 0–300 dtk, supaya deadline 60/90/120 dtk sering terlewati.
12. `warpPastWindowEnd()`: jarang (bobot rendah), lalu `finalizeSeries` dan `withdrawRemaining`.
13. `poke(gpuModel)`.

**Variabel ghost** (diperbarui hanya kalau panggilan sukses, dari nilai return/log):
- `ghost_usdcMinted`;
- `ghost_cuMinted[s]`, `ghost_cuBurned[s]`;
- `ghost_released[s]`, `ghost_slashed[s]`, `ghost_withdrawn[s]`;
- `ghost_primaryFees`, `ghost_takerFees`;
- `ghost_payoutCount[reqId]` dan `ghost_payoutAmount[reqId]`;
- `ghost_lastState[reqId]` + `ghost_invalidTransition` (bool, di-set kalau pasangan (lama, baru) bukan T1–T13);
- `ghost_selfMatchPrints` (dari log `Trade`);
- `ghost_indexMovedByIneligible` (bool: `answer` berubah setelah print tidak eligible);
- `ghost_otherSeriesBondChanged` (bool: snapshot `bondOf` semua series lain sebelum/sesudah tiap aksi);
- `ghost_postWindowUserTransfer` (bool);
- `ghost_delivered[provider]`, `ghost_defaulted[provider]`, `ghost_voluntary[provider]`, `ghost_disputesLost[provider]`, `ghost_strikes[provider]`.

**Fungsi invariant** membaca state kontrak + ghost dan memeriksa SYS-1..SYS-15. Bool ghost harus tetap `false`.

**Konfigurasi run:** `runs`/`depth` = [T2-01, APPROVED sebagai angka kerja]: 256 runs × depth 64 lokal, lebih kecil di CI kalau waktu build > 5 menit (penyetelan dicatat di README). Seed fuzz dicatat di CI supaya kegagalan bisa diulang.

**Versi awal Jumat (shortlist #16):** hanya aksi 1, 5, 6, 7 (confirm), 8 (claimDefault), 11 dan SYS-1 + SYS-10. Aksi lain ditambahkan di slot 16–20 setelah `OrderBook` dan `PanelArbitrator` ada.

---

## 4. Suite acceptance end-to-end (cermin 05)

### 4.1 Bentuk suite

| Test | Jenis | Prio | Maksud | Ref |
|---|---|---|---|---|
| `test_E2E_StageScript` | e2e (lokal, `vm.warp`) | **MUST** | S-01..S-13 berurutan di atas fixture seed 05 fase 0–2 (series 1–3 + ask F-4); semua assert di §4.2 dan §4.3 | 05 §3.4, [D-25] |
| `test_E2E_DisputeBranches` | e2e (lokal, snapshot/revert) | SHOULD | langkah dispute 05 D-01..D-04a/b/c dari state akhir panggung | 05 §3.6, [D-21], [D-36], [D-37] |
| `testFork_E2E_StageScript` | fork (anvil fork RH Testnet) | SHOULD | test yang sama di atas fork; menangkap kejanggalan chain (precompile, gas, `block.timestamp`) | stack §4.6 "fork tests" |
| `testFork_DeployAll_WiringAndRoles` | fork | SHOULD | setelah skrip deploy: semua alamat terhubung, role sesuai 01 §7, Timelock memegang `setFactor`/`setPanel`. **[APPROVED D-54, Jum 9 Okt ~11:05 WIB, hackathon saja]**: `EXECUTOR_ROLE` dipegang `address(0)`; `PROPOSER_ROLE` = Safe + `W-ADMIN`; attester tepercaya = `W-VERIFIER` | stack §4.6 |
| Gladi testnet (05 fase 3, manual, checklist 05) | manual | **MUST** | sama dengan `test_E2E_StageScript`, di deployment yang dipakai panggung | design §7.4 |

Catatan:
- Urutan **panggung** dipakai (S-10 sebelum S-11, 05 §3.4). Waktu di test = waktu blok relatif; jarak `warp` mengikuti window demo [D-20].
- `test_E2E_StageScript` dan gladi memakai **akun yang sama secara peran**: `W-P-JKT`, `W-BUY`, `W-BUY2`, `W-TRD`, `W-JUDGE` tanpa KYB.
- Saldo awal per 05 §3: buyer 1,000, wallet 2 997, trader 1,000, `W-P-JKT` 6,760 sebelum S-01.

### 4.2 Langkah dan assert

| Langkah | Given / When | Then (assert minimum) | Ref |
|---|---|---|---|
| E2E-01 (S-01) | `W-P-JKT` terverifikasi, permit `BondVault` 2,250 / `createSeriesWithPermit` 500 CU @ 3.00, bondPerCU 4.50 | `seriesId == 4`; token == `predictTokenAddress(4)`; `bondOf(4).balance == 2_250_000_000`; USDC provider 4,510.000000; sale & redeem window terbuka | [D-19], [D-30] |
| E2E-02 (S-02) | buyer `buy(4, 20e18, 60_000_000)` | cost 60_000_000, fee 600_000; buyer 940.000000, CU 20; provider 4,569.400000; `sold` 20 | [D-13] |
| E2E-03 (S-03) | trader `buy(4, 10e18, 30_000_000)` | trader 970.000000, CU 10; provider 4,599.100000; `sold` 30 | |
| E2E-04 (S-04, S-05) | trader `approve(OrderBook, 5e18)`, `placeOrder(4, Ask, 3_200_000, 5e18, false)` | `orderId == 2`; `bestAsk(4) == (3_200_000, 5e18)`; CU OrderBook 5 | 05 P5-05 |
| E2E-05 (S-06) | wallet 2 `placeOrder(4, Bid, 3_200_000, 5e18, true)` | satu `Trade` eligible; wallet 2 980.976000, CU 5; trader 986.000000; treasury +0.024000; book kosong; indeks H100 `THIN → OK`, answer 3_200_000, round 1. **[D-51]** tidak ada `OrderPlaced` untuk bid IOC wallet 2 (05 T5-06) | [D-15], [D-22], [D-35] |
| E2E-06 (S-07..S-09) | buyer redeem 8; `warp ≤ 3` dtk; provider `acknowledge(1)`; `markDelivered(1, receiptHash1)` | `reqId 1`; state `Delivered`; `disputeDeadline = t + 90`; `openRequestCount(4) == 1` | [D-38], [D-26] |
| E2E-07 (S-10) | buyer redeem 10 (agent mati) | `reqId 2`, `Requested`; CU bebas buyer 2; `openRequestCount == 2` | |
| E2E-08 (S-11) | buyer `confirm(1)` | burn 8; bond 2,214.000000; provider 4,635.100000; `totalSupply` 22; `deliveredCU = 8e18` | |
| E2E-09 (S-12) | buyer `placeOrder(3, Bid, 3_100_000, 1e18, true)` melawan ask F-4 wallet 2 | revert `SelfMatch()`; tidak ada print; ask F-4 tetap | [D-35] |
| E2E-10 (S-13 negatif) | `warp` sampai **tepat** `ackDeadline(2)`; `W-JUDGE` `claimDefault(2)` | revert `NotDefaultable` | 01 T3 |
| E2E-11 (S-13) | `warp +1`; `W-JUDGE` `claimDefault(2)` | buyer 985.000000; `W-JUDGE` 0; bond 2,169.000000; `totalSupply` 12; `defaultedCU = 10e18`; `strikes = 1`; `bondOf(1..3)` tidak berubah | design §7.1, stack §4.6 (2), (6) |

### 4.3 Assert state akhir (05 §3.5)

| Item | Nilai yang di-assert |
|---|---|
| Bond series 4 | `2_169_000_000` |
| Coverage | `bondPerCU ÷ reference` = 4.50 ÷ 3.00 (referensi sintetis H100 dari `ReferenceFeed`, seed F-5) = **1.50** [D-34], [D-06]. Rasio ini dihitung API (§5 API-05); di Foundry cukup assert `bondPerCU == 4_500_000` dan nilai feed H100 `3_000_000` kalau `ReferenceFeed` di-deploy |
| Invariant bond | `4.50 × 12 = 54 ≤ 2,169` ✓ [D-18] |
| Saldo USDC | buyer 985.000000; wallet 2 980.976000; trader 986.000000; `W-P-JKT` 4,635.100000; treasury 0.954000 (0.030000 seed F-4 + 0.924000 panggung) |
| Konservasi USDC series 4 | buyer −15.000000 + wallet 2 −16.024000 + trader −14.000000 + provider −2,124.900000 + treasury +0.924000 + BondVault(s4) +2,169.000000 = **0** |
| Konservasi CU series 4 | mint **30** (`sold`), burn **18** (8 confirm + 10 default), dipegang **12** = buyer 2 + wallet 2 5 + trader 5; RM 0, OrderBook 0 |
| Reputasi JKT | delivered 8, defaulted 10, strikes 1, disputesLost 0 |
| Indeks H100 | `OK`, 3_200_000, round 1 |
| Series lain | `bondOf(1) = 3_240_000_000`, `bondOf(2) = 8_526_000_000`, `bondOf(3) = 8_370_000_000` tidak berubah sejak seed |

### 4.4 Cabang dispute (langkah 05 §3.6 D-01..D-04)

Dari state akhir: wallet 2 redeem 4 CU (klaim 18.000000), ack, delivered, `dispute(3)` dengan dispute bond **5.000000** (max(0.90; 5.00)), wallet 2 975.976000. Lalu snapshot "S4":

| Cabang | Then |
|---|---|
| D-04a `Delivered` (2 dari 3 tanda tangan) | bond 2,151.000000; provider 4,658.100000 (+18 +5); wallet 2 975.976000, CU 1; `disputesLost 0` [D-21] |
| D-04b `NotDelivered` | wallet 2 998.976000 (+18 +5), CU 1; bond 2,151.000000; `disputesLost 1`; `strikes 2`. **[D-56]** `Defaulted.caller` = alamat `PanelArbitrator` (05 T5-08) |
| D-04c tanpa putusan (`warp 121`) → `resolveNoRuling` | `Refunded`; wallet 2 980.976000, CU 5; bond 2,169.000000; reputasi tetap; `ruleWithSignatures` setelah deadline → `RulingDeadlinePassed` |

Konservasi USDC dan CU (§3.1 SYS-4, SYS-5) di-assert lagi setelah tiap cabang.

---

## 5. Acceptance indexer/API (terhadap 03)

**Kapan:** setelah `test_E2E_StageScript`-setara dijalankan di anvil + Ponder (05 fase 3), dan sekali lagi di deployment panggung.
- Prioritas: cek **manual** pre-demo (checklist di bawah) = **MUST**.
- Otomatisasi Vitest/HTTP = NICE (stack §4.6).

Angka = state akhir 03 §3.3 / 05 §3.5.

| ID | Endpoint (03) | Assert | Prio | Ref |
|---|---|---|---|---|
| API-01 | E18 health | `synced true`; `indexed_block` ≥ blok tx S-13; lag ≤ beberapa blok | **MUST** | 03 |
| API-02 | E1 `/v1/prints?gpu=H100&limit=3` (`curl` panggung) | terbaru dulu (`ts` desc, lalu `log_index` desc, P3-20); print teratas = TRADE series 4, `cu_price "3.200000"`, `qty_cu "5"`, `fee_usd "0.024000"`, `eligible true`, `index_status "OK"`; print PRIMARY series 4 (10 dan 20 CU @ 3.000000) `eligible false`, `ineligible_reason "PRIMARY"`; `gpu_count null` | **MUST** | 03 §3 E1, 05 S-02, S-06 |
| API-03 | E1 `format=csv` | `text/csv`; header = nama field JSON dengan urutan tabel field 03; jumlah baris = respons JSON yang sama | SHOULD | 03 P3-18 |
| API-04 | E2 `/v1/index/H100` | `status OK`, `value "3.200000"`, `participants 2`, `eligible_volume_cu "5"`; sebelum S-06 `THIN` dengan `value null` | **MUST** | [D-15], [D-16] |
| API-05 | E5 `/v1/series/4` | `bond.balance "2169.000000"`, `bond.released "36.000000"`, `bond.slashed "45.000000"`, `bond.health "0.964"`, `coverage "1.50"`, `redemption_stats.delivered_cu "8"`, `defaulted_cu "10"`, `open_requests 0`; `sold_supply` 30, `total_supply` 12 | **MUST** | [D-34], 03 §3.8 |
| API-06 | E6 orderbook series 4 | bids & asks kosong; series 3 masih ask F-4 | SHOULD | |
| API-07 | E10/E11 redemptions | req 1 `FINALIZED`, `bond_released "36.000000"`; req 2 `DEFAULTED`, `payout "45.000000"`, `voluntary false`, `default_caller` = `W-JUDGE` (holder tetap buyer); `timeline` E11 urut waktu | **MUST** | 03 §3.13–3.14 |
| API-08 | E10 `?holder=…&state=DEFAULTABLE` | req 2 tampil `state "DEFAULTABLE"`, `stored_state "REQUESTED"` begitu `now_s > ack_deadline` tanpa event baru (detik dan perbandingan ketat sama dengan `stateOf`) | **MUST** | 03 §3.13, P3-33 |
| API-09 | E12 `/v1/providers/W-P-JKT` | total bond `deposited "5490.000000"`, `balance "5409.000000"`, `released "36.000000"`, `slashed "45.000000"`; rincian per series cocok (s1 3,240/3,240; s4 2,250/2,169); `delivered_cu "8"`, `defaulted_cu "10"`, `strikes 1` | **MUST** | 03 §3.15 (diperbaiki), 05 X-2 |
| API-10 | E9 `/v1/accounts/{addr}/statement` | buyer: `summary.usdc_out "60.000000"`, `usdc_in "45.000000"`, `default_payouts "45.000000"`, `cu_bought "20"`, `cu_redeemed "18"`; Σ `usdc_delta` per akun = selisih saldo onchain sejak seed (buyer −15.000000, trader −14.000000, wallet 2 −16.024000) | SHOULD | 03 §3.12, 05 §3.5 |
| API-11 | Winsorized | dengan 1 print, nilai winsorized = VWAP = 3.200000 | NICE | [D-16] |
| API-12 | Error | ID tidak dikenal → 404 `NOT_FOUND`; parameter salah / `limit > 1000` → 400 `INVALID_PARAM`; body `{ "error": { "code", "message", "details" } }` | SHOULD | 03 P3-24 |
| API-13 | Field kosong | `gpu_count`/field yang tidak diketahui tampil `null`, tidak dikarang | SHOULD | 03 |
| API-14 | Label | E15 `/v1/reference/H100` → `value "3.000000"`, label "synthetic demo data"; `reference` di E2 berlabel sama | SHOULD | [D-06], design §10.5 #2 |
| API-15 | E23 `/v1/timelock/operations` (03 §3.26) | operasi `setFactor` A100 yang dijadwalkan dari `/admin` tampil `PENDING` → `READY` setelah 5 menit → `DONE` setelah execute; `id` sama dengan event `CallScheduled` | **MUST** (must-not-cut sitemap §9.1) | 01 §7.1, 03 X-8 |
| API-16 | E20 `/v1/kyb/applications` (03 §3.23) | pengajuan `KybApplication` uji tampil `PENDING`; setelah verifier menerbitkan `ParticipantVerified` (`refUID`) tampil `APPROVED`. Jalur fallback D: hanya attestation `ParticipantVerified` yang muncul di E13 | SHOULD | [D-41], 03 X-10 |
| API-17 **[D-48]** | Envelope semua endpoint (03 §3.1) | `meta.server_now_ms` ada dan selisihnya dengan jam nyata ≤ 2 dtk, juga saat chain sepi (tidak ada blok baru beberapa menit); di mode anvil = waktu chain (P5-15). Countdown S4 tidak berhenti saat `indexed_block` tidak maju | SHOULD | AUDIT SC-4, 03 §2.4 |

---

## 6. Rekap jumlah

Dihitung dari tabel di atas (diperbarui Jum 9 Okt ~10:30 WIB setelah sinkronisasi 01: +5 test Foundry, +2 cek API). Baris dengan dua nama test (`… / …`) dihitung sebagai dua test.

**Diperbarui Jum 9 Okt 2026 ~11:05 WIB (audit PE), final ~11:15 WIB:** audit menambah +11 test Foundry (MUST +0, SHOULD +7, NICE +4), +1 invariant (INV-OB-9), +1 cek API (API-17, SHOULD); semuanya **APPROVED** ~11:12 WIB (07 §10.5), jadi angka di bawah adalah angka spec final. `test_RefundAfterWindowEnd_AllowsReRequestInGrace` → `test_RefundAfterWindowEnd_ReopensRequestInGrace` = penggantian, jumlah tetap. Tidak ada test MUST baru, jadi shortlist §0 dan gate MUST tidak berubah. (Angka sebelum audit, untuk riwayat: 74 / 40 / 73 / 23 / 136; API 16.)

| Bagian | Invariant | MUST | SHOULD | NICE | Total test |
|---|---|---|---|---|---|
| 2.1 `ProviderRegistry` | 3 | 0 | 7 | 2 | 9 |
| 2.2 `ConversionTable` | 3 | 2 | 2 | 1 | 5 |
| 2.3 `SeriesFactory` | 6 | 5 | 11 | 3 | 19 |
| 2.4 `CUToken` | 5 | 2 | 3 | 3 | 8 |
| 2.5 `BondVault` | 5 | 2 | 3 | 1 | 6 |
| 2.6 `PrimarySale` | 4 | 3 | 5 | 2 | 10 |
| 2.7 `OrderBook` | 9 | 2 | 15 | 1 | 18 |
| 2.8 `RedemptionManager` | 9 | 10 | 12 | 2 | 24 |
| 2.9 `PanelArbitrator` | 4 | 1 | 4 | 3 | 8 |
| 2.10 `PrintIndex` | 4 | 2 | 3 | 2 | 7 |
| 2.11 `ReferenceFeed` | 2 | 0 | 0 | 3 | 3 |
| 2.12 `MockUSDC` | 2 | 0 | 3 | 1 | 4 |
| 2.13 Gate | 3 | 1 | 4 | 2 | 7 |
| 3 Sistem (`invariant_*`) | 16 | 9 | 5 | 1 (+1 review/Slither) | 15 |
| 4 E2E/fork (Foundry) | — | 1 | 3 | 0 | 4 |
| **Total Foundry** | **75** | **40** | **80** | **27** | **147** |
| 4 Gladi testnet (manual) | — | 1 | — | — | 1 |
| 5 API (cek) | — | 8 | 8 | 1 | 17 |

Acceptance criteria: 20 (AC-*) + 11 langkah E2E (§4.2) + 3 cabang dispute (§4.4).

---

## 7. Ketergantungan D-xx

Semua keputusan 07 di tabel ini **APPROVED** (Jum 9 Okt 2026 ~09:40 WIB, Fatih) dengan opsi rekomendasi, jadi test ditulis persis seperti di bawah. Kolom "Kalau berubah" dipertahankan sebagai catatan kalau Fatih membuka ulang keputusan.

| D | Topik | Test / invariant yang bergantung | Kalau berubah |
|---|---|---|---|
| D-01 | Proceeds langsung ke provider | `test_Buy_SplitsFeeAndMints`, INV-PS-2, SYS-5 | Escrow sebagian → `PrimarySale` punya saldo; INV-PS-2 "saldo 0" diganti akuntansi escrow |
| D-02 | Window bulan kalender | `testFuzz_CreateSeries_Bounds` | Window bebas → fuzz window bebas tetap |
| D-03 | Arbitrator demo | `test_RuleWithTwoOfThreeSignatures`, §4.4 | Arbitrator lain → mode putusan di §2.9 diganti |
| D-04 | Attester KYB = Safe tim (hackathon: `W-VERIFIER`, D-54 APPROVED ~11:05 WIB) | `test_RevertWhen_WrongSchemaOrUntrustedAttester` | Attester lain → hanya fixture |
| D-06 | `ReferenceFeed` NICE | §2.11, coverage di §4.3/API-05, API-14 | Tanpa feed → `coverage null`, test RF dihapus |
| D-09 | Faktor A100/RTX4090 | `test_InitialFactors` | Angka faktor di fixture |
| D-13 | Treasury + fee | INV-PS-2, INV-OB-6, SYS-14, E2E-02/05 | Angka fee dan saldo treasury 0.954 |
| D-14 | `finalizeSeries` | INV-SF-5, AC-SF-3, test finalize/withdraw | Syarat finalisasi |
| D-15 | Status indeks + parameter demo | INV-PI-3, `test_FirstEligibleFill_ThinToOk`, E2E-05, API-04 | Kalau `minParticipants` > 2 atau `minVolume` > 5 CU, adegan THIN→OK tidak terjadi dengan 1 fill |
| D-16 | Winsorization offchain | §2.10 catatan, API-11 | Onchain → test winsor pindah ke Foundry |
| D-17 | Maks 10 level | `test_RevertWhen_TooManyPriceLevels` | Angka level |
| D-18 | Bentuk invariant bond | SYS-1, INV-BV-5, shortlist #16, §4.3 | Bentuk `supply + locked` → hitung ganda (01 P-36), invariant terlalu ketat untuk bond yang sama |
| D-19 | `allowOpenWindow` demo | AC-SF-2, `test_DemoDeployment_AllowsOpenWindow`, fixture semua test | Tanpa flag → semua fixture pakai window masa depan + `warp` |
| D-20 | Window demo 60/60/90/120 dtk | fixture, `test_RevertWhen_WindowsOutOfBounds`, handler `warp` | Angka `warp` |
| D-21 | Dispute bond → provider saat Delivered | AC-RM-3, shortlist #10, D-04a | Kalau sebagian ke arbitrator, saldo provider 4,658.10 berubah |
| D-22 | Field `Trade` | INV-OB-8, E2E-05 | Assert event |
| D-23 | Nama gate | §2.13 | Nama kontrak/test |
| D-24 | Schema provider/role | AC-REG-1, INV-GATE-1 | Field attestation |
| D-25 | Jumlah series seed | fixture E2E (series 1–3), §4.3 "series lain" | Angka `bondOf(1..3)` |
| D-26 | `receiptHash` | E2E-06, `test_RevertWhen_MarkDeliveredZeroReceipt` | Receipt EAS → test tambahan |
| D-28 | Kenaikan harga primer | INV-SF-1, `test_RaisePrimaryPrice_OnlyUpAndWithinFloor` | |
| D-29 | Transfer setelah `windowEnd` | INV-CU-3, INV-OB-7, SYS-9, `test_SystemTransfersAllowedAfterWindowEnd`, `test_RefundAfterWindowEnd_ReopensRequestInGrace` (mekanisme D-46) | Pengecualian sistem |
| D-30 | Permit | AC-SF-1, E2E-01, `test_Permit_SetsAllowanceForBondVault` | Tanpa permit → 2 tx |
| D-31 | KYB semua buyer/trader | INV-PS-4, `test_RevertWhen_BuyerNotVerified`, `test_RevertWhen_TraderNotVerified` | Buyer tanpa KYB → test revert dihapus; definisi `eligible` tetap butuh entity |
| D-32 | Cakupan pause | `test_Pause_BlocksBuyAndNewOrdersOnly` | |
| D-33 | `declineAndPay` + counter | INV-REG-2, `test_DeclineAndPay_VoluntaryDefault`, `test_RecordDefault_VoluntaryVsForced`, SYS-15 | Tanpa T13 → test dihapus, INV-RM-1 kehilangan satu jalur |
| D-34 | Rumus coverage | §4.3, API-05 | Angka 1.50 |
| D-35 | Self-match revert + `eligible` | INV-OB-3/4, AC-OB-2, E2E-09, SYS-7 | Opsi skip-resting → assert "tidak revert, tidak ada print" |
| D-36 | Mode putusan panel | §2.9, §4.4 | |
| D-37 | Dispute bond di RM + ruling deadline | INV-RM-5, SYS-12, AC-RM-5 | |
| D-38 | `lockFrom` | `test_LockFrom_MovesToRMWithoutAllowance`, E2E-06/07, SYS-12 | Approve dulu → fixture menambah `approve` |
| D-39 | `leadTime` | INV-PS-4, INV-SF-6, `test_RevertWhen_SaleClosed` | |
| D-40 | Paket default (fee cap, faucet) | `test_RevertWhen_SetPrimaryFeeAboveCap`, `test_Faucet_Cooldown` | Angka |
| D-02 + D-19 (01 §6.3 sinkron) | `enforceCalendarMonth` | `test_RevertWhen_NotCalendarMonth` | — |
| D-41 | Schema `KybApplication` | tidak ada test Foundry (bukan kontrak Paron); cek manual API-15 | — |

**Keputusan audit PE (07 §11): semua APPROVED** (D-54 ~11:05 WIB; lainnya ~11:12 WIB, 07 §10.5). Kolom terakhir dipertahankan sebagai catatan kalau Fatih membuka ulang keputusan.

| D | Topik | Test / invariant yang bergantung | Kalau dibuka ulang |
|---|---|---|---|
| D-45 | Role provider wajib | INV-REG-1/3, `test_RevertWhen_BuyerRegistersAsProvider` (SHOULD) | Test dihapus (REG 8 test) |
| D-46 | Reopen pasca-window di RM | INV-RM-1 (T12b), SYS-9 (catatan), `test_RefundAfterWindowEnd_ReopensRequestInGrace` (menggantikan test D-29) | Test D-29 lama tetap tidak bisa lulus kecuali `_update` diberi pengecualian (opsi A D-46) |
| D-47 | `declineAndPay` sebelum deadline | INV-RM-1, handler aksi 10, `test_RevertWhen_DeclineAndPayAfterDeadline` (SHOULD) | Test dihapus |
| D-48 | Jam tombol Claim default | API-17 (SHOULD) | Cek dihapus (API 16) |
| D-49 | `SeriesFactory.setGate` | `test_SetGate_OnlyTimelockEmitsGateUpdated` (maksud), `test_SetGate_NewSeriesUseNewGate` (NICE) | Test dihapus |
| D-50 | Liveness institusional | INV-CU-4, `testFuzz_InstitutionalReturnToRevokedHolder` (NICE) | Test dihapus |
| D-51 | Sisa saat batas fill + `OrderPlaced` | INV-OB-9, `test_MaxFills_NoCrossedBook` (SHOULD), E2E-05 (catatan) | Invariant + test dihapus; T5-06 kembali TBD |
| D-52 | Lot 1 CU | INV-OB-5, handler aksi 1–2, `test_RevertWhen_OrderBelowMinQty` + `test_RevertWhen_BuyNotWholeLot` (SHOULD) | Test dihapus |
| D-53 | `PrintIndex` tumbling + try/catch | INV-PI-3, INV-OB-8, `test_TumblingWindow_ResetsAndCountsUniqueEntities` + `test_IndexFailure_DoesNotBlockTrade` (SHOULD) | Test dihapus |
| D-54 | Attester/proposer EOA, executor terbuka | `test_RevertWhen_WrongSchemaOrUntrustedAttester` (fixture), `testFork_DeployAll_WiringAndRoles` (assert role) | Fixture kembali ke Safe (D-04) |
| D-55 | Hardening kecil (a–d) | `test_LinkAttestation_RejectsOlderUid`, `test_CreateSeriesWithPermit_PermitAlreadyUsed` (NICE), `test_SafeModeRule_ThresholdOne` (maksud) | Test dihapus per butir |
| D-56 | `Defaulted.caller` lewat putusan | §4.4 D-04b | T5-08 kembali TBD |

Tidak dipakai di 02: D-05, D-07, D-08 (tim solo; urutan kerja test di doc 08), D-10, D-11, D-12, D-27 (tidak memengaruhi perilaku kontrak/test).

---

## 8. Register usulan P2-xx (APPROVED Jum 9 Okt 2026 ~09:40 WIB)

Semua P2-01..P2-08 disetujui bersama rekomendasi 07.

| ID | Usulan | Alasan | Bagian |
|---|---|---|---|
| P2-01 | Identitas akuntansi `balance = deposited − released − slashed` (sebelum withdraw) dijadikan invariant eksplisit, dan `withdrawRemaining` membuat `balance = 0` | Field sudah ada di `SeriesBond` (01 §6.5), tetapi 01 §10 tidak menyatakannya sebagai invariant; 03 E5 menampilkan angka yang sama | §1, INV-BV-1, SYS-2 |
| P2-02 | `claim = floor(bondPerCU × amount / 1e18)` | Pembulatan tidak pernah melanggar SYS-1; 01 tidak menyebut arah | §1, INV-RM-7, SYS-10 |
| P2-03 | `fee = floor(cost × bps / 10_000)`; notional fill `ceil` untuk taker beli, `floor` untuk taker jual | Protokol tidak pernah kurang bayar; angka demo tidak terpengaruh (semua pas) | §1 |
| P2-04 | `escrowRemaining` USDC per order bid | Hindari debu pembulatan pada partial fill; INV-OB-2 jadi kesetaraan persis | §2.7, SYS-13 |
| P2-05 | `MockArbitrator` khusus test yang memanggil `onRuling` langsung | Test dispute (shortlist #10–12) bisa ditulis sebelum `PanelArbitrator` ada (slot 16–20) | §0 |
| P2-06 | Handler invariant memakai `RegistryGate`, bukan `EASGate` | Tanpa deploy EAS lokal; INV-GATE-3 menjamin perilaku sama | §3.2 |
| P2-07 | E2E memakai urutan panggung (S-10 sebelum S-11) dan menambah assert negatif tepat di `ackDeadline` (E2E-10) | Sama dengan yang dilihat juri; batas `>` ketat terbukti di urutan nyata | §4.2 |
| P2-08 | Cek API manual pre-demo = MUST, otomatisasi Vitest = NICE | Waktu 27 jam; stack §4.6 menandai E2E/Vitest NICE | §5 |

## 9. Register T2-xx

T2-01 memakai angka kerja yang sudah ada (256 × 64), dianggap APPROVED; hanya penyetelan CI yang menunggu waktu build nyata.

| ID | Hal | Kenapa belum bisa diputuskan | Bagian |
|---|---|---|---|
| T2-01 | `runs`/`depth` invariant di CI | Bergantung waktu build nyata Jumat; usulan awal 256 × 64 lokal | §3.2 |

TBD dari dokumen lain yang masih terbuka dan memengaruhi test: 01 T-02 (`maxFillsPerTx`, untuk `test_Gas_MatchingLoopBounded`). Terjawab ~11:12 WIB: 05 T5-06 (tidak ada `OrderPlaced` untuk taker IOC yang terisi penuh, D-51; assert E2E-05) dan 05 T5-08 (`Defaulted.caller` = `PanelArbitrator`, D-56; assert D-04b).

---

## 10. Divergensi

| ID | Dengan | Isi | Sikap 02 |
|---|---|---|---|
| X2-1 | 01 §10 I1 | I1 dulu menulis `bondPerCU × (supply + locked)`; 02 memakai bentuk kerja `× totalSupply` | **RESOLVED** (Jum 9 Okt): 01 §10 I1 kini menulis bentuk kerja (D-18 APPROVED) |
| X2-2 | 05 §3.5 | 05 menulis coverage "4.50 ÷ 3.00" tanpa menyebut penyebut; 03/[D-34] = `bondPerCU ÷ reference` | Ikut 03: penyebut = referensi sintetis 3.00 (kebetulan sama dengan harga primer series 4) |
| X2-3 | 01 (pembulatan) | 01 hanya menyebut `ceil` untuk cost primer dan escrow bid | **RESOLVED**: P2-02, P2-03, P2-04 APPROVED (01 P-01 tetap aturan umum) |
| X2-4 | design §7.1 | "Dispute → both rulings" idealnya memakai panel nyata; shortlist #10–11 memakai mock | Panel nyata di `test_RuleWithTwoOfThreeSignatures` + §4.4 (P2-05) |
| X2-5 | 03 §3.3 | Timeline 03: S-11 sebelum S-10; E2E memakai urutan panggung 05 | Angka akhir identik (05 §3.5) |
| X2-6 | 05 S-13 | 05 tidak punya assert "tepat di deadline" | Ditambahkan E2E-10 (P2-07) |
| X2-7 | 03 E12 (lama) | Contoh E12 dulu hanya series 4 (2,250/2,169) | **Sudah diperbaiki di 03 §3.15**: total 5,490/5,409 + rincian per series; API-09 memakai angka baru |
| X2-8 | 01 §6.4 vs §6.8.1 (D-29) | `test_RefundAfterWindowEnd_AllowsReRequestInGrace` dan SYS-9 saling bertentangan: request ulang pasca-window butuh transfer holder → RM yang diblokir `_update` aturan 1 (AUDIT SC-2) | **Selesai (D-46 APPROVED ~11:12 WIB):** test diganti versi reopen; SYS-9 tetap |

Tidak ada divergensi angka dengan 05: semua nilai §4 diambil dari 05 §3.4–§3.6.
