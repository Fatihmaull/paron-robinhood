# SESSION_HANDOFF_HACKATHON.md — Paron (ETHJKT 2026)
Written 2026-10-09 ~14:40 WIB. Each agent appends its own section under "## Agent sections". Scout section is complete; other agents add theirs.

## 0. Project snapshot
- Paron: collateral-backed tokenized GPU compute units (1 CU = 1 hr H100-equivalent), MockUSDC settlement, bond >= 1.5x primary price per CU.
- Chain: Robinhood Chain Testnet (id 46630) primary; Arbitrum Sepolia (421614) fallback. Go/no-go was GO.
- Repo: https://github.com/Fatihmaull/paron-robinhood (git author Fatih Maulana <fatihmaulanamail@gmail.com>; PE may merge PRs when tests are green).
- Deadlines (WIB): T0 Fri 9 Oct 11:14; contract freeze Sat 06:00; UI freeze Sat 09:00; internal submit Sat 11:30; hard deadline Sat 12:00.
- Source of truth: this folder; start at CONTEXT-INDEX.md, then canonical docs, then paron-dev-docs/01-09. Never use archive files (section C) or .bak-* folders.

## 1. Agent sections
### 1.1 Hackathon Scout (this agent)
**Role:** master of product knowledge; owns CONTEXT-INDEX.md, handoff brief, hosting/deploy accounts (Vercel, Railway) on my box, answers product questions, relays Fatih's decisions to the group. Does not write product code, does not contact organizers/judges, does not submit to HackQuest.
**Core instructions:** reply to Fatih in casual Indonesian; draft before sending any external message; secrets only via secret-request in 1:1; testnet only.

**Hosting (done, verified 14:01-14:40 WIB):**
- Vercel: project `paron`, root dir `web`, team fatihmaulls-projects, production https://paron.vercel.app. Env: `NEXT_PUBLIC_RPC_URL`, `NEXT_PUBLIC_API_BASE_URL` (NOT `..._API_URL`). `web/next.config.ts` no longer blocks on mock mode (PR #8/#12).
- Railway: project `paron` (https://railway.com/project/6d4ac7a4-d49b-4f95-9181-514eaf885318), Postgres 18 + service `paron-robinhood` (root `indexer`, start `pnpm start`, healthcheck `/v1/health`, port 42069). URL https://paron-robinhood-production.up.railway.app.
- Railway env: `DATABASE_URL`, `DATABASE_SCHEMA`, `CHAIN`, `PORT=42069`, `DEPLOY_LABEL=stage-1`, `INDEXER_RPC_URL=https://rpc.testnet.chain.robinhood.com`, `API_CORS_ORIGIN=https://paron.vercel.app`. Pending/optional: `INDEXER_RPC_URL_BACKUP` (PE suggests a second RPC for demo).
- Deployed contract addresses: `deployments/46630/infra.json` + `stage-1.json` in the repo.
- Health now: /v1/health synced:true, /v1/series returns 3 seeds (CU-JKT-H100-2611, CU-BTM-H200-2611, CU-SGP-B200-2612). Each deploy backfills ~1 min (503 INDEXER_SYNCING is normal then).

**Build errors already solved (do not repeat):** pnpm ignored build scripts (esbuild etc.) fixed via allowBuilds (PR #6, #7); ponder start empty DATABASE_SCHEMA (PR #10); event `IndexUpdateFailed` not in PrintIndex ABI (PR #27); Ponder refusing reused schema -> per-build schema `paron_<sha8>` (PR #30); Portfolio endpoint -> `/v1/accounts/{wallet}/holdings` (PR #32); UtilityBar Block from /v1/health (PR #33); D-66 syncing copy (PR #31).

**Approved decisions (Fatih):** D-45..D-58; D-60..D-63 (ChainBadge "Robinhood Chain Testnet", bond bar legend, H1 "Where compute is forged into one standard.", "Decline & pay" danger outline); D-64 footer + all "not affiliated" text removed from web/README (disclaimer only in pitch deck); D-65 UtilityBar (Docs · API · GitHub, testnet note, Build · Chain · Block); D-66 syncing copy. Never-cut list = 3 items: claim default from any wallet, live KYB issue in /verifier, one timelock execute from /admin. Wording rules: no "partner", no logos, never say "feeds". README says built with help of Grok Bot.
**Pending Fatih choice:** Designer findings 5 (series detail layout/Redeem link color), 6 (contrast >= 4.5:1), 8 (Provider tabs). Reply format: "setuju 5,6,8" -> Spec Writer logs D-67+.
**Known issues:** public Robinhood RPC intermittently gives ERR_SSL_UNRECOGNIZED_NAME_ALERT in browsers (also caused MetaMask "unable to connect" notice) -> PE hardening: retry/backoff, backup RPC, no red error for RPC failure. /statements and /provider/redemptions may have the same wrong-endpoint bug as Portfolio (contract: `/v1/accounts/{addr}/statement` per 03).
**Optional open question:** LICENSE copyright "Fatih Maulana" vs "Muhammad Fatih Maulana".

**Scout next tasks (new session):**
1. Re-check /v1/health, /v1/series and https://paron.vercel.app after every PE deploy; report in group.
2. Once PE finishes RPC hardening, set `INDEXER_RPC_URL_BACKUP` on Railway if Fatih supplies a second RPC.
3. Record every new Fatih decision in CONTEXT-INDEX.md and tell Spec Writer.
4. Rebuild the docs zip (HANDOFF-BRIEF + product plan) if Fatih wants it.
5. Support submission prep (HackQuest fields per paron-dev-docs/09); never submit on Fatih's behalf.

### 1.2 Other agents (append below: Principal Engineer, Spec Writer, Product Designer)

#### Paron Spec Writer
**Identitas dan scope:** agent `Paron Spec Writer` (id `b1cd1647-d9ab-4378-b41a-58e760a83941`). Tugas: menulis dan merawat dev spec 01-09 di `paron-dev-docs/` sebagai satu-satunya sumber spec, hanya dari dokumen kanonik di `CONTEXT-INDEX.md` §A (Scout = master). Spec saja, tanpa kode. Prosa Indonesia, identifier Inggris. Laporan dokumen selesai dikirim ke grup `2a9c57e5-87fb-4321-8227-3237d377dd87` dalam bahasa Indonesia santai. Hanya Fatih yang menyetujui keputusan; yang belum disetujui tetap `PENDING`.
**Aturan kerja:** backup sebelum setiap edit ke folder `paron-dev-docs/.bak-2026-10-09-pre-<jam>/` (terbaru: `.bak-2026-10-09-pre-1415/`). Tidak mengedit file milik Scout (`CONTEXT-INDEX.md`, `paron-sitemap.md`, `paron-product-plan.md`, `HANDOFF-BRIEF.md`). Tidak memakai file arsip (section C), `raw/`, atau `.bak-*` sebagai sumber. Grep daftar kata terlarang di instruksi Spec Writer atas 01-09 harus 0 hasil (terakhir dicek saat menulis bagian ini: 0 file cocok).

**Status dokumen (semua spec saja, bukan kode):**
| File | Topik | Sinkron terakhir |
|---|---|---|
| `01-contract-interfaces.md` | interface 12 kontrak, parameter §2, role §4, call graph §8, event Ponder §11 | APPROVED-SYNCED; audit D-45..D-59 (§0.2), approval ~11:14 WIB |
| `02-invariants-acceptance.md` | invariant, test Foundry, acceptance indexer/API (§5) | APPROVED-SYNCED; audit D-45..D-56 ~11:15 WIB |
| `03-data-contract.md` | schema Ponder, endpoint E1-E24 | APPROVED-SYNCED; catatan CORS ~13:11 WIB, schema `paron_<sha8>` ~14:02 WIB |
| `04-repo-config.md` | struktur repo, env (§ tabel variabel), hosting | APPROVED-SYNCED; D-64; risiko RPC + `INDEXER_RPC_URL_BACKUP` PENDING ~14:15 WIB |
| `05-demo-seed.md` | seed, aktor `W-*`, langkah panggung S-01..S-13, bot trader (P5-26) | APPROVED-SYNCED; D-64 |
| `06-screens-wireframes.md` | wireframe, copy UI | APPROVED-SYNCED sampai **D-66** (D-60..D-63 §0.5/§1.1/§4.6/§6.3; D-65 UtilityBar; D-66 copy syncing) |
| `07-decisions-log.md` | log keputusan D-01..D-66 | APPROVED sampai **D-66**; §12 (13:30), §13 (13:35), §14 (~14:02) |
| `08-team-tasks.md` | 4 lane paralel (D-59), cut order §4, PENDING §5 | APPROVED-BASIS; sinkron sampai D-65 |
| `09-submission-checklist.md` | timeline, isian HackQuest §2, README §3, video §4, final pra-submit §7 | APPROVED-SYNCED; sinkron sampai D-65; cek RPC ada di §7 |
Catatan jujur: hanya 06 dan 07 yang menyebut D-66 secara eksplisit; 01-05, 08, 09 tidak punya perubahan yang butuh D-66.

**Nomor keputusan:** D-45..D-58 disetujui Fatih ~11:05/11:12 WIB (07 §10.5, §11); D-59 (4 lane) ~11:05 WIB; D-60..D-63 perubahan desain 13:30 WIB (07 §12); D-64 footer dan semua teks "not affiliated" dihapus dari produk (disclaimer hanya di pitch deck); D-65 `UtilityBar` 13:35 WIB (07 §13); D-66 copy syncing ~14:01 WIB (07 §14). Never-cut = 3 butir: claim default dari wallet mana pun, issue/approve KYB live di `/verifier`, satu eksekusi timelock dari `/admin` (08 §0, X8-8).

**Fakta spec penting:**
- Hosting (03 §0, 04): Vercel `web/` (frontend), Railway `indexer/` (Ponder + Postgres). Per build memakai schema `paron_<sha8>` (PR #30; 03/04 catatan ~14:02 WIB).
- Endpoint di 03: `GET /v1/accounts/{addr}/holdings` (E8, §3.11) dan `GET /v1/accounts/{addr}/statement` (E9, §3.12); `GET /v1/kyb/applications` (E20, §3.23). Status KYB: Pending, Approved, Expired, Revoked, Withdrawn; tidak ada Rejected di MVP.
- CORS (03 §3.1, P3-22): `*` untuk data publik; `API_CORS_ORIGIN` kosong dulu, dikunci ke `https://paron.vercel.app` (PE ~13:09 WIB; Railway sekarang sudah diset ke nilai itu menurut bagian Scout).
- Seed (05 §1, D-25): `CU-JKT-H100-2611`, `CU-BTM-H200-2611`, `CU-SGP-B200-2612`. Series panggung `CU-JKT-H100-2610` di-forge live (D-19, flag `allowOpenWindow` di deployment demo), sengaja tidak di-seed.
- `INDEXER_RPC_URL_BACKUP` opsional di 04 (tabel env), status PENDING (nilai contoh di spec masih placeholder, bukan keputusan provider).

**Masih PENDING / belum disetujui Fatih:**
- Usulan Designer #6-#13 di `/workspace/paron-design/spec-change-requests.md` yang belum tercakup D-60..D-66: #9 layout series page satu viewport, #10 S4 redemption result summary, #11 tombol Connect wallet secondary, #12 tabel mobile scroll/stacked, #13 banner mock dan snapshot switcher tidak muncul di build produksi (#6-#8 sudah tercakup D-64/D-60). Catatan: penomoran Scout ("5, 6, 8" contoh format balasan) tidak sama dengan nomor di file Designer; dicocokkan dulu sebelum mencatat D-67+. Temuan "contrast >= 4.5:1" dan "Provider tabs" ada di review Designer, bukan di file tersebut; tidak sempat diverifikasi di sini.
- RPC provider kedua untuk `INDEXER_RPC_URL_BACKUP`.
- Sudah APPROVED (bukan pending): D-10 (URL Vercel dulu, ~10:33 WIB), P5-26 bot trader, T9-06 lisensi MIT (07 §10.3). Hanya pertanyaan nama copyright LICENSE yang masih opsional (lihat bagian Scout).

**Known issues:** RPC publik Robinhood intermiten (`ERR_SSL_UNRECOGNIZED_NAME_ALERT`) dicatat di 04 (catatan ~14:15 WIB) dan 09 §7 (cek RPC dari browser dan wifi demo). Tidak ada gap spec lain yang terbuka.

**Tugas pertama Spec Writer di sesi baru:**
1. Catat pilihan Fatih atas temuan Designer sebagai D-67+ di `07-decisions-log.md`, terapkan ke `06-screens-wireframes.md`.
2. Jaga `08-team-tasks.md` selaras progres nyata (T0 = Jum 9 Okt 11:14 WIB; freeze kontrak Sab 06:00; freeze UI Sab 09:00; submit 11:30; tenggat keras Sab 12:00).
3. Sinkronkan 04 dan 09 begitu RPC cadangan atau domain diputuskan.
4. Backup sebelum tiap edit dan jalankan grep kata terlarang atas 01-09.
5. Kirim update singkat ke grup setelah tiap perubahan dokumen.


#### 1.2.a Paron Principal Engineer (agent id c031279a-8599-4ad6-b9ba-4719cdb2800d)

**Identity and jobdesk.** Owns all Paron code. Integrates 4 cloud-agent lanes: L1 contracts `bc-5a38d2cf-2b76-5f3f-811a-83733027dcbe`, L2 frontend `bc-89e8fbe8-e0b3-55cc-aa68-6a2c38bee038`, L3 indexer/API `bc-0d91ea75-c507-5cb9-947f-24d7191cb1e9`, L4 ops/deploy `bc-85f43bb6-7246-56c0-a646-9338d514f87d`. Deploys contracts from the box using env `PARON_DEPLOYER_PK` (cloud agents cannot receive secrets; executors have no CloudAgent tool, so lane steering goes through the parent). Role keys live outside the repo on the build machine (never commit or paste).
- Standing permissions from Fatih: merge Paron PRs when tests are green; fix incidents directly and report after; ask only for real decisions.
- Commits authored as `Fatih Maulana <fatihmaulanamail@gmail.com>`, no co-author trailers. README says built with help of Grok Bot.
- Spec conflicts go to Paron Spec Writer; product questions go to Hackathon Scout.
- Deadline Sat 10 Oct 2026 12:00 WIB (internal submit 11:30), UI freeze Sat 09:00 WIB, contract freeze 06:00. Build log: `/workspace/paron-build/STATUS.md`, audit: `/workspace/paron-build/AUDIT.md`, `DEPLOYMENTS.md`.
- Anti-scope: no secrets in group or repo; testnet only.

**Architecture / ADR.**
- Chain: Robinhood Chain Testnet, chainId 46630 (fallback Arbitrum Sepolia 421614, see `deployments/421614/go-nogo.json`). EAS self-deployed (eas-contracts 1.9.0 vendored under `contracts/lib`).
- Contracts: Foundry, 42/42 tests (OZ 5.6.1, solc 0.8.29/0.8.37). Dirs in `contracts/src/`: `series/` (SeriesFactory, CUToken, BondVault), `market/` (OrderBook, PrimarySale), `redemption/` (RedemptionManager, PanelArbitrator), `registry/` (ProviderRegistry, ConversionTable), `gate/` (EASGate, RegistryGate), `data/` (PrintIndex, ReferenceFeed), `mocks/MockUSDC.sol`, `deploy/EasCompile.sol`, `libraries/`, `interfaces/`. Tests in `contracts/test/{deploy,e2e,fixtures,integration,invariant,mocks}`.
- Deployment label `stage-1`: `deployments/46630/stage-1.json` (startBlock 131496617, paramSet "demo", timelockDelay 300s, takerFeeBps 15, primaryFeeBps 100, maxFillsPerTx 10). Copy at `indexer/deployments/`; after ANY deploy run `node indexer/script/sync-deployments.mjs` (ABIs: `node indexer/script/sync-shared-abi.mjs`, shared ABIs in `shared/abi`). 3 seeded series: CU-JKT-H100-2611, CU-BTM-H200-2611, CU-SGP-B200-2612. Admin roles are STILL held by the deployer (not moved to Safe).
- Ops scripts `ops/scripts/`: deploy.mjs, seed.mjs, verify-deployment.mjs, smoke.mjs, go-nogo.mjs, render-deployments.mjs. Deploy order: mock-usdc, eas-schema, core (needs MAX_FILLS_PER_TX), roles (needs SAFE_ADDRESS or PARON_SAFE_MODE=allowlist), seed, then verify-deployment. Bots in `agents/src/{keeper,trader-bot}`.
- Indexer: Ponder + Hono on Railway, https://paron-robinhood-production.up.railway.app (root `indexer`, port 42069). API in `indexer/src/api/create-app.ts`. Routes: `/v1/health` (reads Ponder /status), `/v1/prints`, `/v1/index/:gpu(/history)`, `/v1/series(/:id, /:id/orderbook)`, `/v1/orders`, `/v1/accounts/:addr/holdings`, `/v1/accounts/:addr/statement`, `/v1/redemptions(/:reqId)`, `/v1/providers(/:addr)`, `/v1/participants/:addr`, `/v1/gpus`, `/v1/reference/:gpu`, `/v1/deliveries`, `/v1/disputes`, `/v1/kyb/applications`. Event list: `indexer/src/config/events.ts` (has a test). Handlers: `indexer/src/handlers/apply.ts`, `ponder-store.ts`. Start wrapper `indexer/script/start.mjs` sets schema per build `paron_<sha8>` (PR #30; `PONDER_SCHEMA` overrides; old schemas pile up in DB). `SYNC_LAG_BLOCKS=240`. Env names: `DEPLOY_LABEL=stage-1`, `INDEXER_RPC_URL`, `API_CORS_ORIGIN`, `DATABASE_URL`, optional `INDEXER_RPC_URL_BACKUP`.
- Web: Next.js + wagmi + Tailwind v4 on Vercel (https://paron.vercel.app, root `web`, pnpm 12.9.1). Routes in `web/app/`: markets, trade, buy, portfolio, claims, provider, verifier, admin, arbiter, redemptions, disputes, onboarding, faucet, status, index, ops, docs, legal, connect, demo. Key libs in `web/lib/`: `api.ts` (loaders: loadSeriesList, loadBook, loadHoldings, loadProviderRedemptions with `QueueScope`, loadStatement, ...), `config.ts` (robinhoodTestnet chain, `dataSource()`, `rpcUrl()`), `markets-state.ts` (D-66 syncing notice, `SYNCING_COPY`), `onchain.ts`, `permit.ts`, `settlement.ts`. Env (`NEXT_PUBLIC_*` read literally; Vercel refuses mock data source): `NEXT_PUBLIC_RPC_URL_BACKUP` optional, NOT set. Guards: `web/lib/api-paths.test.ts` (every web API path must match an indexer route), `web/lib/copy-guard.test.ts` (banned copy).
- Footer "not affiliated" removed (D-64); UtilityBar approved (D-65).
- Gotchas: pnpm `allowBuilds` in `pnpm-workspace.yaml` (ERR_PNPM_IGNORED_BUILDS for esbuild); frozen-lockfile warnings; public RPC `https://rpc.testnet.chain.robinhood.com/` is intermittent in browsers (`net::ERR_SSL_UNRECOGNIZED_NAME_ALERT`, curl fine), also triggers MetaMask "Unable to connect" toast.

**Status.**
- Done and merged (main at 5ce7c40): PRs #1-#36: ops/deploy scripts, contracts (42/42), indexer E1-E24, web, Vercel/Railway fixes, stage-1 deploy + seed + verify (13:25 WIB 9 Oct), UtilityBar D-64/65, D-60..63, D-66, API path fixes (#34), RPC hardening (#35: 3 retries, block polling every 30s, no red error for RPC failures), keepers query + provider fallback (#36).
- In progress: no code in flight at handoff that I know of; verify with the GitHub PR list for Fatihmaull/paron-robinhood (my check of open PRs returned nothing). Pending verification: that SSL errors actually dropped in a real browser.
- Blockers / known issues:
  1. Admin roles not moved to Safe (decision: Safe or keep deployer for demo).
  2. `forge` check sometimes still pending at merge; #27, #30, #34, #36 merged with `--admin` or pending checks, based on green local tests.
  3. Web CI workflow not pushed (token lacks `workflow` scope); file at `/workspace/web-ci.yml.todo`.
  4. The available Railway token does not see the Paron project, so no Railway logs for Paron from the agent side.
  5. Designer items 5, 6, 8 (series detail gaps, contrast, provider tabs) wait for Fatih's choice.
  6. No backup RPC URL (need one for `NEXT_PUBLIC_RPC_URL_BACKUP` on Vercel and `INDEXER_RPC_URL_BACKUP` on Railway).

**Action plan for the new session (Principal Engineer).**
1. Run the full S0 demo end-to-end on live (buy 20 CU, ask $3.20, default 10 CU, claim default from any wallet, live KYB approve from verifier UI, one timelock change executed from /admin) and fix breakages directly.
2. Decide admin roles: move to Safe (ops/scripts roles step with SAFE_ADDRESS) or keep deployer for the demo; record decision with Spec Writer.
3. Apply Designer items 5, 6, 8 once Fatih approves, before UI freeze Sat 09:00 WIB.
4. Get a backup RPC from Fatih/Scout and set the backup env vars (Vercel + Railway), then redeploy.
5. Rehearsal S0 target 19:14 WIB; keep buffers to the 11:30 internal submit; support final README and submission with Scout.


#### Paron Product Designer
**Identitas dan scope:** agent `Paron Product Designer` (id `02760c4f-27a5-4b75-bbea-5540f515b027`). Tugas: brand, design tokens, guidelines, audit desain, dan review UI untuk Paron. Hanya desain; tidak menulis kode produk (itu lane Principal Engineer) dan tidak mengedit spec 01-09 (itu Spec Writer; perubahan layar atau copy dikirim sebagai daftar ke Spec Writer, lalu Fatih menyetujui). Bahasa ke Fatih: Indonesia santai. Dokumen desain dan laporan audit: Inggris (keputusan Fatih 9 Okt 2026). Untuk keputusan brand, tawarkan maksimal 2 opsi plus rekomendasi.

**Keputusan Fatih yang mengikat desain (9 Okt 2026):**
- Brand v1 terkunci: forged graphite + ember accent `#F07A2A`; IBM Plex Sans untuk UI dan IBM Plex Mono untuk angka. Token boleh diubah kalau audit menemukan yang lebih baik.
- Semua footer dan teks "not affiliated" dihapus dari UI produk (disclaimer pindah ke pitch deck). Pengganti: `UtilityBar` (Docs, API, GitHub; catatan testnet; Build, Chain, Block), APPROVED di D-64 dan D-65.
- Guardrail lain tetap: tidak ada logo atau gaya Robinhood, tidak memakai kata "partner", tidak ada OCPI.
- Prinsip Apple dipakai untuk kerapian dan motion, bukan untuk whitespace kosong (konten Paron padat data).
- `design.md` baru masuk repo kalau Fatih bilang "masukkan design.md".
- Teks syncing `/markets` (D-66) APPROVED dan sudah live (PR #31): netral "Indexer is syncing. Series will appear shortly.", 3 skeleton, "N series." disembunyikan saat syncing, merah hanya untuk error selain 503 INDEXER_SYNCING.

**Lokasi file (semua di `/workspace/paron-design/`):**
- `brand.md` (identitas brand v1, voice, warna, tipografi, guardrail), `guidelines.md` (layout dan komponen), `research.md` (riset tren, dengan sumber).
- `tokens.css` dan `theme.css` (v1, Tailwind v4 `@theme`), `tokens.v2.css` dan `theme.v2.css` (v2: tinggi baris 32/24, tracking overline 0.06em, token chart, skeleton, utilbar), `audit/tokens-v2-diff.md` (selisih v1 ke v2). Status: v1 approved; v2 DRAFTED dan belum dipastikan sudah dipakai di repo (cek `web/app/globals.css`).
- `design.md` (aturan visual untuk repo, DRAFTED, belum di repo), `contrast-report.md` dan `scripts/contrast.py` (laporan kontras WCAG token), `preview.html` dan `preview.png` serta `preview.v2.*`, `logo/` (SVG wordmark dan mark).
- `audit/01-benchmark.md`, `02-design-language.md`, `03-existing-audit.md`, `04-actions.md` (daftar aksi H1-H7, M1-M8, L1-L4 plus spec komponen S3 series, redemption, markets table, utility bar), `audit/screens/` (screenshot, termasuk `live-*.png` hasil review live 9 Okt 14:00 WIB).
- `spec-change-requests.md` (daftar usulan ke Spec Writer, nomor 1-13).

**Status temuan (dua penomoran berbeda, jangan dicampur):**
Penomoran A: `spec-change-requests.md` #1-#13 (dari audit). Status per yang kuketahui: #6 dan #7 (hapus disclaimer, ganti UtilityBar) sudah dijalankan. #5 diselesaikan oleh Spec Writer. Yang masih PENDING menunggu Fatih: #9 series page satu viewport, #10 ringkasan S4 redemption (payout 36px mono), #11 Connect wallet jadi secondary, #12 tabel mobile tanpa horizontal scroll, #13 banner dev-only tidak tampil di build produksi. Status #1-#4 dan #8 (chain chip, legend bond, H1 landing, gaya tombol Decline & pay) harus dicek ke `07-decisions-log.md` sebelum dianggap final.
Penomoran B: temuan review UI live (di chat, saya beri label LR-1 sampai LR-8):
- LR-1 error SSL console (`https://rpc.testnet.chain.robinhood.com/`, `ERR_SSL_UNRECOGNIZED_NAME_ALERT`, 4x di /markets dan 8x di /portfolio): ditangani PE lewat hardening RPC. RPC publik intermiten untuk sebagian koneksi browser; sebabnya juga notif MetaMask Fatih.
- LR-2 Block di UtilityBar masih "—": SELESAI (PR #33, angka dari `indexed_block` `/v1/health`).
- LR-3 skeleton dan teks merah syncing di /markets: SELESAI lewat D-66 (PR #31). Verifikasi visual skeleton belum kulakukan karena load terlalu cepat.
- LR-4 teks "Testnet demo: tokens have no monetary value." di footer: APPROVED (D-65), bukan disclaimer.
- LR-7 `/demo` memakai fixture `CU-JKT-H100-2610`: sesuai spec (D-19, series panggung), tidak perlu diubah.
- LR-5 layout detail series `/markets/1` (celah kosong besar antara Prints/Book dan Market/Bond, metadata "ID · window 2026-11" tanpa nilai ID, teks "Verified by Paron demo verifier" wrap jelek, link Redeem berwarna biru bukan ember): PENDING Fatih. Nomor ini beririsan dengan #9 (series page satu viewport); disarankan digabung.
- LR-6 kontras teks kecil (footer, label "Spot reference", header tabel, helper text) tampak sekitar 3:1 atau kurang: PENDING Fatih, belum diukur. Target minimal 4.5:1 lewat token tersier.
- LR-8 label tab Provider (`requests`, `series`, `bond`, `agent`) huruf kecil tanpa styling: PENDING Fatih.
Cara memilih: Fatih cukup menyebut nomor, misalnya "setuju #9-#13" atau "setuju LR-5,6,8". Setelah dipilih, Spec Writer mencatat sebagai D-67 dan seterusnya.

**Blocker dan hal yang belum kuverifikasi:** (1) rasio kontras live belum diukur (hanya perkiraan mata). (2) Skeleton D-66 belum diverifikasi visual (butuh throttle jaringan atau menangkap saat 503). (3) Pemakaian `tokens.v2.css` di repo belum dicek. (4) Tidak ada akses tulis ke repo dari sisi Designer; semua perubahan UI lewat Principal Engineer.

**Tugas pertama sesi baru (urut):**
1. Tanyakan atau baca keputusan Fatih untuk #9-#13 dan LR-5, LR-6, LR-8; kirim copy dan spesifikasi persisnya ke Spec Writer (komponen sudah ada di `audit/04-actions.md`, bagian "Key component specs").
2. Ukur kontras live dengan `scripts/contrast.py` terhadap warna yang benar-benar dipakai di `paron.vercel.app` (footer, helper, header tabel) dan kirim angka ke Spec Writer dan Principal Engineer.
3. Verifikasi visual D-66 dan UtilityBar di semua halaman dengan screenshot baru ke `audit/screens/`; catat sisa bug layout (terutama `/markets/1`).
4. Kalau Fatih bilang "masukkan design.md": kirim `design.md` ke Principal Engineer untuk dibuat PR; jangan masukkan sebelum itu.
5. Review mobile (viewport 390) untuk `/` dan `/markets` setelah #12, karena juri sering membuka di ponsel.

### 1.x dr eggbot (bot designer, group member)

**Identity and scope.** dr eggbot designs and creates Grok Bots for Fatih (short intake, then CreateAgent, one job per bot, explicit anti-jobs, casual Indonesian voice). In the ETHJKT group it acts ONLY when Fatih explicitly asks (his rule: "jangan lakuin apa apa kecuali gw suruh"). It writes no code, makes no product decisions, and does no hosting.

**Bots created for Paron (all in the ETHJKT group, id 2a9c57e5-87fb-4321-8227-3237d377dd87):**
- Hackathon Scout 9eea0cc5-758c-416d-ae26-3b08525b1d44 (master, product knowledge, hosting on Vercel/Railway)
- Paron Spec Writer b1cd1647-d9ab-4378-b41a-58e760a83941 (dev docs 01-09, decisions log 07)
- Paron Principal Engineer c031279a-8599-4ad6-b9ba-4719cdb2800d (build via cloud agents, deploys from its own computer, merges PRs when tests are green)
- Paron Product Designer 02760c4f-27a5-4b75-bbea-5540f515b027 (files in /workspace/paron-design/)

**Standing rules from Fatih (keep in the new session):** secrets only via 1:1 secret-request, never in group; testnet only; commits in Fatih's name; README credits Grok Bot; footer "not affiliated" removed (D-64); UtilityBar approved (D-65); healthcheck routines stay paused.

**Next in new session:** wait for Fatih's instruction; if he asks for a new bot or a role change, create/update it and add it to the group. Nothing is pending from dr eggbot.
