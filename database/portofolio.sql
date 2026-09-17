-- =============================================================
-- File: database/portofolio.sql
-- Fungsi: Membuat database, tabel, dan contoh data untuk project Portofolio
-- Cara pakai: Import file ini lewat phpMyAdmin (tab Import),
--             atau lewat terminal: mysql -u root -p < portofolio.sql
-- =============================================================

CREATE DATABASE IF NOT EXISTS db_portofolio
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

USE db_portofolio;

-- =============================================================
-- Tabel: projects
-- =============================================================
CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    image VARCHAR(255),
    tech_stack VARCHAR(255),
    project_url VARCHAR(255),
    repo_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contoh data project
INSERT INTO projects (title, description, image, tech_stack, project_url, repo_url) VALUES
('Website Toko Online Sederhana', 'Aplikasi e-commerce sederhana dengan fitur keranjang belanja dan checkout.', 'default.jpg', 'PHP, MySQL, Bootstrap', 'https://contoh-demo.com', 'https://github.com/username/toko-online'),
('Aplikasi To-Do List', 'Aplikasi pencatat tugas harian dengan fitur tambah, edit, dan hapus tugas.', 'default.jpg', 'PHP, JavaScript, MySQL', NULL, 'https://github.com/username/todo-list'),
('Landing Page Portofolio', 'Website portofolio pribadi satu halaman untuk menampilkan project dan sertifikat.', 'default.jpg', 'PHP Native, JS, MySQL', NULL, 'https://github.com/username/portofolio');

-- =============================================================
-- Tabel: certificates
-- =============================================================
CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    issuer VARCHAR(150),
    issue_date DATE,
    image VARCHAR(255),
    credential_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contoh data sertifikat
INSERT INTO certificates (title, issuer, issue_date, image, credential_url) VALUES
('Belajar Dasar Pemrograman JavaScript', 'Dicoding Indonesia', '2025-03-10', 'default.jpg', 'https://www.dicoding.com/certificates/contoh1'),
('Belajar Membuat Front-End Web untuk Pemula', 'Dicoding Indonesia', '2025-06-20', 'default.jpg', 'https://www.dicoding.com/certificates/contoh2'),
('PHP untuk Pemula', 'Sanbercode', '2025-08-05', 'default.jpg', NULL);
