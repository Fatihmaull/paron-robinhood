# Paron: checklist submission ETHJKT 2026 (dev doc 09)

> **[D-82, diperjelas oleh D-92, APPROVED Fatih 2026-10-09 18:10 WIB, "rekomendasimu saja", dicatat Scout]:** seed = `CU-JKT-H100-2611` (series 1). Series panggung/demo/rekaman = `CU-JKT-H100-2610` (series 4). Catatan D-19/D-25 untuk series yang di-forge, window, `series_id`, dan field `seed.series` tetap berlaku, bukan historis. Rekaman memakai putaran baru di series 4. String `2610` yang mengikat window atau data seed tidak ditulis ulang di dokumen ini.


Status: **APPROVED-SYNCED, spec saja.** Keputusan 07 dan P9-xx disetujui Fatih (Jum 9 Okt 2026 ~09:40 WIB); disinkronkan Jum 9 Okt ~10:30 WIB untuk tim solo (D-08) dan jadwal 08. Cadangan: `.bak-2026-10-09-pre-approval/`. Isinya timeline, daftar isian, outline README, checklist video, pemetaan kriteria juri, checklist aturan, dan daftar item terbuka. Tidak ada kode, script, atau secret. Tidak ada pengecekan eksternal: semua fakta diambil dari dokumen kanonik, dan yang tidak ada di sana ditandai **[TBD]**. Disusun Kamis 8 Okt 2026, ~21:40 WIB.

**Catatan audit Jum 9 Okt 2026 ~11:09 WIB (audit Principal Engineer; cadangan `.bak-2026-10-09-pre-audit/`). APPROVED Fatih ~11:05 WIB (07 §10.4):**
- **Atribusi README:** README menyatakan proyek dibangun dengan bantuan Grok Bot. Teks kerja (~11:12 WIB; Fatih: "bilang saja ini dibantu oleh grokbot"): "Built by Fatih Maulana with help from Grok Bot" / "Dibangun oleh Fatih Maulana dengan bantuan Grok Bot". Dicatat di §3.2, §6 R5, §7.
- **Git author:** semua commit dari cloud agent ber-author Fatih, bukan agent: `Fatih Maulana` / `fatihmaulanamail@gmail.com` (diisi ~11:12 WIB, 04 §9.2). Repo: https://github.com/Fatihmaull/paron-robinhood. Dicek di §7.
- **Jadwal:** 08 memakai 4 lane paralel T0-relatif (D-59), **T0 = Jum 9 Okt 2026 11:14 WIB** ("go" Fatih). Go/no-go selesai ≤ 11:59 WIB (D-57); RH gagal → **langsung** Arbitrum Sepolia (APPROVED ~11:12 WIB). Tabel §1.2 baris Jumat hanya referensi; jangkar Sabtu tidak berubah.

**Changelog Jum 9 Okt 2026 ~11:17 WIB (approval keempat Fatih ~11:12 WIB, 07 §10.5; cadangan `.bak-2026-10-09-pre-1112/`):** [TBD] untuk git author, repo, dan teks atribusi dihapus (nilai di atas); catatan §1.2 diperbarui dengan T0 = 11:14 WIB.
**Changelog Jum 9 Okt 2026 13:30 WIB (approval kelima Fatih, 07 §12; cadangan `.bak-2026-10-09-pre-1331/`):** D-64: footer dan semua teks "not affiliated" dihapus dari produk (web dan README); blok README §3.2 tanpa footnote; disclaimer hanya di pitch deck / slide; cek §7 diganti "0 hasil untuk Not affiliated di README dan web". Aturan wording tetap (tanpa "partner", tanpa logo, tanpa "feeds"). Never-cut tepat 3 butir.
**Changelog Jum 9 Okt 2026 ~13:10 WIB (cadangan `.bak-2026-10-09-pre-1310/`):** URL demo/app terisi (D-10/D-58, Scout ~13:08 WIB): frontend `https://paron.vercel.app`; API `https://paron-robinhood-production.up.railway.app/v1` (§2 #4, §7).
- D-54: attester KYB hackathon = EOA `W-VERIFIER` berlabel "Paron demo verifier (team-operated)"; proposer Timelock = Safe + `W-ADMIN`, executor terbuka. Ini mengubah teks governance/limitation README (§3.1 #9 di bawah).

**Sumber:**
- `notes.md` **(notes §x)**: aturan, kriteria juri, timeline, isian submission ETHJKT (diambil dari HackQuest [S1] dan Luma [S2] pada 6 Okt 2026);
- `open-questions-research.md` **(OQR §5)**: kutipan aturan "Build From Scratch", "New Features & Existing Projects", "Originality & Attribution", "Disqualification";
- `paron-design.md` **(design §x)**: §6 dan §11.5 (footnote), §7.1 (scope + README), §7.3 (build plan WIB), §7.4 (naskah), §7.5 (blok atribusi README), §7.6 (one-liner), §8 (Q&A + risiko), §10.5 (cara menampilkan tautan Ornn), §11.2–§11.4 (pra-Jumat, go/no-go, fallback Safe);
- `paron-stack.md` **(stack §x)**: §3.5 footnote, §4 tech stack, §4.7 dokumen repo;
- `paron-product-knowledge.md` **(PK §x)**: §1.5 konteks hackathon, §6.9 diagram arsitektur, §9.4 aturan, §10.3 guardrail, §11 naskah;
- konsistensi dengan **04** (tag git, commit pertama, manifest, verifikasi, bootstrap), **05** (naskah ter-retime P5-06, jadwal deployment panggung, checklist pra-demo, fallback), **06** (utility bar APPROVED D-65, tanpa disclaimer, layar per adegan) dan **07** (D-01..D-44 APPROVED Jum 9 Okt ~09:40 WIB, D-10 ~10:33 WIB; D-54/D-57/D-59 APPROVED ~11:05 WIB; D-45..D-53, D-55, D-56, D-58 PENDING, 07 §11); jadwal jam per jam di **08**.

**Legenda:**
- **[D-xx]** = keputusan 07, **APPROVED** (Jum 9 Okt 2026 ~09:40 WIB, Fatih). **[APPROVED P9-xx]** = usulan dokumen ini, disetujui (sebelumnya `[PENDING P9-xx]`). **[TBD T9-xx]** = tidak ada di dokumen kanonik dan belum ada rekomendasi.
- **Peran pemilik** memakai template design §7.3: **A** = kontrak, **B** = frontend, **C** = produk/pitch (+ indexer di 04 §10). **D-08 APPROVED: tim = Fatih solo**, jadi A, B, C, "semua" dan "pemegang akun" = **Fatih**. Label peran dipertahankan hanya untuk menunjukkan jenis pekerjaan; urutan kerja ada di 08.
- Status isian: ⬜ belum, 🟨 bisa didraf sekarang dari dokumen, 🟦 menunggu hasil build, ✅ selesai.
- Semua waktu = **WIB (UTC+7)**.

---

## 0. Ringkasan

- **Satu-satunya tenggat keras: Sab 10 Okt 2026, 12:00 WIB** (submission ditutup, notes §2). Target internal Sab 11:30 (design §7.3) adalah catatan historis dan tidak mengikat [D-90].
- Submission lewat HackQuest ("official submission platform"); isian menurut notes §1: deskripsi proyek, problem & solution, repo GitHub, demo / aplikasi ter-deploy, tech stack, use case RWA, video demo **atau** materi presentasi, info tim. Nama field persis dan batas karakternya **tidak** ada di dokumen → [TBD T9-01].
- **Batas durasi video tidak disebut** di dokumen kanonik → [TBD T9-02]. Rekomendasi: video submission = rekaman naskah ter-retime 2:30 (05 P5-06), maks ~3 menit [APPROVED P9-05].
- Demo Day **Min 11 Okt 10:00–21:00 WIB** hanya untuk tim terpilih; judging berakhir 15:00 WIB; waktu pengumuman shortlist dan pemenang tidak dipublikasikan (notes §2).
- Aturan inti: dibangun dari nol selama periode resmi; commit pertama ≥ Jum 09:00 WIB; atribusi pihak ketiga wajib (OQR §5; 04 §9.2).
- **[D-64, 13:30 WIB]** Footnote "not affiliated" hanya di pitch deck / slide yang menyebut Ornn/ICE/OCPI/Robinhood (teks di §3.2). Penyebutan di footer situs dan README: historis [D-64].
- **Penugasan pemilik [APPROVED Fatih langsung, 2026-10-09 17:01 WIB]:** video demo = agen evergreen video editor yang sudah ada (tidak ada bot baru; §4.6). Submit HackQuest = Fatih sendiri yang menekan submit. Pitch deck = Fatih sendiri yang membuatnya.

---

## 1. Timeline dan buffer internal

### 1.1 Tenggat resmi (notes §2)

| Waktu (WIB) | Kejadian | Sumber | Catatan |
|---|---|---|---|
| Sen 5 – Rab 7 Okt | Workshop pra-hackathon | notes §2 | sudah lewat |
| **Jum 9 Okt 09:00** | Day 1: sprint offline 12 jam dimulai; submission **dibuka** | notes §2 (submissionOpen 2026-10-09T02:00Z) | jam sprint tidak dipublikasikan (agregator: 10:00–21:00, belum dikonfirmasi) |
| **Sab 10 Okt 12:00** | Day 2 (online): submission **ditutup** | notes §1, §2 (submissionClose 2026-10-10T05:00Z; teks "12:00 PM (WIB)") | tenggat keras |
| antara Sab 12:00 dan Min | Pengumuman shortlist Demo Day | notes §2 | **tidak dipublikasikan** [TBD T9-03] |
| **Min 11 Okt 10:00–21:00** | Day 3: Demo Day (tim terpilih) | notes §2 (Luma) | venue: Ganara Art vs pin Luma Garuda Spark, belum dikonfirmasi (notes "Unconfirmed") |
| Min 11 Okt 15:00 | Judging berakhir ("rewardTime") | notes §2 | jam slot demo tim = [TBD T9-04] |
| — | Pengumuman pemenang | notes §2 | tidak dipublikasikan, kemungkinan di Demo Day |

Jendela build = Jum 09:00 → Sab 12:00 = **27 jam** (notes §2). Boleh terus membangun setelah sprint 12 jam sampai tenggat Day 2 (notes §1 aturan 8 / FAQ).

### 1.2 Jadwal internal (design §7.3, 04 §10, 05 §4.6) + buffer

**[APPROVED D-59 / D-57, Jum 9 Okt ~11:05 WIB]** Baris Jumat di tabel ini (go/no-go 10:30, blok 10:30–20:00, dst.) digantikan rencana 4 lane di 08 §1 dengan **T0 = "go" Fatih = Jum 9 Okt 11:14 WIB**: go/no-go 11:14–11:59 (gagal → langsung Arbitrum Sepolia), G2 16:14, G3 / S0 selesai 19:14, S1 selesai Sab 01:14 + buffer G4 sampai 02:00. Baris Sabtu untuk freeze 06:00, freeze UI 09:00, dan submit 11:30 adalah catatan historis [D-90] dan tidak mengikat. Tenggat 12:00 tetap.

**Tim solo (Jum 9 Okt):** semua milestone di bawah dipegang Fatih. **Tenggat yang dikunci: Sab 12:00 WIB.** Jam Sab 06:00 (freeze kontrak + video backup v1), Sab 09:00 (freeze UI), dan Sab 11:30 (submit internal) tidak mengikat [D-90]. Rincian per jam, blok tidur, dan cut ladder: `08-team-tasks.md`. Yang menekan submit di HackQuest = Fatih sendiri.

**[SUPERSEDED / CANCELLED D-90; sebelumnya PENDING, rincian 08 §7.2]** Usulan batas kode setelah freeze tidak berlaku. Tidak ada aturan freeze kontrak, tidak ada aturan freeze UI, dan tidak ada aturan setelah freeze. Tag `freeze-contracts` dan `freeze-ui` tidak dipakai. Teks usulan dipertahankan di 08 §7.2 sebagai riwayat: setelah 06:00 tidak ada perubahan kontrak; setelah 09:00 hanya perbaikan bug yang memblokir jalur demo S0; setelah submit internal 11:30 tidak ada merge kecuali blocker yang diumumkan lebih dulu. Jam itu tidak mengikat. Izin merge saat test hijau (04 §9.2) tidak dibatalkan oleh D-90.

| Waktu (WIB) | Milestone | Pemilik | Sumber | Buffer / catatan |
|---|---|---|---|---|
| Kam 8 Okt (hari ini) | Prasyarat non-kode: wallet baru didanai di kedua chain, key Alchemy + Etherscan V2, toolchain terpasang, keystore deployer, owner Safe | Fatih | design §11.2, 04 §10 | tidak ada repo dan tidak ada deploy publik Paron sebelum Jum 09:00 |
| **Jum 09:00–09:05** | Buat repo + **commit pertama** (timestamp ≥ 09:00) | Fatih | 04 §9.2, §10; OQR §5 | bukti aturan "build from scratch" |
| Jum 09:00–10:30 | Chain smoke test, lima cek go/no-go | Fatih | design §11.3, 04 §8 | |
| **Jum 10:30** | Keputusan go/no-go; tag `go-nogo` | Fatih | design §11.3, 04 §9.2 | kalau no-go: switch ke Arbitrum Sepolia ~30–45 menit; baris chain README ikut diganti |
| Jum 10:30–20:00 | Kontrak inti, frontend S1–S4, naskah + angka (C) | Fatih | design §7.3 | **Jum 20:00** = titik keputusan fallback order book ("list at price, take") kalau tertinggal (design §8) |
| Jum 20:00–24:00 | Deploy + verify + seed (deployment **latihan**); README + diagram arsitektur | Fatih | design §7.3, 05 §4.6 | draft README v1 selesai di blok ini [APPROVED P9-01] |
| Sab 00:00–06:00 | Bug fixing; polish UI; **rekam video backup** | Fatih | design §7.3, §8 | video backup paling lambat **Sab 06:00** (design §8, PK §11.1, 05 §0) |
| **Sab 06:00** | **[HISTORIS, SUPERSEDED / CANCELLED D-90]** Freeze kontrak; tag `freeze-contracts` tidak dipakai; buat deployment panggung dari kode beku (fase 0–2 saja). Jam ini tidak mengikat | Fatih | design §7.3, 04 §9.2, 05 §4.6 | `git.commit` manifest `stage-1` = commit bertag (syarat tag historis, D-90) |
| Sab 06:00–10:00 | Gladi demo ×3 (di deployment latihan atau anvil, **bukan** panggung) | Fatih | design §7.3, 05 §4.6 | |
| Sab 08:00 | README final (alamat panggung dari `DEPLOYMENTS.md`) | Fatih | usulan | buffer 3,5 jam sebelum tenggat [APPROVED P9-01] |
| **Sab 09:00** | **[HISTORIS, SUPERSEDED / CANCELLED D-90]** Freeze UI; tag `freeze-ui` tidak dipakai. Jam ini tidak mengikat | Fatih | design §7.3, 04 §9.2 | build frontend final menunjuk manifest `stage-1` |
| Sab 10:00 | Semua teks isian HackQuest final; video submission terunggah dan bisa diputar tanpa login | Fatih | usulan | [APPROVED P9-02]. Video: agen evergreen video editor yang sudah ada (§4.6) |
| Sab 10:00–11:15 | Checklist pra-submit (§7): link, verifikasi, repo publik, tag | Fatih | usulan | |
| **Sab 11:30** | **[HISTORIS D-90]** Submit di HackQuest; tag `submission`; simpan tangkapan layar konfirmasi. Jam 11:30 tidak mengikat. Yang menekan submit = Fatih sendiri | Fatih | design §7.3, 04 §9.2 | 30 menit buffer sampai tenggat (catatan lama) |
| **Sab 12:00** | **Tenggat keras** (tetap mengikat) | — | notes §2 | setelah ini deployment panggung tidak disentuh, kecuali push referensi (F-5) dan cek baca (05 §4.6) |
| Sab sore (T−24 jam dari demo) | Checklist pra-demo T−24 | Fatih | 05 §4.7 | video backup di 2 perangkat |
| Min 11 Okt, T−60 / T−10 menit | Checklist pra-demo T−60, T−10 | Fatih | 05 §4.7 | slot demo [TBD T9-04] |

**Divergensi kecil (historis):** 05 §4.6 butir 3 menjadwalkan rekaman video backup di blok Sab 06–10, sedangkan design §7.3/§8, PK §11.1 dan 05 §0 meminta paling lambat Sab 06:00. Rekomendasi lama: video **v1 wajib selesai Sab 06:00** (deployment latihan, kode pra-freeze), video **v2 opsional** Sab 06–10 setelah freeze kalau UI berubah terlihat [APPROVED P9-03] (§9 X9-1). Jam 06:00 dan batas freeze di kalimat ini tidak mengikat [D-90]. Video demo sekarang dipegang agen evergreen video editor yang sudah ada (§4.6).

---

## 2. Isian submission HackQuest

Sumber daftar: notes §1 "Submission requirements (due Day 2, 12:00 WIB, via HackQuest 'official submission platform')": *"project description; problem & solution; GitHub repository; demo / deployed application; tech stack; RWA use case; demo video or presentation materials; team information."* Catatan notes §1: track submission kustom HackQuest **dinonaktifkan**; track hanya satu, "RWA — Build the Real World Onchain".

Nama field persis, urutan, wajib/opsional, batas karakter, dan format unggahan **tidak** ada di dokumen → [TBD T9-01]. Tabel di bawah memakai nama dari notes.

| # | Isian (notes §1) | Yang diisi | Sumber dokumen | Pemilik | Status |
|---|---|---|---|---|---|
| 1 | Project description | Nama "Paron" + one-liner EN utama: *"Paron turns GPU capacity into collateral-backed compute units. Any verified data center can list in a few clicks, anyone can trade them, and code pays holders if a provider doesn't deliver."* + makna nama (*"Paron means anvil…"*) | design §7.6, PK §2 | C | 🟨 |
| 2 | Problem & solution | Problem: jam GPU yang bisa dikirim masih dijual lewat deal privat, tanpa jaminan delivery dan tanpa harga publik (design §7.4 hook, PK §10.2). Solution: unit CU standar (1 CU = 1 jam GPU setara H100), bond ≥ 1,5× harga primer dikunci sebelum unit ada, default dibayar siapa saja dari bond, order book + print publik (design §7.6, §8 baris "Isn't this just a database?") | design §7.4, §7.6, §8; PK §10.2 | C | 🟨 |
| 3 | GitHub repository | https://github.com/Fatihmaull/paron-robinhood (monorepo, 04 §1); harus bisa diakses juri (notes §1 aturan 5: "Judges may review code, docs and demo") | 04 §1, §9 | A | 🟦 (URL diisi ~11:12 WIB; repo publik saat submit, P9-14) |
| 4 | Demo / deployed application | URL frontend = `https://paron.vercel.app` (D-10; Vercel project `paron`, root `web/`, commit `b18b3d4`; tanpa domain kustom); URL API = `https://paron-robinhood-production.up.railway.app/v1` (D-58; health 200, `synced:false` sampai kontrak di-deploy); chain + chain ID + link explorer, link `DEPLOYMENTS.md` | stack §4.5, 04 §7/§8, 06 §0.5; Scout ~13:08 WIB | B (URL web), C (API) | 🟦 (URL terisi ~13:08 WIB) |
| 5 | Tech stack | Solidity 0.8.37 + Foundry 1.8.5 + OpenZeppelin 5.6.1; EAS (self-deploy 1.9.0 di RH / existing di Arbitrum Sepolia); Safe 1.4.1; Ponder 0.17.12 + Hono; Next.js 16.3.8 + wagmi 2.19.5 + viem 2.57.3 + RainbowKit 2.2.11 + Tailwind/shadcn; Node 24 agents; Robinhood Chain Testnet (46630), fallback Arbitrum Sepolia (421614) | stack §4, 04 §2 | A | 🟨 (konfirmasi versi akhir dari manifest `toolchain`) |
| 6 | RWA use case | Kapasitas GPU sebagai aset dunia nyata: forward fisik yang bisa dikirim, berjaminan kolateral, dengan KYB partisipan. Dari daftar use case notes §1 yang paling dekat: "onchain infra for traditional assets", "identity, compliance & verification", "commodities" [APPROVED P9-04: kategori yang dipilih kalau form memakai dropdown] | notes §1, design §7.6, PK §10.2 | C | 🟨 |
| 7 | Demo video **atau** presentation materials | Rekomendasi: **keduanya**: link video (§4) + deck (PDF) dengan footnote | notes §1, §4 dokumen ini | Video: agen evergreen video editor yang sudah ada (bukan bot baru, §4.6). Pitch deck: Fatih sendiri. Submit: Fatih sendiri | 🟦 |
| 8 | Team information | Nama anggota, peran, kontak; maks 4 orang per tim; anggota harus dicantumkan akurat (notes §1 aturan 4) | notes §1, 07 D-08 | Fatih | 🟨 tim = Fatih solo [D-08 APPROVED] |

**Teks tambahan yang disarankan di deskripsi atau README (bukan field yang disebut notes):**
- Pernyataan "what was newly developed" (aturan 2, OQR §5): semua kode dibuat selama hackathon; riset/desain pra-hackathon ada di `docs/dev/` dengan catatan (04 §9.2).
- Daftar atribusi pihak ketiga (aturan 10, design §7.5).
- Tanpa footnote "not affiliated" [D-64]; aturan wording §3.2 tetap berlaku.

Pertanyaan terbuka: apakah Fatih sudah terdaftar dan siapa pemegang akun yang men-submit (notes "Unconfirmed": "Whether Fatih is registered") → [TBD T9-05].

---

## 3. Outline README

Kewajiban dari sumber (historis untuk README dan produk, [D-64]): "README with architecture, contract addresses, the attribution block (§7.5), and the 'not affiliated with Ornn' and 'not affiliated with Robinhood' footnotes. The chain, chain ID and explorer links go at the top." (design §7.1). **[D-64, 13:30 WIB] Kedua footnote itu historis di README dan produk; yang berlaku: footnote hanya di pitch deck.** Stack §4.7: "`README.md` (chain and explorer links first, architecture diagram, attribution and 'not affiliated' footnotes), `METHODOLOGY.md`, `paron-spec/v1.schema.json`, `SERIES_TERMS.md`, `DEPLOYMENTS.md` (addresses per chain)" — kutipan footnote di situ historis untuk README [D-64]. README bahasa Inggris (sejalan dengan copy UI, 06 P6-01) [APPROVED P9-06].

### 3.1 Urutan bagian

| # | Bagian README | Isi | Sumber | Pemilik |
|---|---|---|---|---|
| 1 | Baris chain (paling atas) | Chain, chain ID, link explorer, link app + API. RH: "Robinhood Chain Testnet · chain ID 46630 · explorer.testnet.chain.robinhood.com". Kalau no-go: diganti Arbitrum Sepolia 421614 + Arbiscan (design §11.3 "Update the README chain line"; 04 §8 `readmeChainLine`) | design §7.1, §11.3; stack §4.7 | A |
| 2 | Judul + one-liner | "Paron" + one-liner EN utama + satu tagline (design §7.6) | design §7.6 | C |
| 3 | Problem / solution singkat | 3–5 kalimat dari §2 isian #2 | design §7.4, §8 | C |
| 4 | Demo walkthrough | 6 adegan naskah ter-retime (05 §2.3) dalam bentuk langkah yang bisa diulang juri: lihat S1 → listing di S2 → beli/trade di S3 → redeem → default diklaim siapa saja. Sertakan link video (§4) dan cara mencoba tanpa KYB: klaim default bisa dari wallet mana pun [D-31] | 05 §2.3, 06 §14 | C |
| 5 | Arsitektur | Gambar/diagram dari `docs/architecture.md` (04 §1) berdasarkan diagram PK §6.9: kontrak → event → Ponder/Hono API → frontend; agent provider + keeper | 04 §1, PK §6.9, design §7.3 kolom C | C |
| 6 | Kontrak ter-deploy | Tabel §3.3, dibangkitkan dari manifest (04 §7). Link ke `DEPLOYMENTS.md` | 04 §7.1 | A |
| 7 | Parameter demo vs prod | "demo parameters": ack 60 s, delivery 60 s, dispute 90 s, ruling 120 s, timelock 5 menit; nilai prod: ack 24 h, delivery 48 h, dispute 72 h, ruling 7 hari, timelock 48 h. Link `SERIES_TERMS.md` [D-20] | 07 D-20, PK §6 | A |
| 8 | Data dan indeks | Endpoint API utama (`/v1/prints`, `/v1/index/{gpu}`, `/v1/series/{id}`, `/v1/accounts/{addr}/statement`); kalimat jujur "onchain VWAP; winsorized index published by the Paron API under METHODOLOGY.md" [D-16]; label referensi "Spot reference (synthetic demo data)" [D-06] | 03, 07 D-16, design §10.5 | C |
| 9 | Governance dan peran | Admin = Safe 2-of-3 + Timelock di RH; di fallback: "multisig on Robinhood Chain; role allowlist + timelock on the fallback" (design §11.4 opsi B). Verifier = "Paron demo verifier" [D-04]. Fee: "fees go to the team multisig" [D-13] | design §11.4, 07 D-04/D-13 | A |
| 10 | Cara menjalankan | §3.4 | 04 §2, §4, §10 | A |
| 11 | Tests | Daftar test wajib design §7.1 + invariant stack §4.6; cara menjalankan dalam prosa (04 §9.1) | design §7.1, stack §4.6, 02 | A |
| 12 | Known limitations | §3.5 | design §8, 01/03/05/06 | C |
| 13 | What was built during the hackathon | Pernyataan aturan 2: semua kode di repo ini dibuat mulai Jum 9 Okt 09:00 WIB (lihat riwayat commit); `docs/dev/` = riset/desain pra-hackathon (04 §9.2) | OQR §5, 04 §9.2 | C |
| 14 | Built with (atribusi) | Blok design §7.5 **kata per kata** (§3.2) + daftar tambahan [APPROVED P9-07] | design §7.5 | C |
| 15 | Team | Nama + peran [D-08] | notes §1 aturan 4 | Fatih |
| 16 | License | **MIT** [APPROVED T9-06, Jum 9 Okt 2026 ~10:33 WIB, Fatih]: bagian "License" menyebut MIT dan menautkan file `LICENSE` di root | keputusan Fatih | Fatih |

### 3.2 Teks wajib kata per kata

**[D-64, 13:30 WIB]** Blok README di bawah **tidak lagi memuat** kalimat "Not affiliated with or endorsed by …" (dihapus; disclaimer pindah ke pitch deck saja).

**Blok atribusi README (design §7.5, "paste as-is"):**

> ## Built with
> Paron was built during ETHJKT 2026. Third-party code: OpenZeppelin Contracts (MIT),
> Ethereum Attestation Service, Foundry, wagmi/viem. GPU conversion factors are derived
> from public NVIDIA datasheets and public rental-price benchmarks (sources in docs).
> Deployed on Robinhood Chain Testnet (fallback: Arbitrum Sepolia).

(Tanda `>` di atas hanya penanda kutipan di dokumen ini; di README, blok ditempel tanpa `>`.)

**Atribusi bantuan AI [APPROVED Fatih, Jum 9 Okt ~11:05 WIB; teks kerja ~11:12 WIB]:** tepat di bawah blok di atas (blok tetap kata per kata), README menambahkan satu baris:
- EN (README): "Built by Fatih Maulana with help from Grok Bot".
- ID (kalau ada versi Indonesia): "Dibangun oleh Fatih Maulana dengan bantuan Grok Bot".

**Footnote hanya untuk pitch deck / slide [D-64].** Penyebutan di README dan web: historis [D-64]. Dipakai di slide penutup dan setiap slide yang menyebut pihak lain:
- Ornn (design §6, PK header): *"Not affiliated with or endorsed by Ornn AI Inc. Ornn and OCPI are trademarks of their owners."*
- Robinhood (design §11.5, stack §3.5, PK header): *"Not affiliated with or endorsed by Robinhood Markets, Inc. Robinhood and Arbitrum are trademarks of their respective owners."*
- Kalau slide menyebut ICE/HPR, tambahkan (PK header, design §10.5 #6): *"Not affiliated with or endorsed by Ornn AI Inc. or ICE. OCPI and HPR are trademarks of their respective owners; figures cited from public sources."*

**Guardrail kata (design §6, §11.5; PK §10.3):** pakai "deployed on Robinhood Chain Testnet", "complements", "could ingest". **Jangan** pakai "partner", "powered by", "built for / backed by / partnered with Robinhood", logo Robinhood atau Ornn, "feeds OCPI", "Ornn-compatible", dan jangan menampilkan Stock Tokens. Jangan klaim dukungan Robinhood, Offchain Labs, atau Arbitrum Foundation (design §11.5).

**Kalau go/no-go memindahkan ke Arbitrum Sepolia:** baris "Deployed on Robinhood Chain Testnet (fallback: Arbitrum Sepolia)" di blok atribusi tidak lagi akurat. Rekomendasi: tempel blok apa adanya dan tambahkan satu kalimat di bawahnya, "This submission's live deployment runs on Arbitrum Sepolia after the Friday go/no-go." Dengan begitu blok tetap "as-is" dan baris chain di atas README tetap benar [APPROVED P9-08].

### 3.3 Tabel alamat ter-deploy (dari manifest 04 §7)

Sumber: `deployments/<chainId>/stage-1.json` (`contracts`, `seed.series`, `roles`) + `infra.json` (`mockUsdc`, `eas`, `safe`, `schemas`). `DEPLOYMENTS.md` dibangkitkan dari manifest dan tidak diedit tangan (04 §7.1). Tabel README = salinan ringkas atau link ke `DEPLOYMENTS.md` [APPROVED P9-09: README memuat tabel ringkas + link].

Kolom: **Contract** · **Address** · **Explorer** (`explorerUrl`) · **Verified** (`verified`) · **Deploy tx** (`txHash`).

| Kelompok | Baris (nama kontrak 01) | Sumber field manifest |
|---|---|---|
| Inti Paron | `ProviderRegistry`, `ConversionTable`, `SeriesFactory`, `CUToken` (implementasi), `BondVault`, `PrimarySale`, `OrderBook`, `RedemptionManager`, `PanelArbitrator`, `PrintIndex`, `ReferenceFeed`, `EASGate` atau `RegistryGate`, `TimelockController` | `<label>.json` → `contracts` |
| Infrastruktur | `MockUSDC`, `EAS` + `SchemaRegistry` (self-deploy di RH, existing di Arbitrum Sepolia), schema UID `ParticipantVerified`, Safe tim | `infra.json` → `mockUsdc`, `eas`, `schemas`, `safe` |
| Token series | `CU-JKT-H100-2611`, `CU-BTM-H200-2611`, `CU-SGP-B200-2612` (seed) dan `CU-JKT-H100-2610` (di-forge live; series 4, panggung/demo) [D-19] [D-25]. D-82 diperjelas oleh D-92 (APPROVED 18:10 WIB): token `2610` di sel ini berlaku, bukan catatan historis. Rekaman memakai putaran baru di series 4 | `<label>.json` → `seed.series` |
| Peran | treasury, panel (anggota + threshold), feed signer, minter, `adminMode` | `<label>.json` → `roles` |

Catatan:
- Alamat yang dicantumkan = deployment **panggung** `stage-1` (05 §4.6 butir 4), bukan latihan.
- Clone `CUToken` per series tidak diverifikasi satu per satu; tampilkan implementasi + catatan [TBD 04 T4-05].
- Kalau verifikasi EAS self-deploy gagal: tulis atribusi + link source EAS dan tandai "unverified" (04 §6.4, P4-16).
- Series 2610 baru ada setelah forge di panggung; README menyebut "forged live on stage; see video" agar juri tidak mencarinya di manifest submission [APPROVED P9-10]. **[D-82, diperjelas oleh D-92, APPROVED 18:10 WIB]** Series demo/rekaman = `CU-JKT-H100-2610` (series 4). Seed series 1 tetap `CU-JKT-H100-2611`. Rekaman memakai putaran baru di series 4. Kalimat `2610` di atas tetap D-19 dan berlaku.

### 3.4 Cara menjalankan (prosa, mengikuti 04)

1. **Prasyarat:** Foundry v1.8.5, Node 24.21.0, pnpm 12.9.1 (04 §2).
2. **Install:** `pnpm install` di root (lockfile beku); `forge build` di `contracts/`.
3. **Env:** salin `.env.example` per package (04 §4); tidak ada secret di repo (04 §4.1).
4. **Test:** `forge test` (unit/fuzz), `invariant_*` profil `ci`, fork test opsional dengan RPC sendiri (04 §9.1).
5. **Lokal penuh:** anvil fork RH (`latest − 20`, key baru), `DeployAll` scope `full`, `Seed` fase 0–2 (`SEED_MODE=stage`), Ponder dev, web dev (04 §6, §10; 05 §4.1).
6. **Frontend tanpa chain:** `NEXT_PUBLIC_DATA_SOURCE=mock` membaca `fixtures/v1/` (04 §4.5, 06 §11.3).
7. **Agent provider + keeper:** paket `agents/`; keeper dry-run (stack §4.4).

Semua perintah ditulis di README sebagai blok perintah biasa saat repo dibuat; dokumen ini tidak memuatnya.

### 3.5 Known limitations (jujur, untuk README dan Q&A)

| Batasan | Sumber |
|---|---|
| Testnet saja; settlement memakai `MockUSDC` (faucet 5,000 per jam) | design §9, 07 D-40 |
| Window demo 60/60/90/120 s; nilai prod berbeda | 07 D-20 |
| Deployment demo memakai flag `allowOpenWindow` agar series bulan berjalan bisa di-redeem (hanya demo) | 07 D-19 |
| Referensi harga = data sintetis berlabel; tanpa OCPI (butuh lisensi tertulis) | design §10.5, 07 D-06 |
| Indeks winsorized dihitung API, onchain hanya VWAP | 07 D-16 |
| KYB oleh "Paron demo verifier" (multisig tim), bukan auditor independen | 07 D-04 |
| Delivery receipt = hash JSON usage; output GPU agent di demo adalah mock berlabel | 07 D-26, stack §4.4 |
| `deliveryRef` hanya hash; enkripsi ke key provider + IPFS belum ada | PK §6.2, 05 T5-04 |
| Arbitrator = panel tim 2-of-3; adapter Kleros/UMA belum ada | design §7.1 nice #5, 07 D-03/D-36 |
| Sisa risiko default strategis saat harga GPU melonjak (mitigasi v2: margin call berbasis indeks) | design §8 |
| Status hukum: produksi butuh struktur legal dan mungkin venue berlisensi (OJK, POJK 27/2024) | design §8 |
| S6/S7 dan CSV statement = NICE; status final tergantung build | design §7.2, PK §6.6 |
| Order book dibatasi 10 level per sisi | 07 D-17 |

---

## 4. Checklist video demo

### 4.1 Persyaratan yang diketahui

| Hal | Isi | Sumber |
|---|---|---|
| Wajib? | "demo video **or** presentation materials" | notes §1 |
| Durasi maksimum | **tidak disebut** | [TBD T9-02] |
| Format / host | **tidak disebut** | [TBD T9-07] |
| Rekomendasi | Video = naskah ter-retime 2:30 (05 P5-06), target ≤ 3:00; host yang bisa diputar tanpa login | [APPROVED P9-05] |
| Dua fungsi | (a) lampiran submission (Sab 11:30); (b) video backup Demo Day (fallback level 4b/5, 05 §4.8) | design §8, 05 §4.8 |

### 4.2 Adegan (05 §2.3, ter-retime P5-06)

| Waktu | Adegan | Yang harus terekam | Layar (06) |
|---|---|---|---|
| 0:00–0:12 | Hook | S1 dengan 3 series seed; strip "H100 index · THIN · no eligible prints yet" vs "Spot reference (synthetic demo data) $3.00" | S1 + strip |
| 0:12–0:40 | List in 3 clicks | preset `CU-JKT-H100-2610`, kartu preview "500 CU · $3.00 · bond $2,250 (1.5×)", tanda tangan permit + 1 tx, stopwatch < 40 dtk (target ≤ 28) | S2 → S3 |
| 0:40–0:58 | Buy and trade | buy 20 CU ($60.00); ask 5 @ $3.20 muncul lalu diambil wallet 2; print di tape; strip `THIN` → `OK` $3.20; series H200 "$4.06/CU = $5.69 per H200-hour" | S3 |
| 0:58–1:10 | Redeem 8 → ack → delivered | timeline Requested → Acknowledged (≤ 3 dtk) → Delivered; S5 di layar samping | S4 + S5 |
| ≈1:10 | Kill switch + redeem 10 | jendela agent, kill switch dinyalakan; countdown "Ack deadline in 1:00 (chain time)" | S4 |
| 1:12–1:20 | Confirm #1 | CU burn; bond $2,250 → $2,214; reputasi "8 CU delivered" | S4 → S3 |
| 1:20–1:35 | Paron Prints | terminal `curl …/v1/prints?gpu=H100&limit=3` (3 print) | terminal |
| 1:35–1:45 | Integrity callout (opsional) | kartu "Blocked: self-trade" (`SelfMatch()`) di series 3 | S3 |
| 1:45–2:10 | Countdown | tombol "Claim default" disabled lalu aktif saat deadline lewat | S4 + HP |
| ≈2:11–2:15 | WOW claim default | HP (wallet tanpa KYB) menekan "Claim default"; "Default paid. $45.00 sent to 0x2222…2222."; bond $2,214 → $2,169; strike | S4-R mobile → S3 |
| 2:15–2:30 | Close | slide pipeline GW Indonesia 2027 + slide footnote not affiliated | slide |

Kalau listing molor, potong callout integritas dulu, lalu persingkat "Paron Prints" (05 §2.3).

### 4.3 Daftar shot

1. **Layar utama** 1920×1080 (atau resolusi proyektor) browser profil "Provider" lalu "Buyer" (05 §2.4); zoom browser cukup besar agar angka terbaca [APPROVED P9-11].
2. **Split screen / inset S5 + jendela agent** untuk adegan ack ≤ 3 dtk dan kill switch (05 §2.4).
3. **Terminal** dengan font besar untuk `curl` (adegan Prints).
4. **Shot HP** (kamera atau screen-record HP) saat juri/wallet ketiga menekan "Claim default"; layar mobile S4-R (06 §5.7). Kalau tidak ada orang kedua, gunakan wallet ketiga di browser terpisah dan jelaskan di narasi (design §7.4 "or use a third wallet").
5. **Explorer (Blockscout/Arbiscan)**: tx `claimDefault` yang menunjukkan payout ke **holder**, bukan pemanggil (05 S-13). Cuplikan 2–3 dtk; opsional.
6. **Slide close** dengan footnote.
7. **Overlay teks** untuk waktu yang dipotong (lihat §4.4).

### 4.4 Setup rekaman

- **Deployment:** deployment **latihan** atau anvil, **tidak pernah** deployment panggung (05 §4.6 butir 3); kalau anvil dipakai, countdown bisa dipercepat dengan maju waktu, tetapi video harus jujur (lihat butir berikut).
- **Kejujuran waktu:** countdown 60 dtk boleh dipotong di editing **hanya** dengan overlay jelas, mis. "⏩ 45 s skipped (real-time countdown)" [APPROVED P9-12]. Jangan memakai request yang disiapkan sebelumnya tanpa disebut (05 §2.2 opsi d dinilai "tidak jujur sebagai 'live'").
- **Wallet:** wallet demo latihan dengan saldo dan allowance seperti seed (05 A-6); wallet tanpa KYB untuk klaim default [D-31].
- **Agent:** menyala, kill switch off di awal; keeper dry-run (stack §4.4, 05 §4.7).
- **Referensi sintetis:** push segar sebelum rekam (05 F-5).
- **Disclaimer terlihat di slide penutup saja [D-64]** (bukan di situs); label "synthetic demo data" terbaca di app.
- **Audio:** narasi bahasa Inggris (sejalan dengan naskah design §7.4) [APPROVED P9-06]; alat rekam/mikrofon = [TBD T9-08].
- **Tanpa data sensitif:** tidak menampilkan private key, seed phrase, `.env`, atau isi keystore di layar (04 §4.1).

### 4.5 Video backup (Demo Day)

- Video backup ada di **2 perangkat** (05 §4.7 T−24, design §8), bisa diputar offline.
- Dipakai saat fallback level 4b (chain utama berhenti dan deployment siaga tidak ada/gagal) atau level 5 (lebih dari satu adegan gagal: putar dari adegan yang gagal sampai akhir) (05 §4.8).
- Tandai titik waktu tiap adegan (chapter/catatan) supaya bisa melompat ke adegan yang gagal [APPROVED P9-13].

### 4.6 Produksi video

Per arahan tugas lama, produksi video sempat ditugaskan ke peran "Video Taker". Dokumen ini tidak menghubungi peran itu. **[APPROVED Fatih langsung, 2026-10-09 17:01 WIB]** Video demo ditangani oleh agen evergreen video editor yang sudah ada. Tidak ada bot baru. Checklist §4.2–§4.5 tetap. Naskah dan angka tetap di dokumen ini.

**Penugasan pemilik (sama, 17:01 WIB):**

| Kerja | Pemilik |
|---|---|
| Video demo | Agen evergreen video editor yang sudah ada. Tidak ada bot baru |
| Submit di HackQuest | Fatih. Fatih sendiri yang menekan submit |
| Pitch deck | Fatih. Fatih sendiri yang membuat pitch deck |

---

## 5. Kriteria juri → bukti di produk/demo

### 5.1 Track utama (notes §1)

| Kriteria (bobot) | Pertanyaan juri yang tersirat | Bukti Paron | Di mana terlihat |
|---|---|---|---|
| **Real-World Utility (25%)** | Apakah menyelesaikan masalah nyata di aset dunia nyata? | Kapasitas GPU dijual forward dengan jaminan; provider dapat modal di muka, buyer dapat harga tetap + kompensasi default; pipeline AI Indonesia 2027 (Batam 360MW, BDx 640MW, Zankore 1GW) | close naskah (design §7.4), README problem/solution, PK §6.1–§6.2 |
| **Onchain Implementation (25%)** ("using blockchain only as a database is not sufficient") | Apa yang hanya bisa dijamin oleh kode onchain? | Empat hal (design §8): bond ada sebelum unit ada; payout default tanpa izin dari bond series itu; kepemilikan bisa ditransfer + order book 24/7; print publik tahan ubah. Plus KYB via EAS, self-match ditolak `SelfMatch()`, invariant test (bond, isolasi, eligible print, `claimDefault` sekali) | adegan listing (bond terkunci), WOW claim default dari HP tanpa KYB, callout SelfMatch, Blockscout tx, test di README (stack §4.6) |
| **Innovation & Differentiation (20%)** | Apa yang baru dibanding pasar GPU lain? | Unit standar CU (1 jam setara H100, faktor per GPU); forward fisik berjaminan, bukan pencocokan spot (beda dengan Akash/io.net, design §8); feed print yang bentuknya sama dengan tuple benchmark publik ("could ingest", design §10.5 #1); indeks hanya dari print antar-entitas | adegan H200 ($4.06/CU), `curl /v1/prints`, strip `THIN` → `OK` |
| **Feasibility & Scalability (20%)** | Bisa jalan dan tumbuh? | Toolchain dipin + go/no-go dengan fallback config-only (design §11.3); Safe + Timelock; order book dibatasi 10 level [D-17]; Ponder + API; settlement token per venue (USDC Arbitrum One / USDG Robinhood Chain, OQR §6); jalur regulasi disebut jujur (OJK, design §8) | README governance + limitations, slide roadmap |
| **Demo & User Experience (10%)** | Demo lancar dan mudah dipahami? | Listing 3 klik < 40 dtk dengan stopwatch; countdown dari waktu chain; juri sendiri menekan "Claim default" di HP; copy error yang manusiawi (06 §9); fallback berlapis (05 §4.8) | naskah 05 §2.3, 06 §5.7 |

### 5.2 Honorable Mention (notes §1)

| Kriteria (bobot) | Bukti |
|---|---|
| Uniqueness & Creativity (30%) | metafora "forge" / anvil (PK §2), juri ikut memicu default |
| Effort & Execution (25%) | riwayat commit 27 jam (04 §9.2), test invariant, deployment terverifikasi |
| Innovation & Potential Impact (20%) | sama dengan §5.1 Innovation + pipeline Indonesia |
| Mentor Feedback / Mentor Favorite (15%) | [TBD T9-09]: mentor tidak disebut di dokumen (notes "No … judges or mentors are named") |
| Presentation & Demo (10%) | naskah 2:30 + video backup |

Q&A siap pakai: design §8 (12 pertanyaan, termasuk "Isn't this just a database?", "Are you partnered with Robinhood?", "How does it relate to Ornn?").

---

## 6. Checklist kepatuhan aturan

Kutipan aturan dari OQR §5 dan ringkasan notes §1 ("Rules on prior work").

| # | Aturan | Bukti kepatuhan | Cek | Sumber |
|---|---|---|---|---|
| R1 | "built from scratch during the official hackathon period" | Commit pertama ≥ **Jum 9 Okt 09:00 WIB**; tidak ada repo Paron sebelum itu | ⬜ timestamp commit pertama dicatat di README | OQR §5, 04 §9.2, §10 |
| R2 | Tidak ada deploy publik apa pun yang berbau Paron sebelum Jum 09:00 (termasuk instance EAS kita) | Semua cek pra-Jumat hanya lokal/fork (OQR §3–§4); deploy pertama = go/no-go (sejak ~11:05 WIB: dalam 45 menit setelah T0, 08 §1.4) | ⬜ alamat `smoke-1` bertimestamp ≥ 09:00 | design §11.2, 07 D-12 |
| R3 | Persiapan yang boleh: env, riset, workshop, tim, ide | Dev docs 01–07 dan 09 = riset/desain; disalin ke `docs/dev/` dengan catatan "riset/desain sebelum hackathon; kode dibuat selama hackathon" | ⬜ catatan ada di `docs/dev/` | notes §1, 04 §9.2 |
| R4 | "clearly identify what was newly developed" kalau memakai proyek yang ada | Bagian README "What was built during the hackathon" (§3.1 #13) | ⬜ | OQR §5 aturan 2 |
| R5 | Atribusi pihak ketiga (code, API, dataset, model, aset, infrastruktur) | Blok design §7.5 + daftar tambahan (P9-07): Safe, Ponder, Hono, Next.js, React, RainbowKit, TanStack Query, Tailwind, shadcn/ui, lightweight-charts, Recharts, EAS self-deploy; data faktor GPU dari datasheet publik NVIDIA (design §1.1); **+ baris atribusi bantuan Grok Bot (§3.2, APPROVED ~11:05 WIB; teks kerja ~11:12 WIB):** "Built by Fatih Maulana with help from Grok Bot" / "Dibangun oleh Fatih Maulana dengan bantuan Grok Bot" | ⬜ | OQR §5 aturan 10, design §7.5 |
| R6 | Lisensi | Lisensi repo Paron = **MIT** (open source) [APPROVED T9-06, Jum 9 Okt ~10:33 WIB]: file `LICENSE` di root + bagian License README. Lisensi pihak ketiga yang disebut: OpenZeppelin Contracts (MIT) (design §7.5). Lisensi komponen lain tidak dicek [TBD T9-10] | ⬜ | design §7.5 |
| R7 | Satu submission per tim; anggota dicantumkan akurat; maks 4 orang | Isian #8; [D-08] | ⬜ | notes §1 |
| R8 | Repo GitHub wajib; juri boleh memeriksa kode, docs, demo | Repo bisa diakses (§7) | ⬜ | notes §1 aturan 5 |
| R9 | "Meaningful use of Ethereum or Ethereum-compatible onchain infrastructure" | Robinhood Chain Testnet (L2 Ethereum di atas Arbitrum) atau Arbitrum Sepolia; seluruh logika inti onchain | ✅ by design | notes §1, stack §0 TL;DR |
| R10 | Code of conduct; keputusan panitia final | — | — | notes §1 aturan 7, OQR §5 aturan 12 |
| R11 | Guardrail merek: tanpa klaim kemitraan, tanpa logo, tanpa OCPI di app/API/chart, tanpa Stock Tokens | Cek teks README, app, slide, video (§7 G-blok) | ⬜ | design §6, §10.5, §11.5; PK §10.3 |
| R12 | Tidak ada secret di repo atau video | `.env` tidak di-commit; key anvil tidak pernah dipakai di jaringan publik | ⬜ | 04 §4.1, design §11.2 |

---

## 7. Checklist final pra-submit (jendela lama Sab 10:00–11:30)

Jam 11:30 tidak mengikat [D-90]. Tenggat keras tetap Sab 2026-10-10 12:00 WIB. Yang menekan submit = Fatih sendiri. Verifikasi UI hanya setelah merge ke `main`; `main` terbaru belum live (04 hosting).

**Link (semua dibuka dari jendela private/incognito, tanpa login)**
- [ ] URL repo GitHub https://github.com/Fatihmaull/paron-robinhood terbuka dan publik [APPROVED P9-14: publik; notes hanya mewajibkan repo "required" dan bisa diperiksa juri].
- [ ] URL app = `https://paron.vercel.app` (D-10; domain/handle tidak dipakai di submission) memuat S1 dengan data deployment `stage-1`; utility bar (06 §0.2, APPROVED D-65) menampilkan Build · Chain · Block; tidak ada teks "not affiliated" di situs [D-64].
- [ ] URL API `https://paron-robinhood-production.up.railway.app/v1/health` `synced` (saat ini `synced:false` sampai kontrak di-deploy); `/v1/series` mengembalikan 3 series seed (05 §4.7).
- [ ] Link explorer di README membuka kontrak yang benar di chain yang benar.
- [ ] Link video bisa diputar tanpa login; durasi sesuai §4.1.
- [ ] Link deck (kalau dilampirkan) terbuka.

**Hari demo: reachability RPC (catatan ~14:15 WIB)**
- [ ] Cek RPC publik `https://rpc.testnet.chain.robinhood.com` bisa dijangkau dari browser dan wifi yang dipakai demo (intermiten untuk sebagian koneksi, `ERR_SSL_UNRECOGNIZED_NAME_ALERT`; lihat 04 §4.2). Nama env cadangan final: `INDEXER_RPC_URL_BACKUP` dan `NEXT_PUBLIC_RPC_URL_BACKUP` [D-89]. Kosong = hanya URL utama. Kegagalan RPC publik di UI = teks redup, bukan merah. Video backup (§4.5) tetap fallback.

**Penyesuaian UI Designer (D-67..D-74, APPROVED 14:40 WIB).** Cek di URL Vercel hanya setelah merge ke `main`. Jam freeze UI 09:00 tidak mengikat [SUPERSEDED D-90]. `main` terbaru belum live sampai Fatih menyelesaikan kuota build Vercel (04 hosting). **[D-81, APPROVED Fatih langsung 2026-10-09 17:01 WIB]** Guard CI grep `affiliated|endorsed by` dibatalkan. Tidak ada grep itu di CI. `copy-guard.test.ts` tidak diubah.
- [ ] `/markets/1`: series page muat satu viewport di 1280 px, tanpa celah kosong; judul tidak menampilkan "ID" kosong; pill Verified tidak wrap di tengah teks; tidak ada link biru browser (D-67).
- [ ] Detail redemption: jumlah state 36 px mono, baris aksi tunggal, "Default paid. $45.00 sent to 0x2222...2222." teks terbesar (D-68).
- [ ] Header: "Connect wallet" sekunder; satu aksi ember per halaman (D-69).
- [ ] 390 px di `/`, `/markets`, `/markets/1`: `scrollWidth <= innerWidth`; tombol Menu tidak tampil di desktop (D-70).
- [ ] Build produksi tidak menampilkan banner mock maupun pemilih snapshot (D-71).
- [ ] Kontras teks ≤ 13 px ≥ 4.5:1; tidak ada teks ber-opacity (D-72).
- [ ] Tab Provider: "Requests", "Series", "Bond", "Agent", aktif bergaris bawah ember (D-73).
- [ ] `tokens.v2.css` terpasang; `<title>` per route; skip link (D-74). Guard CI grep `affiliated|endorsed by` tidak dicek: dibatalkan (D-81, APPROVED 2026-10-09 17:01 WIB).

**Kontrak dan deployment**
- [ ] Semua kontrak inti di `stage-1.json` ber-`verified: true` (atau dicatat alasannya, mis. EAS self-deploy, 04 §6.4).
- [ ] `DEPLOYMENTS.md` dibangkitkan ulang dari manifest terakhir dan sama dengan tabel README.
- [ ] `git.commit` di `stage-1.json` = commit bertag `freeze-contracts` (04 §9.2). **[SUPERSEDED / CANCELLED D-90]** Tag `freeze-contracts` tidak dipakai. Baris ini historis.
- [ ] Peran sudah diserahkan ke Timelock/Safe (atau allowlist di fallback), sesuai `roles` manifest (04 §6.3).
- [ ] Deployment panggung belum tercemar: tidak ada `CU-JKT-H100-2610`, H100 `THIN`, tidak ada redemption (05 §4.7).

**Repo dan tag**
- [ ] Tag `go-nogo` ada. Tag `freeze-contracts` dan `freeze-ui` tidak dipakai **[SUPERSEDED / CANCELLED D-90]**. Tag `submission` disebut di rencana lama (04 §9.2); jam 11:30 tidak mengikat.
- [ ] CI hijau di `main` untuk job MUST (`contracts`, `invariants`, `ts`) (04 §9.1).
- [ ] Tidak ada `.env`, keystore, atau private key di riwayat git (04 §4.1).
- [ ] **Author semua commit = Fatih** (`Fatih Maulana` / `fatihmaulanamail@gmail.com`); tidak ada commit ber-author identitas cloud agent (04 §9.2) [APPROVED ~11:05 WIB].
- [ ] `README.md`, `METHODOLOGY.md`, `SERIES_TERMS.md`, `DEPLOYMENTS.md`, `docs/architecture.md` ada (stack §4.7, 04 §1).
- [ ] File `LICENSE` di root berisi teks lisensi MIT standar (tahun 2026; pemegang hak cipta = Fatih Maulana [usulan 09]); GitHub menampilkan "MIT license" di halaman repo; README bagian License menyebut MIT [T9-06 APPROVED].

**Teks dan merek (G-blok)**
- [ ] README memuat baris atribusi Grok Bot (§3.2): "Built by Fatih Maulana with help from Grok Bot" (APPROVED ~11:05 WIB; teks kerja ~11:12 WIB).
- [ ] README memuat blok atribusi design §7.5 (tanpa kalimat "not affiliated", D-64) dan baris atribusi Grok Bot. **Cari string "Not affiliated" di README dan `web/`: harus 0 hasil.** Tidak ada kata "partner" dan tidak ada "feeds"; tidak ada logo.
- [ ] Baris chain di atas README sesuai hasil go/no-go (P9-08).
- [ ] Tidak ada kata "partner", "powered by", "backed by", "built for Robinhood", "feeds OCPI", "Ornn-compatible" di README, app, deck, video.
- [ ] Label "Spot reference (synthetic demo data)" di app dan slide; tidak ada angka OCPI di app/API/chart (angka OCPI hanya sebagai kutipan teks di slide, design §10.5 #2).
- [ ] Slide yang menyebut Ornn/ICE/OCPI/Robinhood punya footnote design §10.5 #6 / PK header.

**HackQuest**
- [ ] Semua isian §2 terisi; teks dicek ejaan; link di-paste ulang dari jendela private.
- [ ] Info tim akurat: Fatih, solo (nama, peran; aturan ≤ 4 orang terpenuhi).
- [ ] Track: "RWA — Build the Real World Onchain" (satu-satunya track).
- [ ] Submit sebelum 11:30; simpan tangkapan layar konfirmasi + waktu; buat tag `submission`.
- [ ] Setelah submit: jangan ubah deployment panggung atau README alamat sampai Demo Day selesai (05 §4.6 butir 5).

---

## 8. Item terbuka

| ID | Item | Siapa memutuskan | Batas | Default kalau tidak diputuskan |
|---|---|---|---|---|
| T9-01 | Nama field HackQuest persis, wajib/opsional, batas karakter, format unggahan | dilihat di form saat submission dibuka (Jum 09:00) | Jum siang | pakai 8 isian notes §1 |
| T9-02 | Batas durasi video | form/panitia | Jum siang | ≤ 3:00 (P9-05) |
| T9-03 | Waktu pengumuman shortlist Demo Day | panitia | — | pantau HackQuest/Discord ETHJKT (tanpa menghubungi, kecuali Fatih memutuskan) |
| T9-04 | Jam slot demo tim pada Min 11 Okt | panitia | — | siap sejak 10:00 |
| T9-05 | Status registrasi Fatih (pemegang akun yang men-submit = Fatih, karena tim solo D-08) | Fatih | Jum siang (08 blok 11:00) | Fatih |
| T9-06 | Lisensi repo Paron | Fatih | **APPROVED Jum 9 Okt ~10:33 WIB** | **MIT** (open source); `LICENSE` di root |
| T9-07 | Host video (format/link) | Fatih | Sab 10:00 | — |
| T9-08 | Alat rekam layar + mikrofon | Fatih | Sab 00:00 | — |
| T9-09 | Mentor (untuk kriteria Honorable Mention) | — | — | tidak ada nama di dokumen |
| T9-10 | Lisensi komponen pihak ketiga selain OZ | Fatih | sebelum README final | **default dipakai (APPROVED bersama rekomendasi):** cantumkan nama + link repo tanpa klaim lisensi |
| D-08 | Komposisi tim (isian #8, pemilik A/B/C) | Fatih | **APPROVED Jum 9 Okt ~09:40 WIB** | tim = Fatih solo |
| D-10 | Domain (URL app) | Fatih | **APPROVED Jum 9 Okt ~10:33 WIB; URL terisi ~13:08 WIB** | `https://paron.vercel.app`; domain + handle menyusul |
| D-12 | Kirim pertanyaan aturan ke ETHJKT | Fatih | **APPROVED opsi A** | tidak dikirim; tafsiran konservatif |
| 05 T5-03 | Cara HP juri terhubung | Fatih | Sab gladi | — |
| 04 T4-05 | Tampilan clone `CUToken` di explorer | Fatih | Sab 06:00 | catatan di README |
| — | Venue Demo Day (Ganara Art vs Garuda Spark) | panitia | Min pagi | notes "Unconfirmed" |

---

## 9. Divergensi

| # | Divergensi | Sumber | Penanganan |
|---|---|---|---|
| X9-1 | Waktu rekaman video backup: "paling lambat Sab 06:00" vs "Sab 06–10 + rekam video backup" | design §7.3, §8; PK §11.1; 05 §0 vs 05 §4.6 butir 3 | v1 wajib Sab 06:00, v2 opsional Sab 06–10 (P9-03) |
| X9-2 | Naskah video mengikuti 05 §2.3 (ter-retime, 2610, series 4), bukan design §7.4 / PK §11.1 (2611, default di 1:45). D-82 diperjelas oleh D-92 (APPROVED 18:10 WIB); baris ini berlaku. Rekaman memakai putaran baru di series 4 | 05 P5-06, 07 D-19 | ikuti 05 |
| X9-3 | Blok atribusi design §7.5 hanya menyebut OZ, EAS, Foundry, wagmi/viem; stack memakai lebih banyak pihak ketiga yang juga perlu diatribusi (aturan 10) | design §7.5 vs stack §4, OQR §5 aturan 10 | blok tetap kata per kata + daftar tambahan (P9-07) |
| X9-4 | Blok atribusi menyebut "Deployed on Robinhood Chain Testnet (fallback: Arbitrum Sepolia)", sedangkan design §11.3 meminta baris chain README diganti saat no-go | design §7.5 vs §11.3 | kalimat tambahan di bawah blok (P9-08) |
| X9-5 | notes §1 hanya mewajibkan "demo video **or** presentation materials"; dokumen ini merekomendasikan keduanya | notes §1 | rekomendasi, bukan kewajiban |
| X9-6 | Penomoran aturan berbeda: notes §1 meringkas aturan 1–8, OQR §5 mengutip aturan 1, 2, 10, 12, stack menyebut "rule 3 'Ethereum Integration'" | notes §1, OQR §5, stack bagian Sources | dokumen ini merujuk aturan lewat nama/kutipan, bukan nomor |
| X9-7 | PK §1.5 menulis Demo Day "di Ganara Art" sebagai fakta; notes menandai venue belum dikonfirmasi | PK §1.5 vs notes "Unconfirmed" | ikuti notes |
| X9-8 | Footnote slide: PK header/design §10.5 #6 punya varian Ornn+ICE untuk slide yang menyebut ICE/HPR; varian Robinhood di §10.5 #6 lebih pendek ("Not affiliated with or endorsed by Robinhood Markets, Inc.") daripada versi stack §3.5/design §11.5 | design §10.5 #6 vs §11.5 | pakai versi lengkap §11.5 di slide penutup saja; README dan web tanpa footnote **[Digantikan D-64, 13:30 WIB]** |

---

## 10. Dependensi D-xx

| D-xx | Dampak di dokumen ini | Bagian |
|---|---|---|
| D-03, D-36 | arbitrator = panel tim 2-of-3 (limitation, governance README) | §3.1 #9, §3.5 |
| D-04 | label "Paron demo verifier" di README | §3.1 #9, §3.5 |
| D-54 (APPROVED ~11:05 WIB, hackathon saja) | README governance: attester = EOA `W-VERIFIER` "Paron demo verifier (team-operated)"; proposer Timelock = Safe + `W-ADMIN`, executor terbuka; ditulis sebagai known limitation | §3.1 #9, §3.5 |
| D-06 | referensi sintetis berlabel; tanpa OCPI | §3.1 #8, §3.5, §7 |
| D-08 | info tim = Fatih solo (isian #8: 1 anggota), semua pemilik = Fatih | §2 #8, §6 R7, §8 |
| D-10 | URL app = `https://paron.vercel.app` (APPROVED ~10:33 WIB; terisi ~13:08 WIB); domain/handle menyusul | §2 #4, §7, §8 |
| D-12 | pertanyaan aturan ke ETHJKT (tidak dikirim) | §6 R2, §8 |
| D-13 | "fees go to the team multisig" | §3.1 #9 |
| D-16 | kalimat VWAP onchain vs winsorized API | §3.1 #8, §3.5 |
| D-17 | 10 level order book (feasibility, limitation) | §3.5, §5.1 |
| D-19 | series panggung 2610 + flag `allowOpenWindow`. D-82 diperjelas oleh D-92 (APPROVED 18:10 WIB): baris ini berlaku; seed series 1 tetap 2611 | §3.3, §3.5, §4.2 |
| D-20 | tabel "demo parameters" vs prod | §3.1 #7, §3.5 |
| D-25 | 4 series (3 seed, series 1 = 2611, + 1 live 2610) di tabel alamat. D-82 diperjelas oleh D-92 (APPROVED 18:10 WIB); baris ini berlaku | §3.3 |
| D-26 | receipt hash + mock GPU output berlabel | §3.5 |
| D-30 | listing permit + 1 tx (adegan video) | §4.2 |
| D-31 | klaim default dari wallet tanpa KYB (demo walkthrough, video) | §3.1 #4, §4.2, §4.4 |
| D-40 | faucet `MockUSDC` 5,000/jam | §3.5 |

Semua D-xx di atas **APPROVED** di 07 (Jum 9 Okt 2026 ~09:40 WIB, Fatih); D-10 APPROVED terpisah Jum 9 Okt ~10:33 WIB (URL Vercel bawaan; domain/handle menyusul).

---

## 11. Register PENDING dan TBD baru

**Usulan dokumen ini (P9-01..P9-15 APPROVED Jum 9 Okt 2026 ~09:40 WIB, Fatih)**

| ID | Usulan | Bagian |
|---|---|---|
| P9-01 | README v1 di blok Jum 20–24, final Sab 08:00 | §1.2 |
| P9-02 | Teks isian HackQuest final + video terunggah Sab 10:00 | §1.2 |
| P9-03 | Video backup v1 wajib Sab 06:00, v2 opsional Sab 06–10 | §1.2, §9 |
| P9-04 | Kategori use case RWA kalau form memakai dropdown: "onchain infra for traditional assets" (cadangan: "commodities") | §2 |
| P9-05 | Video submission = naskah ter-retime, target ≤ 3:00 | §4.1 |
| P9-06 | README dan narasi video dalam bahasa Inggris | §3, §4.4 |
| P9-07 | Daftar atribusi tambahan di bawah blok design §7.5 | §3.1, §6 R5 |
| P9-08 | Kalimat tambahan di bawah blok atribusi kalau live di Arbitrum Sepolia | §3.2 |
| P9-09 | README memuat tabel alamat ringkas + link `DEPLOYMENTS.md` | §3.3 |
| P9-10 | README menjelaskan series 2610 di-forge live (tidak ada di manifest submission). D-19 berlaku. D-82 diperjelas oleh D-92 (APPROVED 18:10 WIB): series demo/rekaman = `CU-JKT-H100-2610` (series 4, putaran baru); seed series 1 tetap 2611 | §3.3 |
| P9-11 | Rekam 1920×1080 dengan zoom browser yang terbaca | §4.3 |
| P9-12 | Potongan waktu countdown hanya dengan overlay eksplisit | §4.4 |
| P9-13 | Penanda waktu per adegan di video backup | §4.5 |
| P9-14 | Repo publik saat submit | §7 |
| P9-15 | Footnote Robinhood versi lengkap (design §11.5) di semua materi | §9 |

**TBD:** T9-01..T9-05 dan T9-07..T9-09 masih terbuka (lihat §8 dan 07 §10.2); T9-06 = MIT (APPROVED Jum 9 Okt ~10:33 WIB); T9-10 memakai default yang disetujui.
