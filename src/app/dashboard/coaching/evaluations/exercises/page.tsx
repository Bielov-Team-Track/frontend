"use client";

import { Button } from "@/components";
import { EmptyState, Loader } from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEvaluationExercises } from "@/hooks/useEvaluationExercises";
import {
	ExerciseCard,
	ExerciseListItem,
	ExerciseFilters,
	CreateExerciseModal,
	type ExerciseSortBy,
	type ExerciseSortOrder,
	EXERCISE_SORT_OPTIONS,
} from "@/components/features/evaluations/exercises";
import { DifficultyLevel } from "@/lib/models/Template";
import { ArrowUpDown, ChevronDown, ClipboardCheck, Clock, Grid, List, Plus } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import type { MetricType, VolleyballSkill } from "@/components/features/evaluations/types";

export default function EvaluationExercisesPage() {
	const { data: exercisesData, isLoading, error, refetch } = useEvaluationExercises(1, 100);
	const exercises = exercisesData?.items || [];

	const [search, setSearch] = useState("");
	const [selectedSkills, setSelectedSkills] = useState<VolleyballSkill[]>([]);
	const [selectedMetricTypes, setSelectedMetricTypes] = useState<MetricType[]>([]);
	const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | undefined>(undefined);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [sortBy, setSortBy] = useState<ExerciseSortBy>("createdAt");
	const [sortOrder, setSortOrder] = useState<ExerciseSortOrder>("desc");
	const [showSortDropdown, setShowSortDropdown] = useState(false);
	const sortDropdownRef = useRef<HTMLDivElement>(null);

	// Close sort dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
				setShowSortDropdown(false);
			}
		};

		if (showSortDropdown) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showSortDropdown]);

	const currentSort = EXERCISE_SORT_OPTIONS.find(
		(opt) => opt.sortBy === sortBy && opt.sortOrder === sortOrder
	) || EXERCISE_SORT_OPTIONS[0];

	// Client-side filtering and sorting
	const filteredExercises = useMemo(() => {
		const filtered = exercises.filter((exercise) => {
			// Search
			if (search) {
				const q = search.toLowerCase();
				const matches =
					exercise.name.toLowerCase().includes(q) ||
					(exercise.description && exercise.description.toLowerCase().includes(q));
				if (!matches) return false;
			}

			// Skills - exercise must have metrics that include selected skills
			if (selectedSkills.length > 0) {
				const exerciseSkills = new Set<string>();
				exercise.metrics.forEach((metric) => {
					metric.skillWeights.forEach((sw) => exerciseSkills.add(sw.skill));
				});
				const hasMatchingSkill = selectedSkills.some((skill) => exerciseSkills.has(skill));
				if (!hasMatchingSkill) return false;
			}

			// Metric types
			if (selectedMetricTypes.length > 0) {
				const hasMatchingType = exercise.metrics.some((m) =>
					selectedMetricTypes.includes(m.type as MetricType)
				);
				if (!hasMatchingType) return false;
			}

			// Level filter
			if (selectedLevel && exercise.level !== selectedLevel) {
				return false;
			}

			return true;
		});

		// Sort the filtered results
		return [...filtered].sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case "createdAt":
					comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
					break;
				case "name":
					comparison = a.name.localeCompare(b.name);
					break;
				case "metricCount":
					comparison = a.metrics.length - b.metrics.length;
					break;
				default:
					comparison = 0;
			}
			return sortOrder === "desc" ? -comparison : comparison;
		});
	}, [search, selectedSkills, selectedMetricTypes, selectedLevel, exercises, sortBy, sortOrder]);

	const hasFilters = !!(selectedSkills.length > 0 || selectedMetricTypes.length > 0 || selectedLevel || search);

	const filterCount = selectedSkills.length + selectedMetricTypes.length + (selectedLevel ? 1 : 0);

	const clearFilters = () => {
		setSelectedSkills([]);
		setSelectedMetricTypes([]);
		setSelectedLevel(undefined);
		setSearch("");
	};

	const handleSortChange = (newSortBy: ExerciseSortBy, newSortOrder: ExerciseSortOrder) => {
		setSortBy(newSortBy);
		setSortOrder(newSortOrder);
	};

	if (error) {
		return (
			<div className="space-y-6">
				<EmptyState
					icon={ClipboardCheck}
					title="Failed to load exercises"
					description="There was an error loading the evaluation exercises. Please try again."
					action={{ label: "Retry", onClick: () => window.location.reload() }}
				/>
			</div>
		);
	}

	const renderContent = () => (
		<>
			{/* Results Header */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{filteredExercises.length} exercise{filteredExercises.length !== 1 ? "s" : ""}
					{hasFilters && " (filtered)"}
				</p>
				<div className="flex items-center gap-3">
					{/* Sort Dropdown */}
					<div className="relative" ref={sortDropdownRef}>
						<button
							type="button"
							onClick={() => setShowSortDropdown(!showSortDropdown)}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
						>
							<ArrowUpDown size={14} />
							<span className="hidden sm:inline">{currentSort.label}</span>
							<ChevronDown
								size={12}
								className={`transition-transform ${showSortDropdown ? "rotate-180" : ""}`}
							/>
						</button>

						{/* Sort Dropdown Menu */}
						{showSortDropdown && (
							<div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-card border border-border shadow-lg z-50 overflow-hidden">
								{EXERCISE_SORT_OPTIONS.map((option) => {
									const isSelected = option.sortBy === sortBy && option.sortOrder === sortOrder;
									return (
										<button
											key={`${option.sortBy}-${option.sortOrder}`}
											type="button"
											onClick={() => {
												handleSortChange(option.sortBy, option.sortOrder);
												setShowSortDropdown(false);
											}}
											className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors text-left ${
												isSelected
													? "bg-foreground/5 text-foreground"
													: "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
											}`}
										>
											<Clock size={14} />
											{option.label}
										</button>
									);
								})}
							</div>
						)}
					</div>

					{/* View Switcher */}
					<TabsList size="sm" className="border rounded-xl">
						<TabsTrigger value="list">
							<List size={18} />
						</TabsTrigger>
						<TabsTrigger value="grid">
							<Grid size={18} />
						</TabsTrigger>
					</TabsList>
				</div>
			</div>

			{/* Exercises Display */}
			{isLoading ? (
				<div className="flex justify-center py-12">
					<Loader />
				</div>
			) : filteredExercises.length === 0 ? (
				<EmptyState
					icon={ClipboardCheck}
					title="No exercises found"
					description="Try adjusting your search or filters"
					action={hasFilters ? { label: "Clear Filters", onClick: clearFilters } : undefined}
				/>
			) : (
				<>
					<TabsContent value="list">
						<div className="space-y-2">
							{filteredExercises.map((exercise) => (
								<ExerciseListItem
									key={exercise.id}
									exercise={exercise}
									highlightedSkills={selectedSkills}
								/>
							))}
						</div>
					</TabsContent>
					<TabsContent value="grid">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredExercises.map((exercise) => (
								<ExerciseCard
									key={exercise.id}
									exercise={exercise}
									highlightedSkills={selectedSkills}
								/>
							))}
						</div>
					</TabsContent>
				</>
			)}
		</>
	);

	return (
		<Tabs defaultValue="list" className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
						<ClipboardCheck size={28} className="text-accent" />
						Evaluation Exercises
					</h1>
					<p className="text-muted-foreground mt-1">
						Browse and create exercises to evaluate player skills
					</p>
				</div>
				<Button color="primary" leftIcon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
					Create Exercise
				</Button>
			</div>

			{/* Filters */}
			<ExerciseFilters
				search={search}
				onSearchChange={setSearch}
				selectedSkills={selectedSkills}
				onSelectedSkillsChange={setSelectedSkills}
				selectedMetricTypes={selectedMetricTypes}
				onSelectedMetricTypesChange={setSelectedMetricTypes}
				selectedLevel={selectedLevel}
				onSelectedLevelChange={setSelectedLevel}
				filterCount={filterCount}
				hasFilters={hasFilters}
				onClearFilters={clearFilters}
			/>

			{/* Content */}
			<div className="space-y-4">{renderContent()}</div>

			{/* Create Exercise Modal */}
			<CreateExerciseModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onSuccess={() => refetch()}
			/>
		</Tabs>
	);
}
