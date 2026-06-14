import type { Metadata } from "next";

import { faqs } from "@/data/faq";
import { siteDetails } from "@/data/siteDetails";

export const canonicalDomain = "https://document-ai.kruzo.tech";
export const productionApiDomain = "https://api.smartocr.kruzo.tech";

export type SeoRoute = {
  path: string;
  title: string;
  description: string;
  keywords?: string[];
  priority: number;
};

export const seoRoutes = {
  home: {
    path: "/",
    title: "Kruzo Document AI - AI Document Automation for Service Businesses",
    description:
      "Extract data from PDFs, scanned forms, invoices, repair documents, and customer files into Excel, JSON, or internal systems using AI.",
    keywords: [
      "AI document extraction",
      "document to Excel automation",
      "OCR for invoices",
      "OCR for scanned forms",
      "repair document extraction",
    ],
    priority: 1,
  },
  try: {
    path: "/try",
    title: "Try Kruzo Document AI - Document to Excel Demo",
    description:
      "Upload sample documents and preview how Kruzo turns PDFs, scans, invoices, and repair documents into Excel-ready tables.",
    keywords: ["document to Excel demo", "AI document extraction demo", "invoice OCR demo"],
    priority: 0.9,
  },
  apiPlayground: {
    path: "/try/api",
    title: "Kruzo Document AI API Playground",
    description:
      "Test the Kruzo Document AI OCR API with PDF, image, and custom schema extraction examples.",
    keywords: ["document data extraction API", "OCR API playground", "custom schema extraction"],
    priority: 0.8,
  },
  docs: {
    path: "/docs",
    title: "Kruzo Document AI API Docs",
    description:
      "Developer documentation for extracting structured data from documents using the Kruzo Document AI API.",
    keywords: ["document data extraction API docs", "OCR API documentation", "document extraction developer API"],
    priority: 0.8,
  },
  apiKeys: {
    path: "/api-keys",
    title: "Kruzo Document AI API Keys - Beta Access",
    description:
      "Learn how Kruzo Document AI API key access will support secure document data extraction workflows during beta.",
    keywords: ["OCR API keys", "document extraction API access"],
    priority: 0.5,
  },
  pricing: {
    path: "/pricing",
    title: "Kruzo Document AI Pricing - Workflow Audit and Pilot Options",
    description:
      "Review free workflow audit, paid pilot, and custom workflow options for AI document automation projects.",
    keywords: ["AI document automation pricing", "document extraction pilot", "OCR workflow audit"],
    priority: 0.7,
  },
} satisfies Record<string, SeoRoute>;

export const absoluteUrl = (path: string) => {
  if (path.startsWith("http")) {
    return path;
  }

  return `${canonicalDomain}${path.startsWith("/") ? path : `/${path}`}`;
};

const sharedImage = {
  url: absoluteUrl("/images/hero-mockup.webp"),
  alt: `${siteDetails.siteName} document extraction interface`,
};

export const createMetadata = (route: SeoRoute): Metadata => ({
  title: route.title,
  description: route.description,
  keywords: route.keywords,
  alternates: {
    canonical: absoluteUrl(route.path),
  },
  openGraph: {
    title: route.title,
    description: route.description,
    url: absoluteUrl(route.path),
    siteName: siteDetails.siteName,
    type: "website",
    locale: siteDetails.locale,
    images: [sharedImage],
  },
  twitter: {
    card: "summary_large_image",
    title: route.title,
    description: route.description,
    images: [sharedImage.url],
  },
});

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteDetails.siteName,
  url: canonicalDomain,
  logo: absoluteUrl("/kruzo-mark.svg"),
};

export const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteDetails.siteName,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: canonicalDomain,
  description: seoRoutes.home.description,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free workflow audit available before paid pilot work.",
  },
};

export const tryWebApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Kruzo Document AI Document to Excel Demo",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: absoluteUrl(seoRoutes.try.path),
  description: seoRoutes.try.description,
};

export const faqPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};
