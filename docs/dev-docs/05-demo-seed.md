# Paron: skenario demo + spesifikasi seed (dev doc 05)

> **[D-82, APPROVED Fatih Jum 9 Okt 2026 ~15:34 WIB, via handler]:** nama series demo yang live = `CU-JKT-H100-2611`. Seed kontrak series 1 tidak diubah. Catatan D-19/D-25 (series panggung `CU-JKT-H100-2610`, window, `series_id`, input skrip seed/forge) tetap historis; yang digantikan hanya penamaan live. String `2610` yang mengikat window, `series_id`, atau input skrip tidak ditulis ulang di dokumen ini.


Status: **APPROVED-SYNCED, spec saja.** Keputusan 07 dan P5-xx disetujui Fatih (Jum 9 Okt 2026 ~09:40 WIB); disinkronkan Jum 9 Okt ~10:30 WIB (event `ReputationUpdated` dengan `strikes`, tim solo, X-6/X-7 selesai). Cadangan: `.bak-2026-10-09-pre-approval/`. Isinya prosa dan langkah semu bernomor. **Tidak ada script dalam bahasa apa pun.** Disusun Kamis 8 Okt 2026, ~21:20 WIB. Kode (termasuk `script/Seed.s.sol`, stack §4.4) baru ditulis mulai Jumat 9 Okt 09:00 WIB.

**Changelog Jum 9 Okt 2026 ~11:07 WIB (audit Principal Engineer; cadangan `.bak-2026-10-09-pre-audit/`):**
- **Perbaikan langsung SC-17 (teks basi, mengikuti keputusan yang sudah APPROVED):** §3.1 faktor A100/RTX → "A100 4_500; RTX 4090 tidak dimasukkan" (07 D-09, 01 §2.2); §4.1 dan §4.2 "salt CREATE2 baru" → "deployment baru (nonce deployer baru, label `DEPLOY_LABEL` baru)" (04 P4-13, 07 V-8, §4.5).
- **APPROVED ~11:05 WIB (07 §10.4) dan diterapkan:** D-54 (wallet baru `W-VERIFIER`, `W-ADMIN`; KYB fase 1 dari `W-VERIFIER`); D-57 (go/no-go maks. 45 menit; Fatih sudah punya saldo RH di 2 akun).
- **APPROVED ~11:12 WIB (07 §10.5), kini spec (tag `[D-xx]`):** D-48 (P5-16 diganti aturan jam tunggal; P5-15 tetap untuk anvil), D-51 (T5-06 terjawab), D-56 (T5-08 terjawab), D-58 (P5-23 S0-kritis).

**Changelog Jum 9 Okt 2026 ~11:17 WIB:** konversi usulan → spec setelah approval Fatih ~11:12 WIB; T0 = 11:14 WIB ("go" Fatih), jadi "sebelum T0+8h" = sebelum **19:14 WIB**; go/no-go selesai paling lambat 11:59 WIB, gagal → langsung Arbitrum Sepolia (04 §8). Cadangan: `.bak-2026-10-09-pre-1112/`.

**Sumber:** `paron-design.md` **(design §x)**, `paron-product-knowledge.md` **(PK §x)**, `paron-stack.md` **(stack §x)**, `open-questions-research.md` **(OQR)**, `notes.md`; konsistensi dengan dev doc **01** (fungsi, event, parameter), **07** (keputusan D-xx, semuanya APPROVED Jum 9 Okt ~09:40 WIB kecuali D-10) dan **03** (endpoint E1–E18, contoh data §3.3).

**Legenda:** **[D-xx]** = keputusan 07, **APPROVED** (Jum 9 Okt 2026 ~09:40 WIB, Fatih). **[P5-xx]** / **[APPROVED P5-xx]** = usulan dokumen ini, disetujui bersama rekomendasi 07. **[APPROVED P5-26]** = bot trader otomatis (adaptasi tim solo), disetujui terpisah Jum 9 Okt 2026 ~10:33 WIB (Fatih). **[TBD T5-xx]** = belum ada rekomendasi. **Tim solo (D-08):** semua peran manusia di panggung dan di belakang layar dijalankan Fatih; "laptop A/C" = laptop utama Fatih, "laptop samping" = perangkat kedua. **⚠ ARITMETIKA** = angka yang tidak bisa direkonsiliasi apa adanya. Satuan: USDC = 6 desimal (`3.00 USDC = 3_000_000`), CU = 18 desimal (`20 CU = 20e18`), faktor = 1e4 (`H100 = 10_000`), harga = USDC raw per 1 CU (`$3.00/CU = 3_000_000`).

---

## 0. Ringkasan

| Hal | Isi | Sumber |
|---|---|---|
| Durasi panggung | 2:30 (6 adegan) | design §7.4, PK §11.1 |
| Series di panggung | **`CU-JKT-H100-2610`** (window Okt 2026, sudah terbuka) di-forge live, bukan `CU-JKT-H100-2611` | [D-19] |
| Series seed | 3 series forward: `CU-JKT-H100-2611`, `CU-BTM-H200-2611`, `CU-SGP-B200-2612` | design §7.1, [D-25] |
| Parameter waktu demo | ack 60 dtk, delivery 60 dtk, dispute 90 dtk, ruling 120 dtk, timelock 5 menit | design §4.2, 01 §2.1, [D-20] |
| Angka kunci | 500 CU @ $3.00, bond $2,250; buyer beli 20 CU; ask $3.20 diambil wallet ke-2 buyer; redeem 8 → bond $36 dilepas ke provider; default 10 CU → holder menerima $45; bond tersisa **$2,169**; coverage **1.50** | design §7.4, 03 §3.3 |
| Lingkungan | (a) anvil lokal/fork untuk latihan dengan warp waktu; (b) deployment latihan di testnet; (c) **deployment panggung** yang hanya di-seed sekali lalu tidak disentuh | [APPROVED P5-20] |
| Cadangan | Window 60 dtk, wallet yang sudah didanai, video backup paling lambat Sab 06:00 | PK §11.1, design §8 |

**Catatan D-82:** series demo yang ada di deployment live bernama `CU-JKT-H100-2611`. Baris "Series di panggung" di atas, tabel A1/A3 (§2.1), dan baris D-19/D-25 di §5 tetap catatan historis. Seed series 1, window, dan input skrip tidak diubah.

**Temuan utama (detail di §2.2 dan §8):**
1. ⚠ ARITMETIKA: adegan default di design hanya 30 dtk (1:45–2:15), padahal countdown ack minimum 60 dtk ([D-20]). Naskah harus diatur ulang (§2.3).
2. Design tidak menyebut dari mana trader mendapat CU untuk ask $3.20. Padahal series 2610 baru lahir di panggung. Jadi trader harus membeli primer dulu, plus `approve` token CU baru ke `OrderBook` (01 tidak punya escrow tanpa allowance untuk `OrderBook`). Totalnya 3 tx latar oleh "bot trader" (§2.1).
3. Contoh 03 hanya valid kalau deployment panggung **bersih** (tanpa print H100 eligible sebelum demo, tanpa redemption sebelumnya, series 1–3 dari seed, series 4 live). Beberapa contoh 03 juga perlu catatan (§8).

---

## 1. Pemeran dan wallet

Alamat = contoh fiktif yang sama dengan 03 §3.3 (fixture). Alamat sungguhan dibuat Kamis/Jumat dari **key baru**, **jangan pernah** memakai key dev anvil di testnet live, karena `0xf39F…2266` punya delegasi EIP-7702 di kedua testnet (design §11.2, stack §3.2).

| Label | Peran | Alamat fiktif (03) | KYB (`ParticipantVerified`) | Dana mUSDC target | Pemegang key / perangkat |
|---|---|---|---|---|---|
| `W-DEP` | Deployer + `MINTER_ROLE` MockUSDC (P-15) | — | tidak | 0 | laptop utama Fatih |
| `W-P-JKT` | Provider Jakarta (series 1 dan 4); juga key agent provider | `0x1111…1111` | entity `0xe1…e1`, role 1, `ID` | 10,000 | browser profil "Provider" + agent di laptop |
| `W-P-BTM` | Provider Batam (series 2) | `0x7777…7777` | entity `0xe4…e4`, role 1, `ID` | 10,000 | script seed saja |
| `W-P-SGP` | Provider Singapura (series 3) | — | entity `0xe5…e5`, role 1, `SG` | 10,000 | script seed saja |
| `W-BUY` | Buyer (holder yang redeem dan menerima $45) | `0x2222…2222` | entity `0xe2…e2`, role 2, `ID` | 1,000 | browser profil "Buyer" |
| `W-BUY2` | Wallet ke-2 buyer (entity **sama** dengan buyer) | `0x2223…2223` | entity `0xe2…e2`, role 2, `ID` | 1,000 | browser profil "Buyer 2" |
| `W-TRD` | Trader (entity lain) | `0x3333…3333` | entity `0xe3…e3`, role 3, `SG` [P5-01] | 1,000 | bot trader (laptop utama, dipicu otomatis, [APPROVED P5-26]) |
| `W-JUDGE` | "Siapa saja" yang menekan Claim default | `0x4444…4444` | **tidak perlu** (`claimDefault` permissionless, [D-31]) | 0 (gas saja) | HP yang diserahkan ke juri |
| `W-TREAS` | Treasury = Safe 2-of-3 (RH) / Timelock (fallback) | `0x5555…5555` | tidak | menerima fee | Safe tim [D-13] |
| `W-ARB-1..3` | Anggota panel `PanelArbitrator` (2-of-3) = 3 EOA terpisah milik Fatih (juga owner Safe; profil wallet/perangkat berbeda, D-08) | — | tidak | 0 (gas saja) | Fatih [D-36] |
| `W-KEEP` | Keeper default (mode **dry-run** saat demo) | — | tidak | 0 (gas saja) | service hosting (stack §4.4) |
| `W-FEED` | Signer `ReferenceFeed` (`FEED_SIGNER_ROLE`) | — | tidak | 0 | script referensi sintetis (stack §4.4) [D-06] |
| Verifier | Attester KYB: Safe tim berlabel "Paron demo verifier (team multisig)" | — | — | — | Safe [D-04] (desain target) |
| `W-VERIFIER` **[APPROVED D-54, Jum 9 Okt ~11:05 WIB, hackathon saja]** | Attester KYB deployment hackathon, label "Paron demo verifier (team-operated)"; menerbitkan `ParticipantVerified` di fase 1 dan live di `/verifier`. Allowlist attester tetap via Timelock | — | tidak | 0 (gas saja) | Fatih (browser profil "Verifier") [07 D-54] |
| `W-ADMIN` **[APPROVED D-54, Jum 9 Okt ~11:05 WIB, hackathon saja]** | Proposer + canceller Timelock tambahan (di samping Safe); jadwal `setFactor` dari `/admin`. Execute boleh dari wallet mana pun (executor terbuka) | — | tidak | 0 (gas saja) | Fatih (browser profil "Admin") [07 D-54] |

Catatan:
- Kode role 1 Provider, 2 Buyer, 3 Trader ([D-24]). KYB untuk semua buyer dan trader ([D-31]). `expiry` semua attestation = 2027-10-08T00:00Z (`1822953600`), sama dengan 03 E13 [P5-02].
- Entity `W-BUY2` = entity `W-BUY`, supaya (a) fill trader → wallet ke-2 lolos self-match (entity beda) dan (b) callout integritas bisa memicu `SelfMatch()` ([D-31], [D-35], design §10.5 #5).
- Gas ETH: jumlah per wallet = [TBD T5-01]. Snapshot gas RH Testnet 0.01 gwei (design §11.1). Dana dikirim Kamis karena faucet punya cooldown dan bot check (design §11.2). Faucet: Alchemy, QuickNode, Chainstack, atau bridge dari Ethereum Sepolia (design §11.1).
- Target mUSDC = usulan [P5-03]. Provider butuh ≥ bond series miliknya (JKT: 3,240 + 2,250 = 5,490; BTM: 8,526; SGP: 8,370, lihat §3.3). Buyer/trader cukup ratusan dolar. Top-up memakai `MockUSDC.mint` oleh `W-DEP` (01 §6.12, "untuk script seed"), bukan faucet (faucet 5,000 per drip per jam = usulan [D-40]).

---

## 2. Skenario panggung

### 2.1 Penyesuaian terhadap naskah design §7.4

| # | Naskah design | Versi 05 | Alasan / dependensi |
|---|---|---|---|
| A1 | Forge `CU-JKT-H100-2611` | Forge **`CU-JKT-H100-2610`** (window 2026-10-01T00:00Z → 2026-11-01T00:00Z) | Series Nov tidak bisa di-redeem pada 11 Okt. Deployment demo memakai flag `allowOpenWindow` [D-19] (divergensi dari 01 §6.3, sudah dicatat 07 V-1) |
| A2 | ack 60 dtk, dll. | ack 60, delivery 60, dispute 90 dtk; `rulingWindow` 120 dtk | Di bawah batas protokol → set batas "demo" sebagai parameter deployment [D-20] |
| A3 | Seed 3 series | Seed 3 series forward + 2610 live = 4 series bulanan | [D-25], stack §4.4 |
| A4 | "A trader posts an ask at $3.20" | Setelah buyer membeli 20 CU, **bot trader** (tim solo: dipicu otomatis oleh event `PrimaryBuy` dari `W-BUY` di series 4, dengan tombol manual sebagai cadangan [APPROVED P5-26]) mengirim 3 tx: `buy` 10 CU primer, `approve` token CU series 4 ke `OrderBook`, `placeOrder` ASK 5 CU @ $3.20 | Token series 4 baru lahir di panggung, jadi trader belum punya CU. Qty 10 dan 5 = angka 03 (fiktif) [P5-04]. Approval CU = celah 01 [P5-05] |
| A5 | "Listing … single transaction" | `createSeriesWithPermit` (permit EIP-2612 ke **`BondVault`** sebagai spender, karena `BondVault.deposit` yang menarik USDC) | [D-30]. Fallback: `approve` + `createSeries` (2 tx) |
| A6 | Default di 1:45–2:15 | Redeem 10 CU dimulai lebih awal (≈1:10) dan countdown berjalan paralel dengan konfirmasi happy path, `curl` prints dan callout integritas | ⚠ ARITMETIKA (§2.2) [P5-06] |
| A7 | Keeper "polls … calls claimDefault" | Keeper **dry-run** selama demo, supaya klaim default dilakukan juri, bukan bot | stack §4.4 ("dry-run mode for the demo") |
| A8 | Callout `SelfMatch()` (design §10.5 #5) | Opsional, dilakukan di series 3 (`CU-SGP-B200-2612`) memakai ask istirahat milik `W-BUY2` dari seed | Supaya state series 4 dan contoh 03 tidak berubah [P5-07] |
| A9 | `curl …/v1/prints?gpu=H100&limit=3` (design §10.5 #1) | Dijalankan saat countdown | 03 E1 |

### 2.2 ⚠ ARITMETIKA: countdown 60 dtk vs adegan 30 dtk

- Design: "1:45–2:15 … Redeem 10 CU, and the 60-second ack countdown hits zero … anyone taps Claim default". Adegan 30 dtk tidak bisa memuat countdown ≥ 60 dtk.
- `claimDefault` baru valid kalau `block.timestamp > ackDeadline` (01 §6.8). Klaim paling cepat = waktu request + 61 dtk, plus jeda blok dan wallet (~2–5 dtk, belum diukur [T5-02]).
- Kalau naskah dipertahankan: request di 1:45 → klaim ≈ 2:47 → close selesai ≈ 3:02 (**+32 dtk**).
- Opsi: (a) mulai redeem 10 lebih awal dan isi countdown dengan adegan lain (**rekomendasi**, §2.3); (b) terima durasi ~3:00 (melanggar 2:30); (c) ack window demo < 60 dtk (mengubah [D-20]); (d) mempersiapkan request sebelum naik panggung (tidak jujur sebagai "live").

### 2.3 Naskah ter-retime (rekomendasi [P5-06])

Waktu relatif dari mulai bicara. Kolom "Tx" = transaksi onchain di adegan itu (langkah detail di §3.4). Kolom "03" = endpoint yang mengisi layar.

| Waktu | Adegan | Aktor / tx | Layar | 03 | Yang terlihat |
|---|---|---|---|---|---|
| 0:00–0:12 | **Hook** (dipadatkan dari 20 dtk) | — | S1 + strip referensi | E4 `/v1/series`, E2 `/v1/index/H100`, E15 | 3 series seed; strip H100: status `THIN`, nilai kosong (belum ada print eligible) vs "Spot reference (synthetic demo data)" $3.00 |
| 0:12–0:40 | **List in 3 clicks**, stopwatch < 40 dtk (target selesai ≤ 28 dtk) | `W-P-JKT`: tanda tangan permit + `createSeriesWithPermit` (S-01) | S2 → S3 series baru | E14 `/v1/gpus` (preview), E5 | Kartu preview "500 CU · $3.00 · bond $2,250 (1.5×)"; badge verified; bond bar penuh |
| 0:40–0:58 | **Buy and trade** | `W-BUY` `buy` 20 CU (S-02) → bot trader 3 tx (S-03..S-05) → `W-BUY2` mengambil ask (S-06) | S3 | E5, E6 orderbook, E1 `?series=CU-JKT-H100-2610`, E2 | Ask 5 @ 3.20 muncul lalu hilang; print di tape; strip H100 berubah `THIN` → **`OK` 3.20** ("PrintIndex ticks"). Lalu buka series H200: "$5.69/jam tampil sebagai $4.06/CU" |
| 0:58–1:10 | **Happy redemption** bagian 1 | `W-BUY` redeem 8 (S-07); agent ack ≤ 3 dtk (S-08) dan `markDelivered` dengan receipt hash (S-09) | S4 (+ S5 di layar samping) | E10 `?holder=`, E11 | Timeline request #1: REQUESTED → ACKNOWLEDGED → DELIVERED |
| ≈1:10 | **Kill switch** + redeem 10 | Agent dimatikan di proyektor; `W-BUY` redeem 10 (S-10) | S4 | E10 | Request #2, countdown ack **60 dtk** mulai |
| 1:12–1:20 | **Happy redemption** bagian 2 | `W-BUY` `confirm(1)` (S-11) | S4 → S3 | E12 `/v1/providers/{addr}`, E5 | CU burn; reputasi "8 CU delivered"; bond $2,250 → $2,214 (bond dilepas $36 ke provider) |
| 1:20–1:35 | **Paron Prints** (saat countdown) | terminal `curl …/v1/prints?gpu=H100&limit=3` | terminal | E1 | 3 print: TRADE 3.20 eligible, PRIMARY trader, PRIMARY buyer (sama dengan 03 §3.4) |
| 1:35–1:45 | **Integrity callout** (opsional) | `W-BUY` mencoba membeli ask `W-BUY2` di series 3 → revert `SelfMatch()` (S-12) | S3 series 3 | — | Pesan error `SelfMatch()`; tidak ada print baru |
| 1:45–2:10 | "What if a provider ghosts you?" | — | S4 countdown | E10 | Countdown menuju 0; tombol "Claim default" muncul saat `actions` berisi `CLAIM_DEFAULT` (03 P3-33) |
| ≈2:11–2:15 | **WOW: Claim default** | Juri menekan "Claim default" di HP `W-JUDGE` (S-13) | S4 → S3 | E10, E5, E12 | Buyer +$45.00 (beli $30, +50%); strike di series Jakarta; bond bar $2,214 → **$2,169**; series 1–3 tidak berubah. "No admin, no oracle, no insurance pool." |
| 2:15–2:30 | **Close** | — | Slide | — | Pipeline GW Indonesia 2027; footnote "not affiliated" hanya di slide [D-64] (penyebutan di app: historis [D-64]) |

Risiko naskah ini: listing harus selesai ≤ 28 dtk (design menarget < 40 dtk). Kalau listing molor, potong callout integritas (1:35–1:45) lebih dulu, lalu dipersingkat kalimat "Paron Prints". Konfirmasi #1 terjadi **setelah** request #2, jadi urutan event berbeda dari timeline gladi 03 §3.3 (angka akhir sama, §8 X-5).

### 2.4 Layar per wallet (siapa memegang apa)

| Layar fisik | Isi | Wallet |
|---|---|---|
| Proyektor utama | S1 → S2 → S3 → S4, terminal `curl`, slide | Browser profil "Provider" (S2), lalu "Buyer" (S3/S4) |
| Laptop samping / split screen | S5 provider console + jendela agent (kill switch) | `W-P-JKT` |
| Laptop utama (proses latar) | Bot trader (berjalan otomatis setelah `PrimaryBuy` buyer [APPROVED P5-26], alur §2.5; cadangan: Fatih menekan trigger manual) | `W-TRD` |
| Browser profil "Buyer 2" | Mengambil ask 3.20 | `W-BUY2` |
| HP juri | S4 publik (request #2) + wallet `W-JUDGE` | `W-JUDGE` |

Cara wallet di HP terhubung ke frontend (WalletConnect lewat RainbowKit atau wallet in-app) = [TBD T5-03] (stack §4.3 memakai RainbowKit).

---

### 2.5 Bot trader otomatis [APPROVED P5-26]

Disetujui Fatih Jum 9 Okt 2026 ~10:33 WIB: selama demo bot trader berjalan **otomatis**. Tim solo tidak punya orang ketiga untuk memasang ask di adegan "Buy and trade". Bot ini **bukan** keeper: keeper tetap dry-run (A7), jadi claim default tetap dilakukan juri.

**Pemicu**
- Bot berjalan sebagai proses latar di laptop utama dengan wallet `W-TRD`, dalam keadaan **armed** sejak checklist T−60 (§4.7).
- Bot bereaksi ke **satu** event saja: `PrimaryBuy` dengan `seriesId = 4` dan buyer = `W-BUY` (S-02), di deployment yang sedang dipakai (panggung, latihan, atau anvil; alamat dari manifest 04 §7).
- Bot mengabaikan semua event lain: `PrimaryBuy` milik `W-TRD` sendiri (supaya tidak berulang), pembelian dari wallet lain, dan series 1–3.
- **Sekali jalan (one-shot) per deployment:** sebelum mengirim tx, bot memeriksa `W-TRD` belum memegang CU series 4 dan belum punya ask terbuka di series 4. Kalau salah satu sudah ada, bot tidak mengirim apa pun dan hanya menampilkan statusnya. Untuk gladi berikutnya bot di-arm ulang setelah reset (§4.2).
- Cara mendeteksi event (langsung dari chain atau lewat Ponder) mengikuti agent provider: [TBD T5-07]. Disarankan langsung dari chain karena tidak bergantung pada jeda indexer [usulan 05].

**Yang dilakukan (urut, satu tx menunggu receipt tx sebelumnya)**
1. S-03 `PrimarySale.buy(4, 10e18, maxCost = 30_000_000)`.
2. S-04 `approve(OrderBook, 5e18)` pada token series 4.
3. S-05 `OrderBook.placeOrder(4, Ask, 3_200_000, 5e18, immediateOrCancel = false)`.

Bot tidak pernah mengambil order, membatalkan order, atau mengirim tx lain. Kalau salah satu tx revert, bot **berhenti** (tanpa retry otomatis) dan menampilkan langkah yang gagal di jendelanya.

**Timing per beat (naskah §2.3, adegan 0:40–0:58 "Buy and trade")**

| Waktu naskah | Kejadian | Siapa |
|---|---|---|
| ≈0:40–0:44 | `W-BUY` membeli 20 CU (S-02) dari UI S3 | Fatih (profil "Buyer") |
| saat S-02 masuk blok | Bot terpicu dan mengirim S-03 → S-04 → S-05 | bot (otomatis) |
| ≈0:44–0:52 | Narasi "a trader posts an ask at $3.20"; ask 5 @ 3.20 muncul di order book S3 | narator |
| ≈0:52–0:55 | `W-BUY2` mengambil ask (S-06); print di tape; strip H100 `THIN` → `OK` 3.20 | Fatih (profil "Buyer 2") |
| 0:55–0:58 | Kalimat H200 "$5.69/jam tampil sebagai $4.06/CU" | narator |

- Target: ask terlihat di S3 **≤ 10 dtk** setelah `PrimaryBuy` S-02 masuk blok [usulan 05]. Angka ini bergantung pada latensi chain [TBD T5-02] dan diukur saat gladi.
- Contoh gladi 03 §3.3 (fiktif) memakai jarak 20 dtk antara S-02 dan S-05. Kalau latensi nyata mendekati itu, kalimat H200 diucapkan **sebelum** S-06 (diisi saat menunggu ask) supaya beat tetap selesai ≈0:58.

**Fallback (urut)**
1. **Trigger manual:** kalau ask belum muncul **10 dtk** setelah S-02 terkonfirmasi, atau jendela bot menunjukkan error/proses mati, Fatih menekan trigger manual di jendela bot (laptop utama). Ketiga tx sama persis, dengan cek one-shot yang sama, jadi tidak ada risiko ask ganda.
2. **Manual dari UI:** kalau bot tidak bisa dijalankan sama sekali, ketiga langkah dilakukan dari browser dengan wallet `W-TRD` di UI S3 (beli 10, approve lewat form order 06, pasang ask 5 @ 3.20). Butuh ±30 dtk tambahan dan profil browser "Trader" yang sudah siap [usulan 05].
3. **Lewati trade:** kalau keduanya gagal, adegan trade dilewati dan lanjut ke redemption. Akibatnya strip H100 tetap `THIN` dan `curl` 1:20 tidak memuat print TRADE; narasi menyesuaikan ("the first eligible print would move the index"). Ini sejalan dengan level 5 §4.8: kalau lebih dari satu adegan gagal, video diputar.

**Cek gladi**
- Setiap gladi (anvil, latihan): bot otomatis terpicu tepat sekali, dan jarak S-02 → ask terlihat dicatat (masuk T5-02).
- Minimal satu gladi memakai **trigger manual** dengan sengaja (bot tidak di-arm), supaya fallback 1 sudah teruji.
- Pastikan bot tidak terpicu oleh `PrimaryBuy` lain (mis. seed atau pembelian uji dari wallet lain).
- Video backup (§4.6, design §8) direkam dengan bot otomatis.

---

## 3. Spesifikasi seed (langkah semu)

### 3.0 Struktur dan format langkah

Seed dibagi menjadi 5 fase. Hanya fase 0–2 yang dijalankan di deployment panggung. Fase 3 dimainkan **live lewat UI** di panggung, dan dijalankan otomatis hanya di anvil, deployment latihan, dan saat merekam video backup. Fase 4 (dispute) hanya di anvil dan deployment latihan.

| Fase | Isi | Panggung | Latihan testnet | Anvil |
|---|---|---|---|---|
| 0 | Prasyarat deploy + konfigurasi | ya (sekali) | ya | ya |
| 1 | Aktor: gas, mUSDC, KYB, registrasi provider, approval | ya (sekali) | ya | ya |
| 2 | Series forward 1–3, referensi sintetis, ask untuk callout | ya (sekali) | ya | ya |
| 3 | Skenario panggung S-01..S-13 (series 4) | **live via UI** | otomatis / manual | otomatis + warp |
| 4 | Dispute D-01..D-06 | **tidak** | ya (request 1 CU) | ya (snapshot/revert) |

Setiap langkah ditulis: **Pemanggil**, **Fungsi** (01), **Input**, **Event yang diharapkan**, **State/saldo sesudah**, **Assert** (cek yang wajib lolos sebelum lanjut; gagal = berhenti). Event dari library (OZ `Transfer`, `Approval`, `Initialized`) hanya disebut kalau penting.

### 3.1 Fase 0: prasyarat deploy

Urutan deploy mengikuti 01 §9. Detail script deploy = doc 04.

1. **Chain + RPC.** Pilih `CHAIN=robinhoodTestnet` atau `arbitrumSepolia` sesuai go/no-go Jum 10:30 (design §11.3). RPC indexer = `INDEXER_RPC_URL`, cadangan opsional `INDEXER_RPC_URL_BACKUP` [D-89]. Nilai URL tidak ditulis di dokumen.
2. **Deploy** `DeployAll` dengan set parameter **demo** [D-20]:
   - batas window `SeriesFactory`: ack 60 dtk–72 jam, delivery 60 dtk–7 hari, dispute 90 dtk–7 hari;
   - `allowOpenWindow = true` (demo saja) [D-19]; `enforceCalendarMonth` [D-02];
   - `RedemptionManager.rulingWindow = 120 dtk` [D-20, D-37];
   - `TimelockController` delay 5 menit (design §3 #2);
   - `leadTime = 0` (demo) [D-39];
   - `primaryFeeBps = 100`, `takerFeeBps = 15`, `makerFeeBps = 0`, `treasury = W-TREAS` [D-13];
   - faktor `ConversionTable`: H100 10_000, H200 14_000, B200 25_000, GB200 35_000, A100 4_500; RTX 4090 tidak dimasukkan [D-09] (diperbaiki Jum 9 Okt ~11:07 WIB, SC-17);
   - parameter `PrintIndex` demo: `windowLength` 24 jam, `minVolume` 1 CU, `minParticipants` 2, `maxCarryForward` 72 jam [D-15];
   - `MAX_LEVELS = 10` [D-17];
   - `PanelArbitrator`: anggota `W-ARB-1..3`, threshold 2 [D-36]; `SeriesFactory.setArbitratorAllowed(PanelArbitrator, true)`;
   - gate: `EASGate(eas, schemaUid ParticipantVerified, [verifier])` di RH; `RegistryGate` kalau cek 3 go/no-go gagal [D-23, D-24];
   - `ReferenceFeed` + `FEED_SIGNER_ROLE = W-FEED` (NICE) [D-06];
   - `MockUSDC` dengan `ERC20Permit` [D-30], `MINTER_ROLE = W-DEP`.
3. **Konfigurasi yang butuh Timelock** (faktor, allowlist arbitrator, fee, parameter indeks) dilakukan **sebelum** role diserahkan ke Timelock/Safe, supaya seed tidak menunggu delay 5 menit per perubahan [P5-08]. Setelah itu serahkan role (stack §4.5: "admin roles move to the Safe right after deploy"). `MINTER_ROLE` MockUSDC tetap di `W-DEP` untuk top-up.
4. **Verifikasi** di Blockscout (RH) / Arbiscan (fallback) (design §7.1, §11.1).
5. **Tulis** `DEPLOYMENTS.md` + `chains.json` (stack §4.7, design §11.1) dan simpan blok deploy sebagai start block Ponder.
6. **Ponder** dijalankan dengan alamat + start block baru. `GET /v1/health` (03 E18) → `synced = true`.

Assert fase 0:
- [ ] Semua kontrak terverifikasi; alamat di `DEPLOYMENTS.md` sama dengan yang dibaca Ponder.
- [ ] `ConversionTable.factorOf(keccak256("H100-SXM-80GB")) = 10_000`, H200 14_000, B200 25_000.
- [ ] `SeriesFactory` mengizinkan `PanelArbitrator`; bounds demo aktif (cek lewat view/konstruktor, nama view = doc 04).
- [ ] `PrintIndex.statusOf(H100)` = THIN tanpa `lastOkAt` (belum pernah OK) [D-15].
- [ ] `/v1/health.synced = true`; `/v1/gpus` mengembalikan faktor di atas.

### 3.2 Fase 1: aktor, dana, KYB, approval

**A-1 Gas.** `W-DEP` mengirim ETH ke semua wallet di §1 (jumlah [T5-01]).
- Assert: [ ] setiap wallet punya saldo ETH ≥ batas minimum [T5-01].

**A-2 mUSDC (top-up ke target, bukan tambah buta).**
- Pemanggil: `W-DEP`. Fungsi: `MockUSDC.mint(to, amount)` (01 §6.12).
- Input: untuk tiap wallet, `amount = target − balanceOf(wallet)` kalau positif. Target [P5-03]: provider 10,000.000000 (`10_000_000_000`), buyer/buyer2/trader 1,000.000000 (`1_000_000_000`).
- Event: `Transfer(0x0, to, amount)`.
- Assert: [ ] `balanceOf` setiap wallet = target persis.

**A-3 KYB attestation.**
- Pemanggil: verifier (Safe tim, [D-04]). Satu tx Safe yang memanggil EAS `multiAttest` untuk 6 penerima direkomendasikan supaya cukup 1 tanda tangan Safe [P5-09]. Alternatif: 6 tx `attest`.
- **[APPROVED D-54, Jum 9 Okt ~11:05 WIB, hackathon saja]**: pemanggil = `W-VERIFIER` (EOA), satu tx EAS `multiAttest` untuk 6 penerima dari skrip seed, tanpa tanda tangan Safe. P5-09 (Safe) hanya berlaku kalau Fatih kembali ke D-04.
- Input per penerima: schema `ParticipantVerified(bytes32 entityId, uint8 role, bytes2 country, uint64 expiry)` (stack §4.1) dengan nilai §1, `expiry = 1822953600`, revocable.
- Event: EAS `Attested(recipient, attester, uid, schemaUid)` × 6.
- Fallback `RegistryGate`: `setParticipant(account, entityId, role, country, expiry)` oleh `VERIFIER_ROLE` → `ParticipantSet` × 6 (01 §6.13) [D-23].

**A-4 Link attestation (EASGate saja).**
- Pemanggil: `W-DEP` (boleh siapa saja). Fungsi: `EASGate.linkAttestation(uid)` × 6 (01 §6.13, P-63).
- Event: `AttestationLinked(account, uid, entityId)`.
- Assert: [ ] `gate.isVerified(x) = true` untuk 3 provider, buyer, buyer2, trader; [ ] `gate.entityId(W-BUY) == gate.entityId(W-BUY2)`; [ ] `gate.entityId(W-TRD) ≠ gate.entityId(W-BUY)`; [ ] `gate.isVerified(W-JUDGE) = false` (bukti `claimDefault` tidak butuh KYB); [ ] `/v1/participants/{W-BUY2}` (03 E13) → `verified: true`, entity sama dengan buyer.

**A-5 Registrasi provider.**
- Pemanggil: `W-P-JKT`, `W-P-BTM`, `W-P-SGP`. Fungsi: `ProviderRegistry.registerProvider()` (01 §6.1).
- Event: `ProviderRegistered(provider, entityId)`.
- Assert: [ ] `getProvider(p).status = Active`; [ ] `isListable(p) = true`; [ ] `/v1/providers/{p}` → `status: ACTIVE`, semua counter 0.

**A-6 Approval USDC (supaya setiap aksi panggung cukup 1 tx).** [P5-10]

| Pemilik | Spender | Jumlah minimum | Untuk |
|---|---|---|---|
| `W-BUY` | `PrimarySale` | 60.000000 | S-02 |
| `W-BUY` | `OrderBook` | 3.104650 (3.10 + fee taker 0,15%) | S-12 (callout; tx revert, jadi tidak terpakai) |
| `W-BUY2` | `OrderBook` | 16.024000 | S-06 |
| `W-BUY2` | `PrimarySale` | 3.000000 | F-4 |
| `W-BUY2` | `RedemptionManager` | 5.000000 per dispute | Fase 4 |
| `W-TRD` | `PrimarySale` | 30.000000 | S-03 |
| `W-P-BTM`, `W-P-SGP` | `BondVault` | 8,526.000000 / 8,370.000000 | F-2, F-3 |
| `W-P-JKT` | `BondVault` | 3,240.000000 (F-1); 2,250.000000 **hanya** kalau fallback tanpa permit | F-1, S-01 |

Usulan: approve sejumlah persis yang dibutuhkan + buffer, bukan unlimited [P5-10]. Assert: [ ] `allowance` ≥ minimum untuk setiap baris.

### 3.3 Fase 2: series forward, referensi, order callout

Semua series memakai parameter waktu demo (ack 60, delivery 60, dispute 90 dtk), `minRedemption = 1 CU` (`1e18`), `arbitrator = PanelArbitrator`, `termsHash = 0x0`, `continent = AS`, `institutional = false`. `specHash` = hash JSON `paron-spec/v1` per series (isi = [TBD T5-04], skema = doc 04/06).

**F-1 `CU-JKT-H100-2611`** (series 1)
- Pemanggil: `W-P-JKT`. Fungsi: `SeriesFactory.createSeries(p)` (01 §6.3).
- Input: `gpuModel = keccak256("H100-SXM-80GB")`, `gpuHours = 720` (lot "720 CU = 1 H100 for November", design §10.5 #3) [P5-11], `primaryPrice = 3_000_000` (design §7.1), `bondPerCU = 4_500_000` (1.5×), `windowStart = 1793491200` (2026-11-01T00:00Z), `windowEnd = 1796083200` (2026-12-01T00:00Z), `country = "ID"`, `symbol = "CU-JKT-H100-2611"`.
- Event: `BondDeposited(1, W-P-JKT, 3_240_000_000)`, `SeriesCreated(1, …)`.
- Sesudah: `maxSupply = 720e18`; bond 3,240.000000; `W-P-JKT` USDC 10,000 → 6,760.
- Assert: [ ] `seriesId == 1`; [ ] `getSeries(1).factor == 10_000`; [ ] `bondOf(1).balance == 3_240_000_000`; [ ] token = `predictTokenAddress(1)` (P-29).

**F-2 `CU-BTM-H200-2611`** (series 2)
- Pemanggil: `W-P-BTM`. Fungsi: `createSeries`.
- Input: `gpuModel = keccak256("H200-SXM-141GB")` (03 P3-03), `gpuHours = 1000`, `primaryPrice = 4_060_000` (design §7.1), `bondPerCU = 6_090_000` (= 1.5 × 4.06, batas bawah; fiktif di 03), window Nov (sama dengan F-1), `country = "ID"`.
- Event: `BondDeposited(2, W-P-BTM, 8_526_000_000)`, `SeriesCreated(2, …)`.
- Sesudah: `factor = 14_000`; `maxSupply = 1000 × 14_000 × 1e18 / 1e4 = 1400e18` (design §7.2 S2 "1,000 H200-hours = 1,400 CU"); bond 8,526.000000; harga native = 4.06 × 1.4 = **5.684** (design membulatkan menjadi $5.69, 03 X-6).
- Assert: [ ] `maxSupply == 1400e18`; [ ] `/v1/series/CU-BTM-H200-2611` → `native_primary_price = "5.684000"`, `coverage = "2.03"` (6.09 ÷ 3.00).

**F-3 `CU-SGP-B200-2612`** (series 3)
- Pemanggil: `W-P-SGP`. Fungsi: `createSeries`.
- Input: `gpuModel = keccak256("B200-SXM-180GB")`, `gpuHours = 744` (Des = 31 hari) [P5-11], **`primaryPrice` tidak disebut sumber** → usulan 3_000_000 [T5-05], `bondPerCU = 4_500_000`, `windowStart = 1796083200` (2026-12-01T00:00Z), `windowEnd = 1798761600` (2027-01-01T00:00Z), `country = "SG"`.
- Sesudah: `factor = 25_000`; `maxSupply = 744 × 2.5 = 1,860 CU`; bond 1,860 × 4.50 = 8,370.000000.
- Assert: [ ] `maxSupply == 1860e18`; [ ] `bondOf(3).balance == 8_370_000_000`.

**F-4 Ask istirahat untuk callout integritas** (opsional, [P5-07])
1. `W-BUY2` `PrimarySale.buy(3, 1e18, maxCost = 3_000_000)` → `PrimaryBuy(3, W-BUY2, 1e18, 3_000_000, 3_000_000, 30_000)`. Print PRIMARY B200 (tidak eligible).
2. `W-BUY2` `approve` token series 3 ke `OrderBook` (1 CU).
3. `W-BUY2` `OrderBook.placeOrder(3, Ask, 3_100_000, 1e18, false)` → `OrderPlaced(orderId 1, 3, W-BUY2, Ask, 3_100_000, 1e18)`. Harga 3.10 = fiktif.
- Assert: [ ] `getLevels(3, Ask, 1)` = (3.10, 1 CU); [ ] tidak ada print TRADE apa pun di deployment.
- Akibat: order ask trader di panggung mendapat `orderId 2`, bukan `1` seperti contoh 03 (§8 X-3).

**F-5 Referensi sintetis** (NICE, [D-06])
- Pemanggil: `W-FEED`. Fungsi: `ReferenceFeed.push(gpuModel, value, observedAt)` (01 §6.11) untuk H100, H200, B200.
- Input: `value = 3_000_000` (USD per jam H100-equivalent = per CU, [D-34]) untuk ketiganya [P5-12]; `observedAt = now`. Label = "synthetic demo data" (design §10.5 #2).
- Event: `ReferenceUpdated(gpuModel, 3_000_000, observedAt, roundId)` × 3.
- Assert: [ ] `/v1/reference/H100` → `value "3.000000"`, `synthetic: true`; [ ] coverage series 1 = 1.50, series 2 = 2.03, series 3 = 1.50.

**Tidak di-seed (sengaja):** fill H100 eligible, redemption, dan series 2610 di deployment panggung. Alasannya: (a) strip H100 harus `THIN` di awal supaya "PrintIndex ticks" terlihat dan contoh 03 E2 (THIN, `value null`) valid; (b) `reqId` panggung harus mulai dari 1; (c) `seriesId` live harus 4 [P5-13]. Konsekuensinya, kurva forward/chart S6 "H100 2026-11" (design §10.5 #2) kosong sebelum demo (§8 X-4).

Assert akhir fase 2 (snapshot "S0" panggung):
- [ ] `/v1/series` → 3 series (1–3), `sold_supply` 0/0/1.
- [ ] `/v1/index/H100` → `status THIN`, `value null`.
- [ ] `/v1/prints?gpu=H100` → `data: []`.
- [ ] Tidak ada redemption (`/v1/redemptions?provider=W-P-JKT` kosong).
- [ ] Saldo: `W-P-JKT` 6,760.000000; `W-BUY` 1,000.000000; `W-BUY2` 997.000000; `W-TRD` 1,000.000000; treasury 0.030000.

### 3.4 Fase 3: skenario panggung (series 4)

Waktu `t` = timestamp blok tx itu. Timestamp gladi di kurung = 03 §3.3 (Sab 10 Okt 2026, 10:00 WIB = 03:00Z, fiktif). Di panggung urutan S-10/S-11 terbalik dibanding 03 (§2.3).

**S-01 Forge `CU-JKT-H100-2610`** (gladi 03:00:00Z)
- Pemanggil: `W-P-JKT` (UI S2). Fungsi: `SeriesFactory.createSeriesWithPermit(p, deadline, v, r, s)` (01 §6.3, P-37) [D-30]. Fallback: `approve(BondVault, 2_250_000_000)` + `createSeries(p)`.
- Input: permit `owner = W-P-JKT`, `spender = BondVault`, `value = 2_250_000_000`. `p`: `gpuModel = keccak256("H100-SXM-80GB")`, `gpuHours = 500`, `primaryPrice = 3_000_000`, `bondPerCU = 4_500_000`, `windowStart = 1790812800` (2026-10-01T00:00Z, sudah lewat → butuh `allowOpenWindow` [D-19]), `windowEnd = 1793491200`, `ackWindow = 60`, `deliveryWindow = 60`, `disputeWindow = 90`, `minRedemption = 1e18`, `arbitrator = PanelArbitrator`, `specHash` [T5-04], `termsHash = 0x0`, `country = "ID"`, `continent = AS`, `institutional = false`, `symbol = "CU-JKT-H100-2610"`.
- Event: `Approval` (permit), `BondDeposited(4, W-P-JKT, 2_250_000_000)`, `SeriesCreated(4, W-P-JKT, token4, "CU-JKT-H100-2610", H100, 10_000, 500, 500e18, 3_000_000, 4_500_000, 1790812800, 1793491200, 60, 60, 90, 1e18, PanelArbitrator, specHash, 0x0, "ID", AS, false)`.
- Sesudah: `maxSupply = 500e18`; bond 2,250.000000; `W-P-JKT` USDC 6,760.000000 → **4,510.000000**.
- Assert: [ ] `seriesId == 4`; [ ] `token4 == predictTokenAddress(4)`; [ ] `isSaleOpen(4)` dan `isRedeemWindowOpen(4)` = true; [ ] `bondOf(4).balance == 2_250_000_000`; [ ] `/v1/series/4` → `coverage "1.50"`, `bond.health "1.000"`; [ ] waktu stopwatch < 40 dtk (target ≤ 28 dtk).

**S-02 Buyer beli 20 CU** (gladi 03:00:40Z)
- Pemanggil: `W-BUY` (UI S3). Fungsi: `PrimarySale.buy(4, 20e18, maxCost = 60_000_000)` (01 §6.6).
- Event: `Transfer(0x0, W-BUY, 20e18)` (token4), `PrimaryBuy(4, W-BUY, 20e18, 3_000_000, 60_000_000, 600_000)`.
- Sesudah: `W-BUY` USDC 1,000 → **940.000000**, CU 20; `W-P-JKT` +59.400000 → 4,569.400000; treasury +0.600000; `sold = 20e18`.
- Assert: [ ] `cost == 60_000_000`, `fee == 600_000`; [ ] `/v1/prints` → print PRIMARY, `eligible false`, `ineligible_reason PRIMARY`, `index_status THIN`.

**S-03 Bot trader beli 10 CU** (gladi 03:00:50Z) [P5-04]
- Pemanggil: `W-TRD` (bot, dipicu setelah `PrimaryBuy` S-02 terlihat). Fungsi: `buy(4, 10e18, 30_000_000)`.
- Event: `PrimaryBuy(4, W-TRD, 10e18, 3_000_000, 30_000_000, 300_000)`.
- Sesudah: `W-TRD` USDC **970.000000**, CU 10; `W-P-JKT` 4,599.100000; `sold = 30e18`.

**S-04 Bot trader approve CU** [P5-05]
- Pemanggil: `W-TRD`. Fungsi: ERC-20 `approve(OrderBook, 5e18)` pada token4.
- Event: `Approval(W-TRD, OrderBook, 5e18)`.

**S-05 Bot trader pasang ask** (gladi 03:01:00Z)
- Pemanggil: `W-TRD`. Fungsi: `OrderBook.placeOrder(4, Ask, 3_200_000, 5e18, false)` (01 §6.7).
- Event: `OrderPlaced(2, 4, W-TRD, Ask, 3_200_000, 5e18)` (`orderId 2` karena F-4 memakai 1).
- Sesudah: CU trader 5 bebas + 5 di escrow `OrderBook`.
- Assert: [ ] `bestAsk(4) == (3_200_000, 5e18)`; [ ] `/v1/series/4/orderbook` → asks `[3.200000 × 5]`.

**S-06 Buyer wallet 2 mengambil ask** (gladi 03:01:05Z)
- Pemanggil: `W-BUY2` (UI S3, profil "Buyer 2"). Fungsi: `placeOrder(4, Bid, 3_200_000, 5e18, immediateOrCancel = true)`.
- Event: `Trade(4, 2, W-BUY2, W-TRD, 0xe3…, 0xe2…, Bid, 3_200_000, 5e18, 3_200_000, 24_000, true)` [D-22], `PrintRecorded(4, H100, 3_200_000, 5e18, true)`, `IndexUpdated(H100, 1, 3_200_000, OK)`, `IndexStatusChanged(H100, THIN, OK)`. Tidak ada `OrderPlaced` untuk bid IOC `W-BUY2` yang terisi penuh [D-51, menjawab T5-06].
- Sesudah: `W-BUY2` USDC 997.000000 − 16.024000 = **980.976000**, CU 5; `W-TRD` +16.000000 → **986.000000** (maker 0%); treasury +0.024000; order 2 FILLED.
- Assert: [ ] `eligible == true` (entity 0xe3 ≠ 0xe2, keduanya ≠ 0) [D-35]; [ ] `/v1/index/H100` → `OK`, `value "3.200000"`, `participants 2`, `eligible_volume_cu "5"`; [ ] order book series 4 kosong.

**S-07 Redeem 8 CU** (gladi 03:01:30Z)
- Pemanggil: `W-BUY` (UI S4, modal Redeem). Fungsi: `RedemptionManager.requestRedemption(4, 8e18, deliveryRef1)` (01 §6.8). `deliveryRef1` = hash detail akses (design §2 Flow C), isi = [T5-04].
- Event: `Transfer(W-BUY, RM, 8e18)` (`lockFrom`, [D-38]), `RedemptionRequested(1, 4, W-BUY, 8e18, deliveryRef1, ackDeadline = t + 60)`.
- Sesudah: `W-BUY` CU bebas 12; `openRequestCount(4) == 1`.
- Assert: [ ] `reqId == 1`; [ ] `stateOf(1) == Requested`.

**S-08 Agent ack** (gladi 03:01:33Z)
- Pemanggil: agent provider (key `W-P-JKT`). Fungsi: `acknowledge(1)`.
- Event: `Acknowledged(1, deliveryDeadline = t + 60)`.
- Assert: [ ] selisih `t(S-08) − t(S-07)` ≤ 3 dtk (design §7.4). Latensi agent bergantung cara agent mendeteksi request (langsung dari chain vs lewat Ponder) [T5-07].

**S-09 Agent mark delivered** (gladi 03:01:40Z)
- Pemanggil: agent. Fungsi: `markDelivered(1, receiptHash1)`. `receiptHash1` = hash JSON laporan usage (output GPU di-mock dan diberi label, stack §4.4) [D-26].
- Event: `Delivered(1, 4, receiptHash1, disputeDeadline = t + 90)`.

**S-10 Kill switch + redeem 10 CU** (gladi 03:03:00Z; di panggung **sebelum** S-11)
- Aksi offchain: kill switch agent dinyalakan (agent berhenti mengirim tx).
- Pemanggil: `W-BUY`. Fungsi: `requestRedemption(4, 10e18, deliveryRef2)`.
- Event: `Transfer(W-BUY, RM, 10e18)`, `RedemptionRequested(2, 4, W-BUY, 10e18, deliveryRef2, ackDeadline = t + 60)`.
- Sesudah: `W-BUY` CU bebas 2; `openRequestCount == 2`.
- Assert: [ ] tidak ada `Acknowledged(2)` sampai `ackDeadline`; [ ] keeper dry-run hanya mencatat "would claim", tidak mengirim tx.

**S-11 Holder confirm #1** (gladi 03:02:00Z)
- Pemanggil: `W-BUY`. Fungsi: `confirm(1)`.
- Event: `Transfer(RM, 0x0, 8e18)` (burn), `BondReleased(4, W-P-JKT, 36_000_000, 1)`, `ReputationUpdated(W-P-JKT, 8e18, 0, 0, 0, 0)`, `DeliveryRecorded(H100, 8e18)`, `RedemptionFinalized(1, 4, 8e18, 36_000_000, false)`.
- Sesudah: bond 2,250 → **2,214.000000**; `W-P-JKT` +36.000000 → **4,635.100000**; `totalSupply` 30 → 22.
- Assert: [ ] `bondOf(4).balance == 2_214_000_000`; [ ] `/v1/providers/W-P-JKT` → `delivered_cu "8"`.

**S-12 Callout `SelfMatch()`** (opsional, tidak ada di timeline 03)
- Pemanggil: `W-BUY`. Fungsi: `placeOrder(3, Bid, 3_100_000, 1e18, true)` terhadap ask `W-BUY2` (F-4).
- Hasil: **revert `SelfMatch()`** (entity sama) [D-35]. Tidak ada event, tidak ada print, saldo tidak berubah, ask F-4 tetap ada.
- Assert: [ ] wallet menampilkan error `SelfMatch()`; [ ] `/v1/prints?series=3&kind=TRADE` tetap kosong.

**S-13 Juri claim default** (gladi 03:04:01Z)
- Pemanggil: `W-JUDGE` (HP; tanpa KYB). Fungsi: `claimDefault(2)` setelah `block.timestamp > ackDeadline(2)`.
- Event: `Transfer(RM, 0x0, 10e18)`, `BondSlashed(4, W-BUY, 45_000_000, 2)`, `ReputationUpdated(W-P-JKT, 8e18, 10e18, 0, 0, 1)` (field terakhir = `strikes`, 01 §6.1), `DefaultRecorded(H100, 10e18)`, `Defaulted(2, 4, W-BUY, 10e18, 45_000_000, false, false, W-JUDGE)`.
- Sesudah: `W-BUY` USDC 940 + 45 = **985.000000** (payout ke **holder**, bukan pemanggil); `W-JUDGE` USDC tetap 0; bond 2,214 → **2,169.000000**; `totalSupply` 22 → **12**; `strikes = 1` (03 P3-34).
- Assert: [ ] `payout == bondPerCU × amount = 4_500_000 × 10 = 45_000_000`; [ ] `bondOf(1..3)` tidak berubah (isolasi bond, stack §4.6 invariant 2); [ ] `/v1/redemptions/2` → `DEFAULTED`, `default_caller = W-JUDGE`; [ ] `/v1/series/4` → `bond.balance "2169.000000"`, `coverage "1.50"`.

### 3.5 Ringkasan saldo akhir fase 3 (= 03 §3.3 "state akhir")

| Item | Nilai | Raw | Cocok 03? |
|---|---|---|---|
| Bond series 4 | 2,169.000000 (health 0.964) | `2_169_000_000` | ya |
| Coverage series 4 | 4.50 ÷ 3.00 = 1.50 | — | ya [D-34] |
| `W-BUY` | USDC 985.000000; CU s4 2 | `985_000_000`; `2e18` | ya (holding 2) |
| `W-BUY2` | USDC 980.976000; CU s4 5; CU s3 1 (di escrow ask F-4) | | CU s4 ya; s3 tidak ada di 03 |
| `W-TRD` | USDC 986.000000; CU s4 5 | | ya |
| `W-P-JKT` | USDC 4,635.100000; proceeds primer s4 bruto 90.000000, fee 0.900000, neto 89.100000; bond dilepas 36.000000 | | proceeds ya; total bond provider beda (§8 X-2) |
| Treasury | 0.954000 (0.030000 seed F-4 + 0.924000 panggung) | `954_000` | fee panggung 0.924 ya |
| Series 4 | `sold` 30, `totalSupply` 12, terkunci 0 | | ya |
| Reputasi JKT | delivered 8, defaulted 10, strikes 1 | | ya |
| Indeks H100 | OK, 3.200000, round 1 | | ya |

**Cek konservasi USDC series 4** (seluruh aliran panggung): buyer −60 + 45 = −15.000; buyer2 −16.024; trader −30 + 16 = −14.000; provider −2,250 + 59.40 + 29.70 + 36 = −2,124.900; treasury +0.924; bond vault +2,169.000. Jumlah = **0** ✓. **Cek CU:** mint 30 − burn 18 = 12 = 2 + 5 + 5 ✓. **Invariant bond** [D-18]: `bondPerCU × totalSupply = 4.50 × 12 = 54 ≤ 2,169` ✓.

### 3.6 Fase 4: jalur dispute (bukan panggung)

Tujuan: menguji state machine dispute di chain sungguhan dan menyiapkan data S7 (NICE). Design §7.1 mewajibkan "Dispute → both rulings" + "Arbitrator timeout" di Foundry; fase ini adalah versi end-to-end di atas seed. **Tidak dijalankan di deployment panggung**, karena akan mengubah bond 2,169 dan contoh 03 [P5-14].

Mulai dari state akhir fase 3. Di anvil: ambil snapshot "S3". Di testnet latihan: tiap cabang memakai request terpisah 1 CU (lihat catatan di akhir).

**D-01 Request** (agent menyala lagi)
- `W-BUY2` `requestRedemption(4, 4e18, deliveryRef3)` → `RedemptionRequested(3, …)`. Klaim = 4 × 4.50 = **18.000000**.

**D-02 Ack + delivered**
- Agent: `acknowledge(3)` → `Acknowledged`; `markDelivered(3, receiptHash3)` → `Delivered(3, 4, receiptHash3, disputeDeadline = t + 90)`.

**D-03 Buka dispute**
- Pemanggil: `W-BUY2` (sudah approve RM, A-6). Fungsi: `dispute(3)` sebelum `disputeDeadline`.
- Dispute bond = max(5% × 18.00 = 0.90; minimal 5.00) = **5.000000** (`5_000_000`) (design §4.2, 01 P-02). Escrow di `RedemptionManager` [D-37].
- Event: `Disputed(3, 4, 5_000_000, rulingDeadline = t + 120)`, `DisputeReceived(3, rulingDeadline)` (PanelArbitrator).
- Sesudah: `W-BUY2` USDC 980.976 → **975.976000**.
- Assert: [ ] `stateOf(3) == Disputed`; [ ] `/v1/disputes?status=open` (03 E17) berisi req 3.
- Di anvil: ambil snapshot "S4". Lalu jalankan D-04a/b/c, revert ke "S4" di antara cabang.

**D-04a Putusan Delivered** [D-21: dispute bond 100% ke provider]
- Panel: `W-ARB-1` dan `W-ARB-2` menandatangani EIP-712 `(reqId 3, Delivered)` offchain. Siapa saja (relayer, mis. `W-DEP`) memanggil `PanelArbitrator.ruleWithSignatures(3, Delivered, [sig1, sig2])` sebelum `rulingDeadline` [D-36]. Mode Safe: `rule(3, Delivered)` lewat Safe (RH) dengan threshold 1.
- Event: `RulingSubmitted(3, Delivered, [W-ARB-1, W-ARB-2])`, `Ruled(3, Delivered, PanelArbitrator)`, `BondReleased(4, W-P-JKT, 18_000_000, 3)`, burn 4 CU, `ReputationUpdated(W-P-JKT, 12e18, 10e18, 0, 0, 1)`, `DeliveryRecorded(H100, 4e18)`, `RedemptionFinalized(3, 4, 4e18, 18_000_000, false)`; transfer dispute bond 5.000000 RM → provider.
- Sesudah: bond **2,151.000000**; `W-P-JKT` 4,635.10 + 18 + 5 = **4,658.100000**; `W-BUY2` **975.976000**, CU 1.
- Assert: [ ] `disputes_lost` tetap 0; [ ] dispute bond tidak kembali ke holder.

**D-04b Putusan NotDelivered** (dari "S4")
- `ruleWithSignatures(3, NotDelivered, [sig1, sig2])`.
- Event: `RulingSubmitted`, `Ruled(3, NotDelivered, …)`, `BondSlashed(4, W-BUY2, 18_000_000, 3)`, burn 4 CU, `ReputationUpdated(W-P-JKT, 8e18, 14e18, 0, 1, 2)`, `DefaultRecorded(H100, 4e18)`, `Defaulted(3, 4, W-BUY2, 4e18, 18_000_000, false, true, caller)`; dispute bond dikembalikan. `caller` = alamat `PanelArbitrator` (`msg.sender` di `onRuling`) [D-56, menjawab T5-08].
- Sesudah: `W-BUY2` 975.976 + 5 + 18 = **998.976000**, CU 1; bond **2,151.000000**; `strikes 2`, `disputes_lost 1`.

**D-04c Tanpa putusan → REFUNDED** (dari "S4")
- Lewati `rulingDeadline` (anvil: maju waktu 121 dtk; testnet: tunggu). Siapa saja memanggil `resolveNoRuling(3)` (01 P-47).
- Event: `Transfer(RM, W-BUY2, 4e18)`, `Refunded(3, 4, 4e18, 5_000_000)`.
- Sesudah: `W-BUY2` USDC **980.976000**, CU 5; bond **2,169.000000** (tanpa slash); reputasi tidak berubah; `refunded_after_window = false` [D-29].
- Assert negatif: [ ] `ruleWithSignatures` setelah deadline → revert `RulingDeadlinePassed`; [ ] 1 tanda tangan → `InsufficientSignatures`; [ ] tanda tangan ganda → `DuplicateSigner` (01 §6.9).

**Varian testnet latihan:** tidak ada revert, jadi jalankan tiga request terpisah masing-masing 1 CU dari `W-BUY2`. Klaim per request 4.50; dispute bond = max(0.225; 5.00) = 5.00. Urutannya a → b → c. Bond turun 4.50 (a) + 4.50 (b) = 9.00. Waktu nyata per cabang ≈ ack + delivered + dispute + ruling ≤ ~5 menit.

---

## 4. Repeatability

### 4.1 Tiga lingkungan [P5-20]

| Lingkungan | Untuk | Chain | Ponder | Reset |
|---|---|---|---|---|
| **Anvil** (fork RH Testnet, atau lokal murni) | Mengembangkan seed, latihan cepat, semua cabang dispute | Fork dari RPC RH Testnet wajib di-pin ke blok terbaru − 20, karena RPC publik menolak fork dari blok lama ("non-archive", OQR). Fork mempertahankan chain id 46630, jadi konfigurasi `CHAIN` bisa dipakai ulang | Lokal (PGlite) | Snapshot/revert anvil |
| **Latihan testnet** | Gladi end-to-end dengan waktu nyata, rekaman video backup, "Rehearse the demo ×3" (design §7.3) | Chain yang sama dengan panggung | Lokal atau instance kedua | Deployment baru (nonce deployer baru, `DEPLOY_LABEL` baru; SC-17) atau series baru per run |
| **Panggung** | Submission (Sab 11:30) + Demo Day (Min 11 Okt) | Chain hasil go/no-go | Hosted (**Vercel** frontend + **Railway** indexer/API/Postgres, D-58) | Hanya kalau tercemar: deploy ulang penuh |

### 4.2 Strategi reset

| Strategi | Cara (prosa) | Kelebihan | Kekurangan | Dipakai di |
|---|---|---|---|---|
| **Snapshot/revert anvil** | Ambil snapshot setelah fase 2 ("S0"), setelah fase 3 ("S3"), setelah D-03 ("S4"). Revert ke snapshot sebelum run berikutnya | Detik; ID series/request/order sama setiap run, jadi cocok dengan fixture 03 | Revert terlihat seperti reorg bagi Ponder; perilaku Ponder belum diuji [T5-09]. Usulan: setelah revert, hentikan Ponder, hapus DB PGlite, sync ulang dari start block [P5-17] | Anvil |
| **Deployment baru** | Fase 0–2 diulang sebagai deployment baru: alamat CREATE dari nonce deployer yang sudah naik, `DEPLOY_LABEL` baru (§4.5, 04 P4-13; diperbaiki SC-17) | Bersih total; ID cocok dengan 03 | Butuh waktu (diukur Jumat [T5-11]), gas, DB Ponder baru, update `DEPLOYMENTS.md` dan env frontend | Latihan testnet (sesekali), panggung (kalau tercemar) |
| **Series baru per run** | Deployment sama; tiap gladi mem-forge `CU-JKT-H100-2610` lagi (ID 5, 6, …) | Murah | ID tidak cocok dengan 03; print H100 menumpuk sehingga indeks sudah `OK` sebelum adegan "ticks"; simbol ganda di S1 (01 tidak mewajibkan simbol unik) | **Hanya** latihan testnet; **dilarang** di panggung [P5-13] |

Di RH Testnet, deploy ulang boleh memakai ulang instance `EAS` + `SchemaRegistry` + schema `ParticipantVerified` dan attestation yang sudah ada, karena attestation tersimpan di EAS, bukan di gate. Yang perlu diulang hanya kontrak Paron (deployment baru, alamat dari nonce baru) dan `linkAttestation` di `EASGate` yang baru. Ini menghemat ~20 menit deploy EAS (stack §3.3) [P5-25].

### 4.3 Aturan idempotensi seed [P5-21]

1. **Fase 0–2 idempoten. Fase 3–4 tidak.** Script seed panggung berhenti setelah fase 2. Fase 3–4 hanya bisa jalan dengan flag eksplisit "rehearsal" dan menolak berjalan kalau alamat deployment = alamat panggung di `DEPLOYMENTS.md`.
2. **Cek dulu, baru kirim.** Setiap langkah membaca state sebelum mengirim tx: provider sudah `Active` → lewati A-5; attestation sudah linked dan valid → lewati A-3/A-4; series dengan `(provider, symbol)` sama sudah ada → lewati F-x dan pakai `seriesId` yang ada; allowance sudah cukup → lewati A-6.
3. **Top-up ke target, bukan menambah.** mUSDC dan ETH di-top-up sampai target (A-2), jadi menjalankan ulang tidak menggandakan saldo.
4. **Manifest.** Setiap run menulis manifest (alamat, `seriesId`, `orderId`, `reqId`, tx hash, blok) di samping `DEPLOYMENTS.md`. Lokasi dan format = doc 04 §7 (P4-08; T5-12 selesai). Run berikutnya membaca manifest untuk langkah "cek dulu".
5. **Gagal di tengah = lanjut dari langkah gagal**, bukan mulai dari nol. Ini aman karena aturan 2.
6. **Tanpa `maxCost = 0`** (01 §6.6). Setiap `buy` memakai `maxCost` persis (60_000_000 / 30_000_000 / 3_000_000).

### 4.4 Penanganan waktu

| Hal | Anvil | Testnet (latihan + panggung) |
|---|---|---|
| Window series 2610 | Timestamp anvil = jam nyata (Okt 2026), jadi window terbuka tanpa warp | Terbuka sampai 2026-11-01T00:00Z; aman untuk Demo Day 11 Okt |
| Window 2611/2612 | Belum terbuka (redeem revert `OutsideRedemptionWindow`). Uji redeem bisa dengan maju waktu, hanya di snapshot terpisah | Belum terbuka; tidak dipakai untuk redeem |
| Countdown ack/delivery/dispute/ruling | Maju waktu lewat RPC anvil (naikkan waktu atau set timestamp blok berikutnya, lalu mine satu blok). Tidak perlu menunggu | **Tunggu nyata** 60/60/90/120 dtk. Klaim valid kalau `block.timestamp > deadline`; beri jeda 2–5 dtk [T5-02] |
| Jam API (`DEFAULTABLE`, `actions`, 03 P3-33) | Setelah warp, jam server tertinggal dari chain. Usulan: di mode anvil API memakai timestamp blok terakhir sebagai `now` [P5-15] | Jam server ≈ chain; tetap bandingkan per detik. **[D-48]** P5-15 tetap untuk anvil; nilai itu juga diekspos sebagai `meta.server_now_ms` (03 §3.1) |
| Countdown di UI (S4) | Aturan jam tunggal [D-48] | Tombol "Claim default" tampil kalau `wallclock > deadline + 2 dtk` (jam klien disinkronkan ke `meta.server_now_ms`; mode anvil = waktu chain, P5-15), lalu simulasi `claimDefault`; tx yang memutuskan. Alasan: di testnet ArbOS blok tidak maju saat chain sepi, jadi countdown dari timestamp blok (P5-16 lama) bisa beku (AUDIT SC-4). Untuk S-13: juri menekan setelah countdown habis + 2 dtk, tidak perlu menunggu blok baru |
| Indeks 24 jam | Print gladi ikut terhitung selama 24 jam | Deployment panggung tanpa print H100, jadi status `THIN` sampai trade panggung |
| Referensi sintetis | — | Push ulang (F-5) ≤ 1 jam sebelum demo supaya `observed_at` segar |

### 4.5 Alamat deterministik

**Sinkronisasi Jum 9 Okt (07 V-8, 04 P4-13 APPROVED):** kontrak inti di-deploy dengan **prediksi alamat CREATE dari nonce deployer**, bukan CREATE2. Dua poin pertama di bawah (CREATE2 + salt per label, P5-18) **tidak berlaku lagi**; deploy ulang otomatis mendapat alamat baru karena nonce naik, dan alamat sama antar chain tidak dijanjikan (T5-10 selesai). Poin "Token series" tetap berlaku.

- 01 P-65 (dan 07 D-40) mengusulkan alamat kontrak dihitung dengan CREATE2 lewat deployer `0x4e59…956C` yang ada di kedua chain (design §11.1: "The same salts give the same Paron addresses on both chains (EAS addresses differ)").
- **Catatan [T5-10]:** alamat CREATE2 bergantung pada initcode **termasuk argumen constructor**. Kontrak yang menerima alamat berbeda per chain (alamat EAS di `EASGate`, Safe/treasury, dan semua kontrak yang menerima alamat gate) akan punya alamat berbeda antar chain, walau salt sama. Klaim "same addresses" hanya berlaku untuk kontrak yang argumennya identik.
- **Deploy ulang di chain yang sama butuh salt baru.** Salt + initcode yang sama akan bertabrakan dengan deployment lama. Usulan: salt = hash dari label deployment, mis. `paron/stage/v1`, `paron/rehearsal/3` [P5-18].
- **Token series:** `Clones.cloneDeterministic` dengan salt `keccak256(seriesId)` (01 P-29). Jadi alamat token4 bisa diketahui sebelum forge lewat `predictTokenAddress(4)`. Ini berguna untuk menyiapkan UI/bot, tetapi `approve` ke alamat tanpa kode tidak berguna, jadi S-04 tetap dilakukan setelah forge.

### 4.6 Jadwal deployment panggung [P5-19]

1. Fri 20–24: deploy + seed di chain terpilih (design §7.3) dipakai sebagai **deployment latihan**.
2. Sab 06:00: kontrak dibekukan (design §7.3). Deployment **panggung** dibuat dari kode beku: fase 0–2 saja.
3. Sab 06–10: gladi ×3 + rekam video backup di deployment **latihan** atau anvil, **tidak** di panggung.
4. Sab 11:30: submission memakai alamat deployment panggung.
5. Sab 12:00 → Min demo: deployment panggung tidak disentuh, kecuali push referensi (F-5) dan cek baca. Pihak luar tidak bisa membeli atau trading karena KYB [D-31]. Fungsi tanpa izin (`claimDefault`, `finalizeSeries`, `poke`) tidak punya target di state ini.

### 4.7 Checklist pra-demo

**T−24 jam (Sab sore)**
- [ ] `/v1/health` deployment panggung: `synced`, `lag_blocks` kecil.
- [ ] Assert akhir fase 2 (§3.3) masih benar: 3 series, H100 `THIN` `value null`, `prints?gpu=H100` kosong, tidak ada redemption.
- [ ] Saldo ETH semua wallet ≥ minimum [T5-01]; saldo mUSDC = snapshot fase 2.
- [ ] Allowance A-6 masih ada; attestation belum expired/revoked.
- [ ] Video backup ada di 2 perangkat (design §8).
- [ ] Slide: footnote "not affiliated" (design §10.5 #6), label "synthetic demo data".

**T−60 menit**
- [ ] Push referensi sintetis (F-5); `/v1/reference/H100` segar.
- [ ] Agent provider menyala, kill switch **off**, uji deteksi ke chain (tanpa tx).
- [ ] Keeper dalam **dry-run** (stack §4.4).
- [ ] Bot trader **armed** dalam mode otomatis (§2.5) di deployment panggung; alamat token4 diprediksi (§4.5); USDC allowance `W-TRD` ke `PrimarySale` ada; saldo `W-TRD` ≥ 30 mUSDC + gas [T5-01]; trigger manual terlihat di jendela bot.
- [ ] Profil browser: "Provider" (S2/S5), "Buyer" (S3/S4), "Buyer 2" (S3); HP juri dengan `W-JUDGE` terhubung [T5-03].
- [ ] RPC utama (`NEXT_PUBLIC_RPC_URL`) dan, kalau terisi, cadangan (`NEXT_PUBLIC_RPC_URL_BACKUP`) bisa dipakai frontend [D-89].
- [ ] Terminal `curl` dengan URL API siap; stopwatch di layar.

**T−10 menit**
- [ ] Blok chain bergerak (timestamp blok terakhir < 10 dtk lalu).
- [ ] `/v1/series` menampilkan 3 series; tidak ada `CU-JKT-H100-2610` (kalau ada → deployment tercemar → pakai fallback level 4 atau video).
- [ ] Wizard S2 sudah berisi preset 2610 (500 jam H100, $3.00, bond $4.50, window Okt, 60/60/90).
- [ ] Nonce wallet bersih (tidak ada tx pending).

### 4.8 Rencana fallback saat demo

Go/no-go Jumat (design §11.3) menentukan chain utama. Rencana di bawah untuk Demo Day.

| Level | Gejala | Tindakan | Status |
|---|---|---|---|
| 0 | Satu tx lambat (> 15 dtk) | Narator mengisi waktu; kirim ulang dari UI | [P5-24] |
| 1 | RPC error / rate-limit | Ulang dengan jeda 400/800/1600 ms. Kalau `NEXT_PUBLIC_RPC_URL_BACKUP` atau `INDEXER_RPC_URL_BACKUP` terisi, transport cadangan dipakai. Sisa kegagalan tampil sebagai teks redup, bukan error merah [D-89] | D-89 |
| 2 | Ponder/API mati | Frontend membaca kontrak langsung untuk S3 (`bondOf`, `getLevels`) dan S4 (`stateOf`, `getRequest`) (03 P3-12); lewati adegan `curl`; tampilkan event di Blockscout | [P5-23]. **[D-58]** Mode ini **S0-kritis** (wajib jadi sebelum T0+8h = 19:14 WIB), karena juri meninjau async Sab 12:00 → Min dan API yang mati = UI kosong |
| 2b | Bot trader tidak memasang ask ≤ 10 dtk setelah `PrimaryBuy` S-02 | Trigger manual di jendela bot → manual dari UI dengan `W-TRD` → lewati trade (§2.5) | [APPROVED P5-26] |
| 3 | Agent tidak ack dalam 3 dtk | Provider menekan Ack / Mark delivered manual di S5 (design §7.2 S5) dan narasi tetap jalan | [P5] |
| 4 | Chain utama berhenti (blok tidak bergerak > 60 dtk saat T−10 atau saat demo) | (a) **Deployment siaga** di chain cadangan (Arbitrum Sepolia kalau utama RH) yang sudah melewati fase 0–2 dengan Ponder + build frontend sendiri; (b) kalau (a) tidak ada atau gagal → **video backup** | (a) = usulan baru [P5-22], biaya: hosting ganda + dana di kedua chain (design §11.2 sudah mendanai kedua chain); (b) = design §8 |
| 5 | Lebih dari satu adegan gagal | Putar video dari adegan yang gagal sampai akhir | [P5-24] |

Kalau go/no-go Jumat sudah memindahkan semuanya ke Arbitrum Sepolia, level 4a menjadi opsional (RH bisa jadi cadangan hanya kalau cek 1–5 lolos di sana).

---

## 5. Ketergantungan pada keputusan 07

Semua D-xx di bawah **APPROVED** (Jum 9 Okt 2026 ~09:40 WIB) dengan opsi rekomendasi; kolom kanan hanya catatan kalau dibuka ulang.

| D-xx | Bagian 05 | Kalau keputusan berbeda |
|---|---|---|
| D-02 | Window bulan kalender (F-1..F-3, S-01) | Window bebas → ukuran lot 720/744 tidak wajib |
| D-04 | Attester KYB = Safe tim berlabel (A-3) | Persona auditor → label UI berubah |
| D-54 (APPROVED ~11:05 WIB, hackathon) | A-3 dari `W-VERIFIER`; `W-ADMIN` proposer | Kembali ke D-04 → A-3 lewat Safe (P5-09) |
| D-06 | F-5, strip referensi, coverage | Tanpa `ReferenceFeed`: strip hanya indeks, coverage tidak tampil |
| D-09 | Faktor di fase 0 | Faktor A100/RTX4090 berbeda (tidak dipakai di skenario) |
| D-13 | Treasury = Safe | Saldo treasury tetap 0.954 di alamat lain |
| D-15 | Status `THIN` → `OK` di adegan trade; parameter demo | Dua status saja → tetap jalan; parameter lain bisa membuat 1 fill tidak cukup untuk `OK` |
| D-17 | Order book ≤ 10 level | — |
| D-18 | Assert invariant bond §3.5 | — |
| D-19 | Series panggung `CU-JKT-H100-2610`, `allowOpenWindow`. Penamaan live: D-82 (`CU-JKT-H100-2611`); teks ini historis | Kalau ditolak: redeem/default di panggung tidak mungkin (window Nov) |
| D-20 | 60/60/90/120 dtk | Kalau batas prod dipakai: demo default live mustahil |
| D-21 | D-04a: dispute bond → provider | Split dengan arbitrator → saldo D-04a berubah |
| D-22 | Isi event `Trade` S-06 | Tanpa field tambahan → assert print lewat API saja |
| D-23, D-24 | EASGate/RegistryGate, satu schema role 1–3 | Schema `ProviderVerified` terpisah → A-3 bertambah |
| D-25 | 3 seed + 1 live. Penamaan live: D-82; teks ini historis | 3 series saja → series 2610 menggantikan salah satu |
| D-26 | `receiptHash` saja (S-09) | Receipt EAS → tambah attestation per delivery |
| D-29 | `refunded_after_window` (D-04c) | — |
| D-30 | Listing 1 tx dengan permit (S-01) | Tanpa permit → 2 tx, stopwatch makin ketat |
| D-31 | KYB untuk buyer/trader; entity wallet 2 = buyer | Tanpa KYB → callout `SelfMatch()` dan `eligible` berubah |
| D-33 | `strikes`, counter reputasi | Satu counter → tampilan "strike" berubah |
| D-34 | Coverage 1.50 / 2.03 | Rumus lain → angka berubah |
| D-35 | `SelfMatch()` revert (S-12), `eligible` (S-06) | Opsi skip-resting → callout tidak revert |
| D-36 | `ruleWithSignatures` 2-of-3 (D-04a/b) | Safe saja → putusan lewat Safe tx |
| D-37 | Dispute bond di-escrow RM, ruling 120 dtk | Escrow di BondVault → approval A-6 ke kontrak lain |
| D-38 | `lockFrom` 1 tx (S-07, S-10) | Approve dulu → +1 tx per redeem di panggung |
| D-39 | `leadTime = 0` demo | — |
| D-40 | Faucet 5,000 mUSDC/jam (cadangan dana) | — |

---

## 6. Register usulan P5-xx

P5-01..P5-25 **APPROVED** (Jum 9 Okt 2026 ~09:40 WIB). P5-26 ditambahkan setelah approval dan **APPROVED** terpisah (Jum 9 Okt 2026 ~10:33 WIB, Fatih; 07 §10.3).

| ID | Usulan | § |
|---|---|---|
| P5-01 | Negara trader `SG` (fiktif) | §1 |
| P5-02 | `expiry` attestation 2027-10-08T00:00Z | §1 |
| P5-03 | Target mUSDC: provider 10,000; buyer/buyer2/trader 1,000; lewat `mint`, bukan faucet | §1, A-2 |
| P5-04 | Bot trader: `buy` 10 CU primer setelah buyer, lalu ask 5 @ 3.20 | §2.1 A4, S-03 |
| P5-05 | Trader `approve` token CU baru ke `OrderBook` di panggung (01 tidak punya escrow tanpa allowance). Alternatif: tambahkan hak escrow `OrderBook` di `CUToken` seperti `lockFrom` (mengubah 01) | S-04, §8 X-6 |
| P5-06 | Naskah ter-retime (redeem 10 di ≈1:10, countdown paralel) | §2.3 |
| P5-07 | Callout `SelfMatch()` di series 3 memakai ask seed `W-BUY2` | F-4, S-12 |
| P5-08 | Konfigurasi bertimelock dilakukan sebelum serah role | §3.1 |
| P5-09 | KYB lewat satu tx Safe `multiAttest` (hackathon: `W-VERIFIER`, D-54 APPROVED) | A-3 |
| P5-10 | Approval persis, bukan unlimited | A-6 |
| P5-11 | Ukuran series seed: 2611 = 720 jam, 2612 = 744 jam | F-1, F-3 |
| P5-12 | Referensi sintetis 3.00 per CU untuk kunci H100/H200/B200 | F-5 |
| P5-13 | Deployment panggung tanpa fill H100, redemption, atau series 2610 sebelum demo | §3.3, §4.2 |
| P5-14 | Jalur dispute hanya di anvil/latihan | §3.6 |
| P5-15 | Mode anvil: API memakai timestamp blok terakhir sebagai `now` | §4.4 |
| P5-16 | ~~Countdown UI dari timestamp blok~~ → diganti aturan jam tunggal `meta.server_now_ms` + 2 dtk [D-48] | §4.4 |
| P5-17 | Setelah revert anvil: DB Ponder dihapus dan sync ulang | §4.2 |
| P5-18 | Salt CREATE2 per label deployment (**digantikan** P4-13: tidak diperlukan karena kontrak inti memakai prediksi CREATE) | §4.5 |
| P5-19 | Jadwal deployment panggung (setelah freeze Sab 06:00, tidak disentuh sampai demo) | §4.6 |
| P5-20 | Tiga lingkungan: anvil, latihan, panggung | §4.1 |
| P5-21 | Aturan idempotensi + manifest | §4.3 |
| P5-22 | Deployment siaga di chain cadangan untuk Demo Day | §4.8 |
| P5-23 | Frontend fallback baca kontrak langsung saat API mati. **[D-58]** S0-kritis | §4.8 |
| P5-24 | Aturan abort: tx > 15 dtk → isi narasi; gagal berulang → video | §4.8 |
| P5-25 | Reset di RH memakai ulang EAS + schema + attestation | §4.2 |
| P5-26 | **APPROVED (Jum 9 Okt 2026 ~10:33 WIB, Fatih), tim solo:** bot trader berjalan otomatis selama demo, dipicu oleh `PrimaryBuy` `W-BUY` di series 4 (bukan oleh anggota tim C); trigger manual tetap ada sebagai cadangan (alur lengkap §2.5) | §1, §2.3 A4, §2.4 |

## 7. TBD baru (T5-xx)

Setelah approval: **T5-10** selesai (04 P4-13: alamat sama antar chain tidak dijanjikan), **T5-12** selesai (04 P4-08 manifest). Sisanya masih TBD (07 §10).

| ID | Item |
|---|---|
| T5-01 | Jumlah ETH gas per wallet dan batas minimum |
| T5-02 | Latensi nyata tx → blok di chain terpilih (klaim ~100 ms soft confirmation belum diukur, stack §1.1) |
| T5-03 | Cara HP juri terhubung (WalletConnect/RainbowKit vs wallet in-app) |
| T5-04 | Isi JSON `paron-spec/v1` (`specHash`), `deliveryRef`, dan JSON receipt |
| T5-05 | Harga primer `CU-SGP-B200-2612` (sumber tidak menyebut; dipakai 3.00 sebagai placeholder) |
| T5-06 | **Terjawab [D-51]:** `OrderPlaced` **tidak** diemit untuk taker IOC yang terisi penuh; hanya untuk sisa yang di-rest |
| T5-07 | Cara agent mendeteksi request (langsung dari chain vs lewat Ponder), demi target 3 dtk |
| T5-08 | **Terjawab [D-56]:** `caller` di `Defaulted` lewat putusan = alamat `PanelArbitrator` (`msg.sender` di `onRuling`) |
| T5-09 | Perilaku Ponder saat anvil revert (reorg buatan) |
| T5-10 | Kesamaan alamat CREATE2 antar chain kalau argumen constructor beda per chain |
| T5-11 | Waktu total deploy ulang + seed fase 0–2 (ukur Jumat) |
| T5-12 | Lokasi dan format manifest seed |

---

## 8. Divergensi / catatan terhadap design, 01, 07, 03

| # | Temuan | Rekomendasi |
|---|---|---|
| X-1 | ⚠ ARITMETIKA: naskah design §7.4 / PK §11.1 memberi 30 dtk untuk adegan default yang berisi countdown ack 60 dtk. Klaim tercepat = request + 61 dtk | Naskah ter-retime §2.3 [P5-06]; total tetap 2:30 dengan hook 12 dtk dan listing ≤ 28 dtk |
| X-2 | 03 E12 (provider JKT) menampilkan `bond.deposited 2,250 / balance 2,169`, padahal provider JKT juga pemilik series 1 (`CU-JKT-H100-2611`, bond 3,240). Total sebenarnya: deposited **5,490.000000**, balance **5,409.000000** (released 36, slashed 45 sama). Proceeds 90 / 0.90 / 89.10 tetap benar karena series 1 tidak terjual | Ganti label contoh 03 menjadi "series 4 saja", atau perbarui angka total (keputusan parent; 03 tidak diubah di sini) |
| X-3 | 03 E7 memberi ask trader `order_id 1`. Kalau F-4 (ask callout) di-seed, ask panggung = `orderId 2` | Tanpa F-4, angka 03 cocok; dengan F-4, fixture 03 memakai 2 |
| X-4 | Design §10.5 #2 ingin chart "PrintIndex H100 2026-11 vs spot reference". P5-13 membuat chart itu kosong sebelum demo | Trade-off sengaja demi adegan "ticks" + contoh 03 E2. Alternatif: seed fill H100 di 2611 > 24 jam sebelum demo, tetapi E2 lalu menampilkan nilai carry-forward (bukan `null`) dan total provider JKT berubah |
| X-5 | Urutan panggung: request #2 (10 CU) sebelum `confirm(1)`, sedangkan timeline gladi 03 §3.3 mengonfirmasi #1 dulu | `reqId` (1 = 8 CU, 2 = 10 CU) dan semua angka akhir sama; hanya urutan baris statement/timeline yang berbeda |
| X-6 | 01 §6.4/§6.7: tidak ada escrow CU tanpa allowance untuk `OrderBook` (hanya `lockFrom` untuk RM) | **RESOLVED** (Jum 9 Okt): P5-05 APPROVED (approve oleh bot); 01 §6.7 menuliskannya eksplisit |
| X-7 | 01 P-37 `createSeriesWithPermit` tidak menyebut spender permit. Karena `BondVault.deposit` yang menarik USDC, spender harus `BondVault` | **RESOLVED**: 01 §6.3 menulis spender = `BondVault` |
| X-8 | Stack §4.4: seeder menjalankan "one default scenario (10 CU → $45 payout)". Di 05, default **tidak** di-seed di deployment panggung (dimainkan live); hanya di latihan/video | Konsisten dengan D-25 ("forged live"); wording stack dianggap untuk deployment latihan |
| X-9 | Design: "The Jakarta series shows a strike"; counter `strikes` (01 P-25, D-33) ada per provider, bukan per series | UI menampilkan strike provider di halaman series |
| X-10 | Design §7.1: "Seed script: three verified providers and series" (3) vs stack §4.4 (4 series) | Diselesaikan [D-25]: 3 seed + 1 live |

**Rekonsiliasi angka** (semuanya cocok kecuali X-1 dan X-2):
- 500 × 4.50 = 2,250 ✓
- 20 × 3.00 = 60, fee 0.60, neto 59.40 ✓
- 5 × 3.20 = 16.00, fee taker 0.024 ✓
- 8 × 4.50 = 36 ✓
- 10 × 4.50 = 45, beli 10 × 3.00 = 30 → +50% ✓
- 2,250 − 36 − 45 = 2,169 ✓; 4.50 ÷ 3.00 = 1.50 ✓
- H200: 4.06 × 1.4 = 5.684 (design: 5.69) ✓ dengan catatan pembulatan
- Dispute: 5% × 18 = 0.90 < 5.00 → 5.00 ✓
