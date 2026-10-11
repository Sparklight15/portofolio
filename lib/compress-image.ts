export const MAX_SISI_PX = 1600;
export const TARGET_BYTE = 1_000_000;
export const BATAS_BUCKET_BYTE = 5 * 1024 * 1024;

const KUALITAS = [0.85, 0.75, 0.65, 0.55];
const FAKTOR_SKALA = [1, 0.75, 0.5];

type FormatKeluaran = "image/webp" | "image/jpeg";

let formatTerpilih: FormatKeluaran | null = null;

function keBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

// Kalau browser tidak bisa menghasilkan WebP, toBlob diam-diam memberi PNG.
async function tentukanFormat(): Promise<FormatKeluaran> {
  if (formatTerpilih) return formatTerpilih;
  const kecil = document.createElement("canvas");
  kecil.width = 1;
  kecil.height = 1;
  const blob = await keBlob(kecil, "image/webp", 0.8);
  formatTerpilih = blob && blob.type === "image/webp" ? "image/webp" : "image/jpeg";
  return formatTerpilih;
}

function muatGambar(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("File gambar tidak bisa dibaca."));
    };
    img.src = url;
  });
}

function namaDasar(nama: string): string {
  const i = nama.lastIndexOf(".");
  const dasar = i > 0 ? nama.slice(0, i) : nama;
  return dasar || "gambar";
}

export async function kompresGambar(file: File): Promise<File> {
  const img = await muatGambar(file);
  const format = await tentukanFormat();
  const ekstensi = format === "image/webp" ? "webp" : "jpg";

  const sisiTerpanjang = Math.max(img.naturalWidth, img.naturalHeight);
  if (!sisiTerpanjang) throw new Error("Ukuran gambar tidak valid.");

  const skalaDasar = Math.min(1, MAX_SISI_PX / sisiTerpanjang);
  let terkecil: Blob | null = null;

  const bungkus = (blob: Blob) =>
    new File([blob], `${namaDasar(file.name)}.${ekstensi}`, { type: format });

  for (const faktor of FAKTOR_SKALA) {
    const w = Math.max(1, Math.round(img.naturalWidth * skalaDasar * faktor));
    const h = Math.max(1, Math.round(img.naturalHeight * skalaDasar * faktor));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Browser tidak mendukung kompresi gambar.");

    // JPG tidak punya transparansi, jadi latarnya diputihkan.
    if (format === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);

    for (const kualitas of KUALITAS) {
      const blob = await keBlob(canvas, format, kualitas);
      if (!blob) continue;
      if (!terkecil || blob.size < terkecil.size) terkecil = blob;
      if (blob.size <= TARGET_BYTE) return bungkus(blob);
    }
  }

  if (!terkecil) throw new Error("Gagal mengompres gambar.");
  if (terkecil.size > BATAS_BUCKET_BYTE) {
    throw new Error("Gambar masih lebih dari 5 MB setelah dikompres.");
  }
  return bungkus(terkecil);
}