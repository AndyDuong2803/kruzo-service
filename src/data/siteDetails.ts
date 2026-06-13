export const siteDetails = {
    siteName: 'Kruzo Document AI',
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://kruzo-document-ai-web.vercel.app/',
    metadata: {
        title: 'Kruzo Document AI - AI Document Automation for Service Businesses',
        description: 'Extract data from PDFs, scanned forms, invoices, repair documents, and customer files into Excel, JSON, or internal systems using AI.',
    },
    language: 'en-us',
    locale: 'en-US',
    siteLogo: `${process.env.BASE_PATH || ''}/images/logo.png`, // or use a string for the logo e.g. "TechStartup"
    googleAnalyticsId: '', // e.g. G-XXXXXXX,
}
