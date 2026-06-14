import { IMenuItem, ISocials } from "@/types";

export const footerDetails: {
    subheading: string;
    conversionLine: string;
    quickLinks: IMenuItem[];
    ctaLinks: IMenuItem[];
    contactText: string;
    email: string;
    telephone: string;
    socials: ISocials;
} = {
    subheading: "AI document automation that turns service-business files into reviewable, structured data.",
    conversionLine: "Ready to test your document workflow?",
    quickLinks: [
        {
            text: "Excel Demo",
            url: "/try"
        },
        {
            text: "API Playground",
            url: "/try/api"
        },
        {
            text: "API Keys",
            url: "/api-keys"
        },
        {
            text: "Pricing",
            url: "/pricing"
        },
        {
            text: "Docs",
            url: "/docs"
        }
    ],
    ctaLinks: [
        {
            text: "Free Workflow Audit",
            url: "/#audit"
        },
        {
            text: "Try Excel Demo",
            url: "/try"
        },
        {
            text: "Read API Docs",
            url: "/docs"
        }
    ],
    contactText: "For workflow questions, start with the free audit request and share the document flow you want reviewed.",
    email: '',
    telephone: '',
    socials: {}
}
