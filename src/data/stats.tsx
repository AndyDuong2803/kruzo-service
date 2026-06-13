import { BsBarChartFill, BsFillCheckCircleFill } from "react-icons/bs";
import { PiFileJsFill } from "react-icons/pi";

import { IStats } from "@/types";

export const stats: IStats[] = [
    {
        title: "AI first",
        icon: <BsBarChartFill size={34} className="text-blue-500" />,
        description: "Documents are read by AI before staff review the extracted fields."
    },
    {
        title: "Review",
        icon: <BsFillCheckCircleFill size={34} className="text-green-600" />,
        description: "Uncertain values stay visible so teams can check before export."
    },
    {
        title: "Excel / JSON",
        icon: <PiFileJsFill size={34} className="text-slate-700" />,
        description: "Structured output can match spreadsheets, JSON payloads, or internal fields."
    }
];
