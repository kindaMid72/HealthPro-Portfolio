import Link from "next/link";
import ArticleCard from "./ArticleCard";
import SectionHeading from "./SectionHeading";
import type { PublicArticleSummary } from "@/lib/types";

export default function ArticlesSection({ articles }: { articles: PublicArticleSummary[] }) {
  if (articles.length === 0) return null;

  const [lead, ...rest] = articles.slice(0, 3);

  return (
    <section
      id="artikel"
      aria-labelledby="artikel-heading"
      className="section-spacing border-t border-border bg-bg px-4 md:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          id="artikel-heading"
          title="Artikel edukasi"
          intro="Informasi medis seputar kesehatan telinga, hidung, tenggorok, dan bedah kepala-leher yang ditinjau langsung oleh dokter spesialis."
          action={
            <Link href="/artikel" className="btn btn-sm btn-secondary">
              Semua artikel
            </Link>
          }
        />
        <div className="grid gap-8 lg:grid-cols-2">
          <ArticleCard article={lead} />
          {rest.length > 0 && (
            <div className="grid content-start gap-4">
              {rest.map((article) => (
                <ArticleCard key={article.id} article={article} variant="compact" />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
