# Handoff: Paron Scout (Product Owner dan deployer)

Ditulis Sabtu 10 Okt 2026 sekitar 18:10 WIB. Tanpa secret. Token Vercel dan Railway ada di environment komputer Scout, bukan di repo.

## Peran
Product owner, project handler, dan deployer (Vercel untuk `web`, Railway untuk `indexer`) untuk repo `Fatihmaull/paron-robinhood`, Robinhood Chain Testnet 46630, testnet only. Fatih menulis dalam bahasa Indonesia santai; komunikasi dalam bahasa Indonesia. Akun deployment: fatihmaulanamail@gmail.com.

## Yang sudah dikerjakan
- Audit docs (README, knowledge-base, CONTEXT-INDEX, dev-docs 01 sampai 09) dan perapian lewat PR docs (#44 dan lanjutannya, sampai #79). Keputusan Fatih dicatat kronologis di CONTEXT-INDEX (D-64 sampai D-97), usulan baru berstatus PENDING sampai Fatih setuju.
- Keputusan penting: admin role tetap (Safe multisig hanya roadmap mainnet), series demo `CU-JKT-H100-2610` dan seed `CU-JKT-H100-2611`, IA baru (navbar user tanpa Provider, Operator, Demo; provider punya dashboard sendiri; operator lewat footer landing; `/demo` hanya dari tombol Launch demo di landing), halaman `/docs` (D-97), keeper dan trader bot live dengan wallet khusus bot (menunggu wallet terisi dari faucet), UI text tetap bahasa Inggris.
- Hosting: Vercel project `paron` (root `web`, hanya branch `main` yang dibangun, PR branch di-skip lewat Ignored Build Step), Railway project `paron` service `paron-robinhood` (root `indexer`, Postgres, schema `paron_<sha8>` per build; 503 INDEXER_SYNCING sekitar 1 menit saat build baru itu normal). RPC backup PublicNode `https://robinhood-sepolia-rpc.publicnode.com` sudah terpasang di `INDEXER_RPC_URL_BACKUP` dan `NEXT_PUBLIC_RPC_URL_BACKUP`.
- Setiap merge ke main diverifikasi: CI hijau, deployment Vercel production READY di commit itu, endpoint 200, `/v1/health` synced. Routine 'Paron pantau blocker dan progres' berjalan tiap jam menit :32 sampai 23:59 WIB 10 Okt dan melaporkan ke Fatih di 1:1.
- Temuan yang membantu: bug `account` di simulasi tx (diperbaiki #70), label 'Executed' di /admin sebenarnya `ready_at_ms` (jadi 'Ready at', #74), jam block testnet sesuai jam nyata, "For providers" di navbar app melanggar revisi Fatih (dihapus), verifikasi kontrak di Blockscout gagal karena solc 0.8.37 belum didukung tetapi 13 kontrak exact match di Sourcify (#79).

## Posisi sekarang (per sekitar 18:10 WIB)
- Production `paron.vercel.app` READY, terakhir diverifikasi di `e19d646` (#78) lalu docs #79 di `9ed8581`. Tidak ada PR kode terbuka selain PR kecil gambar tutorial dan PR handoff.
- Lulus review Designer: landing, navbar, /docs (17 langkah), status tx, Wrong network, faucet sukses dan cooldown, tiga never-cut lewat UI (KYB dari /verifier, Timelock execute dari /admin, claim default).
- Terbuka: rework hero landing (gaya CRM enterprise, prototipe dari Designer, batas merge sekitar 20:00 WIB; kalau meleset pakai hero lama), video demo final (rekaman cadangan dari landing lama sudah direkam handler), wallet bot keeper/trader belum terisi sehingga bot belum aktif, Blockscout belum menampilkan kontrak verified (hanya Sourcify), EAS dan SchemaRegistry not verified, teks cooldown faucet tanpa hitung mundur (S2 minor), daftar Applications belum memuat attestation yang sudah di-issue.

## Langkah berikutnya
1. Setiap merge ke main: cek Vercel READY dan `/`, `/docs`, `/markets` 200, lalu kabari Designer untuk review dan Fatih di 1:1.
2. Kalau rework hero merge: minta Designer cek 1024, 1280, 390, rekam ulang bagian landing video.
3. Bagian Fatih: rotasi key RPC yang pernah bocor di git history, deck, submit HackQuest (batas hard 23:59 WIB 10 Okt, saran submit paling lambat sekitar 21:00 WIB), isi wallet bot dari faucet.
4. Setelah deadline: matikan atau ubah routine pemantau, pindahkan keputusan baru ke CONTEXT-INDEX lewat PR docs, catat Safe multisig sebagai roadmap mainnet.

## URL
Repo https://github.com/Fatihmaull/paron-robinhood, app https://paron.vercel.app, tutorial https://paron.vercel.app/docs, indexer health https://paron-robinhood-production.up.railway.app/v1/health, series https://paron-robinhood-production.up.railway.app/v1/series. Alamat kontrak dan link Sourcify ada di checklist 09.
