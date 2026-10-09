# Paron: indeks dokumen konteks (master: Hackathon Scout; sekarang PO/project handler)

Sumber kebenaran: repo `docs/knowledge-base/` (mirror dari folder kerja Scout di box; path box lama tidak dipakai).
Terakhir diperbarui: Jumat 9 Okt 2026, ~15:34 WIB

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
| 8 | dev-docs/08-team-tasks.md | Timeline solo per jam (T0 Jum 11:14; freeze kontrak Sab 06:00; freeze UI 09:00; submit internal 11:30; tenggat keras 12:00 WIB), cut ladder, daftar never-cut, slot ukur PENDING teknis | SELESAI (4 lane agent, D-59) |
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
- (2026-10-09 ~14:50 WIB) D-67..D-74 APPROVED (Fatih 14:40): #9+LR-5=D-67, #10=D-68, #11=D-69, #12=D-70, #13=D-71, LR-6 contrast=D-72, LR-8 Provider tabs=D-73, also-adopt (tokens.v2.css, route titles, skip link)=D-74. Butir grep CI pada D-74 dibatalkan di D-81 (awaiting Fatih's direct confirmation in group). PE priority if short on time: D-70,71,72,69,73,68,67. Docs pass 1 merged to repo docs/ (PR #37).

## Keputusan Fatih Jum 9 Okt 2026 ~15:34 WIB [APPROVED, disampaikan lewat handler; "lanjutkan dengan rekomendasi"]
- Satu PR docs (`docs/audit-2026-10-09`): draf audit Scout + temuan Spec Writer; boleh di-merge kalau tidak ada konflik dan tidak menyentuh kode.
- Nama pihak ketiga (Ornn, ICE, Robinhood) dikecualikan eksplisit dari aturan "nama proyek lama" untuk dokumen dan footnote slide.
- D-75..D-80 APPROVED (P1–P6, Fatih), 07 §16 dan `design/approved-ui-changes.md`: D-75 banner syncing hanya jika `synced:false` atau lag >20 blok, warna info, kalimat live di D-84; D-76 skeleton pulse opacity, "0 series." tetap tersembunyi saat loading; D-77 tab Leverage di `/markets/[id]` berlabel "Coming soon", tanpa aksi; D-78 tiket Buy hanya copy produk; D-79 uang `$3,240.00` (pemisah ribuan, 2 desimal) dan max cost 2 desimal; D-80 beranda dipadatkan (mobile 390 px, connect wallet satu baris).
- D-81: guard CI grep `affiliated|endorsed by` (butir terakhir D-74) DIBATALKAN. Tidak ada grep itu di CI. `copy-guard.test.ts` tidak diubah dan bukan guard ini. Status: PENDING (awaiting Fatih's direct confirmation in group).
- D-82 APPROVED: nama series demo yang live = `CU-JKT-H100-2611`. Seed kontrak series 1 tidak diubah. Catatan D-19/D-25 (`CU-JKT-H100-2610` di panggung) tetap historis; yang digantikan hanya penamaan live. `series_id`, window, dan input skrip seed/forge di 03, 05, 06, 09 tidak ditulis ulang.
- D-64 menggantikan footer "not affiliated" di UI/README (hanya pitch deck/slide); teks lama di UI/README ditandai historis atau `[SUPERSEDED D-64]`. Footnote slide tetap.

## Keputusan Fatih 2026-10-09 16:39 WIB [APPROVED, langsung]
- D-84..D-88 APPROVED (07 §18, `design/approved-ui-changes.md`).
- D-84 banner syncing, warna info, hanya jika `synced:false` atau lag > 20 blok. Kalimat persis: "Indexer is catching up to the latest blocks; data may lag briefly."
- D-85 tab series mengikuti D-67 (Bond, Terms, Redemptions, Reputation). Kalau belum selesai sebelum freeze UI Sab 2026-10-10 09:00 WIB, tab lama (Overview, Buy, Trade, Leverage) tetap dan sisa itu dicatat di dokumen. Pada `main` `93f8e60` tab series masih yang lama.
- D-86 pesan tidak ketemu "Request not found." di `/redemptions/1` dan `/disputes/1`.
- D-87 pita data demo sintetis tetap, teks "Reference price (demo data)".
- D-88 pratinjau PR #47 (beranda) belum ditinjau. Designer memeriksa produksi setelah rebase dan merge.
- D-89 APPROVED (handler, 07 §19): ulang RPC jeda 400/800/1600 ms; gagal RPC publik = teks redup, bukan error merah; nama `INDEXER_RPC_URL_BACKUP` dan `NEXT_PUBLIC_RPC_URL_BACKUP` final (kosong = hanya URL utama). Nilai URL tidak ditulis di dokumen.

## Usulan PENDING (belum konfirmasi Fatih)
- D-81 tetap PENDING (lihat bagian ~15:34 WIB).
- D-83: Safe multisig masuk roadmap, rencana kalau Paron live di mainnet. Sampai freeze kontrak, peran admin tetap seperti sekarang (D-54): tanpa EOA kedua, tanpa pindah ke Safe. Tercatat di 07 §17 dan 08 §7.1. Bentuk Safe pada produk penuh tetap di product-plan §4.10.
- Aturan setelah freeze (08 §7.2, disebut di 09 §1.2): setelah 06:00 tidak ada perubahan kontrak; setelah 09:00 hanya bug blocker jalur demo S0; setelah 11:30 tidak ada merge kecuali blocker yang diumumkan lebih dulu. Jam freeze, tag `freeze-contracts` / `freeze-ui`, dan merge saat test hijau sudah ada di baris Deadline di bawah, 08 §0, dan izin merge ~11:27 WIB. Status tetap PENDING.

## Hosting/infra (catatan kronologis, Jum 9 Okt 2026; tanpa nilai env)
- ~13:08 WIB: Vercel project `paron` (root `web`) https://paron.vercel.app; Railway project `paron`, service `paron-robinhood` (root `indexer`, port 42069) https://paron-robinhood-production.up.railway.app.
- ~13:25 WIB: stage-1 ter-deploy di Robinhood Chain Testnet (46630); 3 seed series.
- ~14:02 WIB: tiap build Railway memakai schema `paron_<sha8>` (PR #30); 503 INDEXER_SYNCING ~1 menit setelah deploy itu normal.
- ~14:15 WIB: risiko RPC publik intermiten di browser; nama cadangan saat itu masih PENDING. **[D-89]** nama `INDEXER_RPC_URL_BACKUP` dan `NEXT_PUBLIC_RPC_URL_BACKUP` sekarang final.
- 15:15 dan 15:31 WIB (cek live): /v1/health synced:true chain 46630; /v1/series = 3 seed; RPC cadangan belum terpasang, menunggu RPC kedua dari Fatih.
- Env (nama saja): DATABASE_URL, DATABASE_SCHEMA, CHAIN, PORT, DEPLOY_LABEL, INDEXER_RPC_URL, INDEXER_RPC_URL_BACKUP (belum), API_CORS_ORIGIN, NEXT_PUBLIC_RPC_URL, NEXT_PUBLIC_RPC_URL_BACKUP (belum), NEXT_PUBLIC_API_BASE_URL.
- Deadline WIB: freeze kontrak Sab 10 Okt 06:00; freeze UI 09:00; submit internal 11:30; tenggat keras 12:00.
