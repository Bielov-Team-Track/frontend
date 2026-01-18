"use client";

import { Button } from "@/components";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description?: string;
	action?: {
		label: string;
		onClick: () => void;
		icon?: LucideIcon;
		variant?: "secondary" | "outline" | "ghost" | "link" | "default" | "destructive";
	};
	className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
	return (
		<div className={cn("text-center py-12 rounded-2xl bg-white/5 border border-white/10", className)}>
			<Icon className="w-12 h-12 text-muted mx-auto mb-4" />
			<h4 className="text-lg font-bold text-white mb-2">{title}</h4>
			{description && <p className="text-sm text-muted mb-4">{description}</p>}
			{action && (
				<Button variant={action.variant || "outline"} onClick={action.onClick}>
					{action.icon && <action.icon size={16} />}
					{action.label}
				</Button>
			)}
		</div>
	);
}
