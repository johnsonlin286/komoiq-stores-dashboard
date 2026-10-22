# Brief v3 — Roadmap Checklist

Status per 2026-10-22. Nomor "Langkah" mengikuti penomoran resmi brief v3 (bukan urutan pengerjaan — kita boleh lompat sesuai prioritas). Checked = sudah selesai & terverifikasi (`tsc`, `eslint`, `next build`, dan manual di browser).

## Selesai sebelum brief v3
- [x] Demo dashboard Layar A (store-admin) & Layar B (store-managment) sesuai brief v1
- [x] Simulasi data-linking antar dashboard via localStorage
- [x] Perbaikan bug warna LevelBadge
- [x] Login demo super-admin (`AUTH_EMAIL`/`AUTH_PASSWORD`/`AUTH_NAME`)
- [x] Setup Docker deployment + fix bug plain-HTTP production

## Langkah 1 — Bahasa EN/ID dengan tombol EN|ID ✅
- [x] `next-intl` v4.14.9, default Inggris, toggle di header, locale tersimpan di session cookie per akun
- [x] Semua UI chrome diterjemahkan (kedua dashboard, confirm dialog, dll)
- [ ] Nama produk, SKU, nama toko, `detail`/`actionLabel`/`quantityLabel` dari data JSON — sengaja masih data mentah, ditunggu sampai Langkah 2/3/8

## Langkah 2 — Hapus "rak murah", ganti harga "Best today" ✅
- [x] Hapus tombol "Pindah ke rak murah" dan semua kata "Masak Hari Ini" (termasuk `toLabel: "Rak Masak Hari Ini"` di `layar-a.json`) — diganti `actionLabel: "Best today"` + `discount: { code }` di 8 task
- [x] Tombol "Price to sell −30%" (EN) / "Turunkan harga −30%" (ID), persen dibaca **live** dari Settings via `findBestTodayPercent()` — ubah tier di Settings langsung berpengaruh ke tombol & dialog tanpa reload
- [x] Jendela konfirmasi: "Put the Best today label on {product} (−{percent}%)?" + chip "Price code: {code}"
- [x] Alasan "Not done" untuk task diskon otomatis terbatas ke stok-habis/lainnya (tidak ada tujuan-menolak/tanpa-transport, karena bukan task pindah toko)
- [x] `tsc`, `eslint`, `next build` bersih; diverifikasi manual (klik tombol → dialog benar → Yes/Not done → ubah tier BT30 di Settings → tombol & dialog ikut berubah live)

## Langkah 3 — Jenis tugas baru di layar toko (sebagian besar ✅)
- [x] Status Slow/Dead per tugas + chip warna (kuning/merah): `TaskStatusBadge` (`src/components/inventory/task-status-badge.tsx`), chip format "{Status} · fresh" untuk barang segar, "{Status} · {span}" untuk non-segar, sesuai contoh brief
- [x] Nilai Rupiah ditambahkan ke tiap tugas (`valueLabel` di `layar-a.json`, angka contoh dikarang tapi masuk akal) dan daftar **diurutkan dari nilai terbesar**
- [x] Tombol "Later"/"Nanti" per tugas — menunda tugas ke bawah antrean hari ini (session-only, belum persisten), bisa membuatnya terdorong keluar dari batas `maxPerDay`
- [x] `tsc`, `eslint`, `next build` bersih; diverifikasi manual (urutan nilai benar, klik Later memindahkan tugas ke bawah, chip Slow/Dead & dialog konfirmasi benar di EN/ID)
- [ ] **Running out** (biru, pindah stok dari toko tetangga) dan **Check list** (abu-abu, alur cek 12 barang) — sengaja **tidak** dibangun di task ini, karena brief sendiri menjadikannya langkah terpisah dengan jadwal sendiri (Langkah 4 & 5). Chip warna biru/abu-abu belum ada contohnya karena belum ada data tugas jenis ini.

**Koreksi arsitektur (setelah diskusi)**: status Slow/Dead awalnya saya hitung di frontend (dari *tone* level). Ini salah — brief eksplisit bilang logika saran/klasifikasi adalah tugas backend, frontend cuma menampilkan. Sudah diperbaiki: `StoreTask.status` sekarang **field data langsung** di `layar-a.json` (seperti `actionLabel`/`detail`), bukan dihitung dari level. Nilainya saya isi manual sebagai data contoh (brief: *"Buat data contoh baru"* untuk batch Langkah 1/2/3/6), dipilih supaya cocok dengan 2 contoh "Dead" eksplisit di brief (*"No sale for 3 days"* dan *"No sale since April"*). `Settings → Ambang lambat laku` tetap ada sebagai angka yang bisa Ranch atur, tapi sekarang jelas dicatat sebagai **untuk dipakai backend nanti**, bukan dikonsumsi kode kita.

**Perbaikan warna chip (review user)**: chip "Slow" sebelumnya pakai token `--color-warning` (oranye `#B4501E`) — brief eksplisit minta **kuning** untuk "lambat". Ditambah token baru `--color-slow` (kuning/emas `#8A6D1A`) + `--color-slow-soft` khusus status Slow, token teal lama (dipakai utk ikon daun di Layar B) dipindah ke `--color-leaf` supaya tidak lagi memakai nama yang membingungkan. Juga ditemukan: garis kiri & tint latar setiap baris tugas sebelumnya ikut `level.kind` (segar/non-segar) bukan `task.status` — jadi baris ber-chip "Dead" (merah) bisa punya garis hijau/teal (kontradiksi langsung, bug sejenis yang pernah diperbaiki di `LevelBadge` dulu tapi tertinggal di sini). Sudah diperbaiki: rail & tint sekarang ikut `task.status` (Slow=kuning, Dead=merah), konsisten dengan chip-nya. Kartu ringkasan "Not moving" juga diganti dari hijau/teal ke oranye (warna "warning" resmi brief) karena kartu itu menghitung campuran Slow+Dead, bukan cuma Slow. Warna brand (biru tua `#13294B`, biru `#2E6DB4`, krem `#F6F4EF`) sudah sesuai brief sejak awal, tidak diubah.

**Daftar harian dikunci (tidak rolling-refill)**: "Tugas hari ini" sebelumnya menghitung ulang top-15 setiap render, jadi begitu satu tugas selesai, tugas berikutnya dari backlog otomatis naik mengisi slot — bertentangan dengan kalimat brief *"Sisanya muncul besok"*. Sekarang "batch hari ini" dipilih sekali (top-N nilai Rupiah, `useMemo` atas `tasks`+`maxPerDay`+`warnings`, **bukan** atas daftar konfirmasi) sehingga menyelesaikan tugas tidak menarik tugas baru masuk hari yang sama. Indikator "Selesai X dari Y" juga diperbaiki: `Y` sekarang jumlah batch hari ini (mis. 15), bukan seluruh backlog toko (26).

## Langkah 4 — Alur "Check list" (belum)
- [ ] Start check → daftar ~12 barang (`tasks.checklistItemCount` sudah ada di Settings) → Good/Tired/Spoilt → ringkasan → Completed

## Langkah 5 — Tab "Stock in the right store" (belum)
- [ ] Quick hop / van run berbasis jarak (batas sudah ada di Settings → `transfer.*`), status Requested → Sent → Received

## Langkah 6 — Perbarui jendela konfirmasi ✅
- [x] Varian "Harga" (Best today) — sudah selesai di Langkah 2
- [x] Varian "Pindah stok": *"Send {qty} to {store}?"* + *"{produk} · {qty}"* + *"{jarak} km · {cara} · worth {nilai}"*. `distanceKm`/`worthLabel` ditambahkan ke 2 task pindah toko yang ada (`layar-a.json`); **jarak diambil dari Google Maps asli** (Pondok Indah → Kemang 6,8 km, Pondok Indah → Grand Indonesia 10,4 km), bukan dikarang sepenuhnya
- [x] **Cara kirim (quick hop/van run/terlalu jauh) dihitung live dari Settings** (`transfer.quickHopKm`/`vanRunKm`) — konsisten dengan pola diskon Langkah 2 (field numerik yang memang untuk frontend konsumsi, beda dengan `slowMovingDays` yang untuk backend)
- [x] 3 alasan baru untuk "Not done" tugas pindah stok: *Van is full* (baru), *Other store declined*, *Stock is out* (reuse kode yang sudah ada) — menggantikan "Tidak ada transportasi" khusus untuk tugas pindah toko (tetap dipakai untuk Retur ke pemasok)
- [x] **Perbaikan data**: tugas `tsk_05` tujuannya diganti dari "Ranch Market Fatmawati" (nama tidak ada di 10 toko resmi brief v3) → "Ranch Market Kemang"
- [x] `tsc`, `eslint`, `next build` bersih; diverifikasi manual (dialog pindah stok tampil benar, alasan baru muncul, tanpa "tidak ada transportasi")

## Langkah 7 — Kode rahasia mingguan (belum)
- [ ] Chip kode di layar toko, data dari backend (kita hanya tampilkan)

## Langkah 8 — Perbarui layar manajemen (belum)
- [ ] Tombol Dead/Slow-moving, subkategori fresh, ganti nama toko (hapus "Menteng")
- [ ] Judul kolom tabel hitam tanpa latar warna (sudah begini di implementasi saat ini — cek ulang saat rework)
- [ ] **Catatan**: `layar-b.json` (data Layar Manajemen) masih pakai 5 nama toko lama dari brief v1 (Grand Indonesia, **PIK**, **Menteng**, Pondok Indah, **Fatmawati**) — 3 di antaranya tidak ada di 10 nama toko resmi v3 (Grand Indonesia, Pondok Indah, Pesanggrahan, Lippo Puri, Kemang, Dharmawangsa, Plaza Senayan, Alam Sutera, Kelapa Gading, Bekasi). Belum saya sentuh karena memang scope Langkah 8, bukan Langkah 6 — ditemukan user saat review Langkah 6 (tugas `tsk_05` yang sempat tujuannya "Fatmawati", sudah diperbaiki jadi "Kemang").

## Langkah 9 — Halaman Settings ✅ (kecuali Fitur per toko)
- [x] Model data (`src/types/settings.ts`) + nilai awal (`src/data/settings.json`): Peringatan, Umur simpan per subkategori, Harga "Best today", Tugas, Pindah stok
- [x] Halaman `/settings`, akses **khusus Management** (Store manager tidak melihat menu/route ini sama sekali)
- [x] Persist ke localStorage (`src/lib/settings-store.ts`) — keputusan sementara sebelum ada backend sungguhan
- [x] Audit log tiap perubahan: siapa, kapan, field, nilai lama → baru
- [x] Semua section collapsible (`<details>`), badge status "Aktif sekarang" vs "Belum aktif — Langkah X" per section
- [x] Tangga peringatan (`warnings`) & Harga "Best today" (`bestToday`) sudah **reaktif/live** — dipakai langsung di task-board, task-row, confirm-dialog, product-list, store-level-tiles
- [ ] "Umur simpan per subkategori" & "Lambat laku" baru berupa angka konfigurasi — belum terhubung ke logika produk (produk belum punya tag subkategori; itu bagian Langkah 8). Sudah ada catatan jelas di UI bahwa ini belum aktif.
- [ ] "Tugas" (`maxPerDay`/`checklistItemCount`) & "Pindah stok" (`transfer.*`) juga masih konfigurasi murni, menunggu Langkah 3/4/5

## Langkah 10 — Fitur per toko, dinyalakan bertahap (task terpisah, belum)
- [ ] Toggle per toko per fitur (Fresh pricing, Check list, Transfers), mulai tanggal tertentu, fitur yang belum menyala tidak tampil sama sekali
- [ ] UI ini sudah punya placeholder read-only di halaman Settings

## Langkah 11 — Akun bernama & 3 peran (belum)
- [ ] Store manager (2/toko), Management (5), Buyer (Fase 2) — saat ini masih 2 role Firebase + demo super-admin

## Langkah 12 — Tab "Orders" abu-abu (belum)
- [ ] Tab ketiga di layar toko, tidak bisa diklik, keterangan "Coming after the pilot"
