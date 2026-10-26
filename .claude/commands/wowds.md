---
description: Export perubahan dashboard WOW DS ke Google Sheet, dan/atau import data Sheet ke dashboard
argument-hint: export | import | both (default: both)
---

Jalankan sinkronisasi WOW DS. Argumen: `$ARGUMENTS` (kosong = `both`: export dulu, lalu import).

Sumber kebenaran: **Google Sheet "Database Display Wow"** untuk data master (toko, PIC, kabupaten, status, penjualan). **Firestore** (`displaywowsulawesi`) untuk data visit (AV, foto, validasi) — data visit TIDAK masuk Sheet.

- Spreadsheet ID: `1uSwNeozmwTrfQuR40-D-L4zYXj-OAI8-Uy7tasIqmkY`
- Tab `Database`: A=No, B=PIC, C=SO Group Code, D=Kode Distri 1, E=Kode Distr 2, F=Nama Outlet Distr 1, G=Nama Outlet Distri2, H=KAB, I=Distributor Reward Display, J=Status Sewa (Existing/New/Cancel)
- Firestore REST: `https://firestore.googleapis.com/v1/projects/displaywowsulawesi/databases/(default)/documents/...?key=<FS_KEY di dashboard.js>`

## export (dashboard → Sheet)

Gunakan konektor **Google Sheets** (`get_values`, `update_values`, `append_values`). Kalau konektor tidak ada, hentikan dan minta user mengaktifkannya.

1. Kumpulkan yang tertunda. **Langsung kerjakan tanpa minta persetujuan** (user sudah mengizinkan), asal lolos pengaman di langkah 2–4; yang tidak lolos dilewati dan dilaporkan:
   - **Status manual**: dokumen `wow_logs` dengan `statusToko` terisi dan `statusSynced` bukan true (nilai Existing/New/Cancel). Ambil visit terakhir per toko.
   - **Perubahan kabupaten**: dokumen `app_data` dengan `synced == false` (field `store`, `pic`, `kab`).
   - **Toko baru dari popup "Input PIC / Toko"**: dokumen `app_data` dengan `type == 'toko'` yang namanya (`nama1`/`nama2`, atau `kode1`/`kode2`) belum ada di tab Database. SO Group Code baru = nomor SO terakhir di Sheet + 1.
2. Cari baris toko di tab Database lewat kolom F/G (nama persis). Kode SO berurutan, jadi baris = nomor SO + 1, tapi **selalu baca baris itu dulu dan cocokkan nama sebelum menulis**.
3. Tulis hanya sel yang berubah (satu sel per `update_values`), jangan menimpa baris lain. Toko baru ditambah dengan `append_values` di baris kosong berikutnya. Pengaman: nama dan kode SO harus cocok persis, Status Sewa hanya Existing/New/Cancel, kabupaten harus nama yang dikenal (minimal 3 huruf, ada di `WOW_PIC_KAB`), dan maksimal 30 sel per run (kalau lebih, jangan tulis apa pun dan laporkan daftarnya).
4. Baca ulang sel yang ditulis dan pastikan nilainya benar.
5. **Catat ke log:** tambahkan satu entri per sel yang ditulis ke `.claude/wowds-log.json` (`tgl` YYYY-MM-DD, `toko`, `so`, `pic`, `field` = `status`/`kab`/`toko-baru`, `dari`, `ke`), lalu commit dan push bersama import (atau sendiri kalau mode `export`).
6. Tandai yang sudah masuk Sheet (atau nilainya sudah sama dengan Sheet) di Firestore (`statusSynced: true` / `synced: true`, PATCH dengan `updateMask`) supaya tidak muncul lagi. Item yang dilewati jangan ditandai.

## import (Sheet → dashboard)

1. `git fetch origin main && git checkout main && git pull --ff-only origin main`.
2. `node scripts/wow-db.js --dry` dan tampilkan ringkasannya (toko/PIC bertambah-hilang, perubahan kabupaten). Kalau jumlah toko atau PIC turun drastis, berhenti dan laporkan; jangan dipaksa.
3. `node scripts/wow-db.js`. Kalau Sheet berisi kabupaten tidak valid (kurang dari 3 huruf / bukan nama yang dikenal), kembalikan nilai lamanya di `wow_toko_master.js` dan laporkan agar Sheet diperbaiki. Lalu commit `wow_toko_master.js` (dan `wow_penjualan.js` bila berubah) dengan pesan ringkas, push ke `main`.
4. Jangan pernah mengedit `wow_toko_master.js` / `wow_penjualan.js` dengan tangan; file itu ditimpa tiap sinkron (08.00 WITA, Senin–Sabtu). Perubahan data harus lewat Sheet.

## Laporan akhir

Laporan WAJIB memuat tabel **Status akhir**: semua entri di `.claude/wowds-log.json` yang `tgl`-nya **hari ini** (tanggal WITA, termasuk run ini; tidak perlu hari-hari sebelumnya karena sinkron berjalan tiap hari), dengan kolom toko, SO, perubahan (dari → ke), **status/kabupaten sekarang di Sheet** (baca sel lewat `get_values`) dan **di `wow_toko_master.js`**. Tandai baris yang tidak sama atau yang berubah balik. Kalau ada beberapa run di hari yang sama, tampilkan semuanya. Kalau ada toko bernama mirip (SO berbeda), sebutkan keduanya supaya tidak tertukar.

Sebutkan: apa yang diexport (toko, sel, nilai lama → baru), apa yang berubah saat import, commit yang dipush, dan apa yang sengaja tidak dikerjakan. Deploy GitHub Pages butuh 1–2 menit; sarankan Ctrl+F5.
