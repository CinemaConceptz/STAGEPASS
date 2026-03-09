import Link from "next/link";
import { legalContent } from "@/lib/legal-content";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 flex flex-col md:flex-row gap-12">
      <aside className="w-full md:w-64 flex-shrink-0">
        <h3 className="font-bold text-stage-mutetext uppercase tracking-wider mb-4 px-2">Legal Center</h3>
        <nav className="flex flex-col space-y-1">
          {Object.keys(legalContent).map((slug) => (
            <Link
              key={slug}
              href={`/legal/${slug}`}
              className="block px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors capitalize"
            >
              {legalContent[slug].title}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">
        <div className="bg-stage-panel border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
