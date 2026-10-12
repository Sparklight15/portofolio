// Pembantu link YouTube. Hanya ID video (11 karakter) yang disimpan di database;
// thumbnail dan pemutar dibuat dari ID itu. Aman dipakai di server maupun client.

export const MAKS_VIDEO = 3;

const ID_RE = /^[A-Za-z0-9_-]{11}$/;
const HOST_YOUTUBE = new Set(["youtube.com", "youtube-nocookie.com"]);

// Mengambil ID dari link YouTube: watch?v=, youtu.be/, /shorts/, /embed/,
// /live/, /v/. Mengembalikan null kalau bukan link YouTube yang valid.
export function ambilYoutubeId(input: string): string | null {
  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;

  const host = u.hostname.toLowerCase().replace(/^(www|m)\./, "");
  let id: string | null = null;

  if (host === "youtu.be") {
    id = u.pathname.split("/")[1] ?? null;
  } else if (HOST_YOUTUBE.has(host)) {
    const bagian = u.pathname.split("/").filter(Boolean);
    if (bagian[0] === "watch") {
      id = u.searchParams.get("v");
    } else if (["shorts", "embed", "live", "v"].includes(bagian[0] ?? "")) {
      id = bagian[1] ?? null;
    }
  }

  return id && ID_RE.test(id) ? id : null;
}

export function linkYoutube(id: string): string {
  return `https://youtu.be/${id}`;
}

export function thumbnailYoutube(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

// Pemutar tanpa cookie pelacak; autoplay karena hanya dimuat setelah tombol play diklik.
export function embedYoutube(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
}