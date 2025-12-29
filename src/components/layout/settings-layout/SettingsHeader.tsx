"use client";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Save } from "lucide-react";

interface SettingsHeaderProps {
	title: string;
	description?: string;
	isDirty?: boolean;
	onSave?: () => void;
	isLoading?: boolean;
	actions?: React.ReactNode;
	className?: string;
}

export function SettingsHeader({
	title,
	description,
	isDirty,
	onSave,
	isLoading,
	actions,
	className,
}: SettingsHeaderProps) {
	return (
		<div className={cn("sticky top-0 z-10 bg-background pb-4", className)}>
			<div className="flex items-start justify-between gap-4">
				<div>
					<h2 className="text-2xl font-bold text-white">{title}</h2>
					{description && <p className="text-sm text-muted mt-1">{description}</p>}
				</div>

				<div className="flex items-center gap-2">
					{actions}
					{isDirty && onSave && (
						<Button
							type="button"
							size="sm"
							onClick={onSave}
							loading={isLoading}
							leftIcon={<Save size={16} />}
							className="animate-in fade-in duration-200">
							Save Changes
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
