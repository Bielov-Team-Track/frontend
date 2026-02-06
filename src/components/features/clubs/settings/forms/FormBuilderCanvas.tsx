// frontend/src/components/features/clubs/settings/FormBuilderCanvas.tsx
"use client";

import { Input } from "@/components/ui";
import { CreateFormFieldRequest, FieldType } from "@/lib/models/Club";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Calendar, CheckSquare, ChevronDown, FileText, GripVertical, Hash, List, Trash2, Type } from "lucide-react";

interface FormBuilderCanvasProps {
	formName: string;
	isDefault: boolean;
	fields: CreateFormFieldRequest[];
	selectedFieldIndex: number | null;
	onFormNameChange: (name: string) => void;
	onIsDefaultChange: (isDefault: boolean) => void;
	onSelectField: (index: number | null) => void;
	onUpdateField: (index: number, updates: Partial<CreateFormFieldRequest>) => void;
	onDeleteField: (index: number) => void;
}

const fieldTypeIcons: Record<FieldType, any> = {
	[FieldType.Text]: Type,
	[FieldType.TextArea]: FileText,
	[FieldType.Number]: Hash,
	[FieldType.Radio]: List,
	[FieldType.Checkbox]: CheckSquare,
	[FieldType.Dropdown]: ChevronDown,
	[FieldType.Date]: Calendar,
};

const fieldTypeLabels: Record<FieldType, string> = {
	[FieldType.Text]: "Short Text",
	[FieldType.TextArea]: "Long Text",
	[FieldType.Number]: "Number",
	[FieldType.Radio]: "Single Choice",
	[FieldType.Checkbox]: "Multiple Choice",
	[FieldType.Dropdown]: "Dropdown",
	[FieldType.Date]: "Date",
};

interface SortableFieldProps {
	field: CreateFormFieldRequest;
	index: number;
	isSelected: boolean;
	onSelect: () => void;
	onUpdate: (updates: Partial<CreateFormFieldRequest>) => void;
	onDelete: () => void;
}

function SortableField({ field, index, isSelected, onSelect, onUpdate, onDelete }: SortableFieldProps) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: `field-${index}`,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
	};

	const Icon = fieldTypeIcons[field.type];

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={cn(
				"p-4 rounded-xl bg-surface border transition-colors cursor-pointer",
				isSelected ? "border-accent" : "border-border hover:border-border"
			)}
			onClick={onSelect}>
			<div className="flex items-start gap-3">
				<button {...attributes} {...listeners} className="mt-1 p-1 text-muted hover:text-white cursor-grab active:cursor-grabbing">
					<GripVertical size={16} />
				</button>
				<div className="flex-1 min-w-0">
					<div className="flex items-center gap-2 mb-1">
						<input
							value={field.label || ""}
							onChange={(e) => onUpdate({ label: e.target.value })}
							onPointerDown={(e) => e.stopPropagation()}
							onKeyDown={(e) => e.stopPropagation()}
							onClick={(e) => {
								e.stopPropagation();
								onSelect();
							}}
							placeholder="Untitled Field"
							className="bg-transparent font-medium text-white w-full outline-hidden border-b border-transparent focus:border-accent transition-colors p-0 placeholder:text-muted/50"
						/>
						{field.isRequired && <span className="text-red-400 text-xs">*</span>}
					</div>
					<div className="flex items-center gap-2 text-sm text-muted">
						<Icon size={12} />
						{fieldTypeLabels[field.type]}
						{field.options && field.options.length > 0 && <span>· {field.options.length} options</span>}
					</div>
				</div>
				<button
					onClick={(e) => {
						e.stopPropagation();
						onDelete();
					}}
					className="p-2 text-muted hover:text-red-400 transition-colors">
					<Trash2 size={16} />
				</button>
			</div>
		</div>
	);
}

export default function FormBuilderCanvas({
	formName,
	isDefault,
	fields,
	selectedFieldIndex,
	onFormNameChange,
	onIsDefaultChange,
	onSelectField,
	onUpdateField,
	onDeleteField,
}: FormBuilderCanvasProps) {
	const { setNodeRef, isOver } = useDroppable({
		id: "canvas",
	});

	return (
		<div className="flex-1 min-w-0 space-y-6">
			{/* Form Header */}
			<div className="p-4 rounded-xl bg-surface border border-border space-y-4">
				<Input
					label="Form Name"
					value={formName}
					onChange={(e) => onFormNameChange(e.target.value)}
					placeholder="e.g., Player Registration Form"
					required
				/>
				<label className="flex items-center gap-2 cursor-pointer">
					<input
						type="checkbox"
						checked={isDefault}
						onChange={(e) => onIsDefaultChange(e.target.checked)}
						className="checkbox checkbox-primary checkbox-sm"
					/>
					<span className="text-sm text-white">Set as default form</span>
				</label>
			</div>

			{/* Fields List */}
			<div ref={setNodeRef} className="space-y-3 min-h-[200px]">
				<SortableContext items={fields.map((_, i) => `field-${i}`)} strategy={verticalListSortingStrategy}>
					{fields.map((field, index) => (
						<SortableField
							key={`field-${index}`}
							field={field}
							index={index}
							isSelected={selectedFieldIndex === index}
							onSelect={() => onSelectField(index)}
							onUpdate={(updates) => onUpdateField(index, updates)}
							onDelete={() => onDeleteField(index)}
						/>
					))}
				</SortableContext>

				{fields.length === 0 && (
					<div
						className={cn(
							"p-8 rounded-xl border-2 border-dashed text-center transition-colors",
							isOver ? "border-accent bg-accent/10" : "border-border"
						)}>
						<p className="text-muted">Drag fields here to build your form</p>
					</div>
				)}

				{fields.length > 0 && (
					<div
						className={cn(
							"p-4 rounded-xl border-2 border-dashed text-center transition-colors",
							isOver ? "border-accent bg-accent/10" : "border-border"
						)}>
						<p className="text-sm text-muted">Drop here to add field</p>
					</div>
				)}
			</div>
		</div>
	);
}
