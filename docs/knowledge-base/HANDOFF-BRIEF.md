# Paron: handoff brief untuk Paron Principal Engineer
Ditulis Hackathon Scout, Jum 9 Okt 2026 ~10:50 WIB. Sumber kebenaran: CONTEXT-INDEX.md (start: SESSION_HANDOFF_HACKATHON.md, lalu CONTEXT-INDEX.md, lalu file ini). Catatan 9 Okt 2026: bagian "Posisi sekarang" adalah snapshot ~10:50 WIB; untuk state terkini ikuti SESSION_HANDOFF.

## Posisi sekarang
- Fase docs SELESAI. Semua keputusan APPROVED (07: D-01..D-44, termasuk D-10 URL Vercel, P5-26 bot trader otomatis, T9-06 MIT).
- Kode: BELUM ADA. Repo: https://github.com/Fatihmaull/paron-robinhood (git author Fatih Maulana <fatihmaulanamail@gmail.com>). "GO" dari Fatih Jum 9 Okt 11:14 WIB (T0). Build jalan.
- Tim: Fatih + 4 lane agent paralel (kontrak, frontend, indexer/API, ops/deploy; D-59). Deadline keras Sab 10 Okt 12:00 WIB (submit internal 11:30). Demo Day Min 11 Okt.
- 08 dihitung dari T0 Jum 9 Okt 11:14 WIB (lane 4). Freeze kontrak Sab 06:00, freeze UI 09:00, submit internal 11:30, tenggat keras 12:00 (WIB). Kalau telat, potong dari S1/S2, bukan S0/never-cut.
- **HISTORICAL, superseded by D-90:** jam freeze kontrak 06:00, freeze UI 09:00, dan submit internal 11:30 pada Sab 2026-10-10 tidak mengikat. Tenggat keras Sab 2026-10-10 12:00 WIB tetap. Teks jam di dua baris di atas tidak dihapus.

## Urutan baca
1. CONTEXT-INDEX.md
2. paron-product-plan.md (gambaran produk penuh), paron-product-knowledge.md (produk, aktor, flow), paron-design.md (§4 kontrak, §8 demo, §11 chain), paron-stack.md (versi)
3. paron-sitemap.md (78 route, tier S0–S3 §9.1, checklist anti-mock §8)
4. `docs/dev-docs/`: 08 (timeline) → 01 (interface) → 02 (MUST tests) → 04 (repo/env/deploy) → 05 (demo seed) → 03 (Ponder + API) → 06 (layar + copy) → 07 (keputusan) → 09 (submission)

## Tugas pertama
Go/no-go chain (04, design §11): cek RPC + faucet Robinhood Chain Testnet, deploy MockUSDC uji. Gagal → Arbitrum Sepolia (satu file chain config). Lapor hasilnya di grup.

## Prioritas
- S0 (demo path ~8 halaman): faucet → KYB → provider buat series CU-JKT-H100-2610 (500 CU @ $3.00, bond $2,250) → buy 20 CU → ask 5 CU @ $3.20 (manual dari `W-TRD` di S0, bot otomatis di S1) → redeem 8 CU → ack/deliver/finalize, bond $36 dilepas → default 10 CU → claim $45 dari wallet mana pun. End state bond 2,169 (= 2,250 − 36 − 45), coverage 1.50 (statis, tampilkan juga backing outstanding).
- S1: /ops/keepers, /verifier, /admin (proposals + execute timelock), kill switch, /demo.
- S2: arbiter + dispute, revoke, raise price, tab leverage "Coming soon", legal.
- NEVER CUT: claim default dari wallet mana pun; approve KYB live dari UI verifier; satu perubahan timelock dieksekusi dari /admin.
- Prinsip anti-mock: setiap aksi aktor punya UI nyata, tidak ada fitur yang cuma bisa lewat script.

## Aturan
- Kode ditulis dari nol saat build; jangan salin apa pun dari checks/, arsip (section C), atau .bak-*.
- Jangan pakai nama proyek lama/eks-tim di repo, README, commit, UI.
- Secret (private key deployer, RPC key) hanya lewat secret input di chat 1:1 Fatih dengan Principal Engineer. .env tidak masuk git. Testnet saja.
- Lisensi MIT (copyright: Fatih Maulana, kecuali Fatih minta nama lengkap). URL demo = Vercel.
- README **tanpa** disclaimer not-affiliated [D-64]; footnote hanya di pitch deck/slide (09).
- Merge PR hanya setelah Fatih bilang ya. Tidak submit HackQuest, tidak kontak penyelenggara/juri/Ornn.
- Video demo dikerjakan Video Taker, bukan dev.
- Konflik/gap spec → lapor ke Paron Spec Writer; pertanyaan produk → Hackathon Scout.

## Masih terbuka (diukur saat build, bukan keputusan)
Gas, finality, versi, latency, field HackQuest: slot di 08, daftar di 07 §10.2.

## Yang dibutuhkan dari Fatih sekarang
1. ~~Link repo~~ SUDAH: github.com/Fatihmaull/paron-robinhood. D-45..D-58 APPROVED. Fallback Arb Sepolia kalau Robinhood gagal.
2. Private key wallet deployer testnet + saldo ETH testnet, lewat chat 1:1 dengan Principal Engineer.
3. "Go".
