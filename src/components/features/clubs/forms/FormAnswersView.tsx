"use client";

import { FieldType, FormField, FormFieldAnswer } from "@/lib/models/Club";

interface FormAnswersViewProps {
	fields: FormField[];
	answers: FormFieldAnswer[];
}

const FormAnswersView = ({ fields, answers }: FormAnswersViewProps) => {
	const sortedFields = [...fields].sort((a, b) => a.orderIndex - b.orderIndex);

	const getAnswer = (fieldId: string) => {
		return answers.find((a) => a.formFieldId === fieldId);
	};

	const formatValue = (field: FormField, answer: FormFieldAnswer | undefined) => {
		if (!answer) return <span className="text-muted italic">No answer</span>;

		if (field.type === FieldType.Checkbox) {
			try {
				const values = JSON.parse(answer.value);
				if (Array.isArray(values) && values.length > 0) {
					return (
						<ul className="list-disc list-inside">
							{values.map((v: string, i: number) => (
								<li key={i} className="text-white">
									{v}
								</li>
							))}
						</ul>
					);
				}
				return <span className="text-muted italic">None selected</span>;
			} catch {
				return <span className="text-white">{answer.value}</span>;
			}
		}

		if (field.type === FieldType.Date) {
			try {
				const date = new Date(answer.value);
				return <span className="text-white">{date.toLocaleDateString()}</span>;
			} catch {
				return <span className="text-white">{answer.value}</span>;
			}
		}

		return <span className="text-white">{answer.value || <span className="text-muted italic">No answer</span>}</span>;
	};

	return (
		<div className="flex flex-col gap-4">
			{sortedFields.map((field) => {
				const answer = getAnswer(field.id);
				return (
					<div key={field.id} className="flex flex-col gap-1">
						<label className="text-sm font-medium text-muted">
							{field.label}
							{field.isRequired && <span className="text-red-400 ml-1">*</span>}
						</label>
						<div className="text-sm">{formatValue(field, answer)}</div>
					</div>
				);
			})}
		</div>
	);
};

export default FormAnswersView;
