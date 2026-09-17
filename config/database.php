<?php
/**
 * File: config/database.php
 * Fungsi: Membuka koneksi ke database MySQL menggunakan PDO
 */

// ==== KONFIGURASI DATABASE ====
// Sesuaikan jika username/password MySQL kamu berbeda
$db_host = 'localhost';
$db_name = 'db_portofolio';
$db_user = 'root';
$db_pass = ''; // default XAMPP kosong

try {
    $pdo = new PDO(
        "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4",
        $db_user,
        $db_pass
    );

    // Supaya error ditampilkan sebagai exception (memudahkan debugging)
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    // Default fetch mode: associative array
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    // Jika koneksi gagal, hentikan eksekusi dan tampilkan pesan singkat
    die('Koneksi database gagal: ' . $e->getMessage());
}
