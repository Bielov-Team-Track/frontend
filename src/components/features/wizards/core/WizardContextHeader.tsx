"use client";

import { cn } from "@/lib/utils";
import { Building2, ChevronRight, Pencil, Users } from "lucide-react";
import { ContextHeaderInfo } from "./types";

interface WizardContextHeaderProps {
	info: ContextHeaderInfo;
	onEdit?: () => void;
	className?: string;
}

export function WizardContextHeader({ info, onEdit, className }: WizardContextHeaderProps) {
	const { clubName, teamName, groupName, isEditable } = info;

	// Don't render if no context
	if (!clubName && !teamName && !groupName) return null;

	return (
		<div className={cn("flex items-center justify-between px-4 py-3 bg-muted/50 rounded-lg border border-border", className)}>
			<div className="flex items-center gap-2 text-sm">
				{clubName && (
					<>
						<Building2 size={14} className="text-muted-foreground" />
						<span className="font-medium">{clubName}</span>
					</>
				)}

				{(teamName || groupName) && (
					<>
						<ChevronRight size={14} className="text-muted-foreground" />
						<Users size={14} className="text-muted-foreground" />
						<span className="text-muted-foreground">{teamName || groupName}</span>
					</>
				)}
			</div>

			{isEditable && onEdit && (
				<button type="button" onClick={onEdit} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
					<Pencil size={12} />
					Change
				</button>
			)}
		</div>
	);
}
