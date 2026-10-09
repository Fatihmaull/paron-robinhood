# Paron: indeks dokumen konteks (master: Hackathon Scout)

Folder: /workspace/hackathon-scout/ethereum-jakarta-2026/
Terakhir diperbarui: Jumat 9 Okt 2026, ~10:35 WIB

**Mulai dari sini untuk dev:** `HANDOFF-BRIEF.md` (posisi sekarang, urutan baca, tugas pertama, prioritas, aturan), lalu `paron-product-plan.md` (gambaran produk penuh: semua modul, aplikasi, arsitektur akhir, roadmap P0–P5, batas lingkup hackathon).

## A. Dokumen kanonik (sumber kebenaran, pakai ini)
| File | Isi | Pemilik |
|---|---|---|
| paron-product-plan.md | Rancangan produk PENUH (bukan MVP): modul, aplikasi end state, arsitektur, roadmap P0–P5, matriks lingkup hackathon vs nanti, NFR, metrik | Hackathon Scout |
| paron-product-knowledge.md | Peta produk lengkap: overview, nama, one-liner, fitur + tech, fitur per aktor, flow, diagram, bisnis, demo, risiko, roadmap, glossary | Hackathon Scout |
| paron-sitemap.md | Sitemap produk LENGKAP (78 route): spec per route (tujuan, role gate, komponen, fungsi kontrak/API, state, tag MVP-27h/FULL, demo live), pohon mermaid, matriks cakupan aksi→layar (59 aksi), checklist anti-mock, potongan build 27 jam + tier build solo S0–S3 (§9.1); keputusan terkait APPROVED Jum 9 Okt ~09:40 WIB | Hackathon Scout |
| paron-sitemap.xml | sitemap.xml route publik yang bisa diindeks (domain placeholder https://paron.exchange, belum dibeli); route ber-role dikecualikan | Hackathon Scout |
| paron-design.md | Design brief utama: konsep, flow A-E, 12 kontrak, state machine redemption, fee, narasi, MVP 27 jam, build plan WIB, demo script, Q&A, open questions (§9), gap analysis (§10), chain config + go/no-go (§11) | Hackathon Scout |
| paron-stack.md | Tech stack lengkap + versi, konfigurasi chain, go/no-go checks, prerequisites | Hackathon Scout |
| paron-gaps.md | Gap analysis narasi infra untuk market compute (G1-G13) | Hackathon Scout |
| open-questions-research.md | Hasil riset open questions (EAS, Safe, faucet, Robinhood Chain, dll.) | Hackathon Scout |
| notes.md | Aturan, judging, timeline ETHJKT 2026 (WIB) | Hackathon Scout |
| checks/ | Hasil cek environment (anvil fork, deploy EAS, pragma, Safe). Bukan kode produk. | Hackathon Scout |

## B. Dokumen dev (ditulis Paron Spec Writer, folder paron-dev-docs/; semua SELESAI)
| # | File | Isi | Status |
|---|---|---|---|
| 1 | paron-dev-docs/01-contract-interfaces.md | Signature fungsi, event, error, access control 12 kontrak + IParticipantGate | SELESAI; keputusan APPROVED (Jum 9 Okt ~09:40 WIB) |
| 2 | paron-dev-docs/02-invariants-acceptance.md | Invariant + acceptance criteria + daftar test Foundry per kontrak | SELESAI; keputusan APPROVED (Jum 9 Okt ~09:40 WIB) |
| 3 | paron-dev-docs/03-data-contract.md | Schema Ponder + spesifikasi API (/v1/prints, dll.) | SELESAI; keputusan APPROVED (Jum 9 Okt ~09:40 WIB) |
| 4 | paron-dev-docs/04-repo-config.md | Layout monorepo, template .env, chain config, urutan deploy | SELESAI; keputusan APPROVED (Jum 9 Okt ~09:40 WIB) |
| 5 | paron-dev-docs/05-demo-seed.md | Skenario + spec script seed demo (500 CU, buy 20, ask $3.20, default 10 CU) | SELESAI; keputusan APPROVED (Jum 9 Okt ~09:40 WIB) |
| 6 | paron-dev-docs/06-screens-wireframes.md | Wireframe teks + copy per screen | SELESAI; keputusan APPROVED (Jum 9 Okt ~09:40 WIB) |
| 7 | paron-dev-docs/07-decisions-log.md | Open questions §9 + treasury/fee + D-41..D-44 → keputusan (rekomendasi disetujui Fatih Jum 9 Okt ~09:40 WIB) | SELESAI; keputusan APPROVED (Jum 9 Okt ~09:40 WIB) |
| 8 | paron-dev-docs/08-team-tasks.md | Timeline solo per jam (go/no-go Jum 10:30, S0 Jum 20:00, S1 Sab 02:00, S2 Sab 05:30, freeze Sab 06:00, submit 11:30), cut ladder, daftar never-cut, slot ukur PENDING teknis | SELESAI (tim = Fatih solo) |
| 9 | paron-dev-docs/09-submission-checklist.md | Field HackQuest, README + disclaimer, video demo | SELESAI; keputusan APPROVED (Jum 9 Okt ~09:40 WIB) |

## Keputusan terakhir Fatih (Jum 9 Okt ~10:34 WIB, APPROVED)
- D-10 domain/handle: pakai URL Vercel dulu, belum beli domain/handle
- 05 P5-26: bot trader jalan otomatis waktu demo (dipicu `PrimaryBuy`)
- 09 T9-06: lisensi repo MIT (open source)
- Sisa PENDING teknis (gas, finality, versi, latency, field HackQuest) diukur saat build; slotnya ada di 08 dan daftarnya di 07 §10.2

## C. Arsip (jangan dipakai sebagai konteks dev)
Pre-Paron ideation notes, naming drafts, old reviews/clones and rollback backups are intentionally not part of this repo.

## Aturan
- Semua dokumen = spec, BUKAN kode. Kode produk baru boleh ditulis mulai Jumat 9 Okt 09:00 WIB.
- Dokumen kanonik dan dev docs tidak boleh menyebut nama proyek lama/eks-tim.
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
- D-45..D-58 di-approve semua (lihat paron-dev-docs/07).
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
