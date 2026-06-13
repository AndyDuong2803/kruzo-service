import { IFAQ } from "@/types";
import { siteDetails } from "./siteDetails";

export const faqs: IFAQ[] = [
    {
        question: `What kinds of documents can ${siteDetails.siteName} process?`,
        answer: 'Kruzo is designed for service-business documents such as PDFs, scanned forms, invoices, repair documents, customer intake forms, and supporting files that need to become structured data.',
    },
    {
        question: 'Does AI replace the staff review step?',
        answer: 'No. The intended workflow is AI first, human review second. Your team can check extracted fields, correct uncertain values, and approve the output before it is exported.',
    },
    {
        question: 'What output formats are supported?',
        answer: 'The landing flow focuses on Excel, JSON, and internal-system handoff formats. The exact export structure should match the workflow you want to automate.'
    },
    {
        question: 'Can Kruzo handle scanned or photographed documents?',
        answer: 'Yes, the product positioning includes scanned forms and photographed files. Quality still matters, so low-resolution or heavily obscured scans may need review.',
    },
    {
        question: 'How should we start?',
        answer: 'Start with a free workflow audit. We review the document types, fields, review steps, and export format before recommending an automation flow.'
    }
];
