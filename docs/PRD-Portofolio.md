# Product Requirements Document (PRD)
## Website Portofolio Sederhana (Landing Page)

| Item | Detail |
|---|---|
| Nama Proyek | Portofolio |
| Jenis | Landing Page (Single Page Website) |
| Lokasi Lokal | `C:\xampp\htdocs\portofolio` |
| Environment | XAMPP (Apache, PHP native, MySQL) |
| Frontend | HTML, CSS, JavaScript (native/vanilla) |
| Backend | PHP native (tanpa framework) |
| Database | MySQL |
| Versi Dokumen | 1.0 |
| Tanggal | 17 September 2026 |

---

## 1. Latar Belakang

Dibutuhkan sebuah website portofolio pribadi sederhana berbentuk **landing page satu halaman** untuk menampilkan profil singkat, daftar proyek yang pernah dikerjakan, dan daftar sertifikat yang pernah diperoleh. Website ini dibangun menggunakan pendekatan **native/manual** (PHP native, JavaScript native, MySQL) tanpa framework, agar mudah dipahami, ringan, dan dijalankan secara lokal menggunakan XAMPP.

## 2. Tujuan (Goals)

1. Membuat landing page portofolio yang menampilkan identitas diri secara singkat (Hero Section).
2. Menampilkan daftar proyek yang pernah dikerjakan secara dinamis dari database (Project List Section).
3. Menampilkan daftar sertifikat yang pernah didapat secara dinamis dari database (Certificate List Section).
4. Data project dan sertifikat dikelola melalui database MySQL sehingga mudah ditambah/diubah tanpa mengubah kode HTML secara manual.
5. Struktur project rapi dan mudah dikembangkan di kemudian hari (misalnya ditambah halaman admin, dsb).

## 3. Target Pengguna

- **Pengunjung umum** (recruiter, klien, teman): melihat profil, proyek, dan sertifikat.
- **Pemilik website (Admin/Owner)**: pada versi awal ini, pengelolaan data project & sertifikat dilakukan langsung lewat database (phpMyAdmin), belum ada halaman admin/dashboard (masuk ke *Future Improvement*).

## 4. Ruang Lingkup (Scope)

### 4.1 In Scope (Versi 1.0)
- 1 halaman (landing page) dengan 3 section: **Hero**, **Project List**, **Certificate List**.
- Data project & sertifikat diambil dari MySQL menggunakan PHP native (query manual, bisa PDO atau mysqli).
- Tampilan responsif sederhana (desktop & mobile friendly).
- Struktur folder project yang jelas dan terorganisir.

### 4.2 Out of Scope (Versi 1.0)
- Halaman admin/dashboard untuk CRUD data (tambah/edit/hapus project & sertifikat via UI).
- Sistem login/autentikasi.
- Multi-halaman (about page, contact page terpisah, blog, dsb).
- Deployment ke server online/hosting (fokus lokal dengan XAMPP dulu).

> Catatan: Out of scope di atas bisa menjadi bagian dari **Fase 2** setelah versi dasar ini selesai dan berjalan baik.

## 5. Spesifikasi Teknis

| Komponen | Teknologi |
|---|---|
| Web Server | Apache (bawaan XAMPP) |
| Bahasa Server-side | PHP Native (disarankan versi 8.x) |
| Bahasa Client-side | HTML5, CSS3, JavaScript (Vanilla JS) |
| Database | MySQL (dikelola via phpMyAdmin) |
| Koneksi Database | PDO atau MySQLi (disarankan **PDO** karena lebih aman & fleksibel) |
| Tools Pendukung | XAMPP Control Panel, phpMyAdmin, Text Editor/IDE (VSCode) |

## 6. Struktur Folder Proyek

Lokasi utama project: `C:\xampp\htdocs\portofolio`

```
portofolio/
│
├── index.php                  # Halaman utama (landing page), merangkai semua section
│
├── config/
│   └── database.php           # Konfigurasi koneksi ke MySQL (PDO/MySQLi)
│
├── includes/
│   ├── header.php             # Bagian <head>, meta tag, link CSS/JS
│   ├── footer.php             # Bagian penutup halaman, link JS di akhir body
│   ├── hero.php                # Komponen Hero Section
│   ├── project-list.php        # Komponen Project List Section (ambil data dari DB)
│   └── certificate-list.php    # Komponen Certificate List Section (ambil data dari DB)
│
├── assets/
│   ├── css/
│   │   └── style.css          # Semua styling halaman
│   ├── js/
│   │   └── main.js            # Interaksi/animasi sederhana (native JS)
│   └── images/
│       ├── profile/            # Foto profil untuk Hero Section
│       ├── projects/           # Screenshot/gambar tiap project
│       └── certificates/       # Gambar/scan sertifikat
│
├── database/
│   └── portofolio.sql         # File SQL untuk import struktur & contoh data ke MySQL
│
└── README.md                  # Dokumentasi singkat cara install & menjalankan project
```

**Catatan struktur:**
- `index.php` bertugas sebagai "perakit" yang memanggil (`include`/`require`) file-file di folder `includes/`.
- Query ke database sebaiknya dilakukan di masing-masing file `includes/project-list.php` dan `includes/certificate-list.php`, memakai koneksi dari `config/database.php`.
- Semua aset statis (CSS, JS, gambar) dikelompokkan dalam folder `assets/` agar rapi.

## 7. Rancangan Database

Nama database yang disarankan: **`db_portofolio`**

### 7.1 Tabel `projects`

| Kolom | Tipe Data | Keterangan |
|---|---|---|
| id | INT, AUTO_INCREMENT, PRIMARY KEY | ID unik project |
| title | VARCHAR(150) | Nama/judul project |
| description | TEXT | Deskripsi singkat project |
| image | VARCHAR(255) | Nama file gambar (disimpan di `assets/images/projects/`) |
| tech_stack | VARCHAR(255) | Teknologi yang dipakai, contoh: "PHP, MySQL, JS" |
| project_url | VARCHAR(255) | Link demo/live project (opsional, boleh NULL) |
| repo_url | VARCHAR(255) | Link repository (opsional, boleh NULL) |
| created_at | DATETIME, DEFAULT CURRENT_TIMESTAMP | Waktu data dibuat |

### 7.2 Tabel `certificates`

| Kolom | Tipe Data | Keterangan |
|---|---|---|
| id | INT, AUTO_INCREMENT, PRIMARY KEY | ID unik sertifikat |
| title | VARCHAR(150) | Nama sertifikat |
| issuer | VARCHAR(150) | Penerbit/penyelenggara sertifikat |
| issue_date | DATE | Tanggal terbit sertifikat |
| image | VARCHAR(255) | Nama file gambar sertifikat (di `assets/images/certificates/`) |
| credential_url | VARCHAR(255) | Link verifikasi sertifikat (opsional, boleh NULL) |
| created_at | DATETIME, DEFAULT CURRENT_TIMESTAMP | Waktu data dibuat |

## 8. Rincian Fitur per Section

### 8.1 Hero Section
**Tujuan:** Perkenalan singkat pemilik portofolio, kesan pertama pengunjung.

**Konten:**
- Foto profil / avatar.
- Nama lengkap.
- Jabatan/peran (contoh: "Web Developer", "Backend Developer", dll).
- Deskripsi singkat (1–2 kalimat tentang diri).
- Tombol Call to Action (CTA), contoh: "Lihat Project" (scroll ke section project) dan/atau link sosial media/CV.

**Sumber Data:** Statis (langsung ditulis di `hero.php`), karena bersifat profil pribadi yang jarang berubah. Tidak wajib dari database di versi 1.0.

### 8.2 Project List Section
**Tujuan:** Menampilkan daftar project yang pernah dikerjakan.

**Konten per item project:**
- Gambar/screenshot project.
- Judul project.
- Deskripsi singkat.
- Badge/list teknologi yang digunakan.
- Tombol/link menuju demo dan/atau repository (jika ada).

**Sumber Data:** Dinamis dari tabel `projects` di MySQL, diambil menggunakan PHP (PDO/MySQLi), ditampilkan dalam bentuk grid/card menggunakan perulangan (`foreach`/`while`).

**Kondisi khusus:** Jika data project kosong, tampilkan pesan sederhana seperti "Belum ada project untuk ditampilkan."

### 8.3 Certificate List Section
**Tujuan:** Menampilkan daftar sertifikat yang pernah diperoleh.

**Konten per item sertifikat:**
- Gambar/thumbnail sertifikat.
- Nama sertifikat.
- Nama penerbit (issuer).
- Tanggal terbit.
- Link verifikasi (jika tersedia).

**Sumber Data:** Dinamis dari tabel `certificates` di MySQL, ditampilkan mirip seperti project list (grid/card).

**Kondisi khusus:** Jika data sertifikat kosong, tampilkan pesan sederhana seperti "Belum ada sertifikat untuk ditampilkan."

## 9. Alur Kerja Aplikasi (High Level Flow)

1. Pengunjung mengakses `http://localhost/portofolio/` melalui browser.
2. `index.php` dijalankan oleh Apache, memanggil `config/database.php` untuk membuka koneksi ke MySQL.
3. `index.php` meng-include `includes/header.php`, lalu `includes/hero.php` (statis).
4. `includes/project-list.php` menjalankan query `SELECT * FROM projects ORDER BY created_at DESC`, lalu me-render hasilnya menjadi kartu-kartu project.
5. `includes/certificate-list.php` menjalankan query `SELECT * FROM certificates ORDER BY issue_date DESC`, lalu me-render menjadi kartu-kartu sertifikat.
6. `includes/footer.php` menutup halaman dan memuat `assets/js/main.js` untuk interaksi tambahan (misalnya smooth scroll, animasi sederhana).

## 10. Kebutuhan Non-Fungsional

| Aspek | Kebutuhan |
|---|---|
| Performa | Halaman ringan, load cepat di lokal (tanpa framework berat). |
| Kompatibilitas | Berjalan baik di browser modern (Chrome, Edge, Firefox). |
| Responsif | Layout menyesuaikan di desktop, tablet, dan mobile (media query CSS). |
| Keamanan Dasar | Gunakan **prepared statement** (PDO/MySQLi) untuk mencegah SQL Injection saat query data. |
| Maintainability | Struktur folder & kode terpisah jelas antara logic (PHP), tampilan (HTML/CSS), dan interaksi (JS). |

## 11. Kriteria Penerimaan (Acceptance Criteria)

- [ ] Website dapat diakses melalui `http://localhost/portofolio/` setelah project diletakkan di `C:\xampp\htdocs\portofolio` dan Apache + MySQL di XAMPP aktif.
- [ ] Hero Section tampil dengan foto, nama, jabatan, dan deskripsi singkat.
- [ ] Project List Section menampilkan data project yang diambil dari tabel `projects` di database `db_portofolio`.
- [ ] Certificate List Section menampilkan data sertifikat yang diambil dari tabel `certificates` di database `db_portofolio`.
- [ ] Menambah/mengubah data project atau sertifikat melalui phpMyAdmin akan langsung terlihat perubahannya di halaman tanpa mengubah kode HTML.
- [ ] Tampilan tetap rapi saat dibuka di layar mobile (responsif).

## 12. Rencana Pengembangan Selanjutnya (Future Improvements)

1. Halaman **Admin/Dashboard** untuk CRUD project & sertifikat tanpa perlu buka phpMyAdmin.
2. Sistem **login** untuk admin.
3. Section tambahan: **About Me**, **Skills**, **Contact Form**.
4. Upload gambar langsung dari form (bukan taruh manual di folder `assets/images/`).
5. Deployment ke hosting/server online.

## 13. Lampiran: Contoh Skrip SQL Awal

```sql
CREATE DATABASE IF NOT EXISTS db_portofolio;
USE db_portofolio;

CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    tech_stack VARCHAR(255),
    project_url VARCHAR(255),
    repo_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    issuer VARCHAR(150),
    issue_date DATE,
    image VARCHAR(255),
    credential_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---
*Dokumen ini adalah PRD versi awal (v1.0) dan dapat berkembang seiring kebutuhan proyek.*
