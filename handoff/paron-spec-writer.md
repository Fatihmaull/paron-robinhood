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
- D-97: halaman `/docs` di kiri Markets. Halaman live di `783b6be`. Navbar landing dan langkah 5 live di `e19d646` (#78). Gambar 02 dan 05 live di #80. Gambar 01 di `main` masih hero lama. Gambar 01 hero baru (`shots-v4/01-open-paron.png`, `synced:true`, lag 2 blok) sudah diambil. **Gambar 01 updated, PR pending merge.** Belum live sampai merge. Gambar 02 dan 05 tidak berubah.
- D-98 APPROVED (Fatih lewat Designer 1:1, 10 Okt 2026). Bukan pending. Hero landing gaya CRM-enterprise: judul tengah, dua tombol, kotak tangkapan dasbor, siluet kota ASCII, gradien cokelat gelap/amber. Navbar, merek, dan Launch app tidak diubah. Masuk di #86 dan #87. Deskripsi hero emas-dan-kaca (D-91) HISTORICAL untuk bentuk hero. Cek Designer di produksi setelah `4639a4b` LULUS, tanpa S0/S1. Dua S2 kecil tetap: siluet ASCII pada 390 tertutup kartu; `/provider` hanya gerbang Connect wallet dengan label "Demo data" di bar atas aplikasi.
- PR docs #67, #73, #75, #77, #79 sudah merge.
- Submission URLs ada di checklist 09. 13/13 kontrak (12 Paron dari `stage-1.json` plus MockUSDC) verified on Sourcify (exact match). EAS dan SchemaRegistry **not verified**. Blockscout belum mendukung solc 0.8.37 (yang ada 0.8.36), jadi explorer masih NOT verified. Jangan tulis verified di explorer.
- Faucet sukses dan teks cooldown terbukti di `d3081be`. `4639a4b` menambah hitung mundur dari `lastFaucetAt`. Cek Designer tidak mengulang kalimat itu.
- Label "Executed" di `/admin` jadi "Ready at" (#74, `1f33f2f`). Waktu eksekusi dari indexer tetap tidak tampil.
- `4639a4b` juga menambah panel Issued attestations, halaman `/legal/disclaimer`, dan bingkai tur langkah 4. Itu commit produksi. Cek Designer tidak membuka layar itu.
- Video v3 selesai, sekitar 2 menit, direkam dari produksi dengan hero baru, sudah dikirim ke Fatih. Fatih yang mengunggah. Saat rekaman, pita biru "Indexer is catching up" muncul. Scout: `/v1/health` `synced:true`, lag 23 blok, `index_update_failures` 0, series 2610 terdaftar. Pita muncul saat lag dan hilang sendiri. Cek `/v1/health` sebelum rekaman ulang.

## Posisi sekarang

PR kode dan docs yang diketahui sudah merge sampai `4639a4b`. Produksi: https://paron.vercel.app. Commit produksi = `4639a4b`. Saat catatan ini ditulis GitHub tidak menampilkan PR terbuka. PR gambar 01 dari handler (cloud agent) belum ada di daftar itu dan belum merge.

## Sisa / ke depan

- D-98 sudah dicatat APPROVED. Jangan tulis ulang sebagai pending.
- Gambar 01 updated, PR pending merge. Belum live. Gambar 02 dan 05 tidak berubah.
- S2 kecil yang masih terbuka: siluet ASCII pada 390 tertutup kartu; `/provider` hanya gerbang Connect wallet dengan label "Demo data" di bar atas aplikasi.
- Known issue yang tetap: tidak ada jalur KYB submit di app (attestation manual lewat `/verifier`). `/arbiter` `ruleWithSignatures` mungkin stub. **HISTORICAL:** "Applications tidak memuat attestation terbit" dan "tombol Revoke belum ada" sebagai celah kode. `4639a4b` menambah panel Issued attestations dan "Use for revoke". Tombol Revoke sudah ada sebelum commit itu.
- Bagian Fatih: deck, unggah video v3 (berkas sudah di tangan Fatih), isi wallet bot, rotasi key RPC, submit HackQuest sebelum 23:59 WIB. Saran submit sekitar 21:00 WIB.

## Cara melanjutkan

Mulai dari `docs/README.md`, lalu `docs/knowledge-base/CONTEXT-INDEX.md`. Cek PR yang masih terbuka sebelum ngedit. Jangan tulis "verified" di explorer sebelum Blockscout menampilkannya.
