"use client";

import { Button, Input, TextArea, RadioCards, MultiSelectPills, Select, Steps } from "@/components";
import { Modal } from "@/components/ui";
import { useUpdateDrill, useAddDrillAttachment, useDeleteDrillAttachment } from "@/hooks/useDrills";
import {
	Drill,
	UpdateDrillRequest,
	DrillCategoryEnum,
	DrillIntensityEnum,
	DrillSkillEnum,
	DrillVisibilityEnum,
	DrillCategory,
	DrillIntensity,
	DrillSkill,
	DrillVisibility,
	DrillEquipmentInput,
} from "@/lib/models/Drill";
import { useClub } from "@/providers/ClubProvider";
import {
	Plus,
	X,
	ArrowLeft,
	ArrowRight,
	Check,
	Dumbbell,
	Zap,
	Flame,
	Target,
	Volleyball,
	Timer,
	Users,
	Eye,
	EyeOff,
	Sparkles,
	BookOpen,
	Gamepad2,
	Snowflake,
	ListOrdered,
	MessageSquare,
	Link2,
	Wrench,
	Building2,
} from "lucide-react";
import { useEffect, useState } from "react";
import DrillSelector from "./DrillSelector";
import { DrillAttachmentInput, type AttachmentInput } from "./attachments";

interface EditDrillModalProps {
	drill: Drill;
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

// Step configuration
const STEPS = [
	{ id: 1, label: "Basics" },
	{ id: 2, label: "Details" },
	{ id: 3, label: "Content" },
	{ id: 4, label: "Media" },
];

// Category cards with icons
const CATEGORY_OPTIONS = [
	{ value: "Warmup" as DrillCategory, label: "Warmup", description: "Pre-practice prep", icon: Sparkles },
	{ value: "Technical" as DrillCategory, label: "Technical", description: "Skill development", icon: Target },
	{ value: "Tactical" as DrillCategory, label: "Tactical", description: "Game strategies", icon: BookOpen },
	{ value: "Game" as DrillCategory, label: "Game", description: "Match simulations", icon: Gamepad2 },
	{ value: "Conditioning" as DrillCategory, label: "Conditioning", description: "Fitness & endurance", icon: Flame },
	{ value: "Cooldown" as DrillCategory, label: "Cooldown", description: "Recovery & stretch", icon: Snowflake },
];

// Intensity cards with icons
const INTENSITY_OPTIONS = [
	{ value: "Low" as DrillIntensity, label: "Low", description: "Light activity", icon: Snowflake },
	{ value: "Medium" as DrillIntensity, label: "Medium", description: "Moderate effort", icon: Zap },
	{ value: "High" as DrillIntensity, label: "High", description: "Maximum intensity", icon: Flame },
];

// Skills for MultiSelectPills
const SKILL_OPTIONS = [
	{ value: "Serving", label: "Serving" },
	{ value: "Passing", label: "Passing" },
	{ value: "Setting", label: "Setting" },
	{ value: "Attacking", label: "Attacking" },
	{ value: "Blocking", label: "Blocking" },
	{ value: "Defense", label: "Defense" },
	{ value: "Conditioning", label: "Conditioning" },
	{ value: "Footwork", label: "Footwork" },
];

interface SelectedVariation {
	drillId: string;
	drillName: string;
	drillCategory: string;
	drillIntensity: string;
	note?: string;
}

export default function EditDrillModal({ drill, isOpen, onClose, onSuccess }: EditDrillModalProps) {
	const updateDrill = useUpdateDrill();
	const addAttachment = useAddDrillAttachment();
	const deleteAttachment = useDeleteDrillAttachment();
	const { clubs } = useClub();

	// Step state
	const [currentStep, setCurrentStep] = useState(1);

	// Basic info (Step 1)
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [category, setCategory] = useState<DrillCategory>("Technical");
	const [intensity, setIntensity] = useState<DrillIntensity>("Medium");

	// Details (Step 2)
	const [visibility, setVisibility] = useState<DrillVisibility>("Public");
	const [duration, setDuration] = useState<string>("");
	const [minPlayers, setMinPlayers] = useState<string>("");
	const [maxPlayers, setMaxPlayers] = useState<string>("");
	const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
	const [equipment, setEquipment] = useState<DrillEquipmentInput[]>([]);
	const [clubId, setClubId] = useState<string | undefined>(undefined);

	// Content (Step 3)
	const [instructions, setInstructions] = useState<string[]>([]);
	const [coachingPoints, setCoachingPoints] = useState<string[]>([]);

	// Media (Step 4)
	const [variations, setVariations] = useState<SelectedVariation[]>([]);
	const [attachments, setAttachments] = useState<AttachmentInput[]>([]);
	const [originalAttachmentIds, setOriginalAttachmentIds] = useState<string[]>([]);

	// Validation errors
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Populate form when modal opens with drill data
	useEffect(() => {
		if (isOpen && drill) {
			setCurrentStep(1);
			setName(drill.name);
			setDescription(drill.description || "");
			setCategory(drill.category);
			setIntensity(drill.intensity);
			setVisibility(drill.visibility);
			setDuration(drill.duration?.toString() || "");
			setMinPlayers(drill.minPlayers?.toString() || "");
			setMaxPlayers(drill.maxPlayers?.toString() || "");
			setSelectedSkills(drill.skills || []);
			setInstructions(drill.instructions || []);
			setCoachingPoints(drill.coachingPoints || []);
			setEquipment(
				(drill.equipment || []).map((e) => ({
					name: e.name,
					isOptional: e.isOptional,
				}))
			);
			setClubId(drill.clubId);
			setVariations(
				(drill.variations || []).map((v) => ({
					drillId: v.drillId,
					drillName: v.drillName,
					drillCategory: v.drillCategory,
					drillIntensity: v.drillIntensity,
					note: v.note,
				}))
			);
			const existingAttachments: AttachmentInput[] = (drill.attachments || []).map((a) => ({
				id: a.id,
				fileName: a.fileName,
				fileUrl: a.fileUrl,
				fileType: a.fileType,
				fileSize: a.fileSize,
				isNew: false,
			}));
			setAttachments(existingAttachments);
			setOriginalAttachmentIds(existingAttachments.map((a) => a.id));
			setErrors({});
		}
	}, [isOpen, drill]);

	const handleSubmit = async () => {
		// Validate all required fields
		const allErrors: Record<string, string> = {};
		if (!name.trim()) allErrors.name = "Drill name is required";
		if (selectedSkills.length === 0) allErrors.skills = "Select at least one skill";

		if (Object.keys(allErrors).length > 0) {
			setErrors(allErrors);
			return;
		}

		const videoAttachment = attachments.find((a) => a.fileType === "Video");

		const request: UpdateDrillRequest = {
			id: drill.id,
			name: name.trim(),
			description: description.trim() || undefined,
			category: DrillCategoryEnum[category],
			intensity: DrillIntensityEnum[intensity],
			visibility: DrillVisibilityEnum[visibility],
			skills: selectedSkills.map((s) => DrillSkillEnum[s as DrillSkill]),
			duration: duration ? parseInt(duration) : undefined,
			minPlayers: minPlayers ? parseInt(minPlayers) : undefined,
			maxPlayers: maxPlayers ? parseInt(maxPlayers) : undefined,
			instructions: instructions.filter((i) => i.trim()),
			coachingPoints: coachingPoints.filter((c) => c.trim()),
			variations: variations.map((v) => ({
				drillId: v.drillId,
				note: v.note,
			})),
			equipment: equipment.filter((e) => e.name.trim()),
			videoUrl: videoAttachment?.fileUrl || undefined,
			clubId: clubId,
		};

		try {
			await updateDrill.mutateAsync({ drillId: drill.id, data: request });

			// Delete removed attachments
			const currentIds = attachments.map((a) => a.id);
			const deletedIds = originalAttachmentIds.filter((id) => !currentIds.includes(id));
			for (const attachmentId of deletedIds) {
				await deleteAttachment.mutateAsync({ drillId: drill.id, attachmentId });
			}

			// Add new attachments
			const newAttachments = attachments.filter((a) => a.isNew);
			for (const attachment of newAttachments) {
				const typeMap = { Image: 0, Video: 1, Document: 2 };
				await addAttachment.mutateAsync({
					drillId: drill.id,
					data: {
						fileName: attachment.fileName,
						fileUrl: attachment.fileUrl,
						fileType: typeMap[attachment.fileType],
						fileSize: attachment.fileSize,
					},
				});
			}

			onSuccess?.();
			onClose();
		} catch (error) {
			console.error("Failed to update drill:", error);
		}
	};

	const validateStep = (step: number): Record<string, string> => {
		const stepErrors: Record<string, string> = {};
		switch (step) {
			case 1:
				if (!name.trim()) {
					stepErrors.name = "Drill name is required";
				}
				break;
			case 2:
				if (selectedSkills.length === 0) {
					stepErrors.skills = "Select at least one skill";
				}
				break;
		}
		return stepErrors;
	};

	const nextStep = () => {
		const stepErrors = validateStep(currentStep);
		if (Object.keys(stepErrors).length > 0) {
			setErrors(stepErrors);
			return;
		}
		setErrors({});
		if (currentStep < STEPS.length) {
			setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	const isFirstStep = currentStep === 1;
	const isLastStep = currentStep === STEPS.length;
	const isLoading = updateDrill.isPending || addAttachment.isPending || deleteAttachment.isPending;

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={true} preventOutsideClose>
			<div className="flex flex-col h-full">
				{/* Header */}
				<div className="mb-6">
					<h2 className="text-xl font-bold text-white mb-1">Edit Drill</h2>
					<p className="text-muted text-sm">Update drill information</p>
				</div>

				{/* Stepper */}
			<div className="max-w-xl m-auto mb-8">
				<Steps steps={STEPS} currentStep={currentStep} size="sm" onStepClick={setCurrentStep} />
			</div>

				{/* Step Content */}
				<div className="flex-1 overflow-y-auto pr-1 min-h-[400px]">
					{currentStep === 1 && (
						<StepBasics
							name={name}
							setName={setName}
							description={description}
							setDescription={setDescription}
							category={category}
							setCategory={setCategory}
							intensity={intensity}
							setIntensity={setIntensity}
							errors={errors}
						/>
					)}

					{currentStep === 2 && (
						<StepDetails
							visibility={visibility}
							setVisibility={setVisibility}
							duration={duration}
							setDuration={setDuration}
							minPlayers={minPlayers}
							setMinPlayers={setMinPlayers}
							maxPlayers={maxPlayers}
							setMaxPlayers={setMaxPlayers}
							selectedSkills={selectedSkills}
							setSelectedSkills={setSelectedSkills}
							equipment={equipment}
							setEquipment={setEquipment}
							clubs={clubs}
							clubId={clubId}
							setClubId={setClubId}
							errors={errors}
						/>
					)}

					{currentStep === 3 && (
						<StepContent
							instructions={instructions}
							setInstructions={setInstructions}
							coachingPoints={coachingPoints}
							setCoachingPoints={setCoachingPoints}
						/>
					)}

					{currentStep === 4 && (
						<StepMedia
							variations={variations}
							setVariations={setVariations}
							attachments={attachments}
							setAttachments={setAttachments}
							excludeDrillId={drill.id}
						/>
					)}
				</div>

				{/* Navigation */}
				<div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
					{!isFirstStep ? (
						<Button
							type="button"
							variant="ghost"
							color="neutral"
							onClick={prevStep}
							disabled={isLoading}
							leftIcon={<ArrowLeft size={16} />}
						>
							Back
						</Button>
					) : (
						<Button
							type="button"
							variant="ghost"
							color="neutral"
							onClick={onClose}
							disabled={isLoading}
						>
							Cancel
						</Button>
					)}

					{!isLastStep ? (
						<Button
							type="button"
							variant="outline"
							onClick={nextStep}
							rightIcon={<ArrowRight size={16} />}
						>
							Next Step
						</Button>
					) : (
						<Button
							type="button"
							onClick={handleSubmit}
							disabled={isLoading}
							loading={isLoading}
							rightIcon={!isLoading ? <Check size={16} /> : undefined}
						>
							{isLoading ? "Saving..." : "Save Changes"}
						</Button>
					)}
				</div>
			</div>
		</Modal>
	);
}

// =============================================================================
// STEP 1: BASICS
// =============================================================================
interface StepBasicsProps {
	name: string;
	setName: (name: string) => void;
	description: string;
	setDescription: (description: string) => void;
	category: DrillCategory;
	setCategory: (category: DrillCategory) => void;
	intensity: DrillIntensity;
	setIntensity: (intensity: DrillIntensity) => void;
	errors?: Record<string, string>;
}

function StepBasics({
	name,
	setName,
	description,
	setDescription,
	category,
	setCategory,
	intensity,
	setIntensity,
	errors = {},
}: StepBasicsProps) {
	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="border-b border-border pb-4">
				<h3 className="text-lg font-semibold text-white mb-1">Basic Information</h3>
				<p className="text-sm text-muted">Update the essentials about your drill.</p>
			</div>

			<Input
				label="Drill Name"
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="e.g., Pepper Drill, 3-Man Weave"
				required
				leftIcon={<Volleyball size={16} />}
				error={errors.name}
			/>

			<TextArea
				label="Description"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				placeholder="Describe the drill and its objectives..."
				maxLength={500}
				showCharCount
				minRows={3}
				optional
			/>

			<RadioCards
				label="Category"
				options={CATEGORY_OPTIONS}
				value={category}
				onChange={setCategory}
				columns={3}
				size="sm"
			/>

			<RadioCards
				label="Intensity"
				options={INTENSITY_OPTIONS}
				value={intensity}
				onChange={setIntensity}
				columns={3}
				size="sm"
			/>
		</div>
	);
}

// =============================================================================
// STEP 2: DETAILS
// =============================================================================
interface StepDetailsProps {
	visibility: DrillVisibility;
	setVisibility: (visibility: DrillVisibility) => void;
	duration: string;
	setDuration: (duration: string) => void;
	minPlayers: string;
	setMinPlayers: (minPlayers: string) => void;
	maxPlayers: string;
	setMaxPlayers: (maxPlayers: string) => void;
	selectedSkills: string[];
	setSelectedSkills: (skills: string[]) => void;
	equipment: DrillEquipmentInput[];
	setEquipment: (equipment: DrillEquipmentInput[]) => void;
	clubs: { id: string; name: string }[];
	clubId: string | undefined;
	setClubId: (clubId: string | undefined) => void;
	errors?: Record<string, string>;
}

function StepDetails({
	visibility,
	setVisibility,
	duration,
	setDuration,
	minPlayers,
	setMinPlayers,
	maxPlayers,
	setMaxPlayers,
	selectedSkills,
	setSelectedSkills,
	equipment,
	setEquipment,
	clubs,
	clubId,
	setClubId,
	errors = {},
}: StepDetailsProps) {
	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="border-b border-border pb-4">
				<h3 className="text-lg font-semibold text-white mb-1">Drill Details</h3>
				<p className="text-sm text-muted">Configure timing, players, and skills.</p>
			</div>

			<Select
				label="Visibility"
				value={visibility}
				onChange={(value) => setVisibility(value as DrillVisibility)}
				options={[
					{ value: "Public", label: "Public - Visible to everyone" },
					{ value: "Private", label: "Private - Only visible to you" },
				]}
				leftIcon={visibility === "Public" ? <Eye size={16} /> : <EyeOff size={16} />}
			/>

			{/* Club */}
			{clubs.length > 0 && (
				<Select
					label="Club"
					value={clubId || ""}
					onChange={(value) => setClubId(value || undefined)}
					options={[
						{ value: "", label: "Personal drill (no club)" },
						...clubs.map((club) => ({ value: club.id, label: club.name })),
					]}
					leftIcon={<Building2 size={16} />}
					helperText="Link this drill to one of your clubs"
				/>
			)}

			<div className="grid grid-cols-3 gap-4">
				<Input
					label="Duration"
					type="number"
					value={duration}
					onChange={(e) => setDuration(e.target.value)}
					placeholder="15"
					min={1}
					leftIcon={<Timer size={16} />}
					inlineLabel="min"
					optional
				/>
				<Input
					label="Min Players"
					type="number"
					value={minPlayers}
					onChange={(e) => setMinPlayers(e.target.value)}
					placeholder="2"
					min={1}
					leftIcon={<Users size={16} />}
					optional
				/>
				<Input
					label="Max Players"
					type="number"
					value={maxPlayers}
					onChange={(e) => setMaxPlayers(e.target.value)}
					placeholder="12"
					min={1}
					leftIcon={<Users size={16} />}
					optional
				/>
			</div>

			<MultiSelectPills
				label="Skills Developed"
				options={SKILL_OPTIONS}
				selectedItems={selectedSkills}
				onSelectedItemsChange={setSelectedSkills}
				helperText={selectedSkills.length === 0 ? "Select at least one skill" : `${selectedSkills.length} skill${selectedSkills.length > 1 ? "s" : ""} selected`}
				error={errors.skills}
			/>

			<EquipmentList items={equipment} onChange={setEquipment} />
		</div>
	);
}

// =============================================================================
// STEP 3: CONTENT
// =============================================================================
interface StepContentProps {
	instructions: string[];
	setInstructions: (instructions: string[]) => void;
	coachingPoints: string[];
	setCoachingPoints: (points: string[]) => void;
}

function StepContent({
	instructions,
	setInstructions,
	coachingPoints,
	setCoachingPoints,
}: StepContentProps) {
	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="border-b border-border pb-4">
				<h3 className="text-lg font-semibold text-white mb-1">Instructions & Tips</h3>
				<p className="text-sm text-muted">Add step-by-step instructions and coaching notes.</p>
			</div>

			<DynamicList
				label="Instructions"
				icon={<ListOrdered size={16} />}
				items={instructions}
				onChange={setInstructions}
				placeholder="Add an instruction step..."
				ordered
				helperText="Break down the drill into clear steps"
			/>

			<DynamicList
				label="Coaching Points"
				icon={<MessageSquare size={16} />}
				items={coachingPoints}
				onChange={setCoachingPoints}
				placeholder="Add a coaching tip..."
				helperText="Key things coaches should watch for"
			/>
		</div>
	);
}

// =============================================================================
// STEP 4: MEDIA
// =============================================================================
interface StepMediaProps {
	variations: SelectedVariation[];
	setVariations: (variations: SelectedVariation[]) => void;
	attachments: AttachmentInput[];
	setAttachments: (attachments: AttachmentInput[]) => void;
	excludeDrillId?: string;
}

function StepMedia({
	variations,
	setVariations,
	attachments,
	setAttachments,
	excludeDrillId,
}: StepMediaProps) {
	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="border-b border-border pb-4">
				<h3 className="text-lg font-semibold text-white mb-1">Media & Variations</h3>
				<p className="text-sm text-muted">Add videos, images, and link related drills.</p>
			</div>

			<div>
				<label className="block text-sm font-medium text-white mb-2">
					<span className="flex items-center gap-2">
						<Link2 size={16} className="text-muted" />
						Attachments
						<span className="text-muted-foreground font-normal text-xs">(optional)</span>
					</span>
				</label>
				<DrillAttachmentInput attachments={attachments} onChange={setAttachments} />
			</div>

			<div>
				<label className="block text-sm font-medium text-white mb-2">
					<span className="flex items-center gap-2">
						<Sparkles size={16} className="text-muted" />
						Related Drills
						<span className="text-muted-foreground font-normal text-xs">(optional)</span>
					</span>
				</label>
				<p className="text-xs text-muted mb-3">Link to other drills that are variations of this one</p>
				<DrillSelector
					selectedDrills={variations}
					onChange={setVariations}
					excludeDrillIds={excludeDrillId ? [excludeDrillId] : undefined}
				/>
			</div>
		</div>
	);
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

interface DynamicListProps {
	label: string;
	icon?: React.ReactNode;
	items: string[];
	onChange: (items: string[]) => void;
	placeholder: string;
	ordered?: boolean;
	helperText?: string;
}

function DynamicList({ label, icon, items, onChange, placeholder, ordered, helperText }: DynamicListProps) {
	const [newItem, setNewItem] = useState("");
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [editingValue, setEditingValue] = useState("");

	const addItem = () => {
		if (newItem.trim()) {
			onChange([...items, newItem.trim()]);
			setNewItem("");
		}
	};

	const removeItem = (index: number) => {
		onChange(items.filter((_, i) => i !== index));
		if (editingIndex === index) setEditingIndex(null);
	};

	const startEditing = (index: number) => {
		setEditingIndex(index);
		setEditingValue(items[index]);
	};

	const saveEdit = () => {
		if (editingIndex === null) return;
		if (editingValue.trim()) {
			onChange(items.map((item, i) => (i === editingIndex ? editingValue.trim() : item)));
		}
		setEditingIndex(null);
		setEditingValue("");
	};

	const cancelEdit = () => {
		setEditingIndex(null);
		setEditingValue("");
	};

	const handleEditKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			saveEdit();
		} else if (e.key === "Escape") {
			e.preventDefault();
			cancelEdit();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addItem();
		}
	};

	return (
		<div>
			<label className="block text-sm font-medium text-white mb-2">
				<span className="flex items-center gap-2">
					{icon && <span className="text-muted">{icon}</span>}
					{label}
					<span className="text-muted-foreground font-normal text-xs">(optional)</span>
				</span>
			</label>

			{items.length > 0 && (
				<div className="space-y-2 mb-3">
					{items.map((item, index) => (
						<div
							key={index}
							className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border group"
						>
							{ordered && (
								<span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center shrink-0">
									{index + 1}
								</span>
							)}
							{!ordered && (
								<span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
							)}
							{editingIndex === index ? (
								<input
									type="text"
									value={editingValue}
									onChange={(e) => setEditingValue(e.target.value)}
									onKeyDown={handleEditKeyDown}
									onBlur={saveEdit}
									autoFocus
									className="flex-1 px-2 py-1 rounded-lg bg-surface border border-primary/50 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
								/>
							) : (
								<span
									className="flex-1 text-sm text-white cursor-pointer hover:text-accent transition-colors"
									onClick={() => startEditing(index)}
									title="Click to edit"
								>
									{item}
								</span>
							)}
							<button
								type="button"
								onClick={() => removeItem(index)}
								className="p-1.5 rounded-lg hover:bg-hover text-muted hover:text-error transition-colors opacity-0 group-hover:opacity-100"
							>
								<X size={14} />
							</button>
						</div>
					))}
				</div>
			)}

			<div className="flex gap-2">
				<input
					type="text"
					value={newItem}
					onChange={(e) => setNewItem(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={placeholder}
					className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-border text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
				/>
				<Button
					type="button"
					variant="ghost"
					color="accent"
					onClick={addItem}
					disabled={!newItem.trim()}
				>
					<Plus size={16} />
				</Button>
			</div>

			{helperText && (
				<p className="text-xs text-muted mt-2">{helperText}</p>
			)}
		</div>
	);
}

interface EquipmentListProps {
	items: DrillEquipmentInput[];
	onChange: (items: DrillEquipmentInput[]) => void;
}

function EquipmentList({ items, onChange }: EquipmentListProps) {
	const [newItem, setNewItem] = useState("");
	const [newItemOptional, setNewItemOptional] = useState(false);

	const addItem = () => {
		if (newItem.trim()) {
			onChange([...items, { name: newItem.trim(), isOptional: newItemOptional }]);
			setNewItem("");
			setNewItemOptional(false);
		}
	};

	const removeItem = (index: number) => {
		onChange(items.filter((_, i) => i !== index));
	};

	const toggleOptional = (index: number) => {
		onChange(
			items.map((item, i) => (i === index ? { ...item, isOptional: !item.isOptional } : item))
		);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();
			addItem();
		}
	};

	return (
		<div>
			<label className="block text-sm font-medium text-white mb-2">
				<span className="flex items-center gap-2">
					<Wrench size={16} className="text-muted" />
					Equipment
					<span className="text-muted-foreground font-normal text-xs">(optional)</span>
				</span>
			</label>

			{items.length > 0 && (
				<div className="space-y-2 mb-3">
					{items.map((item, index) => (
						<div
							key={index}
							className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border group"
						>
							<Dumbbell size={14} className={item.isOptional ? "text-muted/50" : "text-accent"} />
							<span className={`flex-1 text-sm ${item.isOptional ? "text-muted" : "text-white"}`}>
								{item.name}
							</span>
							<button
								type="button"
								onClick={() => toggleOptional(index)}
								className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
									item.isOptional
										? "bg-accent/20 text-accent"
										: "bg-surface text-muted hover:bg-hover"
								}`}
							>
								{item.isOptional ? "Optional" : "Required"}
							</button>
							<button
								type="button"
								onClick={() => removeItem(index)}
								className="p-1.5 rounded-lg hover:bg-hover text-muted hover:text-error transition-colors opacity-0 group-hover:opacity-100"
							>
								<X size={14} />
							</button>
						</div>
					))}
				</div>
			)}

			<div className="flex gap-2 items-center">
				<input
					type="text"
					value={newItem}
					onChange={(e) => setNewItem(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Add equipment item..."
					className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-border text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
				/>
				<label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer whitespace-nowrap px-2">
					<input
						type="checkbox"
						checked={newItemOptional}
						onChange={(e) => setNewItemOptional(e.target.checked)}
						className="w-3.5 h-3.5 rounded border-border bg-surface text-accent focus:ring-accent/50"
					/>
					Optional
				</label>
				<Button
					type="button"
					variant="ghost"
					color="accent"
					onClick={addItem}
					disabled={!newItem.trim()}
				>
					<Plus size={16} />
				</Button>
			</div>
		</div>
	);
}
