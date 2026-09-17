<?php
/**
 * File: includes/project-list.php
 * Fungsi: Mengambil data project dari tabel `projects` dan menampilkannya
 * Catatan: variabel $pdo didapat dari config/database.php yang di-include di index.php
 */

try {
    $stmt = $pdo->query("SELECT * FROM projects ORDER BY created_at DESC");
    $projects = $stmt->fetchAll();
} catch (PDOException $e) {
    $projects = [];
    $projectError = $e->getMessage();
}
?>

<section id="projects" class="section">
    <div class="container">
        <h2 class="section-title">Project</h2>
        <p class="section-subtitle">Beberapa project yang pernah saya kerjakan</p>

        <?php if (empty($projects)): ?>

            <p class="empty-state">Belum ada project untuk ditampilkan.</p>

        <?php else: ?>

            <div class="card-grid">
                <?php foreach ($projects as $project): ?>
                    <div class="card">
                        <div class="card-image">
                            <img
                                src="assets/images/projects/<?php echo htmlspecialchars($project['image'] ?: 'default.jpg'); ?>"
                                alt="<?php echo htmlspecialchars($project['title']); ?>"
                                onerror="this.src='https://via.placeholder.com/400x220?text=Project'"
                            >
                        </div>
                        <div class="card-body">
                            <h3 class="card-title"><?php echo htmlspecialchars($project['title']); ?></h3>
                            <p class="card-desc"><?php echo htmlspecialchars($project['description']); ?></p>

                            <?php if (!empty($project['tech_stack'])): ?>
                                <div class="tech-badges">
                                    <?php foreach (explode(',', $project['tech_stack']) as $tech): ?>
                                        <span class="badge"><?php echo htmlspecialchars(trim($tech)); ?></span>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>

                            <div class="card-links">
                                <?php if (!empty($project['project_url'])): ?>
                                    <a href="<?php echo htmlspecialchars($project['project_url']); ?>" target="_blank" rel="noopener" class="btn btn-sm btn-primary">Demo</a>
                                <?php endif; ?>

                                <?php if (!empty($project['repo_url'])): ?>
                                    <a href="<?php echo htmlspecialchars($project['repo_url']); ?>" target="_blank" rel="noopener" class="btn btn-sm btn-outline">Repository</a>
                                <?php endif; ?>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>

        <?php endif; ?>
    </div>
</section>
