"use client";

import { Button, Checkbox, Input, Slider } from "@/components/ui";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
	ArrowDownAZ,
	Bookmark,
	Building2,
	ChevronDown,
	Clock,
	Filter,
	Flame,
	Heart,
	LayoutGrid,
	Search,
	Sparkles,
	TrendingUp,
	User,
	Users,
	X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { CATEGORIES, INTENSITIES, SKILLS, type DrillCategory, type DrillIntensity, type DrillSkill } from "./types";

// Types for author/club filter options
export interface AuthorOption {
	id: string;
	name: string;
	avatarUrl?: string;
}

export interface ClubOption {
	id: string;
	name: string;
	logoUrl?: string;
}

// Sort options
export type DrillSortBy = "likeCount" | "createdAt" | "name" | "duration";
export type DrillSortOrder = "asc" | "desc";

export interface DrillSortOption {
	label: string;
	sortBy: DrillSortBy;
	sortOrder: DrillSortOrder;
	icon: React.ReactNode;
}

export const SORT_OPTIONS: DrillSortOption[] = [
	{ label: "Most Popular", sortBy: "likeCount", sortOrder: "desc", icon: <TrendingUp size={14} /> },
	{ label: "Newest First", sortBy: "createdAt", sortOrder: "desc", icon: <Clock size={14} /> },
	{ label: "Oldest First", sortBy: "createdAt", sortOrder: "asc", icon: <Clock size={14} /> },
	{ label: "Name (A-Z)", sortBy: "name", sortOrder: "asc", icon: <ArrowDownAZ size={14} /> },
	{ label: "Name (Z-A)", sortBy: "name", sortOrder: "desc", icon: <ArrowDownAZ size={14} /> },
	{ label: "Shortest Duration", sortBy: "duration", sortOrder: "asc", icon: <Clock size={14} /> },
	{ label: "Longest Duration", sortBy: "duration", sortOrder: "desc", icon: <Clock size={14} /> },
];

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

export interface DrillFiltersProps {
	search: string;
	onSearchChange: (value: string) => void;
	selectedSkills: DrillSkill[];
	onSelectedSkillsChange: (skills: DrillSkill[]) => void;
	selectedCategories: DrillCategory[];
	onSelectedCategoriesChange: (categories: DrillCategory[]) => void;
	selectedIntensities: DrillIntensity[];
	onSelectedIntensitiesChange: (intensities: DrillIntensity[]) => void;
	selectedEquipment: string[];
	onSelectedEquipmentChange: (equipment: string[]) => void;
	requiredEquipmentOnly: boolean;
	onRequiredEquipmentOnlyChange: (value: boolean) => void;
	showLikedOnly: boolean;
	onShowLikedOnlyChange: (value: boolean) => void;
	showSavedOnly: boolean;
	onShowSavedOnlyChange: (value: boolean) => void;
	durationRange: [number, number];
	onDurationRangeChange: (range: [number, number]) => void;
	playersRange: [number, number];
	onPlayersRangeChange: (range: [number, number]) => void;
	durationMin: number;
	durationMax: number;
	playersMin: number;
	playersMax: number;
	uniqueEquipment: string[];
	filterCount: number;
	hasFilters: boolean;
	onClearFilters: () => void;
	// Author/Club filters
	selectedAuthorId?: string;
	onSelectedAuthorIdChange?: (authorId: string | undefined) => void;
	selectedClubId?: string;
	onSelectedClubIdChange?: (clubId: string | undefined) => void;
	uniqueAuthors?: AuthorOption[];
	uniqueClubs?: ClubOption[];
}

// ============================================
// Shared Components
// ============================================

function FilterPill({
	children,
	selected,
	onClick,
	icon,
	color,
}: {
	children: React.ReactNode;
	selected: boolean;
	onClick: () => void;
	icon?: React.ReactNode;
	color?: "default" | "rose" | "amber" | "emerald";
}) {
	// Subtle selection: border emphasis + light tint, no heavy background
	const colorClasses = {
		default: selected
			? "bg-foreground/5 text-foreground border-foreground/40"
			: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground hover:border-foreground/20",
		rose: selected
			? "bg-rose-500/10 text-rose-400 border-rose-500/40"
			: "bg-card/50 text-muted-foreground border-border hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20",
		amber: selected
			? "bg-amber-500/10 text-amber-400 border-amber-500/40"
			: "bg-card/50 text-muted-foreground border-border hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/20",
		emerald: selected
			? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
			: "bg-card/50 text-muted-foreground border-border hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20",
	};

	return (
		<motion.button
			type="button"
			onClick={onClick}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			className={cn(
				"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
				colorClasses[color || "default"]
			)}>
			{icon}
			{children}
		</motion.button>
	);
}

function IntensityIndicator({ intensity, selected }: { intensity: DrillIntensity; selected: boolean }) {
	const bars = intensity === "Low" ? 1 : intensity === "Medium" ? 2 : 3;
	const color = intensity === "Low" ? "bg-emerald-500" : intensity === "Medium" ? "bg-amber-500" : "bg-rose-500";

	return (
		<div className="flex items-end gap-0.5 h-3">
			{[1, 2, 3].map((i) => (
				<div
					key={i}
					className={cn(
						"w-1 rounded-full transition-all",
						i <= bars ? color : "bg-muted-foreground/20",
						i === 1 ? "h-1.5" : i === 2 ? "h-2.5" : "h-3",
						!selected && i <= bars && "opacity-60"
					)}
				/>
			))}
		</div>
	);
}

// ============================================
// Compact Inline Filters (Desktop)
// ============================================

function CompactFilters(props: DrillFiltersProps) {
	const [expandedSection, setExpandedSection] = useState<string | null>(null);

	const toggleSection = (section: string) => {
		setExpandedSection((prev) => (prev === section ? null : section));
	};

	const isPlayersModified = props.playersRange[0] > props.playersMin || props.playersRange[1] < props.playersMax;
	const isDurationModified = props.durationRange[0] > props.durationMin || props.durationRange[1] < props.durationMax;

	const playersLabel = isPlayersModified
		? `${props.playersRange[0]}-${props.playersRange[1]} players`
		: "Players";
	const durationLabel = isDurationModified
		? `${props.durationRange[0]}-${props.durationRange[1]} min`
		: "Duration";

	const hasAuthors = props.uniqueAuthors && props.uniqueAuthors.length > 0;
	const hasClubs = props.uniqueClubs && props.uniqueClubs.length > 0;
	const selectedAuthor = props.uniqueAuthors?.find(a => a.id === props.selectedAuthorId);
	const selectedClub = props.uniqueClubs?.find(c => c.id === props.selectedClubId);

	const sections = [
		{ id: "skills", label: "Skills", count: props.selectedSkills.length, icon: <Sparkles size={14} />, hasValue: false },
		{ id: "category", label: "Category", count: props.selectedCategories.length, icon: <LayoutGrid size={14} />, hasValue: false },
		{ id: "intensity", label: "Intensity", count: props.selectedIntensities.length, icon: <Flame size={14} />, hasValue: false },
		{ id: "players", label: playersLabel, count: 0, icon: <Users size={14} />, hasValue: isPlayersModified },
		{ id: "duration", label: durationLabel, count: 0, icon: <Clock size={14} />, hasValue: isDurationModified },
		...(hasAuthors ? [{ id: "author", label: selectedAuthor?.name || "Author", count: props.selectedAuthorId ? 1 : 0, icon: <User size={14} />, hasValue: !!props.selectedAuthorId }] : []),
		...(hasClubs ? [{ id: "club", label: selectedClub?.name || "Club", count: props.selectedClubId ? 1 : 0, icon: <Building2 size={14} />, hasValue: !!props.selectedClubId }] : []),
	];

	return (
		<div className="space-y-4">
			{/* Search Bar */}
			<div className="relative">
				<Input
					placeholder="Search drills by name, description, or skill..."
					leftIcon={<Search size={18} className="text-muted-foreground" />}
					value={props.search}
					onChange={(e) => props.onSearchChange(e.target.value)}
					className="pr-10"
				/>
				{props.search && (
					<button
						type="button"
						onClick={() => props.onSearchChange("")}
						className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors">
						<X size={14} className="text-muted-foreground" />
					</button>
				)}
			</div>

			{/* Filter Chips Row */}
			<div className="flex flex-wrap items-center gap-2">
				{/* Quick Filters */}
				<FilterPill
					selected={props.showLikedOnly}
					onClick={() => props.onShowLikedOnlyChange(!props.showLikedOnly)}
					icon={<Heart size={12} className={props.showLikedOnly ? "fill-current" : ""} />}
					color="rose">
					Liked
				</FilterPill>
				<FilterPill
					selected={props.showSavedOnly}
					onClick={() => props.onShowSavedOnlyChange(!props.showSavedOnly)}
					icon={<Bookmark size={12} className={props.showSavedOnly ? "fill-current" : ""} />}
					color="amber">
					Saved
				</FilterPill>

				<div className="w-px h-6 bg-border mx-1" />

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
						)}>
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
						className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-auto">
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
						className="overflow-hidden">
						<div className="rounded-xl bg-card/50 border border-border p-4">
							{expandedSection === "skills" && (
								<div className="flex flex-wrap gap-2">
									{SKILLS.map((skill) => (
										<FilterPill
											key={skill}
											selected={props.selectedSkills.includes(skill)}
											onClick={() => {
												const newSkills = props.selectedSkills.includes(skill)
													? props.selectedSkills.filter((s) => s !== skill)
													: [...props.selectedSkills, skill];
												props.onSelectedSkillsChange(newSkills);
											}}>
											{skill}
										</FilterPill>
									))}
								</div>
							)}

							{expandedSection === "category" && (
								<div className="flex flex-wrap gap-2">
									{CATEGORIES.map((cat) => (
										<FilterPill
											key={cat}
											selected={props.selectedCategories.includes(cat)}
											onClick={() => {
												const newCats = props.selectedCategories.includes(cat)
													? props.selectedCategories.filter((c) => c !== cat)
													: [...props.selectedCategories, cat];
												props.onSelectedCategoriesChange(newCats);
											}}>
											{cat}
										</FilterPill>
									))}
								</div>
							)}

							{expandedSection === "intensity" && (
								<div className="flex flex-wrap gap-2">
									{INTENSITIES.map((int) => (
										<FilterPill
											key={int}
											selected={props.selectedIntensities.includes(int)}
											onClick={() => {
												const newInts = props.selectedIntensities.includes(int)
													? props.selectedIntensities.filter((i) => i !== int)
													: [...props.selectedIntensities, int];
												props.onSelectedIntensitiesChange(newInts);
											}}
											color={int === "Low" ? "emerald" : int === "Medium" ? "amber" : "rose"}>
											<IntensityIndicator intensity={int} selected={props.selectedIntensities.includes(int)} />
											{int}
										</FilterPill>
									))}
								</div>
							)}

							{expandedSection === "players" && (
								<div className="max-w-sm">
									<Slider
										label="Number of Players"
										min={props.playersMin}
										max={props.playersMax}
										step={1}
										rangeValue={props.playersRange}
										onRangeChange={props.onPlayersRangeChange}
										formatValue={(v) => `${v}`}
										color="accent"
									/>
								</div>
							)}

							{expandedSection === "duration" && (
								<div className="max-w-sm">
									<Slider
										label="Duration"
										min={props.durationMin}
										max={props.durationMax}
										step={5}
										rangeValue={props.durationRange}
										onRangeChange={props.onDurationRangeChange}
										formatValue={(v) => `${v} min`}
										color="accent"
									/>
								</div>
							)}

							{expandedSection === "author" && props.uniqueAuthors && (
								<div className="flex flex-wrap gap-2">
									{props.uniqueAuthors.map((author) => (
										<button
											key={author.id}
											type="button"
											onClick={() => {
												props.onSelectedAuthorIdChange?.(
													props.selectedAuthorId === author.id ? undefined : author.id
												);
											}}
											className={cn(
												"inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
												props.selectedAuthorId === author.id
													? "bg-foreground/5 text-foreground border-foreground/40"
													: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground"
											)}>
											<Avatar size="sm" className="size-5">
												{author.avatarUrl ? (
													<AvatarImage src={author.avatarUrl} alt={author.name} />
												) : null}
												<AvatarFallback className="text-[9px]">
													{author.name.charAt(0)}
												</AvatarFallback>
											</Avatar>
											{author.name}
										</button>
									))}
								</div>
							)}

							{expandedSection === "club" && props.uniqueClubs && (
								<div className="flex flex-wrap gap-2">
									{props.uniqueClubs.map((club) => (
										<button
											key={club.id}
											type="button"
											onClick={() => {
												props.onSelectedClubIdChange?.(
													props.selectedClubId === club.id ? undefined : club.id
												);
											}}
											className={cn(
												"inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
												props.selectedClubId === club.id
													? "bg-foreground/5 text-foreground border-foreground/40"
													: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground"
											)}>
											<Avatar size="sm" className="size-5">
												{club.logoUrl ? (
													<AvatarImage src={club.logoUrl} alt={club.name} />
												) : null}
												<AvatarFallback className="text-[9px]">
													<Building2 size={10} />
												</AvatarFallback>
											</Avatar>
											{club.name}
										</button>
									))}
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

function DrawerFilters(props: DrillFiltersProps) {
	const [isOpen, setIsOpen] = useState(false);

	const isPlayersModified = props.playersRange[0] > props.playersMin || props.playersRange[1] < props.playersMax;
	const isDurationModified = props.durationRange[0] > props.durationMin || props.durationRange[1] < props.durationMax;

	return (
		<>
			{/* Trigger Bar */}
			<div className="space-y-4">
				<div className="relative">
					<Input
						placeholder="Search drills..."
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

					{/* Quick Toggles */}
					<FilterPill
						selected={props.showLikedOnly}
						onClick={() => props.onShowLikedOnlyChange(!props.showLikedOnly)}
						icon={<Heart size={12} className={props.showLikedOnly ? "fill-current" : ""} />}
						color="rose">
						Liked
					</FilterPill>
					<FilterPill
						selected={props.showSavedOnly}
						onClick={() => props.onShowSavedOnlyChange(!props.showSavedOnly)}
						icon={<Bookmark size={12} className={props.showSavedOnly ? "fill-current" : ""} />}
						color="amber">
						Saved
					</FilterPill>
				</div>

				{/* Active Filters Summary */}
				{props.hasFilters && (
					<div className="flex flex-wrap items-center gap-2">
						{props.selectedSkills.map((skill) => (
							<span
								key={skill}
								className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/10 text-foreground text-xs font-medium">
								{skill}
								<button
									type="button"
									onClick={() => props.onSelectedSkillsChange(props.selectedSkills.filter((s) => s !== skill))}
									className="hover:bg-foreground/20 rounded-full p-0.5">
									<X size={10} />
								</button>
							</span>
						))}
						{props.selectedCategories.map((cat) => (
							<span
								key={cat}
								className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/10 text-foreground text-xs font-medium">
								{cat}
								<button
									type="button"
									onClick={() => props.onSelectedCategoriesChange(props.selectedCategories.filter((c) => c !== cat))}
									className="hover:bg-foreground/20 rounded-full p-0.5">
									<X size={10} />
								</button>
							</span>
						))}
						{props.selectedIntensities.map((int) => (
							<span
								key={int}
								className={cn(
									"inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
									int === "Low"
										? "bg-emerald-500/10 text-emerald-400"
										: int === "Medium"
											? "bg-amber-500/10 text-amber-400"
											: "bg-rose-500/10 text-rose-400"
								)}>
								{int}
								<button
									type="button"
									onClick={() => props.onSelectedIntensitiesChange(props.selectedIntensities.filter((i) => i !== int))}
									className="hover:bg-hover rounded-full p-0.5">
									<X size={10} />
								</button>
							</span>
						))}
						{isDurationModified && (
							<span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/10 text-foreground text-xs font-medium">
								<Clock size={10} />
								{props.durationRange[0]}-{props.durationRange[1]} min
								<button
									type="button"
									onClick={() => props.onDurationRangeChange([props.durationMin, props.durationMax])}
									className="hover:bg-foreground/20 rounded-full p-0.5">
									<X size={10} />
								</button>
							</span>
						)}
						{isPlayersModified && (
							<span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-foreground/10 text-foreground text-xs font-medium">
								<Users size={10} />
								{props.playersRange[0]}-{props.playersRange[1]} players
								<button
									type="button"
									onClick={() => props.onPlayersRangeChange([props.playersMin, props.playersMax])}
									className="hover:bg-foreground/20 rounded-full p-0.5">
									<X size={10} />
								</button>
							</span>
						)}
						{props.filterCount > 0 && (
							<button
								type="button"
								onClick={props.onClearFilters}
								className="text-xs text-muted-foreground hover:text-foreground ml-auto">
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
							className="fixed bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-3xl z-50 max-h-[85vh] overflow-hidden flex flex-col">
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
											className="text-sm text-accent hover:text-accent/80">
											Reset
										</button>
									)}
									<button
										type="button"
										onClick={() => setIsOpen(false)}
										className="p-2 rounded-full hover:bg-muted transition-colors">
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
										{SKILLS.map((skill) => (
											<FilterPill
												key={skill}
												selected={props.selectedSkills.includes(skill)}
												onClick={() => {
													const newSkills = props.selectedSkills.includes(skill)
														? props.selectedSkills.filter((s) => s !== skill)
														: [...props.selectedSkills, skill];
													props.onSelectedSkillsChange(newSkills);
												}}>
												{skill}
											</FilterPill>
										))}
									</div>
								</div>

								{/* Categories */}
								<div>
									<h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Categories</h3>
									<div className="flex flex-wrap gap-2">
										{CATEGORIES.map((cat) => (
											<FilterPill
												key={cat}
												selected={props.selectedCategories.includes(cat)}
												onClick={() => {
													const newCats = props.selectedCategories.includes(cat)
														? props.selectedCategories.filter((c) => c !== cat)
														: [...props.selectedCategories, cat];
													props.onSelectedCategoriesChange(newCats);
												}}>
												{cat}
											</FilterPill>
										))}
									</div>
								</div>

								{/* Intensity */}
								<div>
									<h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Intensity</h3>
									<div className="grid grid-cols-3 gap-2">
										{INTENSITIES.map((int) => {
											const isSelected = props.selectedIntensities.includes(int);
											return (
												<button
													key={int}
													type="button"
													onClick={() => {
														const newInts = isSelected
															? props.selectedIntensities.filter((i) => i !== int)
															: [...props.selectedIntensities, int];
														props.onSelectedIntensitiesChange(newInts);
													}}
													className={cn(
														"flex flex-col items-center gap-2 p-4 rounded-xl border transition-all",
														isSelected
															? int === "Low"
																? "bg-emerald-500/10 border-emerald-500/40"
																: int === "Medium"
																	? "bg-amber-500/10 border-amber-500/40"
																	: "bg-rose-500/10 border-rose-500/40"
															: "bg-card/50 border-border hover:bg-card"
													)}>
													<IntensityIndicator intensity={int} selected={isSelected} />
													<span
														className={cn(
															"text-sm font-medium",
															isSelected
																? int === "Low"
																	? "text-emerald-400"
																	: int === "Medium"
																		? "text-amber-400"
																		: "text-rose-400"
																: "text-foreground"
														)}>
														{int}
													</span>
												</button>
											);
										})}
									</div>
								</div>

								{/* Duration */}
								<div>
									<Slider
										label="Duration"
										min={props.durationMin}
										max={props.durationMax}
										step={5}
										rangeValue={props.durationRange}
										onRangeChange={props.onDurationRangeChange}
										formatValue={(v) => `${v} min`}
										color="accent"
									/>
								</div>

								{/* Players */}
								<div>
									<Slider
										label="Number of Players"
										min={props.playersMin}
										max={props.playersMax}
										step={1}
										rangeValue={props.playersRange}
										onRangeChange={props.onPlayersRangeChange}
										formatValue={(v) => `${v}`}
										color="accent"
									/>
								</div>

								{/* Equipment */}
								{props.uniqueEquipment.length > 0 && (
									<div>
										<h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Equipment</h3>
										<div className="flex flex-wrap gap-2 mb-3">
											{props.uniqueEquipment.map((equip) => (
												<FilterPill
													key={equip}
													selected={props.selectedEquipment.includes(equip)}
													onClick={() => {
														const newEquip = props.selectedEquipment.includes(equip)
															? props.selectedEquipment.filter((e) => e !== equip)
															: [...props.selectedEquipment, equip];
														props.onSelectedEquipmentChange(newEquip);
													}}>
													{equip}
												</FilterPill>
											))}
										</div>
										{props.selectedEquipment.length > 0 && (
											<Checkbox
												label="Required equipment only"
												checked={props.requiredEquipmentOnly}
												onChange={props.onRequiredEquipmentOnlyChange}
											/>
										)}
									</div>
								)}

								{/* Author */}
								{props.uniqueAuthors && props.uniqueAuthors.length > 0 && (
									<div>
										<h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Author</h3>
										<div className="flex flex-wrap gap-2">
											{props.uniqueAuthors.map((author) => (
												<button
													key={author.id}
													type="button"
													onClick={() => {
														props.onSelectedAuthorIdChange?.(
															props.selectedAuthorId === author.id ? undefined : author.id
														);
													}}
													className={cn(
														"inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
														props.selectedAuthorId === author.id
															? "bg-foreground/5 text-foreground border-foreground/40"
															: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground"
													)}>
													<Avatar size="sm" className="size-6">
														{author.avatarUrl ? (
															<AvatarImage src={author.avatarUrl} alt={author.name} />
														) : null}
														<AvatarFallback className="text-[10px]">
															{author.name.charAt(0)}
														</AvatarFallback>
													</Avatar>
													{author.name}
												</button>
											))}
										</div>
									</div>
								)}

								{/* Club */}
								{props.uniqueClubs && props.uniqueClubs.length > 0 && (
									<div>
										<h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Club</h3>
										<div className="flex flex-wrap gap-2">
											{props.uniqueClubs.map((club) => (
												<button
													key={club.id}
													type="button"
													onClick={() => {
														props.onSelectedClubIdChange?.(
															props.selectedClubId === club.id ? undefined : club.id
														);
													}}
													className={cn(
														"inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
														props.selectedClubId === club.id
															? "bg-foreground/5 text-foreground border-foreground/40"
															: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground"
													)}>
													<Avatar size="sm" className="size-6">
														{club.logoUrl ? (
															<AvatarImage src={club.logoUrl} alt={club.name} />
														) : null}
														<AvatarFallback className="text-[10px]">
															<Building2 size={12} />
														</AvatarFallback>
													</Avatar>
													{club.name}
												</button>
											))}
										</div>
									</div>
								)}

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

export function DrillFilters(props: DrillFiltersProps) {
	const isMobile = useMediaQuery("(max-width: 767px)");

	return isMobile ? <DrawerFilters {...props} /> : <CompactFilters {...props} />;
}

export default DrillFilters;
