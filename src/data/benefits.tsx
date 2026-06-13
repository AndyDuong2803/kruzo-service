import { FiCheckCircle, FiClipboard, FiDatabase, FiFileText, FiRefreshCw, FiSettings, FiTool, FiUploadCloud, FiUserCheck } from "react-icons/fi";

import { IBenefit } from "@/types"

export const benefits: IBenefit[] = [
    {
        title: "Document intake without repeated typing",
        description: "Turn incoming service documents into structured fields while keeping the workflow familiar for staff.",
        bullets: [
            {
                title: "Multiple source formats",
                description: "Work with PDFs, scans, photos, invoices, repair documents, and customer files.",
                icon: <FiFileText size={26} />
            },
            {
                title: "Field extraction",
                description: "Capture names, dates, totals, line items, notes, and custom fields.",
                icon: <FiClipboard size={26} />
            },
            {
                title: "Structured output",
                description: "Prepare clean rows or mapped fields for downstream work.",
                icon: <FiDatabase size={26} />
            }
        ],
        imageSrc: "/images/mockup-1.webp"
    },
    {
        title: "Human review stays in the loop",
        description: "AI handles the first pass, then staff approve uncertain values before any export happens.",
        bullets: [
            {
                title: "Review checkpoints",
                description: "Focus staff attention on fields that need confirmation.",
                icon: <FiCheckCircle size={26} />
            },
            {
                title: "Workflow fit",
                description: "Match the review process to the way your team already works.",
                icon: <FiUserCheck size={26} />
            },
            {
                title: "Practical corrections",
                description: "Reviewers can fix fields before the data reaches a spreadsheet or system.",
                icon: <FiRefreshCw size={26} />
            }
        ],
        imageSrc: "/images/mockup-2.webp"
    },
    {
        title: "Outputs for real operations",
        description: "Export data in the structure needed by the next tool instead of forcing teams into a generic format.",
        bullets: [
            {
                title: "Excel-ready rows",
                description: "Send reviewed document data to spreadsheets with predictable columns.",
                icon: <FiUploadCloud size={26} />
            },
            {
                title: "Internal mappings",
                description: "Prepare fields for the systems your operation already depends on.",
                icon: <FiSettings size={26} />
            },
            {
                title: "Service workflows",
                description: "Support repair orders, customer forms, invoice capture, and similar repeat document work.",
                icon: <FiTool size={26} />
            }
        ],
        imageSrc: "/images/mockup-1.webp"
    },
]
