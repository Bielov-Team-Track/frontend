"use client";

import { Button, Input, Steps, TextArea } from "@/components";
import { Modal, EmptyState, Loader } from "@/components/ui";
import { useCreateEvaluationPlan } from "@/hooks/useEvaluationPlans";
import { useEvaluationExercises } from "@/hooks/useEvaluationExercises";
import {
	CreateEvaluationPlanRequest,
	EvaluationExercise,
} from "@/lib/models/Evaluation";
import {
	ArrowLeft,
	ArrowRight,
	Check,
	ClipboardList,
	FileText,
	Plus,
	Search,
	Target,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { getExerciseSkills, SKILL_COLORS } from "../types";

interface CreatePlanModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	eventId: string;
}

// Step configuration
const STEPS = [
	{ id: 1, label: "Basics" },
	{ id: 2, label: "Exercises" },
];

export default function CreatePlanModal({
	isOpen,
	onClose,
	onSuccess,
	eventId,
}: CreatePlanModalProps) {
	const createPlan = useCreateEvaluationPlan();

	// Step state
	const [currentStep, setCurrentStep] = useState(1);

	// Basic info (Step 1)
	const [name, setName] = useState("");
	const [notes, setNotes] = useState("");

	// Exercises (Step 2)
	const [selectedExercises, setSelectedExercises] = useState<EvaluationExercise[]>([]);

	// Validation errors
	const [errors, setErrors] = useState<Record<string, string>>({});

	// Reset form when modal opens/closes
	useEffect(() => {
		if (isOpen) {
			setCurrentStep(1);
			setName("");
			setNotes("");
			setSelectedExercises([]);
			setErrors({});
		}
	}, [isOpen]);

	const handleSubmit = async () => {
		// Validate
		const allErrors: Record<string, string> = {};
		if (selectedExercises.length === 0) {
			allErrors.exercises = "Select at least one exercise";
		}

		if (Object.keys(allErrors).length > 0) {
			setErrors(allErrors);
			return;
		}

		const request: CreateEvaluationPlanRequest = {
			name: name.trim() || undefined,
			notes: notes.trim() || undefined,
			exerciseIds: selectedExercises.map((ex) => ex.id),
		};

		try {
			await createPlan.mutateAsync({ eventId, data: request });
			onSuccess?.();
			onClose();
		} catch (error) {
			console.error("Failed to create plan:", error);
		}
	};

	const validateStep = (step: number): Record<string, string> => {
		const stepErrors: Record<string, string> = {};
		switch (step) {
			case 2:
				if (selectedExercises.length === 0) {
					stepErrors.exercises = "Select at least one exercise";
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
	const isLoading = createPlan.isPending;

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="lg" showCloseButton={true}>
			<div className="flex flex-col h-full">
				{/* Header */}
				<div className="mb-6">
					<h2 className="text-xl font-bold text-white mb-1">Create Evaluation Plan</h2>
					<p className="text-muted text-sm">
						Build a plan by selecting exercises for this event
					</p>
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
							notes={notes}
							setNotes={setNotes}
						/>
					)}

					{currentStep === 2 && (
						<StepExercises
							selectedExercises={selectedExercises}
							setSelectedExercises={setSelectedExercises}
							errors={errors}
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
							{isLoading ? "Creating..." : "Create Plan"}
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
	notes: string;
	setNotes: (notes: string) => void;
}

function StepBasics({ name, setName, notes, setNotes }: StepBasicsProps) {
	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="border-b border-border pb-4">
				<h3 className="text-lg font-semibold text-white mb-1">Plan Details</h3>
				<p className="text-sm text-muted">
					Give your evaluation plan a name and description.
				</p>
			</div>

			<Input
				label="Plan Name"
				value={name}
				onChange={(e) => setName(e.target.value)}
				placeholder="e.g., Tryout Evaluation, Pre-Season Assessment"
				leftIcon={<ClipboardList size={16} />}
				optional
				helperText="Leave blank to use default name"
			/>

			<TextArea
				label="Notes"
				value={notes}
				onChange={(e) => setNotes(e.target.value)}
				placeholder="Add any notes or instructions for this evaluation plan..."
				maxLength={500}
				showCharCount
				minRows={3}
				optional
			/>
		</div>
	);
}

// =============================================================================
// STEP 2: EXERCISES
// =============================================================================
interface StepExercisesProps {
	selectedExercises: EvaluationExercise[];
	setSelectedExercises: (exercises: EvaluationExercise[]) => void;
	errors?: Record<string, string>;
}

function StepExercises({
	selectedExercises,
	setSelectedExercises,
	errors = {},
}: StepExercisesProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const { data: exercisesData, isLoading } = useEvaluationExercises(1, 50);

	// Filter exercises by search query
	const filteredExercises =
		exercisesData?.items.filter(
			(ex) =>
				ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				ex.description?.toLowerCase().includes(searchQuery.toLowerCase())
		) || [];

	// Filter out already selected exercises
	const availableExercises = filteredExercises.filter(
		(ex) => !selectedExercises.some((sel) => sel.id === ex.id)
	);

	const handleAddExercise = (exercise: EvaluationExercise) => {
		setSelectedExercises([...selectedExercises, exercise]);
	};

	const handleRemoveExercise = (exerciseId: string) => {
		setSelectedExercises(selectedExercises.filter((ex) => ex.id !== exerciseId));
	};

	const handleMoveUp = (index: number) => {
		if (index === 0) return;
		const newList = [...selectedExercises];
		[newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
		setSelectedExercises(newList);
	};

	const handleMoveDown = (index: number) => {
		if (index === selectedExercises.length - 1) return;
		const newList = [...selectedExercises];
		[newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
		setSelectedExercises(newList);
	};

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="border-b border-border pb-4">
				<h3 className="text-lg font-semibold text-white mb-1">Select Exercises</h3>
				<p className="text-sm text-muted">
					Choose exercises to include in this evaluation plan.
				</p>
			</div>

			{/* Selected exercises */}
			{selectedExercises.length > 0 && (
				<div className="space-y-2">
					<label className="block text-sm font-medium text-white mb-2">
						Selected Exercises ({selectedExercises.length})
					</label>
					<div className="space-y-2">
						{selectedExercises.map((exercise, index) => {
							const skills = getExerciseSkills(exercise.metrics);
							return (
								<div
									key={exercise.id}
									className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface border border-border group"
								>
									<span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs font-bold flex items-center justify-center shrink-0">
										{index + 1}
									</span>
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2">
											<span className="text-sm font-medium text-white truncate">
												{exercise.name}
											</span>
											<span className="text-xs text-muted-foreground shrink-0">
												{exercise.metrics.length} metrics
											</span>
										</div>
										{skills.length > 0 && (
											<div className="flex items-center gap-1.5 mt-1">
												{skills.map((skill) => (
													<span
														key={skill}
														className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${SKILL_COLORS[skill as keyof typeof SKILL_COLORS] || "bg-surface text-muted"}`}
													>
														{skill}
													</span>
												))}
											</div>
										)}
									</div>
									<div className="flex items-center gap-1">
										<button
											type="button"
											onClick={() => handleMoveUp(index)}
											disabled={index === 0}
											className="p-1.5 rounded-lg hover:bg-hover text-muted hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
											title="Move up"
										>
											<ArrowLeft size={14} className="rotate-90" />
										</button>
										<button
											type="button"
											onClick={() => handleMoveDown(index)}
											disabled={index === selectedExercises.length - 1}
											className="p-1.5 rounded-lg hover:bg-hover text-muted hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
											title="Move down"
										>
											<ArrowRight size={14} className="rotate-90" />
										</button>
										<button
											type="button"
											onClick={() => handleRemoveExercise(exercise.id)}
											className="p-1.5 rounded-lg hover:bg-hover text-muted hover:text-error transition-colors"
											title="Remove"
										>
											<X size={14} />
										</button>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Exercise browser */}
			<div>
				<label className="block text-sm font-medium text-white mb-2">
					Browse Exercises
				</label>

				{/* Search */}
				<div className="relative mb-3">
					<Search
						size={16}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
					/>
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search exercises..."
						className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-white placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
					/>
				</div>

				{/* Exercise list */}
				<div className="rounded-xl border border-border bg-card max-h-[300px] overflow-y-auto">
					{isLoading ? (
						<div className="p-8 flex items-center justify-center">
							<Loader size="md" />
						</div>
					) : availableExercises.length === 0 ? (
						<EmptyState
							icon={<ClipboardList size={32} />}
							title="No exercises found"
							description={
								searchQuery
									? "Try adjusting your search"
									: selectedExercises.length > 0
										? "All exercises have been added"
										: "Create some exercises first"
							}
							compact
						/>
					) : (
						<div className="divide-y divide-border">
							{availableExercises.map((exercise) => {
								const skills = getExerciseSkills(exercise.metrics);
								return (
									<button
										key={exercise.id}
										type="button"
										onClick={() => handleAddExercise(exercise)}
										className="w-full flex items-center gap-3 p-3 hover:bg-hover transition-colors text-left"
									>
										<div className="flex-1 min-w-0">
											<div className="flex items-center gap-2">
												<span className="text-sm font-medium text-white truncate">
													{exercise.name}
												</span>
												<span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-violet-400 bg-violet-500/15 shrink-0">
													<Target size={10} />
													{exercise.metrics.length}
												</span>
											</div>
											{exercise.description && (
												<p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
													{exercise.description}
												</p>
											)}
											{skills.length > 0 && (
												<div className="flex items-center gap-1.5 mt-1">
													{skills.slice(0, 3).map((skill) => (
														<span
															key={skill}
															className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${SKILL_COLORS[skill as keyof typeof SKILL_COLORS] || "bg-surface text-muted"}`}
														>
															{skill}
														</span>
													))}
													{skills.length > 3 && (
														<span className="text-[10px] text-muted/70">
															+{skills.length - 3}
														</span>
													)}
												</div>
											)}
										</div>
										<Plus
											size={16}
											className="text-muted-foreground hover:text-accent transition-colors shrink-0"
										/>
									</button>
								);
							})}
						</div>
					)}
				</div>

				{errors.exercises && (
					<p className="text-xs text-error mt-2">{errors.exercises}</p>
				)}
			</div>
		</div>
	);
}
