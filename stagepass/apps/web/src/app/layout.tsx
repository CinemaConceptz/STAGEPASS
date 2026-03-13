import "./globals.css";
import Sidebar from "@/components/stagepass/Sidebar";
import ButlerDock from "@/components/butler/ButlerDock";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "STAGEPASS",
  description: "You're not posting. You're premiering.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon-192.png",
    apple: "/icon-192.png",
  },
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
  themeColor: "#0A0A0A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen bg-stage-bg text-stage-text font-sans antialiased">
        <AuthProvider>
          <Sidebar />
          <main className="md:ml-56 min-h-screen pt-14 md:pt-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
              {children}
            </div>
          </main>
          <ButlerDock />
        </AuthProvider>
      </body>
    </html>
  );
}
