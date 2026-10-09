# Paron: decisions log (dev doc 07)

Status: **APPROVED. Fatih menyetujui semua rekomendasi pada Jum 9 Okt 2026 ~09:40 WIB** (dicatat di CONTEXT-INDEX.md). D-01..D-44 = APPROVED dengan opsi rekomendasi, termasuk **D-10** (diputuskan terpisah Jum 9 Okt ~10:33 WIB: URL Vercel dulu). Approval kedua (Jum 9 Okt ~10:33 WIB, di grup): D-10, 05 P5-26, 09 T9-06 (§10.3). Item yang belum punya rekomendasi dikumpulkan di §10. Sinkronisasi ke 01–06/09 dilakukan Jum 9 Okt ~09:45–10:30 WIB (cadangan sebelum perubahan: `.bak-2026-10-09-pre-approval/`). **Tambahan Jum 9 Okt 2026 ~11:05 WIB:** usulan dari audit Principal Engineer = **D-45..D-59** (§11; cadangan sebelum perubahan: `.bak-2026-10-09-pre-audit/`). **Approval ketiga Jum 9 Okt ~11:05 WIB (Fatih, di grup, §10.4):** D-54, D-57, D-59 APPROVED + PG-2 sandbox DITOLAK + atribusi README + author git = Fatih. **Approval keempat Jum 9 Okt ~11:12 WIB (Fatih, di grup, §10.5):** D-45..D-53, D-55, D-56, D-58 APPROVED dengan rekomendasi (termasuk koreksi yang diterima PE: `meta.server_now_ms`, lot 1 CU, try/catch juga di jalur RM → `PrintIndex`); fallback langsung ke Arbitrum Sepolia; git author + repo terisi; atribusi Grok Bot jadi teks kerja. **T0 = Jum 9 Okt 2026 11:14 WIB** ("go" Fatih). **Hasil go/no-go ~11:36 WIB (PE):** **GO** Robinhood Chain Testnet (`46630`); fallback Arbitrum Sepolia tidak dipicu (§10.5, D-57). Semua D-01..D-59 kini APPROVED. D-01..D-44 tetap APPROVED; usulan yang menyentuh keputusan APPROVED ditandai di §11.1. Disusun awal Kamis 8 Okt 2026, ~21:10 WIB, sebelum build ETHJKT 2026 (Jumat 9 Okt 09:00 → Sabtu 10 Okt 12:00 WIB). Spec saja, bukan kode.

**Sumber (kanonik saja):** `paron-design.md` **(design §x)**, `paron-stack.md` **(stack §x)**, `paron-product-knowledge.md` **(PK §x)**, `paron-gaps.md` **(gaps Gx)**, `open-questions-research.md` **(OQR §x)**, `notes.md`, dan sejak ~21:45 WIB `paron-sitemap.md` **(sitemap §x)** untuk §9. Cross-ref ke dev doc 01 (`01-contract-interfaces.md`): **P-xx** (usulan 01, kini APPROVED), **T-xx** (TBD di 01; sebagian kini APPROVED, lihat §7), **K-xx** (kontradiksi), **§x** (bagian 01).

**Isi:**
- §0 Cara approve
- §1 Top-10 "putuskan malam ini"
- §2 Open questions design §9 (D-01 s.d. D-12)
- §3 Treasury dan fee (D-13)
- §4 `finalizeSeries` (D-14)
- §5 Status indeks dan metode (D-15, D-16)
- §6 Kontradiksi dan PENDING berdampak besar dari 01 (D-17 s.d. D-39) + paket default teknis (D-40)
- §7 Tabel ringkas semua P-01..P-65 / T-01..T-05 → D-xx
- §8 Divergensi dari 01 (perlu update 01 kalau disetujui)
- §9 Gap dari sitemap produk (D-41 s.d. D-44), ditambahkan ~21:45 WIB dari `paron-sitemap.md` §10
- §10 Approval Jum 9 Okt ~09:40 WIB: keputusan tambahan + **Masih PENDING setelah approval**; §10.3 approval kedua ~10:33 WIB (D-10, P5-26, T9-06)
- §10.4 Approval ketiga Jum 9 Okt ~11:05 WIB (D-54, D-57, D-59, PG-2 ditolak, atribusi README, author git)
- §10.5 Approval keempat Jum 9 Okt ~11:12 WIB (D-45..D-53, D-55, D-56, D-58; fallback chain; git author + repo; atribusi) + T0 = 11:14 WIB; hasil go/no-go GO ~11:36 WIB
- §11 Keputusan audit Principal Engineer (D-45 s.d. D-59), ditambahkan Jum 9 Okt ~11:05 WIB; semuanya APPROVED (~11:05 dan ~11:12 WIB)
- §12 Approval kelima Jum 9 Okt 2026 13:30 WIB (Fatih, di grup): D-60..D-63 ("oke 1-4", usulan Product Designer) dan D-64 (footer + teks "not affiliated" dihapus dari produk; daftar never-cut jadi 3 butir)
- §13 Approval keenam Jum 9 Okt 2026 13:35 WIB (Fatih): D-65 (`UtilityBar` tipis APPROVED sebagai pengganti footer)
- §14 Catatan hosting dan D-66 (~14:02 WIB)
- §15 Approval ketujuh 14:40 WIB (D-67..D-74)
- §16 Approval kedelapan ~15:34 WIB (D-75..D-80 dan D-82 APPROVED; D-81 saat itu belum approval, dikonfirmasi di §20)
- §17 Safe (D-83): saat ditulis PENDING; APPROVED di §20. Aturan setelah freeze dibatalkan di §20 (D-90)
- §18 Approval 2026-10-09 16:39 WIB (D-84..D-88, Fatih langsung)
- §19 Hardening RPC (D-89, APPROVED handler)
- §20 Approval 2026-10-09 17:01 WIB (Fatih langsung): D-81 APPROVED, D-83 APPROVED, D-90 membatalkan freeze

---

## 0. Cara approve

Fatih cukup membalas per ID, misalnya:
- `D-03 ok` → rekomendasi diterima.
- `D-03 pilih B` → pilih opsi B dari daftar opsi.
- `D-03 ubah: <isi>` → keputusan lain, tulis singkat.
- `top10 ok` → semua rekomendasi di §1 diterima sekaligus.
- `semua ok kecuali D-07, D-19` → terima semua rekomendasi selain yang disebut.

**Hasil (Jum 9 Okt 2026 ~09:40 WIB):** Fatih menyetujui semua rekomendasi (setara `semua ok`). Aturan di bawah dipertahankan sebagai catatan proses.

Setelah disetujui, status di dokumen ini berubah dari **PENDING** menjadi **APPROVED (tanggal, jam WIB)**, dan item yang menyimpang dari 01 (lihat §8) di-update di 01. Item yang tidak dijawab sampai Jumat 09:00 WIB tetap **PENDING**. Rekomendasinya hanya dipakai sebagai default kerja kalau Fatih menyetujui aturan itu secara eksplisit (mis. `default kerja ok`).

Setiap keputusan berformat: **Pertanyaan**, **Konteks + sumber**, **Opsi**, **Rekomendasi**, **Dampak** (kontrak / indexer / frontend / demo), **Ref 01**, **Status**.

---

## 1. Top-10 "putuskan malam ini"

**Status top-10: semuanya APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih) dengan rekomendasi singkat di tabel.** "Hampir masuk top-10" (D-18, D-31, D-04) juga APPROVED.

Diurutkan berdasarkan seberapa besar item itu memblokir build Jumat (jadwal design §7.3: 09:00–10:30 smoke test + go/no-go; 10:30–12 Registry, ConversionTable, Factory, BondVault, CUToken; 12–16 PrimarySale, RedemptionManager; 16–20 OrderBook, PrintIndex, PanelArbitrator, Ponder; 20–24 deploy + seed).

| # | ID | Keputusan | Rekomendasi singkat | Kenapa memblokir |
|---|---|---|---|---|
| 1 | D-19 | Window series demo vs `CU-JKT-H100-2611` | Series di panggung = `CU-JKT-H100-2610` (window Okt 2026, sudah terbuka); deployment demo boleh `windowStart ≤ now` | Validasi `createSeries` (Fri 10:30), seed, naskah demo |
| 2 | D-20 | Nilai demo di bawah batas protokol | Batas window = parameter deployment immutable (set prod vs set demo) | Constructor `SeriesFactory` + `RedemptionManager` (Fri 10:30) |
| 3 | D-02 | Window bulan kalender (Q2) | Ya, bulan kalender UTC untuk deployment prod; demo mengikuti D-19 | Validasi `createSeries`, penamaan series, wizard S2 |
| 4 | D-24 | Schema KYB provider | Pakai satu schema `ParticipantVerified` dengan `role = 1 (Provider)`; tidak ada schema `ProviderVerified` terpisah | Schema didaftarkan di go/no-go cek 3 (Fri 09:00–10:30) |
| 5 | D-22 | Nama event + field `Trade` | Ikuti daftar stack §4.2 (`RedemptionRequested`, dst.) + `Trade` diperluas | Ponder skeleton sync 1 event (Fri 09:00) dan ABI frontend |
| 6 | D-13 | Treasury + withdraw fee | Treasury = alamat Safe (RH) / `TimelockController` (fallback); fee di-push langsung; tanpa fungsi withdraw | Constructor `PrimarySale` / `OrderBook` (Fri 12–20) |
| 7 | D-14 | Pemilik + syarat `finalizeSeries` | `SeriesFactory.finalizeSeries`, siapa saja, `now ≥ windowEnd + grace` dan 0 request terbuka | Struktur `SeriesFactory`/`BondVault` (Fri 10:30–12) |
| 8 | D-21 | Tujuan dispute bond saat putusan "Delivered" | 100% ke provider; tidak ada fee arbitrator di MVP | `RedemptionManager` (Fri 12–16) |
| 9 | D-29 | Transfer setelah `windowEnd` + REFUNDED pasca-window | Pengecualian untuk RM/OrderBook; refund pasca-window → holder boleh request ulang dalam grace | `CUToken._update` + RM (Fri 10:30–16) |
| 10 | D-17 | Maks level harga order book | 10 per sisi | `OrderBook` (Fri 16–20) |

Hampir masuk top-10: D-18 (rumus invariant bond, untuk test Fri 16–20), D-31 (KYB untuk semua buyer/trader, memengaruhi seed wallet), D-04 (persona verifier, label UI).

---

## 2. Open questions design §9 (Q1–Q12)

### D-01: Proceeds primary sale (Q1)
- **Pertanyaan:** hasil penjualan primer langsung ke provider, atau sebagian di-escrow sampai delivery?
- **Konteks:** desain saat ini = langsung ke provider dikurangi fee 1% (design §2 Flow B). Holder dilindungi bond 1,5×, bukan escrow (design §4.4). Penulis design merekomendasikan tetap langsung (design §9 Q1). PK §6.1 mencatat ini masih open.
- **Opsi:** A) langsung ke provider. B) escrow sebagian (mis. X%) sampai FINALIZED. C) escrow penuh.
- **Rekomendasi:** **A.** Default sudah tidak menguntungkan pada 1,5× (provider kehilangan 0,5p per CU yang default, design §4.4); escrow menambah state + jalur release dan memperlambat "listing semudah pump.fun".
- **Dampak:** kontrak: tidak ada perubahan (01 sudah mengasumsikan A). Indexer/frontend: S5 menampilkan "proceeds" langsung. Demo: provider melihat USDC masuk saat buyer beli.
- **Ref 01:** §6.6, Lampiran B Q1. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (proceeds langsung ke provider).

### D-02: Model window, bulan kalender (Q2)
- **Pertanyaan:** apakah window series wajib bulan kalender penuh yang sejajar dengan futures bulanan?
- **Konteks:** design §9 Q2 masih open; design §10.4 MUST #3 menulis "Series windows are fixed calendar months … resolves open question 2" (gaps G5 sama). PK §4.3 dan §12.3 menyebutnya masih perlu konfirmasi Fatih (01 K-21). Lot helper: 720 CU = 1 H100 untuk bulan 30 hari, 744 untuk 31 hari (design §10.2 G5).
- **Opsi:** A) bulan kalender wajib di semua deployment. B) bulan kalender di prod, window bebas di demo. C) window bebas di semua deployment (UI menyarankan bulan kalender).
- **Rekomendasi:** **B.** Prod: `windowStart` = tanggal 1 jam 00:00 **UTC**, `windowEnd` = tanggal 1 bulan berikutnya 00:00 UTC (UTC karena referensi kontrak bulanan bersifat global; ini usulan, sumber tidak menyebut zona). Demo: ikut D-19. Status "resolved" di §10.4 dianggap rekomendasi, bukan keputusan, sampai Fatih approve.
- **Dampak:** kontrak: flag deployment `enforceCalendarMonth` di `SeriesFactory` (immutable). Indexer: `delivery_window` per print = `YYYY-MM`. Frontend: wizard S2 memilih bulan, bukan tanggal bebas; lot helper 720/744 CU. Demo: lihat D-19.
- **Ref 01:** P-33, K-12, K-21. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi B (prod: bulan kalender UTC; demo ikut D-19).

### D-03: Arbitrator untuk demo (Q3)
- **Pertanyaan:** panel tim (paling cepat) atau stub Kleros/UMA?
- **Konteks:** `PanelArbitrator` = Must; adapter Kleros/UMA = nice-to-have #5 "stub plus docs" (design §3 #9, §7.1). Panel 2-of-3 via tanda tangan atau Safe.
- **Opsi:** A) panel tim saja. B) panel tim + stub Kleros/UMA yang tidak dipakai di demo. C) stub saja.
- **Rekomendasi:** **A** untuk 27 jam; **B** hanya kalau nice-to-have #1–#4 sudah selesai. Interface `IArbitrator` tetap menjaga jalur upgrade di pitch.
- **Dampak:** kontrak: `PanelArbitrator` saja. Frontend: S7 opsional (NICE). Demo: dispute tidak ada di naskah 2:30, jadi panel cukup diuji di Foundry (design §7.1 test "Dispute → both rulings", "Arbitrator timeout").
- **Ref 01:** §6.9, P-50, D-36. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (panel tim 2-of-3 saja).

### D-04: Verifier di demo (Q4)
- **Pertanyaan:** siapa yang menerbitkan attestation provider di demo: multisig tim berlabel "demo verifier" atau persona "third-party auditor" tiruan?
- **Konteks:** di MVP verifier = multisig tim (design §2); "A Safe multisig is the verifier" (design §10.4 #4); "The Safe holds admin, verifier and arbitrator-panel roles" (stack §4.1).
- **Opsi:** A) Safe tim berlabel jujur "Paron demo verifier (team multisig)". B) persona auditor tiruan.
- **Rekomendasi:** **A.** Persona auditor tiruan berisiko terlihat seperti klaim pihak ketiga palsu di depan juri; label jujur + narasi "nanti auditor/firma KYB" (design §2) lebih aman.
- **Dampak:** kontrak: hanya alamat attester di `EASGate.setAttester` / `VERIFIER_ROLE`. Frontend: badge "Verified by Paron demo verifier". Demo: tidak berubah.
- **Ref 01:** §4.1, §6.13. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (label jujur Safe "Paron demo verifier (team multisig)").

### D-05: Seberapa banyak Ornn di panggung (Q5)
- **Pertanyaan:** sebut Ornn di slide hook/narasi saja?
- **Konteks:** rekomendasi design §9 Q5: hanya hook dan slide narasi, dengan footnote, tidak di UI produk kecuali label referensi. Setelah itu design §10.1/§10.5 menetapkan OCPI tidak boleh tampil di app/API/chart tanpa lisensi tertulis.
- **Opsi:** A) slide saja + footnote; UI produk tanpa nama Ornn. B) slide + label di UI.
- **Rekomendasi:** **A** (lebih ketat dari teks Q5, mengikuti §10.1/§10.5). UI hanya menampilkan "Spot reference (synthetic demo data)".
- **Dampak:** kontrak: tidak ada. Frontend: tanpa nama/logo Ornn. Demo: footnote wajib di slide (design §6, §10.5 #6).
- **Ref 01:** §6.11. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A.

### D-06: Harga referensi (Q6) + prioritas `ReferenceFeed`
- **Pertanyaan:** email data@ornn.com untuk lisensi display hackathon, atau kirim referensi sintetis + kutipan di slide (default)? Dan apakah `ReferenceFeed` MVP atau Nice?
- **Konteks:** design §9 Q6 (superseded oleh §10.1 dan §10.5). Email = aksi eksternal, butuh izin Fatih. `ReferenceFeed` = Nice (design §3 #11, §7.1 nice #2, §10.3) tetapi [MVP] di PK §5.8 (01 K-09).
- **Opsi:** A) sintetis + slide, tanpa email. B) kirim email inquiry lisensi (Fatih yang mengirim). Prioritas: (i) Nice, (ii) MVP.
- **Rekomendasi:** **A + (i)**. Tanpa email sebelum Jumat (tidak cukup waktu untuk lisensi tertulis). `ReferenceFeed` dibangun setelah Must selesai; signer = EOA keeper dengan `push` biasa (P-14).
- **Dampak:** kontrak: `ReferenceFeed` bisa terlambat tanpa memblokir apa pun (tidak ada di jalur payout). Frontend: strip referensi S1 memakai label sintetis; kalau feed belum ada, strip hanya menampilkan PrintIndex. Demo: hook S1 "dengan strip referensi" (design §7.4) bergantung pada Nice ini.
- **Ref 01:** §6.11, K-09, P-14, P-57, P-58. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A + (i) (sintetis berlabel; `ReferenceFeed` NICE; `push` biasa).

### D-07: Fokus region (Q7)
- **Pertanyaan:** pertahankan series Jakarta, Batam, Singapura, atau Indonesia saja?
- **Konteks:** seed design §7.1: `CU-JKT-H100-2611`, `CU-BTM-H200-2611`, `CU-SGP-B200-2612`. Penutup demo tentang pipeline kapasitas Indonesia (design §7.4).
- **Opsi:** A) JKT/BTM/SGP. B) Indonesia saja (ganti SGP dengan kota Indonesia).
- **Rekomendasi:** **A.** SGP memberi titik B200 di kurva dan cerita "long-tail SEA provider" (design §6); tidak ada data di sumber tentang provider B200 di kota Indonesia lain.
- **Dampak:** seed dan copy saja (doc 05). Tidak ada dampak kontrak.
- **Ref 01:** —. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (JKT/BTM/SGP).

### D-08: Pembagian tim (Q8)
- **Pertanyaan:** siapa mengerjakan kontrak, frontend, dan pitch/produk?
- **Konteks:** build plan design §7.3 memakai template dev A (kontrak), dev B (frontend), C (produk/pitch). Doc 08 ditunda sampai Fatih memberi komposisi tim.
- **Rekomendasi:** **[TBD]**: butuh nama/jumlah anggota dari Fatih (maks 4 per tim, notes §1).
- **Dampak:** doc 08. **Ref 01:** —. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): tim = **Fatih solo** (sitemap §9; rencana jam per jam di doc 08).

### D-09: Revisi faktor GPU (Q9)
- **Pertanyaan:** adopsi revisi A100 0,60 → 0,45 dan RTX 4090 0,35 → 0,20 (atau tanpa GPU konsumer di MVP)?
- **Konteks:** A100: skor spek 0,40, rasio pasar 0,37–0,54, faktor 0,60 "di atas keduanya". RTX 4090: skor 0,21, pasar 0,135, faktor 0,35 (design §1.1, PK §4.2).
- **Opsi:** A100: A) 0,60, B) 0,45. RTX 4090: A) 0,35, B) 0,20, C) tidak di-listing di MVP.
- **Rekomendasi:** **A100 = 0,45** (di dalam pita spek–pasar). **RTX 4090 = C** (tidak dimasukkan ke `ConversionTable` awal; sesuai positioning institusional, design §0 "institutional and serious").
- **Dampak:** kontrak: nilai awal `ConversionTable` (A100 `4_500`; tanpa entri RTX 4090). Frontend: dropdown GPU wizard tanpa RTX 4090. Pitch: tabel faktor di slide ikut diubah. **Menyimpang dari 01** (01 §1 dan §2.2 masih menulis A100 `6_000` dan RTX4090 `3_500` sebagai nilai awal) → lihat §8.
- **Ref 01:** §1, §2.2, §6.2, P-27. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): A100 = 0,45 (`4_500`); RTX 4090 = C (tidak dimasukkan).

### D-10: Domain dan handle (Q10)
- **Pertanyaan:** daftarkan paron.exchange / paron.markets + handle sebelum Jumat?
- **Konteks:** design §9 Q10: beberapa TLD tampak kosong per 6 Okt (sinyal saja). Ini pembelian (aksi eksternal), bukan kode produk.
- **Rekomendasi:** keputusan dan pembelian sepenuhnya oleh Fatih; tidak ada rekomendasi teknis. Tidak memblokir build (README/deploy bisa memakai URL Vercel).
- **Dampak:** tidak ada ke kontrak/indexer. **Ref 01:** —. **Status:** APPROVED (Jum 9 Okt 2026 ~10:33 WIB, Fatih): pakai **URL Vercel bawaan** untuk demo dan submission sekarang; domain dan handle menyusul setelah hackathon (tidak ada pembelian sebelum submit). API memakai URL bawaan host-nya. **URL terisi Jum 9 Okt ~13:08 WIB (Scout, di grup):** frontend produksi = `https://paron.vercel.app` (Vercel project `paron`, root `web/`, commit `b18b3d4`); domain/handle kustom tetap menyusul.

### D-11: Stablecoin jangka panjang per venue (Q11)
- **Pertanyaan:** settlement jangka panjang: USDC (Arbitrum One) vs USDG (Robinhood Chain)?
- **Konteks:** Robinhood Chain mainnet tidak punya Circle USDC/CCTP; USDG satu-satunya stablecoin yang terdaftar (design §9 Q11, OQR §6). Rekomendasi riset: token settlement per deployment; USDC di Arbitrum One sebagai venue institusional pertama; USDG di Robinhood Chain kalau listing di sana.
- **Opsi:** A) rekomendasi riset. B) USDG saja. C) USDC saja.
- **Rekomendasi:** **A** (keputusan komersial Fatih). Hackathon tetap MockUSDC.
- **Dampak:** kontrak: tidak ada (sudah `settlementToken` di constructor). Pitch: slide roadmap. **Ref 01:** §1, §6.12. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A.

### D-12: Tanya ETHJKT soal pra-kickoff (Q12)
- **Pertanyaan:** kirim pertanyaan yang sudah didraf (OQR §5) ke ETHJKT?
- **Konteks:** draf berbahasa Indonesia ada di OQR §5, belum dikirim; hanya boleh dikirim dengan OK Fatih. Aturan berlaku apa pun jawabannya: **tidak ada deploy apa pun yang berbau Paron ke testnet publik sebelum Jumat 09:00 WIB** (design §11.2).
- **Opsi:** A) tidak dikirim; ikuti tafsiran konservatif. B) Fatih mengirim via Discord/email.
- **Rekomendasi:** **A** (tafsiran konservatif sudah cukup). B boleh kalau Fatih ingin kepastian; pengiriman dilakukan Fatih sendiri.
- **Dampak:** tidak ada ke spec. **Ref 01:** —. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (tidak ada email ke ETHJKT).

---

## 3. Treasury dan fee

### D-13: Identitas treasury dan mekanisme withdraw fee
- **Pertanyaan:** siapa treasury, dan bagaimana fee 1% (primer) dan 0,15% (taker) ditarik?
- **Konteks:** `PrimarySale` "sends fee to treasury", `OrderBook` "taker fee to treasury" (design §3 #6/#7). Tidak ada sumber yang mendefinisikan alamat treasury atau fungsi withdraw; "treasury = Safe" ditandai belum terverifikasi (PK §6.7, §6.8). Safe 2-of-3 memegang admin/verifier/panel (stack §4.1). Di fallback Arbitrum Sepolia tidak ada Safe UI; opsi B = role allowlist + `TimelockController` (design §11.4).
- **Opsi:**
  - A) **Push langsung** ke alamat treasury = Safe (RH Testnet) / `TimelockController` (fallback opsi B) atau Safe via protocol-kit (fallback opsi A). Tanpa fungsi withdraw di kontrak; USDC dipindahkan lewat tx Safe atau proposal timelock biasa.
  - B) Kontrak `Treasury` terpisah dengan `withdraw(to, amount)` ber-role.
  - C) **Pull/akrual**: fee menumpuk di `PrimarySale`/`OrderBook`, lalu `withdrawFees(to)` oleh admin.
- **Rekomendasi:** **A.** Paling sedikit kode dan permukaan serangan; tidak ada saldo fee yang mengendap di kontrak pasar; setiap fee langsung terlihat sebagai transfer di explorer (bagus untuk statement G10). Alamat treasury diganti via Timelock (`setTreasury`). Fee arbitrator: tidak ada di MVP (D-21).
- **Dampak:** kontrak: `PrimarySale`/`OrderBook` hanya punya `treasury` + `setTreasury` (Timelock). Indexer: fee tercatat dari event (`PrimaryBuy.fee`, `Trade.takerFee`) untuk statement. Frontend: tidak ada tombol "withdraw fees". Demo: tidak berubah. README: sebut "fees go to the team multisig".
- **Ref 01:** P-16, K-25, §4.1, §6.6, §6.7. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (push langsung ke Safe/Timelock; tanpa withdraw).

---

## 4. `finalizeSeries`

### D-14: Kepemilikan dan syarat `finalizeSeries`
- **Pertanyaan:** `finalizeSeries(s)` ada di kontrak mana, siapa yang boleh memanggil, dan apa syaratnya?
- **Konteks:** "After `windowEnd`, plus a grace period for open requests, anyone calls `finalizeSeries(s)`. Unredeemed CU are void and token transfers are blocked. The provider's remaining bond … becomes withdrawable" (design §2 Flow E). `withdrawRemaining` hanya oleh provider setelah `finalizeSeries` (design §3 #5). Kontrak pemilik tidak disebut (PK §6.4 catatan; 01 K-24). Keeper memanggilnya (design §2, PK §5.12).
- **Opsi lokasi:** A) `SeriesFactory` (pemilik struct series). B) `RedemptionManager` (tahu request terbuka). C) `BondVault`.
- **Opsi syarat:** (i) hanya `now ≥ windowEnd + grace`. (ii) (i) **dan** `openRequestCount(s) == 0`.
- **Rekomendasi:** **A + (ii)**, dipanggil **siapa saja**. `grace = ackWindow + deliveryWindow + disputeWindow + rulingWindow` series itu (P-11). Efek: `finalized = true`, `BondVault.markFinalized(s)`, emit `SeriesFinalized(s, voidedSupply, bondRemaining)`; lalu provider memanggil `BondVault.withdrawRemaining(s)`.
  - **Kenapa (ii) aman (liveness):** setiap request yang masih terbuka setelah grace selalu bisa ditutup oleh siapa saja: `claimDefault` (REQUESTED/ACKNOWLEDGED lewat deadline), `finalizeRedemption` (DELIVERED lewat dispute window), `resolveNoRuling` (DISPUTED lewat ruling deadline). Keeper menutup itu dulu, lalu memanggil `finalizeSeries`. Jadi bond tidak bisa terkunci selamanya, dan bond tidak bisa ditarik selagi masih ada klaim holder.
- **Dampak:** kontrak: `SeriesFactory.finalizeSeries`, `RedemptionManager.openRequestCount`, `BondVault.markFinalized`. Indexer: event `SeriesFinalized`, `BondWithdrawn`. Frontend: tombol "withdraw remaining bond" di S5 aktif setelah final. Keeper: urutan "tutup request → finalize". Demo: tidak masuk naskah 2:30 (window demo belum habis); ditunjukkan lewat Foundry test "expiry blocks transfers" (design §7.1).
- **Ref 01:** P-11, P-28, P-32, P-38, K-24, §6.3, §6.5. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A + (ii) (`SeriesFactory.finalizeSeries`, siapa saja, grace + 0 request terbuka).

---

## 5. Status indeks dan metode

### D-15: Definisi status `OK` / `THIN` / `DISRUPTED` + parameter demo
- **Pertanyaan:** apa arti tiap status `PrintIndex`, dan apakah `DISRUPTED` masuk MVP?
- **Konteks:** design §10.4 MUST #2: winsorized mean atas print eligible, ambang volume minimum, status `THIN`. Design §10.2 G13: `{OK, THIN, DISRUPTED}` dengan batas carry-forward; G3: "insufficient data" status dengan carry-forward. Stack §4.2: API `status: OK|THIN`. PK §6.6 dan §13 menyebut ketiganya (01 K-03). OCPI memakai hierarki Market Disruption Event: carry-forward, lalu suspensi (design §10.1).
- **Opsi:** A) dua status (OK, THIN). B) tiga status dengan DISRUPTED otomatis (carry-forward terlalu lama) + manual (admin).
- **Rekomendasi:** **B**, dengan definisi:
  - **OK:** dalam `windowLength` terakhir, volume print eligible ≥ `minVolume` **dan** jumlah `entityId` unik ≥ `minParticipants`. `answer` = VWAP baru.
  - **THIN:** syarat OK tidak terpenuhi; `answer` = carry-forward nilai OK terakhir (`lastOkAt` diekspos). Belum pernah OK → `NoData`.
  - **DISRUPTED:** carry-forward lebih lama dari `maxCarryForward`, **atau** admin men-set disrupted (`setDisrupted`, ADMIN langsung). Konsumen harus menganggap `answer` tidak valid.
  - **Parameter demo (usulan baru, sebelumnya T-04 tanpa angka):** `windowLength = 24 jam`, `minVolume = 1 CU`, `minParticipants = 2`, `maxCarryForward = 72 jam`, sehingga satu fill eligible di panggung membuat indeks H100 "OK" dan "PrintIndex ticks" (design §7.4). Parameter prod tetap **[TBD]** dan ditulis di `METHODOLOGY.md`.
- **Dampak:** kontrak: enum 3 nilai, `poke`, `setDisrupted`, `setParams` (Timelock). Indexer/API: `/v1/index/{gpu}` mengembalikan `OK|THIN|DISRUPTED` (memperluas stack §4.2). Frontend: badge status di strip S1. Demo: seed harus menghasilkan minimal satu fill eligible antar dua entity sebelum adegan "PrintIndex ticks". **Catatan:** angka parameter demo adalah tambahan baru (01 hanya menulis T-04 tanpa angka) → §8.
- **Ref 01:** P-54, P-56, T-04, K-03, §6.10. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi B (3 status; demo 24 jam / 1 CU / 2 entity / 72 jam; prod TBD).

### D-16: Winsorization onchain vs offchain
- **Pertanyaan:** VWAP winsorized dihitung di kontrak atau di indexer/API?
- **Konteks:** design §3 #10: `PrintIndex` onchain VWAP (Must) + `latestRoundData()`. Design §10.4 MUST #2: "volume-weighted winsorized mean over eligible prints"; α Paron "published" (G3) tetapi belum ada angkanya. Gas order book sudah jadi risiko build (design §8).
- **Opsi:** A) onchain VWAP rolling + status; winsorized di Ponder `/v1/index` dengan α di `METHODOLOGY.md`. B) winsorization onchain atas ring buffer N print (mis. 32). C) dua-duanya.
- **Rekomendasi:** **A** untuk 27 jam; B sebagai NICE kalau waktu tersisa. Pitch/README harus jujur: "onchain VWAP; winsorized index published by the Paron API under METHODOLOGY.md".
- **Dampak:** kontrak: `PrintIndex` lebih sederhana. Indexer: perhitungan winsorized + α. Frontend: chart S6 memakai API. Demo: tidak berubah.
- **Ref 01:** P-52, P-53, P-55, T-04, §6.10. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (VWAP onchain; winsorized offchain).

---

## 6. Kontradiksi dan PENDING berdampak besar dari 01

### D-17: Maks level harga aktif per sisi (10 vs 20)
- **Konteks:** "≤ 20 active price levels per side; matching loop bounded" (design §3 #7) vs "keep ≤ 10 price levels" (design §10.4 build-plan impact), "≤ 10 levels" (stack §4.1), "batasi ≤10 level harga" (PK §12.1).
- **Opsi:** A) 10. B) 20.
- **Rekomendasi:** **A (10)**, angka yang lebih baru dan lebih hemat gas. `maxFillsPerTx` (T-02) ditetapkan setelah `forge snapshot` Jumat sore.
- **Dampak:** kontrak: `OrderBook.MAX_LEVELS = 10`, error `TooManyPriceLevels`. Frontend: depth S3 maksimal 10 baris per sisi. Demo: cukup.
- **Ref 01:** P-10, T-02, K-01. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (10 level per sisi).

### D-18: Rumus invariant bond (hitung ganda)
- **Konteks:** design §1: `bond[s] ≥ bondPerCU × (circulating + inRedemption)`; design §3 #5: `bond[s] ≥ bondPerCU × (totalSupply + locked)`; stack §4.6 / design §7.1: `(supply + locked)`. CU terkunci dipegang `RedemptionManager` (design §3 #4), jadi sudah termasuk `totalSupply`.
- **Opsi:** A) `bond ≥ bondPerCU × totalSupply` selama series belum final. B) tulis harfiah `totalSupply + locked` (terlalu ketat: hitung ganda, test akan gagal padahal sistem benar). C) `bondPerCU × (totalSupply − lockedInRM) + bondPerCU × lockedInRM` (sama dengan A, lebih bertele-tele).
- **Rekomendasi:** **A**, dengan catatan di test: `locked` sudah termasuk `totalSupply`; invariant tidak berlaku setelah `finalizeSeries` + `withdrawRemaining` (CU void).
- **Dampak:** test invariant Foundry (doc 02). Kontrak: tidak berubah. Pitch: tetap boleh menyebut "bond ≥ bondPerCU × (circulating + in redemption)" karena bermakna sama.
- **Ref 01:** P-36, K-05, §10. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (`bond ≥ bondPerCU × totalSupply`).

### D-19: Window series demo vs `CU-JKT-H100-2611`
- **Konteks:** naskah demo men-forge `CU-JKT-H100-2611` di panggung, lalu buy, trade, redeem 8 CU dan default 10 CU (design §7.4). Simbol `2611` = window Nov 2026 (design §1: "redeemable 1–30 Nov 2026"). Redemption hanya "during the window" (design §2 Flow C), dan `createSeries` memvalidasi "window in the future" (design §3 #3). Build 9–10 Okt, Demo Day 11 Okt (notes §2). Jadi series Nov tidak bisa di-redeem saat demo (01 K-12).
- **Opsi:**
  - A) Series di panggung = **`CU-JKT-H100-2610`** (window Okt 2026 yang sedang berjalan). Deployment demo mengizinkan `windowStart ≤ now` (flag immutable `allowOpenWindow`, hanya demo). Series Nov/Des tetap di seed untuk kurva forward.
  - B) Tetap `CU-JKT-H100-2611`, tetapi deployment demo mengizinkan redeem sebelum `windowStart` (merusak arti window).
  - C) Tetap nama `2611` tetapi window demo = "sekarang s.d. +N hari" (nama menyesatkan).
- **Rekomendasi:** **A.** Nama dan window tetap jujur, dan kontrak prod tidak berubah (flag hanya di deployment demo). Validasi demo: `windowEnd > now + leadTime` menggantikan `windowStart > now`.
- **Dampak:** kontrak: flag deployment `allowOpenWindow` di `SeriesFactory` (baru). Seed (doc 05): series panggung `CU-JKT-H100-2610`, 500 CU @ $3.00, bond $2,250 (angka tetap). Naskah demo dan slide: ganti simbol 2611 → 2610 untuk adegan listing. Frontend: wizard S2 di deployment demo menawarkan bulan berjalan. **Menyimpang dari 01** (01 §6.3 merevert `InvalidWindow` kalau `windowStart ≤ now`) dan dari naskah design §7.4 → §8.
- **Ref 01:** P-33, K-12, K-21, §6.3. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (`CU-JKT-H100-2610` + flag `allowOpenWindow`).

### D-20: Nilai demo di bawah batas protokol
- **Konteks:** demo `ackWindow` 60 dtk, `deliveryWindow` 60 dtk, `disputeWindow` 90 dtk, ruling 120 dtk; batas protokol 1 jam–72 jam, 1 jam–7 hari, 24 jam–7 hari (design §4.2). Timelock 48 jam prod vs 5 menit demo (design §3 #2).
- **Opsi:** A) batas = parameter deployment immutable (set prod di README/METHODOLOGY, set demo di deployment testnet). B) mode demo yang bisa di-toggle admin (berbahaya: admin bisa mengubah aturan). C) batas hard-coded prod; demo pakai `vm.warp` saja (tidak bisa live di testnet).
- **Rekomendasi:** **A.** Set demo: ack 60 dtk–72 jam, delivery 60 dtk–7 hari, dispute 90 dtk–7 hari, `rulingWindow` 120 dtk; timelock 5 menit. README memberi label "demo parameters" dan menyebut nilai prod.
- **Dampak:** kontrak: constructor `SeriesFactory` (bounds) dan `RedemptionManager` (`rulingWindow`). Frontend: tampilkan window aktual per series (countdown). Demo: countdown 60 dtk tetap.
- **Ref 01:** P-07, P-08, K-13, §2.1. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (batas window = parameter deployment).

### D-21: Tujuan dispute bond + fee arbitrator
- **Konteks:** putusan Delivered: "holder's dispute bond → provider" (design §4.1). Model bisnis: "Arbitrator fee from the losing side's dispute bond" (design §5; PK §6.5, §10.1).
- **Opsi:** A) 100% ke provider; tanpa fee arbitrator di MVP. B) split: X% ke arbitrator, sisanya ke provider. C) 100% ke arbitrator.
- **Rekomendasi:** **A** untuk MVP (state machine §4.1 adalah sumber teknis); fee arbitrator dicatat sebagai roadmap/model bisnis. Saat putusan NotDelivered dispute bond dikembalikan ke holder; saat REFUNDED juga dikembalikan.
- **Dampak:** kontrak: `RedemptionManager.onRuling` sederhana. Pitch: tabel fee tetap boleh menyebut fee arbitrator sebagai "later". Demo: tidak berubah.
- **Ref 01:** P-09, K-08, §6.8 (T10–T12). **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (100% ke provider; tanpa fee arbitrator).

### D-22: Nama event + field `Trade`
- **Konteks:** design §10.3: `Trade`, `Redeemed`, `Delivered`, `Defaulted`, `SeriesCreated`. Stack §4.2: `SeriesCreated`, `PrimaryBuy`, `Trade`, `RedemptionRequested`, `Delivered`, `Disputed`, `Defaulted`, `Attested`. `Trade(series, price, qty, cuPrice)` punya dua harga, padahal harga selalu per CU (design §1, §2 Flow B); G1 meminta native GPU type dan harga per jam native di samping harga CU (design §10.2) (01 K-02, K-11).
- **Opsi:** A) daftar stack §4.2 + event tambahan 01 (`Acknowledged`, `Ruled`, `RedemptionFinalized`, `Refunded`, event bond/order/index); `Trade` diperluas dengan `cuPrice` + `nativePrice = cuPrice × factor / 1e4` + entity + `eligible`. B) daftar design §10.3 (`Redeemed`) + `Trade` 4 field.
- **Rekomendasi:** **A.** Daftar stack lebih baru dan lengkap; field tambahan dibutuhkan `/v1/prints` (G1) dan bukti self-match (invariant #3).
- **Dampak:** kontrak: signature event sesuai 01 §6.7/§6.8/§11. Indexer: schema Ponder (doc 03). Frontend: ABI dari `forge inspect`. Demo: `curl /v1/prints` memakai field ini (design §10.5 #1).
- **Ref 01:** P-46, K-02, K-11, §11. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A.

### D-23: Nama gate KYB
- **Konteks:** `ParticipantRegistry.isVerified(to)` (design §10.2 G8, §10.3) vs `IParticipantGate` + `EASGate`/`RegistryGate` (design §3 #13, stack §4.1, go/no-go cek 3 "`EASGate.isVerified`", design §11.3).
- **Opsi:** A) `IParticipantGate`. B) `ParticipantRegistry`.
- **Rekomendasi:** **A** (dipakai di go/no-go dan daftar kontrak; nama "ParticipantRegistry" di §10 dianggap nama lama).
- **Dampak:** nama file/kontrak + ABI. **Ref 01:** K-04, §6.13. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (`IParticipantGate`).

### D-24: Schema KYB provider (`ProviderVerified`)
- **Konteks:** provider butuh attestation `ProviderVerified` (design §2, §3 #1). Daftar schema hanya `ParticipantVerified(bytes32 entityId, uint8 role, bytes2 country, uint64 expiry)`, `CapacityAttested`, `DeliveryReceipt` (stack §4.1). Go/no-go cek 3 mendaftarkan `ParticipantVerified` (design §11.3).
- **Opsi:** A) satu schema `ParticipantVerified`, provider = `role = 1`; label UI "Provider verified". B) schema `ProviderVerified` terpisah (tambah registrasi + gate kedua).
- **Rekomendasi:** **A**, dengan kode role: `1 Provider`, `2 Buyer`, `3 Trader`, `4 MarketMaker` (P-62). Registry provider membaca gate yang sama.
- **Dampak:** kontrak: `ProviderRegistry` memakai `IParticipantGate` (P-24). Go/no-go: satu schema. Seed: attestation role 1 untuk 3 provider. Frontend: badge verified dari `role`.
- **Ref 01:** P-24, P-61, P-62, P-63, K-14. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (`ParticipantVerified` + kode role 1–4).

### D-25: Jumlah series seed (3 vs 4)
- **Konteks:** design §7.1 / PK §11.3: 3 provider, 3 series (`CU-JKT-H100-2611`, `CU-BTM-H200-2611` @ $4.06/CU, `CU-SGP-B200-2612`). Stack §4.4: 3 provider, **4** series bulanan (H100/H200/B200).
- **Opsi:** A) 3 series. B) 4 series.
- **Rekomendasi:** **B**, dan sekaligus menyelesaikan D-19. Seed membuat 3 series forward sesuai design §7.1 (`CU-JKT-H100-2611`, `CU-BTM-H200-2611`, `CU-SGP-B200-2612`); series ke-4 `CU-JKT-H100-2610` di-forge **live** di panggung (dan disiapkan juga oleh seed di deployment latihan/video backup). Totalnya 4 series bulanan H100/H200/B200, sesuai stack §4.4. Detail urutan di doc 05.
- **Dampak:** seed (doc 05), S1 (4–5 baris), chart kurva forward (NICE). Kontrak: tidak ada.
- **Ref 01:** K-20. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi B (3 seed + `2610` live = 4 series).

### D-26: Delivery receipt: EAS vs EIP-712
- **Konteks:** EAS schema `DeliveryReceipt(uint256 reqId, bytes32 receiptHash)` (stack §4.1, design §10.3: NICE). Agent menandatangani EIP-712 receipt berisi data `nvidia-smi`, hash-nya masuk `markDelivered` (stack §4.4 NICE, design §10.2 G7). Demo memakai agent yang "marks delivered with a receipt hash" (design §7.4).
- **Opsi:** A) MVP: kontrak hanya menyimpan `receiptHash` (bytes32); agent mengirim hash JSON usage biasa; EIP-712 signed receipt = NICE; EAS `DeliveryReceipt` = roadmap/NICE terakhir. B) EIP-712 signed receipt di MVP. C) EAS `DeliveryReceipt` di MVP.
- **Rekomendasi:** **A.** Kontrak tidak berubah apa pun pilihannya; format receipt urusan agent + API.
- **Dampak:** kontrak: `markDelivered(reqId, receiptHash)` saja. Agent: hash JSON. Indexer: simpan `receiptHash`. Demo: mock GPU output harus berlabel (stack §4.4).
- **Ref 01:** K-22, §6.8. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (`receiptHash`).

### D-27: `CapacityAttested`: MUST vs NICE
- **Konteks:** MUST (design §10.3 baris Identity: "MUST (participant and capacity)"); NICE/opsional (design §2 "optional", §7.1 nice #1; PK §6.1 mencatat perbedaan).
- **Opsi:** A) NICE: tidak didaftarkan di go/no-go; UI menampilkan kalau ada. B) MUST: didaftarkan + diterbitkan untuk tiap series seed.
- **Rekomendasi:** **A.** Tidak ada kontrak yang membacanya (01 §6.13); kalau waktu ada, verifier menerbitkannya untuk series seed setelah deploy.
- **Dampak:** go/no-go lebih ringan. Frontend: badge "capacity attested" opsional. **Ref 01:** K-19. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (NICE).

### D-28: Kenaikan harga primer vs bond floor
- **Konteks:** `primaryPrice` hanya boleh naik selama sale buka (design §3 #3); `bondPerCU ≥ 1,5 × primaryPrice` (dikunci Fatih); `bondPerCU` immutable.
- **Opsi:** A) tolak kenaikan yang membuat `bondPerCU < 1,5 × newPrice`. B) wajibkan top-up bond saat menaikkan harga. C) floor hanya dicek saat listing.
- **Rekomendasi:** **A** (B butuh fungsi top-up + perubahan `bondPerCU`, terlalu banyak untuk 27 jam; C melanggar keputusan floor yang sudah dikunci).
- **Dampak:** kontrak: `raisePrimaryPrice` revert `BondBelowFloor`. Frontend: S5 menampilkan harga maksimum = `bondPerCU / 1,5`. **Ref 01:** P-30, K-15. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (tolak kenaikan yang melanggar floor).

### D-29: Transfer setelah `windowEnd` + REFUNDED pasca-window
- **Konteks:** "Transfers blocked after `windowEnd`" (design §3 #4). REFUNDED mengembalikan CU ke holder (design §4.1) dan `cancelOrder` mengembalikan escrow (design §3 #7); keduanya bisa terjadi setelah `windowEnd`. CU yang dikembalikan setelah window tidak bisa di-redeem atau dijual, padahal tanpa slash (01 K-16).
- **Opsi transfer:** (i) pengecualian sistem: burn oleh RM, transfer keluar dari RM, transfer keluar dari OrderBook. (ii) tanpa pengecualian (refund/cancel revert).
- **Opsi REFUNDED pasca-window:** A) holder boleh `requestRedemption` ulang untuk CU yang di-refund selama grace (pengecualian window, hanya untuk `reqId` asal). B) CU di-burn dan bond untuk CU itu di-`release` ke provider (holder rugi). C) CU di-burn dan holder dibayar `bondPerCU` (sama dengan slash, melanggar "no slash").
- **Rekomendasi:** **(i) + A.** A menjaga netralitas "no party wins by stalling" (design §4.3): holder tetap bisa menagih delivery, provider tetap bisa deliver; grace (D-14) cukup panjang untuk satu siklus ack/delivery/dispute.
- **Dampak:** kontrak: `CUToken._update` pengecualian; `RedemptionManager` simpan flag `refundedAfterWindow` + izinkan request ulang sampai `windowEnd + grace`. Test: kasus timeout arbitrator setelah `windowEnd`. Demo: tidak terlihat. **Ref 01:** P-34, P-49, K-16, §6.4, §6.8. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): (i) + A (pengecualian transfer; `refundedAfterWindow`).

### D-30: Listing "satu transaksi" (permit)
- **Konteks:** "a single transaction approves USDC and calls `SeriesFactory.createSeries(...)`" (design §2 Flow A step 4); stopwatch < 40 dtk di panggung (design §7.4). ERC-20 `approve` adalah tx terpisah.
- **Opsi:** A) `MockUSDC` dengan EIP-2612 `permit` + `createSeriesWithPermit` (1 tx, 1 tanda tangan off-chain). B) dua tx (approve + create). C) batch wallet (EIP-5792/7702), bergantung wallet.
- **Rekomendasi:** **A**, dengan B sebagai fallback di UI.
- **Dampak:** kontrak: `MockUSDC` mewarisi `ERC20Permit`; `SeriesFactory.createSeriesWithPermit`. Frontend: S2 tanda tangan permit lalu satu tx. Demo: stopwatch lebih aman. **Ref 01:** P-37, K-17. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (permit), B fallback UI.

### D-31: KYB untuk semua buyer dan trader
- **Konteks:** design §10.4 MUST #4: attestation `ParticipantVerified` untuk buyer dan trader, dicek di transfer hook `CUToken` untuk series "institusional", dan dipakai sebagai `entityId` self-match. Diagram PK §6.9: `PrimarySale` dan `OrderBook` cek KYB.
- **Opsi:** A) `PrimarySale.buy` dan `OrderBook.placeOrder` wajib KYB untuk semua series; flag `institutional` hanya memengaruhi transfer P2P. B) KYB hanya di series institusional. C) tanpa KYB di primer.
- **Rekomendasi:** **A.** Self-match berbasis entity hanya bermakna kalau semua trader punya `entityId`. `claimDefault`, `finalizeRedemption`, `resolveNoRuling` tetap **tanpa** KYB (siapa saja, termasuk ponsel juri, design §7.4).
- **Dampak:** seed: semua wallet demo (buyer, buyer wallet ke-2, trader) di-attest; buyer wallet ke-2 berbagi entity dengan buyer, trader beda entity (agar fill di demo lolos self-match). Frontend: pesan "verify first". **Ref 01:** P-42, P-45, §6.6, §6.7. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A.

### D-32: Cakupan dan pemegang pause
- **Konteks:** struct series immutable kecuali `primaryPrice` dan `pause` (design §3 #3); pemegang role tidak disebut (PK §6.7).
- **Opsi:** A) `PAUSER_ROLE` = Safe; pause hanya memblokir `buy` + order baru. B) provider juga boleh pause sale miliknya. C) pause memblokir semua termasuk redemption.
- **Rekomendasi:** **A** (+ B opsional kalau mudah). Jangan pernah C: perlindungan holder (redemption, default, dispute, finalize, withdraw, cancel) tidak boleh bisa dimatikan admin (design §4.3, "No admin" di demo §7.4).
- **Dampak:** kontrak: `pauseSeries`/`unpauseSeries`. **Ref 01:** P-13, P-31, §6.3. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (Safe `PAUSER_ROLE`; pause provider sendiri **tidak** di MVP).

### D-33: `declineAndPay` + counter reputasi
- **Konteks:** "provider can also call `declineAndPay(reqId)` → DEFAULTED voluntarily (graceful, smaller reputation hit)" (design §4.1); counter yang disebut hanya `deliveredCU`, `defaultedCU`, `disputesLost` (design §3 #1).
- **Opsi:** A) boleh dari REQUESTED dan ACKNOWLEDGED; counter terpisah `voluntaryDefaultedCU` + `strikes` hanya untuk default paksa. B) hanya dari REQUESTED; masuk `defaultedCU` dengan flag di event.
- **Rekomendasi:** **A.**
- **Dampak:** kontrak: `ProviderRegistry` + 2 counter. Frontend: S3/S1 menampilkan "delivered / defaulted / declined". **Ref 01:** P-25, P-48, §6.1, §6.8. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A.

### D-34: Rumus coverage ratio
- **Konteks:** `bondPerCU ÷ (reference × factor)` (design §4.4); glosarium: bond dibanding kewajiban CU (PK §13). Satuan tidak konsisten kalau referensi = harga per jam H100 (= per CU) (01 K-10).
- **Opsi:** A) referensi dinyatakan per CU (H100-equivalent) → `coverage = bondPerCU ÷ referencePerCU`. B) referensi per jam GPU native → `coverage = bondPerCU ÷ (referenceNative ÷ factor)`. C) harfiah design.
- **Rekomendasi:** **A**: `ReferenceFeed` menyimpan nilai per jam H100-equivalent (P-58), jadi coverage = `bondPerCU ÷ reference`. Rumus ini ditulis di `METHODOLOGY.md`.
- **Dampak:** frontend/API saja (coverage tidak dihitung onchain). **Ref 01:** P-58, P-59, K-10. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (`bondPerCU ÷ reference`).

### D-35: Perilaku self-match + definisi eligible
- **Konteks:** `OrderBook` menolak self-trade dengan `SelfMatch()` (design §10.5 #5); flag `eligible` per print (design §10.4 #2).
- **Opsi:** A) revert seluruh tx `SelfMatch()`. B) lewati order resting milik entity sama (gaya CME, cancel resting).
- **Rekomendasi:** **A** (sesuai teks demo integrity callout). `eligible = makerEntity ≠ 0 ∧ takerEntity ≠ 0 ∧ makerEntity ≠ takerEntity`.
- **Dampak:** kontrak `OrderBook`; test invariant #3/#4. Demo: callout self-trade menampilkan revert. **Ref 01:** P-44, P-45, §6.7. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (revert `SelfMatch()`).

### D-36: Mode putusan panel
- **Konteks:** "`rule(reqId, outcome)` from an allowlisted panel (2-of-3 signatures, or a Safe)" (design §3 #9); di fallback "PanelArbitrator already takes 2-of-3 signatures" (design §11.4).
- **Opsi:** A) EIP-712 `ruleWithSignatures` (2-of-3) + mode Safe `rule`. B) hanya Safe. C) voting onchain per anggota.
- **Rekomendasi:** **A** (bekerja di kedua chain; Safe UI hanya ada di RH Testnet). Ganti panel tidak memengaruhi dispute yang sudah terbuka.
- **Dampak:** kontrak `PanelArbitrator`; S7 (NICE). **Ref 01:** P-50, P-51, §6.9. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A.

### D-37: Custody dispute bond + ruling deadline
- **Konteks:** dispute bond 5% min $5 (design §4.2); ruling deadline 7 hari / 120 dtk tanpa batas (design §4.2).
- **Opsi:** A) dispute bond di-escrow di `RedemptionManager`; `rulingWindow` immutable per deployment. B) dispute bond di `BondVault`; ruling deadline per series.
- **Rekomendasi:** **A** (bond provider di `BondVault` tetap murni kolateral; invariant lebih sederhana).
- **Dampak:** kontrak `RedemptionManager`. **Ref 01:** P-07, P-41, §6.5, §6.8. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (dispute bond di RM).

### D-38: Mekanisme lock CU saat request
- **Konteks:** CU "locked, not burned" dan dipegang `RedemptionManager` (design §2 Flow C, §3 #4).
- **Opsi:** A) `CUToken.lockFrom(holder, amount)` khusus RM, tanpa allowance (1 tx). B) holder `approve` dulu (2 tx).
- **Rekomendasi:** **A** (modal Redeem di S4 cukup satu tx; penting untuk timing demo).
- **Dampak:** kontrak `CUToken`/RM. **Ref 01:** P-17, §6.4. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (`lockFrom`).

### D-39: `leadTime` primary sale
- **Konteks:** `PrimarySale` tutup di `windowEnd − leadTime` (design §3 #6); nilai tidak disebut.
- **Opsi:** A) prod 24 jam, demo 0. B) prod = `ackWindow + deliveryWindow` series. C) 0 di semua deployment.
- **Rekomendasi:** **A** sebagai parameter deployment (sama dengan saran awal 01 T-03). Tujuannya pembeli tidak membeli CU yang praktis tidak bisa lagi di-redeem.
- **Dampak:** `SeriesFactory.isSaleOpen`. **Ref 01:** T-03. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (prod 24 jam, demo 0).

### D-40: Paket default teknis (sisa PENDING/TBD dari 01)
- **Pertanyaan:** terima semua default teknis kecil dari 01 yang tidak punya D-xx sendiri (tabel §7, kolom "D-40")?
- **Konteks:** item ini tidak disebut sumber kanonik dan tidak mengubah perilaku produk yang terlihat juri; dibutuhkan supaya kode Jumat konsisten.
- **Opsi:** A) terima paket. B) bahas per item.
- **Rekomendasi:** **A.** Dua angka baru (bukan dari 01) diusulkan di sini: batas fee T-01 (`primaryFeeBps ≤ 500`, `takerFeeBps ≤ 100`) dan faucet T-05 (5.000 mUSDC per drip, cooldown 1 jam).
- **Dampak:** kontrak saja (konvensi, nama, wiring). **Ref 01:** lihat §7. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (paket penuh, termasuk T-01 batas fee dan T-05 faucet; P-65 diganti prediksi alamat CREATE per 04 P4-13, lihat §8 V-8).

---

## 7. Tabel ringkas: semua P-01..P-65 dan T-01..T-05

Supaya tidak ada yang hilang. "Rekomendasi" = sama dengan 01 kecuali ditandai **(≠01)**.

**Status tabel:** semua baris dengan rekomendasi = **APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih)** lewat D-xx di kolom kanan, dan sudah diterapkan di 01 (Lampiran A). Pengecualian: **T-02** tetap TBD (angka menunggu `forge snapshot`) dan **T-04 prod** tetap TBD (demo APPROVED). Baris P-65 diganti oleh V-8.

| ID 01 | Topik | Rekomendasi (= keputusan) | D-xx |
|---|---|---|---|
| P-01 | Pembulatan | Bayar ke protokol/provider: ke atas; payout: ke bawah | D-40 |
| P-02 | Persen dalam bps | Ya; min dispute bond `5_000_000` | D-40 |
| P-03 | Tipe waktu | `uint64` detik | D-40 |
| P-04 | ID mulai 1 | Ya | D-40 |
| P-05 | ID model GPU | `keccak256("H100-SXM-80GB")` dst. | D-40 |
| P-06 | Region | `bytes2 country` + `uint8 continent` | D-40 |
| P-07 | Ruling deadline | Immutable per deployment di RM | D-20, D-37 |
| P-08 | Batas window | Parameter deployment (prod vs demo) | D-20 |
| P-09 | Fee arbitrator | Tidak ada di MVP | D-21 |
| P-10 | Level harga | 10 | D-17 |
| P-11 | Grace | Jumlah 4 window | D-14 |
| P-12 | Daftar aksi ADMIN | Status provider, disrupted manual | D-40 |
| P-13 | Pemegang pause | Safe (`PAUSER_ROLE`) | D-32 |
| P-14 | Signer ReferenceFeed | EOA keeper, `push` biasa untuk MVP | D-06 |
| P-15 | Minter MockUSDC | Deployer/seed, dicabut setelah seed | D-40 |
| P-16 | Treasury | Safe / Timelock, push, tanpa withdraw | D-13 |
| P-17 | Lock CU | `lockFrom` khusus RM | D-38 |
| P-18 | `onDisputeOpened` | Ya | D-40 |
| P-19 | Pencatat PrintIndex | OrderBook / RM saja | D-40 |
| P-20 | `ProviderStatus.None` | Ya | D-40 |
| P-21 | DEFAULTABLE turunan | Ya, via `stateOf()` | D-40 |
| P-22 | Print PRIMARY | Diindeks, tidak masuk VWAP | D-40 |
| P-23 | Input `gpuHours` | Ya | D-40 |
| P-24 | KYB provider via gate | Ya, `role = 1` | D-24 |
| P-25 | Counter reputasi | `voluntaryDefaultedCU` + `strikes` | D-33 |
| P-26 | `setStatus` | ADMIN langsung; Suspended/Banned hanya blokir listing baru | D-40 |
| P-27 | `removeGpuModel` | Ada (Timelock); RTX 4090 tidak dimasukkan sejak awal | D-09 |
| P-28 | Lokasi `finalizeSeries` | `SeriesFactory` | D-14 |
| P-29 | Salt clone | `keccak256(seriesId)` | D-40 |
| P-30 | Harga vs floor | Tolak kenaikan yang melanggar floor | D-28 |
| P-31 | Cakupan pause | Hanya buy + order baru | D-32 |
| P-32 | Syarat finalize | Grace + 0 request terbuka | D-14 |
| P-33 | Window bulanan + demo | Prod bulan kalender UTC; demo `allowOpenWindow` **(≠01: flag baru)** | D-02, D-19 |
| P-34 | Pengecualian transfer | Ya (RM, OrderBook) | D-29 |
| P-35 | Nama token | `"Paron CU " + symbol` | D-40 |
| P-36 | Invariant operasional | `bond ≥ bondPerCU × totalSupply` | D-18 |
| P-37 | Permit | Ya | D-30 |
| P-38 | Release/slash pasca-final | Ditolak | D-14 |
| P-39 | `reqId` di event bond | Ya | D-40 |
| P-40 | Tanpa sweep | Ya | D-40 |
| P-41 | Custody dispute bond | Di RM | D-37 |
| P-42 | KYB semua buyer/trader | Ya | D-31 |
| P-43 | Kaki fee taker | Beli: notional + fee; jual: notional − fee | D-40 |
| P-44 | Self-match | Revert `SelfMatch()` | D-35 |
| P-45 | Eligible | Dua entity non-0 dan berbeda | D-35 |
| P-46 | Field `Trade` | Diperluas | D-22 |
| P-47 | Nama fungsi | `finalizeRedemption`, `resolveNoRuling` | D-40 |
| P-48 | `declineAndPay` | Dari REQUESTED dan ACKNOWLEDGED | D-33 |
| P-49 | REFUNDED pasca-window | Opsi A: request ulang dalam grace **(≠01: 01 belum memilih; butuh state baru)** | D-29 |
| P-50 | Mode panel | EIP-712 2-of-3 + Safe; pengumpulan tanda tangan lewat paket yang dibagikan (D-43) | D-36, D-43 |
| P-51 | Ganti panel | Tidak memengaruhi dispute terbuka | D-36 |
| P-52 | Winsorization | Offchain (Ponder) untuk MVP | D-16 |
| P-53 | `decimals()` indeks | 6 | D-16 |
| P-54 | Disrupted manual | ADMIN | D-15 |
| P-55 | AggregatorV3 | `latestRoundData(gpuModel)` + adapter opsional | D-16 |
| P-56 | Definisi status | Lihat D-15 | D-15 |
| P-57 | Nama feed | `ReferenceFeed` implements `IReferenceFeed` | D-06 |
| P-58 | Unit referensi | Per jam H100-equivalent | D-34 |
| P-59 | Rumus coverage | `bondPerCU ÷ reference` | D-34 |
| P-60 | Nama MockUSDC | `"Mock USDC"` / `"mUSDC"` | D-40 |
| P-61 | `participantOf` | Ya | D-24 |
| P-62 | Kode role | 1 Provider, 2 Buyer, 3 Trader, 4 MarketMaker | D-24 |
| P-63 | Lookup attestation | `linkAttestation(uid)` | D-24 |
| P-64 | Ganti gate pasca-deploy | `setGate` via Timelock di registry/PrimarySale/OrderBook; clone `CUToken` menyimpan gate saat `initialize` | D-40 |
| P-65 | Wiring melingkar | ~~Alamat CREATE2 → constructor immutable~~ → prediksi alamat CREATE dari nonce deployer + constructor immutable; alternatif `wire()` (04 P4-13, §8 V-8) | D-40 |
| T-01 | Batas atas fee | `primaryFeeBps ≤ 500`, `takerFeeBps ≤ 100` **(≠01: angka baru)** | D-40 |
| T-02 | `maxFillsPerTx` | Tetap TBD sampai `forge snapshot` Jumat | D-17 |
| T-03 | `leadTime` | Prod 24 jam, demo 0 | D-39 |
| T-04 | Parameter PrintIndex | Demo: 24 jam / 1 CU / 2 entity / 72 jam **(≠01: angka baru)**; prod TBD | D-15 |
| T-05 | Faucet MockUSDC | 5.000 mUSDC per drip, cooldown 1 jam **(≠01: angka baru)** | D-40 |

Kontradiksi 01 §12 → D-xx: K-01 → D-17 · K-02 → D-22 · K-03 → D-15 · K-04 → D-23 · K-05 → D-18 · K-06 → ikut design §4.1 (sudah di 01, tidak perlu keputusan) · K-07 → D-40 (pembacaan 01: ACKNOWLEDGED → DEFAULTABLE) · K-08 → D-21 · K-09 → D-06 · K-10 → D-34 · K-11 → D-22 · K-12 → D-19 · K-13 → D-20 · K-14 → D-24 · K-15 → D-28 · K-16 → D-29 · K-17 → D-30 · K-18 → tidak perlu keputusan (gaps.md basi; pakai design §10/§11) · K-19 → D-27 · K-20 → D-25 · K-21 → D-02 · K-22 → D-26 · K-23 → tidak perlu keputusan · K-24 → D-14 · K-25 → D-13.

Item terbuka sitemap §10 → D-xx (ditambahkan ~21:45 WIB): S-1 → **D-41** · S-2 → **D-42** · S-3 → **D-43** · S-4 → tidak perlu D baru (design §11.4 opsi B menghindarinya; terkait D-36) · S-5 → **D-44** · S-6 (endpoint tambahan) → tambahan 03, bukan keputusan · S-7 (getter allowlist arbitrator, `IndexParams`, parameter) → tambahan 01, bukan keputusan (06 P6-09/P6-10; **diterapkan** di 01 §6.3/§6.8/§6.10 Jum 9 Okt) · S-8 (tab leverage) → **APPROVED** tab "Coming soon" (roadmap), §10.1 · S-9 (subdomain) → D-10 · S-10, S-11 → ROADMAP.

---

## 8. Divergensi dari 01 (update 01 kalau disetujui)

**Status: semua V-1..V-8 DITERAPKAN di 01 (Jum 9 Okt 2026 ~09:45–10:30 WIB)** setelah approval. Lihat 01 §0.1 (log sinkronisasi).

| # | D-xx | Yang berbeda | Bagian 01 yang perlu diubah |
|---|---|---|---|
| V-1 | D-19 (+ D-02) | Flag deployment baru `allowOpenWindow` (demo) dan `enforceCalendarMonth` (prod). Di demo, validasi menjadi `windowEnd > now + leadTime`; 01 saat ini merevert `InvalidWindow` jika `windowStart ≤ now` | 01 §6.3 (state `SeriesFactory`, baris `createSeries`, paragraf "Model window"), §2.1 catatan |
| V-2 | D-19 | Series di panggung `CU-JKT-H100-2610` (bukan `2611` seperti design §7.4). Bukan isi 01, tetapi 01 §2.3 mengutip `CU-JKT-H100-2611` sebagai angka demo | 01 §2.3; naskah demo dan doc 05 |
| V-3 | D-09 | Nilai awal `ConversionTable`: A100 `4_500` (bukan `6_000`), RTX 4090 tidak dimasukkan (bukan `3_500`) | 01 §1 (baris faktor), §2.2 (faktor awal) |
| V-4 | D-29 | REFUNDED pasca-window: holder boleh request ulang sampai `windowEnd + grace` (state baru `refundedAfterWindow`; pengecualian di `requestRedemption`). 01 hanya mendaftar opsi | 01 §6.8.1 (`requestRedemption` guard), §6.8.2 catatan REFUNDED, P-49 |
| V-5 | D-15 | Angka parameter demo PrintIndex (24 jam / 1 CU / 2 entity / 72 jam); 01 hanya T-04 | 01 §2.2, §6.10 |
| V-6 | D-40 | Angka batas fee (T-01) dan faucet (T-05); 01 hanya TBD | 01 §2.2, §6.6, §6.7, §6.12 |
| V-7 | D-25 | Total 4 series: 3 forward dari seed + `2610` di-forge live | Tidak ada di 01 (doc 05) |
| V-8 | D-40 (P-65) | Wiring: prediksi alamat CREATE dari nonce deployer menggantikan CREATE2 (04 X4-1 / P4-13), karena initcode CREATE2 memuat argumen constructor sehingga siklus tidak bisa dipecahkan | 01 §9 (diterapkan) |

Semua rekomendasi lain **konsisten** dengan asumsi 01. Divergensi lintas dokumen lain yang ikut diterapkan ke 01 saat sinkronisasi: 03 X-1, X-2, X-4, X-8, X-9, X-10; 05 X-6, X-7; 02 X2-1; 04 X4-1; 06 X6-11 (rincian di 01 §0.1).

D-41..D-44 (§9): rekomendasinya **tidak** mengubah 01. Opsi alternatif yang akan mengubah 01 kalau dipilih: D-43 opsi C (`vote` di `PanelArbitrator`, 01 §6.9) dan D-44 opsi A (`setEncryptionKey` di `ProviderRegistry`, 01 §6.1). D-41 opsi B dan D-44 opsi B menambah schema EAS (04 §7.3 `schemas`), bukan kontrak.

---

## 9. Gap dari sitemap produk (D-41 s.d. D-44)

Ditambahkan Kamis 8 Okt 2026, ~21:45 WIB, dari `paron-sitemap.md` **(sitemap §x)** §10 "Item terbuka" (S-1, S-2, S-3, S-5). Sitemap §1 menetapkan prinsip "setiap aksi setiap aktor punya UI" dan §8 checklist anti-mock, jadi keempat gap ini memblokir halaman yang ditandai MVP-27h. Format sama dengan item lain; cross-ref memakai ID dev doc 01/03/04/05/06.

### D-41: Tempat penyimpanan pengajuan KYB
- **Pertanyaan:** di mana data pengajuan KYB (entitas, negara, peran, status) disimpan supaya `/onboarding/kyb` dan antrian `/verifier` bisa jalan dari UI?
- **Konteks:** "KYB done offchain by a verifier" (design §2, dikutip sitemap §4.2 `/onboarding/kyb`). Sitemap S-1: penyimpanan pengajuan = [TBD]; usulan sitemap "tabel offchain sederhana di API, atau JSON terenkripsi di IPFS + hash". 03 tidak punya endpoint tulis (API Ponder/Hono hanya baca, 03 §3); Ponder sudah mengindeks EAS `Attested`/`Revoked` difilter schema (03 H36, T `participant`). Sitemap §8 mewajibkan juri bisa "verifier menyetujui live di `/verifier/applications/[id]`". Attestation `ParticipantVerified` sendiri tetap onchain (D-24); yang dibahas di sini hanya **pengajuan** sebelum attestation.
- **Opsi:**
  - A) Tabel tulis kecil di service API (Postgres yang sama dengan Ponder, skema terpisah) + endpoint `POST /v1/kyb/applications` bertanda tangan wallet (EIP-712) dan `GET` untuk verifier.
  - B) Pengajuan sebagai **self-attestation EAS**: pemohon meng-attest dirinya sendiri dengan schema baru `KybApplication(bytes32 entityId, uint8 role, bytes2 country, bytes32 dataHash)`; Ponder mengindeksnya (handler H36 diperluas); verifier menyetujui dengan menerbitkan `ParticipantVerified` ber-`refUID` = UID pengajuan. Detail entitas (nama, dokumen) tetap offchain; hanya hash onchain.
  - C) JSON terenkripsi di IPFS + hash di event/attestation (B + IPFS).
  - D) Tanpa alur pengajuan di MVP: verifier menerbitkan manual dari `/verifier/attestations/new` (fallback sitemap §4.7); pemohon hanya melihat status.
- **Rekomendasi:** **B** untuk MVP, dengan **D** sebagai cadangan kalau schema tambahan tidak sempat. Alasan: tanpa backend tulis baru (03 tetap read-only), bekerja di kedua chain (EAS self-deploy di RH, existing di Arbitrum Sepolia), setiap langkah adalah tx asli yang terlihat di explorer (anti-mock), dan Ponder sudah punya handler `Attested`. Data pribadi tidak pernah onchain: field yang di-attest hanya kode role, negara ISO-2, dan hash. Status "Ditolak" = NICE (attestation `KybDecision` oleh verifier; ditunda ke S3, tidak dibangun di 27 jam); di MVP status hanya "Pending" / "Approved" / "Expired" / "Revoked".
- **Dampak:** kontrak Paron: tidak ada (gate tetap membaca `ParticipantVerified`). EAS: satu schema tambahan didaftarkan saat deploy (04 DP-2 / go/no-go cek 3 tetap hanya butuh `ParticipantVerified`; schema pengajuan menyusul sebelum seed). Indexer: H36 memfilter dua schema; tabel `kyb_application` + endpoint baca `GET /v1/kyb/applications?status=` (tambahan 03, sitemap S-6). Frontend: `/onboarding/kyb` (tombol "Submit application" = `EAS.attest` oleh pemohon), `/verifier`, `/verifier/applications/[id]` ("Approve" = `EAS.attest` `ParticipantVerified` dengan `refUID`); 06 §1.4 M-KYB perlu tautan ke `/onboarding/kyb` (sekarang menunjuk README). Demo: wallet juri bisa diverifikasi live (sitemap §8); `W-JUDGE` tetap **tanpa** KYB untuk adegan claim default (05 §1, D-31).
- **Ref:** 01 §6.13 (gate), P-61..P-63; 03 H36, E13, P3-35; 04 DP-2, §7.3 `schemas`; 05 A-3/A-4, P5-25; 06 §1.4, P6-05; sitemap §4.2, §4.7, S-1. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi B (self-attestation `KybApplication`), D cadangan; build solo mengerjakan D dulu (sitemap §9.1 S1).

### D-42: Kendali kill switch agent dari UI
- **Pertanyaan:** bagaimana `/provider/agent` menyalakan/mematikan auto-ack agent provider dari UI, padahal agent adalah proses Node terpisah?
- **Konteks:** design §7.1: agent "auto-acknowledges and marks delivered, with a kill switch for the default demo"; naskah: "Flip the agent's kill switch on the projector" (design §7.4). Saat ini kill switch = env `PROVIDER_AGENT_KILL_SWITCH` / jendela agent (04 §4.6; 05 §2.4 laptop samping "S5 + jendela agent"; 06 §6 belum punya kontrol agent; modal Ack/Deliver di sana hanya untuk provider manual dan fallback). Sitemap §4.5 `/provider/agent` meminta toggle di UI; S-2: kanal UI → agent = [TBD], usulan "endpoint kecil di agent (`GET/POST /agent/state`) yang dilindungi tanda tangan wallet provider". Agent memegang key `W-P-JKT` dan jalan di laptop (04 §4.6).
- **Opsi:**
  - A) Endpoint kontrol lokal di agent (bind `127.0.0.1`), perintah = pesan EIP-712 `AgentCommand{provider, autoAck, nonce, expiry}` ditandatangani wallet provider di UI; agent memverifikasi signer == alamat provider + nonce; `GET` mengembalikan status (online, autoAck, tx terakhir).
  - B) Sama dengan A tetapi agent di-hosting publik (HTTPS) bersama indexer.
  - C) Kanal lewat API (agent mem-poll perintah dari service API) — butuh backend tulis.
  - D) Flag onchain (agent membaca nilai di kontrak) — menambah state kontrak untuk urusan offchain.
  - E) Tetap di jendela agent; UI hanya menampilkan status turunan dari chain (latensi `Acknowledged` terakhir).
- **Rekomendasi:** **A**, dengan **E** sebagai fallback fisik (env / Ctrl-C di jendela agent, 04 §4.6, 05 §2.4); kalau agent sama sekali tidak ack, tetap berlaku 05 §4.8 level 3 (Ack manual di S5). Alasan: tanpa backend dan tanpa perubahan kontrak; S5 di laptop samping berjalan di mesin yang sama dengan agent (05 §2.4), jadi UI bisa memanggil `http://127.0.0.1:<port>`; perintah bertanda tangan menjaga agar halaman lain tidak bisa mematikan agent. Status untuk penonton lain (juri di perangkat lain) diturunkan dari chain: "last ack {n}s after request". Perilaku browser untuk panggilan dari halaman HTTPS ke `http://127.0.0.1` (mixed content / Private Network Access) belum diuji → uji Jumat (doc 08 blok S1); kalau gagal, pakai E (fallback yang sudah disetujui).
- **Dampak:** kontrak: tidak ada. Agent: server HTTP kecil + verifikasi EIP-712 (domain stack §4.1 `{name:"Paron", version:"1", chainId, verifyingContract}` dengan `verifyingContract` = `ProviderRegistry` (APPROVED bersama D-42)) + state `autoAck` di memori (default dari `PROVIDER_AGENT_KILL_SWITCH`). 04 §4.6: env baru `PROVIDER_AGENT_HTTP_PORT`, `PROVIDER_AGENT_ALLOWED_ORIGIN`; 04 §4.5 web: `NEXT_PUBLIC_AGENT_URL` (opsional). Indexer: tidak ada. Frontend: `/provider/agent` toggle + status (06 §6 perlu sub-view baru "Agent"). Demo: kill switch ditekan di S5 pada proyektor/laptop samping (adegan ≈1:10, 05 §2.3); checklist T−60 "kill switch off" dicek di UI (05 §4.7).
- **Ref:** 04 §4.6 `PROVIDER_AGENT_KILL_SWITCH`; 05 §2.3, §2.4, §4.7, §4.8; 06 §6, §17; sitemap §4.5 `/provider/agent`, S-2. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (endpoint lokal + EIP-712 `AgentCommand`), E fallback.

### D-43: Mengumpulkan tanda tangan panel 2-of-3 tanpa backend
- **Pertanyaan:** bagaimana dua anggota panel menggabungkan tanda tangan EIP-712 untuk `ruleWithSignatures` dari UI, tanpa server penyimpan tanda tangan?
- **Konteks:** 01 P-50 / D-36: mode panel = EIP-712 `ruleWithSignatures(reqId, outcome, signatures[])` (2-of-3) + mode Safe `rule`. Error terkait: `InsufficientSignatures(got, need)`, `DuplicateSigner`, `NotPanelMember`, `RulingDeadlinePassed` (01 §6.9). Safe tx-service ada di RH Testnet, tidak ada di Arbitrum Sepolia (OQR §4). Sitemap §2.2 dan S-3: cara mengumpulkan = [TBD]; usulan "paket tanda tangan copy-paste, atau mode Safe (`threshold == 1` + Safe sebagai anggota)". Fase 4 seed memakai dua tanda tangan offchain + relayer (05 D-04a).
- **Opsi:**
  - A) **Paket tanda tangan yang bisa dibagikan:** anggota 1 menandatangani `Ruling{reqId, outcome, rulingDeadline}` di `/arbiter/cases/[id]`; UI membuat tautan dengan paket di **fragment URL** (`#sig=…`, tidak terkirim ke server) + tombol "Copy package"; anggota 2 membuka tautan, menambah tanda tangannya, lalu siapa saja menekan "Submit ruling" (`ruleWithSignatures`).
  - B) localStorage: tanda tangan disimpan di browser yang sama. Hanya berguna kalau anggota memakai perangkat yang sama, jadi bukan multi-pihak sungguhan.
  - C) Proposal-vote onchain: fungsi baru `vote(reqId, outcome)` per anggota, eksekusi otomatis saat threshold tercapai (menambah fungsi + state di `PanelArbitrator`, 07 D-36 opsi C).
  - D) Mode Safe: Safe 2-of-3 sebagai satu-satunya anggota panel (threshold 1); tanda tangan dikumpulkan Safe tx-service (hanya RH).
- **Rekomendasi:** **A** sebagai jalur utama (cocok dengan 01 P-50 tanpa perubahan kontrak, berjalan di kedua chain, tanpa backend), **D** sebagai mode kedua di RH bila panel memakai Safe, **B** hanya sebagai cache lokal agar paket tidak hilang saat reload (bukan mekanisme pengumpulan). **C** ditolak untuk 27 jam (mengubah 01 §6.9 dan menambah 2 tx per putusan). Paket = JSON ringkas `{chainId, arbitrator, reqId, outcome, rulingDeadline, signatures[]}`; UI memverifikasi setiap tanda tangan (recover signer ∈ panel, tidak duplikat) sebelum tombol Submit aktif.
- **Dampak:** kontrak: tidak ada (01 §6.9 tetap). Indexer: E17 `signers` diisi dari event `RulingSubmitted` (03 E17); tanda tangan yang belum disubmit **tidak** terlihat di indexer (konsekuensi tanpa backend), jadi kolom "signatures collected x/2" di `/arbiter` hanya akurat untuk paket yang sedang dibuka. Frontend: `/arbiter/cases/[id]` (06 §8.2 S7) tombol "Sign: Delivered/Not delivered", "Copy package", "Open shared package", "Submit ruling". Demo: tidak ada di naskah 2:30; satu kasus diputus dari UI di deployment latihan untuk memenuhi anti-mock (sitemap §9 Tier 1, 05 fase 4 D-04a).
- **Ref:** 01 P-50, P-51, §6.9; 03 E17; 05 §3.6 D-04a/b; 06 §8.2; 07 D-36; sitemap §2.2, §4.6, S-3 (S-4 untuk Safe admin di Arbitrum Sepolia tidak butuh D baru: opsi B design §11.4 menghindarinya). **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi A (paket di fragment URL), D mode kedua di RH, B cache lokal.

### D-44: Tempat public key enkripsi untuk detail akses redemption
- **Pertanyaan:** di mana provider mempublikasikan public key yang dipakai holder untuk mengenkripsi detail akses (`deliveryRef`)?
- **Konteks:** PK §6.2: "`deliveryRef` = hash detail akses offchain (mis. SSH public key), dienkripsi ke key provider dan disimpan di IPFS"; design §2 Flow C "encrypted to the provider's published key", tempat publikasi tidak dirinci (sitemap §4.3 `/redemptions/new`, S-5). 06 X6-7 / P6-14: MVP = `deliveryRef` hanya keccak256 teks, penyimpanan [TBD 05 T5-04]; 09 §3.5 mencatatnya sebagai known limitation. Kontrak hanya menyimpan `bytes32 deliveryRef` (01 §6.8.1), jadi tempat key tidak memengaruhi `requestRedemption`.
- **Opsi:**
  - A) Onchain di `ProviderRegistry`: field `encryptionKey` + `setEncryptionKey(bytes)` + event (perubahan 01 §6.1).
  - B) **Attestation EAS** oleh provider sendiri: schema `ProviderEncryptionKey(bytes32 x25519PubKey, uint64 validUntil)`; rotasi = attestation baru + revoke yang lama; Ponder mengindeksnya.
  - C) Di JSON spec series (`paron-spec/v1`, di-hash ke `specHash`): satu key per series, tidak bisa dirotasi.
  - D) Profil provider di backend API (butuh backend tulis).
  - E) MVP tanpa enkripsi: `deliveryRef` = hash teks, detail akses tidak dikirim (agent demo memakai output GPU mock berlabel).
- **Rekomendasi:** **E untuk 27 jam** (sudah sejalan dengan 06 P6-14 dan 09 §3.5; tidak ada backend dan tidak ada perubahan kontrak), dengan **B sebagai desain target** yang ditulis di README/roadmap: key X25519 khusus (bukan key wallet), dipublikasikan lewat self-attestation EAS, ciphertext dipin ke IPFS, `deliveryRef` = hash CID ciphertext. B dipilih daripada A karena tidak mengubah 01, bisa dirotasi/dicabut, dan memakai pipeline EAS + Ponder yang sudah ada (sama dengan D-41). UI `/redemptions/new` menampilkan label jelas "Demo: access details are hashed, not delivered" (APPROVED bersama D-44).
- **Dampak:** kontrak: tidak ada (E dan B). Indexer: B = handler schema tambahan + field `encryption_key` di E12 (tambahan 03, NICE). Agent: B = dekripsi dengan private key X25519 provider (NICE). Frontend: 06 §5.3 M-REDEEM helper + label demo; `/provider/redemptions/[id]` tombol "Decrypt access details" = NICE. Demo: tidak berubah (delivery di naskah = mock berlabel, stack §4.4). 05 T5-04 tetap TBD untuk format JSON.
- **Ref:** 01 §6.8.1 (`deliveryRef`), §6.1; 03 E10 `delivery_ref`, E12; 05 T5-04; 06 §5.3, P6-14, X6-7; 09 §3.5; PK §6.2; sitemap §4.3, §4.5, S-5. **Status:** APPROVED (Jum 9 Okt 2026 ~09:40 WIB, Fatih): opsi E untuk 27 jam; B desain target (roadmap).

---

## 10. Approval Jum 9 Okt 2026 ~09:40 WIB dan item yang masih PENDING

Dicatat Jum 9 Okt 2026 ~09:50 WIB. Sumber approval: Fatih menyetujui rekomendasi keputusan pada Jum 9 Okt ~09:40 WIB (dicatat di CONTEXT-INDEX.md). Cadangan semua dev doc sebelum perubahan: `.bak-2026-10-09-pre-approval/`.

### 10.1 Keputusan tambahan yang ikut APPROVED (di luar D-01..D-44)

| ID | Keputusan | Diterapkan di |
|---|---|---|
| 06 P6-01 | Seluruh copy UI dalam bahasa Inggris; bahasa Indonesia hanya di slide/pitch | 06 §0.1 |
| 06 X6-19 | Tier build mengikuti tier solo **S0–S3** di sitemap §9.1 (bukan kolom MUST/NICE design §7.2 saja) | 06 legenda + §17, 08 |
| 03 T3-07 | `IndexStatusChanged` **tanpa** field tambahan; disruption manual dibedakan lewat tx (`setDisrupted`), bukan field event | 01 §6.10, 03 register T3-07 |
| Leverage (sitemap S-8) | Tab `/trade/leverage` = "Coming soon" (roadmap), tanpa form, tanpa tx, tanpa angka | 06 §0.5, 08 blok S2 |
| P-13, P-16, P-47, P-64, T-05, Q2 | Dicek satu per satu: semuanya punya rekomendasi di §7 / D-32, D-13, D-40, D-02, jadi **APPROVED**: pause = Safe `PAUSER_ROLE`, provider tidak bisa pause sendiri (P-13); treasury = Safe/Timelock, fee di-push, tanpa withdraw (P-16); nama `finalizeRedemption` / `resolveNoRuling` (P-47); `setGate` via Timelock + event `GateUpdated` (P-64); faucet 5.000 mUSDC / 1 jam (T-05); bulan kalender UTC di prod (Q2). Catatan: sitemap §9.1 masih menulis keenamnya sebagai terbuka; sitemap tidak diedit (aturan), jadi 07 yang berlaku | 01 §4.1, §6.3, §6.8, §6.12, §7 |
| Semua P2/P3/P4/P5/P6/P9 yang punya rekomendasi | APPROVED dan dilipat ke dokumen masing-masing (penanda `[PENDING …]` → `[APPROVED …]`) | 02–06, 09 |
| T-01, T-03, T-04 demo, T-05, T2-01, T3-02, T3-08, T5-10, T5-12, T9-10 | Selesai: punya angka/rekomendasi atau terselesaikan oleh sinkronisasi | 01 §2.2, 02 §3.2, 03 §7, 04 §7.3, 05 §7, 09 §8 |

### 10.2 Masih PENDING setelah approval

Diperbarui Jum 9 Okt ~10:35 WIB: D-10, P5-26 dan T9-06 sudah APPROVED (§10.3) dan dikeluarkan dari daftar. Yang tersisa hanya item ukur/uji, celah sumber, dan info panitia. Tidak ada satu pun yang memblokir go/no-go Jum 10:30; yang punya tenggat build ditandai.

Diperbarui Jum 9 Okt ~11:05 WIB: ditambah **D-45..D-59** (usulan audit PE, §11); D-54, D-57, D-59 langsung APPROVED (§10.4).

Diperbarui Jum 9 Okt ~11:17 WIB: D-45..D-53, D-55, D-56, D-58 **APPROVED** ~11:12 WIB (§10.5) dan **dikeluarkan** dari tabel ini. 05 T5-06 dan T5-08 terjawab (D-51, D-56) dan juga dikeluarkan. Sisa di bawah = item ukur/uji, celah sumber, dan info panitia; tidak ada keputusan D yang masih terbuka. Jam "go/no-go" di kolom terakhir kini = 11:14 → 11:59 WIB (T0 = 11:14 WIB).

| ID | Item | Kenapa masih terbuka (satu baris) | Kapan terjawab |
|---|---|---|---|
| 01 T-02 | `maxFillsPerTx` | Angka butuh `forge snapshot` dari `OrderBook` nyata | Jum ~19:00 (08 blok OrderBook) |
| 01 T-04 prod / 03 T3-04 | Parameter `PrintIndex` prod + α winsorization | Tidak ada angka di sumber; demo sudah APPROVED | pasca-hackathon (`METHODOLOGY.md` menulis "TBD") |
| 03 T3-01 / 04 T4-03 | Finality/reorg Ponder, jumlah konfirmasi, kebutuhan RPC archive | Hanya bisa diukur (go/no-go cek 5) | go/no-go 11:14–11:59 WIB |
| 03 T3-03 | Caching dan rate limit API | Tidak dinyatakan sumber | pasca-hackathon |
| 03 T3-05 | Tempat menyimpan/menyajikan JSON `paron-spec/v1` | Tidak dinyatakan sumber | pasca-hackathon (MVP: hash saja) |
| 03 T3-06 | Statement per entity KYB | G10 hanya menyebut per akun | pasca-hackathon |
| 04 T4-01 | Versi `forge-std` | Dipin saat `forge install` pertama | Jum pagi (08 blok bootstrap) |
| 04 T4-02 | Versi Postgres persis | Ikut managed DB yang dipilih saat deploy indexer | Jum malam |
| 04 T4-04 | RainbowKit butuh WalletConnect project ID untuk HP juri? | Belum diuji | Sab gladi |
| 04 T4-05 | Clone EIP-1167 tampil sebagai proxy di explorer? | Belum diuji | Jum malam (deploy latihan) |
| 05 T5-01 | Jumlah ETH gas per wallet + batas minimum | Diukur dari gas nyata | go/no-go cek 1 (≤ 11:59 WIB) |
| 05 T5-02 | Latensi tx → blok di chain terpilih | Belum diukur | Jum go/no-go |
| 05 T5-03 | Cara HP juri terhubung (WalletConnect vs wallet in-app) | Bergantung T4-04 | Sab gladi |
| 05 T5-04 | Isi JSON `paron-spec/v1`, `deliveryRef`, receipt | Tidak ada skema di sumber; MVP = hash teks (D-44 E) | Jum sore (format minimal) |
| 05 T5-05 | Harga primer `CU-SGP-B200-2612` | Sumber tidak menyebut; placeholder 3.00 dipakai | sebelum seed Jum malam |
| 05 T5-07 | Agent mendeteksi request dari chain vs Ponder | Butuh ukur latensi (target ack ≤ 3 dtk) | Jum malam |
| 05 T5-09 | Perilaku Ponder saat anvil revert | Belum diuji | Sab gladi |
| 05 T5-11 | Waktu total deploy ulang + seed | Diukur Jumat | Jum malam |
| 06 T6-01 | `eth_call` di RH melihat waktu maju tanpa blok baru? | Belum diuji; sejak D-48 APPROVED hasilnya hanya informasi (tombol tidak bergantung padanya) | go/no-go 11:14–11:59 WIB atau Jum sore |
| 09 T9-01 | Nama field HackQuest persis | Dilihat di form | Jum siang |
| 09 T9-02 | Batas durasi video resmi | Tidak disebut sumber (target internal ≤ 3:00 sudah APPROVED, P9-05) | dilihat di form |
| 09 T9-03 | Waktu pengumuman shortlist | Tidak dipublikasikan | panitia |
| 09 T9-04 | Jam slot demo Min 11 Okt | Tidak dipublikasikan | panitia |
| 09 T9-05 | Status registrasi Fatih | Belum dikonfirmasi (pemegang akun = Fatih sudah pasti) | Jum siang |
| 09 T9-07 | Host video | Belum dipilih | Sab 10:00 |
| 09 T9-08 | Alat rekam + mikrofon | Belum dipilih | Sab 00:00 |
| 09 T9-09 | Mentor (Honorable Mention) | Tidak ada nama di sumber | — |
| D-42 (uji) | Panggilan HTTPS → `http://127.0.0.1` dari browser | Bukan keputusan: uji teknis; gagal → fallback E (sudah APPROVED) | Jum malam (08 blok S1) |
| Sitemap (catatan) | Penyimpanan bukti dispute = [TBD] di sitemap | Sitemap tidak diedit; bukan blocker 27 jam (S7 = S2) | pasca-hackathon |

### 10.3 Approval kedua: Jum 9 Okt 2026 ~10:33 WIB (Fatih, di grup)

| ID | Keputusan | Diterapkan di |
|---|---|---|
| D-10 | **APPROVED (Jum 9 Okt 2026 ~10:33 WIB, Fatih):** URL Vercel bawaan = URL demo dan submission; domain + handle menyusul (pasca-hackathon, keputusan Fatih). **Terisi ~13:08 WIB:** `https://paron.vercel.app` | 01 Lampiran B, 03 §0/§3.1 + §8, 04 §1.1/§4.4/§8 + §11, 06 §15, 09 §2 #4, §7, §8, §10 |
| 05 P5-26 | **APPROVED (Jum 9 Okt 2026 ~10:33 WIB, Fatih):** bot trader berjalan **otomatis** selama demo (dipicu `PrimaryBuy` `W-BUY` di series 4); trigger manual = cadangan | 05 §2.5 (alur lengkap), §4.7, §4.8; 08 blok 00:45 + gladi |
| 09 T9-06 | **APPROVED (Jum 9 Okt 2026 ~10:33 WIB, Fatih):** lisensi repo Paron = **MIT** (open source); file `LICENSE` di root + bagian License di README | 04 §1.1, 09 §3.1 #16, §6 R6, §7, §8, §11; 08 |

### 10.4 Approval ketiga: Jum 9 Okt 2026 ~11:05 WIB (Fatih, di grup)

Sumber: Fatih di grup, ~11:05 WIB (diteruskan lewat Paron Spec Writer). Diterapkan langsung sebagai spec (bukan `[USULAN]`).

| ID | Keputusan | Diterapkan di |
|---|---|---|
| D-59 (EN-1, top-10 #2) | **APPROVED:** build dibagi menjadi **4 lane agent paralel** (L1 kontrak + test, L2 frontend, L3 indexer/API, L4 ops/deploy/agent), jadwal relatif **T0 = "go" dari Fatih = Jum 9 Okt 2026 11:14 WIB** (diberikan 11:14 WIB; jam absolut di 08 §1). Rencana 4 lane = timeline utama 08; rencana solo lama = **superseded**, disimpan sebagai lampiran referensi | 08 §1 (baru) + Lampiran A |
| D-54 (EN-2 + SC-11) | **APPROVED (khusus deployment hackathon):** attester KYB = EOA `W-VERIFIER` berlabel "Paron demo verifier (team-operated)", allowlist attester tetap dikendalikan Timelock; proposer Timelock = Safe **+** EOA `W-ADMIN`; executor = terbuka (`address(0)`). **Meng-override D-04 dan 04 P4-15 untuk hackathon saja**; D-04 tetap desain target/prod dan tidak dihapus | 01 §4.1, §7; 02 §2.13, §4.1; 04 DP-4/DP-5/DP-18/P4-15, env, §6.3; 05 §1, §3.2; 06; 08 |
| D-57 (EN-3) | **APPROVED:** go/no-go chain dibatasi **maksimal 45 menit** sejak T0 (lebih cepat kalau bisa). Fatih sudah punya saldo Robinhood Testnet di 2 akun (mengurangi risiko faucet). Cek yang belum ✅ di T0+0:45 (11:59 WIB) = hard fail → **langsung** Arbitrum Sepolia (dipertegas §10.5) | 04 §8; 08 §1 lane L4 |
| PG-2 (sandbox) | **DITOLAK:** tidak ada jalur sandbox di `/demo`; dikeluarkan dari rencana lane dan dari cut order. Fokus ke fitur untuk demo yang layak | 08 §1, §4; 06 (catatan `/demo`) |
| Atribusi README | **APPROVED (teks kerja ditetapkan §10.5):** README menyebut proyek dibangun dengan bantuan Grok Bot. Usulan teks: "Dibangun oleh Fatih Maulana dengan bantuan Grok Bot." / "Built by Fatih Maulana with help from Grok Bot." | 09 R5 / §3, 04 (catatan README) |
| Author git | **APPROVED:** semua commit dari agent cloud di-author sebagai **Fatih**, bukan agent. Nama/email diisi di §10.5 | 04 (konvensi git), 09 checklist §7 |

Item audit lain (D-45..D-53, D-55, D-56, D-58): APPROVED di §10.5.

### 10.5 Approval keempat: Jum 9 Okt 2026 ~11:12 WIB (Fatih, di grup) + T0

Sumber: Fatih di grup ~11:12 WIB (approval semua item; diteruskan lewat Paron Spec Writer); "go" ~11:14 WIB. Diterapkan sebagai spec di 01–09 Jum 9 Okt ~11:14–11:17 WIB (cadangan `.bak-2026-10-09-pre-1112/`); semua penanda `[USULAN D-xx, PENDING]` dikonversi menjadi spec dan teks yang digantikan dihapus (changelog per dokumen).

| ID | Keputusan | Diterapkan di |
|---|---|---|
| D-45 | **APPROVED opsi A:** `registerProvider`/`isListable` wajib `role == 1`; error `NotProviderRole()` | 01 §6.1; 02 §2.1; 06 §9.2 |
| D-46 | **APPROVED opsi B:** `resolveNoRuling` setelah `windowEnd` membuka ulang request di RM sekali, sebelum `windowEnd + grace` (T12b, `reopenedFrom`, `RedemptionReopened`); `refundedAfterWindow` dihapus; maksud D-29 tetap | 01 §6.8; 02 §2.8, SYS-9; 03 H25, H45, `redemption` |
| D-47 | **APPROVED opsi A:** `declineAndPay` hanya sebelum `Defaultable`; klausa P-48 "dan juga setelahnya" dicabut | 01 §6.8.1, T13, P-48; 02 §2.8; 06 §6.3 |
| D-48 | **APPROVED opsi A dengan koreksi Spec Writer:** jam = `meta.server_now_ms` (bukan `indexed_at_ms`); tombol tampil kalau `wallclock > deadline + 2 dtk`, simulasi, tx yang memutuskan; menggantikan 05 P5-16 dan 06 P6-18 | 02 API-17; 03 §2.4, §3.1, E10; 05 §4.4; 06 §10 |
| D-49 | **APPROVED opsi A:** `SeriesFactory.setGate` + `GateUpdated` | 01 §6.3, §7, §11; 02 §2.3; 03 H44 |
| D-50 | **APPROVED opsi A:** `_update` aturan 2 dilewati kalau `from ∈ {RM, OrderBook}` | 01 §6.4; 02 INV-CU-4 |
| D-51 | **APPROVED opsi A:** sisa yang masih menyilang dikembalikan; book tidak pernah menyilang (INV-OB-9); `OrderPlaced` hanya untuk sisa yang di-rest; `orderId = 0` kalau tidak ada; menjawab T5-06 | 01 §6.7; 02 §2.7, E2E-05; 03 H16; 05 S-06 |
| D-52 | **APPROVED opsi A (lot 1 CU, koreksi Spec Writer atas contoh audit 0,01 CU):** `buy`, `placeOrder`, `requestRedemption` kelipatan `1e18`, error `InvalidLot()` | 01 §1, §6.6–§6.8; 02; 06 §9.2 |
| D-53 | **APPROVED A + (i) + (ii):** tumbling window + `seenEntity`; `PrintIndex` tidak pernah revert untuk input valid; try/catch + `IndexUpdateFailed` di C14 (OrderBook) **dan** C21 (RM → `PrintIndex`, tambahan Spec Writer) | 01 §6.7, §6.8.3, §6.10, §8.2; 02; 03 H46 |
| D-55 | **APPROVED (a)–(d):** fee floor di teks P-01; `linkAttestation` + `StaleAttestation()`; auth `rule()` = `members` saja (`ARBITER_ROLE` dihapus); permit try/catch | 01 §1, §4.1, §6.3, §6.9, §6.13; 02; 06 §9.2 |
| D-56 | **APPROVED opsi A:** `Defaulted.caller` lewat putusan = alamat arbitrator (`msg.sender` di `onRuling`); menjawab T5-08 | 01 §6.8.3; 02 D-04b; 03 H24; 05 D-04 |
| D-58 | **APPROVED opsi A (~11:12 WIB); ownership ~11:29 WIB; detail ~11:32 WIB; URL ~13:08 WIB; CORS+deploy ~13:20 WIB:** blok hosting 30 menit (±18:44–19:14, sebelum G3); host = Vercel project `paron` (`web/` → `https://paron.vercel.app`, commit `b18b3d4`) + Railway project `paron` (`indexer/` + Postgres → `https://paron-robinhood-production.up.railway.app/v1`); env Vercel = RPC + API base saja (`mock` dilarang); `API_CORS_ORIGIN=https://paron.vercel.app` (Scout ~13:20, menggantikan 'kosong dulu' PE ~13:09; menunggu konfirmasi redeploy); fallback onchain P5-23 S0-kritis | 03 §0; 04 §8; 05 §4.8; 06 §11.2; 08 §1 |
| Fallback chain (D-57) | **APPROVED:** kalau Robinhood Testnet gagal go/no-go 45 menit, **langsung** switch ke Arbitrum Sepolia (tanpa perpanjangan, tanpa diskusi ulang) | 04 §8; 07 D-57; 08 §1.4 |
| T0 | **"Go" Fatih = Jum 9 Okt 2026 11:14 WIB.** Go/no-go selesai ≤ 11:59 WIB; jam absolut semua blok lane di 08 §1 | 04 §8, §10; 08; 09 §1.2 |
| Author git | `user.name` = `Fatih Maulana`, `user.email` = `fatihmaulanamail@gmail.com` | 04 §9.2; 09 §7 |
| Repo | https://github.com/Fatihmaull/paron-robinhood | 04 §1, §9.2; 09 §2 #3, §7 |
| Atribusi README | Teks kerja (Fatih: "bilang saja ini dibantu oleh grokbot"): "Built by Fatih Maulana with help from Grok Bot" / "Dibangun oleh Fatih Maulana dengan bantuan Grok Bot"; [TBD] dihapus | 04 §9.2; 09 §3.2, R5, §7 |
| Izin merge (Fatih ~11:27 WIB) | **APPROVED, izin tetap:** PE boleh me-merge PR sendiri ke `main` kalau test/CI hijau, tanpa minta OK Fatih tiap kali. Keputusan D-xx tetap hanya dari Fatih | 04 §9.2; 08 §1.1 |
| Deploy dari mesin PE (catatan PE ~11:27 WIB, bukan D baru) | Cloud agent tidak memegang secret: semua deploy/broadcast dijalankan PE dari mesinnya dengan keystore deployer; lane L4 hanya menyiapkan script | 04 §4.1 butir 6, §6, §8; 08 §1.1, §1.2, §2.2 |
| D-58 ownership (Fatih ~11:29 WIB, Scout terima; detail Scout ~11:32 WIB) | **APPROVED, ownership + detail:** Hackathon Scout menyiapkan akun/project di komputer Scout (login GitHub `Fatihmaull`). **~11:32 WIB:** Vercel + Railway sudah login (**tanpa kartu**); Railway project `paron` + Postgres. Host = **Vercel** frontend (root `web/`, D-10) + **Railway** Ponder/API/Postgres (root `indexer/`; tidak tidur). Scout hubungkan setelah scaffold L1/L3 di `main`; L3 siapkan Dockerfile/start/healthcheck + README env indexer. Indexer `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (nilai mentah **tidak** dioper). Scout serahkan **URL publik Railway** ke PE. Setelah deploy: PE kirim env Railway lain (RPC URL, chain id, alamat kontrak, start block, `DATABASE_SCHEMA`; daftar lengkap = README indexer L3) ke Scout → Scout isi di Railway; PE isi env Vercel. Alchemy RPC opsional lewat secret input. Fatih tidak membuat akun hosting/Postgres sendiri | 04 §8; 07 D-58; 08 §1.1, §1.2, §5 |

**Catatan D-58 ~11:32 WIB (Scout, di grup; cadangan `.bak-2026-10-09-pre-1133/`):** Vercel+Railway sudah login di komputer Scout (**tanpa kartu**); Railway project `paron` + Postgres; `DATABASE_URL` via `${{Postgres.DATABASE_URL}}` (bukan dioper); Scout serahkan URL publik Railway; PE → Scout untuk env Railway lain setelah deploy; PE isi env Vercel.

**Hasil go/no-go ~11:36 WIB (PE, di grup; cadangan `.bak-2026-10-09-pre-1137/`):** **GO** di Robinhood Chain Testnet (chain `46630`), diputuskan sebelum batas 11:59 WIB (D-57). [PR #1](https://github.com/Fatihmaull/paron-robinhood/pull/1) dari L4 sudah masuk `main`. Fallback Arbitrum Sepolia **tidak** dipicu (tetap terdokumentasi sebagai cadangan tidak terpakai). Diterapkan di 04 §8, 07 D-57, 08 §1.4 / milestone G1.

**URL produksi terisi ~13:08 WIB (Scout, di grup; cadangan `.bak-2026-10-09-pre-1310/`):**
- **D-10:** frontend = `https://paron.vercel.app` (Vercel project `paron`, root `web/`, commit `b18b3d4`, production Ready).
- **D-58:** API/indexer = `https://paron-robinhood-production.up.railway.app/v1` (health 200; `synced:false` sampai kontrak di-deploy). Env Vercel yang dipakai: `NEXT_PUBLIC_RPC_URL` + `NEXT_PUBLIC_API_BASE_URL` saja; **`NEXT_PUBLIC_DATA_SOURCE=mock` dilarang** di Vercel (`live` opsional).
- **CORS (PE ~13:09 → Scout ~13:20 WIB):** awalnya **kosong dulu** (PE); **Scout ~13:20** menyetel `API_CORS_ORIGIN=https://paron.vercel.app` (menunggu konfirmasi redeploy Railway).
- Diterapkan di 03 §0/§3.1, 04 §4.4/§4.5/§8, 07 D-10/D-58, 09 §2 #4 / §7.

**Deploy kontrak stage-1 ~13:20 WIB (PE + Scout, di grup; cadangan `.bak-2026-10-09-pre-1325/`):**
- **PE:** kontrak di-deploy di Robinhood Chain Testnet (`46630`), label `stage-1`, `startBlock` core = `131496617`. verify-deployment lulus (14 kontrak punya kode, timelock delay 300 dtk, executor terbuka). Seed selesai: series `CU-JKT-H100-2611`, `CU-BTM-H200-2611`, `CU-SGP-B200-2612` (sama dengan contoh 05/D-25; tidak perlu rewrite). Alamat hanya di `deployments/46630/infra.json` + `stage-1.json` di `main` (tidak disalin ke doc).
- **Scout:** Railway `DEPLOY_LABEL=stage-1`, `INDEXER_RPC_URL` = RPC publik Robinhood sementara (belum ada RPC pribadi), `API_CORS_ORIGIN=https://paron.vercel.app`; Vercel redeploy dari `main` (alamat dari manifest, tanpa `NEXT_PUBLIC_ADDR_*`). Hasil `/v1/health` dan URL hijau menunggu konfirmasi redeploy.
- Diterapkan di 04 §4.4/§7/§8, 07 §10.5, 08 milestone (di depan G2 16:14).

---

## 11. Keputusan dari audit Principal Engineer: D-45 s.d. D-59 (semuanya APPROVED)

Ditambahkan Jum 9 Okt 2026 ~11:05 WIB dari audit Principal Engineer (`paron-build/AUDIT.md` §3 SC-1..SC-18, §4 EN-2/EN-3/EN-4/EN-11, §5 ambiguitas, §6 urutan lane). Cadangan semua dev doc sebelum perubahan: `.bak-2026-10-09-pre-audit/`.

**Aturan baca:**
- D-54, D-57, D-59 **APPROVED** Jum 9 Okt ~11:05 WIB (§10.4); D-45..D-53, D-55, D-56, D-58 **APPROVED** ~11:12 WIB (§10.5).
- Semua penanda `[USULAN D-xx, PENDING]` di dokumen lain sudah dikonversi menjadi spec (tag `[D-xx]`) Jum 9 Okt ~11:14–11:17 WIB; teks yang digantikan dihapus dengan changelog di tiap dokumen.
- Rekomendasi default = fix dari audit. Kalau berbeda atau menyentuh keputusan APPROVED, alasannya ditulis di butir itu.

**Tidak butuh D baru:**
- **SC-17** (teks basi di 05 §3.1 dan §4.1/§4.2) diperbaiki langsung mengikuti D-09 dan 04 P4-13 yang sudah APPROVED (log di 05 §0.1).
- **Ambiguitas audit §5 #8** (`KybApplication` vs penerbitan manual) sudah dijawab status D-41 ("build solo mengerjakan D dulu"). Penegasannya ditulis di 08: form self-attest `KybApplication` baru dibangun setelah S1 hijau.
- **EN-11** (uji D-42 HTTPS → `http://127.0.0.1`): timebox 15 menit di 08 tetap, fallback E tetap (D-42 APPROVED).

### 11.1 Ringkasan

| D | Temuan audit | Rekomendasi singkat | Menyentuh keputusan APPROVED? | Dokumen terdampak |
|---|---|---|---|---|
| D-45 **(APPROVED)** | SC-1 | `registerProvider`/`isListable` wajib `role == 1`; error `NotProviderRole()` | Tidak (menegakkan P-24) | 01, 02, 06 |
| D-46 **(APPROVED)** | SC-2 | `resolveNoRuling` setelah `windowEnd` membuka request baru di RM (CU tidak keluar) | **Ya**: mekanisme D-29 A / P-49 (maksudnya tetap) | 01, 02, 03 |
| D-47 **(APPROVED)** | SC-3 | `declineAndPay` hanya sebelum `Defaultable` | **Ya**: klausa P-48 "dan juga setelahnya" | 01, 02, 06 |
| D-48 **(APPROVED)** | SC-4 | Satu aturan jam: `wallclock > deadline + 2 dtk` (jam disinkronkan ke `meta.server_now_ms`) → simulasi → tx yang memutuskan | **Ya**: 05 P5-16, 06 P6-18 untuk testnet | 02, 03, 05, 06 |
| D-49 **(APPROVED)** | SC-5 | `SeriesFactory.setGate` + `GateUpdated` | Tidak (melengkapi P-64) | 01, 02, 03 |
| D-50 **(APPROVED)** | SC-6 | `_update` aturan 2 mengecualikan `from ∈ {RM, OrderBook}` | Tidak | 01, 02 |
| D-51 **(APPROVED)** | SC-7, SC-18, §5 #1/#7, T5-06 | Sisa yang masih menyilang dikembalikan; book tidak pernah menyilang; `OrderPlaced` hanya untuk sisa yang di-rest | Tidak | 01, 02, 03, 05 |
| D-52 **(APPROVED)** | SC-8, SC-16 | Lot CU = 1 CU utuh untuk buy, order, redeem (`InvalidLot()`) | Tidak | 01, 02, 06 |
| D-53 **(APPROVED)** | SC-9, SC-10 | `PrintIndex` tumbling window + set entity per window; tidak pernah revert; panggilan dibungkus try/catch | Tidak (memperjelas P-56) | 01, 02, 03 |
| D-54 **(APPROVED)** | SC-11, EN-2 | Hackathon saja: attester KYB = EOA `W-VERIFIER`, proposer = Safe + EOA `W-ADMIN`, executor terbuka | **Ya**: override D-04 dan 04 P4-15 untuk deployment hackathon (D-04 tidak ditimpa) | 01, 02, 04, 05, 06, 08 |
| D-55 **(APPROVED)** | SC-12..SC-15 | Paket hardening kecil: fee floor (teks P-01), `linkAttestation` tidak mundur, satu sumber auth `rule()`, permit try/catch | Teks P-01 saja | 01, 02 |
| D-56 **(APPROVED)** | §5 #3, T5-08 | `Defaulted.caller` = `msg.sender` di `onRuling` = alamat arbitrator | Tidak | 01, 02, 03, 05 |
| D-57 **(APPROVED)** | EN-3 | Go/no-go dibatasi maks. 45 menit sejak T0 | Tidak (menambah batas waktu ke 04 §8) | 04, 08 |
| D-58 **(APPROVED)** | EN-4 | Blok hosting 30 menit; host Vercel+Railway; ownership Scout (~11:29 WIB) + fallback onchain P5-23 S0-kritis | Tidak (ownership saja yang berubah) | 04, 05, 06, 08 |
| D-59 **(APPROVED)** | EN-1, top-10 #2 | Rencana 4 lane paralel relatif T0 = timeline utama 08; rencana solo = lampiran superseded; tanpa sandbox (PG-2 ditolak) | Tidak (D-08 tetap: tim = Fatih) | 08 |

### D-45: Role provider wajib saat registrasi dan listing (SC-1)
- **Pertanyaan:** apakah `registerProvider` dan `isListable` wajib memeriksa `role == 1 (Provider)`?
- **Konteks:** P-24 (APPROVED) menyatakan registry memakai attestation `ParticipantVerified` dengan `role = Provider`, tetapi tabel fungsi 01 §6.1 hanya memeriksa `gate.isVerified`. Akibatnya buyer/trader yang sudah KYB (role 2/3/4) bisa `registerProvider` lalu listing series (audit top-10 #4). Kode role: 1 Provider, 2 Buyer, 3 Trader, 4 MarketMaker (P-62).
- **Opsi:** A) `registerProvider` dan `isListable` membaca `gate.participantOf(a).role` (P-61) dan mewajibkan `role == 1`; error baru `NotProviderRole()`; role 4 tidak boleh listing. B) role ∈ {1, 4}. C) tetap (hanya `isVerified`).
- **Rekomendasi:** **A** (fix audit). Ini hanya menegakkan maksud P-24; satu panggilan view tambahan. B memperluas siapa yang boleh menanggung bond tanpa dasar di sumber.
- **Dampak:** kontrak: 01 §6.1 (2 baris + error). Test: `test_RevertWhen_BuyerRegistersAsProvider` (SHOULD, 02 §2.1); INV-REG-1/INV-REG-3 ditambah `role == 1`. Seed: `W-P-JKT/BTM/SGP` sudah role 1 (05 §1), tidak berubah. Frontend: copy error baru (06 §9.2). **Ref:** AUDIT SC-1; 01 §6.1, P-24, P-61, P-62. **Status:** **APPROVED (Jum 9 Okt 2026 ~11:12 WIB, Fatih, di grup): opsi A** (§10.5).

### D-46: Request ulang setelah `windowEnd` (SC-2, mekanisme D-29 opsi A)
- **Pertanyaan:** bagaimana CU yang di-REFUNDED setelah `windowEnd` bisa diminta ulang, padahal `lockFrom` (holder → RM) diblokir aturan `_update` #1?
- **Konteks:** D-29 APPROVED (i) + A. Pengecualian D-29 di `requestRedemption` (01 §6.8.1) memanggil `CUToken.lockFrom`, yaitu transfer holder → RM. Setelah `windowEnd`, aturan `_update` #1 (01 §6.4) hanya mengizinkan burn oleh RM dan transfer **keluar** dari RM/OrderBook, jadi tx itu revert `TransfersClosed`. SYS-9 (02) juga melarangnya, sehingga `test_RefundAfterWindowEnd_AllowsReRequestInGrace` tidak mungkin lulus. Jalur D-29 A mati di spec saat ini (audit top-10 #5).
- **Opsi:**
  - A) Pengecualian `_update`: izinkan `to == RedemptionManager` lewat `lockFrom` selama `[windowEnd, windowEnd + grace)` kalau `refundedAfterWindow[s][holder] ≥ amount`. Token harus tahu `grace` atau mempercayai RM; SYS-9 mendapat pengecualian keempat.
  - B) (lebih sederhana) `resolveNoRuling` setelah `windowEnd`: CU **tetap di RM**, dispute bond dikembalikan, record lama → `Refunded`, lalu di tx yang sama dibuka record **baru** `Requested` (reqId baru; holder, amount, `deliveryRef` sama; `ackDeadline = now + ackWindow`), emit `RedemptionRequested` + `RedemptionReopened(oldReqId, newReqId, seriesId, ackDeadline)`. Tanpa transfer CU, jadi `_update` dan SYS-9 tidak berubah. `refundedAfterWindow` dan cabang pengecualian di `requestRedemption` dihapus. Batas: reopen hanya kalau `now < windowEnd + grace` dan hanya **sekali** per rantai (record hasil reopen yang berakhir REFUNDED tidak dibuka lagi; CU-nya kembali ke holder lewat transfer keluar RM yang sudah diizinkan, lalu void bersama sisa supply).
  - C) Hapus jalur ulang (CU refund pasca-window langsung void). Melanggar maksud D-29 A.
- **Rekomendasi:** **B** (opsi "simpler" dari audit). Alasan:
  1. Tidak menyentuh `_update`, kontrak paling sensitif; SYS-9 (MUST) tetap persis seperti sekarang.
  2. Maksud D-29 A tetap: holder tetap bisa menagih delivery dan provider tetap bisa deliver, jadi "no party wins by stalling" (design §4.3) terjaga. Yang berubah hanya mekanismenya: request dibuka otomatis, bukan diminta holder.
  3. Setelah `windowEnd`, CU tidak punya kegunaan lain selain redemption (tidak bisa ditransfer atau dijual), jadi reopen otomatis tidak mengambil pilihan apa pun dari holder.
  4. State lebih sedikit (`refundedAfterWindow` hilang).
  
  Batas "sekali dan sebelum `windowEnd + grace`" mencegah siklus dispute → tanpa putusan → reopen tanpa akhir, yang akan membuat `openRequestCount > 0` selamanya dan memblokir `finalizeSeries` (D-14). Ini juga membatasi celah "free option" (audit top-10 #7, urusan produk Scout) setelah window. Karena mekanisme D-29 yang APPROVED berubah, butir ini butuh approval eksplisit.
- **Dampak:** kontrak: 01 §6.8 state (hapus `refundedAfterWindow` + view), §6.8.1 `requestRedemption` (hapus pengecualian) dan `resolveNoRuling` (cabang reopen), §6.8.2 transisi T12b + catatan P-49, §6.8.3 event baru. INV-RM-4/INV-RM-6 tetap berlaku (CU tetap terkunci; `openRequestCount` −1 lalu +1). Test: `test_RefundAfterWindowEnd_AllowsReRequestInGrace` diganti `test_RefundAfterWindowEnd_ReopensRequestInGrace` (NICE, jumlah test tetap). SYS-9 tidak berubah; daftar pengecualiannya ditulis eksplisit. Indexer: `RedemptionRequested` baru sudah cukup; handler `RedemptionReopened` untuk tautan timeline = NICE (03). Demo: tidak terlihat. **Ref:** AUDIT SC-2, top-10 #5, §5 #4; 01 §6.4, §6.8.1, P-34, P-49; 02 SYS-9; D-14, D-29. **Status:** **APPROVED (Jum 9 Okt 2026 ~11:12 WIB, Fatih, di grup): opsi B** (§10.5).

### D-47: `declineAndPay` hanya sebelum deadline (SC-3)
- **Pertanyaan:** bolehkah provider memanggil `declineAndPay` setelah deadline lewat (request sudah `Defaultable`)?
- **Konteks:** D-33 APPROVED: opsi A, boleh dari REQUESTED dan ACKNOWLEDGED. P-48 (01 §6.8.1) menambahkan "dan juga setelahnya". Akibatnya provider yang menghilang bisa mendahului `claimDefault` keeper/juri dan mengubah default paksa (strike) menjadi sukarela (tanpa strike). Integritas reputasi rusak, dan strike di adegan S-13 bisa dihindari (audit top-10 #10).
- **Opsi:** A) `declineAndPay` hanya selama `stateOf(reqId) ∈ {Requested, Acknowledged}` (belum `Defaultable`); setelah deadline hanya `claimDefault` (dengan strike) yang berlaku; revert `InvalidState(Defaultable)`. B) tetap P-48.
- **Rekomendasi:** **A** (fix audit). Tetap sejalan dengan D-33 A (dua state asal sama); yang dicabut hanya klausa "dan juga setelahnya" di P-48.
- **Dampak:** kontrak: 01 §6.8.1 baris `declineAndPay`, T13 guard, Lampiran A P-48. Test: `test_RevertWhen_DeclineAndPayAfterDeadline` (SHOULD, 02 §2.8). Frontend: "Decline & pay" disembunyikan begitu countdown habis (06). **Ref:** AUDIT SC-3; 01 T13, P-48; D-33. **Status:** **APPROVED (Jum 9 Okt 2026 ~11:12 WIB, Fatih, di grup): opsi A** (§10.5).

### D-48: Satu aturan jam untuk tombol "Claim default" (SC-4)
- **Pertanyaan:** jam mana yang menentukan kapan tombol never-cut "Claim default" muncul?
- **Konteks:** tiga aturan berbeda: 03 §2.4 menurunkan `DEFAULTABLE` dari jam server API; 05 P5-15/P5-16 memakai timestamp blok terakhir; 06 §10 memakai waktu blok + ekstrapolasi lokal (P6-18). Di chain ArbOS (RH Testnet dan Arbitrum Sepolia) blok tidak maju saat chain sepi, jadi `latest.timestamp` bisa beku. `stateOf()` lewat `eth_call` bisa ikut beku (06 T6-01 belum diuji). Tx-nya sendiri aman: kontrak membandingkan `block.timestamp` blok yang memuat tx.
- **Opsi:**
  - A) Aturan tunggal audit: tombol tampil kalau `wallclock > deadline + 2 dtk` (jam klien disinkronkan ke jam server API), lalu UI **mensimulasikan** `claimDefault`, dan tx yang memutuskan. Tombol tidak pernah diblokir karena waktu `latest` basi.
  - B) Status quo: countdown dari blok terakhir + ekstrapolasi (06 §10); tombol aktif hanya kalau `stateOf()` = `Defaultable`.
  - C) Jam server API saja (03 §2.4) tanpa simulasi.
- **Rekomendasi:** **A, dengan satu koreksi:** sumber sinkronisasi = field baru **`meta.server_now_ms`** (jam server saat respons dibuat) di envelope API (03 §3.1), bukan `meta.indexed_at_ms` seperti tertulis di audit. `indexed_at_ms` = kapan indexer terakhir memproses data; di chain sepi nilainya berhenti maju, jadi punya masalah yang sama dengan `latest.timestamp`. Cadangan kalau API mati: header HTTP `Date`, lalu jam perangkat (HP sudah sinkron NTP).
  - Kalau simulasi gagal dengan `NotDefaultable` padahal `wallclock > deadline + 2 dtk` (node mensimulasikan di blok basi), UI tetap mengizinkan kirim (gas limit tetap dari konstanta yang diukur) dengan catatan "chain clock catching up". Kalau memang terlalu cepat, tx revert dan dana aman.
  - Margin 2 dtk menutup selisih jam dan pembulatan detik. Mode anvil (`warp`): API memakai waktu chain sebagai `server_now_ms` (P5-15 tetap untuk anvil). P5-16 diganti aturan ini.
  - T6-01 tetap diukur saat go/no-go (informasi saja, bukan penentu tombol).
- **Dampak:** kontrak: tidak ada. API: 03 §2.4 (`now` = `server_now_ms`), §3.1 envelope (+1 field), P3-33. 05 §4.4 P5-15/P5-16. 06 §10 butir 5/6 + §16 T6-01. 02: cek baru API-17 (SHOULD). **Ref:** AUDIT SC-4, top-10 #9, §5 #5; 03 §2.4; 05 P5-15/16; 06 §10, P6-18, T6-01. **Status:** **APPROVED (Jum 9 Okt 2026 ~11:12 WIB, Fatih, di grup): opsi A dengan koreksi `meta.server_now_ms`** (§10.5).

### D-49: `SeriesFactory.setGate` (SC-5)
- **Pertanyaan:** bagaimana series **baru** ikut memakai gate baru setelah gate diganti?
- **Konteks:** P-64 APPROVED: `setGate` via Timelock di `ProviderRegistry`, `PrimarySale`, `OrderBook`; clone `CUToken` lama tetap memakai gate lama. Tetapi `SeriesFactory` menyimpan `gate` (01 §6.3) dan meneruskannya ke `initialize` setiap clone baru, dan tidak punya `setGate`. Setelah ganti gate, series institusional baru tetap mengecek gate lama.
- **Opsi:** A) tambah `SeriesFactory.setGate(address)` (Timelock) + `GateUpdated`; 03 H44 menambah `SeriesFactory`. B) `SeriesFactory` membaca `registry.gate()` saat `createSeries` (tanpa state sendiri). C) tetap; dokumentasikan bahwa ganti gate untuk series baru = deploy factory baru.
- **Rekomendasi:** **A** (fix audit). Polanya sama dengan tiga kontrak lain; event sama, jadi indexer cukup menambah alamat sumber. B menambah coupling dan satu panggilan lintas kontrak.
- **Dampak:** 01 §6.3 (fungsi, event, error), §7, §7.1, §11; 03 H44; 02: maksud `test_SetGate_OnlyTimelockEmitsGateUpdated` diperluas + `test_SetGate_NewSeriesUseNewGate` (NICE). **Ref:** AUDIT SC-5; 01 §6.3, §7, P-64; 03 H44. **Status:** **APPROVED (Jum 9 Okt 2026 ~11:12 WIB, Fatih, di grup): opsi A** (§10.5).

### D-50: Liveness series institusional (SC-6)
- **Pertanyaan:** apakah pengembalian aset dari RM/OrderBook ke pengguna yang KYB-nya dicabut boleh revert?
- **Konteks:** `_update` aturan 2 (01 §6.4) mengecek `gate.isVerified(to)` juga untuk transfer **keluar** dari RM/OrderBook. Refund (`resolveNoRuling`) atau `cancelOrder` ke holder/maker yang KYB-nya dicabut akan revert. Request tidak pernah terminal, jadi `finalizeSeries` (butuh `openRequestCount == 0`, P-32/D-14) terblokir selamanya. Series demo semuanya `institutional = false`, jadi hackathon tidak terdampak.
- **Opsi:** A) kecualikan `from ∈ {RedemptionManager, OrderBook}` di aturan 2 (mengembalikan aset milik pengguna sendiri). B) pengembalian ke alamat tidak terverifikasi dicatat sebagai saldo klaim (pull). C) tetap.
- **Rekomendasi:** **A** (fix audit). Mengembalikan aset sendiri bukan distribusi baru; B menambah state dan fungsi.
- **Dampak:** 01 §6.4 aturan 2; 02 INV-CU-4 + `testFuzz_InstitutionalReturnToRevokedHolder` (NICE). **Ref:** AUDIT SC-6; 01 §6.4, P-32; D-14. **Status:** **APPROVED (Jum 9 Okt 2026 ~11:12 WIB, Fatih, di grup): opsi A** (§10.5).

### D-51: Sisa order saat `maxFillsPerTx` habis + arti `OrderPlaced` (SC-7, SC-18, ambiguitas §5 #1 dan #7, 05 T5-06)
- **Pertanyaan:** apa yang terjadi pada sisa order taker kalau batas fill habis padahal harga masih menyilang, dan kapan `OrderPlaced` diemit?
- **Konteks:** 01 §6.7 langkah (3): "sisa: kalau IOC dikembalikan, kalau tidak di-rest + escrow". Tidak dinyatakan perilaku saat `maxFillsPerTx` (T-02) habis sementara harga masih menyilang; me-rest sisa itu menghasilkan **book menyilang** (bid ≥ best ask). Juga belum jelas apakah taker bid non-IOC boleh me-rest sisa di harga yang menyilang (§5 #7). Arti `OrderPlaced.qty` (asli vs sisa) tidak ditetapkan; 03 H16 mengasumsikan "bagian yang di-rest"; 05 T5-06 masih TBD.
- **Opsi:**
  - A) Sisa **dikembalikan** (diperlakukan IOC) kalau masih menyilang saat loop berhenti; sisa hanya di-rest kalau tidak menyilang. Book tidak pernah menyilang setelah tx. `OrderPlaced` hanya diemit untuk sisa yang di-rest, dengan `qty` = qty yang di-rest; `orderId` hanya dialokasikan untuk order yang di-rest (return `orderId = 0` kalau tidak ada yang di-rest).
  - B) Revert seluruh tx kalau batas fill habis saat masih menyilang.
  - C) Rest apa adanya (book bisa menyilang).
- **Rekomendasi:** **A** (fix audit SC-7 + SC-18). Jawaban §5 #7: taker non-IOC tetap boleh, tetapi sisanya di-rest di harga limitnya **hanya** kalau harga itu tidak lagi menyilang. Loop berhenti karena (a) qty habis, (b) tidak ada lawan yang menyilang, atau (c) batas fill; pada (c) sisa dikembalikan. `filledQty` tetap melaporkan bagian yang terisi. B membuat order besar gagal total. Penomoran `orderId` seed tidak berubah: F-4 = 1 dan ask S-04 = 2 tetap, karena keduanya order yang di-rest dan tidak ada taker sebelumnya (05 §3.3–§3.4).
- **Dampak:** 01 §6.7 langkah (3), event `OrderPlaced`, invariant baru INV-OB-9 "book tidak pernah menyilang setelah tx"; 02 `test_MaxFills_NoCrossedBook` (SHOULD); 03 H16 sudah cocok; 05 T5-06 terjawab (bid IOC `W-BUY2` di S-06 **tidak** mengemit `OrderPlaced`). **Ref:** AUDIT SC-7, SC-18, §5 #1/#7; 01 §6.7, T-02; 03 H16; 05 T5-06. **Status:** **APPROVED (Jum 9 Okt 2026 ~11:12 WIB, Fatih, di grup): opsi A** (§10.5).

### D-52: Grid kuantitas CU: lot 1 CU utuh (SC-8, SC-16)
- **Pertanyaan:** berapa ukuran minimum dan kelipatan kuantitas CU di buy, order, dan redeem?
- **Konteks:** SC-8: `MAX_LEVELS = 10` tanpa ukuran minimum memungkinkan DoS murah (10 ask 1 wei di 10 tick memblokir level baru untuk semua orang, `TooManyPriceLevels`). SC-16: CU 18 desimal boleh pecahan di buy/order, padahal `minRedemption ≥ 1 CU`, jadi debu < 1 CU tidak pernah bisa di-redeem dan diam-diam void.
- **Opsi:**
  - A) **Lot = 1 CU utuh** (`CU_LOT = 1e18`): `buy.qty`, `placeOrder.qty`, dan `requestRedemption.amount` wajib kelipatan `1e18`, kalau tidak revert `InvalidLot()`. Ukuran order minimum = 1 lot. Notional selalu kelipatan tick utuh.
  - B) Contoh audit: `minOrderQty` (1 CU atau 0,01 CU) + lot 0,01 CU.
  - C) Hanya `minOrderQty = 1 CU`, tanpa lot.
  - Opsional untuk semua opsi: order berharga lebih baik boleh menggusur level terburuk (evict). Tidak direkomendasikan untuk 27 jam.
- **Rekomendasi:** **A**. Ini menyimpang dari contoh audit (0,01 CU) karena lot 0,01 tidak menyelesaikan SC-16: holder masih bisa memegang 0,5 CU yang tidak bisa di-redeem. Dengan lot 1 CU, saldo yang lahir dari buy, fill, dan redeem selalu bilangan bulat. DoS debu butuh ≥ 10 CU ber-escrow per sisi (±$30 di harga demo), tidak lagi gratis. Semua angka demo (20, 10, 5, 8, 4, 1 CU) sudah bulat.
  - Konsekuensi: `maxSupply` pecahan (mis. A100 dengan faktor 0,45) menyisakan < 1 CU yang tidak terjual; bond-nya kembali ke provider lewat `withdrawRemaining`.
  - Transfer P2P tidak dibatasi (pilihan pengguna sendiri); UI hanya menawarkan CU utuh.
- **Dampak:** 01 §1 (konvensi lot), §2.2, §6.6, §6.7, §6.8.1 + error `InvalidLot()`; 02 `test_RevertWhen_OrderBelowMinQty` (SHOULD, OB) dan `test_RevertWhen_BuyNotWholeLot` (SHOULD, PS); handler fuzz qty dibulatkan ke kelipatan `1e18`; 06 input qty berlangkah 1 CU + copy `InvalidLot`. **Ref:** AUDIT SC-8, SC-16; 01 §1, §6.6, §6.7, P-10. **Status:** **APPROVED (Jum 9 Okt 2026 ~11:12 WIB, Fatih, di grup): opsi A (lot 1 CU)** (§10.5).

### D-53: Mekanika window `PrintIndex` + isolasi dari jalur trade dan default (SC-9, SC-10)
- **Pertanyaan:** bagaimana window "rolling 24 jam" digulirkan, dan bagaimana mencegah bug `PrintIndex` mematikan trading atau `claimDefault`?
- **Konteks:** SC-9: `IndexState` (01 §6.10) punya `sumNotional/sumQty/windowStart`, tetapi aturan gulirnya tidak ada; `participantCount` "entity unik" butuh set per window. SC-10: `recordTrade` dipanggil per fill di dalam `placeOrder` (C14), jadi revert apa pun di `PrintIndex` mematikan trading. **Tambahan Spec Writer (tidak disebut audit):** `recordDelivery`/`recordDefault` dipanggil RM (C21) di jalur `confirm` dan `claimDefault`, yang termasuk never-cut.
- **Opsi window:** A) **Tumbling window**: kalau `now ≥ windowStart + windowLength`, status dihitung ulang dulu (carry-forward → THIN; > `maxCarryForward` → DISRUPTED), lalu akumulator direset (`sumNotional = sumQty = 0`, `participantCount = 0`, `windowStart = now`). Keunikan entity lewat `mapping(bytes32 gpuModel => mapping(uint64 windowStart => mapping(bytes32 entity => bool)))`. "Rolling" dinyatakan sebagai pendekatan tumbling di `METHODOLOGY.md`. B) Ring buffer N print (rolling sejati, gas lebih besar).
- **Opsi isolasi:** (i) `PrintIndex` wajib tidak pernah revert untuk input valid (kewajiban spec + test). (ii) `OrderBook` dan RM membungkus panggilan ke `PrintIndex` dengan try/catch; kalau gagal, emit `IndexUpdateFailed` lalu lanjut.
- **Rekomendasi:** **A + (i) + (ii)**, dengan (ii) berlaku untuk C14 **dan** C21. Payout tidak terpengaruh, karena `PrintIndex` memang tidak di jalur payout (01 §8). try/catch tidak menolong kalau gas habis, jadi (i) tetap wajib.
- **Dampak:** 01 §6.10 (state, `recordTrade`, `poke`), §6.7 dan §6.8.3 (event `IndexUpdateFailed`), §8.2 C14/C21. 02: INV-PI-3 (tumbling), INV-OB-8 (gagal = event), `test_TumblingWindow_ResetsAndCountsUniqueEntities` (SHOULD, PI), `test_IndexFailure_DoesNotBlockTrade` (SHOULD, OB). 03: handler `IndexUpdateFailed` (NICE, tanda di health). Demo: adegan THIN → OK tetap (satu fill, 2 entity, dalam satu window). **Ref:** AUDIT SC-9, SC-10, §5 #2; 01 §6.10, P-52, P-56, C14, C21. **Status:** **APPROVED (Jum 9 Okt 2026 ~11:12 WIB, Fatih, di grup): A + (i) + (ii), try/catch di C14 dan C21** (§10.5).

### D-54: Attester EOA + proposer EOA + executor terbuka, khusus hackathon (SC-11, EN-2)
- **Pertanyaan:** perlukah Safe dikeluarkan dari jalur kritis dua never-cut (issue KYB live di `/verifier`, satu execute Timelock dari `/admin`) untuk deployment hackathon?
- **Konteks:** D-04 APPROVED: attester KYB = Safe tim berlabel "Paron demo verifier (team multisig)". 04 DP-5/P4-15: proposer = executor = Safe. Akibatnya `/verifier` dan `/admin` butuh protocol-kit + tx-service + tanda tangan 2-of-3 di dalam web app, plus 2 tx Safe per perubahan Timelock. 08 hanya memberi 60 dan 75 menit. Safe tx-service tidak ada di Arbitrum Sepolia (OQR §4). Audit menandai ini top-10 #3 dan ambiguitas §5 #6 (mengubah argumen deploy dan dua halaman).
- **Opsi:**
  - A) Override khusus hackathon:
    1. Attester KYB = EOA khusus `W-VERIFIER`, label "Paron demo verifier (team-operated)". Allowlist attester tetap dikendalikan Timelock (`EASGate.setAttester`); Safe boleh tetap ada di allowlist supaya jalur D-04 tetap valid. Di mode `RegistryGate`, `VERIFIER_ROLE` = `W-VERIFIER`.
    2. Proposer (dan canceller) Timelock = Safe **dan** EOA `W-ADMIN` (pola fallback opsi B).
    3. Executor = `address(0)` (eksekusi terbuka, pola standar OZ).
    
    Safe tetap treasury, `ADMIN_ROLE`/`PAUSER_ROLE`, dan bagian narasi.
  - B) Hanya executor terbuka (SC-11); attester dan proposer tetap Safe.
  - C) Status quo D-04 + P4-15.
- **Rekomendasi:** **A** (fix audit EN-2 + SC-11). `/verifier` dan `/admin` menjadi write wagmi biasa (±30–45 menit per halaman, bukan 2–3 jam).
  - Keamanan: executor terbuka aman karena hanya operasi yang sudah dijadwalkan dan sudah lewat delay yang bisa dieksekusi; siapa pun (termasuk `/ops`) boleh mengeksekusi.
  - Kejujuran: label "team-operated", bukan "team multisig", supaya tidak mengklaim multisig. README/known limitations menyebut override ini.
  - **D-04 tidak ditimpa:** D-04 tetap desain target/prod. D-54 hanya berlaku untuk deployment hackathon dan bisa dibalik lewat Timelock (`setAttester`, `revokeRole(PROPOSER_ROLE, W-ADMIN)`).
  - Ini juga keputusan narasi (audit merutekan EN-2 ke Scout sebagai keputusan Fatih).
- **Dampak:** 04 DP-4/DP-5/DP-18, P4-15, env (`KYB_ATTESTER_ADDRESS`, alamat `W-ADMIN`), §6.3 cek role. 01 §4.1 + §7. 05 §1 (wallet baru `W-VERIFIER`, `W-ADMIN`; seed KYB fase 1 dari `W-VERIFIER`, menggantikan P5-09 Safe `multiAttest`). 06 `/verifier` dan `/admin` tanpa protocol-kit. 02 fixture `test_RevertWhen_WrongSchemaOrUntrustedAttester`; `testFork_DeployAll_WiringAndRoles` meng-assert executor terbuka. 08 blok `/verifier` dan `/admin` memendek. **Ref:** AUDIT SC-11, EN-2, top-10 #3, §5 #6; 04 DP-4, DP-5, DP-18, P4-15; D-04, D-08. **Status:** **APPROVED (Jum 9 Okt 2026 ~11:05 WIB, Fatih, di grup): opsi A**, khusus deployment hackathon; override D-04 dan P4-15 untuk hackathon saja (§10.4).

### D-55: Paket hardening kecil (SC-12, SC-13, SC-14, SC-15)
Bisa disetujui sekaligus (`D-55 ok`) atau per butir (`D-55b ok`).
- **(a) SC-12 pembulatan fee.** 01 §1 P-01 menulis "pembayaran ke protokol dibulatkan ke atas", sedangkan 01 §6.6 dan 02 P2-03 (APPROVED) memakai `fee = floor(cost × bps / 10_000)`. 02 X2-3 sudah menyebut "P-01 tetap aturan umum". Usulan: P-01 tetap aturan umum untuk `cost`/escrow (ceil) dan payout (floor), dengan pengecualian eksplisit **fee = floor** (P2-03). Hanya teks 01 §1; angka demo tidak berubah.
- **(b) SC-13 `linkAttestation`.** Saat ini siapa saja bisa me-link uid lama yang masih valid dan menimpa link yang lebih baru (griefing). Usulan: uid baru diterima hanya kalau `time` attestation-nya ≥ `time` attestation yang sedang di-link, **atau** yang sedang di-link sudah tidak valid (dicabut, kedaluwarsa, attester tidak lagi tepercaya). Error baru `StaleAttestation()`. Test `test_LinkAttestation_RejectsOlderUid` (NICE).
- **(c) SC-14 auth `rule()`.** 01 §6.9 mendefinisikannya dua kali ("anggota panel dengan `ARBITER_ROLE` saat threshold == 1" vs keanggotaan `members`). Usulan: satu sumber = `msg.sender ∈ members` dan `threshold == 1`; `ARBITER_ROLE` dihapus dari `PanelArbitrator` (01 §4.1). Test yang ada (`test_SafeModeRule_ThresholdOne`) cukup.
- **(d) SC-15 permit.** `createSeriesWithPermit` revert kalau permit sudah terpakai (front-run, atau retry setelah tx hilang). Usulan: `permit` dibungkus try/catch; lanjut kalau allowance `BondVault` sudah cukup, kalau tidak revert seperti biasa. Test `test_CreateSeriesWithPermit_PermitAlreadyUsed` (NICE).
- **Rekomendasi:** terima (a)–(d) (fix audit). **Dampak:** 01 §1, §4.1, §6.3, §6.9, §6.13, Lampiran A; 02 §2.3, §2.13. **Ref:** AUDIT SC-12..SC-15; 01 P-01, P-37, P-50, P-63; 02 P2-03, X2-3. **Status:** **APPROVED (Jum 9 Okt 2026 ~11:12 WIB, Fatih, di grup): (a)–(d)** (§10.5).

### D-56: `Defaulted.caller` untuk default lewat putusan (ambiguitas §5 #3, 05 T5-08)
- **Pertanyaan:** alamat apa yang diisi ke field `caller` di event `Defaulted` saat default terjadi lewat `onRuling(NotDelivered)`?
- **Opsi:** A) `caller = msg.sender` di `onRuling` = alamat arbitrator (`PanelArbitrator`). B) relayer (`tx.origin`). C) `address(0)`.
- **Rekomendasi:** **A** (fix audit). Tanpa `tx.origin`, konsisten dengan `Ruled.arbitrator`. Relayer dan penanda tangan tetap terlihat di `RulingSubmitted.signers` dan pengirim tx.
- **Dampak:** 01 §6.8.3 (catatan field `caller`); 03 H24 `default_caller`; 02 §4.4 assert D-04b; 05 T5-08 terjawab. **Ref:** AUDIT §5 #3; 05 T5-08; 07 §10.2. **Status:** **APPROVED (Jum 9 Okt 2026 ~11:12 WIB, Fatih, di grup): opsi A** (§10.5).

### D-57: Go/no-go chain dibatasi 45 menit (EN-3)
- **Pertanyaan:** berapa lama go/no-go boleh berjalan sebelum otomatis pindah ke Arbitrum Sepolia?
- **Konteks:** go/no-go (04 §8, 5 cek) belum jalan. RH butuh self-deploy EAS (+20 menit; verifikasi EAS di Blockscout belum terbukti, OQR §3), dan faucet resmi RH ada di balik bot check Vercel (stack §3.1). 04 §8 menaksir switch ke Arbitrum Sepolia ±30–45 menit.
- **Opsi:** A) Timebox **45 menit sejak T0**: semua cek 04 §8 harus ✅ pada T0+0:45; cek yang belum ✅ = hard fail → Arbitrum Sepolia (RH tetap narasi dan fallback). B) A + "pilih Arbitrum Sepolia pada friksi apa pun" (EN-3 penuh). C) Tanpa timebox (status quo).
- **Rekomendasi:** **A.** B adalah bagian kedua dari fix audit, tetapi pemilihan chain demi cerita adalah keputusan Fatih/Scout (audit sendiri menyebutnya), dan kriteria hard/soft fail 04 §8 sudah APPROVED. Kalau D-54 disetujui, Safe keluar dari jalur kritis sehingga B lebih masuk akal; silakan pilih B kalau Fatih ingin.
- **Dampak:** 04 §8; 08 §7 lane L4 (T0–T0+0:45). **Ref:** AUDIT EN-3; 04 §8; design §11.3. **Status:** **APPROVED (Jum 9 Okt 2026 ~11:05 WIB, Fatih): opsi A, maksimal 45 menit (lebih cepat kalau bisa).** Fatih sudah punya saldo Robinhood Testnet di 2 akun, jadi risiko faucet RH berkurang. Opsi B tidak dipilih secara eksplisit; RH tetap chain utama selama cek hijau dalam timebox. **Catatan ~11:12 WIB (Fatih, §10.5):** kalau RH gagal go/no-go 45 menit, **langsung** switch ke Arbitrum Sepolia. T0 = 11:14 WIB, jadi batas keputusan = **11:59 WIB**. **Hasil ~11:36 WIB (PE, di grup, §10.5):** **GO** di Robinhood Chain Testnet (chain `46630`), sebelum batas 11:59; [PR #1](https://github.com/Fatihmaull/paron-robinhood/pull/1) L4 masuk `main`. Fallback Arbitrum Sepolia **tidak** dipicu (tetap terdokumentasi sebagai cadangan tidak terpakai).

### D-58: Blok hosting indexer + fallback onchain jadi S0-kritis (EN-4)
- **Pertanyaan:** kapan dan oleh siapa hosting Ponder + Postgres disiapkan, dan apa cadangannya?
- **Konteks:** Vercel tidak bisa menjalankan Ponder (proses panjang + Postgres). 03/stack menyebut Railway/Render/Fly, yang butuh sign-in Fatih sendiri dan tier berbayar (tier gratis bisa tidur). Juri meninjau async Sab 12:00 → Min; API yang tidur = UI kosong. 08 belum punya blok hosting. 04 T4-02 (versi Postgres) menunggu managed DB.
- **Opsi:** A) Blok 30 menit (Jum ~20:00; di rencana lane = T0+8h): Fatih membuat akun host + Postgres sendiri (sign-in miliknya, di chat 1:1 dengan PE), dengan tier yang tidak tidur Sab 12:00 → Min (pilihan host = Fatih), dan menyimpan key RPC Alchemy sebagai secret. Mode fallback onchain frontend (05 P5-23) naik menjadi S0-kritis. B) Host gratis yang bisa tidur + fallback onchain. C) Indexer di laptop + tunnel.
- **Rekomendasi:** **A** (fix audit). Agent tidak membuat akun dan tidak memegang kredensial; Fatih yang melakukannya. P5-23 jadi S0 karena itu satu-satunya jaminan UI tetap hidup kalau API mati saat penjurian async.
- **Dampak:** 08 blok baru; 04 §8/§10 catatan hosting + secret RPC; 05 §4.8 P5-23 (S0-kritis); 06 mode fallback. **Ref:** AUDIT EN-4; 03 §0; 04 T4-02; 05 P5-23. **Status:** **APPROVED (Jum 9 Okt 2026 ~11:12 WIB, Fatih, di grup): opsi A** (§10.5). **Ownership diperbarui Jum 9 Okt ~11:29 WIB (Fatih minta di grup; Scout terima; detail PE+Scout ~11:30 WIB; status akun Scout ~11:32 WIB):** akun/project dibuat **Hackathon Scout** di komputer Scout (login GitHub Fatih `Fatihmaull`). **~11:32 WIB:** Vercel + Railway sudah login di komputer Scout; **tidak perlu kartu**; Railway project `paron` + service Postgres. Host: frontend **Vercel** (root `web/`, URL bawaan D-10); Ponder+API+Postgres **Railway** (root `indexer/`; tidak tidur seperti Render free tier). Scout hubungkan project setelah scaffold L1/L3 masuk `main`; L3 siapkan Dockerfile, start command, healthcheck Railway, dan README package indexer (daftar env). Indexer menarik `DATABASE_URL` lewat `${{Postgres.DATABASE_URL}}` — **nilai mentah tidak dioper ke PE**. Scout serahkan **URL publik Railway** ke PE. Setelah kontrak di-deploy: PE kirim env Railway lain (RPC URL, chain id, alamat kontrak, start block, `DATABASE_SCHEMA`; daftar lengkap mengikuti README indexer L3) ke Scout → Scout isi di Railway; PE isi env Vercel (termasuk URL indexer). Alchemy RPC opsional lewat secret input. Fatih tidak lagi membuat akun hosting/Postgres sendiri. Deploy tetap dari mesin PE; L4 hanya menyiapkan script. Blok waktu ±18:44–19:14 tetap. **URL terisi Jum 9 Okt ~13:08 WIB (Scout, di grup):** frontend `https://paron.vercel.app` (Vercel project `paron`, root `web/`, commit `b18b3d4`); API `https://paron-robinhood-production.up.railway.app/v1` (health 200; kontrak `stage-1` live ~13:20 — indexer menunggu redeploy Scout). Env Vercel: `NEXT_PUBLIC_RPC_URL` + `NEXT_PUBLIC_API_BASE_URL` saja (`NEXT_PUBLIC_DATA_SOURCE=mock` dilarang). **CORS (Scout ~13:20 WIB):** `API_CORS_ORIGIN=https://paron.vercel.app` (menggantikan 'kosong dulu' PE ~13:09; menunggu konfirmasi redeploy). **Deploy ~13:20 WIB:** `stage-1` live (`startBlock` `131496617`); lihat §10.5 log di atas.

### D-59: Rencana build 4 lane paralel (EN-1, top-10 #2)
- **Pertanyaan:** tetap rencana serial solo 08, atau pindah ke 4 lane paralel mulai T0 (go Fatih)?
- **Konteks:** 08 adalah rencana serial yang sudah tertinggal ±2,5 jam (belum ada repo; go/no-go belum jalan). Rencana itu menjejalkan frontend S0 (±8 halaman) plus handler Ponder ke 90 menit (18:30–20:00). Audit: anggaran realistis ±18 jam build sampai freeze 06:00 Sab, dikurangi 1,5 jam tidur.
- **Opsi:** A) 4 lane cloud agent dengan PE sebagai integrator: L1 kontrak + test, L2 frontend di atas fixture mock 03 §4, L3 indexer/API dari ABI event 01, L4 deploy/seed/agent/bot. Jadwal relatif T0 mengikuti audit §6 (08 §7 baru). Rencana solo 08 §1–§2 ditandai superseded. B) Tetap solo, cut ladder dipakai lebih awal. C) Hibrida 2 lane.
- **Rekomendasi:** **A** (fix audit). Deliverable pertama (≤ T0+0:45): semua interface/event/error 01 terkompilasi → ABI, supaya L2 dan L3 tidak menunggu implementasi. Tenggat terkunci, tier S0/S1/S2, tidur, freeze, submit, dan daftar never-cut tidak berubah. D-08 tetap (tim = Fatih; lane = agent, bukan anggota tim).
- **Dampak:** 08 §7 baru + penanda superseded di §1–§2. **Ref:** AUDIT EN-1, top-10 #2, §6; 08 §0–§4. **Status:** **APPROVED (Jum 9 Okt 2026 ~11:05 WIB, Fatih): opsi A.** Rencana 4 lane = timeline utama 08; rencana solo disimpan sebagai lampiran superseded. Sandbox (PG-2) **ditolak**, jadi tidak ada di lane L2 maupun cut order. **T0 = "go" Fatih = Jum 9 Okt 2026 11:14 WIB** (§10.5); jam absolut di 08 §1.

---

## 12. Approval kelima: Jum 9 Okt 2026 13:30 WIB (Fatih, di grup)

Fatih membalas di grup: "oke 1-4, footer not affiliated hapus itu, lanjutkan" (dicatat Scout di CONTEXT-INDEX 13:30 WIB). Sumber D-60..D-63: `docs/design/spec-change-requests.md` butir 1-4 (usulan Paron Product Designer, hanya saran sampai disetujui). Cadangan dokumen sebelum perubahan: `.bak-2026-10-09-pre-1331/`. Semua APPROVED 13:30 WIB.

| ID | Keputusan (APPROVED 13:30 WIB) | Diterapkan di |
|---|---|---|
| D-60 | `ChainBadge` di header: teks "RH Testnet ●" diganti **"Robinhood Chain Testnet ●"** (varian ruang sempit/mobile: "Testnet · 46630 ●") | 06 §1.1, §12 |
| D-61 | Bond health bar S3, baris 2: boleh dirender sebagai **dua baris legenda** ("Released to provider $36.00" / "Paid to holders $45.00") dengan kunci warna sama dengan segmen bar opsional (released = graphite, paid = ember); kata-kata sama, hanya tata letak | 06 §4.6 |
| D-62 | Landing `/`: H1 **"Where compute is forged into one standard."**, subjudul S1 di bawahnya ("Physical GPU compute, sold forward. 1 CU = 1 H100-equivalent GPU-hour. Every CU is bonded."), lalu strip indeks, tabel 3 series teratas, tombol "List capacity". Tanpa wireframe baru | 06 §0.5 |
| D-63 | S5 Provider console, "Decline & pay": gaya **danger outline** (bukan isi merah); merah terisi hanya untuk "Claim default". Visual saja, tanpa perubahan copy | 06 §6.3 |
| D-64 | **Footer "not affiliated" dan semua teks "not affiliated" dihapus dari produk (web dan README).** Disclaimer pindah ke **pitch deck / slide saja**. Utility bar tipis menggantikan footer (link Docs · API · GitHub, catatan testnet, Build · Chain · Block). Aturan wording tetap: tanpa "partner", tanpa logo, jangan pernah menulis "feeds"; "Deployed on Robinhood Chain Testnet" tetap boleh. **Daftar never-cut tepat 3 butir:** claim default dari wallet mana pun; terbitkan KYB live di `/verifier`; satu execute Timelock dari `/admin` | 06 §0.2, §1.1, §5.7; 08 §4; 09 §3, §5, §7 |

**Catatan:**
- D-64 menggantikan aturan footer wajib di 06 §0.2 (lama), 08 (butir never-cut ke-4 dan X8-8), 09 (blok disclaimer README, dua footnote kata per kata, cek footer) dan membatalkan X6-13 / X9-8 untuk produk. Pada slide, footnote tetap dipakai kalau slide menyebut pihak lain (09, 05).
- Status KYB di `/verifier` tetap: Pending, Approved, Expired, Revoked, Withdrawn (03 E20; tanpa "Rejected" di MVP).
- Usulan Designer #5 (status pills) sudah selesai sebelumnya; usulan #9-#13 disetujui kemudian di §15 (D-67..D-71); #6-#8 sudah tercakup D-64/D-60. Penggantian chip jadi "Testnet · 46630" (usulan #8) hanya dipakai sebagai varian ruang sempit D-60.

---

## 13. Approval keenam: Jum 9 Okt 2026 13:35 WIB (Fatih)

Fatih menjawab: "utility bar pake aja itu" (13:35 WIB). Ini menyetujui `UtilityBar` usulan Product Designer sebagai pengganti footer yang dihapus di D-64. Cadangan dokumen sebelum perubahan: `.bak-2026-10-09-pre-1336/`.

| ID | Keputusan (APPROVED 13:35 WIB) | Diterapkan di |
|---|---|---|
| D-65 | **`UtilityBar` tipis APPROVED** sebagai pengganti footer: kiri link "Docs · API · GitHub", catatan testnet ("Deployed on Robinhood Chain Testnet. Testnet demo: tokens have no monetary value." saat `NEXT_PUBLIC_CHAIN_ID` = 46630), kanan "Build · Chain · Block". **Tanpa teks disclaimer** (D-64 tetap). Bukan lagi syarat tertunda: wajib ada di semua halaman, desktop dan mobile. Tidak mengubah daftar never-cut (tetap 3 butir) | 06 §0.2, §1.1, §14; 08 §4; 09 §3, §5 |

**Catatan:**
- Usulan Designer #9-#13 disetujui kemudian di §15 (D-67..D-71); D-65 sendiri hanya mencakup `UtilityBar`.

---

## 14. Catatan hosting dan usulan PENDING: Jum 9 Okt 2026 ~14:02 WIB

**Hosting record (PE di grup, 13:59 WIB; cadangan `.bak-2026-10-09-pre-1402/`):** indexer Railway sehat. Penyebab kegagalan sejak commit `916eed8`: Ponder menolak boot di schema `paron` yang dipakai build sebelumnya, jadi Railway tetap melayani container lama. Fix PR #30 (merge): tiap build memakai schema `paron_<sha8>` (8 karakter pertama commit sha). `/v1/health` 200 `synced:true`; `/v1/series` mengembalikan 3 series (`CU-JKT-H100-2611`, `CU-BTM-H200-2611`, `CU-SGP-B200-2612`). Tiap deploy backfill ±1 menit, jadi `503 INDEXER_SYNCING` sebentar itu normal. Dicatat di 03 §0 dan 04 (changelog + §8).

| ID | Usulan (Product Designer, di grup) | Status |
|---|---|---|
| D-66 | **APPROVED (Fatih di grup, Jum 9 Okt 2026 ~14:01 WIB: "setuju d-66").** Keadaan syncing di `/markets`: (a) ganti teks merah "indexer is still backfilling" dengan teks netral (warna sama seperti info banner): "Indexer is syncing. Series will appear shortly." dan tabel menampilkan 3 baris skeleton; (b) kalimat "0 series." disembunyikan selama syncing, tampil hanya kalau indexer sudah synced dan memang kosong; (c) merah hanya untuk kegagalan nyata, yaitu error `/v1/*` selain `503 INDEXER_SYNCING`. | APPROVED. Diterapkan di 06 §1.6 (B-DATA) dan §2 (state S1 `/markets`) pada 14:0x WIB; cadangan `.bak-2026-10-09-pre-1402b/`. Teks merah lama "indexer is still backfilling" dicabut. |

**Catatan Jum 9 Okt 2026 ~14:15 WIB (bukan keputusan, tanpa nomor D; PE dan Designer di grup ~14:13 WIB; cadangan `.bak-2026-10-09-pre-1415/`):** RPC publik Robinhood Chain Testnet intermiten untuk sebagian koneksi browser (`ERR_SSL_UNRECOGNIZED_NAME_ALERT`); PE menguatkan web (retry, backoff, tanpa error merah untuk gagal RPC). `INDEXER_RPC_URL_BACKUP` opsional, PENDING RPC provider kedua dari Fatih. Dicatat di 04 (tabel env + risiko) dan 09 §7.

---

## 15. Approval ketujuh: Jum 9 Okt 2026 14:40 WIB (Fatih): semua item Designer yang tersisa

Fatih di grup (14:40 WIB): "setujui semua, sesuai rekomendasi kalian, sinkronkan, dan arsipkan semuanya". Ini menyetujui butir #9 sampai #13 di `docs/design/spec-change-requests.md` dan temuan review live LR-5, LR-6, LR-8 (label LR dari Designer, tercatat di `SESSION_HANDOFF_HACKATHON.md`). Spesifikasi akhir **hanya** dari teks rekomendasi Designer di `docs/design/approved-ui-changes.md` dan `audit/04-actions.md` ("Key component specs"); tidak ada yang ditambahkan Spec Writer. Cakupan: visual dan layout saja, tanpa perubahan alur, route, kontrak, atau perilaku API. Cadangan dokumen sebelum perubahan: `.bak-2026-10-09-pre-d67/`.

**Tabel pemetaan nomor → D-xx**

| Nomor sumber | Isi singkat | D-xx |
|---|---|---|
| #9 + LR-5 | Series page satu viewport (terminal), perbaikan celah kosong, metadata ID, pill Verified, warna link | **D-67** |
| #10 | Redemption detail: kartu ringkasan + baris aksi | **D-68** |
| #11 | "Connect wallet" bergaya sekunder | **D-69** |
| #12 | Tabel mobile tanpa scroll horizontal halaman; tombol Menu tidak tampil di desktop | **D-70** |
| #13 | Banner dev-only tidak muncul di build produksi | **D-71** |
| LR-6 | Kontras teks kecil ≥ 4.5:1 | **D-72** |
| LR-8 | Tab Provider console | **D-73** |
| "Also adopt" di `approved-ui-changes.md` | `tokens.v2.css`, `<title>` per route, skip link. Grep CI: dibatalkan di D-81 (APPROVED 17:01 WIB, §20) | **D-74** |

Catatan pemetaan: LR-5 beririsan penuh dengan #9 sehingga digabung (satu D). LR-6 **bukan** bagian #12 (petunjuk awal Designer "mirip #12" tidak dipakai; #12 adalah tabel mobile, LR-6 adalah kontras). #5 (status pills) sudah selesai sebelumnya; #1-#4 = D-60..D-63; #6-#8 = D-64/D-65/D-60.

| ID | Keputusan (APPROVED Fatih, 14:40 WIB) | Diterapkan di |
|---|---|---|
| D-67 | **Series page `/markets/{seriesId}` sebagai terminal satu viewport (#9 + LR-5).** Header: simbol (20/28 mono), pill status, pill verified, stats ribbon (Last, 24h vol, Bond/CU, Coverage, Record). Grid 12 kolom, gap 16, `align-items:start`: chart + tape kolom 1-6, order book kolom 7-9, ticket kolom 10-12 (tab Buy primary, Place order); tab Bond, Terms, Redemptions, Reputation di bawah selebar penuh. Di bawah 1280 px: ticket, chart, book, tab. Di bawah 860 px: satu kolom. Hilangkan celah kosong antara Prints/Book dan Market/Bond (panel `align-self:start`, tanpa tinggi dipaksa). Metadata judul: "ID {id} · window {yyyy-mm}"; kalau id tidak ada, seluruh token "ID" dihilangkan (jangan pernah "ID" kosong). Pill Verified: tanpa wrap di tengah teks (`white-space:nowrap`); di lebar sempit pindah ke baris berikut sebagai pill sendiri. Link Redeem dan semua teks link/aksi in-app: warna aksen ember (`--color-accent-text`) atau netral (`--color-text-primary`), tanpa biru bawaan browser; `--color-text-link` hanya untuk link docs eksternal. Book kosong: "No orders. Place the first bid." dengan tab Place order sebagai aksi; tape kosong: "No prints yet." | 06 §4.1, §4.4, §4.5, §4.9 |
| D-68 | **Redemption detail (#10).** Kartu kiri: jumlah state 36 px mono (ember kalau Defaulted, hijau ok kalau Completed), baris fakta kunci (CU, holder, provider, deadline), satu baris aksi (Confirm / Dispute / Claim default berisi merah, tinggi 56 px di mobile). Kartu kanan: timeline tidak berubah. Tinggi kartu = isi, tanpa ruang kosong. Baris "Default paid. $45.00 sent to 0x2222...2222." harus teks terbesar di halaman | 06 §5.7 |
| D-69 | **"Connect wallet" di header bergaya sekunder (#11)**: outlined gelap (`--btn-chrome-*`). Ember hanya untuk satu aksi primer per halaman. Pemilih snapshot memakai state terpilih netral, bukan ember | 06 §1.1, §12 |
| D-70 | **Tabel mobile (#12), viewport 390 px, `/`, `/markets`, `/markets/{seriesId}`:** setiap `<table>` dibungkus `.table-scroll{overflow-x:auto}`, anak grid `min-width:0`. Acceptance: `document.documentElement.scrollWidth <= innerWidth` di 390 px. Tombol "Menu" tidak tampil di atas 860 px (`.btn.menu-toggle{display:none}`) | 06 §2.3, §4.9 |
| D-71 | **Banner dev-only (#13):** banner mock dan pemilih snapshot hanya dirender kalau `NEXT_PUBLIC_DATA_SOURCE=mock` **dan** bukan build produksi. Vercel produksi tidak menampilkan keduanya | 06 §1.6, §11.3 |
| D-72 | **Kontras teks kecil (LR-6).** Nilai token sudah lolos (`contrast-report.md`: tertiary `#838C9B` di `#0A0C0F` ≥ 4.5:1); tampilan live lebih redup karena ada override. Ganti warna hard-coded atau teks ber-opacity (utility bar, "Spot reference (synthetic demo data)", header tabel, helper text) dengan `--color-text-tertiary` (minimum) atau `--color-text-secondary`; tidak ada `opacity` di bawah 1 pada teks; `--color-text-disabled` tidak dipakai untuk teks yang harus terbaca. Acceptance: kontras warna terhitung vs latar terhitung ≥ 4.5:1 untuk semua teks ≤ 13 px | 06 §0.2, §12 |
| D-73 | **Tab Provider console (LR-8).** Label Title Case ("Requests", "Series", "Bond", "Agent"), 13 px, weight medium; tab aktif bergaris bawah ember dengan teks primer, tab tidak aktif teks sekunder; ring fokus keyboard sesuai token; target minimal 44 px di mobile | 06 §6.1, §6.5 |
| D-74 | **Adopsi tambahan berisiko rendah dari audit Designer:** impor `tokens.v2.css` (dan `theme.v2.css`) menggantikan `tokens.css` (alias lama tetap, tanpa rename); tinggi baris tabel Markets 32 px dengan pill status sebaris; `<title>` per route dan skip link (`<a class="skip" href="#main">`). Butir grep CI `affiliated|endorsed by` **dibatalkan oleh D-81** (bukan butir yang masih berlaku; pembatalan APPROVED Fatih langsung 2026-10-09 17:01 WIB, §20). Sumber visual terbaru: `design.md` terbaru di `docs/design/` | 06 §0.2, §2.2, §12; 08 §2.2 |

**Catatan:** PE menerapkan D-67..D-74 dalam satu PR kecil sebelum freeze UI Sab 09:00 WIB (08 §2.2). Verifikasi akhir: Designer memotret ulang live pada 1280 dan 390 px untuk `/`, `/markets`, `/markets/1`, `/portfolio`, `/provider`, dan detail redemption (tanpa scroll horizontal di 390, tanpa link biru, kontras ≥ 4.5:1). Tidak ada item ini yang mengubah daftar never-cut (tetap 3 butir, D-64).

---

## 16. Approval kedelapan: Jum 9 Okt 2026 ~15:34 WIB (Fatih, via handler)

Fatih menyetujui lewat handler (~15:34 WIB, "lanjutkan dengan rekomendasi"): item UI Designer P1–P6 (D-75..D-80) dan nama series demo yang live (D-82). Pengecualian nama pihak ketiga (Ornn, ICE, Robinhood) untuk dokumen dan footnote slide sudah dicatat di CONTEXT-INDEX pada jam yang sama. Pada jam ini D-81 belum approval; konfirmasi langsung Fatih ada di §20 (2026-10-09 17:01 WIB).

| ID | Keputusan | Diterapkan di |
|---|---|---|
| D-75 | **APPROVED (Fatih, Jum 9 Okt 2026 ~15:34 WIB, via handler; P1–P6 disetujui Fatih).** P1 Banner syncing. Banner tampil hanya jika `/v1/health` `synced:false` atau lag > 20 blok. Warna info, bukan amber. Kalimat banner yang live ada di D-84. | 06 §1.6, §2; design.md state loading |
| D-76 | **APPROVED (sama). P2 Skeleton.** Animasi pulse opacity, bukan shimmer, sesuai design.md §6. Kalimat "0 series." tetap disembunyikan saat loading (D-66). | design.md §6; 06 §2 |
| D-77 | **APPROVED (sama). P3 Tab Leverage.** Di `/markets/[id]` tab Leverage berlabel "Coming soon", tanpa aksi. | 06 §4; approved-ui-changes |
| D-78 | **APPROVED (sama). P4 Tiket Buy.** Hapus copy implementasi dari tiket Buy. Yang tampil hanya copy produk. | 06 §4 tiket Buy |
| D-79 | **APPROVED (sama). P5 Format angka.** Uang ditulis `$3,240.00` (pemisah ribuan, 2 desimal). Max cost 2 desimal. | 06 format angka; design.md |
| D-80 | **APPROVED (sama). P6 Beranda.** Isi beranda dipadatkan: kurangi ruang kosong, terutama mobile 390 px; connect wallet satu baris. | 06 S1; design.md |
| D-81 | **DIBATALKAN, dan pembatalan itu APPROVED (Fatih langsung, 2026-10-09 17:01 WIB, §20).** Guard CI grep `affiliated\|endorsed by` (butir terakhir D-74) tidak berlaku. Tidak ada grep itu di CI. `copy-guard.test.ts` tidak diubah dan bukan guard ini. Pada ~15:34 WIB statusnya masih menunggu konfirmasi langsung. | 04 §9; 06 §0.6; 09 §7; approved-ui-changes; design.md; guidelines.md; docs/README.md |
| D-82 | **APPROVED (sama). Nama series demo yang live = `CU-JKT-H100-2611`.** Seed kontrak series 1 tidak diubah. D-19 (series panggung `CU-JKT-H100-2610`) dan D-25 tetap catatan historis; yang digantikan hanya penamaan series demo yang live. `series_id`, window, dan input skrip seed/forge tidak ditulis ulang. | 03, 05, 06, 09 |

---

## 17. Safe di roadmap mainnet (D-83) — APPROVED 2026-10-09 17:01 WIB

Saat bagian ini pertama ditulis, D-83 masih PENDING dan bukan bagian approval ~15:34 WIB. Fatih menyetujui langsung pada 2026-10-09 17:01 WIB (§20).

| ID | Keputusan | Diterapkan di |
|---|---|---|
| D-83 | **APPROVED (Fatih langsung, 2026-10-09 17:01 WIB).** Safe multisig masuk roadmap: rencana kalau Paron live di mainnet nanti. Peran admin tidak berubah (D-54): tanpa EOA kedua, tanpa pindah ke Safe. Tidak ada batas freeze. Arsitektur Safe pada produk penuh sudah di product-plan §4.10; bagian ini tidak mengulanginya. | 08 §7.1; product-plan §4.10; CONTEXT-INDEX |

Aturan setelah freeze (08 §7.2, disebut di 09 §1.2) **SUPERSEDED / CANCELLED oleh D-90** (§20). Jam 06:00, 09:00, dan 11:30 WIB pada Sab 2026-10-10 tidak mengikat. Tag `freeze-contracts` dan `freeze-ui` tidak dipakai. Teks usulan lama tidak dihapus; lihat 08 §7.2.

---

## 18. Approval 2026-10-09 16:39 WIB (Fatih, langsung): D-84..D-88

Fatih menyetujui langsung pada 2026-10-09 16:39 WIB. Status D-84..D-88 = **APPROVED**. Bukan usulan yang menunggu keberatan.

| ID | Keputusan | Diterapkan di |
|---|---|---|
| D-84 | **APPROVED (Fatih, langsung, 2026-10-09 16:39 WIB).** Banner syncing, warna info. Kalimat persis (copy UI bahasa Inggris): "Indexer is catching up to the latest blocks; data may lag briefly." Muncul hanya jika `/v1/health` `synced:false` atau lag > 20 blok. Ini kalimat banner yang live (diverifikasi Designer). Syarat tampil tetap D-75. | 06 §1.6; CONTEXT-INDEX; approved-ui-changes |
| D-85 | **APPROVED (sama).** Tab series mengikuti D-67: Bond, Terms, Redemptions, Reputation. Kalau belum selesai sebelum freeze UI Sab 2026-10-10 09:00 WIB, tab lama (Overview, Buy, Trade, Leverage) tetap, dan sisa itu dicatat di dokumen. Pada `main` `93f8e60`, tab di halaman series masih Overview, Buy, Trade, Leverage. Freeze belum lewat saat catatan ini ditulis. Syarat jam 09:00 itu [SUPERSEDED D-90, §20]. | 06 §0, §4; D-67 |
| D-86 | **APPROVED (sama).** Pesan tidak ketemu, copy persis: "Request not found." di `/redemptions/1` dan `/disputes/1`. | 06 §0 |
| D-87 | **APPROVED (sama).** Pita data demo sintetis tetap. Teks pita: "Reference price (demo data)". | 06 §1.1 |
| D-88 | **APPROVED (sama).** Pratinjau PR #47 (beranda) belum ditinjau. Designer memeriksa produksi setelah rebase dan merge. | approved-ui-changes |

---

## 19. Hardening RPC: D-89 (APPROVED handler)

Dicatat karena perilaku RPC di PR #48 (`93f8e60`) mengubah spec env dan tampilan gagal. Bukan bagian approval 16:39 WIB.

| ID | Keputusan | Diterapkan di |
|---|---|---|
| D-89 | **APPROVED (handler).** Panggilan RPC publik diulang dengan jeda 400 ms, lalu 800 ms, lalu 1600 ms (batas berikutnya 8000 ms). Kegagalan RPC publik tampil sebagai teks redup, bukan error merah. Nama env `INDEXER_RPC_URL_BACKUP` dan `NEXT_PUBLIC_RPC_URL_BACKUP` **final**. Kosong = hanya URL utama. Nilai URL tidak ditulis di dokumen. | 04 §3.2, §4.3–§4.5, §8, §9.1; 03 §0, §2.1, §3.1; 05 §3.1, §4.7–§4.8; 06 §1.6, §2.2, §9.1, §11.2; 09 §7 |

---

## 20. Approval 2026-10-09 17:01 WIB (Fatih, langsung)

Fatih memutuskan langsung pada 2026-10-09 17:01 WIB. Semua butir di bawah **APPROVED**. Bukan usulan yang menunggu keberatan. Chain tetap testnet.

| ID | Keputusan | Diterapkan di |
|---|---|---|
| D-81 | **APPROVED (Fatih langsung, 2026-10-09 17:01 WIB).** Pembatalan guard CI grep `affiliated\|endorsed by` (butir terakhir D-74) dikonfirmasi. Tidak ada grep itu di CI. `copy-guard.test.ts` tidak diubah dan bukan guard ini. | 04 §9; 06 §0.6; 09 §7; approved-ui-changes; design.md; guidelines.md; docs/README.md; CONTEXT-INDEX |
| D-83 | **APPROVED (sama).** Safe multisig = roadmap untuk mainnet nanti. Peran admin tidak berubah (D-54): tanpa EOA kedua, tanpa pindah ke Safe. | 08 §7.1; product-plan §4.10; CONTEXT-INDEX |
| D-90 | **APPROVED (sama). Aturan freeze dihapus.** Tidak ada aturan freeze kontrak. Tidak ada aturan freeze UI. Tidak ada aturan setelah freeze. Tag `freeze-contracts` dan `freeze-ui` tidak dipakai. Jam 06:00, 09:00, dan 11:30 WIB pada Sab 2026-10-10 tidak mengikat. **Tenggat keras submission tetap Sab 2026-10-10 12:00 WIB.** Catatan lama di 08 §0, 08 §2, 08 §7.2, 09 §1.2, 04 §9.2, dan CONTEXT-INDEX ditandai historis atau SUPERSEDED/CANCELLED; tidak dihapus. Syarat "sebelum freeze UI 09:00" pada D-85 ikut tidak mengikat. | 08 §0, §2, §7.2; 09 §1.2; 04 §9.2; CONTEXT-INDEX |

**Penugasan pemilik (rincian di 09 dan CONTEXT-INDEX):** video demo ditangani agen evergreen video editor yang sudah ada (tidak ada bot baru). Fatih sendiri yang menekan submit di HackQuest. Fatih sendiri yang membuat pitch deck.

**Hosting (rincian di 04 §8 dan CONTEXT-INDEX; tanpa secret atau token):** project Vercel hanya membangun branch `main`. Branch lain dilewati lewat Ignored Build Step, jadi tidak ada pratinjau PR. Verifikasi UI hanya setelah merge ke `main`. Kuota deploy free tier habis (`api-deployments-free-per-day`, pulih kira-kira 24 jam), jadi `main` terbaru belum live sampai Fatih menyelesaikan masalah build/kuota.

**PR UI di `main`:** #47, #51, #53, #54 sudah merge (CI hijau) dan belum tampil di web.
