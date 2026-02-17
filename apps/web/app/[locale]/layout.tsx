import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "sonner";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { locales } from '@/navigation';

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const localeToOgLocale: Record<string, string> = {
  en: "en_US",
  vi: "vi_VN",
  "zh-TW": "zh_TW",
  es: "es_ES",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const alternateLanguages = Object.fromEntries(
    locales.map((loc) => [loc, `/${loc}`])
  );

  return {
    metadataBase: new URL("https://enigmatic.works"),
    title: {
      default: t('site.title'),
      template: "%s | Enigmatic",
    },
    description: t('site.description'),
    openGraph: {
      type: "website",
      siteName: "Enigmatic",
      locale: localeToOgLocale[locale] || locale,
      images: [
        {
          url: "/images/brand/brand-image.jpg",
          width: 1200,
          height: 630,
          alt: t('site.ogImageAlt'),
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t('site.twitterTitle'),
      description: t('site.twitterDescription'),
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
    alternates: {
      languages: alternateLanguages,
    },
  };
}

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages({ locale });

  const t = await getTranslations({ locale, namespace: 'Metadata' });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Enigmatic",
        url: "https://enigmatic.works",
        logo: "https://enigmatic.works/images/brand/enigmatic-logo.png",
        description: t('org.description'),
      },
      {
        "@type": "WebSite",
        name: "Enigmatic",
        url: "https://enigmatic.works",
        inLanguage: [...locales],
      },
    ],
  };

  return (
    <html lang={locale} suppressHydrationWarning>
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
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider>
              {children}
              <Toaster position="bottom-right" richColors closeButton duration={3000} visibleToasts={3} />
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
