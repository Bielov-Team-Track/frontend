"use client";

import { Button } from "@/components";
import { Input } from "@/components/ui";
import { CreateFormFieldRequest, CreateFormTemplateRequest, FieldType, FormTemplate } from "@/lib/models/Club";
import { yupResolver } from "@hookform/resolvers/yup";
import { Calendar, CheckSquare, FileText, Hash, List, Type } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import FormFieldEditor from "./FormFieldEditor";

const schema = yup.object().shape({
	name: yup.string().required("Template name is required").min(1),
	isDefault: yup.boolean(),
});

interface FormBuilderProps {
	initialData?: FormTemplate;
	onSave: (data: CreateFormTemplateRequest) => Promise<void>;
	onCancel: () => void;
	isLoading?: boolean;
}

const fieldTypeButtons = [
	{ type: FieldType.Text, label: "Short Text", icon: Type },
	{ type: FieldType.TextArea, label: "Long Text", icon: FileText },
	{ type: FieldType.Number, label: "Number", icon: Hash },
	{ type: FieldType.Radio, label: "Single Choice", icon: List },
	{ type: FieldType.Checkbox, label: "Multiple Choice", icon: CheckSquare },
	{ type: FieldType.Dropdown, label: "Dropdown", icon: List },
	{ type: FieldType.Date, label: "Date", icon: Calendar },
];

const FormBuilder = ({ initialData, onSave, onCancel, isLoading }: FormBuilderProps) => {
	const [fields, setFields] = useState<CreateFormFieldRequest[]>(
		initialData?.fields.map((f) => ({
			type: f.type,
			label: f.label,
			description: f.description,
			isRequired: f.isRequired,
			options: f.options,
			config: f.config,
			orderIndex: f.orderIndex,
		})) || []
	);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			name: initialData?.name || "",
			isDefault: initialData?.isDefault || false,
		},
	});

	const addField = (type: FieldType) => {
		const needsOptions = type === FieldType.Radio || type === FieldType.Checkbox || type === FieldType.Dropdown;

		const newField: CreateFormFieldRequest = {
			type,
			label: "",
			description: "",
			isRequired: false,
			options: needsOptions ? ["Option 1"] : undefined,
			orderIndex: fields.length,
		};
		setFields([...fields, newField]);
	};

	const updateField = (index: number, updatedField: CreateFormFieldRequest) => {
		const newFields = [...fields];
		newFields[index] = updatedField;
		setFields(newFields);
	};

	const removeField = (index: number) => {
		setFields(fields.filter((_, i) => i !== index));
	};

	const moveField = (index: number, direction: "up" | "down") => {
		const newFields = [...fields];
		const targetIndex = direction === "up" ? index - 1 : index + 1;
		if (targetIndex < 0 || targetIndex >= newFields.length) return;

		[newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
		setFields(newFields);
	};

	const onSubmit = async (data: { name: string; isDefault?: boolean }) => {
		const requestData: CreateFormTemplateRequest = {
			name: data.name,
			isDefault: data.isDefault,
			fields: fields.map((f, i) => ({ ...f, orderIndex: i })),
		};
		await onSave(requestData);
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
			{/* Template Info */}
			<div className="p-4 bg-surface rounded-xl border border-border">
				<h3 className="text-lg font-semibold text-foreground mb-4">Template Settings</h3>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input {...register("name")} label="Template Name" placeholder="e.g., Player Registration Form" error={errors.name?.message} required />
					<div className="flex items-end pb-2">
						<label className="flex items-center gap-2 cursor-pointer">
							<input type="checkbox" {...register("isDefault")} className="checkbox checkbox-primary" />
							<span className="text-sm text-foreground">Set as default form</span>
						</label>
					</div>
				</div>
			</div>

			{/* Add Field Buttons */}
			<div className="flex flex-col gap-2">
				<label className="text-sm font-medium text-foreground">Add Field</label>
				<div className="flex flex-wrap gap-2">
					{fieldTypeButtons.map(({ type, label, icon: Icon }) => (
						<Button key={type} type="button" variant="outline" size="sm" onClick={() => addField(type)} leftIcon={<Icon size={14} />}>
							{label}
						</Button>
					))}
				</div>
			</div>

			{/* Fields List */}
			<div className="flex flex-col gap-3">
				<label className="text-sm font-medium text-foreground">Fields ({fields.length})</label>
				{fields.length === 0 ? (
					<div className="p-8 bg-surface rounded-xl border border-dashed border-border text-center">
						<p className="text-muted">No fields added yet. Click a button above to add a field.</p>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						{fields.map((field, index) => (
							<FormFieldEditor
								key={index}
								field={field}
								index={index}
								onChange={updateField}
								onRemove={removeField}
								onMoveUp={() => moveField(index, "up")}
								onMoveDown={() => moveField(index, "down")}
								isFirst={index === 0}
								isLast={index === fields.length - 1}
							/>
						))}
					</div>
				)}
			</div>

			{/* Actions */}
			<div className="flex justify-end gap-3">
				<Button type="button" variant="ghost" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit" variant="default" color="primary" loading={isLoading}>
					{initialData ? "Save Changes" : "Create Template"}
				</Button>
			</div>
		</form>
	);
};

export default FormBuilder;
