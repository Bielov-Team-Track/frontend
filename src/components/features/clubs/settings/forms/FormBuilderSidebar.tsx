// frontend/src/components/features/clubs/settings/FormBuilderSidebar.tsx
"use client";

import { FormTemplate } from "@/lib/models/Club";
import { cn } from "@/lib/utils";
import { FileText, Plus } from "lucide-react";

interface FormBuilderSidebarProps {
	forms: FormTemplate[];
	selectedFormId: string | null;
	onSelectForm: (formId: string) => void;
	onCreateNew: () => void;
	hasUnsavedChanges: boolean;
}

export default function FormBuilderSidebar({ forms, selectedFormId, onSelectForm, onCreateNew, hasUnsavedChanges }: FormBuilderSidebarProps) {
	const handleSelect = (formId: string) => {
		if (hasUnsavedChanges) {
			if (!confirm("You have unsaved changes. Discard them?")) {
				return;
			}
		}
		onSelectForm(formId);
	};

	return (
		<div className="w-56 shrink-0 border-r border-white/10 pr-4">
			<div className="sticky top-0 space-y-3">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-medium text-muted uppercase tracking-wide">Forms</h3>
				</div>

				<button
					onClick={onCreateNew}
					className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/20 text-muted hover:text-white hover:border-white/40 transition-colors text-sm">
					<Plus size={16} />
					New Form
				</button>

				<div className="space-y-1">
					{forms.map((form) => (
						<button
							key={form.id}
							onClick={() => handleSelect(form.id)}
							className={cn(
								"w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
								selectedFormId === form.id ? "bg-accent/20 text-accent" : "text-white/80 hover:bg-white/5"
							)}>
							<FileText size={14} className="shrink-0" />
							<span className="truncate">{form.name}</span>
							{!form.isActive && <span className="ml-auto w-2 h-2 rounded-full bg-muted shrink-0" />}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
