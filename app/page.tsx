export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-24">
      <p className="font-hand text-h4 text-accent">halo, aku</p>
      <h1 className="font-serif italic text-display">Nama Kamu</h1>
      <p className="mt-6 text-lead text-muted">
        Ini teks Poppins. Kalau judul di atas miring bergaya serif dan tulisan
        kecil di atasnya seperti tulisan tangan, font sudah terpasang.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-surface p-6 text-body">
        Kotak ini memakai token surface dan border.
      </div>
    </main>
  );
}