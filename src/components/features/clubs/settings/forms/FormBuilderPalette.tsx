// frontend/src/components/features/clubs/settings/FormBuilderPalette.tsx
"use client";

import { Input } from "@/components/ui";
import { CreateFormFieldRequest, FieldType } from "@/lib/models/Club";
import { useDraggable } from "@dnd-kit/core";
import { Calendar, CheckSquare, ChevronDown, FileText, Hash, List, Type } from "lucide-react";

interface FormBuilderPaletteProps {
	selectedField: CreateFormFieldRequest | null;
	onUpdateField: (updates: Partial<CreateFormFieldRequest>) => void;
}

const fieldTypes = [
	{ type: FieldType.Text, label: "Short Text", icon: Type },
	{ type: FieldType.TextArea, label: "Long Text", icon: FileText },
	{ type: FieldType.Number, label: "Number", icon: Hash },
	{ type: FieldType.Radio, label: "Single Choice", icon: List },
	{ type: FieldType.Checkbox, label: "Multiple Choice", icon: CheckSquare },
	{ type: FieldType.Dropdown, label: "Dropdown", icon: ChevronDown },
	{ type: FieldType.Date, label: "Date", icon: Calendar },
];

function DraggableFieldType({ type, label, icon: Icon }: { type: FieldType; label: string; icon: any }) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: `palette-${type}`,
		data: { type, isNew: true },
	});

	const style = transform
		? {
				transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
				opacity: isDragging ? 0.5 : 1,
		  }
		: undefined;

	return (
		<button
			ref={setNodeRef}
			style={style}
			{...listeners}
			{...attributes}
			className="flex items-center gap-2 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing">
			<Icon size={14} />
			{label}
		</button>
	);
}

export default function FormBuilderPalette({ selectedField, onUpdateField }: FormBuilderPaletteProps) {
	const needsOptions =
		selectedField && (selectedField.type === FieldType.Radio || selectedField.type === FieldType.Checkbox || selectedField.type === FieldType.Dropdown);

	const addOption = () => {
		if (!selectedField) return;
		const options = [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`];
		onUpdateField({ options });
	};

	const updateOption = (index: number, value: string) => {
		if (!selectedField?.options) return;
		const newOptions = [...selectedField.options];
		newOptions[index] = value;
		onUpdateField({ options: newOptions });
	};

	const removeOption = (index: number) => {
		if (!selectedField?.options) return;
		onUpdateField({ options: selectedField.options.filter((_, i) => i !== index) });
	};

	return (
		<div className="w-64 shrink-0 border-l border-white/10 pl-4 space-y-6">
			{/* Field Palette */}
			<div>
				<h3 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">Add Field</h3>
				<div className="space-y-2">
					{fieldTypes.map((field) => (
						<DraggableFieldType key={field.type} {...field} />
					))}
				</div>
			</div>

			{/* Field Settings */}
			{selectedField && (
				<div className="border-t border-white/10 pt-6">
					<h3 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">Field Settings</h3>
					<div className="space-y-4">
						<Input
							label="Label"
							value={selectedField.label}
							onChange={(e) => onUpdateField({ label: e.target.value })}
							placeholder="Enter label..."
						/>
						<Input
							label="Description"
							value={selectedField.description || ""}
							onChange={(e) => onUpdateField({ description: e.target.value })}
							placeholder="Helper text (optional)"
						/>
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={selectedField.isRequired}
								onChange={(e) => onUpdateField({ isRequired: e.target.checked })}
								className="checkbox checkbox-primary checkbox-sm"
							/>
							<span className="text-sm text-white">Required</span>
						</label>

						{needsOptions && (
							<div className="space-y-2">
								<label className="text-sm font-medium text-white">Options</label>
								{selectedField.options?.map((option, index) => (
									<div key={index} className="flex items-center gap-2">
										<Input value={option} onChange={(e) => updateOption(index, e.target.value)} inputSize="sm" />
										<button type="button" onClick={() => removeOption(index)} className="p-1 text-muted hover:text-red-400">
											×
										</button>
									</div>
								))}
								<button type="button" onClick={addOption} className="text-sm text-accent hover:underline">
									+ Add option
								</button>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
