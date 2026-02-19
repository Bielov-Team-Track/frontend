"use client";

import { Plus, X } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { BadgeType, BADGE_METADATA } from "@/lib/models/Evaluation";

interface PraiseDraft {
	message: string;
	badgeType?: string;
}

interface PraiseEditorProps {
	praise: PraiseDraft | null;
	onChange: (praise: PraiseDraft | null) => void;
}

export function PraiseEditor({ praise, onChange }: PraiseEditorProps) {
	if (!praise) {
		return (
			<Button variant="ghost" size="sm" onClick={() => onChange({ message: "" })}>
				<Plus size={14} className="mr-1" />
				Add praise
			</Button>
		);
	}

	return (
		<div className="rounded-lg border border-border bg-surface p-3 space-y-2">
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-medium text-foreground">Praise</h4>
				<button
					type="button"
					onClick={() => onChange(null)}
					className="p-1 text-muted hover:text-destructive transition-colors"
				>
					<X size={14} />
				</button>
			</div>

			<div className="flex gap-2">
				<select
					value={praise.badgeType ?? ""}
					onChange={(e) =>
						onChange({
							...praise,
							badgeType: e.target.value || undefined,
						})
					}
					className="text-sm rounded border border-border bg-surface px-2 py-1.5"
				>
					<option value="">No badge</option>
					{Object.values(BadgeType).map((bt) => (
						<option key={bt} value={bt}>
							{BADGE_METADATA[bt].icon} {BADGE_METADATA[bt].name}
						</option>
					))}
				</select>

				<Input
					value={praise.message}
					onChange={(e) => onChange({ ...praise, message: e.target.value })}
					placeholder="Great job on..."
					className="text-sm flex-1"
				/>
			</div>
		</div>
	);
}

export type { PraiseDraft };
