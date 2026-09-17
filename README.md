# 🌟 Portofolio - Personal Landing Page (v0.1)

Website portofolio pribadi berbentuk landing page satu halaman, menampilkan profil singkat, daftar project, dan daftar sertifikat. Dibangun dengan pendekatan **native** menggunakan PHP, JavaScript (Vanilla), dan MySQL — tanpa framework — sebagai project pembelajaran sekaligus portofolio pribadi.

## 📌 Tentang Project

Project ini adalah versi awal (**v0.1**) dari website portofolio pribadi saya. Tujuannya untuk menampilkan:
- Profil singkat (Hero Section)
- Daftar project yang pernah dikerjakan
- Daftar sertifikat yang pernah diperoleh

Dokumen perencanaan lengkap (Product Requirements Document) tersedia di folder [`docs/`](./docs/PRD-Portofolio.md).

## 🛠️ Tech Stack

- PHP Native (PDO)
- MySQL
- HTML5 & CSS3
- JavaScript (Vanilla)
- XAMPP (local development environment)

## 📂 Struktur Folder

\`\`\`
portofolio/
├── index.php
├── config/database.php
├── includes/
│   ├── header.php
│   ├── footer.php
│   ├── hero.php
│   ├── project-list.php
│   └── certificate-list.php
├── assets/
│   ├── css/style.css
│   ├── js/main.js
│   └── images/
├── database/portofolio.sql
├── docs/
│   ├── PRD-Portofolio.md
│   └── PRD-Portofolio.docx
└── README.md
\`\`\`

## 🚀 Cara Menjalankan (Lokal - XAMPP)

1. Clone repository ini ke dalam `C:\xampp\htdocs\`
   \`\`\`bash
   git clone https://github.com/Sparklight15/portofolio.git
   \`\`\`
2. Nyalakan **Apache** dan **MySQL** di XAMPP Control Panel.
3. Import `database/portofolio.sql` melalui phpMyAdmin (`http://localhost/phpmyadmin`).
4. Sesuaikan kredensial database di `config/database.php` bila perlu.
5. Akses melalui browser: `http://localhost/portofolio/`

## 🗺️ Roadmap

- [ ] Halaman admin/dashboard untuk CRUD data
- [ ] Sistem login admin
- [ ] Section About Me, Skills, Contact Form
- [ ] Upload gambar langsung dari form
- [ ] Deployment ke hosting online

## 📄 Dokumentasi

Lihat detail perencanaan lengkap di [PRD-Portofolio.md](./docs/PRD-Portofolio.md)

---
**Author:** Sparklight15
**Versi:** 0.1