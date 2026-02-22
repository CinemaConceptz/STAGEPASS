import "./globals.css";
import Nav from "@/components/stagepass/Nav";
import ButlerDock from "@/components/butler/ButlerDock";

export const metadata = {
  title: "STAGEPASS",
  description: "You’re not posting. You’re premiering."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stage-bg text-stage-text font-sans antialiased">
        <div className="relative min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
            {children}
          </main>
        </div>

        {/* Global Butler (Encore) */}
        <ButlerDock />
      </body>
    </html>
  );
}