import { IPricing } from "@/types";

export const tiers: IPricing[] = [
    {
        name: 'Workflow Audit',
        price: 'Free',
        features: [
            'Document type review',
            'Field mapping outline',
            'Human review points',
            'Export format recommendation',
        ],
    },
    {
        name: 'Pilot Workflow',
        price: 'Custom',
        features: [
            'Sample document processing',
            'Excel or JSON output mapping',
            'Review queue setup',
            'Internal handoff planning',
        ],
    },
    {
        name: 'Custom Automation',
        price: 'Custom',
        features: [
            'Multiple document types',
            'Internal system mapping',
            'Exception handling rules',
            'Team workflow support',
        ],
    },
]
