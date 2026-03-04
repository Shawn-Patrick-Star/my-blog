import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SectionHeaderProps {
    title: string;
    accentColor?: string;       // Tailwind color class for accent bar (e.g. "bg-amber-400")
    actionLabel?: string;       // Button text (e.g. "写新笔记")
    actionHref?: string;        // Button link
    actionColorClass?: string;  // Button color scheme
    showAction?: boolean;       // Whether to show the action button (admin only)
}

export function SectionHeader({
    title,
    accentColor = "bg-primary",
    actionLabel,
    actionHref,
    actionColorClass = "text-primary border-border hover:bg-accent",
    showAction = false,
}: SectionHeaderProps) {
    return (
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                <span className={`w-2 h-8 ${accentColor} rounded-full`} />
                {title}
            </h2>
            {showAction && actionLabel && actionHref && (
                <Link href={actionHref}>
                    <Button
                        variant="outline"
                        size="sm"
                        className={`gap-1 ${actionColorClass} shadow-sm rounded-full px-4`}
                    >
                        <Plus size={16} /> {actionLabel}
                    </Button>
                </Link>
            )}
        </div>
    );
}
