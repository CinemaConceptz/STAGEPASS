import "./globals.css";
import Nav from "@/components/stagepass/Nav";
import Footer from "@/components/stagepass/Footer";
import ButlerDock from "@/components/butler/ButlerDock";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "STAGEPASS",
  description: "You’re not posting. You’re premiering."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stage-bg text-stage-text font-sans antialiased flex flex-col">
        <AuthProvider>
          <Nav />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
          <ButlerDock />
        </AuthProvider>
      </body>
    </html>
  );
}
