"use client";

import { Button, Input, RadioCards, Select, Steps, TextArea } from "@/components";
import { Modal } from "@/components/ui";
import { useCreateEvaluationExercise } from "@/hooks/useEvaluationExercises";
import {
	CreateEvaluationExerciseRequest,
	CreateEvaluationMetricDto,
	CreateMetricSkillWeightDto,
} from "@/lib/models/Evaluation";
import { useClub } from "@/providers/ClubProvider";
import {
	ArrowLeft,
	ArrowRight,
	Building2,
	Check,
	CheckSquare,
	Gauge,
	Hash,
	ListChecks,
	Percent,
	Plus,
	Target,
	Trash2,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { VOLLEYBALL_SKILLS, METRIC_TYPES, type VolleyballSkill, type MetricType } from "../types";

interface CreateExerciseModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
}

// Step configuration
const STEPS = [
	{ id: 1, label: "Basics" },
	{ id: 2, label: "Metrics" },
];

// Metric type cards with icons
const METRIC_TYPE_OPTIONS = [
	{ value: "Checkbox" as MetricType, label: "Yes/No", description: "Pass or fail check", icon: CheckSquare },
	{ value: "Slider" as MetricType, label: "Slider", description: "Score on a scale", icon: Gauge },
	{ value: "Number" as MetricType, label: "Number", description: "Numeric value", icon: Hash },
	{ value: "Ratio" as MetricType, label: "Ratio", description: "Success out of attempts", icon: Percent },
];

interface MetricFormData {
	name: string;
	type: MetricType;
	maxPoints: string;
	skillWeights: { skill: VolleyballSkill; percentage: string }[];
}

const DEFAULT_METRIC: MetricFormData = {
	name: "",
	type: "Checkbox",
	maxPoints: "10",
	skillWeights: [],
};

export default function CreateExerciseModal({ isOpen, onClose, onSuccess }: CreateExerciseModalProps) {
	const createExercise = useCreateEvaluationExercise();
	const { clubs } = useClub();

	// Step state
	const [currentStep, setCurrentStep] = useState(1);

	// Basic info (Step 1)
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [clubId, setClubId] = useState<string | undefined>(undefined);

	// Metrics (Step 2)
	const [metrics, setMetrics] = useState<MetricFormData[]>([]);
	const [currentMetric, setCurrentMetric] = useState<MetricFormData>(DEFAULT_METRIC);
	const [isEditingMetric, setIsEditingMetric] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number>(-1);

	// Validation errors
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Reset form when modal opens/closes
	useEffect(() => {
		if (isOpen) {
			setCurrentStep(1);
			setName("");
			setDescription("");
			setClubId(undefined);
			setMetrics([]);
			setCurrentMetric(DEFAULT_METRIC);
			setIsEditingMetric(false);
			setEditingIndex(-1);
			setErrors({});
		}
	}, [isOpen]);

	const handleSubmit = async () => {
		// Validate all required fields
		const allErrors: Record<string, string> = {};
		if (!name.trim()) allErrors.name = "Exercise name is required";
		if (metrics.length === 0) allErrors.metrics = "Add at least one metric";

		if (Object.keys(allErrors).length > 0) {
			setErrors(allErrors);
			return;
		}

		const request: CreateEvaluationExerciseRequest = {
			name: name.trim(),
			description: description.trim() || undefined,
			clubId: clubId,
			metrics: metrics.map((m) => ({
				name: m.name,
				type: m.type,
				maxPoints: parseInt(m.maxPoints),
				skillWeights: m.skillWeights.map((sw) => ({
					skill: sw.skill,
					percentage: parseInt(sw.percentage),
				})),
			})),
		};

		try {
			await createExercise.mutateAsync(request);
			onSuccess?.();
			onClose();
		} catch (error) {
			console.error("Failed to create exercise:", error);
		}
	};

	const validateStep = (step: number): Record<string, string> => {
		const stepErrors: Record<string, string> = {};
		switch (step) {
			case 1:
				if (!name.trim()) {
					stepErrors.name = "Exercise name is required";
				}
				break;
			case 2:
				if (metrics.length === 0) {
					stepErrors.metrics = "Add at least one metric";
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
	const isLoading = createExercise.isPending;

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={true}>
			<div className="flex flex-col h-full">
				{/* Header */}
				<div className="mb-6">
					<h2 className="text-xl font-bold text-white mb-1">Create Evaluation Exercise</h2>
					<p className="text-muted text-sm">Build a custom evaluation exercise with multiple metrics</p>
				</div>

				{/* Stepper */}
				<div className="max-w-xl m-auto mb-8">
					<Steps steps={STEPS} currentStep={currentStep} size="sm" />
				</div>

				{/* Step Content */}
				<div className="flex-1 overflow-y-auto pr-1 min-h-[400px]">
					{currentStep === 1 && (
						<StepBasics
							name={name}
							setName={setName}
							description={description}
							setDescription={setDescription}
							clubs={clubs}
							clubId={clubId}
							setClubId={setClubId}
							errors={errors}
						/>
					)}

					{currentStep === 2 && (
						<StepMetrics
							metrics={metrics}
							setMetrics={setMetrics}
							currentMetric={currentMetric}
							setCurrentMetric={setCurrentMetric}
							isEditingMetric={isEditingMetric}
							setIsEditingMetric={setIsEditingMetric}
							editingIndex={editingIndex}
							setEditingIndex={setEditingIndex}
							errors={errors}
							setErrors={setErrors}
						/>
					)}
				</div>

				{/* Navigation */}
				<div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
					{!isFirstStep ? (
						<Button type="button" variant="ghost" color="neutral" onClick={prevStep} disabled={isLoading} leftIcon={<ArrowLeft size={16} />}>
							Back
						</Button>
					) : (
						<Button type="button" variant="ghost" color="neutral" onClick={onClose} disabled={isLoading}>
							Cancel
						</Button>
					)}

					{!isLastStep ? (
						<Button type="button" variant="outline" onClick={nextStep} rightIcon={<ArrowRight size={16} />}>
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
							{isLoading ? "Creating..." : "Create Exercise"}
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
	clubs: { id: string; name: string }[];
	clubId: string | undefined;
	setClubId: (clubId: string | undefined) => void;
	errors?: Record<string, string>;
}

function StepBasics({ name, setName, description, setDescription, clubs, clubId, setClubId, errors = {} }: StepBasicsProps) {
	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="border-b border-border pb-4">
				<h3 className="text-lg font-semibold text-white mb-1">Basic Information</h3>
				<p className="text-sm text-muted">Name your exercise and optionally link it to a club.</p>
			</div>

			<Input
				label="Exercise Name"
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="e.g., Serving Accuracy Test, Passing Under Pressure"
				required
				leftIcon={<Target size={16} />}
				error={errors.name}
			/>

			<TextArea
				label="Description"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				placeholder="Describe the purpose and setup of this evaluation exercise..."
				maxLength={500}
				showCharCount
				minRows={3}
				optional
			/>

			{/* Club */}
			{clubs.length > 0 && (
				<Select
					label="Club"
					value={clubId || ""}
					onChange={(value) => setClubId(value || undefined)}
					options={[{ value: "", label: "Personal exercise (no club)" }, ...clubs.map((club) => ({ value: club.id, label: club.name }))]}
					leftIcon={<Building2 size={16} />}
					helperText="Link this exercise to one of your clubs"
				/>
			)}
		</div>
	);
}

// =============================================================================
// STEP 2: METRICS
// =============================================================================
interface StepMetricsProps {
	metrics: MetricFormData[];
	setMetrics: (metrics: MetricFormData[]) => void;
	currentMetric: MetricFormData;
	setCurrentMetric: (metric: MetricFormData) => void;
	isEditingMetric: boolean;
	setIsEditingMetric: (editing: boolean) => void;
	editingIndex: number;
	setEditingIndex: (index: number) => void;
	errors: Record<string, string>;
	setErrors: (errors: Record<string, string>) => void;
}

function StepMetrics({
	metrics,
	setMetrics,
	currentMetric,
	setCurrentMetric,
	isEditingMetric,
	setIsEditingMetric,
	editingIndex,
	setEditingIndex,
	errors,
	setErrors,
}: StepMetricsProps) {
	const addSkillWeight = () => {
		if (currentMetric.skillWeights.length < VOLLEYBALL_SKILLS.length) {
			const availableSkills = VOLLEYBALL_SKILLS.filter(
				(skill) => !currentMetric.skillWeights.some((sw) => sw.skill === skill)
			);
			if (availableSkills.length > 0) {
				setCurrentMetric({
					...currentMetric,
					skillWeights: [...currentMetric.skillWeights, { skill: availableSkills[0], percentage: "0" }],
				});
			}
		}
	};

	const updateSkillWeight = (index: number, field: "skill" | "percentage", value: string) => {
		const updated = [...currentMetric.skillWeights];
		updated[index] = { ...updated[index], [field]: value };
		setCurrentMetric({ ...currentMetric, skillWeights: updated });
	};

	const removeSkillWeight = (index: number) => {
		setCurrentMetric({
			...currentMetric,
			skillWeights: currentMetric.skillWeights.filter((_, i) => i !== index),
		});
	};

	const getTotalPercentage = () => {
		return currentMetric.skillWeights.reduce((sum, sw) => sum + (parseInt(sw.percentage) || 0), 0);
	};

	const validateMetric = (): string | null => {
		if (!currentMetric.name.trim()) return "Metric name is required";
		if (!currentMetric.maxPoints || parseInt(currentMetric.maxPoints) <= 0) return "Max points must be greater than 0";
		if (currentMetric.skillWeights.length === 0) return "Add at least one skill weight";
		const total = getTotalPercentage();
		if (total !== 100) return `Skill weights must sum to 100% (currently ${total}%)`;
		return null;
	};

	const saveMetric = () => {
		const error = validateMetric();
		if (error) {
			setErrors({ ...errors, currentMetric: error });
			return;
		}

		if (isEditingMetric && editingIndex >= 0) {
			const updated = [...metrics];
			updated[editingIndex] = currentMetric;
			setMetrics(updated);
		} else {
			setMetrics([...metrics, currentMetric]);
		}

		setCurrentMetric(DEFAULT_METRIC);
		setIsEditingMetric(false);
		setEditingIndex(-1);
		setErrors({ ...errors, currentMetric: "" });
	};

	const cancelMetricEdit = () => {
		setCurrentMetric(DEFAULT_METRIC);
		setIsEditingMetric(false);
		setEditingIndex(-1);
		setErrors({ ...errors, currentMetric: "" });
	};

	const editMetric = (index: number) => {
		setCurrentMetric(metrics[index]);
		setIsEditingMetric(true);
		setEditingIndex(index);
	};

	const deleteMetric = (index: number) => {
		setMetrics(metrics.filter((_, i) => i !== index));
	};

	const totalPercentage = getTotalPercentage();
	const isPercentageValid = totalPercentage === 100;

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="border-b border-border pb-4">
				<h3 className="text-lg font-semibold text-white mb-1">Evaluation Metrics</h3>
				<p className="text-sm text-muted">Add metrics that will be used to evaluate players.</p>
			</div>

			{/* Existing Metrics List */}
			{metrics.length > 0 && (
				<div className="space-y-2">
					<label className="block text-sm font-medium text-white mb-2">
						<span className="flex items-center gap-2">
							<ListChecks size={16} className="text-muted" />
							Metrics ({metrics.length})
						</span>
					</label>
					{metrics.map((metric, index) => (
						<div key={index} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-surface border border-border group">
							<div className="flex-1 min-w-0">
								<div className="flex items-center gap-2">
									<h4 className="font-semibold text-sm text-white">{metric.name}</h4>
									<span className="text-xs text-muted-foreground">({metric.type})</span>
									<span className="text-xs font-medium text-accent">{metric.maxPoints} pts</span>
								</div>
								<div className="flex flex-wrap gap-1.5 mt-1.5">
									{metric.skillWeights.map((sw, i) => (
										<span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-accent/20 text-accent">
											{sw.skill} {sw.percentage}%
										</span>
									))}
								</div>
							</div>
							<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
								<button
									type="button"
									onClick={() => editMetric(index)}
									className="p-1.5 rounded-lg hover:bg-hover text-muted hover:text-accent transition-colors"
								>
									<Target size={14} />
								</button>
								<button
									type="button"
									onClick={() => deleteMetric(index)}
									className="p-1.5 rounded-lg hover:bg-hover text-muted hover:text-error transition-colors"
								>
									<Trash2 size={14} />
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Metric Editor */}
			<div className="rounded-xl bg-card/50 border border-border p-4 space-y-4">
				<h4 className="text-sm font-semibold text-white">
					{isEditingMetric ? "Edit Metric" : "Add New Metric"}
				</h4>

				<Input
					label="Metric Name"
					value={currentMetric.name}
					onChange={(e) => setCurrentMetric({ ...currentMetric, name: e.target.value })}
					placeholder="e.g., Serve accuracy, Pass quality"
					required
				/>

				<RadioCards
					label="Metric Type"
					options={METRIC_TYPE_OPTIONS}
					value={currentMetric.type}
					onChange={(value) => setCurrentMetric({ ...currentMetric, type: value })}
					columns={2}
					size="sm"
				/>

				<Input
					label="Max Points"
					type="number"
					value={currentMetric.maxPoints}
					onChange={(e) => setCurrentMetric({ ...currentMetric, maxPoints: e.target.value })}
					placeholder="10"
					min={1}
					required
				/>

				{/* Skill Weights */}
				<div>
					<label className="block text-sm font-medium text-white mb-2">
						Skill Weights
						<span className="text-xs text-muted-foreground ml-2">(must sum to 100%)</span>
					</label>

					{currentMetric.skillWeights.length > 0 && (
						<div className="space-y-2 mb-3">
							{currentMetric.skillWeights.map((sw, index) => (
								<div key={index} className="flex items-center gap-2">
									<Select
										value={sw.skill}
										onChange={(value) => updateSkillWeight(index, "skill", value)}
										options={VOLLEYBALL_SKILLS.filter(
											(skill) => skill === sw.skill || !currentMetric.skillWeights.some((w) => w.skill === skill)
										).map((skill) => ({ value: skill, label: skill }))}
										className="flex-1"
									/>
									<Input
										type="number"
										value={sw.percentage}
										onChange={(e) => updateSkillWeight(index, "percentage", e.target.value)}
										placeholder="0"
										min={0}
										max={100}
										inlineLabel="%"
										className="w-24"
									/>
									<button
										type="button"
										onClick={() => removeSkillWeight(index)}
										className="p-2 rounded-lg hover:bg-hover text-muted hover:text-error transition-colors"
									>
										<X size={16} />
									</button>
								</div>
							))}
						</div>
					)}

					<div className="flex items-center justify-between gap-3">
						<Button
							type="button"
							variant="ghost"
							color="accent"
							onClick={addSkillWeight}
							disabled={currentMetric.skillWeights.length >= VOLLEYBALL_SKILLS.length}
							leftIcon={<Plus size={16} />}
							size="sm"
						>
							Add Skill
						</Button>
						<div className="text-sm">
							<span className="text-muted-foreground">Total: </span>
							<span className={`font-bold ${isPercentageValid ? "text-emerald-400" : "text-amber-400"}`}>
								{totalPercentage}%
							</span>
						</div>
					</div>
				</div>

				{errors.currentMetric && (
					<p className="text-xs text-error">{errors.currentMetric}</p>
				)}

				<div className="flex items-center gap-2 pt-2">
					<Button
						type="button"
						variant="outline"
						onClick={saveMetric}
						leftIcon={<Check size={16} />}
						size="sm"
					>
						{isEditingMetric ? "Update Metric" : "Add Metric"}
					</Button>
					{isEditingMetric && (
						<Button type="button" variant="ghost" onClick={cancelMetricEdit} size="sm">
							Cancel
						</Button>
					)}
				</div>
			</div>

			{errors.metrics && (
				<p className="text-xs text-error">{errors.metrics}</p>
			)}
		</div>
	);
}
