<?php
/**
 * File: includes/certificate-list.php
 * Fungsi: Mengambil data sertifikat dari tabel `certificates` dan menampilkannya
 * Catatan: variabel $pdo didapat dari config/database.php yang di-include di index.php
 */

try {
    $stmt = $pdo->query("SELECT * FROM certificates ORDER BY issue_date DESC");
    $certificates = $stmt->fetchAll();
} catch (PDOException $e) {
    $certificates = [];
    $certificateError = $e->getMessage();
}
?>

<section id="certificates" class="section section-alt">
    <div class="container">
        <h2 class="section-title">Sertifikat</h2>
        <p class="section-subtitle">Sertifikat yang pernah saya peroleh</p>

        <?php if (empty($certificates)): ?>

            <p class="empty-state">Belum ada sertifikat untuk ditampilkan.</p>

        <?php else: ?>

            <div class="card-grid">
                <?php foreach ($certificates as $cert): ?>
                    <div class="card">
                        <div class="card-image">
                            <img
                                src="assets/images/certificates/<?php echo htmlspecialchars($cert['image'] ?: 'default.jpg'); ?>"
                                alt="<?php echo htmlspecialchars($cert['title']); ?>"
                                onerror="this.src='https://via.placeholder.com/400x220?text=Sertifikat'"
                            >
                        </div>
                        <div class="card-body">
                            <h3 class="card-title"><?php echo htmlspecialchars($cert['title']); ?></h3>
                            <p class="card-issuer"><?php echo htmlspecialchars($cert['issuer']); ?></p>

                            <?php if (!empty($cert['issue_date'])): ?>
                                <p class="card-date">
                                    <?php echo date('d F Y', strtotime($cert['issue_date'])); ?>
                                </p>
                            <?php endif; ?>

                            <?php if (!empty($cert['credential_url'])): ?>
                                <div class="card-links">
                                    <a href="<?php echo htmlspecialchars($cert['credential_url']); ?>" target="_blank" rel="noopener" class="btn btn-sm btn-primary">Verifikasi</a>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

        <?php endif; ?>
    </div>
</section>
