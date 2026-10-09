# Paron: rencana kerja 4 lane paralel (dev doc 08)

Status: **APPROVED-BASIS, spec saja (bukan kode).** Rencana utama sejak Jum 9 Okt 2026 ~11:05 WIB = **4 lane paralel** (§1, 07 D-59 APPROVED, dari AUDIT EN-1 / top-10 #2). Rencana serial solo lama **digantikan** dan disimpan sebagai **Lampiran A** untuk referensi. Semua waktu dalam **WIB**.

Riwayat status: ditulis Jum 9 Okt 2026 ~09:45 WIB, setelah Fatih menyetujui semua rekomendasi 07 (Jum 9 Okt ~09:40 WIB). Diperbarui ~10:35 WIB setelah approval kedua (~10:33 WIB): D-10 URL Vercel, P5-26 bot trader otomatis, T9-06 lisensi MIT (07 §10.3).

**Catatan audit Jum 9 Okt 2026 ~11:09 WIB (audit Principal Engineer; cadangan `.bak-2026-10-09-pre-audit/`):**
- **APPROVED Fatih ~11:05 WIB (07 §10.4) dan diterapkan sebagai spec:**
  - D-59 (EN-1): 4 lane T0-relatif jadi jadwal utama; rencana solo → Lampiran A.
  - D-57 (EN-3): go/no-go maks. 45 menit (lebih cepat kalau bisa); Fatih sudah punya saldo RH Testnet di 2 akun.
  - D-54 (EN-2 + SC-11): `/verifier` dari EOA `W-VERIFIER`; `/admin` dengan proposer Safe + `W-ADMIN`, executor terbuka.
  - PG-2 sandbox **DITOLAK**: tidak ada sandbox di `/demo`, di lane, atau di cut order.
  - Commit dari cloud agent ber-author Fatih (`Fatih Maulana` / `fatihmaulanamail@gmail.com`, diisi ~11:12 WIB); README menyebut bantuan Grok Bot (09 R5).
- **Ditambahkan tanpa D baru:** catatan EN-11 (timebox 15 menit kill switch, §1.2 L4); ambiguitas audit §5 no. 8 (form self-attest `KybApplication` baru dibangun setelah S1 hijau, §1.3).
- **APPROVED ~11:12 WIB (07 §10.5), kini spec:** D-58 (blok hosting + fallback P5-23 S0-kritis), D-48 (aturan jam tombol Claim default), D-45, D-46, D-51, D-53, D-56 (mekanik yang dipakai lane L1/L3).

**Changelog Jum 9 Okt 2026 ~11:17 WIB (cadangan `.bak-2026-10-09-pre-1112/`):**
- **T0 = Jum 9 Okt 2026 11:14 WIB** ("go" Fatih). Semua waktu T0-relatif kini disertai jam WIB absolut (T0+0:45 = 11:59, T0+3h = 14:14, T0+5h = 16:14, T0+8h = 19:14, T0+14h = Sab 01:14).
- Cek jangkar: blok lane terakhir selesai Sab 01:14, sebelum tidur 02:00; 01:14–02:00 dijadikan buffer integrasi + gerbang G4. S2 03:30–06:00 berakhir tepat di freeze kontrak 06:00. Tidak ada blok yang menabrak jangkar, jadi tidak ada blok yang digeser.
- Semua penanda usulan dikonversi menjadi spec (D-45..D-58 APPROVED ~11:12 WIB). Fallback chain: RH gagal go/no-go → **langsung** Arbitrum Sepolia (§1.4).
- Git author + repo terisi (§1.1); D-xx tidak lagi menunggu keputusan (§5).

**Changelog Jum 9 Okt 2026 ~11:28 WIB (cadangan `.bak-2026-10-09-pre-1127/`):** izin merge tetap untuk PE (Fatih ~11:27 WIB, §1.1); deploy/broadcast hanya dari mesin PE dengan keystore deployer, L4 menyiapkan script (§1.1, §1.2, §2.2).
**Changelog Jum 9 Okt 2026 ~11:30 WIB (cadangan `.bak-2026-10-09-pre-1130/`):** D-58 ownership → Hackathon Scout (Vercel `web/` + Railway `indexer/`); Fatih hanya 2FA di 1:1 Scout; Scout serahkan URL/`DATABASE_URL` ke PE (§1.1, §1.2, §5).
**Changelog Jum 9 Okt 2026 ~11:33 WIB (cadangan `.bak-2026-10-09-pre-1133/`):** D-58: login sudah di komputer Scout (**tanpa kartu**); Railway `paron`+Postgres; `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (bukan dioper); Scout serahkan URL publik Railway; PE kirim env Railway lain ke Scout setelah deploy (§1.1, §1.2, §5).
**Changelog Jum 9 Okt 2026 ~11:37 WIB (cadangan `.bak-2026-10-09-pre-1137/`):** go/no-go **GO** ~11:36 WIB di Robinhood Chain Testnet (`46630`); [PR #1](https://github.com/Fatihmaull/paron-robinhood/pull/1) L4 masuk `main`; fallback Arbitrum Sepolia tidak dipicu (§1.4, milestone ≤11:59).
**Changelog Jum 9 Okt 2026 ~13:25 WIB (cadangan `.bak-2026-10-09-pre-1325/`):** kontrak **stage-1** deployed ~13:20 WIB (PE) di RH Testnet `46630` (`startBlock` `131496617`; verify-deployment lulus; seed 3 series cocok 05); langkah deploy S0 **DONE lebih awal** dari gerbang G2 16:14. Scout set Railway `DEPLOY_LABEL=stage-1` + CORS origin Vercel; menunggu konfirmasi redeploy (§0 milestone).
**Changelog Jum 9 Okt 2026 13:30 WIB (cadangan `.bak-2026-10-09-pre-1331/`):** Fatih ("oke 1-4, footer not affiliated hapus itu"): D-60..D-63 (perubahan tampilan 06) dan D-64 (footer + teks "not affiliated" dihapus dari produk; disclaimer hanya di pitch deck) APPROVED, lihat 07 §12. **Daftar never-cut kini tepat 3 butir:** claim default dari wallet mana pun; terbitkan KYB live di `/verifier`; satu execute Timelock dari `/admin`. Butir ke-4 (footer) dihapus di §0 dan §4; X8-8 diperbarui.
**Catatan Jum 9 Okt 2026 (PENDING, 07 D-83, §7):** Safe multisig = rencana roadmap kalau Paron live di mainnet. Peran admin tidak berubah sampai freeze. Usulan aturan kode setelah freeze ada di §7.2; jam dan tag di §0 tidak digeser.

**Tim.** Satu-satunya manusia dan pembuat keputusan = **Fatih** (07 D-08 APPROVED; isian HackQuest tetap "Fatih solo"). Eksekusi build = **4 lane cloud agent** (L1 kontrak, L2 frontend, L3 indexer/API, L4 ops/deploy) dengan **PE sebagai integrator** (merge, review, menjaga kontrak antarmuka) [APPROVED D-59]; PE boleh merge sendiri kalau test hijau (izin tetap Fatih ~11:27 WIB). Hanya Fatih yang menyetujui keputusan; agent tidak mengubah status D-xx.

**Git authorship [APPROVED, Jum 9 Okt ~11:05 WIB; nilai ~11:12 WIB]:** semua commit dari lane agent ber-**author Fatih** (`user.name` = `Fatih Maulana`, `user.email` = `fatihmaulanamail@gmail.com`), bukan identitas agent. Repo: https://github.com/Fatihmaull/paron-robinhood. Aturan lengkap: 04 §9.2; dicek di 09 §7.

**Sumber:** AUDIT §5, §6 (`AUDIT.md`, tidak di repo); design §7.1–§7.4, §8, §11.3; sitemap §9.1 (tier S0–S3, berlaku); 02 §0 (shortlist MUST), §4 (`test_E2E_StageScript`); 03 §4 (fixture mock); 04 §8 (go/no-go), §9.2; 05 §3, §4.6–§4.8; 06 §0.5; 07 §10–§11; 09 §1.2, §7.

**Legenda:**
- **T0** = saat Fatih memberi **"go"** untuk mulai build paralel = **Jum 9 Okt 2026 11:14 WIB** (diberikan 11:14 WIB). Jam WIB absolut ditulis di samping setiap waktu T0-relatif.
- **Jangkar jam tetap** (tidak ikut T0): tidur Sab 02:00–03:30, freeze kontrak Sab 06:00, freeze UI 09:00, submit 11:30, tenggat keras Sab 12:00. Dengan T0 = 11:14, blok lane terakhir (→T0+14h) selesai Sab 01:14, jadi tidak menabrak tidur; 01:14–02:00 = buffer integrasi + G4.
- **[usulan 08]** = urutan atau durasi yang diusulkan dokumen ini. Tidak ada di sumber kanonik; boleh digeser selama tenggat terkunci tidak berubah.
- **Done-check** = kondisi yang harus benar sebelum pindah blok. Kalau gagal, ikuti aturan **checkpoint** (§3) dan **cut order** (§4). Jangan memperpanjang blok diam-diam.
- Durasi tiap blok adalah estimasi, bukan jaminan (sitemap §9.1).

---

## 0. Tenggat terkunci dan milestone utama

| Waktu | Milestone | Sumber |
|---|---|---|
| **T0 = Jum 11:14** | "Go" Fatih (11:14 WIB); repo https://github.com/Fatihmaull/paron-robinhood dibuat, commit pertama (timestamp ≥ Jum 09:00, author `Fatih Maulana`) | AUDIT §6, 04 §9.2, 09 §1.2 |
| **≤ T0+0:45 = Jum 11:59** | **Go/no-go selesai** (maks. 45 menit, D-57 APPROVED) — **DONE ~11:36 WIB: GO** Robinhood Chain Testnet (`46630`); [PR #1](https://github.com/Fatihmaull/paron-robinhood/pull/1) L4 masuk `main`; fallback Arbitrum Sepolia **tidak** dipicu. Tag `go-nogo`; chain terkunci. **Interface + event + error 01 terkompilasi, ABI diekspor** (gerbang G1) | 04 §8, AUDIT EN-1/EN-3 |
| **~13:20 (di depan G2)** | **Deploy kontrak S0 DONE:** label `stage-1` di RH Testnet `46630`, `startBlock` `131496617`; verify-deployment lulus (14 kontrak, timelock 300 dtk, executor terbuka); seed `CU-JKT-H100-2611` / `CU-BTM-H200-2611` / `CU-SGP-B200-2612`; manifest di `main` (`infra.json` + `stage-1.json`). Scout: Railway `DEPLOY_LABEL=stage-1` + `API_CORS_ORIGIN=https://paron.vercel.app` (menunggu redeploy) | PE + Scout di grup; 04 §7/§8 |
| T0+5h = Jum 16:14 | Kontrak inti + RM + shortlist 02 §0 #1–#15 hijau; halaman S0 jalan di mock; handler inti + endpoint S0 (gerbang G2) | AUDIT §6 |
| **T0+8h = Jum 19:14** | **S0 selesai**: OrderBook, PrintIndex, PanelArbitrator, `invariant_BondCoversSupply`, **`test_E2E_StageScript`** hijau; frontend di API live + fallback onchain; deployment **latihan** di chain terpilih (gerbang G3) | AUDIT §6, sitemap §9.1 |
| **T0+14h = Sab 01:14** (buffer + G4 sampai 02:00) | **S1 selesai**: `/ops/keepers`, `/verifier`, `/admin`, agent + kill switch, bot trader, `/demo` (tanpa sandbox) (gerbang G4) | AUDIT §6, sitemap §9.1 |
| Sab 02:00–03:30 | Tidur (semua lane berhenti; tidak ada merge) | AUDIT §6 |
| **Sab 06:00** | **Freeze kontrak** (tag `freeze-contracts`) + **video backup v1**; deployment **panggung** dari kode beku | design §7.3, §8; 05 §4.6; 09 §1.2 |
| Sab 08:00 | README final (termasuk atribusi Grok Bot, 09 R5) | 09 §1.2 |
| **Sab 09:00** | **Freeze UI** (tag `freeze-ui`) | design §7.3, 09 §1.2 |
| Sab 10:00 | Isian HackQuest final + video submission terunggah | 09 §1.2 |
| **Sab 11:30** | **Submit internal** di HackQuest; tag `submission` | design §7.3, 09 §1.2 |
| **Sab 12:00** | **Tenggat keras** | notes §2 |
| Min 11 Okt | Demo Day (kalau masuk shortlist); checklist T−24/T−60/T−10 | 05 §4.7, 09 §1.2 |

**Tidak boleh dipotong (sitemap §9.1 + AUDIT §6; tepat 3 butir sejak D-64, 13:30 WIB):**
1. **Claim default** dari wallet mana pun (S0, `/redemptions/[reqId]`).
2. **Terbitkan KYB live** dari `/verifier` (S1; `W-VERIFIER`, D-54 APPROVED; cadangan D-41 opsi D cukup).
3. **Satu perubahan Timelock dieksekusi** dari `/admin` (S1, delay demo 5 menit; executor terbuka, D-54 APPROVED).
Footer "not affiliated" **bukan lagi** butir never-cut: dihapus dari produk (D-64, 07 §12); disclaimer hanya di pitch deck.

**Urutan prioritas kalau waktu habis (sitemap §9.1):** S0 → `/ops/keepers` → `/verifier` → `/admin` (proposals + execute) → sisa S1 (agent toggle, `/demo`) → S2 → S3.

---

## 1. Rencana 4 lane paralel [APPROVED D-59, Jum 9 Okt ~11:05 WIB]

### 1.1 Aturan lane

| Lane | Pemilik | Lingkup | Input dari lane lain | Output untuk lane lain |
|---|---|---|---|---|
| **L1** kontrak | cloud agent L1 | 12 kontrak 01, test Foundry 02, `DeployAll` + manifest (04) | — | **ABI dari interface 01** (≤ T0+0:45 = 11:59), lalu implementasi + test |
| **L2** frontend | cloud agent L2 | Next.js + wagmi, halaman S0–S2 (06, sitemap §9.1) | ABI L1; fixture mock 03 §4; API L3 mulai T0+5h (16:14) | UI di mock (s.d. 16:14), lalu live |
| **L3** indexer/API | cloud agent L3 | Ponder + Hono, handler H01–H46, endpoint E1–E23 (03) | ABI L1 (event); manifest L4 | API live untuk L2 |
| **L4** ops/deploy | cloud agent L4 (menyiapkan script) + **PE** (menjalankan deploy dari mesinnya dengan keystore deployer) + **Hackathon Scout** (akun/project hosting di komputer Scout; Vercel+Railway sudah login, tanpa kartu) | go/no-go 04 §8, dana wallet, MockUSDC + EAS/schema, script seed 05, script deploy latihan/panggung, agent, bot trader; hosting Vercel+Railway `paron` (D-58) | kontrak L1; API L3; URL publik Railway dari Scout; env Railway lain dari PE → Scout | Manifest, `DEPLOYMENTS.md`, wallet terdana |

- **PE = integrator:** merge ke `main` (**[APPROVED Fatih ~11:27 WIB, izin merge tetap]** PE boleh me-merge PR sendiri ke `main` kalau test/CI hijau, tanpa minta OK Fatih tiap kali (07 §10.5).), menjaga interface 01 sebagai kontrak antarlane, menjalankan test lintas lane. Perubahan interface setelah G1 hanya lewat PE dan dicatat (ABI baru diekspor ulang ke L2/L3).
- **Deploy = PE:** **[Jum 9 Okt ~11:27 WIB, PE]** Cloud agent tidak boleh memegang secret, jadi semua deploy/broadcast (smoke, latihan, panggung, seed testnet) dijalankan **PE dari mesinnya sendiri** dengan keystore deployer (`DEPLOYER_ACCOUNT`); lane L4 hanya menyiapkan script, manifest, dan langkah, lalu menyerahkan ke PE. (04 §4.1 butir 6).
- **Hosting = Scout [D-58, ~11:29 / ~11:32 WIB]:** Hackathon Scout menyiapkan Vercel + Railway project `paron` (+ Postgres) di komputer Scout; **sudah login, tanpa kartu**. Setelah scaffold L1/L3 di `main`, Scout hubungkan project. Indexer `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (nilai mentah **tidak** dioper). Scout serahkan **URL publik Railway** ke PE. Setelah kontrak di-deploy: PE kirim env Railway lain (RPC URL, chain id, alamat kontrak, start block, `DATABASE_SCHEMA`; daftar = README indexer L3) ke Scout → Scout isi di Railway; PE isi env Vercel (termasuk URL indexer). (04 §8).
- **Author commit = Fatih** di semua lane (`Fatih Maulana` / `fatihmaulanamail@gmail.com`, 04 §9.2) [APPROVED].
- **Keputusan:** lane tidak memutuskan D-xx. Semua D-01..D-59 APPROVED (D-45..D-58 ~11:12 WIB, 07 §10.5), jadi ambiguitas audit §5 no. 1–5 dan 7 sudah terjawab sebelum T0; L1/L3 menulis langsung sesuai 01/03. Keputusan baru tetap hanya dari Fatih.
- Fixture mock L2 = 03 §4; nama field mengikuti 03 persis supaya pindah ke live hanya mengganti sumber data.

### 1.2 Tabel lane (T0 = Jum 9 Okt 11:14 WIB; jam absolut dalam kurung)

| Blok | L1 kontrak | L2 frontend | L3 indexer/API | L4 ops/deploy |
|---|---|---|---|---|
| **T0 → T0+0:45** (Jum 11:14–11:59) | Semua interface/event/error 01 terkompilasi; ABI diekspor (G1). Foundry + dependency dipin (OZ 5.6.1, eas-contracts 1.9.0); `LICENSE` MIT (T9-06) | Scaffold Next.js + wagmi (versi 04 §2.1), shell + utility bar (APPROVED D-65; tanpa disclaimer, D-64), mode data `mock` di fixture 03 §4 | Proyek Ponder di atas ABI; tabel schema untuk S0 | **Go/no-go DONE ~11:36: GO** RH Testnet `46630` [D-57] (§1.4); [PR #1](https://github.com/Fatihmaull/paron-robinhood/pull/1) masuk `main`; fallback Arb Sepolia tidak dipicu. L4 script smoke + **PE** broadcast; dana wallet; `MockUSDC` + EAS/schema `ParticipantVerified` |
| **T0+0:45 → T0+5h** (Jum 11:59–16:14) | `ProviderRegistry` (cek role, 01 §6.1, D-45), `ConversionTable` (A100 4_500, RTX 4090 tidak dimuat), `SeriesFactory`, `BondVault`, `CUToken`, `PrimarySale`, **`RedemptionManager`** + shortlist 02 §0 #1–#15 (mock `IArbitrator`) | Halaman S0 di mock: `/markets`, `/markets/[seriesId]` (Buy/Trade), wizard `/provider/series/new`, `/provider` (Ack / Mark delivered / Decline & pay), `/portfolio`, `/redemptions/[reqId]` dengan **Claim default** (aturan jam `meta.server_now_ms` + 2 dtk, 06 §10, D-48) | Handler H01–H26, H37; endpoint E1, E2, E4–E6, E10–E12, E18 | Script `DeployAll` + seed fase 0–2, diuji di anvil (05 §3.1–§3.3) |
| **T0+5h → T0+8h** (Jum 16:14–19:14) | `OrderBook` board-first (10 level, IOC, T-02 dari `forge snapshot`; sisa menyilang dikembalikan, D-51; lot 1 CU, D-52), `PrintIndex` (tumbling + try/catch, D-53), `PanelArbitrator`, `invariant_BondCoversSupply`, **`test_E2E_StageScript`** (G3) | Pindah ke API live + **fallback onchain** (P5-23, 06 §11.2) | Sisa endpoint S0/S1: E13, E14, E19–E23; L3 siapkan Dockerfile + start command + healthcheck Railway + README env | Deploy **latihan** di chain terpilih (deploy + verify + seed 0–2): script dari L4, broadcast oleh **PE** dari mesinnya; **blok hosting** (±18:44–19:14) [D-58]: Scout hubungkan Vercel (`web/`) + Railway `paron` (`indexer/` + Postgres) setelah scaffold di `main`; `DATABASE_URL` via `${{Postgres.DATABASE_URL}}`; Scout serahkan URL publik Railway ke PE; PE kirim env Railway lain ke Scout (Scout isi); PE isi env Vercel |
| **T0+8h → T0+14h** (Jum 19:14 → Sab 01:14) | Test SHOULD, perbaikan | S1: `/ops/keepers`; `/verifier` (EOA `W-VERIFIER`) [APPROVED D-54]; `/admin` schedule → execute (executor terbuka) [APPROVED D-54]; `/demo` checklist **tanpa sandbox** (PG-2 DITOLAK) | E23, `config-changes` | Agent + kill switch (timebox 15 menit, catatan EN-11 di bawah; fallback E); bot trader otomatis (P5-26) |
| **T0+14h → Sab 02:00** (01:14–02:00) | Buffer: perbaikan, merge PE | Buffer S1 | Buffer | Gerbang **G4** di latihan (§1.5) |
| **Sab 02:00–03:30** | tidur | tidur | tidur | tidur |
| **Sab 03:30–06:00** | S2 kontrak **hanya kalau test hijau**; **freeze 06:00** | S2: `/arbiter` (D-43), revoke, raise price, tab leverage "Coming soon", legal | — | Rencana deploy panggung |
| **Sab 06:00–11:30** | §2.2–§2.3 (deploy panggung, video v1, README dengan known limitation dari audit, freeze UI 09:00, submit 11:30) | | | |

**Catatan EN-11 (L4, kill switch):** alur D-42 (halaman HTTPS → `http://127.0.0.1`) bergantung pada browser (Private Network Access, Safari). Uji panggilan HTTPS → localhost **pertama kali**; kalau gagal, langsung pakai **fallback E** (env / jendela agent). Debug maksimal **15 menit**.

**Catatan D-58 [APPROVED ~11:12 WIB; ownership ~11:29 WIB; detail ~11:32 WIB]:** juri meninjau async Sab 12:00 → Min. Host = **Vercel** (`web/`, D-10) + **Railway** project `paron` (`indexer/` + Postgres; tidak tidur). **Scout** yang buat akun/project di komputer Scout; **sudah login (~11:32 WIB), tanpa kartu**. Hubungkan setelah scaffold L1/L3 di `main`. Indexer `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (nilai mentah **tidak** dioper). Scout serahkan **URL publik Railway** ke PE. L3 siapkan Dockerfile/start/healthcheck + README env. Setelah deploy: PE kirim env Railway lain ke Scout → Scout isi; PE isi env Vercel. Blok tetap ±18:44–19:14 sebelum G3 (19:14). Fallback onchain L2 S0-kritis, wajib jadi sebelum 19:14. Fatih tidak membuat akun hosting/Postgres sendiri.

### 1.3 Urutan dalam S1 (L2) dan ambiguitas audit §5 no. 8

- `/verifier` dibangun dulu sebagai **penerbitan manual** oleh `W-VERIFIER` (D-41 cadangan D). Form self-attest `KybApplication` (D-41 opsi B) **baru dibangun setelah S1 hijau** (G4 lulus) dan masuk cut order §4 lebih dulu dari must-not-cut.
- `/admin`: jadwalkan satu `setFactor` dari `W-ADMIN` di awal blok, eksekusi dari wallet mana pun setelah delay 5 menit (must-not-cut #3).
- `/demo`: checklist dari event indexer saja. Tidak ada jalur sandbox (PG-2 DITOLAK); waktu yang dihemat dipakai untuk fitur demo yang sebenarnya (S1/S2).

### 1.4 Go/no-go (L4, maks. 45 menit) [APPROVED D-57] — **DONE ~11:36 WIB: GO**

- Mulai di T0 = **11:14 WIB**, selesai paling lambat T0+0:45 = **11:59 WIB** (lebih cepat kalau bisa). Lima cek 04 §8 tetap.
- Fatih **sudah punya saldo RH Testnet di 2 akun**, jadi cek 1 (dana/gas) tidak menunggu faucet; L4 hanya mendistribusikan saldo ke wallet 05 §1.
- Cek Safe = **soft fail** (04 §8): dengan D-54, jalur demo tidak bergantung Safe.
- Hasil di tag `go-nogo`; chain terkunci, tidak didiskusikan ulang. **No-go (cek belum ✅ pada 11:59) → langsung Arbitrum Sepolia** [APPROVED Fatih ~11:12 WIB] (04 §8): tanpa perpanjangan; jadwal lane **tidak** bergeser.
- Opsi "pilih Arbitrum Sepolia begitu ada hambatan" (AUDIT EN-3) **tidak** dipilih eksplisit oleh Fatih; yang berlaku hanya timebox 45 menit.
- **Hasil [PE, ~11:36 WIB, di grup]:** **GO** di Robinhood Chain Testnet (chain `46630`), sebelum batas 11:59. [PR #1](https://github.com/Fatihmaull/paron-robinhood/pull/1) dari L4 sudah masuk `main`. Fallback Arbitrum Sepolia **tidak** dipicu (tetap terdokumentasi sebagai cadangan tidak terpakai).

### 1.5 Gerbang integrasi (done-check)

| Gerbang | Kapan | Done-check |
|---|---|---|
| **G1** | ≤ T0+0:45 (11:59) | ABI semua interface 01 ada di repo; L2 dan L3 mulai dari ABI itu; tabel go/no-go terisi ✅/❌ dan chain terkunci |
| **G2** | T0+5h (16:14) | Shortlist 02 §0 #1–#15 hijau; anvil berisi state akhir fase 2; Ponder sync anvil; halaman S0 bisa diklik di mock, termasuk Claim default |
| **G3** | T0+8h (19:14) | `test_E2E_StageScript` hijau; satu putaran naskah 05 fase 3 bisa diklik di anvil dengan API live, termasuk **claim default dari wallet ketiga**; deployment latihan verified dan `/v1/health` synced |
| **G4** | Sab 01:14–02:00 (T0+14h → jangkar tidur) | Tiga must-not-cut S1 terbukti di latihan: `claimDefault`/`finalizeRedemption` dari `/ops/keepers`; wallet baru di-KYB live dari `/verifier` lalu bisa membeli; satu `CallExecuted` dari `/admin` terlihat di E23. Agent ack ≤ 3 dtk (kill switch off) dan tidak ack (on); bot trader memasang ask ≤ 10 dtk setelah `PrimaryBuy` `W-BUY` |

---

## 2. Sabtu 10 Okt

### 2.1 Tidur, S2, freeze (02:00 → 06:00)

Pembagian lane: tidur berlaku untuk semua lane (tidak ada merge 02:00–03:30); blok S2 di bawah dikerjakan L2 (frontend), persiapan freeze oleh L1 + PE; L3/L4 hanya perbaikan dan menyiapkan script deploy panggung (dijalankan PE, §1.1).

| Blok | Kerja | Deliverable | Done-check |
|---|---|---|---|
| 02:00–03:30 | **Tidur** (satu siklus ±90 menit) [usulan 08]. Alarm di dua perangkat | — | — |
| 03:30–04:30 | S2 #1: `/arbiter/cases/[reqId]` + daftar kasus di halaman yang sama (D-43: paket tanda tangan di fragment URL); `/disputes/[reqId]` (Resolve no-ruling). Didahulukan karena risiko S7 (§4) | Halaman arbiter | Satu dispute fase 4 (05 §3.6) diputus `ruleWithSignatures` dari UI di latihan atau anvil |
| 04:30–05:15 | S2 #2: revoke di `/verifier/attestations`; raise price di tab provider `/markets/[seriesId]`; tab `/trade/leverage` "Coming soon" (statis, ±15 menit, copy 06 §0.5); `/legal/risk` + `/legal/disclaimer` (link dari utility bar; tanpa teks "not affiliated", D-64) | Halaman S2 | Setiap item bisa dibuka; leverage tanpa form, tanpa tx, tanpa angka |
| 05:15–05:30 | S2 #3 (kalau sempat): `/status` ringan; `/docs/contracts` = tabel alamat di README + link | — | — |
| 05:30–06:00 | Persiapan freeze: semua test Foundry dijalankan; test MUST yang masih merah dicatat sebagai known limitation di README [usulan 08]; diff terakhir di-review | Daftar test hijau/merah | Tidak ada perubahan kontrak tanpa test |
| **06:00** | **Freeze kontrak**: tag `freeze-contracts`. Setelah ini kontrak tidak diubah | Tag | Tag ada di remote |

**Penyesuaian UI Designer [APPROVED D-67..D-74, Jum 9 Okt 2026 14:40 WIB, Fatih]:** PE mengerjakan semuanya dalam **satu PR kecil** (L2 frontend) sebelum freeze UI Sab 09:00 WIB; PR terpisah dari PR `docs/`. Isi: series page terminal satu viewport (D-67), kartu redemption (D-68), Connect wallet sekunder (D-69), tabel mobile + Menu (D-70), banner dev-only (D-71), kontras (D-72), tab Provider (D-73), `tokens.v2.css` + `<title>` + skip link (D-74). Urutan kalau waktu sempit: D-70, D-71, D-72, D-69, D-73, D-68, lalu D-67 (fallback D-67: hanya `align-items:start` dan Buy/Place order di samping Market). Designer memverifikasi ulang di live setelah deploy (07 §15). Tidak mengubah daftar never-cut (3 butir).

### 2.2 Panggung, video, README, freeze UI (06:00 → 10:00)

| Blok | Kerja | Deliverable | Done-check |
|---|---|---|---|
| 06:00–06:40 | Deploy **panggung** dari kode beku (broadcast oleh PE dari mesinnya, script dari L4): fase 0–2 saja (05 §4.6 butir 2); verify; `DEPLOYMENTS.md` | Manifest panggung | Assert akhir fase 2 (05 §3.3) benar di panggung |
| 06:40–07:20 | **Video backup v1**: rekam naskah 05 fase 3 (bot trader otomatis, 05 §2.5) di deployment **latihan** atau anvil, **bukan** panggung (05 §4.6 butir 3); simpan di 2 perangkat (design §8); penanda waktu per adegan [APPROVED P9-13] | File video backup | Video bisa diputar dari 2 perangkat |
| 07:20–08:00 | README final: URL app = URL Vercel bawaan (D-10), alamat panggung dari `DEPLOYMENTS.md`, blok atribusi design §7.5 + kalimat atribusi Grok Bot (09 R5, APPROVED ~11:05 WIB: "Dibangun oleh Fatih Maulana dengan bantuan Grok Bot" / "Built by Fatih Maulana with help from Grok Bot"), bagian License = MIT + link `LICENSE` (T9-06), catatan known limitation (termasuk celah S7 kalau S2 #1 gagal), footnote "not affiliated" | README final | Semua link README terbuka dari jendela private |
| 08:00–09:00 | Polish UI terakhir (empty/error state, countdown) + **gladi #1 dan #2** (latihan/anvil). Gladi #1: bot otomatis; gladi #2: bot sengaja tidak di-arm, latih **trigger manual** (05 §2.5) | Catatan gladi + jarak S-02 → ask | Naskah 2:30 selesai tanpa intervensi; bot terpicu tepat sekali; trigger manual teruji |
| **09:00** | **Freeze UI**: tag `freeze-ui`; build frontend final menunjuk manifest panggung | Tag + URL Vercel bawaan final (D-10) | URL Vercel menampilkan state panggung |
| 09:00–09:30 | **Gladi #3** di latihan/anvil dengan build beku, bot otomatis | — | Lulus atau catat fallback 05 §4.8 (level 2b = bot; level 2 = fallback onchain kalau API mati) |
| 09:30–10:00 | Video submission (naskah ter-retime, target ≤ 3:00, P9-05); unggah; cek bisa diputar tanpa login. Host video = T9-07 | Link video | Link terbuka dari jendela private |

### 2.3 Submit (10:00 → 12:00)

| Blok | Kerja | Deliverable | Done-check |
|---|---|---|---|
| 10:00 | Semua isian HackQuest final (09 §2); info tim = Fatih solo | Teks isian | 8 isian terisi |
| 10:00–11:15 | Checklist pra-submit 09 §7 (link, verifikasi kontrak, repo publik, tag, guardrail merek, tidak ada secret, **author semua commit = Fatih**) | Checklist dicentang | Semua butir 09 §7 ✅ |
| 11:15–11:30 | Buffer | — | — |
| **11:30** | **Submit** di HackQuest; tag `submission`; tangkapan layar konfirmasi + waktu | Bukti submit | Halaman konfirmasi tersimpan |
| 11:30–12:00 | Buffer: hanya koreksi teks isian kalau form mengizinkan. Deployment panggung dan README alamat tidak disentuh (05 §4.6 butir 5) | — | — |
| **12:00** | Tenggat keras. Setelah ini: tidur | — | — |

**Setelah submit:** Sab sore checklist T−24 (05 §4.7); Min 11 Okt checklist T−60 / T−10 (05 §4.7); slot demo [TBD T9-04].

---

---

## 3. Checkpoint dan aturan keputusan

| Checkpoint | Pertanyaan | Kalau "tidak" [usulan 08] |
|---|---|---|
| **T0+0:45 = 11:59 (G1)** | Go/no-go selesai dalam 45 menit dan ABI interface tersedia? | Go/no-go: keputusan diambil dengan cek yang sudah ada (cek Safe soft fail); No-go → langsung Arbitrum Sepolia (04 §8). ABI terlambat: L2 tetap di fixture 03 §4, L3 menunggu maksimal 30 menit lalu menulis schema dari 01 §11 |
| T0+3h = 14:14 | Kontrak inti (Registry, CT, Factory, BondVault, CUToken) + test #1, #2, #13, #15 hijau? | Tunda `ReferenceFeed` (NICE, D-06) dan event opsional `PrintRecorded` |
| **T0+5h = 16:14 (G2)** | Shortlist #1–#15 hijau, halaman S0 di mock, handler inti jalan? | Tunda test SHOULD/NICE ke Sab 03:30; jangan tunda #6 (claim default) dan #14 (isolasi bond). L2 tetap di mock sampai L3 siap |
| **T0+8h = 19:14 (G3)** | `test_E2E_StageScript` hijau dan S0 bisa diklik penuh di anvil dengan API live? | Perbaiki E2E maksimal 30 menit (s.d. 19:44); S0 maksimal +1,5 jam (s.d. 20:44) dengan memakan blok S1 sesuai cut order §4; deploy latihan tetap malam ini |
| **Sab 02:00 (G4)** | Tiga must-not-cut S1 sudah terbukti? | Lanjutkan yang belum (tidur dipotong jadi 45 menit); S2 mulai dari cut order §4 |
| **Sab 06:00** | Kontrak siap beku? | Freeze tetap 06:00. Bug yang tersisa dicatat sebagai known limitation, tidak diperbaiki di kontrak |
| **Sab 09:00** | UI siap beku? | Freeze tetap 09:00; fitur yang belum jadi disembunyikan dari navigasi |
| **Sab 11:30** | Submit internal terkirim? | Submit apa pun yang ada sebelum 12:00; video backup v1 dipakai kalau video submission belum jadi |

---

## 4. Cut order (AUDIT §6, tanpa sandbox)

PG-2 sandbox **DITOLAK** (Fatih, Jum 9 Okt ~11:05 WIB), jadi sandbox tidak ada di daftar ini. Urutan 2–6 = AUDIT §6; urutan 0, 1, 7 = cut ladder lama yang dipertahankan dan diletakkan di sekitarnya [usulan 08]. Potong dari atas ke bawah; yang lebih bawah hanya dipotong kalau yang di atas sudah habis.

| Urutan | Yang dipotong | Pengganti |
|---|---|---|
| 0 | Semua S3 (di luar 27 jam): `/index`, `/data`, `/transparency`, `/providers/[providerId]`, `/trade` list + subhalaman, `/admin/*` terpisah, `/disputes` list, `/statements`, route FULL | — |
| 1 | S2 dengan urutan lama: `/docs/contracts` → `/status` → raise price → revoke → `/trade/leverage` | Tabel alamat di README |
| 2 | **Full matching** OrderBook | Pertahankan board (level + `getLevels`) dan jalur demo IOC |
| 3 | Self-attest `KybApplication` (D-41 B) | Penerbitan manual di `/verifier` (D-41 D) |
| 4 | Kontrak `ReferenceFeed` | API menyajikan konstanta berlabel "reference (constant)" |
| 5 | Permit (`createSeriesWithPermit`) | 2 tx (`approve` + `createSeries`) |
| 6 | UI arbiter `/arbiter` | Developer console (Debug Contracts berlabel) + Foundry #10–#12 |
| 7 (S1, terakhir) | `/demo` checklist → pemicu otomatis bot trader (trigger manual, 05 §2.5) → toggle agent (fallback E fisik, D-42) → tab `/admin` selain proposals + execute | — |
| Kontrak | Handler invariant tambahan → test SHOULD/NICE | — |

**Tidak pernah dipotong:** claim default dari wallet mana pun; terbitkan KYB live di `/verifier`; satu execute Timelock dari `/admin`. **Tepat 3 butir** [D-64, 13:30 WIB]; footer "not affiliated" sudah dihapus dari produk. Juga tidak ikut terpotong: shortlist 02 §0 versi 1 jam, `test_E2E_StageScript`, mode `ruleWithSignatures`, `/ops/keepers`.

**Cadangan terakhir untuk fungsi tanpa UI (sitemap §9.1):** halaman **Debug Contracts** Scaffold-ETH 2 dipakai untuk memanggil `ruleWithSignatures` atau fungsi admin, **diberi label "developer console"** dan tidak diklaim sebagai UI produk. README menyebutnya secara jujur.

**Risiko S7 (arbiter) di S2:** kalau `/arbiter` terpotong, putusan dispute hanya lewat Safe atau developer console. Ini celah anti-mock, walaupun dispute tidak ada di naskah demo 2:30. Mitigasi (sitemap §9.1): README jujur; jalur dispute tetap diuji Foundry (#10–#12 shortlist); developer console sebagai cadangan.

---

## 5. Item PENDING/TBD yang dijawab di blok tertentu

Daftar lengkap ada di 07 §10.2 dan §11. Yang punya slot di jadwal ini:

| Item | Lane / blok |
|---|---|
| D-45..D-58 | **Sudah APPROVED ~11:12 WIB** (07 §10.5), sebelum T0; tidak butuh slot |
| Blok hosting D-58 (Scout di komputer Scout; login sudah, tanpa kartu; PE→Scout untuk env Railway) | Scout + L3/PE, ±18:44–19:14 (sebelum G3) |
| T4-01 versi `forge-std` | L1, 11:14–11:59 |
| T5-01 gas per wallet, T5-02 latensi, T3-01/T4-03 finality + konfirmasi | L4, go/no-go (≤ 11:59) |
| T5-08 `caller` di `Defaulted`: **terjawab D-56** (alamat arbitrator) | L1 menerapkan di RM, 11:59–16:14 |
| T-02 `maxFillsPerTx` (T5-06 terjawab D-51) | L1, 16:14–19:14 |
| T5-04 format minimal spec/`deliveryRef` (hash teks, D-44 E) | L4, seed 11:59–16:14 |
| T5-05 harga primer SGP, T5-11 waktu redeploy, T4-05 clone di explorer, T4-02 Postgres | L4, deploy latihan 16:14–19:14 |
| T6-01 `eth_call` dan waktu di RH (info saja sejak D-48) | L2, 11:59–16:14 (countdown S0) |
| T5-07 deteksi agent, uji D-42 HTTPS → localhost (timebox 15 menit, EN-11) | L4, 19:14 → Sab 01:14 |
| T9-05 status registrasi, T9-01 field HackQuest, T9-02 batas video | Fatih, sebelum 16:14 (lihat form) [usulan 08] |
| T4-04 WalletConnect project ID, T5-03 HP juri, T5-09 Ponder saat anvil revert | Sab gladi 08:00–09:30 |
| T9-07 host video, T9-08 alat rekam | Sebelum Sab 06:40 |

Sudah diputuskan Jum ~10:33 WIB: D-10 (URL Vercel), P5-26 (bot otomatis; setup L4 19:14 → Sab 01:14, uji di gladi), T9-06 (MIT; `LICENSE` di L1 11:14–11:59, README di Sab 07:20–08:00). Diputuskan ~11:05 WIB: D-54, D-57, D-59, PG-2 ditolak, atribusi README, git author (07 §10.4).

---

## 6. Divergensi dari sumber

| ID | Divergensi | Alasan |
|---|---|---|
| X8-1 | Design §7.3 membagi kerja paralel 3 orang; 08 versi ~09:45 menjadikannya satu jalur berurutan. **Digantikan X8-5** | D-08 = Fatih solo |
| X8-2 | Design §7.3 menaruh video backup di Sab 00–06, 05 §4.6 di Sab 06–10; 08 merekamnya 06:40–07:20 (video backup v1, tepat setelah freeze) | Jadwal yang disetujui Fatih (Sab 06:00 = freeze kontrak + video backup); tetap di latihan/anvil sesuai 05 §4.6 |
| X8-3 | Sitemap §9.1 menaruh S2 di Sab 02:00–06:00; 08 memakai 03:30–06:00 karena ada blok tidur | Tidur; prioritas S2 tidak berubah |
| X8-4 | Frontend S0 dimulai 18:30 (rencana solo). **Digantikan X8-5**: L2 mulai di T0 dengan fixture mock | D-59 APPROVED |
| X8-5 | Jadwal utama = 4 lane cloud agent T0-relatif (AUDIT §6), bukan jalur solo; manusia tetap Fatih solo (D-08 tidak berubah) | AUDIT EN-1 (Blocker); D-59 APPROVED ~11:05 WIB |
| X8-6 | Go/no-go 10:30 (design §11.3) → timebox ≤ 45 menit setelah T0 (11:14–11:59); gagal → langsung Arbitrum Sepolia | AUDIT EN-3; D-57 APPROVED; fallback langsung APPROVED ~11:12 WIB |
| X8-7 | Cut order AUDIT §6 diawali sandbox (PG-2); 08 menghapusnya | PG-2 DITOLAK Fatih ~11:05 WIB |
| X8-8 | Sitemap §9.1 punya 3 must-not-cut; 08 sempat menambahkan footer "not affiliated" sebagai butir ke-4. **Digantikan D-64 (13:30 WIB):** footer dihapus, never-cut = 3 butir | AUDIT §6 "Never cut" + 06 §0.2 |
| X8-9 | Blok hosting (AUDIT EN-4) ditambahkan di L4 sebelum G3 (19:14) | D-58 APPROVED ~11:12 WIB |

---

## 7. Admin sampai freeze, dan usulan setelah freeze

Jam freeze, tag, dan izin merge saat test hijau sudah terkunci di §0, §2.1–§2.3, 04 §9.2, dan 09 §1.2. Bagian ini tidak mengulang jadwal itu.

### 7.1 Peran admin dan roadmap Safe [D-83, PENDING]

Sampai freeze kontrak Sab 06:00 WIB, peran admin tetap seperti D-54: proposer Timelock = Safe + `W-ADMIN` (EOA yang sudah ada), executor terbuka. Tidak ada EOA kedua. Peran admin tidak pindah ke Safe sebelum freeze.

Safe multisig adalah rencana roadmap untuk saat Paron live di mainnet. Bentuk produk penuh (Safe 2-of-3, Timelock, PG-7, EN-2) tetap di `paron-product-plan.md` §4.10 dan tidak disalin ke sini. Status: PENDING, menunggu konfirmasi Fatih (07 §17).

### 7.2 Usulan aturan setelah freeze [PENDING, menunggu konfirmasi Fatih]

Usulan ini membatasi perubahan kode. Milestone video, README, dan submit di §2.2–§2.3 tidak digeser.

- Setelah freeze kontrak Sab 06:00 WIB: tidak ada perubahan kontrak. Selaras dengan baris 06:00 di §2.1.
- Setelah freeze UI 09:00: hanya perbaikan bug yang memblokir jalur demo S0.
- Setelah submit internal 11:30: tidak ada merge, kecuali blocker yang diumumkan lebih dulu.
- Merge hanya kalau test hijau. Ini sudah berlaku (izin merge PE ~11:27 WIB, §1.1, 04 §9.2). Usulan ini tidak menambah izin baru.
- Tiap freeze memakai tag yang sudah ada: `freeze-contracts` pada 06:00, `freeze-ui` pada 09:00 (§0, 04 §9.2). Tidak ada nama tag baru.

---

## Lampiran A. Rencana serial solo lama (DIGANTIKAN, hanya referensi)

> **Digantikan Jum 9 Okt 2026 ~11:05 WIB oleh §1 (D-59 APPROVED).** Isi di bawah adalah teks APPROVED-BASIS versi ~10:35 WIB, disalin apa adanya untuk referensi; jangan dipakai sebagai jadwal. Beberapa jam sudah lewat (go/no-go 10:30 belum terjadi). Bagian Sabtu (§2) masih berlaku dan sudah ada di atas.

### A.0 Milestone lama (Jumat)

| Waktu (WIB) | Milestone | Sumber |
|---|---|---|
| **Jum 09:00** | Repo dibuat, commit pertama (timestamp ≥ 09:00) | 04 §10, 09 §1.2 |
| **Jum 10:30** | **Go/no-go** (5 cek); tag `go-nogo`; chain terkunci | design §11.3, 04 §8 |
| Jum ~16:00 | Shortlist MUST 02 §0 hijau (minimal 8 test inti) | 02 §0 |
| Jum ~18:30 | `test_E2E_StageScript` lulus di lokal | 02 §4 |
| **Jum 20:00** | **S0 selesai**: jalur demo ±8 halaman jalan di anvil | sitemap §9.1 |
| Jum ~21:00 | Deployment **latihan** di chain terpilih (deploy + verify + seed fase 0–2) | design §7.3, 05 §4.6 |
| **Sab 02:00** | **S1 selesai**: `/ops/keepers`, `/verifier`, `/admin`, agent toggle, `/demo` | sitemap §9.1 |
| **Sab 06:00** | **Freeze kontrak** (tag `freeze-contracts`) + **video backup v1** direkam; deployment **panggung** dibuat dari kode beku | design §7.3, §8; 05 §4.6; 09 §1.2 |
| Sab 08:00 | README final | 09 §1.2 [APPROVED P9] |
| **Sab 09:00** | **Freeze UI** (tag `freeze-ui`) | design §7.3, 09 §1.2 |
| Sab 10:00 | Isian HackQuest final + video submission terunggah | 09 §1.2 |
| **Sab 11:30** | **Submit internal** di HackQuest; tag `submission` | design §7.3, 09 §1.2 |
| **Sab 12:00** | **Tenggat keras** | notes §2 |
| Min 11 Okt | Demo Day (kalau masuk shortlist); checklist T−24/T−60/T−10 | 05 §4.7, 09 §1.2 |

### A.1 Jumat 9 Okt (rencana solo)

> Catatan ~09:45: blok 09:00–09:45 sudah berjalan sebelum dokumen ini ditulis. Cocokkan statusnya dengan done-check di bawah. Kalau tertinggal, potong **B** (frontend) di bootstrap terlebih dulu, bukan cek go/no-go.

#### A.1.1 Bootstrap dan go/no-go (04 §10 versi solo)

| Blok | Kerja (urutan) | Deliverable | Done-check |
|---|---|---|---|
| 09:00–09:05 | Buat repo + commit pertama | Repo `paron` dengan commit pertama | Timestamp commit ≥ 09:00 (OQR §5) |
| 09:05–09:30 | A: inisialisasi Foundry, dependency dipin (OZ 5.6.1, eas-contracts 1.9.0); `MockUSDC` + `EASGate` minimal. B (singkat): scaffold Next.js dengan versi 04 §2.1 | Kontrak smoke terkompilasi | Build kontrak lulus; T4-01 (versi `forge-std`) tercatat saat install |
| 09:30–09:45 | A: `DeployAll` scope `smoke` + penulis manifest; uji di fork anvil RH. C (sela waktu tunggu): mulai buat Safe 2-of-3 di Safe{Wallet} RH (3 EOA milik Fatih) | Manifest smoke di fork | Deploy smoke di fork sukses |
| 09:45–10:05 | **Cek 2:** broadcast smoke ke RH + verify Blockscout. Sambil menunggu konfirmasi: **cek 4** eksekusi tx uji Safe | 3 kontrak verified; tx Safe sukses | Cek 2 dan cek 4 ✅/❌ tercatat |
| 10:05–10:15 | **Cek 3:** registrasi schema `ParticipantVerified` (+ `KybApplication` kalau cepat, D-41), attest, `linkAttestation`, `isVerified` | Attestation pertama | `isVerified` = true |
| 10:15–10:30 | **Cek 5:** Ponder sync event smoke (ukur jeda → T3-01/T4-03); **cek 1:** catat saldo + gas nyata (T5-01) dan latensi (T5-02); isi `infra.json`; wallet connect di kedua chain (design §7.3) | Tabel 5 cek terisi | Semua sel cek terisi ✅/❌ |
| **10:30** | **Go/no-go** (04 §8). Go → RH Testnet. No-go → switch ke Arbitrum Sepolia (04 §8); sisa jadwal **tidak** bergeser | Tag `go-nogo`; chain tercatat di README draft | Chain terkunci; tidak ada diskusi ulang setelah ini |

#### A.1.2 S0: kontrak inti + jalur demo (10:30 → 20:00)

Urutan kontrak mengikuti design §7.3 (kolom A dipadatkan). Frontend S0 diselipkan setelah kontrak demo-path bisa di-deploy ke anvil, karena UI S0 butuh ABI nyata [usulan 08].

| Blok | Kerja | Deliverable | Done-check |
|---|---|---|---|
| 10:30–12:30 | A: `ProviderRegistry` (+ `ReputationUpdated` dengan `strikes`), `ConversionTable` (faktor awal: A100 4_500, RTX 4090 tidak dimuat), `SeriesFactory` + `BondVault` + clone `CUToken`. Test: #1, #2, #13, #15 shortlist 02 §0. Sekalian commit file `LICENSE` (MIT, T9-06 APPROVED) di root (±2 menit) | Kontrak inti terkompilasi + 4 test; `LICENSE` di repo | 4 test hijau; `createSeries` mengunci bond penuh |
| 12:30–13:00 | **Makan + buffer** | — | — |
| 13:00–15:30 | A: `PrimarySale` (fee split, `maxCost` wajib), `RedemptionManager` semua state (termasuk `refundedAfterWindow`, `finalizeRedemption`, `resolveNoRuling`). Test shortlist 02 §0 #3–#12, #14 dengan **mock `IArbitrator`**. Putuskan T5-08 (`caller` di `Defaulted`) saat menulis RM | RM lengkap + shortlist | 02 §0 "kalau tinggal 1 jam": #1, #3, #5, #6, #8, #13, #14 hijau |
| 15:30–17:30 | A: `OrderBook`-lite (10 level, IOC; ukur `forge snapshot` → **T-02 `maxFillsPerTx`**; putuskan T5-06), `PrintIndex` (parameter demo), `PanelArbitrator` (`ruleWithSignatures` 2-of-3, mode Safe), wiring `TimelockController` + Safe (delay 5 menit di set demo). Test #16 `invariant_BondCoversSupply` | Semua kontrak MVP terkompilasi | #16 hijau; angka T-02 tertulis di 01/07 |
| 17:30–18:30 | A: `DeployAll` scope `full` + seed fase 0–2 di anvil (05 §3.1–§3.3); ekspor ABI. **`test_E2E_StageScript`** (02 §4, MUST): S-01..S-13 berurutan di fixture fase 0–2 | Anvil berisi state akhir fase 2; E2E lokal | `test_E2E_StageScript` hijau (kalau merah: catat assert yang gagal, perbaiki di blok 20:00 sebelum deploy latihan) |
| 18:30–20:00 | C: handler Ponder untuk jalur demo (series, primary buy, order/trade, redemption, reputasi) + endpoint yang dibaca S0. B: halaman S0 (sitemap §9.1): `/` + `/markets` (satu halaman); `/markets/[seriesId]` bertab Buy/Trade; `/provider/series/new` (wizard); `/provider` dengan Ack / Mark delivered / Decline & pay inline; `/portfolio` bertab; `/redemptions/new` (modal); `/redemptions/[reqId]` (Confirm, **Claim default** dari wallet apa pun, Finalize, tombol Dispute); `/faucet`; `/onboarding/kyb`. Utility bar (06 §0.2; APPROVED D-65; tanpa disclaimer, D-64) ikut dari awal | ±8 komponen halaman di anvil | Satu putaran naskah 05 fase 3 (series 4) bisa diklik di anvil, termasuk **claim default dari wallet ketiga** |

**Checkpoint 20:00 (S0):** lihat A.3.

#### A.1.3 Deploy latihan + S1 anti-mock minimum (20:00 → Sab 02:00)

| Blok | Kerja | Deliverable | Done-check |
|---|---|---|---|
| 20:00–21:00 | Deploy **latihan** di chain terpilih: `DeployAll` full + verify + seed fase 0–2 (05 §4.6 butir 1). Indexer menunjuk manifest latihan. Ukur T5-11 (waktu redeploy) dan T4-05 (tampilan clone di explorer); tetapkan harga primer SGP (T5-05) sebelum seed | Manifest latihan; kontrak verified | `/v1/health` synced; 3 series tampil di `/markets` latihan |
| 21:00–21:30 | **Makan + buffer** | — | — |
| 21:30–22:30 | `/ops/keepers`: satu komponen list + tombol untuk 5 antrian (sitemap §4.9, §9.1) | Halaman keeper | Satu `claimDefault` dan satu `finalizeRedemption` dieksekusi dari halaman ini di latihan |
| 22:30–23:30 | `/verifier` satu halaman: form issue attestation + daftar pengajuan sebagai drawer. **D-41 cadangan D dulu** (penerbitan manual oleh verifier); self-attest `KybApplication` (opsi B) hanya kalau sempat | Halaman verifier | **Must-not-cut #2:** wallet baru di-approve KYB live dari UI, lalu bisa membeli |
| 23:30–00:45 | `/admin` satu halaman dengan tab ContractActionForm: proposals (schedule / execute), conversion-table, pause, treasury (read). **Schedule satu perubahan di awal blok**, eksekusi setelah delay 5 menit di akhir blok | Halaman admin | **Must-not-cut #3:** satu perubahan timelock (mis. `setFactor`) ter-`CallExecuted` dari `/admin`; terlihat di E23 |
| 00:45–01:30 | Toggle agent di `/provider` (D-42 opsi A: endpoint lokal + EIP-712 `AgentCommand`). **Uji pertama:** panggilan HTTPS → `http://127.0.0.1` dari browser. Gagal → langsung pakai fallback E (env / jendela agent), jangan di-debug lebih dari 15 menit [usulan 08]. Putuskan T5-07 (agent membaca chain vs Ponder) dari latensi ack | Agent + toggle (atau fallback E tercatat) | Agent ack ≤ 3 dtk dengan kill switch off; kill switch on → tidak ada ack |
| 01:30–01:50 | **Bot trader otomatis** (P5-26 APPROVED, 05 §2.5), satu package `agents/` dengan agent dan mekanisme deteksi yang sama (T5-07): trigger manual dulu, lalu pemicu otomatis `PrimaryBuy` `W-BUY` series 4 + cek one-shot. Uji di latihan | Bot di laptop utama | Ask 5 @ 3.20 muncul ≤ 10 dtk setelah `PrimaryBuy` `W-BUY`; tidak terpicu oleh pembelian wallet lain; trigger manual juga jalan |
| 01:50–02:00 | `/demo` checklist dari event indexer (versi ringkas); done-check S1 keseluruhan; commit | Halaman demo | Checklist `/demo` menandai langkah fase 3 dari event nyata |

**Checkpoint Sab 02:00 (S1):** lihat A.3.

### A.3 Checkpoint lama (Jumat dan Sab 02:00)

| Checkpoint | Pertanyaan | Kalau "tidak" [usulan 08] |
|---|---|---|
| Jum 10:30 | 5 cek go/no-go lulus di RH? | Switch ke Arbitrum Sepolia (04 §8); jadwal tidak bergeser |
| Jum 13:00 | Kontrak inti + 4 test hijau? | Tunda `ReferenceFeed` (NICE, D-06) dan event opsional `PrintRecorded`; ruang 15:30–17:30 dipadatkan |
| Jum 16:00 | Shortlist minimal 02 §0 hijau? | Tunda test SHOULD/NICE ke 05:30 Sab; jangan tunda #6 (claim default) dan #14 (isolasi bond) |
| Jum 18:30 | `test_E2E_StageScript` hijau? | Perbaiki dulu (maks. 30 menit, mengambil dari blok deploy latihan); S0 frontend tetap mulai |
| **Jum 20:00** | S0 bisa diklik penuh di anvil? | Lanjutkan S0 maksimal sampai 21:30 dengan memakan blok S1 sesuai cut ladder §4 tingkat 2; deploy latihan tetap malam ini |
| **Sab 02:00** | Tiga must-not-cut sudah terbukti? | Lanjutkan yang belum (tidur dipotong jadi 45 menit); S2 mulai dari cut ladder §4 tingkat 1 |

Cut ladder lama (tingkat 1–4) digantikan cut order §4.
