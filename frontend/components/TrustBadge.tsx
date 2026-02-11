import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import { Badge } from "./ui/badge";

interface TrustBadgeProps {
    score: number;
    size?: "sm" | "md" | "lg";
}

export function TrustBadge({ score, size = "md" }: TrustBadgeProps) {
    const getTheme = () => {
        if (score >= 80) return { color: "bg-emerald-500", text: "text-emerald-500", icon: ShieldCheck, label: "Trustworthy" };
        if (score >= 50) return { color: "bg-amber-500", text: "text-amber-500", icon: Shield, label: "Reliable" };
        return { color: "bg-rose-500", text: "text-rose-500", icon: ShieldAlert, label: "New / Caution" };
    };

    const theme = getTheme();
    const Icon = theme.icon;

    return (
        <div className={`flex items-center gap-1.5 ${size === 'sm' ? 'text-[10px]' : 'text-xs'} font-bold`}>
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${theme.color}/10 border border-${theme.color}/20 ${theme.text}`}>
                <Icon className={size === 'sm' ? "h-3 w-3" : "h-4 w-4"} />
                <span>{score} Trust Score</span>
            </div>
        </div>
    );
}
