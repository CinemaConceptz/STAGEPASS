import "./globals.css";
import Nav from "@/components/stagepass/Nav";
import Footer from "@/components/stagepass/Footer";
import ButlerDock from "@/components/butler/ButlerDock";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "STAGEPASS",
  description: "You're not posting. You're premiering.",
  manifest: "/manifest.json",
  themeColor: "#D946EF",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent" as const,
    title: "STAGEPASS",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="STAGEPASS" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
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
