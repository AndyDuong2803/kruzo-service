import {
    FiAlertCircle,
    FiCamera,
    FiCheckCircle,
    FiClipboard,
    FiDatabase,
    FiFileText,
    FiRefreshCw,
    FiSettings,
    FiTool,
    FiUploadCloud,
    FiUserCheck,
} from "react-icons/fi";

type LandingItem = {
    title: string;
    description: string;
    icon: JSX.Element;
};

type LandingStep = {
    eyebrow: string;
    title: string;
    description: string;
};

export const problemPoints: LandingItem[] = [
    {
        title: "Documents arrive in too many formats",
        description: "PDFs, scans, photos, invoices, repair notes, and customer forms rarely follow one clean layout.",
        icon: <FiFileText size={24} />,
    },
    {
        title: "Manual entry slows every handoff",
        description: "Teams copy fields into spreadsheets or internal systems, then recheck the same values later.",
        icon: <FiClipboard size={24} />,
    },
    {
        title: "Errors hide inside routine work",
        description: "Small typos in names, dates, totals, or job details can create rework without a clear review step.",
        icon: <FiAlertCircle size={24} />,
    },
];

export const solutionWorkflow: LandingStep[] = [
    {
        eyebrow: "01",
        title: "Collect the source files",
        description: "Upload PDFs, scanned forms, invoices, repair documents, photos, or customer files from the workflow you already use.",
    },
    {
        eyebrow: "02",
        title: "Let AI extract the fields",
        description: "Kruzo reads the document and proposes structured fields, line items, tables, and confidence signals.",
    },
    {
        eyebrow: "03",
        title: "Review before export",
        description: "Staff check uncertain values and approve the extracted data before it moves into the next system.",
    },
    {
        eyebrow: "04",
        title: "Export in the needed format",
        description: "Send clean data to Excel, JSON, or the internal system format your operation relies on.",
    },
];

export const useCases: LandingItem[] = [
    {
        title: "Invoice capture",
        description: "Extract vendor names, invoice numbers, dates, totals, taxes, and line-item details for review.",
        icon: <FiDatabase size={24} />,
    },
    {
        title: "Repair documents",
        description: "Turn repair orders, work notes, parts lists, and service summaries into structured job data.",
        icon: <FiTool size={24} />,
    },
    {
        title: "Customer forms",
        description: "Capture customer details, request types, signatures, and supporting fields from intake paperwork.",
        icon: <FiUserCheck size={24} />,
    },
    {
        title: "Scanned forms",
        description: "Process photographed or scanned paperwork while keeping a review step for unclear values.",
        icon: <FiCamera size={24} />,
    },
    {
        title: "Spreadsheet workflows",
        description: "Convert repeated document work into Excel-ready rows that match your current spreadsheet format.",
        icon: <FiUploadCloud size={24} />,
    },
    {
        title: "Internal-system updates",
        description: "Prepare structured JSON or mapped fields for systems that need consistent document data.",
        icon: <FiSettings size={24} />,
    },
];

export const howItWorks: LandingStep[] = [
    {
        eyebrow: "Step 1",
        title: "Map the workflow",
        description: "Identify the document types, fields, edge cases, and approval points that matter to the team.",
    },
    {
        eyebrow: "Step 2",
        title: "Define the output",
        description: "Choose the target format: Excel columns, JSON keys, or fields for an internal system.",
    },
    {
        eyebrow: "Step 3",
        title: "Extract and review",
        description: "AI reads first, then staff review exceptions and approve the final structured data.",
    },
    {
        eyebrow: "Step 4",
        title: "Improve the loop",
        description: "Use reviewed documents to refine mappings, reduce repeated checks, and keep the workflow practical.",
    },
];

export const auditHighlights: LandingItem[] = [
    {
        title: "Document types",
        description: "Which files enter the workflow and where they come from.",
        icon: <FiFileText size={22} />,
    },
    {
        title: "Human checks",
        description: "Which fields need approval before the data is trusted.",
        icon: <FiCheckCircle size={22} />,
    },
    {
        title: "Export format",
        description: "How the final data should look for Excel, JSON, or internal tools.",
        icon: <FiRefreshCw size={22} />,
    },
];
