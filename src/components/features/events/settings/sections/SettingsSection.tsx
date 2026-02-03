"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface SettingsSectionProps {
	title: string;
	description?: string;
	children: ReactNode;
	className?: string;
}

export function SettingsSection({ title, description, children, className }: SettingsSectionProps) {
	return (
		<div className={cn("rounded-2xl bg-white/5 border border-white/10 p-6", className)}>
			<div className="mb-5">
				<h3 className="text-lg font-bold text-white">{title}</h3>
				{description && <p className="text-sm text-muted mt-1">{description}</p>}
			</div>
			<div className="space-y-5">{children}</div>
		</div>
	);
}
