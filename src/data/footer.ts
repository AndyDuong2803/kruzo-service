import { IMenuItem, ISocials } from "@/types";

export const footerDetails: {
    subheading: string;
    quickLinks: IMenuItem[];
    ctaLinks: IMenuItem[];
    email: string;
    telephone: string;
    socials: ISocials;
} = {
    subheading: "AI document automation that turns service-business files into reviewable, structured data.",
    quickLinks: [
        {
            text: "Problem",
            url: "#problem"
        },
        {
            text: "Workflow",
            url: "#workflow"
        },
        {
            text: "Use Cases",
            url: "#use-cases"
        },
        {
            text: "FAQ",
            url: "#faq"
        }
    ],
    ctaLinks: [
        {
            text: "Try Demo",
            url: "/try"
        },
        {
            text: "Get Free Workflow Audit",
            url: "/audit"
        }
    ],
    email: '',
    telephone: '',
    socials: {}
}
