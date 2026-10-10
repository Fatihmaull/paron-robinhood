# Paron: layar, wireframe, dan copy UI (dev doc 06)

Status: **APPROVED-SYNCED, spec saja.** Keputusan 07 dan P6-xx disetujui Fatih (Jum 9 Okt 2026 ~09:40 WIB), termasuk P6-01 (copy UI bahasa Inggris), X6-19 (ikut tier solo S0–S3 sitemap §9.1) dan tab leverage "Coming soon". Disinkronkan Jum 9 Okt ~10:30 WIB dengan view baru 01 (`bounds()`, `allowedArbitrators()`, `seriesCount()`). Cadangan: `.bak-2026-10-09-pre-approval/`. Isinya wireframe teks (kotak ASCII), tabel copy UI, sumber data, dan aturan aksi. Tidak ada JSX, CSS, atau kode. Frontend baru dibangun mulai **Jumat 9 Okt 09:00 WIB**. Disusun Kamis 8 Okt 2026, ~21:35 WIB. Diperbarui ~21:45 WIB: peta route §0.5 diselaraskan dengan `paron-sitemap.md` (§17 X6-14..X6-20). **Diperbarui Jum 9 Okt ~13:30 WIB (cadangan `.bak-2026-10-09-pre-1331/`):** D-60..D-63 (ChainBadge "Robinhood Chain Testnet", legenda bond bar, H1 landing, "Decline & pay" outline) dan D-64 (footer + teks "not affiliated" dihapus dari produk) APPROVED Fatih di grup; diterapkan di §0.2, §0.5, §1.1, §4.6, §5.7, §6.3, §12, §17.

**Catatan audit Jum 9 Okt 2026 ~11:08 WIB (audit Principal Engineer; cadangan `.bak-2026-10-09-pre-audit/`):**
- **APPROVED ~11:05 WIB (07 §10.4):** D-54 (`/verifier` memakai `W-VERIFIER` EOA, `/admin` jadwal dari `W-ADMIN` dan execute dari wallet mana pun; keduanya tx wagmi biasa, tanpa Safe protocol-kit); PG-2 **DITOLAK** (`/demo` tanpa jalur sandbox, §0.5); D-59 (urutan bangun = 4 lane di 08 §1).
- **APPROVED ~11:12 WIB (07 §10.5), kini spec (tag `[D-xx]`):** D-45 (`NotProviderRole`), D-47 (Decline & pay hilang setelah deadline), D-48 (aturan jam tunggal §10), D-52 (`InvalidLot`, input qty kelipatan 1 CU), D-55b (`StaleAttestation`), D-58 (fallback §11.2 S0-kritis).

**Changelog Jum 9 Okt 2026 ~11:17 WIB:** konversi usulan → spec. Digantikan: §10 butir 1, 5, 6 (countdown dari waktu blok + ekstrapolasi, tombol menunggu blok) → aturan jam tunggal `meta.server_now_ms` + 2 dtk (D-48); baris `DECLINE_AND_PAY` "setelah deadline juga diizinkan" (D-47). T0 = 11:14 WIB, jadi batas fallback §11.2 = 19:14 WIB. Cadangan: `.bak-2026-10-09-pre-1112/`.

**Sumber:**
- dokumen kanonik: `paron-design.md` **(design §x)**, terutama §7.2 daftar layar S1–S7, §7.4 naskah demo, §6 dan §11.5 footnote, §10.5 label referensi; `paron-product-knowledge.md` **(PK §x)**, terutama §6 fitur per aktor dan §10.3 guardrail; `paron-stack.md` **(stack §x)**, terutama §3.5 footnote dan §4.3 frontend; `notes.md`; `paron-sitemap.md` **(sitemap §x)** untuk route (§0.5);
- konsistensi dengan **01** (fungsi, error kustom, state machine §6.8), **02** (acceptance), **03** (endpoint E1–E18, field, aturan detik P3-33, fallback P3-12), **04** (env web, manifest, mode `mock|live`), **05** (naskah ter-retime §2.3, layar per wallet §2.4, countdown P5-16, fallback P5-23) dan **07** (D-01..D-44 APPROVED Jum 9 Okt ~09:40 WIB; D-54/D-57/D-59 APPROVED ~11:05 WIB; D-45..D-53, D-55, D-56, D-58 PENDING, 07 §11).

**Legenda:**
- **[D-xx]** = keputusan 07, **APPROVED** (Jum 9 Okt 2026 ~09:40 WIB, Fatih). **[APPROVED P6-xx]** = usulan dokumen ini, disetujui (sebelumnya `[PENDING P6-xx]`). **[TBD T6-xx]** = belum ada rekomendasi.
- **Tier build = sitemap §9.1 (solo S0–S3)**, bukan kolom MUST/NICE saja (X6-19 APPROVED). Urutan jam per jam: `08-team-tasks.md`.
- **MUST / NICE** mengikuti design §7.1 dan §10.4. S6 dan S7 = NICE (design §7.2); sitemap §9 menaruhnya di Tier 2 / Tier 1 (lihat §17 X6-19).
- Teks di dalam tanda kutip pada tabel copy = **copy UI persis** (bahasa Inggris, lihat §0.1). Placeholder ditulis `{nama}`.
- Semua angka contoh = CONTOH DATA dari naskah 05 (series panggung 4 `CU-JKT-H100-2610`). **[D-82, diperjelas oleh D-92, APPROVED 2026-10-09 18:10 WIB]** Simbol `2610` pada contoh layar adalah series panggung/demo (series 4), bukan catatan historis. Seed series 1 tetap `CU-JKT-H100-2611`. Preset wizard PR #53 masih mengisi `2611`; handler menggantinya ke `2610` di PR UI mendatang. Rekaman memakai putaran baru di series 4.
- Wireframe = desktop 1440 px kecuali disebut mobile. Hanya tata letak, bukan desain visual (tema gelap "terminal", stack §4.3).

---

## Daftar isi

0. Keputusan global (bahasa, disclaimer, format angka, waktu, route, penyesuaian UI Designer §0.6)
1. Shell global: header, utility bar, wallet connect, jaringan, faucet, KYB gate, attestation drawer, banner sync
2. S1 Market (+ strip indeks vs referensi)
3. S2 List capacity (wizard forge 3 langkah)
4. S3 Series page (buy modal, order form, order book, tape, bond, terms, reputasi)
5. S4 Portfolio & redemptions (redeem modal, timeline, confirm, dispute, claim default) + S4-R detail publik dan layout HP juri
6. S5 Provider console (ack, mark delivered, decline & pay, bond, proceeds, withdraw)
7. V-STMT Statement dan ekspor CSV
8. S6 Prints & index (NICE) dan S7 Arbitration (NICE, ringkas)
9. Toast transaksi dan pemetaan error revert → copy
10. Aturan countdown dan deadline (aturan detik penuh)
11. Mode data: live, fallback onchain, mock
12. Inventaris komponen
13. Matriks layar × endpoint
14. Pemetaan adegan demo 05 → layar
15. Dependensi D-xx
16. PENDING / TBD baru
17. Divergensi dari sumber

---

## 0. Keputusan global

### 0.1 Bahasa copy UI [APPROVED P6-01]

- Tidak ada pernyataan bahasa UI di `notes.md`, design, PK, atau stack (dicek: hanya ada pitch line EN + ID di design §7.6; naskah demo design §7.4 dan blok atribusi README design §7.5 berbahasa Inggris).
- **APPROVED (Jum 9 Okt ~09:40 WIB, Fatih): seluruh copy UI dalam bahasa Inggris.** Alasan: juri internasional, naskah demo dan footnote wajib sudah berbahasa Inggris, dan istilah pasar (bid/ask, default, bond) lazim dalam bahasa Inggris. Tagline bahasa Indonesia (design §7.6) dipakai di slide, bukan di app.
- Bahasa Indonesia hanya di slide/pitch (design §7.6). Nama fungsi, state, dan simbol series tetap sama.

### 0.2 Teks legal dan utility bar [APPROVED D-64, Jum 9 Okt 2026 13:30 WIB; utility bar APPROVED D-65, 13:35 WIB; menggantikan "Disclaimer not affiliated (wajib)"]

**Footer "not affiliated" dan semua teks "not affiliated" dihapus dari produk (web dan README).** Disclaimer pindah ke **pitch deck / slide saja** (05 dan 09). Keputusan Fatih di grup 13:30 WIB; ini menggantikan aturan footer di design §6, design §11.5, stack §3.5 dan PK §10.3 untuk UI produk.

| Tempat | Copy persis | Kapan |
|---|---|---|
| Utility bar (baris tipis di bawah konten, semua halaman, desktop dan mobile), kiri | "Docs · API · GitHub" | selalu |
| Utility bar, kanan | "Build {NEXT_PUBLIC_DEPLOY_LABEL} · Chain {chainId} · Block {latestBlock}" (label deployment dari env 04 §4) | selalu |
| Utility bar, catatan testnet | "Deployed on Robinhood Chain Testnet. Testnet demo: tokens have no monetary value." | kalau `NEXT_PUBLIC_CHAIN_ID` = 46630 |
| Sama, varian cadangan | "Deployed on Arbitrum Sepolia (fallback). Testnet demo: tokens have no monetary value." | kalau chain cadangan (04 §3) |
| Label garis referensi (S1 strip, S3, S6) | "Spot reference (synthetic demo data)" | setiap kali nilai `ReferenceFeed` tampil (design §10.5 #2, 03 E15 `label`) |

Guardrail copy (tetap berlaku, PK §10.3 bagian wording):
- Pakai kata "Deployed on Robinhood Chain Testnet". **Jangan** "built for", "backed by", "partnered with", "powered by", atau "partner". Jangan memakai logo Robinhood atau logo pihak lain. Jangan menulis kata "feeds".
- **Jangan** menampilkan OCPI atau angka Ornn di app (lisensi, design §10.5 / D-06). Ornn tidak disebut di layar mana pun.
- **Jangan** ada teks "not affiliated" atau "endorsed by" di app maupun README; footnote itu hanya di pitch deck dan slide yang menyebut pihak lain.
- Jangan menampilkan Stock Tokens atau aset lain dari chain.
- Verifier disebut "Paron demo verifier" [D-04], bukan auditor pihak ketiga.

### 0.3 Format angka [APPROVED P6-02]

| Besaran | Aturan tampil | Contoh |
|---|---|---|
| Harga per CU | `$` + 2 desimal (tick 0.01, 01 §6.7) | "$3.20/CU" |
| Harga native per jam GPU | `$` + 2 desimal, dihitung `cu_price × factor / 1e4` (03 `native_primary_price`) | "$5.69/H200-hour" |
| Nominal USDC | `$` + 2 desimal; kalau nilai punya digit ≠ 0 di desimal 3–6, tampilkan sampai digit terakhir (maks 6) | "$60.00", "$16.024", "$0.60" |
| CU | bilangan bulat tanpa desimal kalau bulat; selain itu 2 desimal (01 §1: UI 2 desimal) | "20 CU", "2.50 CU" |
| Faktor | 2 desimal + "×" | "1.40×" |
| Persentase bond / coverage | 2 desimal + "×", atau persen bulat untuk badge | "1.50×", "200% backed" |
| Alamat | `0x` + 4 + "…" + 4, klik = salin, ikon = explorer | "0x2222…2222" |
| Tx hash | sama, link ke `explorer_url` dari API | "0xc2c2…c2c2" |

Sumber angka selalu string desimal dari API (03 §1) atau nilai onchain yang diskalakan (USDC 6 desimal, CU 18 desimal; 01 §1). UI tidak melakukan aritmetika float untuk nilai uang; pembulatan hanya saat tampil.

### 0.4 Waktu

- Timestamp absolut: waktu lokal browser + singkatan zona, tooltip = ISO UTC dari `ts_iso`. Contoh: "10:00:40 WIB" dengan tooltip "2026-10-10T03:00:40Z".
- Timestamp relatif di tabel: "12s ago", "3m ago".
- Countdown: lihat §10 (sumber waktu = timestamp blok, bukan jam laptop; P5-16).

### 0.5 Route dan peta layar [APPROVED P6-03]

Diselaraskan dengan `paron-sitemap.md` **(sitemap §x)** pada Kamis 8 Okt 2026, ~21:45 WIB (log di §17 X6-14..X6-20). Nama route mengikuti sitemap §4/§5; `{param}` di dokumen ini = `[param]` di sitemap. Untuk 27 jam, banyak route dirender sebagai **tab** atau deep link ke komponen yang sama (sitemap §9 Tier 0). Kolom MUST/NICE mengikuti design §7.1/§7.2; tag sitemap ditulis terpisah kalau berbeda.

| Route (sitemap) | Layar / sub-view 06 | Aktor | MUST/NICE | Catatan |
|---|---|---|---|---|
| `/` | landing: H1, subjudul, strip indeks (§1.1), 3 series teratas, CTA | semua | MUST | sitemap §4.1; wireframe landing tidak dibuat di 06 (pakai strip + tabel S1). **[D-62]** H1 = "Where compute is forged into one standard."; subjudul di bawahnya = subjudul S1 ("Physical GPU compute, sold forward. 1 CU = 1 H100-equivalent GPU-hour. Every CU is bonded."); lalu strip indeks, tabel 3 series teratas, tombol "List capacity". Tidak ada wireframe baru |
| `/markets` | S1 Market (§2) | semua (tanpa wallet pun bisa lihat) | MUST | dulu `/` di 06 |
| `/markets/{seriesId}` | S3 Series page (§4), tab Overview | semua | MUST | dulu `/series/{seriesId}`; buy box + order form tetap di satu layar desktop |
| `/buy/{seriesId}` | S3 dengan buy box (§4.3, M-BUY) terfokus | KYB untuk beli | MUST | deep link ke S3 tab Buy (sitemap §9 Tier 0) |
| `/trade/{seriesId}` | S3 dengan order form + order book (§4.4) terfokus | KYB untuk order | MUST | deep link ke S3 tab Trade; layout exchange penuh (chart, depth) = scope sitemap, belum di-wireframe 06 [APPROVED P6-23] |
| `/provider/series/new` | S2 List capacity (§3) | provider terdaftar (`isListable`) | MUST | dulu `/list` |
| `/portfolio` | S4 Portfolio & redemptions (§5), tab Holdings / Redemptions / Claims / Statement | wallet terhubung (holder) | MUST | sitemap §9 Tier 0 |
| `/redemptions` | S4 tab Redemptions | holder | MUST | |
| `/redemptions/new?series={seriesId}` | M-REDEEM (§5.3) sebagai halaman; dari S4 tetap terbuka sebagai modal | holder | MUST | dulu `/portfolio?series={id}&redeem=1` |
| `/redemptions/{reqId}` | S4-R detail request publik (§5.7, dipakai HP juri) | siapa saja | MUST (05 §2.4 "S4 publik") | sama dengan sitemap `/redemptions/[id]` |
| `/claims` | S4 tab Claims: request DEFAULTABLE + M-CLAIM (§5.6) | siapa saja (wallet) | MUST | sitemap: boleh tab di `/redemptions` |
| `/disputes/new?req={reqId}` | M-DISPUTE (§5.5) sebagai halaman | holder request | MUST | dari R-CARD tetap modal |
| `/disputes/{reqId}` | R-CARD state DISPUTED + tombol `RESOLVE` (§5.4) | siapa saja | MUST | id dispute = `reqId` (01 §6.9 `getDispute(reqId)`) |
| `/statements?address={addr}` | V-STMT statement + ekspor (§7) | pemilik wallet, auditor | JSON MUST, CSV NICE (PK §6.6) | dulu `/account/{addr}/statement`; tanpa `address` = wallet sendiri [APPROVED P6-24 nama param] |
| `/provider` | S5 Provider console (§6) | provider | MUST | tab Requests / Series / Bond / Agent (sitemap §9 Tier 0) |
| `/provider/redemptions/{reqId}` | M-ACK / M-DELIVER / M-DECLINE (§6) sebagai halaman | provider series | MUST | dari S5 tetap modal |
| `/provider/series/{seriesId}` | S5 baris series: Raise price, Finalize series (§6) | provider pemilik; finalize = siapa saja | Finalize MUST [D-14]; Raise price NICE [APPROVED P6-17] (sitemap: MVP-27h) | |
| `/provider/bond` | S5 panel bond + Withdraw remaining (§6) | provider | MUST | |
| `/provider/agent` | status agent + toggle kill switch | provider | sitemap: MVP-27h (kill switch = MUST design §7.1); solo: tab Agent di `/provider`, tier S1 | belum di-wireframe; kanal kendali [D-42] APPROVED: endpoint lokal `NEXT_PUBLIC_AGENT_URL` + EIP-712 `AgentCommand`, fallback env/jendela agent |
| `/onboarding/kyb`, `/onboarding/provider` | target link M-KYB (§1.4): form pengajuan + "Register as provider" | wallet / KYB | sitemap: MVP-27h | penyimpanan pengajuan [D-41]; form belum di-wireframe 06 |
| `/connect` | M-WALLET (§1.2) | semua | MUST | route membuka modal yang sama |
| `/faucet` | komponen faucet menu wallet (§1.2) sebagai halaman | wallet | MUST | |
| `/h100-index` | S6 bagian indeks (§8.1) | publik | NICE (design §7.2); sitemap: index page MVP-27h Tier 2 | dulu `/prints`. Path statis `/index` bentrok dengan `/` di Vercel, jadi halaman ini `/h100-index`. `/index` mengalihkan 307 (`web/next.config.ts`, `permanent: false`). Path API `/index/H100` tidak berubah (indexer `GET /v1/index/:gpu`) |
| `/data` | S6 bagian tabel prints + CSV + contoh `curl` (§8.1) | publik, analis | NICE (design §7.2); sitemap: MVP-27h Tier 2 | dulu `/prints` |
| `/transparency` | S6 bagian delivery record (§8.1) | publik | NICE (design §7.2); sitemap: MVP-27h Tier 2 | dulu `/prints` |
| `/arbiter`, `/arbiter/cases/{reqId}`, `/arbiter/history` | S7 Arbitration view (§8.2) | panel; publik read-only | NICE (design §7.2); sitemap: MVP-27h Tier 1 | dulu `/arbitration`; pengumpulan tanda tangan [D-43] |
| `/legal/disclaimer`, `/legal/risk` | target link utility bar (§0.2) | publik | NICE | isi statis: testnet, token tanpa nilai uang, bukan saran keuangan; **tanpa** teks "not affiliated" [D-64] |
| `/trade/leverage` | tab "Leverage" berlabel **Coming soon** (roadmap), tanpa form dan tanpa tx | publik | APPROVED Jum 9 Okt (sitemap S-8; tier solo S2, ~15 menit) | copy persis: "Leverage: coming soon." / "Leveraged exposure to compute is on the roadmap. Nothing here is live on testnet." Tidak ada angka, harga, atau tombol aksi |

**Route sitemap yang tidak di-wireframe di 06** (spesifikasi tujuan, gate, fungsi, dan state ada di sitemap §4; 06 hanya menyediakan aturan global §0–§1, §9–§11 yang berlaku juga untuk halaman ini): `/how-it-works`, `/providers`, `/providers/{providerId}`, `/transparency/{seriesId}`, `/docs`, `/docs/methodology`, `/docs/contracts`, `/legal/terms`, `/status`, `/onboarding`, `/account`, `/account/notifications`, `/account/api-keys`, `/buy`, `/disputes`, `/trade`, `/trade/orders`, `/trade/history`, `/trade/positions`, `/trade/leverage`, `/provider/series`, `/provider/redemptions`, `/provider/disputes`, `/provider/payouts`, `/provider/team`, semua `/verifier/*`, semua `/admin/*`, `/ops`, `/ops/keepers`, `/ops/events`, `/demo`.

**[APPROVED D-54, Jum 9 Okt ~11:05 WIB, hackathon saja]** `/verifier` (terbit/cabut KYB live) ditandatangani `W-VERIFIER` (EOA) dengan label "Paron demo verifier (team-operated)"; `/admin` menjadwalkan `setFactor` dari `W-ADMIN` (atau Safe) dan tombol Execute boleh ditekan wallet mana pun (executor Timelock terbuka). Tidak ada integrasi Safe protocol-kit di frontend. **PG-2 DITOLAK (Fatih, Jum 9 Okt ~11:05 WIB):** `/demo` tidak punya jalur sandbox; isinya hanya naskah adegan + tautan ke layar live. **[D-92, APPROVED 18:10 WIB]** Checklist `/demo` memakai series panggung `CU-JKT-H100-2610` (series 4). Seed di Markets tetap `CU-JKT-H100-2611` (series 1). Rekaman memakai putaran baru di series 4.

Layar admin, verifier, dan keeper **ada** di produk: sitemap §1 prinsip 1 ("setiap aksi setiap aktor punya UI") dan §8 checklist anti-mock menggantikan catatan lama 06 "aksi admin lewat Safe/script". Script tetap boleh sebagai otomasi tambahan. Auditor memakai `/statements` dan `/data` (PK §6.6).


### 0.6 Penyesuaian UI Designer [APPROVED D-67..D-74, Jum 9 Okt 2026 14:40 WIB, Fatih]

Visual dan layout saja; alur, route, dan perilaku kontrak/API tidak berubah. Sumber teknis: `docs/design/approved-ui-changes.md`, `audit/04-actions.md`, `tokens.v2.css`, `design.md` terbaru. Wireframe ASCII di bawah tetap dipakai sebagai urutan isi; tata letak akhir mengikuti daftar ini.

| Layar | Aturan akhir | D-xx |
|---|---|---|
| S3 `/markets/{seriesId}` (§4.1, §4.4, §4.5, §4.9) | Terminal satu viewport: header + stats ribbon; grid 12 kolom (chart + tape 1-6, book 7-9, ticket 10-12); tab Bond, Terms, Redemptions, Reputation di bawah; <1280 px: ticket, chart, book, tab; <860 px satu kolom; tanpa celah kosong; metadata "ID {id} · window {yyyy-mm}" (token ID hilang kalau id kosong); pill Verified `nowrap`; link Redeem ember atau netral, tidak biru; book kosong "No orders. Place the first bid."; tape kosong "No prints yet." | D-67 |
| S4-R detail redemption (§5.7) | Kartu ringkasan: jumlah state 36 px mono, fakta kunci (CU, holder, provider, deadline), satu baris aksi (Claim default berisi merah, 56 px di mobile); timeline kanan tetap; "Default paid. $45.00 sent to 0x2222...2222." = teks terbesar | D-68 |
| Header (§1.1, §12) | "Connect wallet" sekunder (`--btn-chrome-*`); ember hanya untuk satu aksi primer per halaman; pemilih snapshot netral | D-69 |
| `/`, `/markets`, `/markets/{seriesId}` mobile (§2.3, §4.9) | Tabel dalam `.table-scroll`; tanpa scroll horizontal halaman di 390 px. "Tombol Menu tidak tampil >860 px" **HISTORICAL** untuk header dengan wallet tersambung: Menu muncul saat tautan tidak muat (§0.7, PRs #64) | D-70 |
| Banner dev (§1.6, §11.3) | Banner mock + pemilih snapshot hanya saat `NEXT_PUBLIC_DATA_SOURCE=mock` dan bukan build produksi | D-71 |
| Teks kecil (semua layar) | Tidak ada opacity pada teks; minimum `--color-text-tertiary`; kontras ≥ 4.5:1 untuk teks ≤ 13 px | D-72 |
| S5 tab (§6.1, §6.5) | "Requests", "Series", "Bond", "Agent": Title Case, 13 px medium, aktif bergaris bawah ember, target 44 px di mobile | D-73 |
| Token (§0.2, §2.2) | `tokens.v2.css`; baris tabel Markets 32 px dengan pill sebaris; `<title>` per route; skip link | D-74 |

Catatan: label tab "requests / series / bond / agent" huruf kecil di wireframe §6.1 adalah tata letak lama; teks di UI memakai Title Case (D-73).

**[D-75..D-80, APPROVED ~15:34 WIB, 07 §16]** P1–P6: banner syncing hanya jika `synced:false` atau lag > 20 blok, warna info (D-75); kalimat banner yang live = D-84; skeleton pulse opacity, "0 series." tetap tersembunyi saat loading (D-76); tab Leverage di `/markets/[id]` berlabel "Coming soon", tanpa aksi (D-77); tiket Buy hanya copy produk (D-78); uang `$3,240.00`, max cost 2 desimal (D-79); beranda dipadatkan, mobile 390 px, connect wallet satu baris (D-80).

**[D-81, APPROVED Fatih langsung 2026-10-09 17:01 WIB]** Guard CI grep `affiliated|endorsed by` (butir D-74) dibatalkan. Tidak ada grep itu di CI. `copy-guard.test.ts` tidak diubah.

**[D-84, APPROVED Fatih langsung 2026-10-09 16:39 WIB]** Banner syncing, warna info. Kalimat persis: "Indexer is catching up to the latest blocks; data may lag briefly." Muncul hanya jika `synced:false` atau lag > 20 blok.

**[D-85, APPROVED sama]** Tab series mengikuti D-67 (Bond, Terms, Redemptions, Reputation). Kalau belum selesai sebelum freeze UI Sab 2026-10-10 09:00 WIB, tab lama (Overview, Buy, Trade, Leverage) tetap, dan sisa itu dicatat di sini. Pada `main` `93f8e60` tab halaman series masih Overview, Buy, Trade, Leverage. Syarat jam 09:00 itu [SUPERSEDED D-90]. PR #51 sudah di `main` (belum live di web).

**[D-86, APPROVED sama]** `/redemptions/1` dan `/disputes/1` saat request tidak ada: "Request not found."

**[D-87, APPROVED sama]** Pita data demo sintetis tetap. Teks: "Reference price (demo data)".

**[D-89, APPROVED handler]** Kegagalan RPC publik = teks redup, bukan error merah. Jeda ulang 400 ms, 800 ms, 1600 ms.

### 0.7 D-94, D-95, header, dan kredit chart (Sab 10 Okt 2026)

**[D-94, APPROVED]** Jalur demo `/buy`, `/trade`, dan `/redemptions` punya state kosong dan state error. Status transaksi terlihat: pending, success, failed, dengan tautan explorer. Perbaikan kecil S2: skip link, tinggi input, tab yang terpotong di 390, badge Pending berwarna amber, alamat provider dipendekkan di `/markets/4`. Format uang `$3,240.00`. Label seragam "Demo data" tidak mengganti kalimat pita "Reference price (demo data)" (D-87); D-95 mempertahankan kalimat itu sampai Fatih menyetujui pengganti. h1 halaman provider = "Provider", alamat di bawahnya, pada `/provider/[address]` (D-95). `/arbiter` dan tombol Revoke di `/verifier` hanya kalau tidak perlu perubahan kontrak. Yang butuh perubahan kontrak dilaporkan ke Fatih lebih dulu.

**[D-95, APPROVED ~11:07 WIB]** Navbar pengguna (CTA landing "Launch app") hanya: Markets, Buy, Trade, Portfolio, Redemptions, Faucet, Index, Data. Tidak ada tautan Provider, Operator, atau Demo di navbar itu. Provider adalah tautan terpisah. Dashboard di `/provider/[address]` (series, redemptions, agents; tulis hanya untuk wallet pemilik; alamat lain read-only). `/provider` mengalihkan ke dashboard wallet yang tersambung, atau ke `/onboarding/kyb` kalau belum terverifikasi KYB. CTA landing: "Launch app", "Become a provider". Operator (verifier, admin, ops, arbiter) hanya lewat CTA kecil di footer atau bagian bawah landing, judul "Operator tools", tidak di navbar. `/demo` tetap hidup; satu-satunya pintu adalah "Launch demo". Dashboard produksi hanya indexer sungguhan dan data on-chain testnet. Tautan pengguna di tengah. "For providers" dan "Operator" adalah teks sekunder `#a6a6a6` (Operator = CTA footer/bawah, bukan item navbar). Menu mobile: Trade / Providers / Operators, target minimal 44 px. Banner KYB di `/provider`: info netral untuk belum KYB dan pending, dengan "Start KYB"; amber untuk verified. "List capacity" nonaktif, alasan tertulis "Complete KYB to list capacity".

**Header (PRs #64).** Dengan wallet tersambung, alamat di header memakai `0x3F8f…6ae9`: 6 karakter pertama termasuk `0x`, 4 karakter terakhir. Cek di 1024, 1100, 1280, 1440, dan 390. Nav tidak terpotong. Tombol Menu muncul saat tautan tidak muat. Setiap kontrol header minimal 44 px. Kalimat D-70 "tombol Menu tidak tampil >860 px" tetap untuk kasus tautan yang muat; untuk header dengan wallet tersambung, aturan Menu-saat-tidak-muat yang dipakai.

**Kredit chart.** Logo TradingView dimatikan lewat opsi library `attributionLogo: false` di `web/components/charts.tsx`. Kredit lisensi berupa teks polos ada di `/legal/risk` (`web/app/legal/risk/page.tsx`). Larangan logo pihak ketiga dan larangan tautan pihak ketiga tetap, dengan pengecualian kredit lisensi ini saja.

---

## 1. Shell global

### 1.1 Wireframe header + utility bar (desktop)

```text
+------------------------------------------------------------------------------------------------+
| PARON  Markets  Buy  Trade  Portfolio  Provider  Index  Data  Demo      [Robinhood Chain Testnet ●] [Connect]|
+------------------------------------------------------------------------------------------------+
| H100 index  OK  $3.20/CU  · 2 entities · 5 CU/24h  |  Reference price (demo data) $3.00|
+------------------------------------------------------------------------------------------------+
| [banner slot: wrong network / indexer syncing / live data unavailable / not verified]           |
+------------------------------------------------------------------------------------------------+
|                                                                                                |
|                                  ... konten layar ...                                          |
|                                                                                                |
+------------------------------------------------------------------------------------------------+
| Deployed on Robinhood Chain Testnet. Testnet demo: tokens have no monetary value.              |
| Docs · API · GitHub                              Build stage-1 · Chain 46630 · Block 130100245 |
+------------------------------------------------------------------------------------------------+
```

- Strip indeks di bawah nav tampil di semua halaman (design §7.2 S1 "PrintIndex vs reference strip"; dipakai juga sebagai bukti "PrintIndex ticks" di S3). Isi: satu GPU yang relevan (S1 = H100 default, S3 = GPU series itu). Data E2 `status`, `value`, `participants`, `eligible_volume_cu`; referensi E15 `value` + label. Fallback onchain: `PrintIndex.statusOf` + `latestRoundData`, `ReferenceFeed.latestRoundData` + `label()`.
- **[HISTORICAL sejak D-95]** Menu nav pada wireframe dan kalimat ini: Markets → `/markets`, Buy → `/buy`, Trade → `/trade`, Portfolio → `/portfolio`, Provider → `/provider`, Index → `/h100-index`, Data → `/data`, Demo → `/demo`, plus tautan role di menu wallet. Navbar yang berlaku ada di §0.7. Index tetap `/h100-index`.
- Menu "Provider" hanya tampil kalau wallet terhubung adalah provider terdaftar (E12 200) atau punya role 1 (E13 `role.code` = 1) [D-24]. Kalimat syarat tampil di navbar pengguna itu **HISTORICAL** sejak D-95: Provider tidak ada di navbar pengguna. Syarat tulis vs baca ada di dashboard `/provider/[address]`.

**Copy strip indeks**

| Kondisi (E2 `status`) | Copy |
|---|---|
| `OK` | "{GPU} index · OK · ${value}/CU · {participants} entities · {eligible_volume_cu} CU/24h" |
| `THIN`, belum pernah OK (`value` null) | "{GPU} index · THIN · no eligible prints yet" |
| `THIN`, carry-forward | "{GPU} index · THIN · last OK ${value}/CU ({lastOkAgo})" |
| `DISRUPTED` | "{GPU} index · DISRUPTED · do not use for settlement" |
| referensi ada (E15 200) | "Spot reference (synthetic demo data) ${value}" |
| referensi tidak ada (E15 404) | sembunyikan bagian kanan strip |
| tooltip ikon info | "Index = volume-weighted price of eligible trades between two different verified entities. Method: METHODOLOGY.md." [D-15] [D-16] |

### 1.2 Wallet connect (M-WALLET)

- Komponen: RainbowKit `ConnectButton` + modal bawaan (stack §4.3; 04 §2 RainbowKit 2.2.11). WalletConnect butuh `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` [TBD T4-04]. Cara HP juri terhubung = [TBD T5-03].
- Setelah terhubung, tombol menjadi chip: "{badge} 0x3F8f…6ae9 · $985.00 USDC". Bentuk alamat di header: 6 karakter pertama termasuk `0x`, lalu elipsis, lalu 4 karakter terakhir (contoh `0x3F8f…6ae9`). Placeholder lama `0x2222…2222` mengikuti potongan yang sama dan **HISTORICAL** sebagai contoh header. Cek header di 1024, 1100, 1280, 1440, dan 390 dengan wallet tersambung (§0.7, PRs #64).

```text
+---------------------------------------------+
| 0x2222…2222                    [Disconnect] |
| ✓ Verified by Paron demo verifier           |   <- atau "Not verified" (abu-abu)
| Entity 0xe2e2…e2e2 · Buyer · ID             |
| USDC  $985.00            [Get test USDC]    |
| ETH   0.0421 (gas)                          |
| [View statement]   [View attestation]       |
+---------------------------------------------+
```

| Elemen | Copy | Sumber |
|---|---|---|
| Tombol awal | "Connect wallet" | RainbowKit |
| Badge verified | "Verified by Paron demo verifier" [D-04] | E13 `verified`, `source`; fallback `gate.isVerified(addr)` |
| Badge belum | "Not verified" | E13 `verified: false` (P3-35: alamat tak dikenal = 200 + false) |
| Role | "Provider" / "Buyer" / "Trader" / "Market maker" | E13 `role.name` [D-24] |
| Saldo USDC | "USDC ${balance}" | baca langsung `MockUSDC.balanceOf` (tidak ada endpoint saldo di 03) |
| Saldo gas rendah (< 0.005 ETH) [APPROVED P6-04] | "Low gas balance. Get testnet ETH: see the faucet page." (link `/faucet`, sitemap §4.10) | RPC `getBalance` |
| Tombol faucet | "Get test USDC" | `MockUSDC.faucet()` |
| Helper faucet | "Sends 5,000 test USDC. Once per hour." [D-40] | — |
| Faucet sukses | "5,000 test USDC added." | event `FaucetDrip` |
| Faucet cooldown | "Faucet cooling down. Try again at {nextAt}." | error `FaucetCooldown(nextAt)` |

### 1.3 Jaringan salah (B-NETWORK)

| Kondisi | Copy banner | Tombol |
|---|---|---|
| `chainId` wallet ≠ `NEXT_PUBLIC_CHAIN_ID` | "Your wallet is on another network. Paron runs on Robinhood Chain Testnet (46630)." | "Switch network" (wagmi `switchChain`) |
| Varian cadangan | "... Paron runs on Arbitrum Sepolia (421614) for this deployment." | sama |
| Switch ditolak | toast "Network switch cancelled. Transactions are disabled until you switch." | — |

Semua tombol tx disabled selama jaringan salah, dengan tooltip "Switch to {chainName} first".

### 1.4 KYB gate (M-KYB) [D-31] [D-23] [D-24] [D-04]

Aturan: `PrimarySale.buy` dan `OrderBook.placeOrder` mewajibkan wallet terverifikasi untuk semua series [D-31]. Listing mewajibkan provider terdaftar dan `isListable`. Aksi holder dan aksi publik **tidak** memakai gate: `requestRedemption`, `confirm`, `dispute` (cek holder saja), dan `claimDefault`, `finalizeRedemption`, `resolveNoRuling` (siapa saja, termasuk HP juri tanpa KYB; D-31, design §7.4).

Pemicu: wallet terhubung dengan E13 `verified: false` (atau `gate.isVerified` = false saat API mati) lalu membuka buy box, order form, atau `/provider/series/new`. Tombol aksi tetap terlihat tapi berlabel "Verify to buy" / "Verify to trade" / "Verify to list"; klik membuka modal.

```text
+------------------------------------------------------------+
| Verification required                                  [x] |
|                                                            |
| Buying and trading on Paron requires a verified entity     |
| (KYB attestation). In this demo, attestations are issued   |
| by the Paron demo verifier (team multisig).                |
|                                                            |
| Wallet   0x4444…4444                                       |
| Status   Not verified                                      |
|                                                            |
| You can still: view markets, claim defaults, and finalize  |
| redemptions. Those actions are open to anyone.             |
|                                                            |
| [How verification works]                       [Close]     |
+------------------------------------------------------------+
```

| Elemen | Copy |
|---|---|
| Judul | "Verification required" |
| Badan | seperti wireframe |
| Link | "How verification works" → `/onboarding/kyb` (sitemap §4.2; isi form menunggu [D-41]); sebelum halaman itu ada → README bagian KYB |
| Varian attestation kedaluwarsa (E13 `expiry_ms` < now) | "Your attestation expired on {date}. Ask the verifier to renew it." |
| Varian dicabut (E13 `revoked: true`) | "Your attestation was revoked by the verifier." |
| Varian provider belum `registerProvider` (E13 role 1, E12 404) | "You are verified as a provider but not registered yet." + tombol "Register as provider" (`ProviderRegistry.registerProvider()`) |

Tautan attestation EAS ke gate (`EASGate.linkAttestation(uid)`) dilakukan oleh seed (05 A-4); tombol "Link attestation" di UI = NICE [APPROVED P6-05: tampilkan hanya kalau E13 punya `attestation_uid` tapi `verified` false].

### 1.5 Attestation drawer (D-ATTEST)

Dibuka dari badge verified mana pun (provider di S1/S3, wallet chip). Data E13 (stack §3.3: tanpa EASScan di RH Testnet, data ini mengisi drawer).

```text
+--------------------------------------------+
| Attestation                            [x] |
| ✓ Verified by Paron demo verifier          |
| Address     0x1111…1111                    |
| Entity      0xe1e1…e1e1                    |
| Role        Provider                       |
| Country     ID                             |
| Expires     10 Oct 2027                    |
| Source      EAS                            |
| UID         0xabab…abab  [explorer]        |
| Attester    0x7777…7777                    |
| Revoked     No                             |
+--------------------------------------------+
```

Field: E13 `address`, `entity_id`, `role.name`, `country`, `expiry_ms`, `source` (`EAS`|`REGISTRY`), `attestation_uid`, `attester`, `revoked`, `explorer_url`. Kalau `source` = `REGISTRY` (fallback RegistryGate, D-23): baris UID diganti "Recorded in RegistryGate (fallback mode)".

### 1.6 Banner status data (B-DATA)

| Kondisi | Deteksi | Copy | Efek |
|---|---|---|---|
| Indexer tertinggal [D-75, D-84] | E18 `/v1/health` `synced:false` atau lag > 20 blok | "Indexer is catching up to the latest blocks; data may lag briefly." | Warna info. Data tetap dari API. Bukan error merah. State 503 di tabel `/markets` tetap D-66 (§2.2), bukan kalimat banner ini. |
| API mati | E18 gagal 2× berturut-turut / timeout 3 s | "Live data unavailable. Showing onchain reads only." | pindah ke fallback §11.2 (P5-23) |
| Mode mock | `NEXT_PUBLIC_DATA_SOURCE=mock` | "Mock data (fixtures). Transactions are disabled." | semua tombol tx disabled |
| Seri dipause | E5 `paused` | (di S3) "Sales and new orders are paused for this series. Redemptions, defaults and cancels still work." [D-32] | buy + order baru disabled |

---

## 2. S1 Market

**Tujuan.** Satu layar yang langsung menjawab "apa yang dijual, oleh siapa, dengan jaminan berapa, dan berapa harga pasarnya" (design §7.2 S1; PK §6 "Market"). **Aktor:** semua; wallet tidak wajib. **Demo:** adegan Hook 0:00–0:12 (05 §2.3): 3 series seed + strip H100 `THIN` vs referensi $3.00; setelah listing, baris ke-4 muncul.

### 2.1 Wireframe (desktop)

```text
+------------------------------------------------------------------------------------------------+
| [header + strip indeks H100, lihat §1.1]                                                        |
+------------------------------------------------------------------------------------------------+
| Market                                                                    [+ List capacity]    |
| Physical GPU compute, sold forward. 1 CU = 1 H100-equivalent GPU-hour. Every CU is bonded.      |
|                                                                                                |
| GPU [All v]  Region [All v]  Delivery month [All v]  [ ] Show finalized          4 series      |
|                                                                                                |
| Series            Provider        GPU (factor)  Region   Window     Last/CU  24h vol  Bond/CU  Coverage  Record      |
| ----------------  --------------  ------------  -------  ---------  -------  -------  -------  --------  ----------- |
| CU-JKT-H100-2610  ✓ 0x1111…1111   H100 1.00×    ID       Oct 2026   $3.20    $16.00   $4.50    1.50×     0 / 0 / 0   |
| CU-JKT-H100-2611  ✓ 0x1111…1111   H100 1.00×    ID       Nov 2026   —        —        $4.50    1.50×     0 / 0 / 0   |
| CU-BTM-H200-2611  ✓ 0xaaaa…aaaa   H200 1.40×    ID       Nov 2026   —        —        $6.09    2.03×     0 / 0 / 0   |
| CU-SGP-B200-2612  ✓ 0xcccc…cccc   B200 2.50×    SG       Dec 2026   —        —        ...      ...       0 / 0 / 0   |
|                                                                                                |
| Record = delivered CU / defaulted CU / declined CU (provider-wide).                             |
+------------------------------------------------------------------------------------------------+
| [utility bar, §0.2]                                                                                |
+------------------------------------------------------------------------------------------------+
```

Wireframe = keadaan setelah adegan "Buy and trade" (05 §2.3). Semua angka selain harga/bond series 4 = ilustrasi tata letak (mis. apakah `volume_24h_usd` memasukkan pembelian primer ditentukan 03, bukan di sini); nilai sebenarnya dari seed 05 §3 dan E4. Badge "200% backed" muncul di kolom Bond/CU kalau `bond_per_cu ≥ 2 × primary_price` (PK §6.1).

### 2.2 Kolom, sumber data, copy

| Kolom (header persis) | Sumber E4 `/v1/series` | Fallback onchain | Catatan |
|---|---|---|---|
| "Series" | `symbol`; badge "Sale open" kalau `sale_open`, "Paused" kalau `paused`, "Finalized" kalau `finalized` | `getSeries`, `isSaleOpen` | klik baris → `/markets/{series_id}` |
| "Provider" | `provider.address`, `provider.verified`, `provider.status` | `ProviderRegistry.getProvider` | badge ✓ membuka D-ATTEST (§1.5); status ≠ Active → badge "Suspended"/"Banned" merah |
| "GPU (factor)" | `gpu`, `factor` | `getSeries().factor` | factor = snapshot saat listing (design §1) |
| "Region" | `country` (+ `region`) | `getSeries().country` | |
| "Window" | `delivery_window` | `windowStart/windowEnd` | format "Oct 2026" [D-02] |
| "Last/CU" | `last_price` | — | "—" kalau null |
| "24h vol" | `volume_24h_usd` (tooltip `volume_24h_cu` CU) | — | |
| "Bond/CU" | `bond_per_cu` | `getSeries().bondPerCU` | |
| "Coverage" | `coverage` | — (dihitung API, D-34) | "—" kalau referensi tidak ada; tooltip "Bond per CU ÷ spot reference (synthetic demo data)" |
| "Record" | `provider.delivered_cu` / `defaulted_cu` / `voluntary_defaulted_cu` | `getProvider` counter | [D-33] |
| (tooltip harga) | `primary_price`, `native_primary_price` | `getSeries().primaryPrice` | "Primary $3.00/CU = $3.00 per H100-hour" |

| State | Copy |
|---|---|
| Loading | 5 baris skeleton; tidak ada teks |
| Indexer syncing (respons 503 `INDEXER_SYNCING`) [D-66] | Teks state tabel, bukan banner shell (banner = D-84): "Indexer is syncing. Series will appear shortly." Tabel menampilkan 3 baris skeleton. Kalimat "0 series." disembunyikan selama syncing. Bukan error; polling ulang otomatis |
| RPC publik gagal [D-89] | Teks redup, bukan merah. Baca diulang dengan jeda 400 ms, 800 ms, 1600 ms |
| Kosong (`data` = [], indexer synced) | "No series listed yet." + "Providers can list capacity in three steps." + tombol "List capacity" |
| Kosong karena filter | "No series match these filters." + tombol "Clear filters" |
| Error API nyata (`/v1/*` selain 503 `INDEXER_SYNCING`) [D-66] | Hanya keadaan ini yang memakai warna merah. Lihat dua baris berikut |
| Error API, fallback aktif | banner B-DATA (§1.6); tabel diisi dari `SeriesFactory` (kolom Last/24h/Coverage = "—") |
| Error total (API dan RPC gagal) | "Couldn't load markets. Check your connection and retry." + tombol "Retry" |

Filter: `gpu`, `region`, `delivery_window` ("Delivery month"), `status` (param E4, 03 §3.7; default `active`, centang "Show finalized" → `status=all`). Urutan default: `window_start_ms` naik, lalu `series_id`.

### 2.3 Mobile

Tabel menjadi kartu per series: baris 1 simbol + badge sale, baris 2 "H100 · ID · Oct 2026", baris 3 "Last $3.20 · Bond $4.50 · 1.50×", baris 4 provider ✓. Strip indeks dilipat jadi dua baris. Tidak dipakai di naskah, tapi juri mungkin membukanya di HP.

---

## 3. S2 List capacity (wizard forge)

**Tujuan.** Provider terverifikasi membuat series baru dalam tiga langkah: Capacity → Terms → Bond & launch, dengan kartu preview langsung (design §7.2 S2; PK §6.1). **Aktor:** provider (role 1, terdaftar, `isListable`). **Demo:** adegan "List in 3 clicks" 0:12–0:40: preset `CU-JKT-H100-2610`, stopwatch < 40 dtk, target ≤ 28 dtk (05 §2.3). **Fungsi:** `SeriesFactory.createSeriesWithPermit(p, deadline, v, r, s)` [D-30]; fallback `MockUSDC.approve(BondVault, bond)` + `createSeries(p)`.

### 3.1 Gate masuk

| Kondisi | Tampilan |
|---|---|
| Wallet belum terhubung | "Connect a provider wallet to list capacity." + "Connect wallet" |
| Tidak terverifikasi | M-KYB varian "Verify to list" |
| Terverifikasi role 1 tapi belum terdaftar | kartu "Register as provider" → `ProviderRegistry.registerProvider()`; error `AlreadyRegistered` → "This wallet is already registered." (lanjut ke wizard); `NotVerified` → "Verification missing or expired." |
| Terdaftar tapi tidak listable (status Suspended/Banned) | "This provider can't list new series (status: {status})." |
| Listable | wizard |

Sumber: E13 (`verified`, `role`), E12 (`status`; 404 = belum terdaftar), fallback `ProviderRegistry.isListable(addr)`.

### 3.2 Wireframe langkah 1: Capacity

```text
+------------------------------------------------------------------------------------------------+
| List capacity                         (1) Capacity  ->  (2) Terms  ->  (3) Bond & launch       |
|                                                       [Load demo preset: CU-JKT-H100-2610]     |
+-----------------------------------------------------------+------------------------------------+
| GPU model        [ H100            v ]  factor 1.00×      |  PREVIEW                           |
| GPU-hours        [ 500            ]                       |  500 H100-hours = 500 CU           |
| Site code        [ JKT ]   Country [ ID v ]  Continent[v] |  at $3.00/CU and a 1.5× bond,      |
| Delivery month   [ Oct 2026        v ]                    |  $2,250.00 locked                  |
|                  Redeemable 1–31 Oct 2026                 |                                    |
| Series symbol    CU-JKT-H100-2610   (auto)                |  CU-JKT-H100-2610                  |
| Hardware spec    [ form fields, hashed to specHash ]      |  500 CU · $3.00 · bond $2,250 (1.5×)|
| [ ] Institutional (transfers only to verified wallets)    |  Max proceeds $1,485.00 after 1% fee|
|                                                           |                                    |
|                                              [Next ->]    |                                    |
+-----------------------------------------------------------+------------------------------------+
```

| Field | Label / helper persis | Validasi UI (cermin kontrak) | `SeriesParams` |
|---|---|---|---|
| GPU model | "GPU model" / helper "Factor is fixed at listing time." | wajib; opsi dari E14 `/v1/gpus` (fallback `ConversionTable.listGpuModels` + `factorOf`) [D-09] | `gpuModel` |
| GPU-hours | "GPU-hours" / "Native GPU-hours you will deliver during the window." | bilangan bulat > 0 | `gpuHours` |
| Hasil CU | "= {cu} CU" (read-only) | `gpuHours × factor / 1e4`; 0 → error `ZeroSupply` lokal | turunan `maxSupply` |
| Site code | "Site code" / "3 letters, used in the series symbol (e.g. JKT)." | 3 huruf A–Z [APPROVED P6-07: kode situs = input bebas] | bagian `symbol` |
| Country / Continent | "Country", "Continent" | wajib | `country`, `continent` (01 P-06) |
| Delivery month | "Delivery month" / "Redeemable {start}–{end}." | bulan kalender penuh [D-02]; deployment demo menawarkan bulan berjalan [D-19]; prod hanya bulan depan dan seterusnya | `windowStart`, `windowEnd` |
| Symbol | "Series symbol" (auto) | format `CU-{SITE}-{GPU}-{YYMM}` | `symbol` |
| Hardware spec | "Hardware spec" / "Stored off-chain; only its hash goes on-chain." | isi skema `paron-spec/v1` [TBD T5-04]; minimal kosong boleh → hash dari JSON kosong [APPROVED P6-08] | `specHash` |
| Institutional | "Institutional (transfers only to verified wallets)" | default off | `institutional` |

### 3.3 Wireframe langkah 2: Terms

```text
+-----------------------------------------------------------+------------------------------------+
| Primary price    [ 3.00 ] USDC per CU                     |  PREVIEW (diperbarui langsung)     |
|                  = $3.00 per H100-hour                    |                                    |
| Bond per CU      [ 4.50 ] USDC   min $4.50 (1.5×)         |  Default compensation:             |
|                  Badge "200% backed" at $6.00             |  $4.50 per CU (fixed)              |
| Ack window       [ 60 s  ]  allowed 60 s – 72 h           |                                    |
| Delivery window  [ 60 s  ]  allowed 60 s – 7 d            |  Provider must acknowledge within  |
| Dispute window   [ 90 s  ]  allowed 90 s – 7 d            |  1:00 and deliver within 1:00 after|
| Min redemption   [ 1 ] CU                                 |  that, or holders get paid from    |
| Arbitrator       [ Paron demo panel (2-of-3)  v ]         |  the bond.                         |
|                                                           |                                    |
| [<- Back]                                   [Next ->]     |                                    |
+-----------------------------------------------------------+------------------------------------+
```

| Field | Label / helper persis | Validasi UI | Error kontrak yang dicegah |
|---|---|---|---|
| Primary price | "Primary price" / "USDC per CU. You can raise it later, never lower." | > 0, kelipatan 0.01 | `ZeroPrice` |
| Bond per CU | "Bond per CU" / "Minimum 1.5× the primary price. Paid to holders if you miss a deadline." | ≥ ceil(1.5 × price, 0.01); default = minimum | `BondBelowFloor(bondPerCU, minBondPerCU)` |
| Ack window | "Ack window" / "Time to acknowledge a redemption request." | dalam batas deployment [D-20] | `AckWindowOutOfBounds` |
| Delivery window | "Delivery window" / "Time to deliver after acknowledging." | dalam batas [D-20] | `DeliveryWindowOutOfBounds` |
| Dispute window | "Dispute window" / "Time the buyer has to dispute after delivery." | dalam batas [D-20] | `DisputeWindowOutOfBounds` |
| Min redemption | "Minimum redemption" / "Smallest request a holder can make." | ≥ 1 CU dan ≤ hasil CU | `MinRedemptionTooSmall`, `MinRedemptionAboveSupply` |
| Arbitrator | "Arbitrator" / "Buyers see this before they buy." | dari allowlist | `ArbitratorNotAllowed(address)` |

- Batas window per deployment (demo: ack 60 s–72 h, delivery 60 s–7 d, dispute 90 s–7 d; prod 1 h–72 h, 1 h–7 d, 24 h–7 d) dibaca dari view `SeriesFactory.bounds()` (+ `allowOpenWindow()`, `enforceCalendarMonth()`, `leadTime()`), yang kini ada di 01 §6.3 (sinkronisasi Jum 9 Okt, X6-11); cadangan: `params` di `deployments/<label>.json` (04 §7.2) [APPROVED P6-09]. Kalau `enforceCalendarMonth`, pilihan window = bulan kalender UTC (dropdown bulan).
- Daftar arbitrator: dari view `SeriesFactory.allowedArbitrators()` (01 §6.3, ditambahkan Jum 9 Okt). Nama tampilan dari manifest deployment: `PanelArbitrator` = "Paron demo panel (2-of-3)"; alamat lain tampil sebagai alamat [D-03] [D-36] [APPROVED P6-10].
- Default preset demo: price 3.00, bond 4.50, windows 60/60/90 s, min 1 CU, arbitrator = panel (05 §3; D-20).

### 3.4 Wireframe langkah 3: Bond & launch

```text
+-----------------------------------------------------------+------------------------------------+
| Review                                                    |  CU-JKT-H100-2610                  |
| Supply           500 CU (500 H100-hours)                  |  500 CU · $3.00 · bond $2,250 (1.5×)|
| Primary price    $3.00/CU                                 |  ✓ Verified by Paron demo verifier |
| Bond             $2,250.00  ($4.50 × 500 CU)              |                                    |
| Window           1–31 Oct 2026                            |  Bond bar  [####################]  |
| Terms            ack 1:00 · delivery 1:00 · dispute 1:30  |            $2,250.00 of $2,250.00  |
| Arbitrator       Paron demo panel (2-of-3)                |                                    |
| Fee              1% of primary sales (paid by you)        |                                    |
|                                                           |                                    |
| Your USDC        {balance}   ✓ enough for the bond        |                                    |
|                                                           |                                    |
| [<- Back]                    [Sign & launch series]       |                                    |
| One signature + one transaction. The bond is locked in    |                                    |
| this series' vault until it expires.                      |                                    |
+-----------------------------------------------------------+------------------------------------+
```

**Alur tombol "Sign & launch series"**
1. Cek lokal: saldo USDC ≥ bond (`MockUSDC.balanceOf`), jaringan benar, `isListable` true. Gagal → tombol disabled dengan alasan (tabel di bawah).
2. Minta tanda tangan permit EIP-2612 (`spender` = `BondVault`, `value` = bond, `deadline` = now + 20 menit) [D-30]. Toast "Sign the bond permit in your wallet…".
3. Kirim `createSeriesWithPermit(p, deadline, v, r, s)`. Toast pending/submitted (§9.1).
4. Sukses: baca event `SeriesCreated` → `seriesId`, `token`. Tampilkan kartu sukses; redirect otomatis ke `/markets/{seriesId}` setelah 1,5 s (supaya stopwatch berhenti di S3 dengan bond bar penuh, 05 §2.3).
5. Kalau wallet tidak mendukung tanda tangan typed-data atau permit gagal: tampilkan "Permit not supported by this wallet. Use two transactions instead." + tombol "Approve USDC, then launch" (fallback approve + `createSeries`) [D-30].

| Kondisi disabled | Copy tombol / helper |
|---|---|
| Saldo USDC < bond | "Not enough USDC for the bond (need ${bond}, have ${balance})." + link "Get test USDC" |
| Ada field tidak valid | "Fix the highlighted fields first." |
| Jaringan salah | "Switch to {chainName} first" |
| Tx sedang berjalan | "Launching…" (spinner) |

| Toast / state | Copy |
|---|---|
| Permit ditandatangani | "Permit signed. Sending transaction…" |
| Sukses | "Series {symbol} is live. Bond ${bond} locked." + "View on explorer" |
| Kartu sukses | judul "Series is live", baris "Token {token}", tombol "Open series page" |

Error spesifik S2: lihat §9.2 grup SeriesFactory dan MockUSDC/ERC-20.

**Stopwatch demo** [APPROVED P6-11]: kalau `NEXT_PUBLIC_DEMO_PRESETS` aktif, overlay kecil di pojok kanan atas: mulai saat tombol "Load demo preset" diklik, berhenti saat S3 series baru selesai memuat. Copy "Listed in {s.s}s". Alternatif: stopwatch HP presenter. Overlay tidak pernah tampil di build tanpa preset.

### 3.5 Mobile

Wizard satu kolom, kartu preview pindah ke atas tombol Next sebagai ringkasan satu baris ("500 CU · $3.00 · bond $2,250 (1.5×)"). Tidak dipakai di naskah.

---

## 4. S3 Series page

**Tujuan.** Semua yang dibutuhkan untuk membeli, memperdagangkan, dan menilai satu series: primary buy box, order book, trades tape, bond health bar, redemption terms, reputasi provider (design §7.2 S3; PK §6 "Market"). **Aktor:** buyer, trader/market maker, publik. **Demo:** "List in 3 clicks" berakhir di sini (bond bar penuh); "Buy and trade" 0:40–0:58 (buy 20 CU, ask 5 @ 3.20 muncul lalu hilang, print di tape, strip H100 `THIN` → `OK` 3.20, lalu series H200 "$5.69/hour shows as $4.06/CU"); Confirm #1 (bond $2,250 → $2,214, "8 CU delivered"); callout SelfMatch series 3 (1:35–1:45); WOW claim default (bond $2,214 → $2,169).

### 4.1 Wireframe (desktop)

```text
+------------------------------------------------------------------------------------------------+
| [header + strip indeks GPU series ini]                                                          |
+------------------------------------------------------------------------------------------------+
| CU-JKT-H100-2610   [Sale open]                       Provider ✓ 0x1111…1111  Verified by Paron |
| H100 · factor 1.00× · ID · Redeemable 1–31 Oct 2026  demo verifier · 8 delivered · 0 defaulted |
| Primary $3.00/CU = $3.00 per H100-hour   Default compensation: $4.50 per CU (fixed)           |
| Token 0x5e5e…5e5e [explorer]   Created tx 0xc1c1…c1c1 [explorer]                               |
+--------------------------------+-------------------------------+-------------------------------+
| ORDER BOOK            tick 0.01| TRADES                        | BUY AT PRIMARY                |
| Price    Qty CU   Orders       | Time      Side Price Qty  Elig| Quantity  [ 20 ] CU   [Max]  |
| asks                           | 10:01:05  BUY  3.20  5    ✓   | Price     $3.00 / CU          |
| 3.20     5        1      (you?)| 10:00:50  PRI  3.00  10   —   | You pay   $60.00 USDC         |
| ----- spread — -----           | 10:00:40  PRI  3.00  20   —   | Remaining 480 of 500 CU       |
| bids                           |                               | The provider pays the 1% fee. |
| (empty)                        |                               | [ Buy 20 CU for $60.00 ]      |
|                                |                               |                               |
| PLACE ORDER  (Buy | Sell)      |                               | BOND                          |
| Price [ 3.20 ]  Qty [ 5 ]      |                               | [###################-] 96.4%  |
| [ ] Fill now, cancel the rest  |                               | $2,169.00 of $2,250.00        |
| Taker: $16.00 + $0.024 fee     |                               | Released $36.00 · Paid $45.00 |
| [ Place bid ]                  |                               | Covers 12 CU outstanding ✓    |
|                                |                               | Coverage 1.50× vs spot ref    |
| MY OPEN ORDERS                 |                               | (synthetic demo data)         |
| #2 ASK 3.20  5/5   [Cancel]    |                               |                               |
+--------------------------------+-------------------------------+-------------------------------+
| REDEMPTION TERMS                                  | PROVIDER REPUTATION                        |
| Ack window        1:00                            | Delivered        8 CU                      |
| Delivery window   1:00 after ack                  | Defaulted       10 CU   Strikes 1          |
| Dispute window    1:30 after delivery             | Declined         0 CU                      |
| Minimum redemption 1 CU                           | Disputes lost    0                         |
| Arbitrator        Paron demo panel (2-of-3)       | Status Active                              |
| Spec hash 0x…  Terms hash 0x… / none              | [View attestation]                         |
| [Redeem in Portfolio ->]                          |                                            |
+---------------------------------------------------+--------------------------------------------+
| [utility bar]                                                                                      |
+------------------------------------------------------------------------------------------------+
```

Wireframe mencampur beberapa momen demo hanya untuk menunjukkan semua slot; angka bond = akhir demo (03 §3.8 contoh E5).

### 4.2 Header series: sumber data

| Elemen | Sumber E5 `/v1/series/{id}` | Fallback onchain |
|---|---|---|
| Simbol, badge | `symbol`, `sale_open`, `paused`, `finalized` | `getSeries`, `isSaleOpen` |
| GPU, factor, region, window | `gpu`, `factor`, `country`, `delivery_window`, `window_start_ms`, `window_end_ms` | `getSeries` |
| Harga primer + native | `primary_price`, `native_primary_price`, `gpu_hours` | `getSeries().primaryPrice` × `factor` / 1e4 |
| "Default compensation: ${bond_per_cu} per CU (fixed)" (PK §6.2) | `bond_per_cu` | `getSeries().bondPerCU` |
| Provider + badge + record ringkas | `provider.*` | `ProviderRegistry.getProvider` |
| Token + tx pembuatan | `token`, `created_tx`, `explorer_url` | `getSeries().token` |
| Badge "200% backed" | `bond_per_cu ≥ 2 × primary_price` | sama |

Copy native price untuk GPU non-H100 (contoh H200): "Primary $4.06/CU = $5.69 per H200-hour" dan tooltip "1 CU = 1 H100-equivalent hour. 1 H200-hour = 1.40 CU." (design §1; 05 adegan H200).

### 4.3 Primary buy box + M-BUY

**Fungsi:** `PrimarySale.buy(seriesId, qty, maxCost)`. Kuotasi: `PrimarySale.quote(seriesId, qty)` → `(cost, fee)`; `fee` adalah bagian provider (1%), buyer membayar `cost` = `qty × primaryPrice` (PK §6.2). Allowance USDC ke `PrimarySale` wajib; wallet demo sudah di-approve di seed (05 A-6), wallet baru melihat langkah "Approve USDC".

**`maxCost`:** = `cost` hasil quote × (1 + toleransi). Rekomendasi toleransi 0 (harga primer hanya bisa naik lewat `raisePrimaryPrice`, jadi kenaikan apa pun memang harus menghentikan pembelian) [APPROVED P6-12]. `maxCost` = 0 tidak pernah dikirim (error `MaxCostRequired`).

| Elemen | Copy persis |
|---|---|
| Judul | "Buy at primary" |
| Input | "Quantity" + akhiran "CU", tombol "Max" (= min(remaining, saldo USDC ÷ harga)) |
| Baris harga | "Price ${primary_price} / CU" |
| Total | "You pay ${cost} USDC" |
| Sisa | "Remaining {max_supply − sold_supply} of {max_supply} CU" |
| Helper | "The provider pays the 1% fee." |
| Tombol utama | "Buy {qty} CU for ${cost}" |
| Tombol approve (allowance < cost) | "Approve USDC" lalu helper "One-time approval for primary purchases." |

**M-BUY (konfirmasi sebelum tx)**

```text
+--------------------------------------------------+
| Confirm purchase                             [x] |
| Series        CU-JKT-H100-2610                   |
| Quantity      20 CU (20 H100-hours)              |
| Price         $3.00 / CU                         |
| You pay       $60.00 USDC (max $60.00)           |
| If the provider misses a deadline, you get       |
| $4.50 per CU from the bond.                      |
| Redeemable 1–31 Oct 2026.                        |
|                         [Cancel]  [Confirm buy]  |
+--------------------------------------------------+
```

Untuk demo, M-BUY boleh dilewati kalau `NEXT_PUBLIC_DEMO_PRESETS` aktif (satu klik langsung ke wallet) [APPROVED P6-13].

| Kondisi disabled | Copy tombol |
|---|---|
| Wallet belum terhubung | "Connect wallet to buy" |
| Belum terverifikasi [D-31] | "Verify to buy" (klik → M-KYB) |
| `sale_open` false karena `windowEnd − leadTime` lewat [D-39] | "Primary sale closed" |
| `paused` [D-32] | "Sales paused" |
| Sold out (`sold_supply` = `max_supply`) | "Sold out" |
| qty kosong / 0 | "Enter a quantity" |
| qty > remaining | "Only {remaining} CU left" |
| Saldo USDC < cost | "Not enough USDC" + link "Get test USDC" |
| Jaringan salah / mode mock | "Switch to {chainName} first" / "Disabled in mock mode" |

Toast sukses: "Bought {qty} CU of {symbol} for ${cost}." Data refresh: E5 (`sold_supply`), E8, E1. Error: §9.2 grup PrimarySale.

### 4.4 Order book + order form (M-ORDER)

**Order book.** E6 `/v1/series/{id}/orderbook?depth=10`: `asks` (naik), `bids` (turun), `best_bid`, `best_ask`, `spread`, `tick`. Maks 10 level per sisi [D-17]. Sumber kebenaran onchain = `OrderBook.getLevels(seriesId, side, 10)`; kalau beda dengan API saat demo, baca onchain (03 P3-12). Level yang berisi order milik wallet sendiri (E7 `?maker={me}&series={id}`) diberi titik. Klik level → isi harga di form.

| State | Copy |
|---|---|
| Kedua sisi kosong | "No open orders. Place the first bid or ask." |
| Satu sisi kosong | "(empty)" di sisi itu, spread "—" |
| Loading | 5 baris skeleton per sisi |

**Order form.** Fungsi `OrderBook.placeOrder(seriesId, side, price, qty, immediateOrCancel)`; cancel `OrderBook.cancelOrder(orderId)`.

| Elemen | Copy persis | Aturan |
|---|---|---|
| Tab | "Buy" / "Sell" | `side` BID / ASK |
| Harga | "Price (USDC per CU)" | kelipatan 0.01, > 0 |
| Qty | "Quantity (CU)" | bilangan > 0 |
| IOC | "Fill now, cancel the rest (IOC)" | `immediateOrCancel` |
| Estimasi, crossing (taker) | "Fills now at up to ${price}: ${notional} + ${fee} taker fee (0.15%)." | fee = notional × 0.15% (01 §6.7) |
| Estimasi, resting (maker) | "Rests on the book. Maker fee 0%. Locks ${price × qty} USDC until filled or cancelled." (Buy) / "Locks {qty} CU until filled or cancelled." (Sell) | escrow (PK §6.3) |
| Tombol | "Place bid" / "Place ask" | |
| Approve | "Approve USDC" (Buy) / "Approve {symbol}" (Sell) | allowance ke `OrderBook`; trader demo sudah di-approve kecuali langkah S-04 bot (05 P5-05) |
| Info self-match | "Orders can't match another order from your own verified entity." | [D-35] |

| Kondisi disabled | Copy |
|---|---|
| Belum terverifikasi [D-31] | "Verify to trade" |
| `now ≥ windowEnd` | "Trading closed: the delivery window has ended. You can still cancel open orders." [D-29] |
| `paused` | "New orders paused. You can still cancel open orders." [D-32] |
| Harga bukan kelipatan tick | "Price must be a multiple of $0.01." |
| Sell > saldo CU bebas | "You hold {balance} CU (excluding CU locked in redemptions)." |
| Buy, saldo USDC < notional + fee | "Not enough USDC" |

**My open orders.** E7 `?maker={me}&series={id}&status=OPEN,PARTIAL`: kolom "Order", "Side", "Price", "Filled", "Status", tombol "Cancel". Cancel selalu aktif untuk order milik sendiri, termasuk setelah `windowEnd` dan saat pause (D-29, D-32). Kosong: "You have no open orders on this series." Toast sukses cancel: "Order #{orderId} cancelled. Escrow returned."

Toast sukses place: resting "Order #{orderId} placed: {side} {qty} CU at ${price}."; terisi penuh "Filled {qty} CU at ${avgPrice}. Fee ${fee}."; sebagian "Filled {filled} of {qty} CU. {rest} CU resting on the book." (atau "... {rest} CU cancelled (IOC)." kalau IOC) Nilai dari return `(orderId, filledQty)` dan event `Trade`.

**Callout SelfMatch (05 S-12, series 3).** Revert `SelfMatch()` ditampilkan sebagai kartu error di bawah form (bukan hanya toast), supaya terbaca di proyektor: judul "Blocked: self-trade", badan "Both sides belong to the same verified entity. Paron rejects the trade so it can't print or move the index.", baris kecil "Contract error: SelfMatch()". Tidak ada print baru di tape (05 §2.3).

### 4.5 Trades tape

Sumber E1 `/v1/prints?series={symbol}&limit=20` (urut baru → lama). Kolom dan copy:

| Kolom | Field E1 | Copy / format |
|---|---|---|
| "Time" | `ts_ms` | waktu lokal |
| "Type" | `kind`, `side` | "Primary" untuk `PRIMARY`; "Buy"/"Sell" (sisi taker) untuk `TRADE` |
| "Price" | `cu_price` (+ tooltip `price_per_gpu_hour`) | "$3.20" |
| "Qty" | `qty_cu` | "5 CU" |
| "Value" | `notional_usd` | "$16.00" |
| "Index" | `eligible`, `ineligible_reason` | ✓ "Index-eligible" / "Not eligible: primary sale" (`PRIMARY`) / "Not eligible: same entity" (`SAME_ENTITY`) / "Not eligible: unverified" (`UNVERIFIED`) [P3-10] |
| ikon | `explorer_url` | link tx |

Kosong: "No trades yet." Print baru disorot 2 s (animasi) supaya adegan "PrintIndex ticks" terlihat. Fallback saat API mati: tape disembunyikan dengan copy "Trade history needs the Paron API. Order book and bond are read on-chain." (tidak ada view onchain untuk riwayat).

### 4.6 Bond health bar

| Elemen | Copy | Sumber E5 `bond` | Fallback |
|---|---|---|---|
| Bar | persen = `health` × 100, 1 desimal | `health` (= `balance ÷ deposited`, 03) | `BondVault.bondOf(seriesId)` |
| Baris 1 | "${balance} of ${deposited}" | `balance`, `deposited` | sama |
| Baris 2 | "Released to provider ${released} · Paid to holders ${slashed}". **[D-61]** Boleh dirender sebagai **dua baris legenda** ("Released to provider ${released}" / "Paid to holders ${slashed}") dengan kunci warna yang sama dengan segmen bar opsional (released = graphite, paid = ember); kata-katanya tidak berubah, hanya tata letak (muat di kolom kanan sempit tanpa wrap) | `released`, `slashed` | sama |
| Baris 3 | "Covers {total_supply} CU outstanding ✓" kalau `balance ≥ bond_per_cu × total_supply`; selain itu "Under-covered" merah (seharusnya tidak pernah terjadi, invariant D-18) | `total_supply`, `bond_per_cu` | `CUToken.totalSupply` |
| Baris 4 | "Coverage {coverage}× vs spot reference (synthetic demo data)" | E4/E5 `coverage` [D-34] | sembunyikan |
| Setelah final | "Series finalized. Remaining bond withdrawable by provider." / kalau `withdrawn`: "Series finalized. Remaining bond withdrawn." | `finalized`, `withdrawn` | `bondOf` |

Perubahan bar dianimasikan dari nilai lama ke nilai baru (adegan $2,214 → $2,169, 05 §2.3).

### 4.7 Redemption terms + finalisasi

Field E5 `terms`: `ack_window_secs`, `delivery_window_secs`, `dispute_window_secs`, `min_redemption_cu`, `arbitrator`, `spec_hash`, `terms_hash`. Format durasi: < 1 jam "m:ss" ("1:00"), selain itu "24 h", "2 d". Arbitrator: nama dari manifest (P6-10), selain itu alamat. `terms_hash` 0 → "none".

Tombol "Redeem in Portfolio" → `/redemptions/new?series={id}` (merender M-REDEEM, §0.5). Tombol publik "Finalize series" muncul hanya kalau `now ≥ windowEnd + grace` dan `redemption_stats.open_requests` = 0 [D-14]; memanggil `SeriesFactory.finalizeSeries(seriesId)`. Copy helper: "Anyone can finalize after the window and grace period. Unredeemed CU become void." Error `SeriesNotExpired`, `OpenRequestsRemaining(count)`, `AlreadyFinalized` → §9.2. Tidak ada di naskah demo (07 D-14).

### 4.8 Provider reputation

Sumber E12 `/v1/providers/{addr}` `reputation`: "Delivered" `delivered_cu`, "Defaulted" `defaulted_cu`, "Declined" `voluntary_defaulted_cu`, "Disputes lost" `disputes_lost`, "Strikes" `strikes`, "Status" `status` [D-33]. Fallback `ProviderRegistry.getProvider`. Copy adegan Confirm #1: angka "8 CU" di baris Delivered disorot. Kosong (provider baru): "No redemptions yet."

### 4.9 Mobile

Urutan satu kolom: header → buy box → bond → order book → form → tape → terms → reputasi. Tidak dipakai di naskah; juri bisa diarahkan ke S3 setelah claim (bond bar $2,169) lewat link di kartu sukses S4-R.

---

## 5. S4 Portfolio & redemptions

**Tujuan.** Holder melihat CU-nya, meminta redemption, dan mengikuti tiap request lewat timeline dengan countdown dan tombol Confirm / Dispute / Claim default (design §7.2 S4; PK §6.2 "Buyer portfolio" + "Redemption detail" yang merupakan bagian S4, PK §6 peta layar). **Aktor:** holder (buyer/trader); publik untuk aksi permissionless. **Demo:** 0:58–1:10 redeem 8 → ACKNOWLEDGED → DELIVERED; ≈1:10 redeem 10 + countdown 60 dtk; 1:12–1:20 Confirm #1; 1:45–2:10 countdown; ≈2:11–2:15 claim default oleh juri (lewat S4-R, §5.7).

### 5.1 Wireframe (desktop)

```text
+------------------------------------------------------------------------------------------------+
| [header + strip]                                                                                |
+------------------------------------------------------------------------------------------------+
| Portfolio   0x2222…2222 ✓                                   [View statement]  [Export CSV]     |
|                                                                                                |
| HOLDINGS                                                                                       |
| Series            Balance   Locked   Redeemable  Value (last)   Default comp.                  |
| CU-JKT-H100-2610  2 CU      10 CU    Yes         $6.40          $4.50/CU     [Redeem] [Trade]  |
|                                                                                                |
| REDEMPTIONS                                               Filter [Open v]                      |
| +--------------------------------------------------------------------------------------------+ |
| | #2  CU-JKT-H100-2610 · 10 CU · claim $45.00          [Waiting for provider ack]            | |
| |     Ack deadline in 0:41  (server time)                                                    | |
| |     ● Requested 10:03:00  ○ Acknowledged  ○ Delivered  ○ Completed                         | |
| |     If the provider misses this deadline, anyone can claim $45.00 for you.  [Open on phone]| |
| +--------------------------------------------------------------------------------------------+ |
| | #1  CU-JKT-H100-2610 · 8 CU · claim $36.00                     [Delivered · review]        | |
| |     Dispute window closes in 1:12                                                          | |
| |     ● Requested 10:01:30  ● Acknowledged 10:01:33  ● Delivered 10:01:40  ○ Completed       | |
| |     Receipt 0xd1d1…d1d1                                                                    | |
| |     [Confirm delivery]   [Dispute]                                                         | |
| +--------------------------------------------------------------------------------------------+ |
+------------------------------------------------------------------------------------------------+
| [utility bar]                                                                                      |
+------------------------------------------------------------------------------------------------+
```

### 5.2 Holdings: sumber, copy, state

Sumber E8 `/v1/accounts/{addr}/holdings`: `series` (ringkas E4), `balance_cu`, `redeemable_now`, `open_requests`, `locked_cu`, `value_at_last_usd`. Fallback onchain: `CUToken.balanceOf(me)` per series dari `SeriesFactory` + `isRedeemWindowOpen` (kolom Locked/Value = "—").

| Kolom (persis) | Field | Catatan |
|---|---|---|
| "Series" | `series.symbol` | link S3 |
| "Balance" | `balance_cu` | CU bebas |
| "Locked" | `locked_cu` | tooltip "CU held by the redemption contract until delivery is confirmed or the request is settled." |
| "Redeemable" | `redeemable_now` | "Yes" / "Opens {date}" / "Window closed" |
| "Value (last)" | `value_at_last_usd` | "—" kalau belum ada trade |
| "Default comp." | `series.bond_per_cu` | "$4.50/CU" (PK §6.2) |
| tombol | — | "Redeem" (aktif kalau `redeemable_now`), "Trade" (→ S3) |

| State | Copy |
|---|---|
| Belum connect | "Connect your wallet to see your CU and redemptions." |
| Kosong | "You don't hold any CU yet." + tombol "Browse markets" |
| Loading | 2 baris skeleton |

### 5.3 M-REDEEM (redemption request)

**Fungsi:** `RedemptionManager.requestRedemption(seriesId, amount, deliveryRef)`. Satu tx tanpa approve, karena RM memanggil `CUToken.lockFrom` [D-38]. Syarat: `windowStart ≤ now < windowEnd`, `amount ≥ minRedemption`, saldo cukup (01 §6.8.1).

```text
+------------------------------------------------------------+
| Redeem CU-JKT-H100-2610                                [x] |
|                                                            |
| Amount            [ 10 ] CU      Balance 12 CU   [Max]     |
|                   Minimum 1 CU                             |
| Access details    [ ssh-ed25519 AAAA… team@buyer        ]  |
|                   e.g. your SSH public key. Only a hash    |
|                   goes on-chain.                           |
|                                                            |
| What happens next                                          |
| 1. Your 10 CU are locked now (burned only after delivery). |
| 2. Provider must acknowledge within 1:00,                  |
|    then deliver within 1:00.                               |
| 3. If a deadline is missed, anyone can claim               |
|    $45.00 for you from the bond ($4.50 per CU).            |
|                                                            |
|                    [Cancel]   [Request redemption]         |
+------------------------------------------------------------+
```

| Elemen | Copy persis | Aturan |
|---|---|---|
| Judul | "Redeem {symbol}" | |
| Amount | "Amount" + "CU", helper "Minimum {min_redemption_cu} CU" | `amount ≥ min` dan ≤ `balance_cu` |
| Access details | "Access details", helper "e.g. your SSH public key. Only a hash goes on-chain." | `deliveryRef` = hash teks (keccak256). Penyimpanan/enkripsi detail = [TBD T5-04]. Wajib diisi di UI [APPROVED P6-14] |
| Ringkasan | 3 langkah di wireframe; angka dari E5 `terms` dan `bond_per_cu × amount` | |
| Tombol | "Request redemption" | |

| Kondisi disabled | Copy |
|---|---|
| `now < windowStart` | "Redemptions open {windowStart date}." |
| `now ≥ windowEnd` (kecuali request ulang setelah REFUNDED dalam grace, D-29) | "The redemption window has closed." |
| amount < min | "Minimum {min} CU." |
| amount > saldo | "You only have {balance} CU free." |
| Access details kosong | "Add access details so the provider can deliver." |

Toast sukses: "Redemption #{reqId} requested. Provider has {ackWindow} to acknowledge." Setelah sukses modal tertutup dan kartu baru muncul paling atas (data dari receipt event `RedemptionRequested` dulu, lalu E10 setelah indexer menyusul, supaya countdown langsung jalan, 05 adegan ≈1:10).

### 5.4 Kartu request + timeline (R-CARD)

Sumber: E10 `/v1/redemptions?holder={me}` untuk daftar (field `state`, `stored_state`, `next_deadline_ms`, `actions`, `amount_cu`, `claim_usd`, `receipt_hash`, `delivery_ref`, `payout`, `default_caller`, `voluntary`, `via_dispute`); E11 `/v1/redemptions/{reqId}` untuk timeline (`timeline[]` dengan `event`, `ts_ms`, `explorer_url`). Fallback onchain: `RedemptionManager.getRequest(reqId)` + `stateOf(reqId)` (P5-23); daftar `reqId` milik holder tanpa API = disimpan lokal dari receipt tx sesi ini [APPROVED P6-15].

**Badge state dan baris countdown**

| `state` (E10) | Badge persis | Baris countdown | Deadline yang dipakai |
|---|---|---|---|
| `REQUESTED` | "Waiting for provider ack" | "Ack deadline in {m:ss}" | `ack_deadline_ms` |
| `ACKNOWLEDGED` | "Provider acknowledged" | "Delivery deadline in {m:ss}" | `delivery_deadline_ms` |
| `DELIVERED` | "Delivered · review" | "Dispute window closes in {m:ss}"; setelah lewat: "Dispute window closed. Anyone can finalize." | `dispute_deadline_ms` |
| `DEFAULTABLE` | "Deadline missed" (merah) | "Deadline passed {m:ss} ago. Anyone can claim the default." | deadline yang terlewat |
| `DISPUTED` | "In dispute" | "Ruling due in {m:ss}"; setelah lewat: "No ruling in time. Anyone can refund." | `ruling_deadline_ms` |
| `DEFAULTED` | "Defaulted · paid ${payout}" | "Paid to holder {date}." + akhiran: `voluntary` → "Declined by provider."; `via_dispute` → "Ruled not delivered."; selain itu "Claimed by {default_caller}." | — |
| `FINALIZED` | "Completed" | "Delivered and confirmed {date}." + " (auto-finalized)" kalau `auto_finalized` | — |
| `REFUNDED` | "Refunded · CU returned" | "No ruling in time. Your CU and dispute bond were returned." | — |

**Langkah timeline (titik ● selesai, ○ belum):** "Requested" → "Acknowledged" → "Delivered" → "Completed"; cabang terminal mengganti langkah terakhir dengan "Defaulted", "Disputed" → "Ruled" / "Refunded". Tiap langkah selesai menampilkan waktu dan ikon explorer (E11 `timeline[].explorer_url`). Receipt: "Receipt {receipt_hash}" (D-26: hash JSON usage); delivery ref: "Access ref {delivery_ref}".

**Tombol per `actions` (sumber kebenaran tampil = E10 `actions`; cek akhir = onchain, §10)**

| `actions` berisi | Tombol persis | Siapa yang melihat | Fungsi 01 | Helper / konfirmasi |
|---|---|---|---|---|
| `CONFIRM` | "Confirm delivery" | holder | `confirm(reqId)` | "Burns your {amount} CU and releases ${claim} of bond to the provider." |
| `DISPUTE` | "Dispute" | holder | `dispute(reqId)` via M-DISPUTE | — |
| `CLAIM_DEFAULT` | "Claim default" (merah, besar) | siapa saja | `claimDefault(reqId)` via M-CLAIM | — |
| `FINALIZE` | "Finalize" | siapa saja | `finalizeRedemption(reqId)` [01 P-47] | "Dispute window is over. Finalizing pays the provider and burns the CU." |
| `RESOLVE_NO_RULING` | "Refund (no ruling)" | siapa saja | `resolveNoRuling(reqId)` [01 P-47] | "The arbitrator missed the ruling deadline. CU and dispute bond go back to the holder; no slash." |

Toast sukses: Confirm "Delivery confirmed. {amount} CU burned; ${claim} released to the provider."; Finalize "Redemption #{reqId} finalized."; Refund "Redemption #{reqId} refunded. {amount} CU returned to the holder."

Tombol "Open on phone" (desktop) membuka QR berisi URL `/redemptions/{reqId}` untuk diserahkan ke HP juri [APPROVED P6-16; cara wallet HP terhubung tetap TBD T5-03].

### 5.5 M-DISPUTE (dispute open)

**Fungsi:** `RedemptionManager.dispute(reqId)`; syarat `state == Delivered && now ≤ disputeDeadline`; menarik dispute bond USDC dari holder ke escrow RM [D-37]. Besar bond dibaca `RedemptionManager.disputeBondFor(seriesId, amount)` = max(5% × klaim, $5) (PK §6.2). Allowance USDC ke RM wajib (wallet demo sudah, 05 A-6).

```text
+------------------------------------------------------------+
| Open a dispute on #3                                   [x] |
|                                                            |
| Claim          $18.00  (4 CU × $4.50)                      |
| Dispute bond   $5.00   (5% of the claim, minimum $5.00)    |
| Receipt        0x…  submitted by the provider              |
| Arbitrator     Paron demo panel (2-of-3)                   |
| Ruling due     within 2:00 of opening                      |
|                                                            |
| Outcomes                                                   |
| • Not delivered: you get $18.00 + your $5.00 back.         |
| • Delivered: your $5.00 goes to the provider.              |
| • No ruling in time: your CU and $5.00 come back.          |
|                                                            |
| Window closes in 1:12                                      |
|                       [Cancel]   [Open dispute ($5.00)]    |
+------------------------------------------------------------+
```

Angka contoh dari 05 §3.6 (jalur dispute, bukan panggung: dispute bond 5.00 untuk klaim 18.00). Copy hasil mengikuti D-21 (Delivered → bond dispute ke provider; NotDelivered → dikembalikan) dan state machine 01 §6.8.

| Kondisi disabled | Copy |
|---|---|
| `now > dispute_deadline` | "Dispute window closed." |
| Saldo USDC < bond | "You need ${bond} USDC for the dispute bond." |
| Allowance < bond | tombol berubah "Approve USDC" |
| Bukan holder | modal tidak tersedia; tombol tidak tampil |

Toast sukses: "Dispute opened. The panel must rule by {ruling_deadline}." Error: §9.2 (`DisputeWindowClosed`, `NotHolder`, `InvalidState`, `DisputeAlreadyOpen`).

### 5.6 M-CLAIM (claim default)

**Fungsi:** `RedemptionManager.claimDefault(reqId)`; **siapa saja**, tanpa KYB [D-31]; syarat `stateOf(reqId) == Defaultable` (01 §6.8.1). Payout `bondPerCU × amount` dibayar ke **holder**, bukan ke pemanggil.

```text
+------------------------------------------------------------+
| Claim default on #2                                    [x] |
|                                                            |
| The provider missed the acknowledgment deadline.           |
| Anyone can trigger the payout. No admin, no oracle.        |
|                                                            |
| Holder receives   $45.00  (10 CU × $4.50)                  |
| Paid to           0x2222…2222 (holder)                     |
| Paid from         CU-JKT-H100-2610 bond ($2,214.00)        |
| You pay           gas only                                 |
|                                                            |
|                     [Cancel]   [Claim default]             |
+------------------------------------------------------------+
```

| Elemen | Copy persis |
|---|---|
| Judul | "Claim default on #{reqId}" |
| Alasan (REQUESTED lewat) | "The provider missed the acknowledgment deadline." |
| Alasan (ACKNOWLEDGED lewat) | "The provider missed the delivery deadline." |
| Badan | "Anyone can trigger the payout. No admin, no oracle." |
| Baris | "Holder receives ${claim} ({amount} CU × ${bond_per_cu})", "Paid to {holder} (holder)", "Paid from {symbol} bond (${bond.balance})", "You pay gas only" |
| Tombol | "Claim default" |
| Sedang cek onchain | "Checking on-chain…" (tombol spinner, ≤ 1 s) |
| Belum bisa (cek `stateOf` ≠ Defaultable) | "Not claimable yet. The deadline passes at {deadline} (server time). If the button is live, send it: the contract decides." |
| Sukses (kartu besar) | "Default paid. ${payout} sent to {holder}." + baris "Bond {symbol}: ${old} → ${new}" + baris "Provider strike recorded." + tombol "View series" (→ S3) + "View on explorer" |

Alur tombol: (1) baca `stateOf(reqId)` onchain; kalau bukan `Defaultable` → pesan "Not claimable yet…" dan tombol kembali disabled sampai countdown berikutnya; (2) kirim tx; (3) sukses → kartu sukses + refresh E10/E5/E12.

### 5.7 S4-R detail request publik + layout HP juri

**Route** `/redemptions/{reqId}`. Bisa dibuka wallet mana pun atau tanpa wallet. Isi = satu R-CARD (§5.4) dengan data E11; tombol holder (`CONFIRM`, `DISPUTE`) hanya muncul kalau wallet = `holder`. Tombol publik (`CLAIM_DEFAULT`, `FINALIZE`, `RESOLVE_NO_RULING`) untuk semua wallet. Inilah "S4 publik" di 05 §2.4 dan "Redemption detail" di PK §6.4.

**Mobile (HP juri, lebar 360–430 px):**

```text
+--------------------------------------+
| PARON              [0x4444…4444 ▾]   |
+--------------------------------------+
| Redemption #2                        |
| CU-JKT-H100-2610 · 10 CU             |
|                                      |
| [ Waiting for provider ack ]         |
|                                      |
|            0:07                      |
|     until the ack deadline           |
|          (server time)               |
|                                      |
| If it passes, anyone can claim       |
| $45.00 for the holder.               |
|                                      |
| +----------------------------------+ |
| |       Claim default              | |   <- disabled (abu-abu) sampai now_s > deadline
| +----------------------------------+ |
| Unlocks when the deadline passes.    |
|                                      |
| ● Requested 10:03:00                 |
| ○ Acknowledged                       |
+--------------------------------------+
| Docs · API · GitHub · Build stage-1  |
+--------------------------------------+
```

Perbedaan mobile dari desktop:
- Countdown angka besar di tengah (≥ 48 px), satu kolom, tombol lebar penuh tinggi ≥ 56 px.
- Tombol "Claim default" selalu terlihat sejak countdown berjalan, disabled dengan helper "Unlocks when the deadline passes." lalu menjadi merah aktif saat `now_s > deadline` dan E10 `actions` berisi `CLAIM_DEFAULT` (03 P3-33). Kalau API tertinggal tapi chain sudah lewat deadline, tombol tetap aktif berdasarkan cek onchain (§10).
- Kartu sukses mengisi layar: "Default paid. $45.00 sent to 0x2222…2222." + "Bond: $2,214.00 → $2,169.00" + "Provider strike recorded." + tombol "View series".
- Header hanya logo + chip wallet; nav disembunyikan di menu. Strip indeks disembunyikan. Utility bar tetap tampil, satu baris (link + Build; Chain dan Block disembunyikan).
- Wallet HP `W-JUDGE` tidak terverifikasi; tidak ada banner KYB di halaman ini karena semua aksinya permissionless.
- Koneksi wallet: [TBD T5-03] (WalletConnect via RainbowKit butuh `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, T4-04; alternatif browser wallet in-app di HP). Jaringan salah di HP memakai banner B-NETWORK versi ringkas: "Wrong network" + "Switch".

---

## 6. S5 Provider console

**Tujuan.** Provider memantau dan menjalankan kewajiban delivery: request masuk (Ack / Mark delivered / Decline & pay), status bond, proceeds, reputasi, dan "withdraw remaining bond" setelah expiry (design §7.2 S5; PK §6.1). **Aktor:** provider terdaftar (wallet = `provider` series). **Demo:** laptop samping / split screen selama 0:58–1:10 (request #1 di-ack agent ≤ 3 dtk lalu delivered; 05 §2.4), saat kill switch (request #2 tetap REQUESTED, countdown berjalan), dan setelah Confirm #1 (proceeds, bond dilepas $36, "8 CU delivered"). Kill switch ada di jendela agent, **bukan** di UI (05 §2.4).

### 6.1 Wireframe (desktop)

```text
+------------------------------------------------------------------------------------------------+
| [header + strip]                                                                                |
+------------------------------------------------------------------------------------------------+
| Provider console   0x1111…1111 ✓ Verified by Paron demo verifier · Active      [List capacity] |
|                                                                                                |
| +------------------+ +----------------------+ +---------------------+ +----------------------+ |
| | BOND (all series)| | PRIMARY PROCEEDS     | | REPUTATION          | | OPEN REQUESTS        | |
| | $5,409.00 locked | | Gross   $90.00       | | Delivered   8 CU    | | 1                    | |
| | Released $36.00  | | Fees    $0.90        | | Defaulted  10 CU    | | next deadline 0:41   | |
| | Paid out $45.00  | | Net     $89.10       | | Declined    0 CU    | |                      | |
| +------------------+ +----------------------+ | Strikes 1 · Lost 0  | +----------------------+ |
|                                               +---------------------+                          |
| INCOMING REQUESTS                                         Filter [Needs action v]              |
| Req  Series            CU   Holder        State                 Deadline     Actions           |
| #2   CU-JKT-H100-2610  10   0x2222…2222   Waiting for your ack  0:41 left    [Acknowledge]      |
|                                                                              [Decline & pay]   |
| #1   CU-JKT-H100-2610  8    0x2222…2222   Delivered             review 1:12  —                 |
|                                                                                                |
| MY SERIES                                                                                      |
| Series            Sold      Price   Bond balance          Status        Actions               |
| CU-JKT-H100-2610  30/500    $3.00   $2,169.00 / $2,250    Sale open     [Raise price]         |
| CU-JKT-H100-2611  0/720     $3.00   $3,240.00 / $3,240    Sale open     [Raise price]         |
| (after expiry)                                            Finalized     [Withdraw remaining   |
|                                                                          bond $X]              |
+------------------------------------------------------------------------------------------------+
| [utility bar]                                                                                      |
+------------------------------------------------------------------------------------------------+
```

Angka kartu = akhir demo (03 §3.15 contoh E12: provider Jakarta memegang series 1 dan 4).

### 6.2 Sumber data

| Bagian | Endpoint + field | Fallback onchain |
|---|---|---|
| Kartu bond | E12 `bond` {`deposited`, `balance`, `released`, `slashed`} (total semua series) | jumlah `BondVault.bondOf(id)` per series milik provider |
| Kartu proceeds | E12 `proceeds` {`gross`, `fees`, `net`} | — ("—") |
| Kartu reputasi | E12 `reputation` {`delivered_cu`, `defaulted_cu`, `voluntary_defaulted_cu`, `disputes_lost`, `strikes`} [D-33] | `ProviderRegistry.getProvider` |
| Kartu request terbuka | E12 `open_requests` + `next_deadline_ms` terkecil dari E10 | — |
| Tabel request | E10 `/v1/redemptions?provider={me}` (`state`, `actions`, `next_deadline_ms`, `delivery_ref`, `receipt_hash`) | `getRequest` + `stateOf` untuk `reqId` yang diketahui |
| Tabel series | E12 `series` + E5 per series (`bond`, `sold_supply`, `max_supply`, `primary_price`, `sale_open`, `finalized`) | `getSeries`, `bondOf`, `isSaleOpen` |

| State | Copy |
|---|---|
| Wallet bukan provider (E12 404) | "This wallet isn't a registered provider." + tombol "Register as provider" kalau role 1, selain itu link README KYB |
| Belum punya series | "No series yet." + tombol "List capacity" |
| Tidak ada request | "No redemption requests yet." |
| Filter "Needs action" kosong | "Nothing needs your action right now." |

### 6.3 Aksi request (provider)

| `actions` berisi | Tombol persis | Fungsi 01 | Syarat waktu (aturan §10) | Disabled / helper |
|---|---|---|---|---|
| `ACK` | "Acknowledge" | `acknowledge(reqId)` | aktif selama `now_s ≤ ack_deadline` | setelah lewat: tombol hilang, label "Ack deadline passed" |
| `MARK_DELIVERED` | "Mark delivered" | `markDelivered(reqId, receiptHash)` via M-DELIVER | aktif selama `now_s ≤ delivery_deadline` | setelah lewat: "Delivery deadline passed" |
| `DECLINE_AND_PAY` | "Decline & pay" | `declineAndPay(reqId)` via M-DECLINE | REQUESTED atau ACKNOWLEDGED [D-33], hanya selama `now ≤` deadline aktif (ack atau delivery) [D-47] | setelah deadline tombol hilang, label "Deadline passed. The holder can claim the default." [D-47]. **[D-63]** Gaya visual: tombol **outline** bahaya (garis merah, isi transparan), bukan isi merah; merah terisi hanya untuk "Claim default". Tanpa perubahan copy |

Baris "Access ref {delivery_ref}" tampil di detail baris; detail aksesnya sendiri (SSH key) diambil agent dari penyimpanan offchain [TBD T5-04].

Toast sukses: Ack "Request #{reqId} acknowledged. Deliver within {deliveryWindow}."; Delivered "Request #{reqId} marked delivered. Holder can confirm or dispute within {disputeWindow}."; Decline "Request #{reqId} declined. ${claim} paid to the holder from your bond."

**M-DELIVER (ack/deliver provider)**

```text
+------------------------------------------------------------+
| Mark #1 delivered                                      [x] |
|                                                            |
| Usage receipt   [ paste usage JSON or a 0x… hash        ]  |
|                 Hash 0xd1d1…d1d1 (computed)                |
|                 Only the hash goes on-chain. The holder    |
|                 and arbitrator can check it later.         |
| Deadline        0:52 left (server time)                    |
|                                                            |
|                    [Cancel]   [Mark delivered]             |
+------------------------------------------------------------+
```

- Input: teks JSON → `receiptHash` = keccak256 teks; atau hash 0x… 32 byte langsung. Kosong → tombol disabled "Add a receipt" (cegah `ZeroReceipt`). Format JSON receipt = [TBD T5-04]; MVP = hash JSON usage biasa [D-26].
- Di demo, agent yang mengirim `acknowledge` dan `markDelivered` (05 S-08, S-09); modal ini untuk provider manual dan fallback kalau agent mati di luar adegan kill switch.

**M-DECLINE (decline & pay)**

```text
+------------------------------------------------------------+
| Decline request #2 and pay now?                        [x] |
|                                                            |
| The holder receives $45.00 (10 CU × $4.50) from your bond  |
| right away. This counts as a declined request, not a       |
| missed deadline: no strike is recorded.                    |
|                                                            |
|                    [Cancel]   [Decline & pay $45.00]       |
+------------------------------------------------------------+
```

Copy "no strike" mengikuti D-33 opsi A (`voluntaryDefaultedCU` terpisah, `strikes` hanya untuk default paksa). Kalau D-33 berubah, kalimat kedua diganti "This is recorded as a voluntary default."

### 6.4 Aksi series (provider)

| Tombol persis | Fungsi 01 | Tampil / aktif kalau | Helper / disabled |
|---|---|---|---|
| "Raise price" (NICE UI) [APPROVED P6-17] | `SeriesFactory.raisePrimaryPrice(seriesId, newPrice)` | `sale_open` dan wallet = provider | modal: "New price must be above ${current} and at most ${bondPerCU ÷ 1.5} (your bond supports up to that price)." [D-28]; kalau max = harga sekarang: tombol disabled "Bond is at the 1.5× floor; price can't go higher." |
| "Finalize series" | `SeriesFactory.finalizeSeries(seriesId)` | `now ≥ windowEnd + grace` dan `open_requests` = 0 [D-14] | sebelum itu: "Available after {windowEnd + grace} once all requests are settled." |
| "Withdraw remaining bond ${balance}" | `BondVault.withdrawRemaining(seriesId)` | E5 `bond.finalized` true dan `bond.withdrawn` false | sebelum final: tidak tampil; setelah ditarik: label "Bond withdrawn" |

Toast sukses: Raise "Primary price raised to ${newPrice}/CU."; Finalize "Series {symbol} finalized. {voided} unredeemed CU voided."; Withdraw "Withdrew ${amount} remaining bond." Tidak ada di naskah demo (window demo belum habis; 07 D-14).

### 6.5 Mobile

Kartu ringkasan menjadi 2×2, tabel request menjadi kartu (seperti R-CARD) dengan tombol aksi lebar penuh. Tidak dipakai di naskah.

---

## 7. V-STMT Statement dan ekspor CSV

**Tujuan.** Statement per akun (trade, fee, redemption, default) dengan link explorer, untuk holder, provider, dan auditor (design §10.2 G10; PK §6.6: API MUST, CSV NICE; PK §6 "Auditor" tanpa layar terpisah). **Route** `/statements?address={addr}` (sitemap §4.3; tanpa param = wallet terhubung) [APPROVED P6-24], juga sebagai tab Statement di `/portfolio`; dibuka dari wallet chip, S4 ("View statement", "Export CSV"), dan S5. Alamat apa pun boleh dibuka (data publik onchain). **Demo:** tidak ada adegan; cadangan untuk tanya-jawab juri.

```text
+------------------------------------------------------------------------------------------------+
| Statement · 0x2222…2222 ✓                                 [Download CSV]  [Copy API link]      |
| From [2026-10-10] To [2026-10-10]  Series [All v]  Type [All v]                                |
|                                                                                                |
| USDC in $45.00 · USDC out $60.00 · Fees $0.00 · CU bought 20 · CU sold 0 · CU redeemed 18 ·    |
| Default payouts $45.00                                                                         |
|                                                                                                |
| Time      Type              Series            Req  Order  USDC       CU    Counterparty  Tx   |
| 10:00:40  Primary buy       CU-JKT-H100-2610  —    —      −$60.00    +20   0x1111…1111   ↗    |
| 10:01:30  Redemption lock   CU-JKT-H100-2610  1    —      $0.00      −8    0x9999…9999   ↗    |
| 10:02:00  Redemption burn   CU-JKT-H100-2610  1    —      $0.00      0     0x1111…1111   ↗    |
| 10:03:00  Redemption lock   CU-JKT-H100-2610  2    —      $0.00      −10   0x9999…9999   ↗    |
| 10:04:01  Default payout    CU-JKT-H100-2610  2    —      +$45.00    0     0x1111…1111   ↗    |
|                                                                        [Load more]             |
+------------------------------------------------------------------------------------------------+
```

Sumber E9 `/v1/accounts/{addr}/statement` (urut lama → baru, P3-20): baris `ts_ms`, `kind`, `symbol`, `req_id`, `order_id`, `usdc_delta`, `cu_delta`, `counterparty`, `explorer_url`; `summary` {`usdc_in`, `usdc_out`, `fees_paid`, `cu_bought`, `cu_sold`, `cu_redeemed`, `default_payouts`}. Angka contoh = 03 §3.12.

**Label `kind` (persis)** (nilai dari 03 T13, P3-13)

| `kind` | Label UI | `kind` | Label UI |
|---|---|---|---|
| `PRIMARY_BUY` | "Primary buy" | `BOND_WITHDRAW` | "Bond withdrawn" |
| `PRIMARY_PROCEEDS` | "Primary proceeds" | `DEFAULT_PAYOUT` | "Default payout" |
| `TRADE_BUY` | "Trade buy" | `BOND_SLASHED` | "Bond paid to holder" |
| `TRADE_SELL` | "Trade sell" | `DISPUTE_BOND_PAID` | "Dispute bond posted" |
| `FEE_PAID` | "Fee" | `DISPUTE_BOND_RETURNED` | "Dispute bond returned" |
| `FEE_RECEIVED` | "Fee received" | `DISPUTE_BOND_FORFEITED` | "Dispute bond forfeited" |
| `BOND_DEPOSIT` | "Bond deposit" | `DISPUTE_BOND_AWARDED` | "Dispute bond awarded" |
| `BOND_RELEASE` | "Bond released" | `REDEMPTION_LOCK` | "Redemption lock" |
| `REDEMPTION_BURN` | "Redemption burn" | `REDEMPTION_UNLOCK` | "Redemption refund" |

| Elemen | Copy / aturan |
|---|---|
| "Download CSV" | link ke E9 `format=csv` dengan filter yang sama; nama file `paron-statement-{addr4}-{from}-{to}.csv`. Kalau CSV belum dibangun (NICE): tombol disembunyikan, bukan disabled |
| "Copy API link" | menyalin URL E9 JSON; toast "API link copied." |
| Helper baris non-kas | tooltip di `BOND_SLASHED` dengan `usdc_delta` 0: "Cash left your wallet at bond deposit; the slashed amount is shown on the series page." (03 P3-32) |
| Kosong | "No activity for this account in this period." |
| API mati | "Statements need the Paron API. Try again shortly." (tidak ada fallback onchain) |
| Loading | 8 baris skeleton |

---

## 8. S6 Prints & index (NICE) dan S7 Arbitration (NICE)

### 8.1 S6 Prints & data (index/prints view)

**Tujuan.** Data pasar terbuka: chart PrintIndex vs referensi sintetis, tabel print dengan flag eligible, statistik default, dan ekspor (design §7.2 S6, §10.5; PK §6.3, §6.4). Layarnya NICE; **data API-nya MUST** (PK §6 peta layar). **Aktor:** publik, trader, analis. **Demo:** naskah memakai terminal `curl …/v1/prints?gpu=H100&limit=3` (1:20–1:35), bukan S6. Kalau S6 tidak dibangun, strip indeks (§1.1) + tape S3 + `curl` sudah menutupi adegan. **Route (sitemap §4.1):** kartu indeks → `/h100-index`, tabel prints + CSV + contoh `curl` → `/data`, delivery record → `/transparency`. Satu wireframe di bawah boleh dipecah menjadi tiga halaman itu tanpa mengubah copy.

```text
+------------------------------------------------------------------------------------------------+
| Prints & data                         GPU [H100 v]  Region [All v]  From [ ] To [ ]            |
|                                                                                                |
| +-------------------------------------------+  +---------------------------------------------+ |
| | H100 INDEX                                |  | CHART (NICE)                                | |
| | Status   OK                               |  |  3.40 |                                     | |
| | Value    $3.20 / CU                       |  |  3.20 |            ●──── PrintIndex          | |
| | On-chain VWAP $3.20                       |  |  3.00 |------------------ Spot reference     | |
| | Entities 2 · Eligible volume 5 CU (24h)   |  |       |                   (synthetic demo    | |
| | Method   winsorized VWAP · METHODOLOGY.md |  |       +----------------------- data)       | |
| +-------------------------------------------+  +---------------------------------------------+ |
|                                                                                                |
| PRINTS                                                              [Download CSV]             |
| Time      Type     Series            Price/CU  Per GPU-h  Qty  Value   Eligible        Tx      |
| 10:01:05  Trade    CU-JKT-H100-2610  $3.20     $3.20      5    $16.00  ✓               ↗       |
| 10:00:50  Primary  CU-JKT-H100-2610  $3.00     $3.00      10   $30.00  — primary sale  ↗       |
| 10:00:40  Primary  CU-JKT-H100-2610  $3.00     $3.00      20   $60.00  — primary sale  ↗       |
|                                                                                                |
| DELIVERY RECORD (NICE)   Oct 2026 · delivered 8 CU · defaulted 10 CU · default rate 55.6%      |
+------------------------------------------------------------------------------------------------+
```

| Bagian | Sumber | Copy khusus |
|---|---|---|
| Kartu indeks | E2 `/v1/index/{gpu}`: `status`, `value`, `onchain_vwap`, `participants`, `eligible_volume_cu`, `method`, `thresholds` [D-15] [D-16]; fallback `PrintIndex.statusOf` + `latestRoundData` | status sama dengan §1.1; baris method "winsorized VWAP · METHODOLOGY.md" |
| Chart | E3 `/v1/index/{gpu}/history` (NICE) + E15 referensi | garis referensi wajib berlabel "Spot reference (synthetic demo data)" (design §10.5 #2); tanpa angka OCPI [D-06]. Logo TradingView mati lewat `attributionLogo: false` (`web/components/charts.tsx`). Kredit lisensi berupa teks polos di `/legal/risk` (`web/app/legal/risk/page.tsx`). Larangan logo dan tautan pihak ketiga tetap, dengan pengecualian kredit lisensi ini saja |
| Tabel prints | E1 `/v1/prints?gpu=&region=&from=&to=&limit=` (`kind`, `cu_price`, `price_per_gpu_hour`, `qty_cu`, `notional_usd`, `eligible`, `ineligible_reason`, `explorer_url`) | label eligible sama dengan tape S3 (§4.5) |
| "Download CSV" | E1 `format=csv` dengan filter sama | file `paron-prints-{gpu}-{from}-{to}.csv` |
| Delivery record | E16 `/v1/deliveries?gpu=&month=` (NICE): `delivered_cu`, `defaulted_cu`, `default_rate` [03 P3-36] | "Default rate = defaulted ÷ (delivered + defaulted)" |
| Kosong | — | "No prints for these filters yet." |

Contoh lot kartu edukasi (design §10.5 #3), opsional di S6: "720 CU = 1 H100 for November (720 hours)".

### 8.2 S7 Arbitration view (NICE, ringkas)

Untuk panel 2-of-3 (PK §6.5). **Route (sitemap §4.6):** antrian `/arbiter`, kasus `/arbiter/cases/{reqId}`, histori `/arbiter/history` (publik read-only). Design §7.2 menandai S7 NICE, sedangkan sitemap §9 menaruhnya di Tier 1 (anti-mock: putusan harus bisa dari UI) [X6-19]. Kalau tidak dibangun: panel memakai R-CARD S4-R (bukti `receipt_hash` + `delivery_ref`) dan tanda tangan lewat script/Safe [D-36], dengan risiko kritik "mocked" (sitemap §1). Cara mengumpulkan tanda tangan tanpa backend = [D-43] (rekomendasi: paket tanda tangan di fragment URL + copy-paste). Spesifikasi minimal kalau dibangun:
- Daftar dispute dari E17 `/v1/disputes?status=open`: "Req", "Series", "Claim", "Dispute bond", "Receipt", "Ruling due" (countdown §10, `ruling_deadline_ms`), "Signatures {n}/{threshold}".
- Tombol "Sign: Delivered" / "Sign: Not delivered" = tanda tangan EIP-712 offchain; "Submit ruling" = `PanelArbitrator.ruleWithSignatures(reqId, outcome, signatures)` saat tanda tangan ≥ threshold. Mode Safe: tombol "Open in Safe".
- Disabled setelah `ruling_deadline` lewat: "Ruling deadline passed. Anyone can refund this request." Error: grup PanelArbitrator §9.2.
- Data demo: satu dispute fiktif berlabel di fixture (03 E17), karena naskah panggung tidak memuat dispute.

---

## 9. Toast transaksi dan pemetaan error revert → copy

### 9.1 Siklus toast (semua tx)

Setiap tombol tx menjalankan simulasi dulu (wagmi `simulateContract`), lalu mengirim. Revert di simulasi memakai copy §9.2 yang sama, tanpa membuka wallet.

| Tahap | Copy persis | Perilaku |
|---|---|---|
| Menunggu tanda tangan | "Confirm in your wallet…" | toast loading; tombol "Cancel" tidak ada (pembatalan dari wallet) |
| Terkirim | "{Action} submitted. Waiting for confirmation…" + link "View on explorer" | loading |
| Lambat (> 15 s, 05 P5-24) | "Still waiting for the network… (tx {hash4})" | tetap loading; **tidak** kirim ulang otomatis |
| Sukses | copy sukses per aksi (lihat tiap layar) + "View on explorer" | hilang setelah 6 s |
| Revert | "{Action} failed: {copy §9.2}" | menetap sampai ditutup |
| Ditolak di wallet (EIP-1193 4001) | "Cancelled in your wallet." | hilang setelah 4 s |
| Diganti / hilang | "The transaction was replaced or dropped. Check your wallet." | menetap |
| RPC gagal [D-89] | Teks redup, bukan error merah. Jeda 400 ms, 800 ms, 1600 ms. `NEXT_PUBLIC_RPC_URL_BACKUP` hanya kalau terisi (04 §4.5) | ulang baca, bukan kirim tx ulang |
| Error tak dikenal | "{Action} failed. {shortMessage}" + "Copy details" | menetap |

Nama `{Action}`: "Purchase", "Order", "Cancel", "Redemption request", "Confirmation", "Dispute", "Default claim", "Finalization", "Refund", "Acknowledgment", "Delivery", "Decline", "Listing", "Permit", "Price change", "Series finalization", "Bond withdrawal", "Faucet", "Registration", "Approval".

### 9.2 Pemetaan error kustom 01 → copy UI

Decode memakai ABI semua kontrak (dari `forge inspect`, 07 D-22). Argumen error diformat sesuai §0.3. Error yang hanya bisa muncul dari bug atau salah wiring (role/akses internal) memakai copy generik G: "Unexpected contract error ({ErrorName}). Please report it." Kolom "Di mana" = layar yang bisa memicunya.

**ProviderRegistry / ConversionTable**

| Error | Copy UI | Di mana |
|---|---|---|
| `NotVerified()` | "Your verification is missing or expired." | S2 register |
| `NotProviderRole()` **[D-45]** | "This attestation is for a buyer. Providers need a provider verification (role 1)." | S2 register |
| `AlreadyRegistered()` | "This wallet is already registered as a provider." | S2, S5 |
| `UnknownProvider()` | "This wallet isn't a registered provider." | S5 |
| `OnlyRedemptionManager()` | G | — |
| `UnknownGpuModel(gpuModel)` | "GPU model {gpuModel} isn't supported." | S2 |
| `InvalidFactor()` | G | — |

**SeriesFactory**

| Error | Copy UI | Di mana |
|---|---|---|
| `ProviderNotListable()` | "This provider can't list right now (not verified, or suspended)." | S2 |
| `ZeroSupply()` | "GPU-hours must give at least 1 CU." | S2 |
| `ZeroPrice()` | "Primary price must be above $0." | S2 |
| `InvalidWindow()` | "That delivery month isn't allowed. Pick a month that hasn't ended." [D-19] | S2 |
| `BondBelowFloor(bondPerCU, minBondPerCU)` | "Bond per CU must be at least ${minBondPerCU} (1.5× the price). You entered ${bondPerCU}." | S2, S5 raise price [D-28] |
| `ArbitratorNotAllowed(arbitrator)` | "This arbitrator isn't on the allowlist." | S2 |
| `AckWindowOutOfBounds()` | "Ack window is outside the allowed range." | S2 |
| `DeliveryWindowOutOfBounds()` | "Delivery window is outside the allowed range." | S2 |
| `DisputeWindowOutOfBounds()` | "Dispute window is outside the allowed range." | S2 |
| `MinRedemptionTooSmall()` | "Minimum redemption must be at least 1 CU." | S2 |
| `MinRedemptionAboveSupply()` | "Minimum redemption can't exceed the series supply." | S2 |
| `UnknownSeries(seriesId)` | "Series #{seriesId} doesn't exist on this deployment." | S3, S4, S5 |
| `NotSeriesProvider()` | "Only this series' provider can do that." | S5 |
| `PriceCanOnlyIncrease()` | "The new price must be higher than the current price." | S5 |
| `SaleClosed()` | "The primary sale for this series has closed." | S3, S5 |
| `SeriesNotExpired()` | "This series can't be finalized yet (window or grace period still running)." | S3, S5 |
| `OpenRequestsRemaining(count)` | "{count} redemption requests are still open. Settle them first." | S3, S5 |
| `AlreadyFinalized()` | "This series is already finalized." | S3, S5 |

**CUToken**

| Error | Copy UI | Di mana |
|---|---|---|
| `TransfersClosed(windowEnd)` | "This series ended on {windowEnd}. CU can no longer be transferred." [D-29] | S3 order, wallet transfer |
| `RecipientNotVerified(to)` | "This is an institutional series. {to} isn't a verified wallet." | S3 (series `institutional`) |
| `OnlyPrimarySale()`, `OnlyRedemptionManager()` | G | — |

**BondVault**

| Error | Copy UI | Di mana |
|---|---|---|
| `NotFinalized()` | "Finalize the series before withdrawing the bond." | S5 |
| `AlreadyWithdrawn()` | "The remaining bond was already withdrawn." | S5 |
| `NotSeriesProvider()` | "Only this series' provider can withdraw its bond." | S5 |
| `InsufficientBond(balance, amount)` | "The series bond (${balance}) can't cover ${amount}." (seharusnya tidak terjadi, invariant D-18) | S4 claim |
| `AlreadyFinalized()` | "This series is already finalized." | S5 |
| `OnlyFactory()`, `OnlyRedemptionManager()`, `BondAlreadyExists()` | G | — |

**PrimarySale**

| Error | Copy UI | Di mana |
|---|---|---|
| `MaxCostRequired()` | G (UI selalu mengisi `maxCost`) | S3 |
| `SlippageExceeded(cost, maxCost)` | "The price changed. It now costs ${cost} (your limit was ${maxCost}). Review and try again." | S3 |
| `ZeroQty()` | "Enter a quantity above 0." | S3 |
| `SaleClosed()` | "The primary sale for this series has closed." | S3 |
| `SeriesPaused()` | "Sales are paused for this series." [D-32] | S3 |
| `SupplyExceeded(remaining)` | "Only {remaining} CU are left." | S3 |
| `BuyerNotVerified(buyer)` | "Verify your wallet to buy. {buyer} has no active attestation." [D-31] | S3 |
| `InvalidLot()` **[D-52]** | "Quantity must be a whole number of CU." (input qty M-BUY memakai langkah 1 CU, jadi error ini hanya muncul dari bug) | S3 |
| `UnknownSeries(seriesId)` | lihat SeriesFactory | S3 |
| `ZeroAddress()`, `FeeTooHigh()` | G | — |

**OrderBook**

| Error | Copy UI | Di mana |
|---|---|---|
| `InvalidTick()` | "Price must be a multiple of $0.01." | S3 |
| `ZeroQty()` | "Enter a quantity above 0." | S3 |
| `OrderBookClosed()` | "Trading closed: the delivery window has ended. You can still cancel open orders." | S3 |
| `SeriesPaused()` | "New orders are paused for this series. You can still cancel." | S3 |
| `TraderNotVerified(trader)` | "Verify your wallet to trade. {trader} has no active attestation." [D-31] | S3 |
| `SelfMatch()` | "Blocked: self-trade. Both sides belong to the same verified entity, so the trade can't print or move the index." (kartu besar, §4.4) [D-35] | S3 |
| `TooManyPriceLevels()` | "The book is full at 10 price levels per side. Join an existing price level." [D-17] | S3 |
| `InvalidLot()` **[D-52]** | "Order size must be a whole number of CU." (input qty M-ORDER langkah 1 CU) | S3 |
| `NotOrderOwner()` | "You can only cancel your own orders." | S3 |
| `OrderNotFound()` | "This order no longer exists (filled or cancelled)." | S3 |
| `UnknownSeries(seriesId)` | lihat SeriesFactory | S3 |
| `FeeTooHigh()`, `ZeroAddress()` | G | — |

**RedemptionManager**

| Error | Copy UI | Di mana |
|---|---|---|
| `UnknownRequest(reqId)` | "Request #{reqId} doesn't exist." | S4, S4-R, S5 |
| `OutsideRedemptionWindow()` | "Redemptions are only possible during the delivery window ({window})." | S4 |
| `BelowMinRedemption(min)` | "Minimum redemption is {min} CU." | S4 |
| `ZeroAmount()` | "Enter an amount above 0." | S4 |
| `ZeroReceipt()` | "Add a delivery receipt before marking delivered." | S5 |
| `NotHolder()` | "Only the holder who made this request can do that." | S4 |
| `NotProvider()` | "Only this series' provider can do that." | S5 |
| `NotArbitrator()` | G | — |
| `InvalidState(current)` | "This request is already {current, lowercase}. Refreshing…" (lalu refetch) | S4, S4-R, S5 |
| `AckDeadlinePassed()` | "Too late: the ack deadline has passed. The holder can now claim the default." | S5 |
| `DeliveryDeadlinePassed()` | "Too late: the delivery deadline has passed." | S5 |
| `DisputeWindowClosed()` | "The dispute window has closed." | S4 |
| `DisputeWindowOpen()` | "Can't finalize yet: the dispute window is still open." | S4, S4-R |
| `NotDefaultable()` | "Not claimable yet. The deadline passes at {deadline} (server time). If the button is live, send it: the contract decides." | S4, S4-R |
| `RulingDeadlinePassed()` | "The ruling deadline has passed. Use Refund (no ruling)." | S7 |
| `RulingDeadlineNotReached()` | "Can't refund yet: the panel still has time to rule." | S4, S4-R |
| `InvalidRuling()` | G | — |

Khusus `InvalidState` saat "Claim default" dan request sudah `DEFAULTED` oleh orang lain: "Already settled: someone claimed this default first. The holder was paid ${payout}." (data E11).

**PanelArbitrator (S7, NICE)**

| Error | Copy UI |
|---|---|
| `DisputeAlreadyOpen()` | "A dispute is already open for this request." (juga mungkin di S4 M-DISPUTE) |
| `UnknownDispute()` | "No dispute found for this request." |
| `AlreadyRuled()` | "This dispute has already been ruled." |
| `RulingDeadlinePassed()` | "The ruling deadline has passed." |
| `InsufficientSignatures(got, need)` | "{got} of {need} panel signatures collected." |
| `InvalidSignature()` | "A signature is invalid. Ask the panel member to sign again." |
| `DuplicateSigner(signer)` | "{signer} already signed." |
| `NotPanelMember()` | "This wallet isn't on the panel." |
| `InvalidRuling()`, `InvalidThreshold()`, `OnlyRedemptionManager()` | G |

**PrintIndex / ReferenceFeed** (hanya muncul di baca onchain fallback, bukan tx pengguna)

| Error | Copy UI |
|---|---|
| `NoData()` (PrintIndex) | strip: "{GPU} index · THIN · no eligible prints yet" |
| `NoData()` (ReferenceFeed) | sembunyikan nilai referensi |
| `StaleObservation()`, `InvalidSignature()` | tidak tampil ke pengguna (hanya pemasok feed) |
| `OnlyOrderBook()`, `OnlyRedemptionManager()`, `UnknownGpuModel(gpuModel)` | G |

**MockUSDC / ERC-20 / permit**

| Error | Copy UI | Di mana |
|---|---|---|
| `FaucetCooldown(nextAt)` | "Faucet cooling down. Try again at {nextAt}." [D-40] | wallet menu |
| `AccessControlUnauthorizedAccount(account, role)` | G | — |
| `ERC20InsufficientBalance(...)` (OZ 5) | "Not enough {token} in your wallet." | S2, S3, S4 dispute |
| `ERC20InsufficientAllowance(...)` (OZ 5) | "Approval needed. Approve {token} and try again." (tombol berubah jadi "Approve") | S3, S4 dispute, S2 fallback |
| `ERC2612ExpiredSignature(...)` (OZ 5) | "The permit signature expired. Sign again." | S2 |
| `ERC2612InvalidSigner(...)` (OZ 5) | "The permit signature didn't match this wallet. Sign again, or use two transactions." | S2 |

**Gate (EASGate / RegistryGate)** [D-23]

| Error | Copy UI |
|---|---|
| `NotVerified()` | "Your wallet isn't verified." |
| `AttestationRevoked()` | "Your attestation was revoked by the verifier." |
| `AttestationExpired()` | "Your attestation has expired. Ask the verifier to renew it." |
| `UnknownAttestation()` | "Attestation not found on this chain." |
| `StaleAttestation()` **[D-55b]** | "A newer attestation is already linked to this wallet." |
| `WrongSchema()` | "That attestation uses a different schema." |
| `UntrustedAttester(attester)` | "{attester} isn't a trusted verifier for Paron." |
| `RecipientMismatch()` | "That attestation belongs to another wallet." |
| `ZeroEntity()` | G |

---

## 10. Aturan countdown dan deadline (aturan detik penuh)

Sumber: 01 §6.8.1 (aksi provider/holder boleh selama `now ≤ deadline`; `claimDefault` hanya saat `now > deadline`), 03 E10 dan P3-33 (perbandingan ketat dalam **detik**), 05 P5-15 (anvil memakai waktu chain), 03 §3.1 `meta.server_now_ms` dan 07 D-48 (aturan jam tunggal; menggantikan P5-16 countdown dari timestamp blok).

1. **Jam (`now_s`) [D-48].** `now_s = floor((jam lokal + offset) / 1000)`, dengan `offset = meta.server_now_ms − jam lokal saat respons API diterima` (disetel ulang di setiap respons; median beberapa respons terakhir). Mode anvil: `server_now_ms` = waktu chain (05 P5-15). Fallback onchain tanpa API (§11.2): `offset` = 0 (jam laptop), dengan label "(local time)". Alasan: di testnet ArbOS blok hanya dibuat saat ada tx, jadi `block.timestamp` bisa diam lama dan countdown berbasis blok membeku (AUDIT SC-4). Menggantikan ekstrapolasi blok [P6-18].
2. **Semua deadline dalam detik.** Field API `*_ms` dibagi 1000 dan dibulatkan ke bawah; nilai onchain (`uint64` detik dari `getRequest`) dipakai apa adanya.
3. **Sisa waktu** `remaining = deadline_s − now_s`.
   - `remaining > 0`: tampil "m:ss" (< 1 jam), "h:mm:ss" (< 1 hari), "{d}d {h}h" (≥ 1 hari).
   - `remaining = 0`: tampil "0:00" dengan label "Deadline reached".
   - `remaining < 0`: tampil "{m:ss} ago" (overdue).
   - Label kecil "(server time)" di samping countdown di S4, S4-R, S5 [D-48].
4. **Aksi sebelum deadline (inklusif):** `acknowledge`, `markDelivered`, `dispute` aktif selama `now_s ≤ deadline_s`. Saat `remaining ≤ 5` tampilkan peringatan "Deadline in {s}s. Your transaction may land too late." [APPROVED P6-21]. Setelah `now_s > deadline_s` tombol hilang.
5. **Aksi setelah deadline [D-48]:** `claimDefault`, `finalizeRedemption`, `resolveNoRuling` tampil dan aktif kalau `now_s > deadline_s + 2`. Antara `deadline_s` dan `deadline_s + 2` tombol masih disabled ("Unlocks when the deadline passes."). Satu aturan untuk semua klien dan juga untuk E10 `actions` (03 §2.4).
6. **Simulasi lalu kirim; tx yang memutuskan [D-48].** Sebelum kirim, simulasikan tx (`claimDefault` / `finalizeRedemption` / `resolveNoRuling`). Kalau simulasi revert `NotDefaultable`/`DisputeWindowOpen`/`RulingDeadlineNotReached` padahal `now_s > deadline_s + 2` (kemungkinan `eth_call` memakai blok basi di chain sepi, T6-01), tombol **tetap aktif**: kirim tx dengan gas limit tetap, tampilkan "Waiting for the next block…", dan hasil tx yang menentukan. Revert lain → copy §9.2.
7. **API vs chain beda.** Aturan jam sama untuk API dan klien, jadi `DEFAULTABLE` API dan tombol muncul bersamaan. Kalau API tertinggal (indexer lambat), tombol tetap mengikuti butir 5 (fallback P5-23); kontrak tetap pemutus akhir.
8. **Setelah tx sukses:** state lokal langsung diperbarui dari event receipt; data API di-refetch sampai `meta.indexed_block` ≥ blok tx.

---

## 11. Mode data

### 11.1 Live (default)

`NEXT_PUBLIC_DATA_SOURCE=live` (04 §4): daftar, riwayat, agregat dari API `NEXT_PUBLIC_API_BASE_URL`; saldo, allowance, quote, dan cek pra-kirim dari RPC. Polling API 2 s di S3/S4/S4-R/S5, 10 s di S1/S6, ditambah refetch setelah tiap receipt tx [APPROVED P6-20]. Setiap respons membawa `meta.indexed_block`; UI memakai nilai ini untuk menunggu indexer setelah tx (§10 butir 8).

### 11.2 Fallback onchain (API mati, 05 P5-23, 03 P3-12)

**[D-58]** Mode ini jadi **S0-kritis**: juri meninjau async Sab 12:00 → Min 11 Okt, jadi API hosted yang mati tidak boleh membuat UI kosong. Wajib jadi sebelum T0+8h = **19:14 WIB** (T0 = 11:14 WIB; 08 §1).

| Layar | Baca langsung | Tidak tersedia (copy pengganti) |
|---|---|---|
| Strip | `PrintIndex.statusOf`, `latestRoundData`; `ReferenceFeed.latestRoundData`, `label()` | participants / volume ("—") |
| S1 | `SeriesFactory.getSeries(id)` untuk id 1..N, `isSaleOpen`, `ProviderRegistry.getProvider` | Last, 24h vol, coverage ("—"). N = `SeriesFactory.seriesCount()` (01 §6.3, ditambahkan Jum 9 Okt) [APPROVED P6-19; cadangan: manifest deployment] |
| S3 | `getSeries`, `bondOf`, `getLevels(id, side, 10)`, `bestAsk`, `quote`, `remaining`, `isSaleOpen`, `getOrder` | tape ("Trade history needs the Paron API…"), reputasi rinci |
| S4 / S4-R | `CUToken.balanceOf`, `isRedeemWindowOpen`, `getRequest(reqId)`, `stateOf(reqId)`, `disputeBondFor` | daftar request di luar sesi ini ([APPROVED P6-15]: simpan `reqId` dari receipt di localStorage; S4-R tetap jalan karena `reqId` ada di URL) |
| S5 | `getProvider`, `bondOf`, `getSeries`, `openRequestCount` | proceeds, daftar request ("Request list needs the Paron API.") |
| V-STMT, S6, S7 | — | "This view needs the Paron API. Try again shortly." |

`NEXT_PUBLIC_RPC_URL_BACKUP` final [D-89]. Kosong = hanya URL utama. Kalau terisi, transport cadangan dipakai setelah RPC utama gagal. Kegagalan yang tetap = teks redup, bukan error merah. Alamat kontrak dari manifest `deployments/<label>.json` (04 §7).

### 11.3 Mock

`NEXT_PUBLIC_DATA_SOURCE=mock`: data dari `fixtures/v1/` (03, snapshot t0..t3); banner "Mock data (fixtures). Transactions are disabled."; semua tombol tx disabled dengan tooltip "Disabled in mock mode". Pemilih snapshot t0..t3 hanya di build dev [APPROVED P6-22]. Dipakai frontend sebelum indexer siap (04 §10).

---

## 12. Inventaris komponen

Nama komponen = usulan nama file/komponen frontend (shadcn + Tailwind, stack §4.3). Tidak ada implementasi di sini.

| Komponen | Dipakai di | Data / fungsi | Catatan |
|---|---|---|---|
| `AppShell` | semua | — | header, slot banner, utility bar |
| `NavBar` | semua | E12/E13 (menu Provider) | mobile: menu lipat |
| `ChainBadge` | header | `NEXT_PUBLIC_CHAIN_ID`, blok terbaru | "Robinhood Chain Testnet ●"; kalau ruang sempit (mobile) "Testnet · 46630 ●" [D-60] |
| `WalletButton` + `WalletMenu` | header | RainbowKit, E13, `MockUSDC.balanceOf`, `faucet()` | §1.2 |
| `NetworkGuard` | semua tombol tx | wagmi chain | B-NETWORK §1.3 |
| `DataStatusBanner` | semua | E18, mode env | B-DATA §1.6 |
| `IndexStrip` | header | E2, E15 / `PrintIndex`, `ReferenceFeed` | §1.1 |
| `UtilityBar` | semua | `NEXT_PUBLIC_DEPLOY_LABEL`, chain, blok terbaru | §0.2; menggantikan `DisclaimerFooter` [D-64]; APPROVED [D-65] |
| `VerifiedBadge` | S1, S3, S5, wallet | E13 / E4 `provider.verified` | "Verified by Paron demo verifier" [D-04] |
| `AttestationDrawer` | dari badge | E13 | §1.5 |
| `KybGateModal` | S2, S3 | E13 / `gate.isVerified` | §1.4 [D-31] |
| `SeriesTable` + `SeriesFilters` + `SeriesCard` (mobile) | S1 | E4 | §2 |
| `ListingWizard` (`StepCapacity`, `StepTerms`, `StepBondLaunch`) | S2 | E14, `createSeriesWithPermit` / `createSeries` | §3 |
| `ListingPreviewCard` | S2 | hitungan lokal | §3 |
| `DemoStopwatch` | S2→S3 | `NEXT_PUBLIC_DEMO_PRESETS` | [APPROVED P6-11] |
| `SeriesHeader` | S3 | E5 | §4.2 |
| `PrimaryBuyBox` + `BuyConfirmModal` | S3 | `quote`, `buy` | §4.3 |
| `OrderBookLadder` | S3 | E6 / `getLevels` | maks 10 level [D-17] |
| `OrderForm` | S3 | `placeOrder` | §4.4 |
| `MyOrdersTable` | S3 | E7, `cancelOrder` | §4.4 |
| `SelfMatchCallout` | S3 | decode `SelfMatch()` | §4.4 [D-35] |
| `TradesTape` | S3 | E1 `?series=` | §4.5 |
| `BondHealthBar` | S3, S5, S2 preview | E5 `bond` / `bondOf` | animasi perubahan |
| `RedemptionTermsCard` | S3 | E5 `terms` | §4.7 |
| `FinalizeSeriesButton` | S3, S5 | `finalizeSeries` | [D-14] |
| `ProviderReputationCard` | S3, S5 | E12 `reputation` | [D-33] |
| `HoldingsTable` | S4 | E8 | §5.2 |
| `RedeemModal` | S4 | `requestRedemption` | §5.3 [D-38] |
| `RedemptionCard` (R-CARD) + `RedemptionTimeline` | S4, S4-R, S5 (mobile) | E10, E11 / `getRequest`, `stateOf` | §5.4 |
| `Countdown` | S4, S4-R, S5, S7 | `useChainTime` | §10 |
| `useChainTime` (hook) | `Countdown`, tombol deadline | header blok | §10 butir 1 |
| `DeadlineActionButton` | semua aksi deadline | cek onchain pra-kirim | §10 butir 4–6 |
| `DisputeModal` | S4 | `disputeBondFor`, `dispute` | §5.5 |
| `ClaimDefaultSheet` + `ClaimSuccessCard` | S4, S4-R | `stateOf`, `claimDefault` | §5.6, §5.7 |
| `PhoneQrButton` | S4 | URL S4-R | [APPROVED P6-16] |
| `ProviderSummaryCards` | S5 | E12 | §6.2 |
| `IncomingRequestsTable` | S5 | E10 `?provider=` | §6.3 |
| `MarkDeliveredModal` | S5 | `markDelivered` | §6.3 [D-26] |
| `DeclineAndPayModal` | S5 | `declineAndPay` | §6.3 [D-33] |
| `ProviderSeriesTable` + `RaisePriceModal` + `WithdrawBondButton` | S5 | E12, E5, `raisePrimaryPrice`, `withdrawRemaining` | §6.4 |
| `StatementView` + `CsvExportButton` | V-STMT, S6 | E9, E1 `format=csv` | §7, §8.1 |
| `IndexCard`, `PrintsTable`, `IndexChart` (NICE), `DeliveryStats` (NICE) | S6 | E1, E2, E3, E15, E16 | §8.1 |
| `DisputeQueue` (NICE) | S7 | E17, `ruleWithSignatures` | §8.2 [D-36] |
| `TxToast` | semua tx | siklus §9.1 | |
| `decodeRevert` (util) | semua tx | ABI semua kontrak | §9.2 |
| `Amount`, `AddressChip`, `ExplorerLink`, `TimeAgo` | semua | §0.3, §0.4 | |
| `EmptyState`, `Skeleton`, `ErrorState` | semua | — | copy per layar |

---

## 13. Matriks layar × endpoint

Kode: **M** = sumber utama, **o** = opsional/NICE, **·** = tidak dipakai.

| Layar | E1 | E2 | E3 | E4 | E5 | E6 | E7 | E8 | E9 | E10 | E11 | E12 | E13 | E14 | E15 | E16 | E17 | E18 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Shell (strip, banner, wallet) | · | M | · | · | · | · | · | · | · | · | · | M | M | · | o | · | · | M |
| M-KYB / D-ATTEST | · | · | · | · | · | · | · | · | · | · | · | M | M | · | · | · | · | · |
| S1 Market | · | M | · | M | · | · | · | · | · | · | · | · | M | · | o | · | · | · |
| S2 List capacity | · | · | · | · | M | · | · | · | · | · | · | M | M | M | · | · | · | · |
| S3 Series page | M | M | · | · | M | M | M | · | · | · | · | M | M | · | o | · | · | · |
| S4 Portfolio | · | · | · | · | M | · | · | M | o | M | M | · | · | · | · | · | · | · |
| S4-R detail publik / HP juri | · | · | · | · | M | · | · | · | · | M | M | M | · | · | · | · | · | · |
| S5 Provider console | · | · | · | · | M | · | · | · | o | M | M | M | M | · | · | · | · | · |
| V-STMT | · | · | · | · | · | · | · | · | M | · | · | · | M | · | · | · | · | · |
| S6 Prints & data (NICE) | M | M | o | · | · | · | · | · | · | · | · | · | · | · | M | o | · | · |
| S7 Arbitration (NICE) | · | · | · | · | o | · | · | · | · | · | M | · | · | · | · | · | M | · |

**Baca onchain langsung dan tulis (fungsi 01) per layar**

| Layar | Baca onchain (pra-kirim / fallback) | Tulis |
|---|---|---|
| Shell | `MockUSDC.balanceOf`, `gate.isVerified`, `PrintIndex.statusOf`/`latestRoundData`, `ReferenceFeed.latestRoundData` | `MockUSDC.faucet`, `ProviderRegistry.registerProvider`, (NICE) `EASGate.linkAttestation` |
| S1 | `SeriesFactory.getSeries`, `isSaleOpen`, `ProviderRegistry.getProvider` | — |
| S2 | `ProviderRegistry.isListable`, `ConversionTable.listGpuModels`/`factorOf`, `MockUSDC.balanceOf`/`nonces` (permit), `SeriesFactory.predictTokenAddress` (opsional preview) | `SeriesFactory.createSeriesWithPermit`; fallback `MockUSDC.approve` + `createSeries` |
| S3 | `getSeries`, `isSaleOpen`, `PrimarySale.quote`/`remaining`, `OrderBook.getLevels`/`bestAsk`/`getOrder`, `BondVault.bondOf`, allowance USDC/CU | `PrimarySale.buy`, `OrderBook.placeOrder`/`cancelOrder`, `approve`, `SeriesFactory.finalizeSeries` |
| S4 / S4-R | `CUToken.balanceOf`, `isRedeemWindowOpen`, `RedemptionManager.getRequest`/`stateOf`/`disputeBondFor`, allowance USDC→RM | `requestRedemption`, `confirm`, `dispute`, `claimDefault`, `finalizeRedemption`, `resolveNoRuling`, `approve` |
| S5 | `getProvider`, `bondOf`, `getSeries`, `openRequestCount`, `getRequest`/`stateOf` | `acknowledge`, `markDelivered`, `declineAndPay`, `raisePrimaryPrice`, `finalizeSeries`, `BondVault.withdrawRemaining` |
| S7 | `PanelArbitrator.getDispute` | `PanelArbitrator.ruleWithSignatures` (atau `rule` via Safe) |

---

## 14. Pemetaan adegan demo 05 → layar

| Waktu (05 §2.3) | Adegan | Layar / sub-view dokumen ini | Elemen yang harus siap |
|---|---|---|---|
| 0:00–0:12 | Hook | S1 + strip (§1.1, §2) | strip "H100 index · THIN · no eligible prints yet" vs "Spot reference (synthetic demo data) $3.00"; 3 baris series |
| 0:12–0:40 | List in 3 clicks | S2 (§3) → S3 (§4) | preset `CU-JKT-H100-2610`, kartu preview "500 CU · $3.00 · bond $2,250 (1.5×)", permit + 1 tx, redirect ke S3, bond bar penuh, badge verified, stopwatch (P6-11) |
| 0:40–0:58 | Buy and trade | S3: `PrimaryBuyBox`, `OrderBookLadder`, `OrderForm` (wallet 2, IOC), `TradesTape`, strip; lalu S3 series H200 | toast "Bought 20 CU of CU-JKT-H100-2610 for $60.00."; ask 3.20 muncul/hilang; print baru disorot; strip `THIN` → `OK` $3.20; native "$4.06/CU = $5.69 per H200-hour" |
| 0:58–1:10 | Redeem 8 → ack → delivered | S4 `RedeemModal` + R-CARD; S5 di layar samping | 1 tx redeem (D-38); timeline ● Requested ● Acknowledged ● Delivered dalam ≤ 3 dtk; S5 baris request berubah |
| ≈1:10 | Kill switch + redeem 10 | S4 `RedeemModal` + R-CARD #2 | countdown "Ack deadline in 1:00 (server time)" langsung jalan dari event receipt |
| 1:12–1:20 | Confirm #1 | S4 "Confirm delivery" → S3 | toast confirm; S3 bond $2,250 → $2,214; reputasi "8 CU" disorot |
| 1:20–1:35 | Paron Prints | terminal (`curl` E1) | tidak ada layar; S6 opsional |
| 1:35–1:45 | Integrity callout (opsional) | S3 series 3 `SelfMatchCallout` | kartu "Blocked: self-trade" terbaca di proyektor |
| 1:45–2:10 | Countdown | S4 R-CARD #2 + S4-R di HP juri | tombol "Claim default" terlihat disabled, aktif saat `now_s > deadline` dan `actions` berisi `CLAIM_DEFAULT` |
| ≈2:11–2:15 | WOW claim default | S4-R mobile (§5.7) → S3 | kartu sukses "Default paid. $45.00 sent to 0x2222…2222." + "Bond: $2,214.00 → $2,169.00"; S3 bond bar beranimasi; strike di reputasi |
| 2:15–2:30 | Close | slide | footnote not affiliated di slide [D-64] (penyebutan di app: historis [D-64]) |

---

## 15. Dependensi D-xx

| D-xx | Dampak pada dokumen ini | Bagian |
|---|---|---|
| D-02 | pemilih "Delivery month" = bulan kalender | §2.2, §3.2 |
| D-03 | arbitrator default "Paron demo panel (2-of-3)" | §3.3, §4.7 |
| D-04 | copy badge "Verified by Paron demo verifier" | §0.2, §1.2, §1.5 |
| D-06 | referensi sintetis berlabel; tanpa OCPI di app | §0.2, §1.1, §8.1 |
| D-09 | daftar GPU di wizard (A100/RTX4090) | §3.2 |
| D-13 | tidak ada tombol withdraw fee (fee di-push; `/admin/treasury` di sitemap §4.8 hanya saldo + `setTreasury` + transfer Safe) | §0.5 |
| D-14 | tombol finalize + withdraw remaining bond | §4.7, §6.4 |
| D-15, D-16 | status dan metode indeks di strip dan S6 | §1.1, §8.1 |
| D-17 | maks 10 level order book, copy `TooManyPriceLevels` | §4.4, §9.2 |
| D-18 | baris "Covers {n} CU outstanding" | §4.6 |
| D-19 | wizard demo menawarkan bulan berjalan; preset 2610. D-82 diperjelas oleh D-92 (APPROVED 18:10 WIB): preset dan window di baris ini berlaku. PR #53 masih mengisi 2611 sampai PR UI handler | §3.2, §14 |
| D-20 | batas window di wizard, countdown 60/60/90 s | §3.3 |
| D-21 | copy hasil dispute | §5.5 |
| D-22 | field print untuk tape/S6, decode ABI | §4.5, §9.2 |
| D-23 | `IParticipantGate`, varian `REGISTRY` di drawer | §1.4, §1.5, §9.2 |
| D-24 | role dari attestation, menu Provider | §1.1, §1.2, §1.4 |
| D-25 | jumlah baris S1 (4 series) | §2 |
| D-26 | receipt = hash JSON usage | §5.4, §6.3 |
| D-28 | harga maksimum = `bondPerCU ÷ 1.5` | §6.4, §9.2 |
| D-29 | cancel tetap boleh setelah `windowEnd`; `TransfersClosed`; request ulang setelah REFUNDED | §4.4, §5.3, §9.2 |
| D-30 | permit + 1 tx, fallback approve + create | §3.4 |
| D-31 | KYB untuk buy/order; claim/finalize/refund tanpa KYB | §1.4, §4.3, §4.4, §5.6, §5.7 |
| D-32 | pause hanya blokir buy + order baru | §1.6, §4.3, §4.4 |
| D-33 | decline & pay, counter "Declined", copy "no strike" | §2.2, §4.8, §6.3 |
| D-34 | rumus coverage di S1/S3 | §2.2, §4.6 |
| D-35 | revert `SelfMatch()` + callout | §4.4, §9.2 |
| D-36 | S7 tanda tangan 2-of-3 / Safe | §8.2 |
| D-37 | dispute bond di-escrow RM, approve ke RM | §5.5 |
| D-38 | redeem 1 tx tanpa approve | §5.3 |
| D-39 | "Primary sale closed" di `windowEnd − leadTime` | §4.3 |
| D-40 | faucet 5,000 / 1 jam | §1.2, §9.2 |
| D-41 | link M-KYB ke `/onboarding/kyb`; form pengajuan + antrian verifier | §0.5, §1.4 |
| D-42 | `/provider/agent` toggle kill switch dari UI | §0.5 |
| D-43 | `/arbiter/cases/{reqId}` paket tanda tangan 2-of-3 | §0.5, §8.2 |
| D-44 | `deliveryRef` hash saja di MVP; key enkripsi provider = target | §5.3 (P6-14, X6-7) |

Semua D-xx di atas **APPROVED** di 07 (Jum 9 Okt 2026 ~09:40 WIB, Fatih), termasuk D-10 (APPROVED Jum 9 Okt ~10:33 WIB: URL Vercel bawaan; tidak memengaruhi layar). Copy di dokumen ini sudah mengikutinya.

---

## 16. PENDING / TBD baru

**Usulan dokumen ini (semuanya APPROVED Jum 9 Okt 2026 ~09:40 WIB, Fatih)**

| ID | Usulan | Bagian |
|---|---|---|
| P6-01 | Copy UI bahasa Inggris; bahasa Indonesia hanya di slide | §0.1 |
| P6-02 | Aturan format angka (USD 2 desimal, sampai 6 kalau perlu; CU bulat atau 2 desimal) | §0.3 |
| P6-03 | Peta route mengikuti sitemap §4/§5 (S1 `/markets`, S2 `/provider/series/new`, S3 `/markets/{seriesId}` + deep link `/buy`/`/trade`, statement `/statements`, S6 `/index`+`/data`+`/transparency`, S7 `/arbiter/*`); `/redemptions/{reqId}` tetap | §0.5 |
| P6-04 | Peringatan gas rendah di bawah 0.005 ETH | §1.2 |
| P6-05 | Tombol "Link attestation" (NICE) hanya kalau E13 punya UID tapi belum terverifikasi | §1.4 |
| P6-06 | Ambang banner indexer tertinggal: > 10 blok atau 503 | §1.6 |
| P6-07 | Kode situs 3 huruf diisi bebas oleh provider untuk simbol | §3.2 |
| P6-08 | Spec kosong diizinkan di MVP (hash JSON kosong) sampai T5-04 diputuskan | §3.2 |
| P6-09 | Batas window dibaca dari config deployment, atau tambah view `bounds()` di `SeriesFactory` (perubahan 01) | §3.3 |
| P6-10 | Daftar/nama arbitrator dari manifest, karena 01 tidak punya view allowlist | §3.3, §4.7 |
| P6-11 | Overlay stopwatch demo di build dengan preset | §3.4 |
| P6-12 | Toleransi `maxCost` = 0 (quote persis) | §4.3 |
| P6-13 | M-BUY dilewati saat preset demo aktif | §4.3 |
| P6-14 | "Access details" wajib diisi; `deliveryRef` = keccak256 teks | §5.3 |
| P6-15 | Tanpa API, simpan `reqId` dari receipt di localStorage | §5.4, §11.2 |
| P6-16 | QR "Open on phone" ke `/redemptions/{reqId}` untuk HP juri | §5.4 |
| P6-17 | UI "Raise price" = NICE | §6.4 |
| P6-18 | ~~Waktu chain = timestamp blok + detik lokal sejak blok diterima~~ → digantikan D-48 (jam `meta.server_now_ms`, ~11:12 WIB) | §10 |
| P6-19 | Cara mendapat daftar id series saat fallback (manifest atau iterasi sampai `UnknownSeries`) | §11.2 |
| P6-20 | Interval polling API (2 s layar aksi, 10 s layar baca) | §11.1 |
| P6-21 | Peringatan "Deadline in {s}s" saat sisa ≤ 5 s untuk aksi sebelum deadline | §10 |
| P6-22 | Pemilih snapshot fixture t0..t3 hanya di build dev | §11.3 |
| P6-23 | S3 tetap satu layar desktop (buy box + order book) di `/markets/{seriesId}`; `/buy/{seriesId}` dan `/trade/{seriesId}` = deep link ke tab yang sama; layout exchange penuh (chart, depth, tab bawah) sesuai sitemap §4.4 = NICE setelah Tier 0 | §0.5 |
| P6-24 | Param statement `address` di `/statements?address={addr}`; tanpa param = wallet terhubung | §0.5 |

**TBD (belum ada rekomendasi, masih terbuka, 07 §10)**

| ID | Pertanyaan | Bagian |
|---|---|---|
| T6-01 | Apakah `eth_call` / estimasi gas di RH Testnet melihat waktu maju tanpa blok baru (berpengaruh ke cek `stateOf` sesaat setelah deadline)? Sejak D-48 (APPROVED ~11:12 WIB) **tidak memblokir UI** (tx yang memutuskan, §10 butir 6); tetap diuji Jumat sebagai info | §10 |

**TBD lama yang memengaruhi layar:** T5-03 (cara HP juri terhubung), T4-04 (WalletConnect project ID), T5-04 (JSON `paron-spec/v1`, `deliveryRef`, receipt), 03 P3-10 (alasan ineligible), P3-32 (kolom amount non-kas), P3-33 (aturan detik), P3-35 (alamat tak dikenal = 200).

---

## 17. Divergensi dari sumber

| # | Divergensi | Sumber | Penanganan |
|---|---|---|---|
| X6-1 | Preset listing memakai `CU-JKT-H100-2610` (series panggung/demo), bukan `CU-JKT-H100-2611` (seed series 1, dan juga simbol di naskah design §7.4). D-82 diperjelas oleh D-92 (APPROVED 18:10 WIB); baris ini berlaku. Rekaman memakai putaran baru di series 4 | design §7.4 vs 07 D-19, 05 §2.3 | ikuti D-19/05: preset panggung = 2610 |
| X6-2 | "Redemption detail" diberi route sendiri `/redemptions/{reqId}`, padahal PK menyebutnya bagian S4, bukan layar terpisah | PK §6 peta layar vs 05 §2.4 "S4 publik" untuk HP juri | komponen sama (R-CARD); hanya route publik tambahan |
| X6-3 | Listing = 1 tanda tangan permit + 1 tx, bukan "satu transaksi approve USDC + createSeries" | PK §6.1, design §2 Flow A vs D-30 | ikuti D-30 dengan fallback 2 tx |
| X6-4 | Kolom "Record" S1 menambah "declined" | design §7.2 S1 (delivered/defaulted) vs D-33 | ikuti D-33 |
| X6-5 | S5 menambah "Decline & pay" dan "Raise price" yang tidak ada di daftar S5 design §7.2 | PK §6.1, D-28, D-33 | Decline = MVP (state machine), Raise price = NICE (P6-17) |
| X6-6 | "Withdraw remaining bond" aktif setelah `finalizeSeries`, bukan langsung "after expiry" | design §7.2 S5 vs D-14 | ikuti D-14 |
| X6-7 | `deliveryRef` di MVP hanya hash teks; enkripsi ke key provider + IPFS belum dispesifikasikan | PK §6.2 vs T5-04 | TBD T5-04, P6-14 |
| X6-8 | KYB di UI berlaku untuk semua buy/order, bukan hanya transfer series institusional | PK §6.2 vs D-31 | ikuti D-31 |
| X6-9 | Window di layar memakai nilai demo 60/60/90 s, bukan 24 h/48 h/72 h | PK §6 vs D-20 | tampilkan nilai aktual per series |
| X6-10 | Coverage = `bondPerCU ÷ reference` | design §4.4 vs D-34 | ikuti D-34 |
| X6-11 | 01 tidak punya view untuk batas window, allowlist arbitrator, dan jumlah series yang dibutuhkan UI | 01 §6.3 | **RESOLVED** (Jum 9 Okt): 01 §6.3 menambah `bounds()`, `allowOpenWindow()`, `enforceCalendarMonth()`, `leadTime()`, `isArbitratorAllowed()`, `allowedArbitrators()`, `seriesCount()`; 01 §6.8 `rulingWindow()`; P6-09/P6-10/P6-19 memakainya |
| X6-12 | Countdown memakai ekstrapolasi detik lokal di atas timestamp blok, bukan timestamp blok murni | 05 P5-16 | P6-18 (alasan: blok Arbitrum hanya dibuat saat ada tx); T6-01 Digantikan D-48 (~11:12 WIB): jam server, bukan blok |
| X6-13 | Footer memuat footnote Ornn walaupun Ornn tidak disebut di layar mana pun | design §6 ("pitch and the site") vs design §9 Q5 (Ornn di luar UI) | **Digantikan D-64 (13:30 WIB):** footer dan semua teks "not affiliated" dihapus dari produk; footnote hanya di pitch deck |
| X6-14 | Route S1/S2/S3 diganti: `/` → `/markets` (S1; `/` jadi landing), `/list` → `/provider/series/new`, `/series/{seriesId}` → `/markets/{seriesId}` + deep link `/buy/{seriesId}` dan `/trade/{seriesId}` | sitemap §2.4, §4.1, §4.3, §4.4, §4.5 vs 06 lama | ikuti sitemap (dokumen route kanonik); copy dan wireframe tidak berubah; P6-23 untuk tab |
| X6-15 | Redeem, dispute, dan aksi provider mendapat route halaman (`/redemptions/new?series=`, `/disputes/new?req=`, `/disputes/{reqId}`, `/provider/redemptions/{reqId}`) selain modal | sitemap §4.3, §4.5 vs 06 modal-only | komponen modal yang sama dirender sebagai halaman; dari S4/S5 tetap modal |
| X6-16 | Statement `/account/{addr}/statement` → `/statements?address={addr}` | sitemap §4.3 | ikuti sitemap; nama param P6-24 |
| X6-17 | S6 `/prints` dipecah menjadi `/index`, `/index/{gpu}`, `/data`, `/transparency`; S7 `/arbitration` → `/arbiter/*` | sitemap §2.4, §4.1, §4.6 | ikuti sitemap; label NICE design §7.2 tetap ditulis berdampingan dengan tag sitemap |
| X6-18 | Catatan lama "tidak ada layar admin: aksi admin lewat Safe/script" dihapus; admin/verifier/ops/demo/faucet/onboarding = route produk | sitemap §1 prinsip 1, §8 vs PK §6.7 / 04 §6 | ikuti sitemap (pelajaran Fatih soal "mocked and untestable"); halaman-halaman itu belum di-wireframe di 06 (daftar di §0.5) |
| X6-19 | Tier: sitemap menandai S7 (`/arbiter/*`), `/provider/agent`, `/provider/series/{id}` raise price, `/index`, `/data` sebagai MVP-27h; design §7.2 dan 06 menandai S6/S7 NICE dan P6-17 raise price NICE | design §7.2 vs sitemap §4, §9 | **APPROVED** (Jum 9 Okt ~09:40 WIB, Fatih): ikut tier solo S0–S3 sitemap §9.1. S7 `/arbiter/*` = S2; agent toggle = S1; raise price = S2; `/index`/`/data` mengikuti S1/S2 sitemap; urutan di 08 |
| X6-20 | Filter S1 `month`/`include_finalized` bukan param 03 E4 → diganti `delivery_window` + `status`; nav header dan copy gas rendah menunjuk route sitemap (`/faucet`); link M-KYB → `/onboarding/kyb` | 03 §3.7, sitemap §3, §4.2, §4.10 | perbaikan keselarasan |
