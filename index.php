<?php
/**
 * File: index.php
 * Fungsi: Halaman utama (landing page) yang merangkai semua section
 */

// 1. Buka koneksi database (menghasilkan variabel $pdo)
require_once 'config/database.php';

// 2. Include header (bagian <head> + navbar)
require_once 'includes/header.php';

// 3. Include tiap section
require_once 'includes/hero.php';
require_once 'includes/project-list.php';
require_once 'includes/certificate-list.php';

// 4. Include footer (penutup halaman + JS)
require_once 'includes/footer.php';
