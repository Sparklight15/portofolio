function Stripes() {
  return (
    <svg
      className="shrink-0"
      width="64"
      height="22"
      viewBox="0 0 64 22"
      aria-hidden="true"
    >
      <path d="M8 0H34L26 22H0Z" fill="#111111" />
      <path d="M40 0H44L36 22H32Z" fill="#111111" />
      <path d="M50 0H54L46 22H42Z" fill="#111111" />
    </svg>
  );
}

export function DecorLine() {
  return (
    <div className="flex items-center gap-5">
      <Stripes />
      <div className="relative h-0.5 flex-1 bg-foreground">
        <div className="absolute -right-0.5 -top-1 h-2.5 w-2.5 rounded-full bg-foreground" />
      </div>
      <Stripes />
    </div>
  );
}

// DEPRECATED: panah halaman sekarang dirender sekali oleh GlobalArrows di
// app/layout.tsx. Komponen ini sengaja tidak menampilkan apa pun supaya
// pemanggil lama (Home, About, Project, Tools, Contact) tidak menggandakan panah.
export function PageArrow(props: {
  href: string;
  label: string;
  side: "left" | "right";
  fixed?: boolean;
}) {
  void props;
  return null;
}