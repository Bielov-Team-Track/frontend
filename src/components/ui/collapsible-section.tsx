"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import * as React from "react";

interface CollapsibleSectionProps {
	label: string;
	children: React.ReactNode;
	defaultOpen?: boolean;
	className?: string;
	"data-testid"?: string;
}

export function CollapsibleSection({ label, children, defaultOpen = false, className, "data-testid": testId }: CollapsibleSectionProps) {
	const [isOpen, setIsOpen] = React.useState(defaultOpen);

	return (
		<div className={cn("border border-border rounded-lg", className)} data-testid={testId}>
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors rounded-lg">
				<span>{label}</span>
				<ChevronDown className={cn("h-4 w-4 transition-transform duration-200", isOpen && "rotate-180")} />
			</button>
			<div className={cn("overflow-hidden transition-all duration-200", isOpen ? "max-h-250 opacity-100" : "max-h-0 opacity-0")}>
				<div className="px-4 pb-4 pt-2 space-y-4">{children}</div>
			</div>
		</div>
	);
}
