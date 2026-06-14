import type { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google';
import { Source_Sans_3, Manrope } from "next/font/google";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { siteDetails } from '@/data/siteDetails';
import { canonicalDomain, createMetadata, seoRoutes } from "@/lib/seo";

import "./globals.css";

const manrope = Manrope({ subsets: ['latin'] });
const sourceSans = Source_Sans_3({ subsets: ['latin'] });

const themeInitScript = `
  (function() {
    try {
      var storedTheme = localStorage.getItem('kruzo-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var shouldUseDark = storedTheme ? storedTheme === 'dark' : prefersDark;
      document.documentElement.classList.toggle('dark', shouldUseDark);
      document.documentElement.dataset.theme = shouldUseDark ? 'dark' : 'light';
    } catch (error) {
      document.documentElement.dataset.theme = 'light';
    }
  })();
`;

export const metadata: Metadata = {
  metadataBase: new URL(canonicalDomain),
  applicationName: siteDetails.siteName,
  ...createMetadata(seoRoutes.home),
  icons: {
    icon: siteDetails.siteLogo,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${manrope.className} ${sourceSans.className} antialiased`}
      >
        {siteDetails.googleAnalyticsId && <GoogleAnalytics gaId={siteDetails.googleAnalyticsId} />}
        <Header />
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
