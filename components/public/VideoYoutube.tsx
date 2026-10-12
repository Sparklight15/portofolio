"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { embedYoutube, thumbnailYoutube } from "../../lib/youtube";

const ORIGIN_YT = "https://www.youtube-nocookie.com";

// Thumbnail YouTube + tombol play. Pemutar baru dimuat SETELAH diklik.
//
// cacheComponents menyimpan halaman yang ditinggalkan di belakang layar, dan
// iframe autoplay-nya bisa nyala lagi sendiri. Pengamannya:
// 1. pause dikirim ke pemutar (enablejsapi) saat halaman disembunyikan/ditinggalkan,
// 2. kalau iframe dimuat untuk KEDUA kalinya (reload oleh browser), pemutar
//    ditutup dan kembali ke thumbnail, jadi tidak ada autoplay ulang,
// 3. pemutar ditutup kalau alamat halaman berubah.
export default function VideoYoutube({
  youtubeId,
  judul,
}: {
  youtubeId: string;
  judul: string;
}) {
  const [main, setMain] = useState(false);
  const pathname = usePathname();
  const [alamatAwal] = useState(pathname);

  const kotak = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const jumlahMuat = useRef(0);

  // Alamat berubah (pindah halaman) -> tutup pemutar.
  if (main && pathname !== alamatAwal) {
    setMain(false);
  }

  // Selama pemutar aktif: saat halaman disembunyikan / ditinggalkan / komponen
  // dilepas, kirim perintah pause dulu.
  useEffect(() => {
    if (!main) return;
    const frame = iframeRef.current;
    return () => {
      try {
        frame?.contentWindow?.postMessage(
          JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
          ORIGIN_YT
        );
      } catch {
        // abaikan
      }
      setMain(false);
    };
  }, [main]);

  // Kotak jadi tak terlihat (display: none) -> pause dan tutup pemutar.
  useEffect(() => {
    const el = kotak.current;
    if (!el || !main || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r && r.width === 0 && r.height === 0) {
        try {
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ event: "command", func: "pauseVideo", args: [] }),
            ORIGIN_YT
          );
        } catch {
          // abaikan
        }
        setMain(false);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [main]);

  function mulaiMain() {
    jumlahMuat.current = 0;
    setMain(true);
  }

  // Muat pertama = normal. Muat berikutnya = reload tak diminta -> tutup.
  function saatIframeMuat() {
    jumlahMuat.current += 1;
    if (jumlahMuat.current > 1) setMain(false);
  }

  return (
    <div
      ref={kotak}
      className="relative aspect-video overflow-hidden rounded-[14px] border-2 border-foreground bg-surface"
    >
      {main ? (
        <iframe
          ref={iframeRef}
          src={`${embedYoutube(youtubeId)}&enablejsapi=1`}
          title={judul}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={saatIframeMuat}
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={mulaiMain}
          aria-label={`Putar ${judul}`}
          className="group absolute inset-0 block h-full w-full cursor-pointer border-0 bg-transparent p-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailYoutube(youtubeId)}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 group-hover:scale-105"
          />
          <span className="absolute inset-0 bg-foreground/10" />
          <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-foreground bg-background shadow-[3px_3px_0_#111] motion-safe:transition-transform motion-safe:duration-300 group-hover:scale-110">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="#111111"
              aria-hidden="true"
            >
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}