import type { ReactNode } from "react";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { Tag } from "../../components/ui/Tag";

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <p className="text-label uppercase text-muted">{title}</p>
      {children}
    </section>
  );
}

export default function KomponenPage() {
  return (
    <main className="mx-auto max-w-3xl space-y-12 px-6 py-16">
      <h1 className="text-h2">Komponen dasar</h1>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Lihat Project</Button>
          <Button variant="outline">Download CV</Button>
          <Button variant="gray">Kontak</Button>
          <Button size="sm">Small</Button>
          <Button variant="gray" size="icon" aria-label="Berikutnya">
            →
          </Button>
          <Button disabled>Disabled</Button>
        </div>
      </Section>

      <Section title="Tags">
        <div className="flex flex-wrap gap-2">
          <Tag>SQL</Tag>
          <Tag>Python</Tag>
          <Tag>[Tool]</Tag>
          <Tag active>All</Tag>
        </div>
      </Section>

      <Section title="Input">
        <div className="space-y-3">
          <Input
            icon={<SearchIcon />}
            placeholder="Cari project"
            aria-label="Cari project"
          />
          <Input variant="filled" placeholder="Nama" aria-label="Nama" />
        </div>
      </Section>

      <Section title="Card">
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>Surface</Card>
          <Card variant="outline">Outline</Card>
          <Card variant="featured">Featured</Card>
        </div>
      </Section>

      <Section title="Spinner">
        <div className="flex items-center gap-4">
          <Spinner size="sm" />
          <Spinner />
          <Spinner size="lg" />
        </div>
      </Section>
    </main>
  );
}