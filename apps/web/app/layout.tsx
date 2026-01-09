import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "sonner";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://enigmatic.works"),
  openGraph: {
    images: [
      {
        url: "/images/brand/brand-image.jpg",
        width: 1200,
        height: 630,
        alt: "Enigmatic Logistics Fragmentation",
      },
    ],
  },
  title: "Enigmatic | We design, connect, and orchestrate the processes your core systems ignore.",
  description:
    "Modern supply chains are breaking under the weight of outdated tools and disconnected systems. Manual workflows, disconnected TMS modules, and fragmented processes quietly eat margins and create bottlenecks. Discover how Enigmatic helps solve logistics fragmentation.",
  icons: {
    icon: [
      {
        url: "/Enigmatic/favicon-96x96.png",
        sizes: "96x96",
        type: "image/png",
      },
      { url: "/Enigmatic/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/Enigmatic/favicon.ico",
    apple: [{ url: "/Enigmatic/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/Enigmatic/site.webmanifest",
  appleWebApp: {
    title: "Enigmatic",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster position="top-center" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
