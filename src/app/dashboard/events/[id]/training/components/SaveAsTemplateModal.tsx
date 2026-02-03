"use client";

import { Modal, Button, Input, TextArea, Select } from "@/components";
import { SelectOption } from "@/components/ui/select";
import { RadioGroup } from "@/components/ui/radio-button/RadioGroup";
import { TemplateVisibility } from "@/lib/models/Template";
import { Eye, Lock } from "lucide-react";
import { useState } from "react";

interface SaveAsTemplateModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (data: SaveTemplateData) => void;
	isLoading?: boolean;
	clubs?: Array<{ id: string; name: string }>;
}

export interface SaveTemplateData {
	name: string;
	description?: string;
	clubId?: string;
	visibility: TemplateVisibility;
}

export default function SaveAsTemplateModal({ isOpen, onClose, onSave, isLoading, clubs = [] }: SaveAsTemplateModalProps) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [clubId, setClubId] = useState<string | undefined>(undefined);
	const [visibility, setVisibility] = useState<TemplateVisibility>("Private");

	const [errors, setErrors] = useState<{ name?: string }>({});

	const handleSave = () => {
		// Validate
		const newErrors: { name?: string } = {};
		if (!name.trim()) {
			newErrors.name = "Template name is required";
		}

		if (Object.keys(newErrors).length > 0) {
			setErrors(newErrors);
			return;
		}

		// Call onSave with form data
		onSave({
			name: name.trim(),
			description: description.trim() || undefined,
			clubId,
			visibility,
		});

		// Reset form
		setName("");
		setDescription("");
		setClubId(undefined);
		setVisibility("Private");
		setErrors({});
	};

	const handleClose = () => {
		setName("");
		setDescription("");
		setClubId(undefined);
		setVisibility("Private");
		setErrors({});
		onClose();
	};

	// Convert clubs to select options
	const clubOptions: SelectOption[] = clubs.map((club) => ({
		value: club.id,
		label: club.name,
	}));

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Save as Template" size="md" isLoading={isLoading}>
			<div className="space-y-5">
				{/* Name */}
				<Input
					label="Template Name"
					placeholder="e.g., Beginner Warmup Routine"
					value={name}
					onChange={(e) => {
						setName(e.target.value);
						if (errors.name) setErrors({ ...errors, name: undefined });
					}}
					error={errors.name}
					required
					maxLength={100}
				/>

				{/* Description */}
				<TextArea
					label="Description"
					placeholder="Describe what this template is for..."
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					minRows={3}
					maxLength={500}
					showCharCount
					optional
				/>

				{/* Club Selection (if clubs available) */}
				{clubOptions.length > 0 && (
					<Select
						label="Club"
						placeholder="Select a club (optional)"
						options={clubOptions}
						value={clubId}
						onChange={setClubId}
						clearable
						helperText="Save this template to a club to share it with members"
					/>
				)}

				{/* Visibility */}
				<div className="space-y-2">
					<label className="text-sm font-medium text-foreground">Visibility</label>
					<RadioGroup
						value={visibility}
						onChange={(value) => setVisibility(value as TemplateVisibility)}
						options={[
							{
								value: "Private",
								label: "Private",
								description: "Only you can see this template",
								icon: <Lock size={18} />,
							},
							{
								value: "Public",
								label: "Public",
								description: "Anyone can discover and use this template",
								icon: <Eye size={18} />,
							},
						]}
					/>
				</div>

				{/* Actions */}
				<div className="flex gap-3 justify-end pt-4 border-t border-white/10">
					<Button variant="outline" color="neutral" onClick={handleClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button color="primary" onClick={handleSave} disabled={isLoading}>
						Save Template
					</Button>
				</div>
			</div>
		</Modal>
	);
}
