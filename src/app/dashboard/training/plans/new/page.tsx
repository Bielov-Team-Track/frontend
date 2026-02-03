"use client";

import { useState } from "react";
import { Button, Input, TextArea } from "@/components";
import { RadioGroup } from "@/components/ui/radio-button/RadioGroup";
import { Badge, EmptyState } from "@/components/ui";
import { useCreateTemplate } from "@/hooks/useTemplates";
import { ArrowLeft, Save, Plus, FileText, GripVertical, X, Trash2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TemplateVisibility, CreateTemplateSectionRequest, CreateTemplateItemRequest } from "@/lib/models/Template";
import { useDrills } from "@/hooks/useDrills";

// Local types for managing state before saving
interface LocalSection {
	id: string; // temporary ID
	name: string;
	order: number;
}

interface LocalItem {
	id: string; // temporary ID
	drillId: string;
	sectionId?: string;
	duration: number;
	notes?: string;
	order: number;
	drill?: {
		id: string;
		name: string;
	};
}

export default function NewTemplatePage() {
	const router = useRouter();
	const createTemplate = useCreateTemplate();
	const { data: drills } = useDrills();

	// Form state
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [visibility, setVisibility] = useState<TemplateVisibility>("Private");

	// Sections and items state
	const [sections, setSections] = useState<LocalSection[]>([]);
	const [items, setItems] = useState<LocalItem[]>([]);

	// UI state
	const [showDrillPicker, setShowDrillPicker] = useState(false);
	const [currentSectionId, setCurrentSectionId] = useState<string | undefined>(undefined);
	const [editingSection, setEditingSection] = useState<string | null>(null);
	const [editingSectionName, setEditingSectionName] = useState("");
	const [editingItem, setEditingItem] = useState<string | null>(null);
	const [editingItemDuration, setEditingItemDuration] = useState(0);
	const [editingItemNotes, setEditingItemNotes] = useState("");

	const handleSave = async () => {
		if (!name.trim()) {
			alert("Please enter a template name");
			return;
		}

		try {
			// Convert local sections and items to DTO format
			const sectionsDto: CreateTemplateSectionRequest[] = sections.map((section) => ({
				name: section.name,
				order: section.order,
			}));

			const itemsDto: CreateTemplateItemRequest[] = items.map((item) => ({
				drillId: item.drillId,
				sectionId: item.sectionId,
				duration: item.duration,
				notes: item.notes,
				order: item.order,
			}));

			const result = await createTemplate.mutateAsync({
				name: name.trim(),
				description: description.trim() || undefined,
				visibility,
				sections: sectionsDto.length > 0 ? sectionsDto : undefined,
				items: itemsDto.length > 0 ? itemsDto : undefined,
			});

			// Redirect to the new template's detail page
			router.push(`/dashboard/training/plans/${result.id}`);
		} catch (error) {
			console.error("Failed to create template:", error);
			alert("Failed to create template. Please try again.");
		}
	};

	const handleAddSection = () => {
		const sectionName = prompt("Enter section name:");
		if (!sectionName?.trim()) return;

		const newSection: LocalSection = {
			id: `temp-section-${Date.now()}`,
			name: sectionName.trim(),
			order: sections.length,
		};
		setSections([...sections, newSection]);
	};

	const handleUpdateSection = (sectionId: string) => {
		if (!editingSectionName.trim()) return;

		setSections(
			sections.map((section) =>
				section.id === sectionId ? { ...section, name: editingSectionName.trim() } : section
			)
		);
		setEditingSection(null);
		setEditingSectionName("");
	};

	const handleDeleteSection = (sectionId: string) => {
		if (!confirm("Delete this section? Items will be moved to ungrouped.")) {
			return;
		}
		setSections(sections.filter((s) => s.id !== sectionId));
		// Move items from this section to ungrouped
		setItems(items.map((item) => (item.sectionId === sectionId ? { ...item, sectionId: undefined } : item)));
	};

	const handleAddDrill = (sectionId: string | undefined) => {
		setCurrentSectionId(sectionId);
		setShowDrillPicker(true);
	};

	const handleSelectDrill = (drillId: string) => {
		const drill = drills?.find((d) => d.id === drillId);
		if (!drill) return;

		const newItem: LocalItem = {
			id: `temp-item-${Date.now()}`,
			drillId,
			sectionId: currentSectionId,
			duration: drill.duration || 10,
			order: items.filter((i) => i.sectionId === currentSectionId).length,
			drill: {
				id: drill.id,
				name: drill.name,
			},
		};
		setItems([...items, newItem]);
		setShowDrillPicker(false);
		setCurrentSectionId(undefined);
	};

	const handleStartEditItem = (item: LocalItem) => {
		setEditingItem(item.id);
		setEditingItemDuration(item.duration);
		setEditingItemNotes(item.notes || "");
	};

	const handleSaveItem = (itemId: string) => {
		setItems(
			items.map((item) =>
				item.id === itemId
					? {
							...item,
							duration: editingItemDuration,
							notes: editingItemNotes.trim() || undefined,
					  }
					: item
			)
		);
		setEditingItem(null);
	};

	const handleDeleteItem = (itemId: string) => {
		setItems(items.filter((i) => i.id !== itemId));
	};

	const ungroupedItems = items.filter((item) => !item.sectionId);

	return (
		<div className="max-w-4xl mx-auto pb-12">
			{/* Navigation */}
			<div className="mb-8">
				<Link
					href="/dashboard/training/plans"
					className="flex items-center gap-1.5 text-sm text-muted hover:text-white transition-colors"
				>
					<ArrowLeft size={16} />
					Back to Plans
				</Link>
			</div>

			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-white mb-2">Create Template</h1>
				<p className="text-muted">Build a reusable training plan template</p>
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
					{sections.map((section) => {
						const sectionItems = items.filter((item) => item.sectionId === section.id);
						const sectionDuration = sectionItems.reduce((sum, item) => sum + item.duration, 0);

						return (
							<SectionBlock
								key={section.id}
								section={section}
								items={sectionItems}
								sectionDuration={sectionDuration}
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
						);
					})}

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
			<div className="flex justify-end gap-3">
				<Link href="/dashboard/training/plans">
					<Button variant="outline" color="neutral">
						Cancel
					</Button>
				</Link>
				<Button
					color="primary"
					leftIcon={<Save size={16} />}
					onClick={handleSave}
					disabled={!name.trim() || createTemplate.isPending}
				>
					{createTemplate.isPending ? "Creating..." : "Create Template"}
				</Button>
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
	section: LocalSection;
	items: LocalItem[];
	sectionDuration: number;
	onAddDrill: () => void;
	onEditSection: () => void;
	onDeleteSection: () => void;
	onEditItem: (item: LocalItem) => void;
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
	items,
	sectionDuration,
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
								{items.length} drill{items.length !== 1 ? "s" : ""}
							</Badge>
							<span className="text-xs text-muted">{sectionDuration} min</span>
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

			{items.length > 0 && (
				<div className="space-y-2 mt-3">
					{items.map((item) => (
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
	item: LocalItem;
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
					<span className="text-white font-medium text-sm">{drillName}</span>
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
					<Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search drills..." autoFocus />
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
