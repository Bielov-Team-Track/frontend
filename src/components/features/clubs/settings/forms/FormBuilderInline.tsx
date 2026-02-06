// frontend/src/components/features/clubs/settings/FormBuilderInline.tsx
"use client";

import FormRenderer from "@/components/features/clubs/forms/FormRenderer";
import { Button, Loader, Modal } from "@/components/ui";
import { CreateFormFieldRequest, FieldType, FormTemplate } from "@/lib/models/Club";
import { createFormTemplate, getFormTemplate, updateFormTemplate } from "@/lib/api/clubs";
import { closestCenter, DndContext, DragEndEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Eye, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import FormBuilderCanvas from "./FormBuilderCanvas";
import FormBuilderPalette from "./FormBuilderPalette";
import FormBuilderSidebar from "./FormBuilderSidebar";

interface FormBuilderInlineProps {
	clubId: string;
	formId: string | null;
	forms: FormTemplate[];
	onBack: () => void;
	onFormSaved: (newFormId?: string) => void;
	onSelectForm: (formId: string) => void;
	onCreateNew: () => void;
}

export default function FormBuilderInline({ clubId, formId, forms, onBack, onFormSaved, onSelectForm, onCreateNew }: FormBuilderInlineProps) {
	const queryClient = useQueryClient();

	// Form state
	const [formName, setFormName] = useState("");
	const [isDefault, setIsDefault] = useState(false);
	const [fields, setFields] = useState<CreateFormFieldRequest[]>([]);
	const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [previewOpen, setPreviewOpen] = useState(false);

	// Drag state
	const [activeId, setActiveId] = useState<string | null>(null);

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: {
				distance: 8,
			},
		})
	);

	// Query for current form being edited
	const { data: currentForm, isLoading: formLoading } = useQuery({
		queryKey: ["form", clubId, formId],
		queryFn: () => getFormTemplate(clubId, formId!),
		enabled: !!formId,
	});

	// Load form data when editing
	useEffect(() => {
		if (currentForm) {
			setFormName(currentForm.name);
			setIsDefault(currentForm.isDefault);
			setFields(
				currentForm.fields.map((f) => ({
					type: f.type,
					label: f.label,
					description: f.description,
					isRequired: f.isRequired,
					options: f.options,
					config: f.config,
					orderIndex: f.orderIndex,
				}))
			);
			setHasUnsavedChanges(false);
		}
	}, [currentForm]);

	// Reset for new form
	useEffect(() => {
		if (!formId) {
			setFormName("");
			setIsDefault(false);
			setFields([]);
			setSelectedFieldIndex(null);
			setHasUnsavedChanges(false);
		}
	}, [formId]);

	// Mutations
	const createMutation = useMutation({
		mutationFn: () =>
			createFormTemplate(clubId, {
				name: formName,
				isDefault,
				fields: fields.map((f, i) => ({ ...f, orderIndex: i })),
			}),
		onSuccess: (newForm) => {
			queryClient.invalidateQueries({ queryKey: ["club-forms", clubId] });
			setHasUnsavedChanges(false);
			onFormSaved(newForm.id);
		},
	});

	const updateMutation = useMutation({
		mutationFn: () =>
			updateFormTemplate(clubId, formId!, {
				name: formName,
				isDefault,
				fields: fields.map((f, i) => ({ ...f, orderIndex: i })),
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-forms", clubId] });
			queryClient.invalidateQueries({ queryKey: ["form", clubId, formId] });
			setHasUnsavedChanges(false);
			onFormSaved();
		},
	});

	// Track unsaved changes
	useEffect(() => {
		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			if (hasUnsavedChanges) {
				e.preventDefault();
				e.returnValue = "";
			}
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [hasUnsavedChanges]);

	// Handlers
	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id as string);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		setActiveId(null);

		if (!over) return;

		// Adding new field from palette
		if (active.id.toString().startsWith("palette-")) {
			const fieldType = active.data.current?.type as FieldType;
			const needsOptions = fieldType === FieldType.Radio || fieldType === FieldType.Checkbox || fieldType === FieldType.Dropdown;

			const newField: CreateFormFieldRequest = {
				type: fieldType,
				label: "",
				description: "",
				isRequired: false,
				options: needsOptions ? ["Option 1"] : undefined,
				orderIndex: fields.length,
			};

			setFields([...fields, newField]);
			setSelectedFieldIndex(fields.length);
			setHasUnsavedChanges(true);
			return;
		}

		// Reordering existing fields
		if (active.id !== over.id) {
			const oldIndex = parseInt(active.id.toString().replace("field-", ""));
			const newIndex = parseInt(over.id.toString().replace("field-", ""));

			if (!isNaN(oldIndex) && !isNaN(newIndex)) {
				setFields(arrayMove(fields, oldIndex, newIndex));
				setHasUnsavedChanges(true);
			}
		}
	};

	const handleSelectForm = (selectedFormId: string) => {
		if (hasUnsavedChanges) {
			if (!confirm("You have unsaved changes. Discard them?")) {
				return;
			}
		}
		onSelectForm(selectedFormId);
	};

	const handleCreateNew = () => {
		if (hasUnsavedChanges) {
			if (!confirm("You have unsaved changes. Discard them?")) {
				return;
			}
		}
		onCreateNew();
	};

	const handleUpdateField = (updates: Partial<CreateFormFieldRequest>) => {
		if (selectedFieldIndex === null) return;
		const newFields = [...fields];
		newFields[selectedFieldIndex] = { ...newFields[selectedFieldIndex], ...updates };
		setFields(newFields);
		setHasUnsavedChanges(true);
	};

	const handleDeleteField = (index: number) => {
		setFields(fields.filter((_, i) => i !== index));
		if (selectedFieldIndex === index) {
			setSelectedFieldIndex(null);
		} else if (selectedFieldIndex !== null && selectedFieldIndex > index) {
			setSelectedFieldIndex(selectedFieldIndex - 1);
		}
		setHasUnsavedChanges(true);
	};

	const handleSave = () => {
		if (formId) {
			updateMutation.mutate();
		} else {
			createMutation.mutate();
		}
	};

	const handleBack = () => {
		if (hasUnsavedChanges) {
			if (!confirm("You have unsaved changes. Discard them?")) {
				return;
			}
		}
		onBack();
	};

	const isLoading = formId && formLoading;
	const isSaving = createMutation.isPending || updateMutation.isPending;
	const canSave = formName.trim() && fields.length > 0 && fields.every((f) => f.label.trim());

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader size="lg" />
			</div>
		);
	}

	return (
		<DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
			<div className="space-y-6">
				{/* Header */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<button onClick={handleBack} className="p-2 rounded-lg bg-surface hover:bg-hover transition-colors">
							<ArrowLeft size={20} />
						</button>
						<div>
							<h2 className="text-lg font-bold text-white">{formId ? "Edit Form" : "New Form"}</h2>
							{hasUnsavedChanges && <p className="text-sm text-amber-400">Unsaved changes</p>}
						</div>
					</div>
					<div className="flex items-center gap-3">
						<Button variant="ghost" onClick={() => setPreviewOpen(true)} leftIcon={<Eye size={16} />} disabled={fields.length === 0}>
							Preview
						</Button>
						<Button
							variant="default"
							color="accent"
							onClick={handleSave}
							loading={isSaving}
							disabled={!canSave}
							title={!canSave ? "Form and every field should have a name" : ""}
							leftIcon={<Save size={16} />}>
							{formId ? "Save Changes" : "Create Form"}
						</Button>
					</div>
				</div>

				{/* Main Content */}
				<div className="flex gap-6">
					<FormBuilderSidebar
						forms={forms}
						selectedFormId={formId}
						onSelectForm={handleSelectForm}
						onCreateNew={handleCreateNew}
						hasUnsavedChanges={hasUnsavedChanges}
					/>

					<FormBuilderCanvas
						formName={formName}
						isDefault={isDefault}
						fields={fields}
						selectedFieldIndex={selectedFieldIndex}
						onFormNameChange={(name) => {
							setFormName(name);
							setHasUnsavedChanges(true);
						}}
						onIsDefaultChange={(val) => {
							setIsDefault(val);
							setHasUnsavedChanges(true);
						}}
						onSelectField={setSelectedFieldIndex}
						onUpdateField={(index, updates) => {
							const newFields = [...fields];
							newFields[index] = { ...newFields[index], ...updates };
							setFields(newFields);
							setHasUnsavedChanges(true);
						}}
						onDeleteField={handleDeleteField}
					/>

					<FormBuilderPalette selectedField={selectedFieldIndex !== null ? fields[selectedFieldIndex] : null} onUpdateField={handleUpdateField} />
				</div>
			</div>

			{/* Preview Modal */}
			<Modal isOpen={previewOpen} onClose={() => setPreviewOpen(false)} title="Form Preview" size="lg">
				<div className="p-4">
					<FormPreview fields={fields} />
				</div>
			</Modal>
		</DndContext>
	);
}

// Separate component to handle FormProvider for preview
function FormPreview({ fields }: { fields: CreateFormFieldRequest[] }) {
	const methods = useForm();

	const previewFields = fields.map((f, i) => ({
		id: `preview-${i}`,
		formTemplateId: "preview",
		type: f.type,
		label: f.label,
		description: f.description,
		isRequired: f.isRequired || false,
		options: f.options,
		config: f.config,
		orderIndex: i,
	}));

	if (fields.length === 0) {
		return <p className="text-muted text-center py-8">No fields to preview</p>;
	}

	return (
		<FormProvider {...methods}>
			<FormRenderer fields={previewFields} />
		</FormProvider>
	);
}
