import { getSupabaseAdmin } from "./supabase-server";
import type { ProjectCardData } from "../components/public/ProjectGallery";

type ImageRow = {
  image_url: string;
  alt_text?: string | null;
  caption: string | null;
  sort_order: number | null;
  is_thumbnail?: boolean | null;
};
type ToolRef = { name: string | null; icon_url?: string | null };
type ToolRow = { tools: ToolRef | ToolRef[] | null };
type LinkRow = { label: string | null; url: string | null; sort_order: number | null };
type VideoRow = { youtube_id: string | null; sort_order: number | null };

type ListRow = {
  slug: string;
  title: string;
  category: string;
  project_year: number | null;
  project_images: ImageRow[] | null;
  project_tools: ToolRow[] | null;
};

type DetailRow = {
  slug: string;
  title: string;
  category: string;
  project_year: number | null;
  summary: string | null;
  problem: string | null;
  insight: string | null;
  product_name: string | null;
  product_description: string | null;
  product_url: string | null;
  project_images: ImageRow[] | null;
  project_links: LinkRow[] | null;
  project_tools: ToolRow[] | null;
  project_videos: VideoRow[] | null;
};

export type ProjectDetailData = {
  slug: string;
  title: string;
  category: string;
  year: number | null;
  summary: string | null;
  problem: string | null;
  insight: string | null;
  productName: string | null;
  productDescription: string | null;
  productUrl: string | null;
  videos: { youtubeId: string }[];
  images: { url: string; alt: string | null; caption: string | null }[];
  links: { label: string; url: string }[];
  tools: { name: string; iconUrl: string | null }[];
  position: number;
  total: number;
};

const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

function clean(value: string | null | undefined): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function flattenTools(rows: ToolRow[] | null) {
  return (rows ?? [])
    .flatMap((pt) =>
      Array.isArray(pt.tools) ? pt.tools : pt.tools ? [pt.tools] : []
    )
    .filter(
      (t): t is { name: string; icon_url?: string | null } =>
        typeof t.name === "string" && t.name.length > 0
    );
}

// Hanya untuk dipanggil dari server component. Memakai kunci secret (RLS dilewati),
// jadi filter published = true WAJIB ada di query.
export async function getPublicProjects(): Promise<{
  data: ProjectCardData[];
  error: string | null;
}> {
  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("projects")
      .select(
        "slug, title, category, project_year, project_images(image_url, caption, sort_order, is_thumbnail), project_tools(tools(name))"
      )
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) return { data: [], error: error.message };

    const rows = (data ?? []) as unknown as ListRow[];
    const items: ProjectCardData[] = rows.map((r) => {
      const gambarUrut = [...(r.project_images ?? [])].sort(
        (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
      );
      // Thumbnail pilihan admin; kalau belum ada, pakai gambar pertama.
      const gambarKartu =
        gambarUrut.find((img) => img.is_thumbnail === true) ?? gambarUrut[0];

      const tools = flattenTools(r.project_tools)
        .map((t) => t.name)
        .sort((a, b) => a.localeCompare(b));

      return {
        slug: r.slug,
        title: r.title,
        category: r.category,
        year: r.project_year,
        tools,
        imageUrl: gambarKartu?.image_url ?? null,
        caption: gambarKartu?.caption?.trim() || null,
      };
    });

    return { data: items, error: null };
  } catch (e) {
    return {
      data: [],
      error: e instanceof Error ? e.message : "Terjadi kesalahan.",
    };
  }
}

// Detail satu project. data = null dan error = null artinya tidak ditemukan / belum terbit.
export async function getPublicProjectDetail(slug: string): Promise<{
  data: ProjectDetailData | null;
  error: string | null;
}> {
  try {
    const supabase = getSupabaseAdmin();

    const [detailRes, listRes] = await Promise.all([
      supabase
        .from("projects")
        .select(
          "slug, title, category, project_year, summary, problem, insight, product_name, product_description, product_url, project_images(image_url, alt_text, caption, sort_order), project_links(label, url, sort_order), project_tools(tools(name, icon_url)), project_videos(youtube_id, sort_order)"
        )
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle(),
      supabase
        .from("projects")
        .select("slug")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    if (detailRes.error) return { data: null, error: detailRes.error.message };
    if (listRes.error) return { data: null, error: listRes.error.message };
    if (!detailRes.data) return { data: null, error: null };

    const r = detailRes.data as unknown as DetailRow;
    const slugs = (listRes.data ?? []).map((x) => String(x.slug));
    const index = slugs.indexOf(r.slug);

    const images = [...(r.project_images ?? [])]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .filter((img) => typeof img.image_url === "string" && img.image_url)
      .map((img) => ({
        url: img.image_url,
        alt: clean(img.alt_text),
        caption: clean(img.caption),
      }));

    const links = [...(r.project_links ?? [])]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .flatMap((l) => {
        const url = clean(l.url);
        // Hanya http(s): jangan pernah render javascript: dan sejenisnya.
        if (!url || !/^https?:\/\//i.test(url)) return [];
        return [{ label: clean(l.label) ?? "Lihat Project", url }];
      });

    const tools = flattenTools(r.project_tools)
      .map((t) => ({ name: t.name, iconUrl: clean(t.icon_url) }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Produk tampil hanya kalau namanya terisi. Link produk hanya http(s).
    const productName = clean(r.product_name);
    const productUrlRaw = clean(r.product_url);
    const productUrl =
      productName && productUrlRaw && /^https?:\/\//i.test(productUrlRaw)
        ? productUrlRaw
        : null;

    // Video: hanya ID YouTube 11 karakter yang valid, urut sort_order, maks 3.
    const videos = [...(r.project_videos ?? [])]
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .flatMap((v) =>
        typeof v.youtube_id === "string" && YOUTUBE_ID.test(v.youtube_id)
          ? [{ youtubeId: v.youtube_id }]
          : []
      )
      .slice(0, 3);

    return {
      data: {
        slug: r.slug,
        title: r.title,
        category: r.category,
        year: r.project_year,
        summary: clean(r.summary),
        problem: clean(r.problem),
        insight: clean(r.insight),
        productName,
        productDescription: productName ? clean(r.product_description) : null,
        productUrl,
        videos,
        images,
        links,
        tools,
        position: index >= 0 ? index + 1 : 1,
        total: Math.max(slugs.length, 1),
      },
      error: null,
    };
  } catch (e) {
    return {
      data: null,
      error: e instanceof Error ? e.message : "Terjadi kesalahan.",
    };
  }
}