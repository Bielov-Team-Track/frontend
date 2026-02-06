"use client";

import { Button, Input, Slider } from "@/components/ui";
import { DifficultyLevel, DIFFICULTY_LEVELS, DIFFICULTY_LEVEL_COLORS } from "@/lib/models/Template";
import { cn } from "@/lib/utils";
import {
	ArrowDownAZ,
	CheckSquare,
	ChevronDown,
	Clock,
	Filter,
	Gauge,
	GraduationCap,
	Hash,
	Percent,
	Search,
	Sparkles,
	X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { VOLLEYBALL_SKILLS, METRIC_TYPES, EXERCISE_SORT_OPTIONS, type VolleyballSkill, type MetricType, type ExerciseSortBy, type ExerciseSortOrder } from "../types";

export type { ExerciseSortBy, ExerciseSortOrder };
export { EXERCISE_SORT_OPTIONS };

// ============================================
// Responsive Hook
// ============================================

function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const mediaQuery = window.matchMedia(query);
		setMatches(mediaQuery.matches);

		const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
		mediaQuery.addEventListener("change", handler);

		return () => mediaQuery.removeEventListener("change", handler);
	}, [query]);

	return matches;
}

// ============================================
// Types
// ============================================

export interface ExerciseFiltersProps {
	search: string;
	onSearchChange: (value: string) => void;
	selectedSkills: VolleyballSkill[];
	onSelectedSkillsChange: (skills: VolleyballSkill[]) => void;
	selectedMetricTypes: MetricType[];
	onSelectedMetricTypesChange: (types: MetricType[]) => void;
	selectedLevel?: DifficultyLevel;
	onSelectedLevelChange?: (level: DifficultyLevel | undefined) => void;
	filterCount: number;
	hasFilters: boolean;
	onClearFilters: () => void;
}

// ============================================
// Shared Components
// ============================================

function FilterPill({
	children,
	selected,
	onClick,
	icon,
}: {
	children: React.ReactNode;
	selected: boolean;
	onClick: () => void;
	icon?: React.ReactNode;
}) {
	return (
		<motion.button
			type="button"
			onClick={onClick}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			className={cn(
				"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
				selected
					? "bg-foreground/5 text-foreground border-foreground/40"
					: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground hover:border-foreground/20"
			)}
		>
			{icon}
			{children}
		</motion.button>
	);
}

// ============================================
// Compact Inline Filters (Desktop)
// ============================================

function CompactFilters(props: ExerciseFiltersProps) {
	const [expandedSection, setExpandedSection] = useState<string | null>(null);

	const toggleSection = (section: string) => {
		setExpandedSection((prev) => (prev === section ? null : section));
	};

	const sections = [
		{ id: "skills", label: "Skills", count: props.selectedSkills.length, icon: <Sparkles size={14} />, hasValue: false },
		{ id: "level", label: props.selectedLevel || "Level", count: props.selectedLevel ? 1 : 0, icon: <GraduationCap size={14} />, hasValue: !!props.selectedLevel },
		{ id: "metricTypes", label: "Metric Types", count: props.selectedMetricTypes.length, icon: <CheckSquare size={14} />, hasValue: false },
	];

	return (
		<div className="space-y-4">
			{/* Search Bar */}
			<div className="relative">
				<Input
					placeholder="Search exercises by name or description..."
					leftIcon={<Search size={18} className="text-muted-foreground" />}
					value={props.search}
					onChange={(e) => props.onSearchChange(e.target.value)}
					className="pr-10"
				/>
				{props.search && (
					<button
						type="button"
						onClick={() => props.onSearchChange("")}
						className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
					>
						<X size={14} className="text-muted-foreground" />
					</button>
				)}
			</div>

			{/* Filter Chips Row */}
			<div className="flex flex-wrap items-center gap-2">
				{/* Expandable Sections */}
				{sections.map((section) => (
					<button
						key={section.id}
						type="button"
						onClick={() => toggleSection(section.id)}
						className={cn(
							"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
							expandedSection === section.id
								? "bg-foreground/5 text-foreground border-foreground/30"
								: section.count > 0 || section.hasValue
									? "bg-foreground/5 text-foreground border-foreground/40"
									: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground"
						)}
					>
						{section.icon}
						{section.label}
						{section.count > 0 && (
							<span className="ml-1 px-1.5 py-0.5 rounded-full bg-foreground/10 text-[10px]">
								{section.count}
							</span>
						)}
						<ChevronDown
							size={12}
							className={cn("transition-transform", expandedSection === section.id && "rotate-180")}
						/>
					</button>
				))}

				{/* Clear All */}
				{props.hasFilters && (
					<button
						type="button"
						onClick={props.onClearFilters}
						className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto"
					>
						Clear all
					</button>
				)}
			</div>

			{/* Expanded Section Content */}
			<AnimatePresence mode="wait">
				{expandedSection && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="overflow-hidden"
					>
						<div className="rounded-xl bg-card/50 border border-border p-4">
							{expandedSection === "skills" && (
								<div className="flex flex-wrap gap-2">
									{VOLLEYBALL_SKILLS.map((skill) => (
										<FilterPill
											key={skill}
											selected={props.selectedSkills.includes(skill)}
											onClick={() => {
												const newSkills = props.selectedSkills.includes(skill)
													? props.selectedSkills.filter((s) => s !== skill)
													: [...props.selectedSkills, skill];
												props.onSelectedSkillsChange(newSkills);
											}}
										>
											{skill}
										</FilterPill>
									))}
								</div>
							)}

							{expandedSection === "level" && (
								<div className="flex flex-wrap gap-2">
									{DIFFICULTY_LEVELS.map((level) => {
										const colors = DIFFICULTY_LEVEL_COLORS[level];
										const isSelected = props.selectedLevel === level;
										return (
											<button
												key={level}
												type="button"
												onClick={() => {
													props.onSelectedLevelChange?.(isSelected ? undefined : level);
												}}
												className={cn(
													"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
													isSelected
														? `${colors.bg} ${colors.text} ${colors.border}`
														: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground",
												)}
											>
												<GraduationCap size={12} />
												{level}
											</button>
										);
									})}
								</div>
							)}

							{expandedSection === "metricTypes" && (
								<div className="flex flex-wrap gap-2">
									{METRIC_TYPES.map((type) => {
										const icons: Record<string, React.ReactNode> = {
											Checkbox: <CheckSquare size={12} />,
											Slider: <Gauge size={12} />,
											Number: <Hash size={12} />,
											Ratio: <Percent size={12} />,
										};
										return (
											<FilterPill
												key={type}
												selected={props.selectedMetricTypes.includes(type)}
												onClick={() => {
													const newTypes = props.selectedMetricTypes.includes(type)
														? props.selectedMetricTypes.filter((t) => t !== type)
														: [...props.selectedMetricTypes, type];
													props.onSelectedMetricTypesChange(newTypes);
												}}
												icon={icons[type]}
											>
												{type}
											</FilterPill>
										);
									})}
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

// ============================================
// Bottom Sheet Drawer Filters (Mobile)
// ============================================

function DrawerFilters(props: ExerciseFiltersProps) {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			{/* Trigger Bar */}
			<div className="space-y-4">
				<div className="relative">
					<Input
						placeholder="Search exercises..."
						leftIcon={<Search size={18} className="text-muted-foreground" />}
						value={props.search}
						onChange={(e) => props.onSearchChange(e.target.value)}
					/>
				</div>

				<div className="flex items-center gap-3">
					<Button variant="outline" onClick={() => setIsOpen(true)} leftIcon={<Filter size={16} />} className="flex-1">
						Filters
						{props.filterCount > 0 && (
							<span className="ml-2 px-2 py-0.5 rounded-full bg-foreground/10 text-foreground text-xs font-bold">
								{props.filterCount}
							</span>
						)}
					</Button>
				</div>

				{/* Active Filters Summary */}
				{props.hasFilters && (
					<div className="flex flex-wrap items-center gap-2">
						{props.selectedSkills.map((skill) => (
							<span
								key={skill}
								className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/10 text-foreground text-xs font-medium"
							>
								{skill}
								<button
									type="button"
									onClick={() => props.onSelectedSkillsChange(props.selectedSkills.filter((s) => s !== skill))}
									className="hover:bg-foreground/20 rounded-full p-0.5"
								>
									<X size={10} />
								</button>
							</span>
						))}
						{props.selectedLevel && (
							<span className={cn(
								"inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
								DIFFICULTY_LEVEL_COLORS[props.selectedLevel].bg,
								DIFFICULTY_LEVEL_COLORS[props.selectedLevel].text
							)}>
								<GraduationCap size={10} />
								{props.selectedLevel}
								<button
									type="button"
									onClick={() => props.onSelectedLevelChange?.(undefined)}
									className="hover:bg-foreground/20 rounded-full p-0.5"
								>
									<X size={10} />
								</button>
							</span>
						)}
						{props.selectedMetricTypes.map((type) => (
							<span
								key={type}
								className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/10 text-foreground text-xs font-medium"
							>
								{type}
								<button
									type="button"
									onClick={() => props.onSelectedMetricTypesChange(props.selectedMetricTypes.filter((t) => t !== type))}
									className="hover:bg-foreground/20 rounded-full p-0.5"
								>
									<X size={10} />
								</button>
							</span>
						))}
						{props.filterCount > 0 && (
							<button
								type="button"
								onClick={props.onClearFilters}
								className="text-xs text-muted-foreground hover:text-foreground ml-auto"
							>
								Clear all
							</button>
						)}
					</div>
				)}
			</div>

			{/* Drawer Overlay */}
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsOpen(false)}
							className="fixed inset-0 bg-overlay backdrop-blur-sm z-50"
						/>

						{/* Drawer */}
						<motion.div
							initial={{ y: "100%" }}
							animate={{ y: 0 }}
							exit={{ y: "100%" }}
							drag="y"
							dragConstraints={{ top: 0 }}
							dragElastic={{ top: 0, bottom: 0.5 }}
							onDragEnd={(_, info) => {
								if (info.offset.y > 100 || info.velocity.y > 500) {
									setIsOpen(false);
								}
							}}
							transition={{ type: "spring", damping: 30, stiffness: 300 }}
							className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-3xl z-50 max-h-[85vh] overflow-hidden flex flex-col"
						>
							{/* Handle */}
							<div className="flex justify-center pt-3 pb-2">
								<div className="w-12 h-1.5 rounded-full bg-muted-foreground/30" />
							</div>

							{/* Header */}
							<div className="flex items-center justify-between px-6 pb-4 border-b border-border">
								<h2 className="text-lg font-bold">Filters</h2>
								<div className="flex items-center gap-3">
									{props.hasFilters && (
										<button
											type="button"
											onClick={props.onClearFilters}
											className="text-sm text-accent hover:text-accent/80"
										>
											Reset
										</button>
									)}
									<button
										type="button"
										onClick={() => setIsOpen(false)}
										className="p-2 rounded-full hover:bg-muted transition-colors"
									>
										<X size={20} />
									</button>
								</div>
							</div>

							{/* Content */}
							<div className="flex-1 overflow-y-auto p-6 space-y-6">
								{/* Skills */}
								<div>
									<h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Skills</h3>
									<div className="flex flex-wrap gap-2">
										{VOLLEYBALL_SKILLS.map((skill) => (
											<FilterPill
												key={skill}
												selected={props.selectedSkills.includes(skill)}
												onClick={() => {
													const newSkills = props.selectedSkills.includes(skill)
														? props.selectedSkills.filter((s) => s !== skill)
														: [...props.selectedSkills, skill];
													props.onSelectedSkillsChange(newSkills);
												}}
											>
												{skill}
											</FilterPill>
										))}
									</div>
								</div>

								{/* Level */}
								<div>
									<h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Level</h3>
									<div className="flex flex-wrap gap-2">
										{DIFFICULTY_LEVELS.map((level) => {
											const colors = DIFFICULTY_LEVEL_COLORS[level];
											const isSelected = props.selectedLevel === level;
											return (
												<button
													key={level}
													type="button"
													onClick={() => {
														props.onSelectedLevelChange?.(isSelected ? undefined : level);
													}}
													className={cn(
														"inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
														isSelected
															? `${colors.bg} ${colors.text} ${colors.border}`
															: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground",
													)}
												>
													<GraduationCap size={14} />
													{level}
												</button>
											);
										})}
									</div>
								</div>

								{/* Metric Types */}
								<div>
									<h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Metric Types</h3>
									<div className="grid grid-cols-2 gap-2">
										{METRIC_TYPES.map((type) => {
											const isSelected = props.selectedMetricTypes.includes(type);
											const icons: Record<string, React.ReactNode> = {
												Checkbox: <CheckSquare size={16} />,
												Slider: <Gauge size={16} />,
												Number: <Hash size={16} />,
												Ratio: <Percent size={16} />,
											};
											return (
												<button
													key={type}
													type="button"
													onClick={() => {
														const newTypes = isSelected
															? props.selectedMetricTypes.filter((t) => t !== type)
															: [...props.selectedMetricTypes, type];
														props.onSelectedMetricTypesChange(newTypes);
													}}
													className={cn(
														"flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
														isSelected
															? "bg-foreground/5 border-foreground/40"
															: "bg-card/50 border-border hover:bg-card"
													)}
												>
													<span className={isSelected ? "text-accent" : "text-muted-foreground"}>
														{icons[type]}
													</span>
													<span
														className={cn(
															"text-sm font-medium",
															isSelected ? "text-foreground" : "text-foreground"
														)}
													>
														{type}
													</span>
												</button>
											);
										})}
									</div>
								</div>
							</div>

							{/* Footer */}
							<div className="p-6 border-t border-border bg-card">
								<Button color="primary" fullWidth onClick={() => setIsOpen(false)}>
									Show Results
								</Button>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}

// ============================================
// Main Export - Responsive Filter Component
// ============================================

export function ExerciseFilters(props: ExerciseFiltersProps) {
	const isMobile = useMediaQuery("(max-width: 767px)");

	return isMobile ? <DrawerFilters {...props} /> : <CompactFilters {...props} />;
}

export default ExerciseFilters;
