import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://enigmaticpartners.com"),
  title: {
    default: "Enigmatic | We design, connect, and orchestrate the processes your core systems ignore.",
    template: "%s | Enigmatic",
  },
  description:
    "Modern supply chains are breaking under the weight of outdated tools and disconnected systems. Manual workflows, disconnected TMS modules, and fragmented processes quietly eat margins and create bottlenecks. Discover how Enigmatic helps solve logistics fragmentation.",
  openGraph: {
    type: "website",
    siteName: "Enigmatic",
    locale: "en_US",
    images: [
      {
        url: "/images/brand/brand-image.jpg",
        width: 1200,
        height: 630,
        alt: "Enigmatic — Operational Orchestration Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Enigmatic | Operational Orchestration Platform",
    description: "We design, connect, and orchestrate the processes your core systems ignore. Solve logistics fragmentation with automated flows.",
    images: ["/images/brand/brand-image.jpg"],
  },
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

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Enigmatic",
      url: "https://enigmaticpartners.com",
      logo: "https://enigmaticpartners.com/images/brand/enigmatic-logo.png",
      description: "We design, connect, and orchestrate the processes your core systems ignore. Operational orchestration for modern supply chains.",
    },
    {
      "@type": "WebSite",
      name: "Enigmatic",
      url: "https://enigmaticpartners.com",
      inLanguage: "en",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
          {children}
          <Toaster position="bottom-right" richColors closeButton duration={3000} visibleToasts={3} />
        </ThemeProvider>
      </body>
    </html>
  );
}
