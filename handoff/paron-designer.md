# Handoff: Paron Designer

Tanggal: 2026-10-10 (WIB). Hanya testnet. Tanpa secret atau key.

## Peran
Audit dan review UI Paron (prinsip: intentional, hierarki ketat, tipografi presisi, tanpa AI slop), prototipe landing, dan konten tutorial /docs. Tidak menulis kode produksi; perubahan kode lewat cloud agent yang dikoordinasi paron handler.

## Yang sudah dikerjakan
- Audit UI semua halaman, diprioritaskan S0/S1/S2; temuan sudah di-fix lewat PR #62 sampai #78 (navbar wallet, tx status, wrong network, h1 ganda, reduced-motion, touch target, label "Ready at" di /admin, Docs di navbar landing).
- Prototipe landing (gaya gradasi emas dan kaca) dan auto-tour dengan kursor palsu, sudah masuk produksi.
- Riset bagaimana demo di ornn.com dibuat (HTML/React hardcoded, bukan video).
- Prompt Google Stitch untuk redesign semua halaman.
- Konten /docs (tutorial.md + gambar). Review live deploy e19d646 (#78): lulus, tanpa temuan S0 sampai S2.
- Prototipe hero v2 (gaya CRM enterprise, kartu screenshot dashboard /markets/4, siluet Jakarta ASCII): /workspace/paron-landing/hero-v2/ (di komputer Designer, bukan di repo).

## Posisi sekarang
- Cloud agent bc-93133dae-2ed2-5bdc-b1d4-6a29a25a9fc4 mengerjakan satu PR hero v2 ke main. Aturan dari Fatih: hanya hero berubah; font sama seperti landing lama; section lain dan urutannya tetap; tidak ada kata "demo" di landing kecuali bar "Live on Robinhood Chain Testnet, See the demo path"; hapus tombol demo di navbar; tombol hero ke /provider ("Become a provider") dan /markets ("Browse markets"). Merge ke main setelah CI hijau.
- Video dan /docs memakai versi lama, itu disengaja untuk sekarang.

## Langkah berikutnya
1. Setelah PR hero merge dan deploy READY: cek ulang https://paron.vercel.app di 1280 dan 390 (urutan section sama seperti sebelumnya, grep teks "demo" hanya di bar, satu h1, tanpa overflow, 44px).
2. Landing belum punya menu mobile; di 390 link Docs belum terjangkau. Perlu ditambahkan jika waktu cukup.
3. Siluet ASCII lemah di 390 (tertutup kartu); gambar /markets/4 adalah halaman hidup, bekukan atau ambil ulang saat rilis.
4. Gambar /docs 01, 02, 05 versi baru ada di /workspace/docs-tutorial/shots-v3/ dan belum masuk repo; handler membuat PR kecil.
5. Jangan screenshot /markets dengan alamat provider penuh.
