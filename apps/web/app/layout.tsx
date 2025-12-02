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
  metadataBase: new URL("https://enigmatic.io"),
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
  title: "Enigmatic | The Logistics Fragmentation Problem",
  description:
    "Modern supply chains are breaking under the weight of outdated tools and disconnected systems. Manual workflows, disconnected TMS modules, and fragmented processes quietly eat margins and create bottlenecks. Discover how Enigmatic helps solve logistics fragmentation.",
  icons: {
    icon: "/images/brand/enigmatic-logo.png",
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
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
