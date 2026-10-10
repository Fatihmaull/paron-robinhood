# Paron: indeks dokumen konteks (master: Hackathon Scout; sekarang PO/project handler)

Sumber kebenaran: repo `docs/knowledge-base/` (mirror dari folder kerja Scout di box; path box lama tidak dipakai).
Terakhir diperbarui: Sabtu 10 Okt 2026 (D-93..D-96, plus koreksi nav D-95 setelah #71). Keputusan yang lebih kemudian mengalahkan yang lebih dahulu.

**Urutan mulai:** `SESSION_HANDOFF_HACKATHON.md` (state terkini) → file ini → `HANDOFF-BRIEF.md` (urutan baca, tugas pertama, prioritas, aturan), lalu `paron-product-plan.md` (gambaran produk penuh: semua modul, aplikasi, arsitektur akhir, roadmap P0–P5, batas lingkup hackathon).

## A. Dokumen kanonik (sumber kebenaran, pakai ini)
| File | Isi | Pemilik |
|---|---|---|
| paron-product-plan.md | Rancangan produk PENUH (bukan MVP): modul, aplikasi end state, arsitektur, roadmap P0–P5, matriks lingkup hackathon vs nanti, NFR, metrik | Hackathon Scout |
| paron-product-knowledge.md | Peta produk lengkap: overview, nama, one-liner, fitur + tech, fitur per aktor, flow, diagram, bisnis, demo, risiko, roadmap, glossary | Hackathon Scout |
| paron-sitemap.md | Sitemap produk LENGKAP (78 route): spec per route (tujuan, role gate, komponen, fungsi kontrak/API, state, tag MVP-27h/FULL, demo live), pohon mermaid, matriks cakupan aksi→layar (59 aksi), checklist anti-mock, potongan build 27 jam + tier build solo S0–S3 (§9.1); keputusan terkait APPROVED Jum 9 Okt ~09:40 WIB | Hackathon Scout |
| paron-sitemap.xml | **Tidak di repo** (ada di folder kerja Scout): sitemap.xml route publik (domain placeholder, belum dibeli) | Hackathon Scout |
| paron-design.md | Design brief utama: konsep, flow A-E, 12 kontrak, state machine redemption, fee, narasi, MVP 27 jam, build plan WIB, demo script, Q&A, open questions (§9), gap analysis (§10), chain config + go/no-go (§11) | Hackathon Scout |
| paron-stack.md | Tech stack lengkap + versi, konfigurasi chain, go/no-go checks, prerequisites | Hackathon Scout |
| paron-gaps.md | Gap analysis narasi infra untuk market compute (G1-G13) | Hackathon Scout |
| open-questions-research.md | Hasil riset open questions (EAS, Safe, faucet, Robinhood Chain, dll.) | Hackathon Scout |
| notes.md | Aturan, judging, timeline ETHJKT 2026 (WIB) | Hackathon Scout |
| checks/ | **Tidak di repo** (folder kerja Scout): hasil cek environment. Bukan kode produk. | Hackathon Scout |
| HANDOFF-BRIEF.md | Brief untuk Principal Engineer (snapshot ~10:50 WIB; state terkini di SESSION_HANDOFF) | Hackathon Scout |
| SESSION_HANDOFF_HACKATHON.md | State terkini, pemilik, env (nama saja), isu, tugas per peran | Semua agent |
| `../design/` | Brand, guidelines, design.md, approved-ui-changes.md, tokens/theme CSS | Product Designer |
| `../build/STATUS.md` | Log build/merge/deploy PE | Principal Engineer |

## B. Dokumen dev (ditulis Paron Spec Writer, folder dev-docs/; semua SELESAI)
| # | File | Isi | Status |
|---|---|---|---|
| 1 | dev-docs/01-contract-interfaces.md | Signature fungsi, event, error, access control 12 kontrak + IParticipantGate | SELESAI; keputusan APPROVED (Jum 9 Okt ~09:40 WIB) |
| 2 | dev-docs/02-invariants-acceptance.md | Invariant + acceptance criteria + daftar test Foundry per kontrak | SELESAI; keputusan APPROVED (Jum 9 Okt ~09:40 WIB) |
| 3 | dev-docs/03-data-contract.md | Schema Ponder + spesifikasi API (/v1/prints, dll.) | SELESAI; keputusan APPROVED (Jum 9 Okt ~09:40 WIB) |
| 4 | dev-docs/04-repo-config.md | Layout monorepo, template .env, chain config, urutan deploy | SELESAI; keputusan APPROVED (Jum 9 Okt ~09:40 WIB) |
| 5 | dev-docs/05-demo-seed.md | Skenario + spec script seed demo (500 CU, buy 20, ask $3.20, default 10 CU) | SELESAI; keputusan APPROVED (Jum 9 Okt ~09:40 WIB) |
| 6 | dev-docs/06-screens-wireframes.md | Wireframe teks + copy per screen | SELESAI; keputusan APPROVED (Jum 9 Okt ~09:40 WIB) |
| 7 | dev-docs/07-decisions-log.md | Open questions §9 + treasury/fee + D-41..D-44 → keputusan (rekomendasi disetujui Fatih Jum 9 Okt ~09:40 WIB) | SELESAI; keputusan APPROVED (Jum 9 Okt ~09:40 WIB) |
| 8 | dev-docs/08-team-tasks.md | Timeline solo per jam (T0 Jum 11:14; jam 06:00 / 09:00 / 11:30 Sab historis [D-90]; jam 12:00 historis [D-93]; tenggat keras Sab 10 Okt 2026 23:59 WIB), cut ladder, daftar never-cut, slot ukur PENDING teknis | SELESAI (4 lane agent, D-59) |
| 9 | dev-docs/09-submission-checklist.md | Field HackQuest, README + disclaimer, video demo | SELESAI; keputusan APPROVED (Jum 9 Okt ~09:40 WIB) |

## Keputusan terakhir Fatih (Jum 9 Okt ~10:34 WIB, APPROVED)
- D-10 domain/handle: pakai URL Vercel dulu, belum beli domain/handle
- 05 P5-26: bot trader jalan otomatis waktu demo (dipicu `PrimaryBuy`)
- 09 T9-06: lisensi repo MIT (open source)
- Sisa PENDING teknis (gas, finality, versi, latency, field HackQuest) diukur saat build; slotnya ada di 08 dan daftarnya di 07 §10.2

## C. Arsip (jangan dipakai sebagai konteks dev)
Pre-Paron ideation notes, naming drafts, old reviews/clones and rollback backups are intentionally not part of this repo.

## Aturan
- Semua dokumen = spec, BUKAN kode. Kode produk baru boleh ditulis mulai Jumat 9 Okt 09:00 WIB.
- Dokumen kanonik dan dev docs tidak boleh menyebut nama proyek lama/eks-tim. Pengecualian [APPROVED Fatih via handler 9 Okt ~15:34 WIB]: nama pihak ketiga (Ornn, ICE, Robinhood) BUKAN nama proyek lama dan boleh disebut di dokumen dan footnote slide (sesuai PK §10.3); "not affiliated" tetap hanya di pitch deck/slide [D-64].
- Jangan kontak Ornn, ETHJKT, atau siapa pun tanpa izin Fatih.


## Keputusan Fatih Jum 9 Okt ~11:06 WIB [APPROVED] (dari AUDIT.md PE)
- HackQuest: registrasi aman (PG-1 selesai).
- Build dipecah 4 lane agent paralel (kontrak, frontend, indexer/API, ops/deploy); 08 di-replan oleh Spec Writer.
- EN-2: verifier = EOA, proposer timelock = EOA di samping Safe, executor terbuka.
- EN-3: go/no-go chain maks 45 menit; saldo testnet Robinhood sudah ada di 2 akun Fatih.
- PG-2: sandbox juri tidak dibangun, fokus fitur.
- PG-11: README menyebut dibantu oleh Grok Bot; commit cloud agent atas nama Fatih.
- Plan produk: paron-product-plan.md v1.3 (temuan PG-2..PG-14 sudah masuk).

## Keputusan Fatih Jum 9 Okt ~11:13 WIB [APPROVED]
- D-45..D-58 di-approve semua (lihat dev-docs/07).
- Repo: https://github.com/Fatihmaull/paron-robinhood
- Git author untuk semua commit: Fatih Maulana <fatihmaulanamail@gmail.com>.
- Kalau Robinhood Chain Testnet gagal di go/no-go (maks 45 menit), langsung pindah ke Arbitrum Sepolia (ganti chain config).
- Masih ditunggu: private key deployer lewat 1:1 Fatih ↔ Principal Engineer, lalu "go" (T0).

## T0 = Jum 9 Okt 2026 11:14 WIB
- Fatih bilang "go" di grup. Build resmi mulai; 08 (4 lane) dihitung dari jam ini.
- Private key deployer masih via input rahasia di 1:1 Fatih ↔ Principal Engineer (cuma dibutuhin buat deploy, nggak ngeblok nulis kode).

## Izin merge [APPROVED Fatih Jum 9 Okt ~11:27 WIB]
- Principal Engineer boleh merge PR tanpa konfirmasi Fatih kalau test hijau (standing permission).
- Key deployer sudah masuk ke PE lewat 1:1; deploy dijalankan PE (bukan cloud agent). Yang masih ditunggu dari Fatih: host + Postgres untuk indexer.

## Fatih decisions ~13:30 WIB, Fri 9 Oct 2026 (direct in group chat)
- "oke 1-4": D-60..D-63 approved (ChainBadge "Robinhood Chain Testnet", bond bar legend wording, landing H1 "Where compute is forged into one standard.", "Decline & pay" red outline).
- Footer / text "not affiliated" REMOVED from product (web, README); disclaimer moves to pitch deck/slides only. Never-cut list is now 3 items (claim default from any wallet, live KYB issue in /verifier, one timelock execute from /admin). Supersedes the footer rule in paron-product-knowledge.md section 10.3 for the product UI; wording guardrails (no "partner", no logos, no "feeds") still apply.
- Hosting: Vercel https://paron.vercel.app; Railway indexer https://paron-robinhood-production.up.railway.app (CORS = https://paron.vercel.app, DEPLOY_LABEL=stage-1, public RPC for now).

- (2026-10-09 13:35 WIB) Fatih approved UtilityBar (Docs · API · GitHub, testnet note, Build · Chain · Block; no disclaimer text) as footer replacement in the D-64 PR. Designer items 5-13 still NOT approved.
- (2026-10-09 ~14:01 WIB) Fatih approved D-66 (syncing state copy: neutral "Indexer is syncing. Series will appear shortly.", 3 skeleton rows, hide "0 series." while syncing, red only for real /v1 errors). Indexer healthy since 13:59 (PR #30, schema paron_<sha8>), 3 seed series.
- (2026-10-09 ~14:40 WIB) Fatih: approve ALL pending designer items (spec-change-requests #9-#13, LR-5, LR-6, LR-8) per recommendations; sync all docs; archive everything; push archive + knowledge base to GitHub under docs/.
- (2026-10-09 ~14:50 WIB) D-67..D-74 APPROVED (Fatih 14:40): #9+LR-5=D-67, #10=D-68, #11=D-69, #12=D-70, #13=D-71, LR-6 contrast=D-72, LR-8 Provider tabs=D-73, also-adopt (tokens.v2.css, route titles, skip link)=D-74. Butir grep CI pada D-74 dibatalkan di D-81 (pada jam ini masih menunggu konfirmasi langsung; APPROVED 17:01 WIB, bagian di bawah). PE priority if short on time: D-70,71,72,69,73,68,67. Docs pass 1 merged to repo docs/ (PR #37).

## Keputusan Fatih Jum 9 Okt 2026 ~15:34 WIB [APPROVED, disampaikan lewat handler; "lanjutkan dengan rekomendasi"]
- Satu PR docs (`docs/audit-2026-10-09`): draf audit Scout + temuan Spec Writer; boleh di-merge kalau tidak ada konflik dan tidak menyentuh kode.
- Nama pihak ketiga (Ornn, ICE, Robinhood) dikecualikan eksplisit dari aturan "nama proyek lama" untuk dokumen dan footnote slide.
- D-75..D-80 APPROVED (P1–P6, Fatih), 07 §16 dan `design/approved-ui-changes.md`: D-75 banner syncing hanya jika `synced:false` atau lag >20 blok, warna info, kalimat live di D-84; D-76 skeleton pulse opacity, "0 series." tetap tersembunyi saat loading; D-77 tab Leverage di `/markets/[id]` berlabel "Coming soon", tanpa aksi; D-78 tiket Buy hanya copy produk; D-79 uang `$3,240.00` (pemisah ribuan, 2 desimal) dan max cost 2 desimal; D-80 beranda dipadatkan (mobile 390 px, connect wallet satu baris).
- D-81: guard CI grep `affiliated|endorsed by` (butir terakhir D-74) DIBATALKAN. Tidak ada grep itu di CI. `copy-guard.test.ts` tidak diubah dan bukan guard ini. Pada ~15:34 WIB statusnya masih menunggu konfirmasi langsung. **APPROVED** Fatih langsung 2026-10-09 17:01 WIB (bagian di bawah).
- D-82 APPROVED: nama series demo yang live = `CU-JKT-H100-2611`. Seed kontrak series 1 tidak diubah. Catatan D-19/D-25 (`CU-JKT-H100-2610` di panggung) tetap historis; yang digantikan hanya penamaan live. `series_id`, window, dan input skrip seed/forge di 03, 05, 06, 09 tidak ditulis ulang. **Diperjelas oleh D-92 (APPROVED, bagian 18:10 WIB):** seed = 2611; series panggung/demo = 2610 (series 4). Pembacaan "nama live = 2611" tidak dipakai untuk panggung, S0, checklist `/demo`, atau rekaman.
- D-64 menggantikan footer "not affiliated" di UI/README (hanya pitch deck/slide); teks lama di UI/README ditandai historis atau `[SUPERSEDED D-64]`. Footnote slide tetap.

## Keputusan Fatih 2026-10-09 16:39 WIB [APPROVED, langsung]
- D-84..D-88 APPROVED (07 §18, `design/approved-ui-changes.md`).
- D-84 banner syncing, warna info, hanya jika `synced:false` atau lag > 20 blok. Kalimat persis: "Indexer is catching up to the latest blocks; data may lag briefly."
- D-85 tab series mengikuti D-67 (Bond, Terms, Redemptions, Reputation). Kalau belum selesai sebelum freeze UI Sab 2026-10-10 09:00 WIB, tab lama (Overview, Buy, Trade, Leverage) tetap dan sisa itu dicatat di dokumen. Pada `main` `93f8e60` tab series masih yang lama. Syarat jam 09:00 itu [SUPERSEDED D-90]. PR #51 kemudian membawa tab Bond, Terms, Redemptions, Reputation ke `main` (belum live di web).
- D-86 pesan tidak ketemu "Request not found." di `/redemptions/1` dan `/disputes/1`.
- D-87 pita data demo sintetis tetap, teks "Reference price (demo data)".
- D-88 pratinjau PR #47 (beranda) belum ditinjau. Designer memeriksa produksi setelah rebase dan merge.
- D-89 APPROVED (handler, 07 §19): ulang RPC jeda 400/800/1600 ms; gagal RPC publik = teks redup, bukan error merah; nama `INDEXER_RPC_URL_BACKUP` dan `NEXT_PUBLIC_RPC_URL_BACKUP` final (kosong = hanya URL utama). Nilai URL tidak ditulis di dokumen.

## Keputusan Fatih 2026-10-09 17:01 WIB [APPROVED, langsung]
- D-81 APPROVED. Guard CI grep `affiliated|endorsed by` (butir terakhir D-74) tetap DIBATALKAN. Tidak ada grep itu di CI. `copy-guard.test.ts` tidak diubah dan bukan guard ini. Konfirmasi langsung Fatih menutup status menunggu di bagian ~15:34 WIB. Tercatat di 07 §20, 04 §9, 06 §0.6, 09, design.md, guidelines.md, approved-ui-changes.md, docs/README.md.
- D-83 APPROVED. Safe multisig = roadmap kalau Paron live di mainnet nanti. Peran admin tidak berubah (D-54): tanpa EOA kedua, tanpa pindah ke Safe. 07 §17, 08 §7.1, product-plan §4.10.
- D-90 APPROVED (nomor bebas berikutnya setelah D-89). Aturan freeze dihapus: tidak ada freeze kontrak, tidak ada freeze UI, tidak ada aturan setelah freeze. Tag `freeze-contracts` dan `freeze-ui` tidak dipakai. Jam 06:00, 09:00, dan 11:30 WIB pada Sab 2026-10-10 tidak mengikat. Teks lama di 08 §0, 08 §7.2, 09 §1.2, 04 §9.2, dan bagian historis di bawah ditandai SUPERSEDED/CANCELLED atau historis; tidak dihapus. **Tenggat keras submission tetap Sab 2026-10-10 12:00 WIB.** Kalimat 12:00 itu **[HISTORICAL, superseded by D-93]**. Tenggat keras sekarang Sab 10 Okt 2026 23:59 WIB.
- Penugasan pemilik (09): video demo = agen evergreen video editor yang sudah ada (tidak ada bot baru); submit HackQuest = Fatih sendiri yang menekan submit; pitch deck = Fatih sendiri yang membuatnya.
- Hosting Vercel (04 bagian hosting, tanpa secret atau token): project hanya membangun branch `main`. Branch lain dilewati lewat Ignored Build Step, jadi tidak ada pratinjau PR. Verifikasi UI hanya setelah merge ke `main`. Kuota deploy free tier habis (`api-deployments-free-per-day`, pulih kira-kira 24 jam). `main` terbaru belum live sampai Fatih menyelesaikan masalah build/kuota. **[HISTORICAL, catatan 17:01 WIB; hosting terkini di bagian Sab 10 Okt 2026 di bawah.]**
- PR UI #47, #51, #53, #54 sudah merge ke `main` (CI hijau) dan belum tampil di web. Ujung `main` saat catatan ini: `0366ec6`.

## Keputusan 2026-10-09 (D-91 APPROVED; D-92 APPROVED 18:10 WIB)
- D-91 APPROVED (Fatih; prototipe disetujui; dicatat lewat Paron Designer dan Scout). Hero di landing `/` memakai emas dan kaca, plus aksen amber terbatas di dashboard (angka, tag kecil, state aktif, garis 1px). Dashboard tidak mendapat gradien dan tidak mendapat kaca penuh. Token final: hitam `#000`, teks `#f3f3f3`, teks sekunder `#a6a6a6` dan `#8c8c8c`, amber-100 `#f1d3a6`, amber-300 `#d9a066`, amber-500 `#bc854d`, amber-800 `#5a3515`. Garis 1px `rgba(255,255,255,.16)`, varian lembut `.09`. Kaca hanya di hero landing dan panel angka (radius 8px, di bawah teks yang menimpa cahaya amber), tanpa box-shadow. Motion 38 sampai 64 detik, mati di bawah `prefers-reduced-motion`. Larangan gradien dan kaca di design.md sekarang boleh hanya di hero landing dan panel angkanya. Tetap dilarang: ungu atau cyan, blob, gradien pada teks (kecuali angka 1.5×), bayangan berat, kartu palsu atau statistik palsu. Aturan isi tidak berubah (tanpa logo pihak ketiga, tanpa kata terlarang). Sumber prototipe: `design.md` di `/workspace/paron-landing/` pada komputer Designer. 07 §21, design.md, guidelines.md, approved-ui-changes.md.
- D-92 APPROVED (Fatih, "rekomendasimu saja", dicatat Scout 2026-10-09 18:10 WIB). Memperjelas D-82: seed = 2611, series panggung/demo = 2610 (series 4). Fakta live: seed series 1–3 = `CU-JKT-H100-2611`, `CU-BTM-H200-2611`, `CU-SGP-B200-2612`. Series 4 `CU-JKT-H100-2610` dibuat oleh uji S0 dan sesuai D-19. Series untuk demo dan rekaman = series 4. `2611` tetap data seed di Markets. Rujukan panggung, S0, checklist `/demo`, dan rekaman di 03, 05, 06, 09 memakai `CU-JKT-H100-2610` lagi. **Dampak:** preset wizard (PR #53) mengisi `2611` dan akan diganti ke `2610` di PR UI mendatang oleh handler. Rekaman memakai putaran baru di series 4. 07 §22.

## Usulan yang ditutup 2026-10-09 17:01 WIB (riwayat, jangan dipakai sebagai status)
Sebelum 17:01 WIB bagian ini mencatat tiga butir sebagai PENDING. Ketiganya ditutup oleh keputusan langsung Fatih pada jam itu. Teks lama dipertahankan di bawah.
- D-81 sempat PENDING (lihat bagian ~15:34 WIB). Status sekarang: APPROVED, guard tetap dibatalkan.
- D-83 sempat PENDING: Safe multisig masuk roadmap, rencana kalau Paron live di mainnet. Kalimat "sampai freeze kontrak, peran admin tetap" [SUPERSEDED D-90]. Status sekarang: APPROVED; admin tidak berubah (D-54), tanpa EOA kedua, tanpa pindah ke Safe. Tercatat di 07 §17 dan 08 §7.1. Bentuk Safe pada produk penuh tetap di product-plan §4.10.
- Aturan setelah freeze (08 §7.2, disebut di 09 §1.2) sempat PENDING: setelah 06:00 tidak ada perubahan kontrak; setelah 09:00 hanya bug blocker jalur demo S0; setelah 11:30 tidak ada merge kecuali blocker yang diumumkan lebih dulu. Tag `freeze-contracts` / `freeze-ui` disebut di 08 §0 dan 04 §9.2. **[SUPERSEDED / CANCELLED D-90]** Aturan dan tag itu tidak dipakai. Izin merge saat test hijau (~11:27 WIB) tidak dibatalkan.

## Hosting/infra (catatan kronologis, Jum 9 Okt 2026; tanpa nilai env)
- ~13:08 WIB: Vercel project `paron` (root `web`) https://paron.vercel.app; Railway project `paron`, service `paron-robinhood` (root `indexer`, port 42069) https://paron-robinhood-production.up.railway.app.
- ~13:25 WIB: stage-1 ter-deploy di Robinhood Chain Testnet (46630); 3 seed series.
- ~14:02 WIB: tiap build Railway memakai schema `paron_<sha8>` (PR #30); 503 INDEXER_SYNCING ~1 menit setelah deploy itu normal.
- ~14:15 WIB: risiko RPC publik intermiten di browser; nama cadangan saat itu masih PENDING. **[D-89]** nama `INDEXER_RPC_URL_BACKUP` dan `NEXT_PUBLIC_RPC_URL_BACKUP` sekarang final.
- 15:15 dan 15:31 WIB (cek live): /v1/health synced:true chain 46630; /v1/series = 3 seed; RPC cadangan belum terpasang, menunggu RPC kedua dari Fatih. **[HISTORICAL; pada catatan Sab 10 Okt 2026 indexer Railway sehat dan variabel env cadangan RPC terpasang. Nilai tidak ditulis.]**
- 17:01 WIB (Fatih, langsung; tanpa secret atau token): Vercel hanya membangun branch `main`. Branch lain dilewati lewat Ignored Build Step, jadi tidak ada pratinjau PR. Verifikasi UI hanya setelah merge ke `main`. Kuota deploy free tier habis (`api-deployments-free-per-day`, pulih kira-kira 24 jam). `main` terbaru belum live sampai Fatih menyelesaikan masalah build/kuota. **[HISTORICAL, catatan 17:01 WIB; hosting terkini di bagian Sab 10 Okt 2026 di bawah.]** PR UI #47, #51, #53, #54 sudah di `main` (CI hijau) dan belum tampil di web.
- Env (nama saja): DATABASE_URL, DATABASE_SCHEMA, CHAIN, PORT, DEPLOY_LABEL, INDEXER_RPC_URL, INDEXER_RPC_URL_BACKUP (belum), API_CORS_ORIGIN, NEXT_PUBLIC_RPC_URL, NEXT_PUBLIC_RPC_URL_BACKUP (belum), NEXT_PUBLIC_API_BASE_URL.
- Deadline WIB: jam freeze kontrak 06:00, freeze UI 09:00, dan submit internal 11:30 pada Sab 10 Okt adalah catatan historis [SUPERSEDED D-90] dan tidak mengikat. Tenggat keras tetap Sab 10 Okt 12:00. Kalimat 12:00 itu **[HISTORICAL, superseded by D-93]**. Tenggat keras sekarang Sab 10 Okt 2026 23:59 WIB.

## Keputusan Fatih Sab 10 Okt 2026 (D-93 APPROVED 10:16 WIB; D-94 APPROVED; D-95 APPROVED ~11:07 WIB)

Nomor dicek: pemakaian terakhir sebelumnya D-92. D-93, D-94, dan D-95 belum dipakai. Yang lebih kemudian mengalahkan yang lebih dahulu. Chain tetap testnet. Rincian: 07 §23–§25.

- D-93 APPROVED (Fatih, Sab 10 Okt 2026, 10:16 WIB). Tenggat keras hackathon sekarang Sabtu 10 Okt 2026 23:59 WIB. Menggantikan tenggat 12:00 pada D-90 dan rujukan tenggat di 08 serta 09. Jam freeze 06:00, 09:00, dan 11:30 tetap HISTORICAL (D-90).
- D-94 APPROVED (Fatih, "oke lanjut" / "masukin semua ke kerjaan"). Daftar perbaikan pra-demo dari engineering dan design disetujui: perbaikan header saat wallet tersambung; state kosong dan error di jalur demo (`/buy`, `/trade`, `/redemptions`); status transaksi pending / success / failed dengan tautan explorer; perbaikan kecil S2 (skip link, tinggi input, tab terpotong di 390, badge Pending amber, alamat provider dipendekkan di `/markets/4`); format uang `$3,240.00` dan label seragam "Demo data"; cek tautan landing; h1 "Provider" dengan alamat di bawahnya; `/arbiter` dan tombol Revoke di `/verifier` hanya kalau tidak perlu perubahan kontrak. Yang butuh perubahan kontrak dilaporkan ke Fatih lebih dulu.
- D-95 APPROVED (Fatih, Sab 10 Okt 2026 ~11:07 WIB, "lanjut semuanya langsung"). Arsitektur informasi dipecah per aktor. (1) Navbar pengguna, lewat "Launch app", hanya: Markets, Buy, Trade, Portfolio, Redemptions, Faucet, Index, Data. Tidak ada tautan Provider, Operator, atau Demo. (2) Provider adalah tautan terpisah di luar nav pengguna. Dashboard tiap provider di `/provider/[address]` (series, redemptions, agents; aksi tulis hanya untuk wallet pemilik; alamat lain read-only). `/provider` mengalihkan ke dashboard wallet yang tersambung, atau ke `/onboarding/kyb` kalau belum terverifikasi KYB. Landing: "Launch app" dan "Become a provider". (3) Operator (verifier, admin, ops, arbiter) satu tab terpisah, hanya lewat CTA kecil di footer atau bagian bawah landing, tidak pernah di navbar. Halaman berjudul "Operator tools". (4) `/demo` tetap hidup. Satu-satunya pintu adalah CTA landing "Launch demo". Tidak ada tautan dari navbar, footer dashboard, atau halaman lain. (5) Dashboard produksi hanya indexer sungguhan dan data on-chain testnet. Label "Reference price (demo data)" (D-84..D-88) tetap sampai Fatih menyetujui pengganti. Pengiriman: PR-A nav, CTA, isolasi demo; PR-B dashboard per provider. Catatan Designer **HISTORICAL (koreksi di bagian berikut, #71):** tautan pengguna di tengah; "For providers" dan "Operator" teks sekunder `#a6a6a6` di kanan (Operator = CTA footer/bawah, bukan item navbar); menu mobile Trade / Providers / Operators, target minimal 44 px; banner KYB di `/provider` info netral untuk belum KYB dan pending dengan "Start KYB", amber untuk verified; "List capacity" nonaktif dengan alasan "Complete KYB to list capacity". Roadmap setelah hackathon: gating nav berdasarkan peran, dibaca dari kontrak. h1 "Provider" (D-94) berlaku di `/provider/[address]`.

## Koreksi nav D-95 dan D-96 (Sab 10 Okt 2026)

Nomor dicek: pemakaian terakhir sebelum D-96 adalah D-95. D-96 belum dipakai. Yang lebih kemudian mengalahkan yang lebih dahulu. Chain tetap testnet. Rincian: 07 §25 (koreksi) dan §26.

- Koreksi D-95 (setelah PR #71). D-95 tetap APPROVED. Catatan Designer yang menaruh tautan sekunder "For providers" di navbar aplikasi adalah **HISTORICAL**. Navbar pengguna (Launch app) hanya: Markets, Buy, Trade, Portfolio, Redemptions, Faucet, Index, Data. Pintu provider hanya CTA landing "Become a provider". Operator hanya lewat CTA kecil di footer landing. `/demo` hanya lewat CTA landing "Launch demo".
- D-96 APPROVED (Fatih, Sab 10 Okt 2026 ~15:00 WIB). Bot keeper dan bot trader di Railway jalan LIVE dengan wallet bot khusus (bukan dry-run), setelah Fatih mendanai wallet itu dari faucet. Status: **PENDING FUNDING**. Sampai terbukti, dokumen menulis **not active**. Bot menolak chain selain testnet dan memakai kill switch off-chain D-42. Alamat wallet dan nama akun tidak ditulis.
- Tenggat keras tetap Sab 10 Okt 2026 23:59 WIB (D-93). Submission, deck, dan tombol HackQuest adalah milik Fatih. Usulan submit sekitar 21:00 WIB supaya ada buffer. **HISTORICAL:** "Handler merekam video demo final dari produksi." Video demo final sudah direkam dari `d3081be` dan tidak menampilkan `/admin`. Penyuntingan = agen evergreen video editor yang sudah ada, sesuai Fatih. Isu S2 label "Executed" di `/admin`: **HISTORICAL** untuk status "fix pending, relabel to Ready at" dan "belum merge". **FIXED** di PR #74 (`1f33f2f`). Label sekarang "Ready at". Waktu eksekusi dari indexer masih tidak ditampilkan. Tidak ada perubahan indexer atau kontrak. **HISTORICAL:** "Cek sekilas Designer pada `/admin` masih pending." Cek itu **LULUS** di 1280 dan 390 ("Ready at 17:24:06 WIB", lencana Done tanpa Execute, konsol bersih, satu h1, tanpa scroll horizontal, label "Demo data"). Tidak ada S0, S1, atau S2 desain yang masih terbuka kecuali teks cooldown faucet tanpa hitung mundur (S2 kecil, boleh dilewati). Rincian di STATUS dan 09.
- Estimasi handler 15:55 WIB 10 Okt (bukan hitung per butir): built ~97%, proven ~85%. S0 A ~100%. S0 B pada jam itu ~95% adalah **HISTORICAL**; setelah faucet sukses dan teks cooldown terbukti di produksi `d3081be`, S0 B ~100%. S1 A ~95% B ~60% (bot belum jalan di Railway, kill switch belum diuji). S2 A ~95% B ~70%. Never-cut terbangun 3/3, terbukti lewat UI di produksi 3/3. Rincian cek, isu, dan pemilik: `docs/build/STATUS.md` dan dev-docs/09.

## Hosting (Sab 10 Okt 2026; tanpa secret, tanpa nama akun, tanpa nilai token)

- Produksi: https://paron.vercel.app. Terhubung ke Git. Build otomatis hanya saat merge ke `main`. Commit produksi sekarang `1f33f2f` (PR #74). CI pada merge itu hijau, dan https://paron.vercel.app READY di `1f33f2f`. Cek UI yang menyebut `d3081be` tetap catatan commit yang lebih lama.
- Cadangan: https://paron-bay.vercel.app, pada akun Vercel kedua. Tidak terhubung ke Git. Deploy manual dari `main`. Nama akun tidak ditulis.
- Origin `https://paron.vercel.app` tetap diizinkan pada CORS API.
- Indexer Railway sehat. Variabel env cadangan RPC pada indexer itu terpasang. Nilainya tidak ditulis di dokumen. **HISTORICAL sebagai kalimat umum.** Kalimat terkini: RPC kedua (PublicNode) sudah dipasang sebagai `INDEXER_RPC_URL_BACKUP` dan `NEXT_PUBLIC_RPC_URL_BACKUP`. Nilai URL dan kunci tidak ditulis. Kunci RPC yang sempat ada di riwayat git masih perlu dirotasi oleh Fatih (pemilik: Fatih).
- Catatan 15:15 WIB bahwa RPC cadangan belum terpasang, dan catatan 17:01 WIB bahwa kuota deploy habis serta `main` terbaru belum live, adalah **HISTORICAL**.

## Header, route indeks, dan kredit chart (catatan dokumen 10 Okt 2026)

- Format alamat di header: `0x3F8f…6ae9` (6 karakter pertama termasuk `0x`, 4 karakter terakhir). Header dicek di 1024, 1100, 1280, 1440, dan 390 dengan wallet tersambung. Nav tidak terpotong. Tombol Menu muncul saat tautan tidak muat. Semua kontrol header minimal 44 px (PRs #64). Contoh bentuk di spec tetap itu. Cek produksi (commit `20ff4b1`) memakai potongan yang sama, gaya `0xA1FA…95DF`. Rincian di 06, STATUS, dan checklist 09.
- Halaman `/index` pindah ke `/h100-index` karena path statis `/index` bentrok dengan `/` di Vercel. `/index` mengalihkan 307. Path API `/index/H100` tidak berubah. Sitemap dan 06 ikut diperbarui.
- Logo chart TradingView dimatikan lewat opsi library `attributionLogo: false` di `web/components/charts.tsx`. Kredit lisensi berupa teks polos ada di halaman `/legal/risk` (`web/app/legal/risk/page.tsx`). Larangan logo pihak ketiga dan larangan tautan pihak ketiga tetap, dengan pengecualian kredit lisensi ini saja.
