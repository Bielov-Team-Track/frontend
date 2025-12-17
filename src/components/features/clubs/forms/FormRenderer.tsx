"use client";

import { Dropdown, Input, TextArea } from "@/components/ui";
import { FieldType, FormField } from "@/lib/models/Club";
import { Calendar } from "lucide-react";
import { Controller, useFormContext } from "react-hook-form";

interface FormRendererProps {
	fields: FormField[];
	namePrefix?: string;
}

const FormRenderer = ({ fields, namePrefix = "" }: FormRendererProps) => {
	const {
		control,
		formState: { errors },
	} = useFormContext();

	const getFieldName = (fieldId: string) => (namePrefix ? `${namePrefix}.${fieldId}` : fieldId);

	const getError = (fieldId: string) => {
		const name = getFieldName(fieldId);
		const parts = name.split(".");
		let error: any = errors;
		for (const part of parts) {
			error = error?.[part];
		}
		return error?.message as string | undefined;
	};

	const sortedFields = [...fields].sort((a, b) => a.orderIndex - b.orderIndex);

	return (
		<div className="flex flex-col gap-4">
			{sortedFields.map((field) => (
				<div key={field.id}>
					{field.type === FieldType.Text && (
						<Controller
							name={getFieldName(field.id)}
							control={control}
							rules={{ required: field.isRequired ? `${field.label} is required` : false }}
							render={({ field: formField }) => (
								<Input
									{...formField}
									label={field.label}
									placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
									error={getError(field.id)}
									required={field.isRequired}
								/>
							)}
						/>
					)}

					{field.type === FieldType.TextArea && (
						<Controller
							name={getFieldName(field.id)}
							control={control}
							rules={{ required: field.isRequired ? `${field.label} is required` : false }}
							render={({ field: formField }) => (
								<TextArea
									{...formField}
									label={field.label}
									placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
									error={getError(field.id)}
									required={field.isRequired}
									rows={4}
								/>
							)}
						/>
					)}

					{field.type === FieldType.Number && (
						<Controller
							name={getFieldName(field.id)}
							control={control}
							rules={{ required: field.isRequired ? `${field.label} is required` : false }}
							render={({ field: formField }) => (
								<Input
									{...formField}
									type="number"
									label={field.label}
									placeholder={field.description || `Enter ${field.label.toLowerCase()}`}
									error={getError(field.id)}
									required={field.isRequired}
								/>
							)}
						/>
					)}

					{field.type === FieldType.Radio && field.options && (
						<div className="flex flex-col gap-2">
							<label className="text-sm font-medium text-white">
								{field.label}
								{field.isRequired && <span className="text-red-400 ml-1">*</span>}
							</label>
							{field.description && <p className="text-xs text-muted">{field.description}</p>}
							<Controller
								name={getFieldName(field.id)}
								control={control}
								rules={{ required: field.isRequired ? `${field.label} is required` : false }}
								render={({ field: formField }) => (
									<div className="flex flex-col gap-2">
										{field.options!.map((option) => (
											<label key={option} className="flex items-center gap-2 cursor-pointer">
												<input
													type="radio"
													value={option}
													checked={formField.value === option}
													onChange={() => formField.onChange(option)}
													className="radio radio-primary radio-sm"
												/>
												<span className="text-sm text-white">{option}</span>
											</label>
										))}
									</div>
								)}
							/>
							{getError(field.id) && <p className="text-xs text-red-400">{getError(field.id)}</p>}
						</div>
					)}

					{field.type === FieldType.Checkbox && field.options && (
						<div className="flex flex-col gap-2">
							<label className="text-sm font-medium text-white">
								{field.label}
								{field.isRequired && <span className="text-red-400 ml-1">*</span>}
							</label>
							{field.description && <p className="text-xs text-muted">{field.description}</p>}
							<Controller
								name={getFieldName(field.id)}
								control={control}
								rules={{
									validate: (value) => {
										if (field.isRequired && (!value || value.length === 0)) {
											return `${field.label} is required`;
										}
										return true;
									},
								}}
								render={({ field: formField }) => (
									<div className="flex flex-col gap-2">
										{field.options!.map((option) => {
											const values = formField.value || [];
											const isChecked = values.includes(option);
											return (
												<label key={option} className="flex items-center gap-2 cursor-pointer">
													<input
														type="checkbox"
														checked={isChecked}
														onChange={() => {
															const newValues = isChecked ? values.filter((v: string) => v !== option) : [...values, option];
															formField.onChange(newValues);
														}}
														className="checkbox checkbox-primary checkbox-sm"
													/>
													<span className="text-sm text-white">{option}</span>
												</label>
											);
										})}
									</div>
								)}
							/>
							{getError(field.id) && <p className="text-xs text-red-400">{getError(field.id)}</p>}
						</div>
					)}

					{field.type === FieldType.Dropdown && field.options && (
						<Controller
							name={getFieldName(field.id)}
							control={control}
							rules={{ required: field.isRequired ? `${field.label} is required` : false }}
							render={({ field: formField }) => (
								<Dropdown
									{...formField}
									label={field.label}
									placeholder={field.description || `Select ${field.label.toLowerCase()}`}
									options={field.options!.map((opt) => ({ value: opt, label: opt }))}
									error={getError(field.id)}
									required={field.isRequired}
								/>
							)}
						/>
					)}

					{field.type === FieldType.Date && (
						<Controller
							name={getFieldName(field.id)}
							control={control}
							rules={{ required: field.isRequired ? `${field.label} is required` : false }}
							render={({ field: formField }) => (
								<Input
									{...formField}
									type="date"
									label={field.label}
									leftIcon={<Calendar size={16} />}
									error={getError(field.id)}
									required={field.isRequired}
								/>
							)}
						/>
					)}
				</div>
			))}
		</div>
	);
};

export default FormRenderer;
