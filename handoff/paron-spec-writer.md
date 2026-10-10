# Handoff: Paron Spec Writer

Catatan untuk yang nerusin peran ini. Chain tetap Robinhood Chain Testnet (46630). Jangan tulis kunci, token, atau alamat wallet.

## Peran

Jaga `docs/dev-docs` 01–09, `docs/knowledge-base/CONTEXT-INDEX.md`, dan `docs/design/approved-ui-changes.md`. Keputusan baru tetap **PENDING** sampai Fatih setuju. Kalau keputusan baru menimpa teks lama, tandai **HISTORICAL**, jangan dihapus. 07 yang menang kalau dokumen beda pendapat.

Jangan pernah kirim pesan ke luar atas nama Fatih tanpa draf.

Kerja repo lewat cloud agent. Satu commit per PR docs, biar kuota Vercel hemat.

## Yang sudah dikerjakan

- Audit docs.
- D-92: seed `2611`, panggung/rekaman `2610`.
- Koreksi D-75..D-80, status **APPROVED**.
- Guard grep CI dari D-74 dibatalkan (D-81).
- D-93: tenggat keras 10 Okt 2026, 23:59 WIB. Jam 12:00 itu historis.
- D-94: daftar perbaikan pra-demo.
- D-95: IA per aktor. User, provider, operator, dan demo terpisah. Pintu provider = "Become a provider" di landing. Operator = CTA kecil di footer. `/demo` cuma lewat "Launch demo".
- D-96: keeper dan trader live di Railway dengan wallet bot khusus, bukan dry-run. Alamat wallet tidak ditulis. Sampai terbukti jalan, docs tetap **not active**. Dana faucet masih **PENDING FUNDING**.
- D-97: halaman `/docs` di kiri Markets. Halaman live di `783b6be`. Navbar landing dan langkah 5 live di `e19d646` (#78).
- PR docs #67, #73, #75, #77, #79 sudah merge.
- Submission URLs ada di checklist 09. 13/13 kontrak (12 Paron dari `stage-1.json` plus MockUSDC) verified on Sourcify (exact match). EAS dan SchemaRegistry **not verified**. Blockscout belum mendukung solc 0.8.37 (yang ada 0.8.36), jadi explorer masih NOT verified. Jangan tulis verified di explorer.
- Faucet sukses dan teks cooldown terbukti di `d3081be`.
- Label "Executed" di `/admin` jadi "Ready at" (#74, `1f33f2f`). Waktu eksekusi dari indexer tetap tidak tampil.

## Posisi sekarang

PR kode dan docs yang diketahui sudah merge, termasuk #80 (`ed96472`). Produksi: https://paron.vercel.app. Saat catatan ini ditulis, `main` ada di `ed96472`.

## Sisa / ke depan

- Rework hero landing: catat sebagai keputusan baru **D-98** hanya setelah Fatih setuju hasilnya. Prototipe dari Designer. Batas merge sekitar 20:00 WIB. Kalau meleset, pakai landing lama plus video cadangan. Jangan tulis D-98 sebelum ada persetujuan.
- Gambar tutorial 01, 02, 05 baru (shots-v3) sudah masuk lewat PR kecil handler #80 (`ed96472`). Catat di docs pada push terakhir. Jangan diklaim sudah tertulis di STATUS sebelum push itu.
- Satu docs push terakhir setelah semua live: update `docs/build/STATUS.md`, 09, 06, dan sitemap.
- Teks cooldown faucet tanpa hitung mundur = S2 minor, boleh dilewati.
- Known issue: tidak ada jalur KYB submit di app (attestation manual lewat `/verifier`). `/verifier` Applications tidak memuat attestation yang sudah diterbitkan. `/arbiter` `ruleWithSignatures` mungkin stub. Tombol Revoke belum ada.
- Bagian Fatih: rotasi key RPC, deck, unggah video demo, isi wallet bot, submit HackQuest sebelum 23:59 WIB. Saran submit sekitar 21:00 WIB.

## Cara melanjutkan

Mulai dari `docs/README.md`, lalu `docs/knowledge-base/CONTEXT-INDEX.md`. Cek PR yang masih terbuka sebelum ngedit. Jangan tulis "verified" di explorer sebelum Blockscout menampilkannya.
