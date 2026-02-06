"use client";

import { Button } from "@/components";
import { Dropdown, Input } from "@/components/ui";
import { CreateFormFieldRequest, FieldType } from "@/lib/models/Club";
import { GripVertical, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface FormFieldEditorProps {
	field: CreateFormFieldRequest;
	index: number;
	onChange: (index: number, field: CreateFormFieldRequest) => void;
	onRemove: (index: number) => void;
	onMoveUp: (index: number) => void;
	onMoveDown: (index: number) => void;
	isFirst: boolean;
	isLast: boolean;
}

const fieldTypeOptions = [
	{ value: FieldType.Text, label: "Short Text" },
	{ value: FieldType.TextArea, label: "Long Text" },
	{ value: FieldType.Number, label: "Number" },
	{ value: FieldType.Radio, label: "Single Choice" },
	{ value: FieldType.Checkbox, label: "Multiple Choice" },
	{ value: FieldType.Dropdown, label: "Dropdown" },
	{ value: FieldType.Date, label: "Date" },
];

const needsOptions = (type: FieldType) => type === FieldType.Radio || type === FieldType.Checkbox || type === FieldType.Dropdown;

const FormFieldEditor = ({ field, index, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: FormFieldEditorProps) => {
	const [newOption, setNewOption] = useState("");

	const updateField = (updates: Partial<CreateFormFieldRequest>) => {
		onChange(index, { ...field, ...updates });
	};

	const addOption = () => {
		if (!newOption.trim()) return;
		const options = [...(field.options || []), newOption.trim()];
		updateField({ options });
		setNewOption("");
	};

	const removeOption = (optionIndex: number) => {
		const options = field.options?.filter((_, i) => i !== optionIndex);
		updateField({ options });
	};

	return (
		<div className="p-4 bg-surface rounded-xl border border-border">
			<div className="flex items-start gap-3">
				{/* Drag handle */}
				<div className="flex flex-col gap-1 pt-2">
					<button
						type="button"
						onClick={() => onMoveUp(index)}
						disabled={isFirst}
						className="p-1 text-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
						</svg>
					</button>
					<GripVertical className="w-4 h-4 text-muted" />
					<button
						type="button"
						onClick={() => onMoveDown(index)}
						disabled={isLast}
						className="p-1 text-muted hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
						</svg>
					</button>
				</div>

				{/* Field configuration */}
				<div className="flex-1 flex flex-col gap-3">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						<Input
							value={field.label}
							onChange={(e) => updateField({ label: e.target.value })}
							placeholder="Question label"
							label="Label"
							required
						/>
						<Dropdown
							value={field.type}
							onChange={(val) => {
								const newType = val as FieldType;
								updateField({
									type: newType,
									options: needsOptions(newType) ? field.options || [] : undefined,
								});
							}}
							options={fieldTypeOptions}
							label="Field Type"
						/>
					</div>

					<Input
						value={field.description || ""}
						onChange={(e) => updateField({ description: e.target.value })}
						placeholder="Help text (optional)"
						label="Description"
					/>

					{/* Options for Radio/Checkbox/Dropdown */}
					{needsOptions(field.type) && (
						<div className="flex flex-col gap-2">
							<label className="text-sm font-medium text-white">Options</label>
							{field.options?.map((option, optIndex) => (
								<div key={optIndex} className="flex items-center gap-2">
									<Input
										value={option}
										onChange={(e) => {
											const newOptions = [...(field.options || [])];
											newOptions[optIndex] = e.target.value;
											updateField({ options: newOptions });
										}}
										placeholder={`Option ${optIndex + 1}`}
									/>
									<button type="button" onClick={() => removeOption(optIndex)} className="p-2 text-muted hover:text-red-400">
										<X size={16} />
									</button>
								</div>
							))}
							<div className="flex items-center gap-2">
								<Input
									value={newOption}
									onChange={(e) => setNewOption(e.target.value)}
									placeholder="Add new option"
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											addOption();
										}
									}}
								/>
								<Button type="button" variant="ghost" size="sm" onClick={addOption} leftIcon={<Plus size={16} />}>
									Add
								</Button>
							</div>
						</div>
					)}

					<div className="flex items-center gap-4">
						<label className="flex items-center gap-2 cursor-pointer">
							<input
								type="checkbox"
								checked={field.isRequired}
								onChange={(e) => updateField({ isRequired: e.target.checked })}
								className="checkbox checkbox-primary checkbox-sm"
							/>
							<span className="text-sm text-white">Required</span>
						</label>
					</div>
				</div>

				{/* Remove button */}
				<button type="button" onClick={() => onRemove(index)} className="p-2 text-muted hover:text-red-400">
					<Trash2 size={18} />
				</button>
			</div>
		</div>
	);
};

export default FormFieldEditor;
