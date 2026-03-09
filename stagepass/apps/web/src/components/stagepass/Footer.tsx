import Link from "next/link";
import { clsx } from "clsx";

const links = [
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/community", label: "Community" },
  { href: "/legal/acceptable-use", label: "Acceptable Use" },
  { href: "/legal/creator-agreement", label: "Creator Agreement" },
  { href: "/legal/dmca", label: "DMCA" },
  { href: "/legal/moderation", label: "Moderation" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-stage-bg py-12 mt-20">
      <div className="mx-auto w-full max-w-7xl px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <div className="text-lg font-bold tracking-wider mb-2">
            STAGE<span className="text-stage-indigo">PASS</span>
          </div>
          <p className="text-xs text-stage-mutetext">
            &copy; {new Date().getFullYear()} StagePass Inc. All rights reserved.
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className="text-sm text-stage-mutetext hover:text-stage-mint transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
