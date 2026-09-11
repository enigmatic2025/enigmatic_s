import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { contactEmail, siteDescription, siteName, siteUrl } from "@/lib/site";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName,
    locale: "en_US",
    images: [
      {
        url: "/images/brand/brand-image.jpg",
        width: 1200,
        height: 630,
        alt: `${siteName} — consulting, data engineering, and custom software`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
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
    title: siteName,
  },
};

export const viewport: Viewport = {
  themeColor: "#090909",
  colorScheme: "dark",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/images/brand/enigmatic-logo.png`,
      email: contactEmail,
      description: siteDescription,
    },
    {
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
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
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${geistMono.variable} antialiased font-sans`}>
        {children}
        <Toaster theme="dark" position="bottom-right" richColors closeButton duration={3000} visibleToasts={3} />
      </body>
    </html>
  );
}
