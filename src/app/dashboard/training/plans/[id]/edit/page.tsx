"use client";

import { useState, useEffect } from "react";
import { Button, Input, TextArea, Loader } from "@/components";
import { RadioGroup } from "@/components/ui/radio-button/RadioGroup";
import { Badge, EmptyState } from "@/components/ui";
import { useTemplate, useUpdateTemplate, useDeleteTemplate, useCanEditTemplate } from "@/hooks/useTemplates";
import { useAuth } from "@/providers";
import { ArrowLeft, Save, Trash2, Plus, FileText, GripVertical, X, Pencil } from "lucide-react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";
import { TemplateVisibility, TemplateSection, TemplateItem } from "@/lib/models/Template";
import {
	useAddTemplateSection,
	useUpdateTemplateSection,
	useDeleteTemplateSection,
	useAddTemplateItem,
	useUpdateTemplateItem,
	useDeleteTemplateItem,
} from "@/hooks/useTemplates";
import { useDrills } from "@/hooks/useDrills";

export default function EditTemplatePage() {
	const params = useParams();
	const router = useRouter();
	const templateId = params.id as string;
	const { userProfile } = useAuth();
	const { data: template, isLoading, error } = useTemplate(templateId);
	const { canEdit, isLoading: isLoadingPermissions } = useCanEditTemplate(template, userProfile?.id);
	const updateTemplate = useUpdateTemplate();
	const deleteTemplate = useDeleteTemplate();

	// Add/update/delete section hooks
	const addSection = useAddTemplateSection();
	const updateSection = useUpdateTemplateSection();
	const deleteSection = useDeleteTemplateSection();

	// Add/update/delete item hooks
	const addItem = useAddTemplateItem();
	const updateItem = useUpdateTemplateItem();
	const deleteItem = useDeleteTemplateItem();

	// Drill library
	const { data: drills } = useDrills();

	// Form state
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [visibility, setVisibility] = useState<TemplateVisibility>("Private");
	const [showDrillPicker, setShowDrillPicker] = useState(false);
	const [currentSectionId, setCurrentSectionId] = useState<string | undefined>(undefined);
	const [editingSection, setEditingSection] = useState<string | null>(null);
	const [editingSectionName, setEditingSectionName] = useState("");
	const [editingItem, setEditingItem] = useState<string | null>(null);
	const [editingItemDuration, setEditingItemDuration] = useState(0);
	const [editingItemNotes, setEditingItemNotes] = useState("");

	// Initialize form state from template
	useEffect(() => {
		if (template) {
			setName(template.name);
			setDescription(template.description || "");
			setVisibility(template.visibility);
		}
	}, [template]);

	if (isLoading || isLoadingPermissions) {
		return (
			<div className="flex justify-center py-12">
				<Loader />
			</div>
		);
	}

	if (error || !template) {
		notFound();
	}

	if (!canEdit) {
		return (
			<div className="max-w-2xl mx-auto py-12 text-center">
				<h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
				<p className="text-muted mb-6">You don't have permission to edit this template.</p>
				<Link href={`/dashboard/training/plans/${templateId}`}>
					<Button variant="outline" color="neutral">
						Back to Template
					</Button>
				</Link>
			</div>
		);
	}

	const handleSave = async () => {
		try {
			await updateTemplate.mutateAsync({
				id: templateId,
				data: {
					name: name.trim(),
					description: description.trim() || undefined,
					visibility,
				},
			});
			router.push(`/dashboard/training/plans/${templateId}`);
		} catch (error) {
			console.error("Failed to update template:", error);
		}
	};

	const handleDelete = async () => {
		if (!confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
			return;
		}
		try {
			await deleteTemplate.mutateAsync(templateId);
			router.push("/dashboard/training/plans");
		} catch (error) {
			console.error("Failed to delete template:", error);
		}
	};

	const handleAddSection = async () => {
		const sectionName = prompt("Enter section name:");
		if (!sectionName?.trim()) return;

		try {
			await addSection.mutateAsync({
				templateId,
				data: {
					name: sectionName.trim(),
					order: template.sections.length,
				},
			});
		} catch (error) {
			console.error("Failed to add section:", error);
		}
	};

	const handleUpdateSection = async (sectionId: string) => {
		if (!editingSectionName.trim()) return;

		try {
			await updateSection.mutateAsync({
				templateId,
				sectionId,
				data: {
					name: editingSectionName.trim(),
				},
			});
			setEditingSection(null);
			setEditingSectionName("");
		} catch (error) {
			console.error("Failed to update section:", error);
		}
	};

	const handleDeleteSection = async (sectionId: string) => {
		if (!confirm("Delete this section? Items will be moved to ungrouped.")) {
			return;
		}
		try {
			await deleteSection.mutateAsync({ templateId, sectionId });
		} catch (error) {
			console.error("Failed to delete section:", error);
		}
	};

	const handleAddDrill = (sectionId: string | undefined) => {
		setCurrentSectionId(sectionId);
		setShowDrillPicker(true);
	};

	const handleSelectDrill = async (drillId: string) => {
		const defaultDuration = drills?.find((d) => d.id === drillId)?.duration || 10;
		try {
			await addItem.mutateAsync({
				templateId,
				data: {
					drillId,
					sectionId: currentSectionId,
					duration: defaultDuration,
					order: 0, // Backend will handle ordering
				},
			});
			setShowDrillPicker(false);
			setCurrentSectionId(undefined);
		} catch (error) {
			console.error("Failed to add drill:", error);
		}
	};

	const handleStartEditItem = (item: TemplateItem) => {
		setEditingItem(item.id);
		setEditingItemDuration(item.duration);
		setEditingItemNotes(item.notes || "");
	};

	const handleSaveItem = async (itemId: string) => {
		try {
			await updateItem.mutateAsync({
				templateId,
				itemId,
				data: {
					duration: editingItemDuration,
					notes: editingItemNotes.trim() || undefined,
				},
			});
			setEditingItem(null);
		} catch (error) {
			console.error("Failed to update item:", error);
		}
	};

	const handleDeleteItem = async (itemId: string) => {
		try {
			await deleteItem.mutateAsync({ templateId, itemId });
		} catch (error) {
			console.error("Failed to delete item:", error);
		}
	};

	const sections = template.sections || [];
	const ungroupedItems = template.items?.filter((item) => !item.sectionId) || [];

	return (
		<div className="max-w-4xl mx-auto pb-12">
			{/* Navigation */}
			<div className="flex items-center justify-between mb-8">
				<Link
					href={`/dashboard/training/plans/${templateId}`}
					className="flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors"
				>
					<ArrowLeft size={16} />
					Back to Template
				</Link>
			</div>

			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-white mb-2">Edit Template</h1>
				<p className="text-muted">Update template details and manage drills</p>
			</div>

			{/* Basic Info Form */}
			<div className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-6">
				<h2 className="text-lg font-bold text-white mb-4">Template Details</h2>

				{/* Name */}
				<div className="mb-4">
					<label className="block text-sm font-medium text-muted mb-2">
						Name <span className="text-error">*</span>
					</label>
					<Input
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="e.g., Beginner Warm-up Routine"
						required
					/>
				</div>

				{/* Description */}
				<div className="mb-4">
					<label className="block text-sm font-medium text-muted mb-2">Description</label>
					<TextArea
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="Describe what this template is for..."
						rows={3}
					/>
				</div>

				{/* Visibility */}
				<div className="mb-4">
					<label className="block text-sm font-medium text-muted mb-3">Visibility</label>
					<RadioGroup
						value={visibility}
						onChange={(val) => setVisibility(val as TemplateVisibility)}
						options={[
							{ value: "Private", label: "Private", description: "Only you can see this" },
							{ value: "Public", label: "Public", description: "Anyone can see this" },
						]}
					/>
				</div>
			</div>

			{/* Sections & Items */}
			<div className="rounded-2xl bg-white/5 border border-white/10 p-6 mb-6">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-lg font-bold text-white">Drills & Sections</h2>
					<Button
						variant="outline"
						color="primary"
						size="sm"
						leftIcon={<Plus size={14} />}
						onClick={handleAddSection}
					>
						Add Section
					</Button>
				</div>

				{/* Sections */}
				<div className="space-y-6">
					{sections.map((section) => (
						<SectionBlock
							key={section.id}
							section={section}
							onAddDrill={() => handleAddDrill(section.id)}
							onEditSection={() => {
								setEditingSection(section.id);
								setEditingSectionName(section.name);
							}}
							onDeleteSection={() => handleDeleteSection(section.id)}
							onEditItem={handleStartEditItem}
							onDeleteItem={handleDeleteItem}
							onSaveItem={handleSaveItem}
							editingSection={editingSection}
							editingSectionName={editingSectionName}
							setEditingSectionName={setEditingSectionName}
							onSaveSection={() => handleUpdateSection(section.id)}
							onCancelEditSection={() => {
								setEditingSection(null);
								setEditingSectionName("");
							}}
							editingItem={editingItem}
							editingItemDuration={editingItemDuration}
							setEditingItemDuration={setEditingItemDuration}
							editingItemNotes={editingItemNotes}
							setEditingItemNotes={setEditingItemNotes}
							onCancelEditItem={() => setEditingItem(null)}
						/>
					))}

					{/* Ungrouped Items */}
					{ungroupedItems.length > 0 && (
						<div>
							<div className="flex items-center justify-between mb-3">
								<h3 className="text-sm font-bold text-white/70 uppercase tracking-wider">Ungrouped Drills</h3>
								<Button
									variant="ghost"
									color="neutral"
									size="sm"
									leftIcon={<Plus size={14} />}
									onClick={() => handleAddDrill(undefined)}
								>
									Add Drill
								</Button>
							</div>
							<div className="space-y-2">
								{ungroupedItems.map((item) => (
									<DrillItemRow
										key={item.id}
										item={item}
										onEdit={() => handleStartEditItem(item)}
										onDelete={() => handleDeleteItem(item.id)}
										onSave={() => handleSaveItem(item.id)}
										isEditing={editingItem === item.id}
										editingDuration={editingItemDuration}
										setEditingDuration={setEditingItemDuration}
										editingNotes={editingItemNotes}
										setEditingNotes={setEditingItemNotes}
										onCancelEdit={() => setEditingItem(null)}
									/>
								))}
							</div>
						</div>
					)}

					{sections.length === 0 && ungroupedItems.length === 0 && (
						<EmptyState
							icon={FileText}
							title="No drills added yet"
							description="Add sections and drills to build your template"
						>
							<Button
								variant="outline"
								color="primary"
								size="sm"
								leftIcon={<Plus size={14} />}
								onClick={() => handleAddDrill(undefined)}
							>
								Add First Drill
							</Button>
						</EmptyState>
					)}
				</div>
			</div>

			{/* Actions */}
			<div className="flex items-center justify-between gap-4">
				<Button variant="outline" color="error" leftIcon={<Trash2 size={16} />} onClick={handleDelete}>
					Delete Template
				</Button>
				<div className="flex gap-3">
					<Link href={`/dashboard/training/plans/${templateId}`}>
						<Button variant="outline" color="neutral">
							Cancel
						</Button>
					</Link>
					<Button
						color="primary"
						leftIcon={<Save size={16} />}
						onClick={handleSave}
						disabled={!name.trim() || updateTemplate.isPending}
					>
						{updateTemplate.isPending ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</div>

			{/* Drill Picker Modal */}
			{showDrillPicker && (
				<DrillPickerModal
					drills={drills || []}
					onSelect={handleSelectDrill}
					onClose={() => {
						setShowDrillPicker(false);
						setCurrentSectionId(undefined);
					}}
				/>
			)}
		</div>
	);
}

// Sub-components

interface SectionBlockProps {
	section: TemplateSection;
	onAddDrill: () => void;
	onEditSection: () => void;
	onDeleteSection: () => void;
	onEditItem: (item: TemplateItem) => void;
	onDeleteItem: (itemId: string) => void;
	onSaveItem: (itemId: string) => void;
	editingSection: string | null;
	editingSectionName: string;
	setEditingSectionName: (name: string) => void;
	onSaveSection: () => void;
	onCancelEditSection: () => void;
	editingItem: string | null;
	editingItemDuration: number;
	setEditingItemDuration: (duration: number) => void;
	editingItemNotes: string;
	setEditingItemNotes: (notes: string) => void;
	onCancelEditItem: () => void;
}

function SectionBlock({
	section,
	onAddDrill,
	onEditSection,
	onDeleteSection,
	onEditItem,
	onDeleteItem,
	onSaveItem,
	editingSection,
	editingSectionName,
	setEditingSectionName,
	onSaveSection,
	onCancelEditSection,
	editingItem,
	editingItemDuration,
	setEditingItemDuration,
	editingItemNotes,
	setEditingItemNotes,
	onCancelEditItem,
}: SectionBlockProps) {
	const isEditing = editingSection === section.id;

	return (
		<div className="border border-white/10 rounded-xl p-4">
			<div className="flex items-center justify-between mb-3">
				{isEditing ? (
					<div className="flex-1 flex items-center gap-2">
						<Input
							value={editingSectionName}
							onChange={(e) => setEditingSectionName(e.target.value)}
							className="flex-1"
							autoFocus
						/>
						<Button variant="ghost" color="primary" size="sm" onClick={onSaveSection}>
							Save
						</Button>
						<Button variant="ghost" color="neutral" size="sm" onClick={onCancelEditSection}>
							Cancel
						</Button>
					</div>
				) : (
					<>
						<div className="flex items-center gap-2">
							<GripVertical size={16} className="text-muted/50" />
							<h3 className="text-sm font-bold text-white uppercase tracking-wider">{section.name}</h3>
							<Badge size="xs" variant="soft" color="neutral">
								{section.items.length} drill{section.items.length !== 1 ? "s" : ""}
							</Badge>
							<span className="text-xs text-muted">{section.duration} min</span>
						</div>
						<div className="flex gap-2">
							<Button variant="ghost" color="neutral" size="sm" leftIcon={<Pencil size={12} />} onClick={onEditSection}>
								Edit
							</Button>
							<Button variant="ghost" color="neutral" size="sm" leftIcon={<Plus size={12} />} onClick={onAddDrill}>
								Add Drill
							</Button>
							<Button variant="ghost" color="error" size="sm" leftIcon={<Trash2 size={12} />} onClick={onDeleteSection}>
								Delete
							</Button>
						</div>
					</>
				)}
			</div>

			{section.items.length > 0 && (
				<div className="space-y-2 mt-3">
					{section.items.map((item) => (
						<DrillItemRow
							key={item.id}
							item={item}
							onEdit={() => onEditItem(item)}
							onDelete={() => onDeleteItem(item.id)}
							onSave={() => onSaveItem(item.id)}
							isEditing={editingItem === item.id}
							editingDuration={editingItemDuration}
							setEditingDuration={setEditingItemDuration}
							editingNotes={editingItemNotes}
							setEditingNotes={setEditingItemNotes}
							onCancelEdit={onCancelEditItem}
						/>
					))}
				</div>
			)}
		</div>
	);
}

interface DrillItemRowProps {
	item: TemplateItem;
	onEdit: () => void;
	onDelete: () => void;
	onSave: () => void;
	isEditing: boolean;
	editingDuration: number;
	setEditingDuration: (duration: number) => void;
	editingNotes: string;
	setEditingNotes: (notes: string) => void;
	onCancelEdit: () => void;
}

function DrillItemRow({
	item,
	onEdit,
	onDelete,
	onSave,
	isEditing,
	editingDuration,
	setEditingDuration,
	editingNotes,
	setEditingNotes,
	onCancelEdit,
}: DrillItemRowProps) {
	const drillName = item.drill?.name || "Unknown Drill";

	if (isEditing) {
		return (
			<div className="p-3 rounded-lg bg-white/5 border border-accent/50 space-y-2">
				<div className="font-medium text-white text-sm">{drillName}</div>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<label className="text-xs text-muted">Duration (min):</label>
						<Input
							type="number"
							value={editingDuration}
							onChange={(e) => setEditingDuration(parseInt(e.target.value) || 0)}
							className="w-20"
							min={1}
						/>
					</div>
				</div>
				<div>
					<label className="text-xs text-muted block mb-1">Notes:</label>
					<TextArea
						value={editingNotes}
						onChange={(e) => setEditingNotes(e.target.value)}
						placeholder="Optional notes..."
						rows={2}
					/>
				</div>
				<div className="flex gap-2">
					<Button variant="ghost" color="primary" size="sm" onClick={onSave}>
						Save
					</Button>
					<Button variant="ghost" color="neutral" size="sm" onClick={onCancelEdit}>
						Cancel
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="group flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
			<GripVertical size={16} className="text-muted/50" />
			<div className="flex-1 min-w-0">
				<div className="flex items-center gap-2">
					<Link
						href={`/dashboard/training/drills/${item.drillId}`}
						className="text-white font-medium text-sm hover:text-accent transition-colors"
					>
						{drillName}
					</Link>
					<span className="text-xs text-muted">{item.duration} min</span>
				</div>
				{item.notes && <p className="text-xs text-muted/70 mt-0.5">Notes: {item.notes}</p>}
			</div>
			<div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
				<Button variant="ghost" color="neutral" size="sm" onClick={onEdit}>
					<Pencil size={14} />
				</Button>
				<Button variant="ghost" color="error" size="sm" onClick={onDelete}>
					<Trash2 size={14} />
				</Button>
			</div>
		</div>
	);
}

interface DrillPickerModalProps {
	drills: any[];
	onSelect: (drillId: string) => void;
	onClose: () => void;
}

function DrillPickerModal({ drills, onSelect, onClose }: DrillPickerModalProps) {
	const [search, setSearch] = useState("");

	const filteredDrills = drills.filter((drill) => drill.name.toLowerCase().includes(search.toLowerCase()));

	return (
		<div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
			<div className="bg-[#1A1A1A] rounded-2xl border border-white/10 w-full max-w-2xl max-h-[80vh] flex flex-col">
				{/* Header */}
				<div className="p-6 border-b border-white/10">
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-xl font-bold text-white">Select Drill</h2>
						<button
							onClick={onClose}
							className="p-2 rounded-lg hover:bg-white/5 text-muted hover:text-white transition-colors"
						>
							<X size={20} />
						</button>
					</div>
					<Input
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search drills..."
						autoFocus
					/>
				</div>

				{/* Drill List */}
				<div className="flex-1 overflow-y-auto p-4">
					{filteredDrills.length === 0 ? (
						<p className="text-center text-muted py-8">No drills found</p>
					) : (
						<div className="space-y-2">
							{filteredDrills.map((drill) => (
								<button
									key={drill.id}
									onClick={() => onSelect(drill.id)}
									className="w-full text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accent/50 transition-all"
								>
									<div className="flex items-center justify-between">
										<div>
											<h3 className="font-medium text-white">{drill.name}</h3>
											<p className="text-sm text-muted mt-1 line-clamp-1">{drill.description}</p>
										</div>
										<div className="text-sm text-muted">{drill.duration} min</div>
									</div>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="p-4 border-t border-white/10">
					<Button variant="outline" color="neutral" onClick={onClose} className="w-full">
						Cancel
					</Button>
				</div>
			</div>
		</div>
	);
}
