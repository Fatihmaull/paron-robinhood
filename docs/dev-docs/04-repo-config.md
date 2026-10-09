# Paron: repo, konfigurasi, deploy, dan bootstrap (dev doc 04)

Status: **APPROVED-SYNCED, spec saja.** Keputusan 07 dan P4-xx disetujui Fatih (Jum 9 Okt 2026 ~09:40 WIB); disinkronkan Jum 9 Okt ~10:30 WIB (schema `KybApplication`, env agent D-42, Timelock di indexer, tim solo). Cadangan: `.bak-2026-10-09-pre-approval/`. Isinya hanya struktur folder, tabel variabel, urutan langkah dalam prosa, dan perintah yang disebut dalam kalimat. Tidak ada file kode, script, atau secret sungguhan. Repo dan kode baru dibuat mulai **Jumat 9 Okt 09:00 WIB**, karena commit pertama harus setelah kickoff (OQR §5: "repo must start Friday"). Disusun Kamis 8 Okt 2026, ~21:30 WIB.

**Catatan Jum 9 Okt 2026 ~11:07 WIB (audit Principal Engineer + approval ketiga Fatih ~11:05 WIB, 07 §10.4).** Cadangan sebelum perubahan: `.bak-2026-10-09-pre-audit/`.
- **Diterapkan sebagai spec (APPROVED):**
  - **D-54:** attester KYB = EOA `W-VERIFIER`; proposer Timelock = Safe + EOA `W-ADMIN`; executor terbuka (DP-4, DP-5, DP-18, P4-15, env §4.3, §6.3). Ini meng-override D-04 dan P4-15 untuk deployment hackathon saja.
  - **D-57:** go/no-go maksimal 45 menit sejak T0 (§8).
  - **Atribusi README:** "dibangun dengan bantuan Grok Bot" (§9.2).
  - **Author git = Fatih** (§9.2; nama/email diisi ~11:16 WIB).
  - **D-59:** jadwal bootstrap §10 diganti rencana 4 lane di 08 §1.
- ~~Masih PENDING: D-58~~ → lihat changelog ~11:16 di bawah.

**Changelog Jum 9 Okt 2026 ~11:28 WIB (cadangan `.bak-2026-10-09-pre-1127/`):** izin merge tetap untuk PE (§9.2); deploy hanya dari mesin PE, L4 menyiapkan script (§4.1 butir 6, §6, §8 cek 2).
**Changelog Jum 9 Okt 2026 ~11:30 WIB (cadangan `.bak-2026-10-09-pre-1130/`):** D-58 ownership → Hackathon Scout di komputer Scout (Fatih login GitHub + 2FA di 1:1 Scout); host = Vercel (`web/`) + Railway (`indexer/`); Scout serahkan `DATABASE_URL` + URL ke PE (§8).
**Changelog Jum 9 Okt 2026 ~11:33 WIB (cadangan `.bak-2026-10-09-pre-1133/`):** D-58: login Vercel+Railway sudah ada di komputer Scout (**tanpa kartu**); Railway project `paron` + Postgres; indexer `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (bukan dioper ke PE); Scout serahkan URL publik Railway; PE kirim env Railway lain ke Scout setelah deploy, Scout yang isi; PE tetap isi env Vercel (§8).
**Changelog Jum 9 Okt 2026 ~11:37 WIB (cadangan `.bak-2026-10-09-pre-1137/`):** go/no-go **GO** di Robinhood Chain Testnet (chain `46630`), diputuskan PE di grup ~11:36 WIB (sebelum batas 11:59); [PR #1](https://github.com/Fatihmaull/paron-robinhood/pull/1) dari L4 sudah masuk `main`. Fallback Arbitrum Sepolia **tidak** dipicu (tetap terdokumentasi sebagai cadangan tidak terpakai) (§8).
**Changelog Jum 9 Okt 2026 ~13:10 WIB (cadangan `.bak-2026-10-09-pre-1310/`):** URL produksi terisi (Scout ~13:08 WIB): Vercel `https://paron.vercel.app` (project `paron`, root `web/`, commit `b18b3d4`); Railway API `https://paron-robinhood-production.up.railway.app/v1`; env Vercel = `NEXT_PUBLIC_RPC_URL` + `NEXT_PUBLIC_API_BASE_URL` saja (`NEXT_PUBLIC_DATA_SOURCE=mock` dilarang) (§8, §4.4/§4.5).
**Changelog Jum 9 Okt 2026 ~13:11 WIB (cadangan `.bak-2026-10-09-pre-1310/` sebagai `*.pre-cors-fix-1311.md`):** PE ~13:09 WIB: `API_CORS_ORIGIN` **kosong dulu (historis; digantikan CORS = `https://paron.vercel.app`)** (allow all origins; data publik); dikunci ke `https://paron.vercel.app` belakangan saat final (§8, §4.4).
**Changelog Jum 9 Okt 2026 ~13:25 WIB (cadangan `.bak-2026-10-09-pre-1325/`):** kontrak **stage-1** sudah di-deploy di Robinhood Chain Testnet (`46630`) ~13:20 WIB (PE, di grup): `startBlock` core = `131496617`; verify-deployment lulus (14 kontrak punya kode, timelock delay 300 dtk, executor terbuka); seed jalan dengan series `CU-JKT-H100-2611`, `CU-BTM-H200-2611`, `CU-SGP-B200-2612` (sama dengan contoh 05/D-25; alamat hanya di `deployments/46630/infra.json` + `stage-1.json` di `main`, tidak disalin ke doc). Railway (Scout ~13:20): `DEPLOY_LABEL=stage-1`, `INDEXER_RPC_URL` = RPC publik Robinhood sementara (belum ada RPC pribadi), `API_CORS_ORIGIN=https://paron.vercel.app` (menggantikan catatan 'kosong dulu' PE ~13:09; menunggu konfirmasi redeploy). Vercel/web baca alamat dari manifest (`NEXT_PUBLIC_DEPLOY_LABEL`); **tidak** memakai `NEXT_PUBLIC_ADDR_*` (§7, §8, §4.4/§4.5).
**Catatan Jum 9 Okt 2026 ~14:15 WIB (PE dan Designer di grup ~14:13 WIB; cadangan `.bak-2026-10-09-pre-1415/`):** **Risiko:** RPC publik Robinhood Chain Testnet `https://rpc.testnet.chain.robinhood.com` intermiten untuk sebagian koneksi browser (`net::ERR_SSL_UNRECOGNIZED_NAME_ALERT`, muncul di `/markets` dan `/portfolio`; `curl` normal). Kemungkinan juga penyebab notifikasi MetaMask "Unable to connect to Robinhood Chain Testnet". Bukan bug app. PE menguatkan web: retry dengan backoff, transport cadangan kalau ada RPC kedua, polling RPC dikurangi (data utama tetap dari indexer), tanpa error merah untuk kegagalan RPC (tanpa perubahan copy). PE merekomendasikan menyiapkan `INDEXER_RPC_URL_BACKUP` (opsional, PENDING RPC provider kedua; Fatih memutuskan/menyediakan; tabel env §4.2). Pengecekan hari demo ada di 09 §7.

**Catatan Jum 9 Okt 2026 ~14:02 WIB (PE di grup 13:59 WIB; cadangan `.bak-2026-10-09-pre-1402/`):** `DATABASE_SCHEMA` **tidak** lagi tetap `paron`. Penyebab kegagalan sebelumnya: Ponder menolak boot di schema `paron` yang dipakai build lama, sehingga Railway terus melayani container lama. Fix PR #30 (merge): tiap build memakai schema `paron_<sha8>` (8 karakter pertama commit sha). Indexer sehat: `/v1/health` 200 `synced:true`, `/v1/series` mengembalikan 3 series (`CU-JKT-H100-2611`, `CU-BTM-H200-2611`, `CU-SGP-B200-2612`). Tiap deploy backfill ±1 menit, jadi `503 INDEXER_SYNCING` sebentar itu normal.

**Changelog Jum 9 Okt 2026 ~11:16 WIB (approval Fatih ~11:12 WIB, 07 §10.5; "go" Fatih 11:14 WIB). Cadangan: `.bak-2026-10-09-pre-1112/`.**
- **D-58 APPROVED:** blok hosting indexer jadi spec (§8).
- **T0 = Jum 9 Okt 2026 11:14 WIB** (Fatih memberi "go"). Go/no-go selesai paling lambat **11:59 WIB** (T0+0:45).
- **Fallback chain (APPROVED Fatih):** kalau Robinhood Testnet gagal go/no-go 45 menit, **langsung** switch ke Arbitrum Sepolia, tanpa diskusi ulang (§8).
- **Git author terisi:** `Fatih Maulana` / `fatihmaulanamail@gmail.com` (§9.2). **Repo:** https://github.com/Fatihmaull/paron-robinhood (§1, §9.2).
- **Atribusi README final (kerja):** "Built by Fatih Maulana with help from Grok Bot" / "Dibangun oleh Fatih Maulana dengan bantuan Grok Bot" (§9.2; Fatih: "bilang saja ini dibantu oleh grokbot").

**Sumber:**
- dokumen kanonik: `paron-stack.md` **(stack §x)**, `paron-design.md` **(design §x)**, `open-questions-research.md` **(OQR §x)**, `notes.md`, `paron-product-knowledge.md` **(PK §x)**;
- `checks/` (dipakai **hanya** untuk fakta konfigurasi chain: alamat Safe 1.4.1, setelan Foundry untuk EAS, hasil fork test);
- konsistensi dengan **01** (wiring §9, role §4, governance §7, P-65), **02** (layout test, T2-01), **03** (Ponder, fixture, env mock/live), **05** (fase 0, salt P5-18, manifest T5-12, tiga lingkungan) dan **07** (D-xx, semuanya APPROVED Jum 9 Okt ~09:40 WIB kecuali D-10).

**Legenda:**
- **[D-xx]** = keputusan 07, **APPROVED** (Jum 9 Okt 2026 ~09:40 WIB, Fatih). **[APPROVED P4-xx]** = usulan dokumen ini, disetujui bersama rekomendasi 07 (sebelumnya `[PENDING P4-xx]`). **[TBD T4-xx]** = belum ada rekomendasi (masih terbuka, 07 §10).
- **Tim solo (D-08, sitemap §9):** kolom/label pemilik "A", "B", "C" dan "laptop A/B/C" di dokumen ini sekarang semuanya **Fatih**; "laptop A" = laptop utama Fatih, "laptop samping" = perangkat kedua. Urutan kerja jam per jam ada di `08-team-tasks.md`.
- ✅ = terverifikasi di sumber (stack/design/OQR/checks per 6 Okt 2026). ❓ = sumber menandai belum terverifikasi.
- **Peran tim** mengikuti template build plan design §7.3: **A** = kontrak, **B** = frontend, **C** = produk/pitch + indexer skeleton + agent. Nama orang = [D-08].

---

## 0. Ringkasan dan hal yang diselesaikan di sini

| Hal | Isi 04 | Menjawab |
|---|---|---|
| Layout monorepo | pnpm workspaces: `contracts/`, `indexer/` (API ikut di sini), `web/`, `agents/`, plus `config/`, `deployments/`, `fixtures/`, `shared/`, `docs/` | stack §4.7; 02 (layout test); 03 P3-37 (lokasi fixture) |
| Versi tool | Semua dipin persis dari stack §4 | stack §4 ("pin exact versions on Friday morning") |
| Config chain | Satu file `config/chains.json` dengan field yang diperluas dari daftar stack §3.1 | design §11.1, stack §3.1 |
| Env | Template per package (tabel), tanpa secret | — |
| Set parameter | `config/params/demo.json` dan `prod.json` (D-20, D-19, D-02, D-39, D-15) | 01 P-08, 05 fase 0 |
| Wiring melingkar | **Prediksi alamat CREATE (nonce deployer)** + constructor `immutable`; CREATE2 tidak bisa memecah siklus constructor | 01 P-65 (lihat divergensi X4-1) |
| Manifest | `deployments/<chainId>/infra.json` + `deployments/<chainId>/<label>.json`; `DEPLOYMENTS.md` dibangkitkan dari manifest | 05 T5-12 → [APPROVED P4-08] |
| Go/no-go | 5 cek design §11.3 → perintah dalam prosa + kriteria lulus | design §11.3 |
| CI | GitHub Actions: kontrak (fmt, build, test, invariant), TS (Biome, typecheck), NICE (Slither, Vitest, Playwright) | stack §4.6–§4.7, 02 T2-01 |
| Bootstrap Jumat | Checklist per blok menit 09:00–11:15 | design §7.3 |

---

## 1. Layout monorepo

**Repo GitHub:** https://github.com/Fatihmaull/paron-robinhood (publik saat submit, 09 P9-14; diisi Jum 9 Okt ~11:16 WIB).

### 1.1 Pohon folder

Struktur di bawah = usulan [APPROVED P4-01]. Folder utama mengikuti stack §4.7 (`contracts/`, `indexer/`, `web/`, `agents/`, `docs/`); tambahannya `config/`, `deployments/`, `fixtures/`, `shared/` (alasan di §1.2).

```text
paron/                                   ← root repo (commit pertama ≥ Jum 09:00 WIB)
├── README.md                            ← chain + chain ID + explorer di baris paling atas; atribusi (tanpa footnote "not affiliated", D-64; design §7.1, §7.5)
├── LICENSE                              ← teks lisensi MIT (09 T9-06 APPROVED Jum 9 Okt ~10:33 WIB)
├── DEPLOYMENTS.md                       ← tabel alamat per chain, DIBANGKITKAN dari deployments/ (stack §4.7)
├── METHODOLOGY.md                       ← metodologi PrintIndex + α winsorization (03 E2 "METHODOLOGY.md@versi")
├── SERIES_TERMS.md                      ← term redemption + set parameter demo vs prod (stack §4.7, [D-20])
├── paron-spec/
│   └── v1.schema.json                   ← skema JSON spec GPU untuk specHash (stack §4.7; isi = 05 T5-04)
├── package.json                         ← root workspace: packageManager pnpm, engines node 24
├── pnpm-workspace.yaml                  ← daftar workspace: indexer, web, agents, shared (+ contracts untuk dependency npm)
├── pnpm-lock.yaml                       ← lockfile wajib di-commit
├── biome.json                           ← lint + format TS (stack §4.3)
├── .nvmrc                               ← 24.21.0
├── .env.example                         ← variabel lintas package (CHAIN, dll.), placeholder saja
├── .gitignore                           ← .env*, out/, cache/, broadcast/ lokal, .ponder/, node_modules/
├── .github/
│   └── workflows/                       ← CI (§9)
├── config/
│   ├── chains.json                      ← SATU file config chain (§3)
│   └── params/
│       ├── demo.json                    ← set parameter demo (§5)
│       └── prod.json                    ← set parameter prod (dokumentasi + test)
├── deployments/
│   ├── 46630/                           ← Robinhood Chain Testnet
│   │   ├── infra.json                   ← MockUSDC, EAS, SchemaRegistry, schema UID, Safe (sekali per chain)
│   │   ├── smoke-1.json                 ← deployment go/no-go
│   │   ├── rehearsal-1.json …           ← deployment latihan (05 §4.1)
│   │   └── stage-1.json                 ← deployment panggung (dibekukan Sab 06:00)
│   ├── 421614/                          ← Arbitrum Sepolia (struktur sama)
│   └── 31337/ (atau 46630-fork)         ← anvil; TIDAK di-commit [P4-09]
├── fixtures/
│   └── v1/                              ← respons API mock lengkap per snapshot t0..t3 (03 §4, P3-37)
├── contracts/                           ← Foundry (peran A)
│   ├── foundry.toml                     ← setelan §2.2
│   ├── package.json                     ← dependency npm: OZ 5.6.1, eas-contracts 1.9.0 (remapping ke node_modules, pola checks/forge-pragma)
│   ├── remappings.txt
│   ├── src/
│   │   ├── libraries/ParonTypes.sol     ← tipe bersama 01 §5 (nama file yang ditunda 01)
│   │   ├── interfaces/                  ← IArbitrator, IParticipantGate, IReferenceFeed, …
│   │   ├── registry/ProviderRegistry.sol, ConversionTable.sol
│   │   ├── series/SeriesFactory.sol, CUToken.sol, BondVault.sol
│   │   ├── market/PrimarySale.sol, OrderBook.sol
│   │   ├── redemption/RedemptionManager.sol, PanelArbitrator.sol
│   │   ├── data/PrintIndex.sol, ReferenceFeed.sol
│   │   ├── gate/EASGate.sol, RegistryGate.sol
│   │   └── mocks/MockUSDC.sol
│   ├── script/
│   │   ├── DeployAll.s.sol              ← scope smoke | full (§6)
│   │   ├── Seed.s.sol                   ← fase 0–2 (05); idempoten
│   │   ├── Rehearsal.s.sol              ← fase 3–4; menolak jalan di label stage (05 §4.3)
│   │   └── lib/                         ← pembaca config/chains.json, params, penulis manifest
│   └── test/
│       ├── unit/                        ← satu file per kontrak: ProviderRegistry.t.sol, … (02)
│       ├── integration/                 ← test integ lintas kontrak (02 jenis integ)
│       ├── invariant/                   ← handler + invariant_* (02 §3)
│       ├── e2e/                         ← test_E2E_StageScript, test_E2E_DisputeBranches (02 §4)
│       ├── fork/                        ← testFork_* (02 §4.1); butuh RPC
│       └── mocks/                       ← MockArbitrator khusus test (02 P2-05)
├── indexer/                             ← Ponder 0.17.12 + API Hono (peran C, lalu A/B)
│   ├── ponder.config.ts                 ← chain aktif dari CHAIN; alamat + start block dari deployments/
│   ├── ponder.schema.ts                 ← tabel 03 §2.2
│   ├── src/
│   │   ├── handlers/                    ← handler event 03 §2.3
│   │   └── api/                         ← route Hono /v1/* (03 §3), health E18
│   └── .env.example
├── web/                                 ← Next.js 16 App Router (peran B)
│   ├── app/                             ← S1–S5 (+ S6/S7 NICE)
│   ├── lib/                             ← wagmi config, client API, pembaca fixture (mode mock)
│   └── .env.example
├── agents/                              ← satu package Node 24 + viem (stack §4.4)
│   ├── src/provider-agent/              ← auto-ack + markDelivered + kill switch (design §7.1)
│   ├── src/keeper/                      ← keeper default, dry-run saat demo (stack §4.4)
│   ├── src/trader-bot/                  ← 3 tx latar S-03..S-05 (05 P5-04)
│   ├── src/reference-signer/            ← push referensi sintetis (stack §4.4, D-06)
│   ├── src/safe-tools/                  ← hanya fallback opsi A: protocol-kit (design §11.4)
│   └── .env.example
├── shared/                              ← package TS internal
│   ├── abi/                             ← ABI dibangkitkan dari contracts/out (stack §4.3 "single source of truth")
│   ├── chains/                          ← loader + tipe untuk config/chains.json
│   └── constants/                       ← kunci gpuModel, kode role 1–4, enum state (01 §5)
└── docs/
    ├── dev/                             ← 01–07 dev docs (disalin Jumat; ditandai "riset pra-hackathon")
    └── architecture.md                  ← diagram arsitektur (design §7.3 kolom C)
```

### 1.2 Apa tinggal di mana + petunjuk kepemilikan

| Folder | Isi | Pemilik utama | Dibaca oleh | Catatan |
|---|---|---|---|---|
| `contracts/` | Kontrak 01, test 02, script deploy/seed | A | CI, `shared/abi` | Satu-satunya tempat Solidity |
| `indexer/` | Ponder + **API** | C (skeleton Jum 09–10:30), lalu A/B | `web/`, `agents/keeper`, `curl` panggung | API = route Hono bawaan Ponder (stack §4.2), jadi **tidak ada package `api/` terpisah** (X4-2) |
| `web/` | Frontend S1–S7 | B | — | Mode `mock` membaca `fixtures/v1/` |
| `agents/` | Agent provider, keeper, bot trader, signer referensi, alat Safe fallback | C (dengan A, design §7.3 slot 16–20) | — | Satu package, banyak entrypoint (stack §4.4 "One `agents/` package") |
| `config/` | `chains.json` + set parameter | A | semua package | Tanpa secret; aman di-commit |
| `deployments/` | Manifest alamat per chain per label | ditulis script A, **tidak diedit tangan** | Ponder, web (saat build), agents, seed "cek dulu" (05 §4.3) | §7 |
| `fixtures/v1/` | Respons API mock | C/B | `web/` (mode mock), test API | 03 §4 |
| `shared/` | ABI, loader chain, konstanta | A (ABI), B/C (loader) | indexer, web, agents | Menghindari ABI ganda di 3 tempat |
| `docs/` | Dev docs + arsitektur | C | juri, tim | README/METHODOLOGY/SERIES_TERMS/DEPLOYMENTS di root karena stack §4.7 menyebutnya sebagai dokumen repo yang dilihat juri |

**Seed** tinggal di `contracts/script/` (stack §4.4: `script/Seed.s.sol`). Fase 3 otomatis (anvil, latihan, video backup) di `Rehearsal.s.sol`. Bot trader yang dipakai **di panggung** ada di `agents/trader-bot`, karena di panggung ia dipicu manual oleh C (05 A4) [P4-02].

**Tidak dipakai:** Scaffold-ETH 2 (design §7.1 menyebutnya sebagai opsi, tetapi stack §4.3 mengunci Next.js + wagmi + RainbowKit); Privy (roadmap, stack §4.3); Goldsky/graph-cli (hanya kalau hosting Ponder gagal, stack §4.2).

---

## 2. Versi tool (dipin)

Aturan pin [APPROVED P4-03]:
- versi npm **persis** (tanpa `^`/`~`) di setiap `package.json`, plus `pnpm-lock.yaml` di-commit dan `pnpm install --frozen-lockfile` di CI;
- field `packageManager` (pnpm) dan `engines.node` di root, plus `.nvmrc`;
- Foundry lewat `foundryup -i v1.8.5` di laptop dan `foundry-rs/foundry-toolchain` dengan versi yang sama di CI (stack §4.7);
- **tidak upgrade apa pun selama hackathon** (stack §4).

### 2.1 Tabel versi

| Lapisan | Tool | Versi pin | Status sumber | Catatan |
|---|---|---|---|---|
| Kontrak | Solidity (file Paron) | `pragma solidity 0.8.37` (exact) | ✅ stack §4.1 | **Tanpa** pin `solc` global (lihat §2.2). Fallback kalau verifikasi Blockscout/Slither bermasalah: 0.8.30 ❓ |
| Kontrak | Solidity (file EAS) | 0.8.29 (exact, dari paket EAS) | ✅ OQR §3, `checks/forge-pragma` | Dikompilasi otomatis lewat auto-detect |
| Kontrak | Foundry (forge, cast, anvil, chisel) | **v1.8.5** | ✅ stack §4.1; log `checks/anvil-rh.log` menampilkan 1.8.5 | Rilis 6 Okt; kalau rusak, rilis stabil sebelumnya ❓ |
| Kontrak | forge-std | dipin ke commit/tag saat `forge install` pertama | ❓ stack §4.1 | [TBD T4-01]: catat versi di manifest `toolchain` |
| Kontrak | OpenZeppelin Contracts + Contracts Upgradeable | **5.6.1** | ✅ stack §4.1 | Jangan 5.7.0 (tag `dev`) |
| Kontrak | `@ethereum-attestation-service/eas-contracts` | **1.9.0** (kontrak `version()` = 1.4.0) | ✅ stack §3.3, OQR §3 | Self-deploy di RH Testnet saja |
| Kontrak | Slither | **0.11.6** | ✅ stack §4.6 | NICE, CI |
| Indexer/API | Ponder (`ponder`) | **0.17.12** | ✅ stack §4.2 | Peer: viem ≥ 2.35, hono ≥ 4.5, TS ≥ 5.4 |
| Indexer/API | Hono | **4.13.13** | ✅ stack §4.2 | |
| Indexer/API | Postgres | 16 atau 17 (ikut default managed DB hosting) | ❓ stack §4.2 "exact" | [TBD T4-02]; dev pakai PGlite |
| Frontend | Next.js / React | **16.3.8** / **19.3.0** | ✅ stack §4.3 | App Router |
| Frontend | viem | **2.57.3** | ✅ stack §4.3 | Punya `robinhoodTestnet`, `arbitrumSepolia` |
| Frontend | wagmi | **2.19.5** | ✅ stack §4.3 | Tetap 2.x (RainbowKit belum mendukung 3.x) |
| Frontend | `@tanstack/react-query` | **5.104.1** | ✅ stack §4.3 | |
| Frontend | RainbowKit | **2.2.11** | ✅ stack §4.3 | |
| Frontend | Tailwind CSS / shadcn CLI | **4.3.3** / **4.21.3** | ✅ stack §4.3 | |
| Frontend | lightweight-charts / Recharts | **5.2.1** / **3.10.1** | ✅ stack §4.3 | |
| Semua TS | TypeScript | **5.9.3** | ✅ stack §4.3 | Jangan 7.0.2 |
| Semua TS | Biome | **2.5.15** | ✅ stack §4.3 | Lint + format |
| Agents | Node.js | **24.21.0** (LTS "Krypton") | ✅ stack §4.4 | Juga runtime indexer |
| Agents | `@safe-global/protocol-kit` | **8.0.7** | ✅ stack §3.4, `checks/safe` | Hanya fallback opsi A |
| Agents/web | `@ethereum-attestation-service/eas-sdk` | **2.10.0** | ✅ stack §4.1, OQR §3 | Hanya kalau perlu attestation dari TS (mis. drawer S1). SDK ini membawa `ethers ^6.13.2` |
| Monorepo | pnpm | **12.9.1** | ✅ stack §4.7 | |
| Test (NICE) | Vitest / Playwright | **5.0.3** / **1.63.0** | ✅ stack §4.6 | |
| Alternatif | Goldsky CLI / graph-cli | 13.15.1 / 0.98.1 | ✅ stack §4.2 | Tidak di-install kecuali Ponder gagal |

### 2.2 Setelan Foundry (prosa, bukan file)

Dari stack §3.3/§4.1 dan `checks/forge-pragma/foundry.toml` (terbukti mengompilasi EAS + file 0.8.37 dalam satu build):
- `auto_detect_solc = true` dan **tidak ada** kunci `solc`. Pin `solc = "0.8.37"` membuat build EAS gagal ("No compiler version exists that matches … =0.8.29", OQR §3).
- `evm_version = "cancun"`. Kedua chain mengeksekusi PUSH0/TSTORE/MCOPY (OQR §3).
- `optimizer = true`, `optimizer_runs = 200`. Runtime EAS tanpa optimizer 24,397 B (179 B di bawah batas); dengan optimizer 15,073 B.
- Library dari `node_modules` (pola `checks/forge-pragma`): remapping `@openzeppelin/` dan `@ethereum-attestation-service/` ke `node_modules`. `forge-std` lewat `forge install`.
- Profil test [APPROVED P4-04]:
  - `default`: fuzz `runs` 256;
  - `ci`: invariant `runs`/`depth` = 02 T2-01 (usulan awal 256 × 64 lokal; lebih kecil di CI kalau job > 5 menit);
  - `deep`: run panjang manual sebelum freeze Sab 06:00.
- `fs_permissions` baca `../config` dan tulis `../deployments` untuk script deploy/seed [P4-04].
- RPC endpoint di foundry.toml merujuk **nama env** (`RH_TESTNET_RPC`, `ARB_SEPOLIA_RPC`), bukan URL berisi key.

---

## 3. Spec file config chain tunggal: `config/chains.json`

### 3.1 Prinsip

- **Satu file, dua entri** (`robinhoodTestnet`, `arbitrumSepolia`), dibaca oleh `DeployAll`/`Seed` (lewat `contracts/script/lib`), Ponder, web (saat build) dan agents (lewat `shared/chains`). `CHAIN=robinhoodTestnet|arbitrumSepolia` memilih entri aktif (design §11.1, stack §3.1).
- Field dasar = daftar stack §3.1 `{chainId, rpc, explorer, verifier, verifierUrl, eas, schemaRegistry, safeMode}`. Field lain = perluasan [APPROVED P4-05].
- **Tanpa secret.** URL RPC berisi key (Alchemy, Goldsky Edge) tidak ditulis di file. File hanya menyimpan **nama env** yang memegang URL itu.
- **Hanya fakta terverifikasi.** Yang belum diverifikasi = `null` + [TBD]. Alamat yang ditulis disingkat di sumber (`0xcA11…CA11`, `0x4e59…956C`, `0x45CB…d475` dll.) diisi lengkap hanya dari sumber yang menulis lengkap, atau setelah cek `eth_getCode` Jumat.
- Alamat kontrak **Paron** tidak ada di sini; tempatnya di `deployments/` (§7). Alamat EAS self-deploy RH ditulis di `deployments/46630/infra.json`, dan `chains.json` RH memakai nilai khusus `"self-deploy"`.

### 3.2 Field dan nilai

| Field | Tipe | Robinhood Chain Testnet (primer) | Arbitrum Sepolia (fallback) | Sumber |
|---|---|---|---|---|
| `key` | string | `robinhoodTestnet` | `arbitrumSepolia` | design §11.1 |
| `role` | string | `primary` | `fallback` | stack §3 keputusan |
| `chainId` | number | **46630** (`0xb626`) ✅ | **421614** (`0x66eee`) ✅ | design §11.1 |
| `viemChain` | string | `robinhoodTestnet` ✅ | `arbitrumSepolia` ✅ | viem 2.57.3 |
| `nativeCurrency` | string | ETH (testnet) | ETH (SepoliaETH) | design §11.1 |
| `parentChain` | string | Ethereum Sepolia ✅ | Ethereum Sepolia | OQR §2 |
| `rpc.public` | string | `https://rpc.testnet.chain.robinhood.com` ✅ | `https://sepolia-rollup.arbitrum.io/rpc` ✅ | design §11.1 |
| `rpc.primaryEnv` | string (nama env) | `RH_TESTNET_RPC` (Alchemy) | `ARB_SEPOLIA_RPC` (Alchemy) | stack §4.5 (Alchemy untuk kedua chain); nama env RH = stack §4.7 |
| `rpc.backupEnv` | string (nama env) | `RH_TESTNET_RPC_BACKUP` (Goldsky Edge; pola URL `https://edge.goldsky.com/standard/evm/46630?key=…`) | `ARB_SEPOLIA_RPC_BACKUP` (QuickNode/Infura, ❓ plan) | design §11.1, stack §4.5 |
| `rpc.notes` | string | RPC publik rate-limit dan **non-archive** untuk blok lama; jangan dipakai indexer saat demo | — | stack §4.2, OQR housekeeping |
| `explorer.url` | string | `https://explorer.testnet.chain.robinhood.com` (Blockscout) ✅ | `https://sepolia.arbiscan.io` ✅ | design §11.1 |
| `explorer.mirror` | string\|null | `null` | `https://arbitrum-sepolia.blockscout.com` (ada bot check) | design §11.1 |
| `verify.verifier` | string | `blockscout` ✅ | `etherscan` ✅ (Etherscan V2) | design §11.1 |
| `verify.verifierUrl` | string\|null | `https://explorer.testnet.chain.robinhood.com/api/` ✅ | `null` (pakai `--chain 421614`); alternatif tanpa key `https://arbitrum-sepolia.blockscout.com/api/` ❓ | design §11.1 |
| `verify.apiKeyEnv` | string\|null | `null` | `ETHERSCAN_API_KEY` (free tier ❓) | design §11.1 |
| `faucets` | string[] | Resmi `faucet.testnet.chain.robinhood.com` (bot check, drip ❓); Alchemy (0.1 ETH / 24 jam, syarat saldo mainnet); QuickNode (12 jam); Chainstack (top-up ke 1 ETH / 24 jam) ✅ | Chainlink `faucets.chain.link/arbitrum-sepolia` (0.5 ETH); QuickNode (12 jam); Alchemy ✅ | design §11.1 |
| `bridge` | string | `portal.arbitrum.io/bridge?sourceChain=sepolia&destinationChain=robinhood-chain-testnet` (deposit ~10 menit; tidak ada rute dari Arbitrum Sepolia) ✅ | `bridge.arbitrum.io` dari Sepolia ✅ | design §11.1, OQR §2 |
| `eas.mode` | string | `self-deploy` | `existing` | design §11.1 |
| `eas.address` | address\|`"self-deploy"` | `"self-deploy"` → nilai di `infra.json` | `0x2521021fc8BF070473E1e1801D3c7B4aB701E1dE` ✅ | design §11.1, stack §3.1 |
| `eas.schemaRegistry` | address\|`"self-deploy"` | `"self-deploy"` | `0x45CB6Fa0870a8Af06796Ac15915619a0f22cd475` ✅ | stack §3.1 |
| `eas.eip712Proxy` | address\|null | `null` | `0x8E807011c16E538B2dEEf1dc652EFe7724E09397` ✅ | stack §3.1 |
| `eas.version` | string | `1.4.0` (paket 1.9.0) ✅ | `1.3.0` ✅ | OQR §3 |
| `eas.domainVersionHardcode` | boolean | `false`: domain EIP-712 dibaca onchain, **jangan di-hardcode** | `false` | OQR §3 |
| `eas.easscan` | string\|null | `null` (tidak ada EASScan) | `null` ❓ | design §11.1 |
| `safe.mode` | string | `ui` (Safe{Wallet} + tx service) ✅ | `allowlist` (opsi B, rekomendasi) atau `protocol-kit` (opsi A) | design §11.4 |
| `safe.version` | string | `1.4.1` | `1.4.1` | `checks/safe` |
| `safe.singletonL2` | address | `0x29fcB43b46531BcA003ddC8FCB67FFE91900C762` ✅ | sama ✅ | `checks/safe/safe-addresses-results.json` |
| `safe.proxyFactory` | address | `0x4e1DCf7AD4e460CfD30791CCC4F9c8a4f820ec67` ✅ | sama ✅ | idem |
| `safe.fallbackHandler` | address | `0xfd0732Dc9E303f09fCEf3a7388Ad10A83459Ec99` ✅ | sama ✅ | idem |
| `safe.multiSend` / `multiSendCallOnly` | address | `0x38869bf66a61cF6bDB996A6aE40D5853Fd43B526` / `0x9641d764fc13c8B624c04430C7356C1C7C8102e2` ✅ | sama ✅ | idem |
| `safe.txService` | boolean | `true` ✅ | `false` (404) ✅ | design §11.1 |
| `infra.multicall3` | address | `0xcA11…CA11` (ada ✅; tulis lengkap setelah cek `eth_getCode`) | sama | design §11.1 |
| `infra.create2Deployer` | address | `0x4e59…956C` (ada ✅) | sama | design §11.1 |
| `tokens.reference` | object | USDG test `0x7E955252E15c84f5768B83c41a71F9eba181802F` (tidak dipakai) | Circle test USDC `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` (tidak dipakai) | stack §1.1, §1.2 |
| `settlement` | string | `MockUSDC` (alamat di `infra.json`) | `MockUSDC` | design §11 |
| `confirmations` | number\|null | `null` [TBD T4-03] | `null` [TBD T4-03] | sumber hanya menyebut soft confirmation ~100 ms ⚠️ (stack §1.1); terkait 03 T3-01 |
| `gasSnapshotGwei` | number | 0.01 (info, 6 Okt) | ~0.083 (info, 6 Okt) | design §11.1 |
| `arbOsVersion` | number | 116 (info) | 116 (info) | OQR §3 |
| `readmeChainLine` | string | "Deployed on Robinhood Chain Testnet (46630)", lengkap dengan link explorer | "Deployed on Arbitrum Sepolia (421614)" | design §7.1, §11.3 switch |

Mainnet Robinhood (4663) **tidak** masuk file ini (di luar scope hackathon).

`confirmations` dan setelan finality Ponder diukur saat go/no-go cek 5: catat jeda event → baris di DB. Sampai itu, Ponder memakai default-nya dan frontend menganggap tx final setelah receipt (soft confirmation). Ini bukan fakta terverifikasi, jadi tetap [TBD T4-03].

---

## 4. Template `.env` per package

### 4.1 Aturan secret

1. Yang di-commit hanya `.env.example` dengan **placeholder** (`<…>`). `.env`, `.env.local` dan `.env.*.local` masuk `.gitignore`. Secret di hosting = fitur secret platform (stack §4.5).
2. **Key baru untuk semua wallet**, dibuat Kamis/Jumat. **Jangan pernah** pakai key dev anvil di testnet live, juga **tidak** di fork. Akun `0xf39F…2266` punya delegasi EIP-7702 di kedua testnet, dan `forge create` darinya gagal "Out of gas … allowance: 0" di fork (design §11.2, OQR §3).
3. Key deployer lebih baik disimpan sebagai **keystore Foundry terenkripsi** (akun bernama, diimpor dengan `cast wallet import`) dan dipanggil lewat `--account`, bukan private key mentah di `.env` [APPROVED P4-06]. Variabel `*_PRIVATE_KEY` di bawah hanya untuk service hosting (keeper) atau mesin yang tidak bisa memakai keystore.
4. Key owner Safe / anggota panel (`W-ARB-1..3`) **tidak pernah** masuk `.env` bersama. Tanda tangan dilakukan di wallet masing-masing (Safe{Wallet} UI) atau di mesin owner (fallback opsi A).
5. Variabel `NEXT_PUBLIC_*` terlihat oleh browser. Jangan isi dengan key Alchemy yang sama dengan indexer; pakai RPC publik atau key terpisah yang dibatasi domain [APPROVED P4-07].
6. **[Jum 9 Okt ~11:27 WIB, PE]** Cloud agent tidak boleh memegang secret, jadi semua deploy/broadcast (smoke, latihan, panggung, seed testnet) dijalankan **PE dari mesinnya sendiri** dengan keystore deployer (`DEPLOYER_ACCOUNT`); lane L4 hanya menyiapkan script, manifest, dan langkah, lalu menyerahkan ke PE. Keystore deployer dan key seed testnet hanya ada di mesin PE; tidak pernah di sandbox agent, CI, atau repo.

### 4.2 Root (`/.env.example`), dibaca semua package

| Variabel | Wajib | Contoh placeholder | Keterangan | Ref |
|---|---|---|---|---|
| `CHAIN` | ya | `robinhoodTestnet` | `robinhoodTestnet` atau `arbitrumSepolia`; memilih entri `config/chains.json` | design §11.1 |
| `DEPLOY_LABEL` | ya | `stage-1` | Label deployment aktif = nama file manifest `deployments/<chainId>/<label>.json` | 05 P5-18, §7 |
| `PARAM_SET` | ya | `demo` | `demo` atau `prod` → `config/params/<set>.json` | [D-20] |

### 4.3 `contracts/` (deploy, seed, test)

| Variabel | Wajib | Contoh placeholder | Keterangan | Ref |
|---|---|---|---|---|
| `RH_TESTNET_RPC` | ya (RH) | `https://<alchemy-rh-testnet-url-with-key>` | RPC utama Robinhood Testnet | stack §4.7 |
| `RH_TESTNET_RPC_BACKUP` | tidak | `https://edge.goldsky.com/standard/evm/46630?key=<goldsky-key>` | RPC cadangan | design §11.1 |
| `ARB_SEPOLIA_RPC` | ya (fallback) | `https://<alchemy-arb-sepolia-url-with-key>` | RPC utama Arbitrum Sepolia | stack §4.5 |
| `ARB_SEPOLIA_RPC_BACKUP` | tidak | `https://<quicknode-or-infura-url>` | RPC cadangan | design §11.1 |
| `ETHERSCAN_API_KEY` | ya (fallback) | `<etherscan-v2-key>` | Verifikasi Arbiscan (Etherscan V2) | design §11.1–§11.2 |
| `DEPLOYER_ACCOUNT` | ya | `paron-deployer` | Nama akun keystore Foundry (`W-DEP`) | [P4-06] |
| `DEPLOYER_ADDRESS` | ya | `0x<fresh-deployer-address>` | Untuk prediksi alamat (nonce) dan cek saldo | §6 |
| `DEPLOY_SCOPE` | ya | `full` | `smoke` (go/no-go: MockUSDC + EAS + gate minimal) atau `full` | §6, [P4-10] |
| `SAFE_ADDRESS` | ya (RH) | `0x<team-safe-2of3>` | Safe 2-of-3 dari go/no-go cek 4; proposer Timelock, `ADMIN`/`PAUSER`/`VERIFIER`, treasury. **[APPROVED D-54, Jum 9 Okt ~11:05 WIB, hackathon saja]**: Safe tetap proposer (bersama `W-ADMIN`), `ADMIN`/`PAUSER`, treasury; **bukan** lagi pemegang `VERIFIER_ROLE`/attester utama dan tidak dibutuhkan untuk execute | 01 §4.1, [D-13] |
| `ADMIN_EOA_ADDRESS` **[APPROVED D-54, Jum 9 Okt ~11:05 WIB, hackathon saja]** | ya | `0x<w-admin>` | `W-ADMIN`: proposer + canceller Timelock tambahan, supaya `/admin` cukup write wagmi biasa | 07 D-54 |
| `VERIFIER_EOA_ADDRESS` **[APPROVED D-54, Jum 9 Okt ~11:05 WIB, hackathon saja]** | ya | `0x<w-verifier>` | `W-VERIFIER`: attester KYB berlabel "Paron demo verifier (team-operated)"; `VERIFIER_ROLE` di `RegistryGate` (soft-fail cek 3) | 07 D-54 |
| `TEAM_EOA_1..3` | ya (fallback B) | `0x<team-eoa-1>` | Pemegang `ADMIN`/`VERIFIER`/`ARBITER` di mode allowlist; dua di antaranya proposer Timelock | design §11.4 |
| `TREASURY_ADDRESS` | ya | `0x<safe-or-timelock>` | `W-TREAS`: Safe (RH) / Timelock (fallback) | [D-13] |
| `PANEL_MEMBER_1..3` | ya | `0x<arb-1>` | `W-ARB-1..3`, threshold 2 | [D-36] |
| `FEED_SIGNER_ADDRESS` | tidak (NICE) | `0x<feed-signer>` | `W-FEED`, `FEED_SIGNER_ROLE` | [D-06] |
| `KYB_ATTESTER_ADDRESS` | ya | `0x<w-verifier>` | **[APPROVED D-54, Jum 9 Okt ~11:05 WIB, hackathon saja]**: attester tepercaya di `EASGate` = `W-VERIFIER` ("Paron demo verifier (team-operated)"). Allowlist tetap dikendalikan Timelock (`setAttester`); Safe boleh ditambahkan sebagai attester kedua. Desain target D-04 (Safe, "team multisig") tetap tercatat untuk prod | [D-04], 07 D-54 |
| `EAS_ADDRESS`, `SCHEMA_REGISTRY_ADDRESS` | tidak | `0x<override>` | **Override saja**; default dari `chains.json` / `infra.json` | design §11.1 |
| `SCHEMA_UID_PARTICIPANT_VERIFIED` | setelah registrasi | `0x<bytes32-uid>` | Diisi otomatis ke `infra.json`; env hanya override | [D-24] |
| `SCHEMA_UID_KYB_APPLICATION` | setelah registrasi | `0x<bytes32-uid>` | Diisi otomatis ke `infra.json.schemas.KybApplication`; env hanya override | [D-41] |
| `SCHEMA_UID_CAPACITY_ATTESTED`, `SCHEMA_UID_DELIVERY_RECEIPT` | tidak (NICE) | `0x<bytes32-uid>` | Schema stack §4.1 | [D-26], [D-27] |
| `GATE_KIND` | ya | `eas` | `eas` (`EASGate`) atau `registry` (`RegistryGate`, soft-fail cek 3) | [D-23], design §11.3 |
| `ALLOW_OPEN_WINDOW` | tidak | *(kosong = ikut set)* | Override flag `allowOpenWindow`. Script **menolak** `true` kalau `PARAM_SET=prod` | [D-19] |
| `ENFORCE_CALENDAR_MONTH` | tidak | *(kosong = ikut set)* | Override flag `enforceCalendarMonth` | [D-02] |
| `SEED_MODE` | ya (seed) | `stage` | `stage` (fase 0–2 saja) atau `rehearsal` (fase 3–4 boleh; ditolak kalau label = label stage) | 05 §4.3 |
| `SEED_W_P_JKT_ACCOUNT`, `SEED_W_P_BTM_ACCOUNT`, `SEED_W_P_SGP_ACCOUNT`, `SEED_W_BUY2_ACCOUNT` | ya (seed) | `paron-p-jkt` | Akun keystore aktor seed yang harus menandatangani sendiri (registrasi provider, `createSeries` F-1..F-3, beli + ask F-4) | 05 §3.2–3.3 |
| `SEED_ACTOR_ADDRESSES` | ya (seed) | `W-BUY=0x<…>,W-BUY2=0x<…>,W-TRD=0x<…>,W-JUDGE=0x<…>` | Alamat aktor untuk top-up mUSDC/ETH dan attestation | 05 §1 |
| `FORK_BLOCK_OFFSET` | tidak | `20` | Fork anvil di `latest − 20` (RPC publik non-archive) | OQR housekeeping, 05 §4.1 |

### 4.4 `indexer/` (Ponder + API)

| Variabel | Wajib | Contoh placeholder | Keterangan | Ref |
|---|---|---|---|---|
| `CHAIN` | ya | `robinhoodTestnet` | Sama dengan root | 03 §0 |
| `INDEXER_RPC_URL` | ya | `https://rpc.testnet.chain.robinhood.com` | **Sementara (Scout ~13:20 WIB):** RPC publik Robinhood (rate-limited); ganti ke Alchemy/Goldsky/RPC pribadi begitu ada. Ideal: bukan RPC publik | stack §4.2 |
| `INDEXER_RPC_URL_BACKUP` | tidak | `https://<backup-rpc-provider>` | Cadangan. **Belum terpasang per Jum 9 Okt 15:15 WIB (cek live), menunggu RPC kedua dari Fatih.** **Status PENDING (Jum 9 Okt 2026 ~14:15 WIB):** menunggu RPC provider kedua; Fatih yang memutuskan/menyediakan (key lewat secret input, tidak di chat). Rekomendasi PE. Kalau kosong, indexer dan web tetap jalan dengan RPC publik. Lihat risiko di changelog ~14:15 WIB | stack §4.5 |
| `DATABASE_URL` | ya (hosted) | `postgres://<user>:<password>@<host>:5432/<db>` | Kosong = PGlite lokal | stack §4.2 |
| `DEPLOY_LABEL` | ya | `stage-1` | Manifest yang dibaca untuk alamat + `startBlock` | §7 |
| `API_PUBLIC_BASE_URL` | ya | `https://paron-robinhood-production.up.railway.app/v1` | Muncul di `explorer_url`/dokumen; URL produksi Railway (D-58 / D-10, Scout ~13:08 WIB); domain kustom menyusul | 03 §3 |
| `API_CORS_ORIGIN` | tidak | `https://paron.vercel.app` | **Scout ~13:20 WIB:** diset ke `https://paron.vercel.app` (menggantikan 'kosong dulu' PE ~13:09); **final: CORS = `https://paron.vercel.app` [D-58/D-10]; `*` hanya default lokal.** Data publik (P3-22) | 03 §0, P3-22 |
| `TIMELOCK_INDEXED` | tidak | `true` | Indeks `TimelockController` + event OZ `AccessControl` (01 §7.1, 03 H42–H43); alamat dari manifest `contracts.TimelockController` | 03 §2.1 |
| `API_NOW_SOURCE` | tidak | `server` | `server` (testnet) atau `chain` (anvil: timestamp blok terakhir) untuk `DEFAULTABLE`/`actions` | 05 P5-15, 03 P3-33 |
| `PORT` | tidak | `42069` | Port service (produksi Railway: 42069; healthcheck `/v1/health`) | — |
| `DATABASE_SCHEMA` | ya (hosted) | `paron_<sha8>` | Per build Railway (PR #30, ~14:02 WIB); `.env.example` lokal memakai `paron` | 03 catatan 14:02 |

### 4.5 `web/` (Next.js)

| Variabel | Wajib | Contoh placeholder | Keterangan | Ref |
|---|---|---|---|---|
| `NEXT_PUBLIC_CHAIN_ID` | ya | `46630` | `421614` setelah switch | design §11.3 |
| `NEXT_PUBLIC_RPC_URL` | ya | `https://rpc.testnet.chain.robinhood.com` | Publik atau key terpisah yang dibatasi domain | [P4-07] |
| `NEXT_PUBLIC_RPC_URL_BACKUP` | tidak | `https://<restricted-backup-rpc>` | Dipakai saat RPC utama gagal (05 T−60). Nama dibaca di `web/lib/config.ts` (diverifikasi 9 Okt); belum diset di Vercel (menunggu RPC kedua) | 05 §4.7 |
| `NEXT_PUBLIC_API_BASE_URL` | ya | `https://paron-robinhood-production.up.railway.app/v1` | URL produksi Railway (Scout ~13:08 WIB) | 03 §3 |
| `NEXT_PUBLIC_DATA_SOURCE` | tidak (opsional) | `live` | `mock` (`fixtures/v1/`) atau `live`. **Di Vercel: jangan set `mock`** (build menolak saat `VERCEL=1`); cukup `NEXT_PUBLIC_RPC_URL` + `NEXT_PUBLIC_API_BASE_URL` | 03 P3-37; Scout ~13:08 WIB |
| `NEXT_PUBLIC_DEPLOY_LABEL` | ya | `stage-1` | Alamat kontrak dibaca dari manifest saat build | §7 |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | ya kalau WalletConnect dipakai | `<walletconnect-project-id>` | Untuk HP juri (05 T5-03). Apakah RainbowKit 2.2.11 mewajibkannya = [TBD T4-04] | stack §4.3 |
| `NEXT_PUBLIC_DEMO_PRESETS` | tidak | `true` | Preset wizard S2 (2610, 500 jam, $3.00, bond $4.50, 60/60/90) | 05 §4.7 T−10 |
| `NEXT_PUBLIC_SHOW_SYNTHETIC_LABEL` | ya | `true` | Label "synthetic demo data" pada referensi | design §10.5 #2 |
| `NEXT_PUBLIC_AGENT_URL` | tidak | `http://127.0.0.1:<local-port>` | Toggle agent di `/provider` (D-42); kosong = toggle disembunyikan, status diturunkan dari chain (fallback E) | [D-42] |

### 4.6 `agents/`

| Variabel | Entrypoint | Wajib | Contoh placeholder | Keterangan | Ref |
|---|---|---|---|---|---|
| `CHAIN`, `DEPLOY_LABEL` | semua | ya | `robinhoodTestnet`, `stage-1` | | |
| `AGENT_RPC_URL` | semua | ya | `https://<alchemy-url-with-key>` | | stack §4.5 |
| `API_BASE_URL` | keeper, agent | ya | `https://paron-robinhood-production.up.railway.app/v1` | Keeper poll Ponder; URL produksi Railway | stack §4.4 |
| `PROVIDER_AGENT_ACCOUNT` / `PROVIDER_AGENT_PRIVATE_KEY` | provider-agent | ya | `paron-p-jkt` / `0x<…>` | Key `W-P-JKT` (agent jalan di laptop) | 05 §1 |
| `PROVIDER_AGENT_KILL_SWITCH` | provider-agent | ya | `off` | `on` = berhenti mengirim tx (adegan default). Nilai awal `autoAck`; setelah itu diubah lewat endpoint lokal (D-42) atau restart (fallback E) | design §7.1, [D-42] |
| `PROVIDER_AGENT_HTTP_PORT` | provider-agent | ya (D-42) | `<local-port>` | Endpoint kontrol lokal, bind `127.0.0.1` saja (`GET`/`POST /agent/state`, perintah EIP-712 `AgentCommand`) | [D-42] |
| `PROVIDER_AGENT_ALLOWED_ORIGIN` | provider-agent | ya (D-42) | `https://paron.vercel.app` | Origin web produksi (D-10); uji perilaku browser HTTPS → `127.0.0.1` di blok S1 (08) | [D-42] |
| `PROVIDER_AGENT_DETECT` | provider-agent | ya | `chain` | `chain` (event langsung) atau `ponder`; target ack ≤ 3 dtk | 05 T5-07 |
| `PROVIDER_AGENT_MOCK_GPU` | provider-agent | ya | `true` | Output `nvidia-smi` di-mock dan diberi label | stack §4.4 |
| `KEEPER_PRIVATE_KEY` | keeper | ya | `0x<fresh-keeper-key>` | `W-KEEP` (service hosting) | 05 §1 |
| `KEEPER_DRY_RUN` | keeper | ya | `true` | **Wajib `true` saat demo** | stack §4.4 |
| `KEEPER_POLL_SECONDS` | keeper | tidak | `60` | "cron worker every minute" | stack §4.4 |
| `TRADER_BOT_ACCOUNT` | trader-bot | ya | `paron-trader` | `W-TRD` | 05 P5-04 |
| `TRADER_BOT_TRIGGER` | trader-bot | ya | `manual` | Dipicu C setelah `PrimaryBuy` S-02 | 05 A4 |
| `FEED_SIGNER_PRIVATE_KEY` | reference-signer | NICE | `0x<feed-signer-key>` | `W-FEED` | [D-06] |
| `REFERENCE_VALUES` | reference-signer | NICE | `H100=3.00,H200=3.00,B200=3.00` | Nilai sintetis per CU | 05 P5-12 |
| `SAFE_ADDRESS` | safe-tools | fallback A | `0x<safe>` | Hanya di mesin owner | design §11.4 |

---

## 5. Set parameter: demo vs prod (`config/params/*.json`)

Semua nilai di sini dipakai sebagai argumen constructor `immutable` atau konfigurasi awal sebelum serah terima role (01 P-08, 05 §3.1). Set `prod` tidak di-deploy di hackathon. Gunanya untuk test, README, dan `SERIES_TERMS.md` ("demo parameters" + nilai prod, [D-20]).

| Field | `demo` | `prod` | Kontrak | Ref |
|---|---|---|---|---|
| `bounds.ack` (min–max) | 60 dtk – 72 jam | 1 jam – 72 jam | `SeriesFactory.bounds` | [D-20], 01 §2.1 |
| `bounds.delivery` | 60 dtk – 7 hari | 1 jam – 7 hari | idem | [D-20] |
| `bounds.dispute` | 90 dtk – 7 hari | 24 jam – 7 hari | idem | [D-20] |
| `rulingWindow` | 120 dtk | 7 hari | `RedemptionManager` | [D-20], [D-37] |
| `timelockDelay` | 5 menit | 48 jam | `TimelockController` | design §3 #2 |
| `allowOpenWindow` | `true` | `false` | `SeriesFactory` | [D-19] |
| `enforceCalendarMonth` | ikut D-19/D-02. Rekomendasi: `true`, karena 2610/2611/2612 semuanya bulan kalender UTC | `true` | `SeriesFactory` | [D-02] |
| `leadTime` | 0 | 24 jam | `SeriesFactory`/`PrimarySale` | [D-39] |
| `bondFloorBps` | 15_000 | 15_000 | `SeriesFactory` | design locked |
| `primaryFeeBps` / `takerFeeBps` / `makerFeeBps` | 100 / 15 / 0 | 100 / 15 / 0 | `PrimarySale`, `OrderBook` | 01 §2.2, [D-13] |
| Batas fee (`maxPrimaryFeeBps` / `maxTakerFeeBps`) | 500 / 100 | 500 / 100 | idem | [D-40] |
| `disputeBondBps` / `minDisputeBond` | 500 / 5_000_000 | sama | `RedemptionManager` | 01 §2.1 |
| `maxLevels` | 10 | 10 | `OrderBook` | [D-17] |
| `maxFillsPerTx` | [TBD 01 T-02] (`forge snapshot` Jumat) | sama | `OrderBook` | 01 T-02 |
| Faktor awal | H100 10_000, H200 14_000, B200 25_000, GB200 35_000, A100 4_500 (rekomendasi D-09; 01 = 6_000), RTX4090 tidak dimasukkan | sama | `ConversionTable` | [D-09] |
| PrintIndex `windowLength` / `minVolume` / `minParticipants` / `maxCarryForward` | 24 jam / 1 CU / 2 / 72 jam | [TBD 01 T-04] | `PrintIndex` | [D-15] |
| Panel | 3 anggota, threshold 2 | sama (anggota berbeda) | `PanelArbitrator` | [D-36] |
| Faucet MockUSDC | 5.000 mUSDC per drip, cooldown 1 jam | n/a (tidak ada MockUSDC di prod) | `MockUSDC` | [D-40] |
| Gate | `eas` (RH) / `eas` existing (fallback) / `registry` (soft-fail) | `eas` | gate | [D-23] |

Aturan: script deploy **membaca** set dan **menulis salinannya** ke manifest (`params`), supaya `SERIES_TERMS.md` dan UI bisa menampilkan nilai yang benar-benar dipakai. Kombinasi terlarang (`PARAM_SET=prod` + `allowOpenWindow=true`) membuat script berhenti sebelum broadcast [P4-11]. Untuk 05 §3.1 ("nama view = doc 04"): batas demo dibaca lewat getter publik `bounds()`, `allowOpenWindow()`, `enforceCalendarMonth()` dan `rulingWindow()`, semuanya `immutable public` (01 §6.3, §6.8) [P4-12].

---

## 6. Urutan deploy langkah demi langkah

### 6.1 Strategi alamat (wiring melingkar)

01 §9 menyebut siklus `SeriesFactory` ↔ `RedemptionManager` ↔ `BondVault` ↔ `PrimarySale`. Dari daftar pemanggil di 01 §4.2 juga ada `PrintIndex` ↔ `OrderBook` dan `ProviderRegistry` ↔ `RedemptionManager`.

**Masalah dengan CREATE2 + argumen constructor (01 P-65):** alamat CREATE2 = fungsi dari `(deployer, salt, keccak(initcode))`, dan initcode **memuat argumen constructor**. Kalau A menyimpan alamat B sebagai argumen constructor dan B menyimpan alamat A, alamat A bergantung pada alamat B dan sebaliknya. Persamaan itu tidak punya solusi umum. 05 T5-10 sudah mencatat sisi lainnya: alamat berbeda antar chain kalau argumen berbeda.

**Keputusan [APPROVED P4-13, 07 V-8]: prediksi alamat CREATE dari nonce deployer.** 01 §9 sudah disinkronkan.
- Alamat kontrak yang dibuat EOA = fungsi dari `(deployer, nonce)` saja, tidak bergantung pada initcode. Jadi semua alamat bisa dihitung **sebelum** deploy (cheatcode `computeCreateAddress` di script Foundry), lalu dimasukkan sebagai argumen `immutable` ke siapa pun yang butuh.
- Syarat: deployer **khusus** (`W-DEP`), tanpa tx lain di tengah broadcast, dan script memeriksa nonce awal sama dengan yang dipakai saat prediksi. Kalau ada tx yang gagal di tengah, deploy diulang dengan label baru dari awal (nonce bergeser).
- Deploy ulang di chain yang sama otomatis menghasilkan alamat baru (nonce naik), jadi masalah tabrakan salt 05 P5-18 hilang. **Label** tetap dipakai sebagai nama manifest.
- "Alamat sama di kedua chain" (design §11.1) hanya berlaku kalau nonce deployer kebetulan sama di kedua chain. Itu tidak dikejar dan tidak dijanjikan di README.
- **Alternatif B** (kalau prediksi nonce bermasalah): deploy biasa + setter `wire(...)` sekali pakai oleh deployer yang lalu terkunci (alternatif yang sudah disebut 01 §9). Biayanya beberapa tx tambahan dan alamat tidak `immutable`.
- CREATE2 tetap dipakai di dalam kontrak untuk clone `CUToken` (salt `keccak256(seriesId)`, 01 P-29), jadi `predictTokenAddress(4)` tetap berlaku (05 §4.5).

### 6.2 Langkah (scope `full`)

Urutan = 01 §9 + 05 fase 0. ID langkah memakai awalan **DP-** supaya tidak tertukar dengan keputusan [D-xx]. Setiap langkah: apa yang dilakukan, siapa, dan cek yang wajib lolos (gagal = berhenti).

| # | Langkah | Detail | Cek |
|---|---|---|---|
| DP-0 | Preflight | Baca `CHAIN`, `PARAM_SET`, `DEPLOY_LABEL`, `GATE_KIND`. Cocokkan `eth_chainId` RPC dengan `chains.json`. Pastikan file manifest label belum ada (tidak menimpa). Catat nonce awal deployer + saldo ETH | chainId cocok; saldo ≥ batas [TBD 05 T5-01]; label baru |
| DP-1 | Infra chain (sekali per chain) | Kalau `infra.json` belum punya `MockUSDC`: deploy `MockUSDC` (6 desimal, `ERC20Permit` [D-30], `MINTER_ROLE` = `W-DEP`). RH: deploy `SchemaRegistry` lalu `EAS(registry)` dari paket 1.9.0. Arbitrum Sepolia: pakai EAS existing. Kalau infra sudah ada, **pakai ulang** (01 §3 "singleton per chain"; 05 P5-25) | `MockUSDC.decimals() == 6`; RH: `EAS.version() == "1.4.0"` dan `getSchemaRegistry()` = registry |
| DP-2 | Schema EAS (sekali per chain) | Registrasi `ParticipantVerified(bytes32 entityId,uint8 role,bytes2 country,uint64 expiry)` (MUST, go/no-go cek 3). Lalu `KybApplication(bytes32 entityId,uint8 role,bytes2 country,bytes32 dataHash)` ([D-41] opsi B; boleh menyusul sebelum seed, tidak memblokir cek 3; 01 §6.13, 03 T3-08). `CapacityAttested` / `DeliveryReceipt` hanya kalau NICE dikerjakan. `revocable = true` (05 A-3). Resolver = alamat nol [APPROVED P4-14]. UID ditulis ke `infra.json` | `getSchema(uid)` terbaca kembali |
| DP-3 | Prediksi alamat | Hitung alamat semua kontrak Paron dari nonce (§6.1), dengan urutan langkah DP-4..DP-15 | Prediksi disimpan di memori script; dicek ulang setelah tiap deploy |
| DP-4 | Gate | `EASGate(eas, uidParticipantVerified, [KYB_ATTESTER_ADDRESS])` atau `RegistryGate` (soft-fail cek 3). **[APPROVED D-54, Jum 9 Okt ~11:05 WIB, hackathon saja]**: `KYB_ATTESTER_ADDRESS` = `W-VERIFIER` (opsional + Safe) | `isVerified(random) == false`; `trustedAttester(W-VERIFIER) == true` |
| DP-5 | `TimelockController` | Delay dari set. Proposer = `SAFE_ADDRESS` (RH) / `TEAM_EOA_1..2` (fallback B). Executor dan admin opsional Timelock = [APPROVED P4-15]: executor = proposer yang sama, admin opsional = alamat nol (Timelock mengatur dirinya sendiri). **[APPROVED D-54, Jum 9 Okt ~11:05 WIB, hackathon saja]** (meng-override P4-15 untuk hackathon): proposer + canceller = `SAFE_ADDRESS` **dan** `ADMIN_EOA_ADDRESS` (`W-ADMIN`); di fallback B = `TEAM_EOA_1..2` + `W-ADMIN`; **executor = `address(0)`** (siapa saja boleh execute operasi yang sudah lewat delay); admin opsional = alamat nol | `getMinDelay()` sesuai set; `hasRole(PROPOSER_ROLE, W-ADMIN)`; `hasRole(EXECUTOR_ROLE, address(0))` |
| DP-6 | `ConversionTable` | Faktor awal dari set [D-09]. Admin sementara = deployer (supaya konfigurasi tidak menunggu delay, 05 P5-08) | `factorOf(H100) == 10_000` dst. |
| DP-7 | `ProviderRegistry` | Argumen: gate, alamat RM (prediksi) | — |
| DP-8 | `BondVault` | Argumen: `settlementToken = MockUSDC`, factory + RM (prediksi) | — |
| DP-9 | `CUToken` (implementasi) | Implementasi untuk clone, tidak di-initialize | — |
| DP-10 | `PrintIndex` | Argumen: OrderBook + RM (prediksi); parameter demo [D-15] | `statusOf(H100) == THIN` |
| DP-11 | `SeriesFactory` | Argumen: registry, `ConversionTable`, `BondVault`, `cuTokenImpl`, RM/`PrimarySale` (prediksi), `bounds`, `allowOpenWindow`, `enforceCalendarMonth`, `leadTime`, `bondFloorBps` | Getter cocok dengan set |
| DP-12 | `PrimarySale` | Argumen: factory, `settlementToken`, gate, treasury, `primaryFeeBps` | — |
| DP-13 | `OrderBook` | Argumen: factory, `settlementToken`, gate, `PrintIndex`, treasury, fee, `maxLevels`, `maxFillsPerTx` | — |
| DP-14 | `RedemptionManager` | Argumen: factory, `BondVault`, registry, `PrintIndex`, `settlementToken`, `rulingWindow`, dispute bond | Alamat = prediksi DP-3 (kalau beda, **berhenti**: wiring rusak) |
| DP-15 | `PanelArbitrator` | Anggota `PANEL_MEMBER_1..3`, threshold 2, RM [D-36] | `threshold() == 2` |
| DP-16 | `ReferenceFeed` (NICE) | `FEED_SIGNER_ROLE = FEED_SIGNER_ADDRESS` [D-06] | Dilewati kalau NICE belum siap |
| DP-17 | Konfigurasi sebelum serah terima | `SeriesFactory.setArbitratorAllowed(PanelArbitrator, true)`; fee/treasury (kalau bukan constructor); parameter `PrintIndex`; label `ReferenceFeed` | 05 §3.1 assert fase 0 |
| DP-18 | Serah terima role | Di setiap kontrak `AccessControl`: grant `DEFAULT_ADMIN_ROLE` ke Timelock; grant `ADMIN_ROLE`/`PAUSER_ROLE` ke Safe (RH) atau `TEAM_EOA_*` (fallback B); `VERIFIER_ROLE` ke Safe (`RegistryGate`); lalu deployer **renounce** semua role. **[APPROVED D-54, Jum 9 Okt ~11:05 WIB, hackathon saja]**: `VERIFIER_ROLE` (`RegistryGate`) ke `W-VERIFIER`; attester `EASGate` sudah `W-VERIFIER` dari DP-4; `ADMIN_ROLE`/`PAUSER_ROLE` tetap Safe. `MINTER_ROLE` MockUSDC tetap di `W-DEP` (05 §3.1; lihat X4-4) | Lihat §6.3 |
| DP-19 | Verifikasi | §6.4 | Semua kontrak "verified" di explorer |
| DP-20 | Manifest | Tulis `deployments/<chainId>/<label>.json` (+ update `infra.json` kalau DP-1/DP-2 berjalan), bangkitkan ulang `DEPLOYMENTS.md`, catat `startBlock` = blok tx pertama label ini | §7 |
| DP-21 | ABI + indexer | Bangkitkan `shared/abi` dari `contracts/out`; jalankan Ponder dengan label baru | `GET /v1/health` → `synced = true` (05 §3.1 langkah 6) |
| DP-22 | Seed | `Seed.s.sol` fase 1–2 (05 §3.2–3.3), `SEED_MODE=stage` atau `rehearsal` | Assert 05 fase 1–2 |

**Scope `smoke`** (go/no-go, Jum 09:45–10:15): hanya DP-0, DP-1, DP-2, plus gate minimal (`EASGate` dengan `isVerified`) untuk cek 3. Label `smoke-1`. Infra (MockUSDC, EAS, schema) dari smoke **dipakai ulang** oleh deployment `full` berikutnya [P4-10].

### 6.3 Cek serah terima role (wajib sebelum seed)

Diuji otomatis oleh `testFork_DeployAll_WiringAndRoles` (02 §4.1) dan dicek ulang dengan `cast call` setelah broadcast:
1. Deployer tidak memegang role apa pun di kontrak Paron (`hasRole` = false untuk semua role).
2. `DEFAULT_ADMIN_ROLE` hanya dipegang Timelock. `setFactor`, `setArbitratorAllowed`, `setPanel`, fee dan treasury hanya bisa lewat Timelock (01 §7).
3. `ADMIN_ROLE`/`PAUSER_ROLE` = Safe (RH) atau EOA tim (fallback B). Tidak ada fungsi admin yang memindahkan bond atau mengubah state request (01 §7 baris terakhir).
4. Izin kontrak-ke-kontrak sesuai 01 §4.2 (mis. `CUToken` mint hanya dari `PrimarySale`; `BondVault.release/slash` hanya dari RM).
5. `MINTER_ROLE` MockUSDC = `W-DEP` (top-up seed).
6. **[APPROVED D-54, Jum 9 Okt ~11:05 WIB, hackathon saja]**: `EXECUTOR_ROLE` Timelock = `address(0)`; `PROPOSER_ROLE` dan `CANCELLER_ROLE` = Safe + `W-ADMIN`; attester tepercaya `EASGate` = `W-VERIFIER`.

### 6.4 Verifikasi kontrak

- **RH Testnet (Blockscout):** `forge script … --broadcast --verify` dengan verifier `blockscout` dan URL `https://explorer.testnet.chain.robinhood.com/api/`. Kalau ada yang tertinggal, ulangi per kontrak dengan `forge verify-contract <addr> src/X.sol:X --chain-id 46630 --rpc-url $RH_TESTNET_RPC --verifier blockscout --verifier-url https://explorer.testnet.chain.robinhood.com/api/` (design §11.1, stack §4.7).
- **Arbitrum Sepolia (Arbiscan):** `forge verify-contract <addr> src/X.sol:X --chain 421614 --verifier etherscan --etherscan-api-key $ETHERSCAN_API_KEY`. Alternatif tanpa key = Blockscout mirror ❓.
- **EAS self-deploy:** diverifikasi dengan setelan kompilasi yang dipakai build (solc 0.8.29 lewat auto-detect, optimizer 200). Sumber menandai verifikasi Blockscout nyata untuk EAS sebagai item Jumat ⚠️ (OQR §3). Kalau gagal: cek 2 dianggap **lulus sebagian**, EAS tetap dipakai, dan atribusi + link source ditulis di README [APPROVED P4-16].
- **Clone `CUToken`:** clone EIP-1167 tidak diverifikasi satu per satu. Implementasinya yang diverifikasi. Apakah Blockscout/Arbiscan otomatis menampilkan clone sebagai proxy = [TBD T4-05].
- Status verifikasi per kontrak ditulis ke manifest (`verified: true/false`).

---

## 7. Format manifest alamat (menyelesaikan 05 T5-12)

### 7.1 Lokasi dan aturan [APPROVED P4-08]

- **`deployments/<chainId>/infra.json`**: infrastruktur yang dipakai bersama semua deployment di chain itu, yaitu `MockUSDC`, `EAS`, `SchemaRegistry`, schema UID, Safe tim, dan attestation KYB yang sudah dibuat (05 P5-25: attestation tersimpan di EAS, bukan di gate).
- **`deployments/<chainId>/<label>.json`**: satu file per deployment Paron (`smoke-1`, `rehearsal-N`, `stage-1`). Ditulis sekali oleh `DeployAll`, lalu **ditambah** (tidak ditimpa) oleh `Seed`/`Rehearsal`.
- **`DEPLOYMENTS.md`** di root = tabel yang dibangkitkan dari manifest (chain, label, kontrak, alamat, link explorer, status verifikasi). Tidak diedit tangan.
- Manifest anvil (`31337` atau fork) tidak di-commit [P4-09]. Manifest testnet di-commit, karena juri melihat repo dan alamat harus bisa dicek.
- **Satu penulis:** hanya script (`DeployAll`, `Seed`, `Rehearsal`). Konsumen (Ponder, web saat build, agents, fixture API) hanya membaca.
- **Proteksi panggung:** `Rehearsal` dan `SEED_MODE=rehearsal` menolak berjalan kalau `DEPLOY_LABEL` diawali `stage-` (05 §4.3 aturan 1). Setelah freeze Sab 06:00, `stage-1.json` hanya boleh bertambah entri `log` untuk langkah F-5 (push referensi, 05 §4.6).
- **Status live ~13:20 WIB (PE, di grup):** label `stage-1` di chain `46630` sudah ada di `main` (`deployments/46630/infra.json` + `deployments/46630/stage-1.json`); `startBlock` core = `131496617`; verify-deployment lulus (14 kontrak punya kode, timelock delay 300 dtk, executor terbuka); seed fase series `CU-JKT-H100-2611`, `CU-BTM-H200-2611`, `CU-SGP-B200-2612` (cocok contoh 05/D-25). **Jangan** menyalin alamat kontrak ke dokumen — pembaca memakai manifest di repo. Web Vercel membaca alamat dari manifest lewat `NEXT_PUBLIC_DEPLOY_LABEL` (bukan `NEXT_PUBLIC_ADDR_*`).

### 7.2 Field `<label>.json`

| Field | Tipe | Isi | Dipakai oleh |
|---|---|---|---|
| `schemaVersion` | string | `paron-deployments/v1` | semua pembaca |
| `label` | string | mis. `stage-1` | semua |
| `chainId`, `chainKey` | number, string | `46630`, `robinhoodTestnet` | semua |
| `paramSet` | string | `demo` | UI, `SERIES_TERMS.md` |
| `params` | object | salinan lengkap `config/params/<set>.json` yang dipakai | UI, test |
| `deployer` | address | `W-DEP` | audit |
| `nonceStart` | number | nonce awal (strategi §6.1) | audit, debug |
| `git` | object | `{ commit, dirty }` | audit (kode beku vs bukan) |
| `toolchain` | object | `{ forge: "1.8.5", solc: ["0.8.37", "0.8.29"], ozVersion: "5.6.1", easContracts: "1.9.0", forgeStd: <T4-01> }` | audit |
| `startBlock` | number | blok tx pertama label ini | Ponder (`startBlock`) |
| `deployedAt` | object | `{ block, timestampUtc }` (ISO-8601 UTC) | DEPLOYMENTS.md |
| `infraRef` | string | `infra.json` + hash isi saat deploy | pembaca |
| `contracts` | map nama → objek | per kontrak: `{ address, txHash, block, verified, explorerUrl }`; nama = nama kontrak 01 (`ProviderRegistry`, …, `EASGate`/`RegistryGate`, `TimelockController`) | Ponder, web, agents |
| `roles` | object | `{ timelock, safe, treasury, panelMembers[], panelThreshold, feedSigner, minter, adminMode: "safe"\|"allowlist"\|"protocol-kit" }`; **[APPROVED D-54]** + `verifier` (`W-VERIFIER`), `adminEoa` (`W-ADMIN`), `timelockProposers[]`, `timelockExecutor` (`0x0` = terbuka) | `testFork_DeployAll_WiringAndRoles`, README |
| `seed` | object | `{ mode, phasesCompleted[], actors: {label: address}, series: {symbol: {seriesId, token, txHash}}, orders: {"F-4": orderId}, attestations: {label: uid}, reference: {lastPushTx, observedAt} }` | 05 §4.3 "cek dulu" |
| `rehearsal` | object\|absen | `{ runs: [{ startedAt, requests: [reqId], disputes: [reqId], notes }] }`. **Tidak boleh ada** di label `stage-*` | latihan |
| `log` | array | ringkasan langkah DP-x / A-x / F-x: `{ step, txHash, status }` | lanjut dari langkah gagal (05 §4.3 aturan 5) |

### 7.3 Field `infra.json`

| Field | Isi |
|---|---|
| `chainId`, `schemaVersion` | sama dengan di atas |
| `mockUsdc` | `{ address, txHash, block, verified, minter }` |
| `eas` | `{ mode: "self-deploy"\|"existing", address, schemaRegistry, version, txHashes, verified }` |
| `schemas` | `{ ParticipantVerified: { uid, schema, revocable, resolver, txHash }, KybApplication: { uid, schema, revocable, resolver, txHash } (D-41; `null` kalau build solo baru sampai fallback D), CapacityAttested?: …, DeliveryReceipt?: … }` |
| `safe` | `{ address, owners[], threshold, createdVia: "ui"\|"protocol-kit", testTxHash }` (go/no-go cek 4) |
| `kyb` | `{ attester, attestations: [{ recipient, label, uid, expiry, linkedIn: [label] }] }` |

---

## 8. Go/no-go Jum 10:30 WIB: dari cek ke perintah

Semua cek jalan di Robinhood Chain Testnet antara 09:00 dan 10:30 (design §11.3).

**[APPROVED D-57, Jum 9 Okt ~11:05 WIB] Timebox: maksimal 45 menit sejak T0. T0 = Jum 9 Okt 2026 11:14 WIB, jadi keputusan chain paling lambat 11:59 WIB** (lebih cepat kalau bisa). Jam 09:00–10:30 di tabel di bawah = rencana lama; yang berlaku adalah urutan cek yang sama dalam jendela 11:14 → 11:59 WIB (08 §1, lane L4). Fatih sudah punya saldo Robinhood Testnet di **2 akun**, jadi cek 1 cukup memindahkan dana ke wallet demo (faucet hanya cadangan). Setiap cek yang belum ✅ pada 11:59 dianggap **hard fail** → **langsung switch ke Arbitrum Sepolia** [APPROVED Fatih ~11:12 WIB]: tidak ada perpanjangan dan tidak ada diskusi ulang. Dengan D-54, cek 4 (Safe) tidak lagi di jalur kritis never-cut; tetap dijalankan untuk treasury/narasi, dan gagal = soft fail seperti sebelumnya. Hasil tiap cek dicatat di `deployments/46630/smoke-1.json` (`log`) dan disebut di README kalau ada fallback.

**Hasil go/no-go [PE, Jum 9 Okt ~11:36 WIB, di grup]:** **GO** di **Robinhood Chain Testnet** (chain `46630`), diputuskan sebelum batas 11:59 WIB. [PR #1](https://github.com/Fatihmaull/paron-robinhood/pull/1) dari L4 sudah masuk `main`. Fallback Arbitrum Sepolia **tidak** dipicu — tetap terdokumentasi di bawah sebagai cadangan tidak terpakai.

| Cek | Perintah dalam prosa | Lulus kalau | Kotak waktu | Kalau gagal |
|---|---|---|---|---|
| 1. Deployer berdana | `cast balance` alamat `W-DEP` (dan wallet demo) lewat `RH_TESTNET_RPC`; `cast chain-id` harus 46630 | Saldo ≥ batas [TBD 05 T5-01] dan chainId cocok | 09:00–09:10 | Faucet alternatif / bridge dari Ethereum Sepolia (~10 menit) (design §11.1). Masih gagal 10:15 → **hard fail** |
| 2. Deploy + verify | Dijalankan PE dari mesinnya (§4.1 butir 6): `forge script DeployAll` dengan scope `smoke`, `--broadcast --verify`, akun keystore `DEPLOYER_ACCOUNT`, verifier Blockscout | `MockUSDC` + `SchemaRegistry` + `EAS` ter-deploy; `EAS.version()` = "1.4.0"; ketiganya "verified" di Blockscout | 09:45–10:05 | Deploy gagal = **hard fail**. Hanya verifikasi EAS gagal = lulus sebagian (§6.4) |
| 3. Schema + attestation | Registrasi `ParticipantVerified` (DP-2), satu `attest` dari attester (untuk smoke boleh EOA tim, dicatat), `linkAttestation(uid)` di `EASGate` smoke, lalu `cast call` `isVerified(recipient)` | `isVerified` = true; `entityId` sesuai data | 10:05–10:15 | **Soft fail**: tetap di RH, `GATE_KIND=registry` |
| 4. Safe 2-of-3 | Buat Safe di Safe{Wallet} (network "Robinhood Testnet") dengan 3 owner (tiga EOA terpisah, semuanya milik Fatih, D-08), threshold 2; eksekusi satu tx uji (mis. transfer 0 ETH ke diri sendiri) dengan 2 tanda tangan | Tx tereksekusi; alamat Safe dicatat di `infra.json` | paralel 09:15–10:15 (C) | **Soft fail**: tetap di RH, `safe.mode = allowlist` (opsi B) |
| 5. Ponder sync | Ponder (`indexer/`, PGlite lokal) dengan `INDEXER_RPC_URL` (Alchemy/Goldsky, bukan publik) dan `startBlock` dari `smoke-1.json`; indeks satu event (mis. `Transfer` MockUSDC dari mint, atau `Attested`) | Baris muncul di DB/endpoint; jeda event → baris dicatat untuk T4-03 | 10:05–10:20 (C) | RPC lain (backup). Masih gagal = **hard fail** (design §11.3 mewajibkan kelima cek) |

**Keputusan (paling lambat 11:59 WIB = T0+0:45; teks lama: 10:30):**
- Kelima cek lulus (atau hanya soft fail 3 dan/atau 4) → tetap RH.
- Ada hard fail → **langsung switch ke Arbitrum Sepolia** [APPROVED Fatih ~11:12 WIB] (~30–45 menit, design §11.3):
  1. `CHAIN=arbitrumSepolia` di semua `.env`;
  2. `DeployAll` scope `smoke` di 421614: EAS dilewati, memakai `0x2521…E1dE` / `0x45CB…d475` dari `chains.json`; schema didaftarkan di registry existing;
  3. verifikasi Arbiscan (`ETHERSCAN_API_KEY`);
  4. `NEXT_PUBLIC_CHAIN_ID=421614`, Ponder `CHAIN=arbitrumSepolia`, `DEPLOY_LABEL` baru;
  5. `safe.mode = allowlist` (opsi B, rekomendasi) atau `protocol-kit` (opsi A);
  6. baris chain di README diganti (`readmeChainLine`).
- Yang **tidak** berubah: kode kontrak, ABI, schema Ponder, rute API (stack §0: "config-only").

**Hosting [D-58, APPROVED ~11:12 WIB; ownership ~11:29 WIB; detail ~11:32 WIB; URL terisi ~13:08 WIB]:** Vercel tidak bisa menjalankan Ponder (proses panjang + Postgres). **Host (Scout, delegasi Fatih):** frontend di **Vercel** project `paron` (root directory = `web/`, layout §1; D-10); Ponder + API + Postgres di **Railway** project `paron` (service root = `indexer/`; service Postgres terpisah; Railway tidak tidur seperti free tier Render, aman untuk penjurian async Sab 12:00 → Min). **URL produksi (Scout ~13:08 WIB):** frontend `https://paron.vercel.app` (production, commit `b18b3d4`, build Ready); API `https://paron-robinhood-production.up.railway.app/v1` (health 200; kontrak `stage-1` sudah di-deploy ~13:20 WIB — indexer menunggu redeploy Scout dengan `DEPLOY_LABEL=stage-1` supaya `indexed_block` naik). **Env Vercel yang dipakai:** hanya `NEXT_PUBLIC_RPC_URL` dan `NEXT_PUBLIC_API_BASE_URL` — **jangan** set `NEXT_PUBLIC_DATA_SOURCE=mock` (build menolak saat `VERCEL=1`; `live` opsional). **`API_CORS_ORIGIN` (Scout ~13:20 WIB):** diset ke `https://paron.vercel.app` (menggantikan 'kosong dulu' PE ~13:09; menunggu konfirmasi redeploy). **Deploy kontrak ~13:20 WIB (PE):** label `stage-1`, `startBlock` = `131496617`; Railway env: `DEPLOY_LABEL=stage-1`, `INDEXER_RPC_URL` = RPC publik Robinhood sementara; Vercel/web baca alamat dari manifest (tanpa `NEXT_PUBLIC_ADDR_*`). **Ownership:** Hackathon Scout menyiapkan akun + project di komputer Scout dengan login GitHub Fatih (`Fatihmaull`); **Vercel dan Railway sudah login di komputer Scout (~11:32 WIB); tidak perlu kartu.** Key RPC Alchemy opsional lewat secret input, tidak di chat. Indexer menarik `DATABASE_URL` lewat referensi variable Railway `${{Postgres.DATABASE_URL}}` — **nilai mentah `DATABASE_URL` tidak dioper ke PE atau siapa pun**. Setelah kontrak di-deploy: PE mengirim ke Scout env Railway lainnya (RPC URL, chain id, alamat kontrak, start block, `DATABASE_SCHEMA` (per build `paron_<sha8>`, bukan `paron` tetap; lihat catatan ~14:02 WIB); daftar lengkap mengikuti README package indexer dari L3) dan Scout yang mengisi di Railway; PE mengisi env Vercel. Deploy/broadcast tetap dari mesin PE; L4 hanya menyiapkan script (catatan ~11:27 WIB). Blok 30 menit di 08 tetap ±18:44–19:14 (sebelum G3 = 19:14). Menjawab T4-02 (versi Postgres = yang disediakan Railway). Mode fallback onchain frontend (05 P5-23) S0-kritis.

---

## 9. CI dan konvensi git

### 9.1 Outline GitHub Actions [APPROVED P4-17]

| Job | Pemicu | Langkah (prosa) | Prio | Ref |
|---|---|---|---|---|
| `contracts` | setiap push/PR yang menyentuh `contracts/` | `foundry-rs/foundry-toolchain` v1.8.5; install dependency npm kontrak dengan lockfile; `forge fmt --check`; `forge build --sizes` (gagal kalau ada kontrak > 24,576 B); `forge test` profil `default`, **tanpa** `testFork_*` (filter nama) | MUST | stack §4.7, 02 |
| `invariants` | push ke `main` + manual | `forge test` profil `ci` hanya `invariant_*`; `runs`/`depth` = 02 T2-01; seed fuzz dicetak supaya kegagalan bisa diulang | MUST | 02 §3.2, T2-01 |
| `gas` | PR kontrak | `forge snapshot` dan bandingkan dengan snapshot di repo (batas loop matching `OrderBook`) | SHOULD | stack §4.6, 01 T-02 |
| `ts` | setiap push/PR | pnpm 12.9.1 + Node 24.21.0; `pnpm install --frozen-lockfile`; `biome check`; typecheck tiap workspace; bangkitkan `shared/abi` dari `contracts/out` lalu pastikan tidak ada diff | MUST | stack §4.3, §4.7 |
| `fork` | manual (secret RPC) | `forge test` hanya `testFork_*` (02 §4.1) dengan `RH_TESTNET_RPC` dari secret repo, fork di `latest − 20` | SHOULD | stack §4.6, OQR housekeeping |
| `slither` | PR kontrak | `crytic/slither-action` Slither 0.11.6, gagal pada temuan high | NICE | stack §4.6 |
| `api-tests` | push | Vitest 5.0.3 terhadap `fixtures/v1/` + cek API 02 §5 | NICE | 02 §5, stack §4.6 |
| `e2e-ui` | manual | Playwright 1.63.0 pada jalur demo | NICE | stack §4.6 |
| `coverage` | manual | `forge coverage` | NICE | stack §4.6 |

CI tidak pernah memegang key deployer dan tidak pernah broadcast ke testnet [P4-17]. Deploy selalu manual dengan keystore dari **mesin PE** (sebelumnya "laptop A"); cloud agent / lane L4 hanya menyiapkan `DeployAll`, seed, dan manifest, tidak menjalankan broadcast (§4.1 butir 6).

**[D-81]** Guard CI grep `affiliated|endorsed by` (butir terakhir D-74) dibatalkan. Tidak ada job grep itu di CI. Status: awaiting Fatih's direct confirmation in group. `web/lib/copy-guard.test.ts` tetap dan bukan guard ini.

### 9.2 Branch dan commit (singkat) [APPROVED P4-18]

- **Trunk-based:** `main` selalu bisa build. Branch pendek per area (`contracts/<topik>`, `web/<topik>`, `indexer/<topik>`, `agents/<topik>`, `docs/<topik>`), merge cepat setelah CI hijau. **[APPROVED Fatih ~11:27 WIB, izin merge tetap]** PE boleh me-merge PR sendiri ke `main` kalau test/CI hijau, tanpa minta OK Fatih tiap kali (07 §10.5). Jangan force-push ke `main`.
- **Commit:** gaya Conventional Commits dengan scope = folder (`feat(contracts): …`, `fix(indexer): …`, `test(contracts): …`, `chore(config): …`). Satu commit = satu perubahan logis, supaya riwayat menunjukkan pekerjaan selama hackathon (aturan 1 dan 2, OQR §5).
- **Commit pertama ≥ Jum 9 Okt 09:00 WIB** (OQR §5). Dev docs pra-hackathon disalin ke `docs/dev/` dengan catatan "riset/desain sebelum hackathon; kode dibuat selama hackathon" (aturan 2: "clearly identify what was newly developed").
- **Tag:**
  - `go-nogo` (10:30, chain terpilih);
  - `freeze-contracts` (Sab 06:00, design §7.3);
  - `freeze-ui` (Sab 09:00);
  - `submission` (Sab 11:30).
  - Deployment `stage-1` dibuat dari commit bertag `freeze-contracts` (05 §4.6), dan field `git.commit` manifest harus sama.
- **Atribusi** pihak ketiga (OZ, EAS self-deploy, Safe) di README (aturan 10, design §7.5).
- **Atribusi pembangunan [APPROVED Jum 9 Okt ~11:05 WIB; teks kerja ~11:12 WIB, Fatih: "bilang saja ini dibantu oleh grokbot"]:** README memuat baris "Built by Fatih Maulana with help from Grok Bot" (versi Indonesia: "Dibangun oleh Fatih Maulana dengan bantuan Grok Bot"). Detail di 09 (§3.2, R5).
- **Author commit [APPROVED Jum 9 Okt ~11:05 WIB, Fatih; nilai diisi ~11:12 WIB]:** semua commit, termasuk dari agent cloud di lane L1–L4 (08 §1), di-author sebagai **Fatih**, bukan agent: `user.name` = `Fatih Maulana`, `user.email` = `fatihmaulanamail@gmail.com`. Remote: https://github.com/Fatihmaull/paron-robinhood. Dicek sebelum push pertama tiap lane dan di checklist pra-submit 09 §7 (`git log` tidak memuat author lain).

---

## 10. Checklist bootstrap "Jumat 09:00"

> **Superseded [APPROVED D-59, Jum 9 Okt ~11:05 WIB]:** jam di tabel ini adalah rencana solo lama. Bootstrap kini = blok T0 → T0+0:45 (**11:14 → 11:59 WIB**, T0 = "go" Fatih 11:14 WIB) rencana 4 lane (08 §1): L1 interface + ABI, L2 scaffold, L3 proyek Ponder, L4 go/no-go (maksimal 45 menit, D-57). Isi langkahnya tetap berlaku sebagai daftar periksa.

**Versi solo (berlaku Jum 9 Okt, D-08 APPROVED):** tabel A/B/C di bawah dipertahankan sebagai urutan langkah, tetapi semua dikerjakan Fatih berurutan: kolom A dulu (jalur kritis go/no-go), langkah C yang memblokir cek (Safe cek 4, Ponder cek 5) disisipkan di jeda broadcast/verify, kolom B (scaffold web) dimundurkan ke setelah 10:30. Jadwal aktual dan cut ladder ada di `08-team-tasks.md` §2–§4. Approval baru tercatat 09:40, jadi jalur go/no-go dimulai terlambat; keputusan chain tetap dikunci Jum **10:30 WIB** dengan aturan soft/hard fail §8 (cek 4 Safe boleh soft fail → opsi B allowlist).

**Prasyarat Kamis (bukan kode, design §11.2):**
- [ ] wallet baru (`W-DEP` + wallet demo) sudah didanai di **kedua** chain;
- [ ] key Alchemy dengan RH Testnet + Arbitrum Sepolia, plus key Etherscan V2;
- [ ] Foundry v1.8.5, Node 24.21.0 dan pnpm 12.9.1 terpasang di laptop utama (dan perangkat kedua untuk S5/agent, 05 §2.4);
- [ ] keystore `paron-deployer` sudah diimpor di laptop utama;
- [ ] tiga EOA owner Safe (milik Fatih, profil wallet berbeda) tercatat alamatnya.

Tidak ada deploy publik dan tidak ada repo Paron sebelum 09:00.

| Blok (WIB) | A (kontrak) | B (frontend) | C (produk/indexer) | Selesai kalau |
|---|---|---|---|---|
| 09:00–09:05 | Buat repo, commit pertama: root `package.json`, `pnpm-workspace.yaml`, `.gitignore`, `.nvmrc`, `README.md` kosong berisi baris chain | — | Cek ulang saldo semua wallet (cek 1 awal) | Commit pertama bertimestamp ≥ 09:00 |
| 09:05–09:15 | `forge init` di `contracts/`; setelan §2.2; dependency npm OZ 5.6.1 + eas-contracts 1.9.0 dipin; `forge build` kosong lulus | Scaffold Next.js 16.3.8 di `web/` dengan versi §2.1 dipin | `config/chains.json` dari §3.2; `.env.example` dari §4 | `pnpm install` + `forge build` hijau |
| 09:15–09:30 | `MockUSDC` (permit, faucet, minter) + `EASGate` minimal (`isVerified`, `entityId`, `linkAttestation`) | wagmi + RainbowKit untuk 46630 **dan** 421614 (design §7.3 "both chains configured") | Mulai buat Safe 2-of-3 di Safe{Wallet} RH (cek 4) | Kontrak kompilasi; Safe dibuat |
| 09:30–09:45 | `DeployAll` scope `smoke` + penulis manifest; uji di fork anvil RH (`latest − 20`, key baru) | Layout S1 dengan `NEXT_PUBLIC_DATA_SOURCE=mock` | `ponder init` di `indexer/` dengan versi dipin; config membaca `chains.json` + manifest | Smoke lulus di fork |
| 09:45–10:05 | **Cek 2:** broadcast smoke ke RH + verify Blockscout | Tombol connect wallet di kedua chain | Safe: eksekusi tx uji (cek 4) | 3 kontrak verified; Safe tx sukses |
| 10:05–10:15 | **Cek 3:** registrasi schema, attest, `linkAttestation`, `isVerified` | — | **Cek 5:** Ponder sync event smoke (catat jeda untuk T4-03) | `isVerified` true; baris Ponder muncul |
| 10:15–10:30 | Buffer / perbaikan; isi `infra.json`; tulis hasil cek | Commit skeleton | Tulis hasil di README draft | Tabel 5 cek terisi |
| **10:30** | **Keputusan go/no-go** (§8); tag `go-nogo` | | | Chain terkunci |
| 10:30–11:15 | Kalau no-go: switch (§8). Kalau go: mulai Registry/ConversionTable/Factory (design §7.3) + test shortlist 02 §0 menyusul | S1 skeleton mock data | Workflow CI `contracts` + `ts` (§9.1); `fixtures/v1/` dari 03 §4 | CI hijau di `main` |

Catatan:
- Kalau blok 09:15–09:30 molor, `EASGate` minimal boleh diganti pembacaan EAS langsung (`isAttestationValid`) untuk cek 3. `EASGate` penuh tetap dibuat sebelum 12:00 [P4-19].
- Salin `docs/dev/` (01–07) sebelum 10:30 supaya B/C bisa merujuk 03 dan 05.

---

## 11. Ketergantungan D-xx

Semua keputusan 07 **APPROVED** (Jum 9 Okt 2026 ~09:40 WIB) dengan opsi rekomendasi; konfigurasi di sini sudah mengikutinya. Kolom "Kalau berubah" hanya catatan.

| D | Topik | Dipakai di 04 | Kalau berubah |
|---|---|---|---|
| D-02 | Window bulan kalender | `enforceCalendarMonth` (§4.3, §5) | Flag dihapus atau `false` di demo |
| D-03 | Arbitrator demo | `PANEL_MEMBER_1..3`, DP-15 | Alamat/kontrak arbitrator lain di allowlist |
| D-04 | Attester = Safe tim (desain target) | `KYB_ATTESTER_ADDRESS`, `infra.json.kyb` | Alamat attester lain |
| D-54 (APPROVED ~11:05 WIB, hackathon) | Attester `W-VERIFIER`, proposer + `W-ADMIN`, executor terbuka | env §4.3, DP-4, DP-5, DP-18, §6.3, `roles` manifest | Kembali ke D-04 + P4-15 |
| D-57 (APPROVED ~11:05 WIB; fallback langsung ~11:12 WIB) | Go/no-go maks. 45 menit (11:14 → 11:59 WIB); gagal → langsung Arbitrum Sepolia | §8 | — |
| D-58 (APPROVED ~11:12 WIB) | Blok hosting indexer | §8 catatan hosting, T4-02 | Hosting tanpa blok khusus |
| D-06 | `ReferenceFeed` NICE | DP-16, env `reference-signer` | Tanpa feed: langkah dan env dilewati |
| D-08 | Tim = Fatih solo | Kolom A/B/C di §1.2 dan §10 = Fatih; jadwal di 08 | — |
| D-09 | Faktor A100/RTX4090 | `params.*` faktor awal | Angka di set |
| D-10 | Domain: **APPROVED Jum 9 Okt ~10:33 WIB**; URL terisi ~13:08 WIB = `https://paron.vercel.app` | `NEXT_PUBLIC_API_BASE_URL` = Railway `/v1`; app = `https://paron.vercel.app` | Domain kustom menyusul |
| D-13 | Treasury | `TREASURY_ADDRESS`, DP-12/13 | Treasury kontrak terpisah → langkah deploy tambahan |
| D-15 | Parameter PrintIndex demo | §5, DP-10 | Angka di set |
| D-17 | 10 level | §5 `maxLevels` | Angka |
| D-19 | `allowOpenWindow` | §4.3, §5, aturan P4-11 | Tanpa flag → seed 2610 tidak mungkin; naskah 05 berubah |
| D-20 | Set demo vs prod | §5 seluruhnya, `PARAM_SET` | Mode toggle admin (ditolak 07) → struktur set berubah |
| D-23 | Nama gate | `GATE_KIND`, folder `src/gate/` | Nama file/kontrak |
| D-24 | Schema KYB | DP-2, `SCHEMA_UID_PARTICIPANT_VERIFIED` | String schema → UID baru |
| D-25 | 3 seed + 2610 live | `seed.series` manifest | Jumlah entri seed |
| D-26 / D-27 | Receipt EAS / `CapacityAttested` | Schema opsional DP-2 | Registrasi schema tambahan |
| D-30 | Permit | `MockUSDC` dengan `ERC20Permit` (DP-1) | Tanpa permit → tidak ada perubahan config |
| D-31 | KYB semua buyer/trader | Attestation seed untuk `W-BUY`, `W-BUY2`, `W-TRD` (`infra.json.kyb`) | Lebih sedikit attestation |
| D-36 | Mode panel | DP-15, `safe.mode` | Hanya Safe → `PANEL_MEMBER_*` tidak dipakai |
| D-37 | `rulingWindow` immutable di RM | §5, DP-14 | Per series → pindah ke set series |
| D-39 | `leadTime` | §5, DP-11 | Angka |
| D-40 | Paket default (P-65, P-15, batas fee, faucet) | §5; strategi alamat §6.1 (P-65 diubah ke prediksi CREATE, 07 V-8, 01 §9 sudah disinkronkan); `MINTER_ROLE` (X4-4, 01 §6.12 sudah disinkronkan) | — |
| D-41 | Schema `KybApplication` | DP-2, `infra.json.schemas`, `SCHEMA_UID_KYB_APPLICATION` | Fallback D: schema tidak didaftarkan, `null` |
| D-42 | Kill switch dari UI | env `PROVIDER_AGENT_HTTP_PORT`, `PROVIDER_AGENT_ALLOWED_ORIGIN`, `NEXT_PUBLIC_AGENT_URL` | Fallback E: env/jendela agent saja |

---

## 12. Register usulan P4-xx (APPROVED Jum 9 Okt 2026 ~09:40 WIB)

Semua P4-01..P4-19 disetujui. P4-12 dan P4-13 sudah diterapkan di 01 (§6.3/§6.8 view, §9 wiring).

| ID | Usulan | Bagian |
|---|---|---|
| P4-01 | Layout monorepo §1.1 (tambahan `config/`, `deployments/`, `fixtures/`, `shared/`) | §1 |
| P4-02 | Seed fase 0–2 = `Seed.s.sol`; fase 3–4 otomatis = `Rehearsal.s.sol`; bot trader panggung = `agents/trader-bot` | §1.2 |
| P4-03 | Pin versi persis + lockfile + `packageManager`/`engines` + `.nvmrc` | §2 |
| P4-04 | Profil Foundry `default`/`ci`/`deep` + `fs_permissions` untuk `config/` dan `deployments/` | §2.2 |
| P4-05 | Perluasan field `chains.json` di luar daftar stack §3.1 | §3 |
| P4-06 | Keystore Foundry untuk deployer dan aktor seed, bukan private key mentah | §4.1 |
| P4-07 | RPC browser terpisah dari RPC indexer (key dibatasi domain atau RPC publik) | §4.1, §4.5 |
| P4-08 | Manifest `deployments/<chainId>/infra.json` + `<label>.json`, `DEPLOYMENTS.md` dibangkitkan (menjawab 05 T5-12) | §7 |
| P4-09 | Manifest anvil tidak di-commit | §1.1, §7.1 |
| P4-10 | `DeployAll` punya scope `smoke` dan `full`; infra smoke dipakai ulang | §6.2 |
| P4-11 | Script menolak `PARAM_SET=prod` + `allowOpenWindow=true` | §5 |
| P4-12 | Batas demo dibaca lewat getter `bounds()`, `allowOpenWindow()`, `enforceCalendarMonth()`, `rulingWindow()` (menjawab "nama view = doc 04" di 05 §3.1) | §5 |
| P4-13 | Wiring melingkar dengan prediksi alamat **CREATE (nonce)** + `immutable`; alternatif `wire()` sekali pakai | §6.1 |
| P4-14 | Resolver schema EAS = alamat nol | §6.2 DP-2 |
| P4-15 | Executor Timelock = proposer; admin opsional Timelock = alamat nol. **Di-override untuk hackathon oleh D-54 (APPROVED ~11:05 WIB):** executor = `address(0)`, proposer = Safe + `W-ADMIN` | §6.2 DP-5 |
| P4-16 | Verifikasi EAS gagal = lulus sebagian, dengan atribusi + link source di README | §6.4 |
| P4-17 | Outline CI §9.1; CI tidak pernah memegang key atau broadcast | §9.1 |
| P4-18 | Trunk-based + Conventional Commits + tag `go-nogo`/`freeze-*`/`submission` | §9.2 |
| P4-19 | Fallback cek 3: baca EAS langsung kalau `EASGate` minimal belum siap | §10 |

## 13. Register TBD baru (T4-xx)

Tidak ada rekomendasi untuk T4-01..T4-05, jadi semuanya **masih TBD** setelah approval (07 §10). Semuanya diisi dari pengukuran/instalasi Jumat, bukan keputusan Fatih.

| ID | Hal | Kenapa belum bisa diputuskan |
|---|---|---|
| T4-01 | Versi `forge-std` | Stack: "version ❓"; dipin saat `forge install` pertama dan dicatat di manifest |
| T4-02 | Versi Postgres persis (16 vs 17) | Stack: "❓ exact"; ikut managed DB hosting yang dipilih |
| T4-03 | Jumlah konfirmasi blok / setelan finality Ponder per chain | Sumber hanya menyebut soft confirmation ~100 ms ⚠️; diukur di cek 5 (terkait 03 T3-01) |
| T4-04 | Apakah RainbowKit 2.2.11 butuh WalletConnect project ID untuk HP juri | Tidak dinyatakan sumber; terkait 05 T5-03 |
| T4-05 | Tampilan clone EIP-1167 di Blockscout/Arbiscan (otomatis terdeteksi sebagai proxy atau tidak) | Belum diuji |

TBD dari dokumen lain yang memengaruhi config: 01 T-02 (`maxFillsPerTx`), 01 T-04 (parameter PrintIndex prod), 05 T5-01 (saldo ETH minimum), 05 T5-04 (isi `paron-spec/v1`), 05 T5-07 (`PROVIDER_AGENT_DETECT`), 05 T5-11 (waktu deploy ulang); 02 T2-01 sudah memakai angka kerja yang disetujui (`runs`/`depth`), 03 T3-01 (finality Ponder).

---

## 14. Divergensi

| ID | Dengan | Isi | Sikap 04 |
|---|---|---|---|
| X4-1 | 01 P-65, 07 D-40, 05 P5-18 / §4.5 | CREATE2 dengan argumen constructor `immutable` tidak bisa memecah referensi melingkar, karena initcode memuat alamat peer | **RESOLVED** (Jum 9 Okt): 01 §9 kini memakai prediksi alamat CREATE (P4-13, 07 V-8); alternatif `wire()` tetap tercatat |
| X4-2 | Permintaan "api" sebagai package | Stack §4.2: API = route Hono bawaan Ponder | API tinggal di `indexer/src/api/`; tidak ada package `api/` |
| X4-3 | Stack §4.7 (daftar folder) | Stack hanya menyebut `contracts/`, `indexer/`, `web/`, `agents/`, `docs/` | Tambah `config/`, `deployments/`, `fixtures/`, `shared/` (P4-01) |
| X4-4 | 07 tabel P-15 vs 05 §3.1 | 07: `MINTER_ROLE` "dicabut setelah seed"; 05: tetap di `W-DEP` untuk top-up | **RESOLVED**: 01 §6.12 dan 07 P-15 kini "dicabut setelah Demo Day"; catat di manifest `roles.minter` |
| X4-5 | design §11.3 cek 2 | Cek 2 menyebut `DeployAll` men-deploy MockUSDC + SchemaRegistry + EAS, padahal `DeployAll` final men-deploy semua kontrak | `DeployAll` scope `smoke` untuk cek 2, scope `full` untuk deployment nyata (P4-10) |
| X4-6 | stack §4.4 (Seeder) | Stack: seeder membuat "orders, one default scenario"; 05: deployment panggung hanya fase 0–2, tanpa default (P5-13) | Ikut 05 dan [D-25]; skenario default hanya di `Rehearsal.s.sol` |
| X4-7 | design §11.3 cek 3 | Cek 3 membaca lewat `EASGate.isVerified` | Tetap; fallback baca EAS langsung hanya kalau `EASGate` minimal belum siap (P4-19), dicatat sebagai lulus sebagian |
| X4-8 | design §11.1 "same salts give the same Paron addresses on both chains" | Dengan P4-13, alamat sama antar chain tidak dijamin (05 T5-10 sudah meragukannya karena argumen constructor berbeda) | Tidak dijanjikan di README |

Tidak ada divergensi angka dengan 05 (set demo §5 = 05 §3.1) atau 03 (Ponder/API §4.4 = 03 §0, §2.1).
