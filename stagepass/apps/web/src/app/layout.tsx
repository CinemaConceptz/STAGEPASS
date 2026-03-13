import "./globals.css";
import Sidebar from "@/components/stagepass/Sidebar";
import ButlerDock from "@/components/butler/ButlerDock";
import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "STAGEPASS",
  description: "You're not posting. You're premiering.",
  manifest: "/manifest.json",
  themeColor: "#0A0A0A",
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
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-screen bg-stage-bg text-stage-text font-sans antialiased">
        <AuthProvider>
          <Sidebar />
          <main className="ml-56 min-h-screen">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
              {children}
            </div>
          </main>
          <ButlerDock />
        </AuthProvider>
      </body>
    </html>
  );
}
