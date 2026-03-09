import { notFound } from "next/navigation";
import { legalContent } from "@/lib/legal-content";

export async function generateStaticParams() {
  return Object.keys(legalContent).map((slug) => ({ slug }));
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const doc = legalContent[params.slug];

  if (!doc) {
    notFound();
  }

  return (
    <article className="prose prose-invert prose-indigo max-w-none">
      <div dangerouslySetInnerHTML={{ __html: doc.content }} />
    </article>
  );
}
