"use client";

import { SKILLS } from "@/components/features/drills";
import { Button, Input, Slider } from "@/components/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DIFFICULTY_LEVELS, DIFFICULTY_LEVEL_COLORS, DifficultyLevel } from "@/lib/models/Template";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Bookmark, Building2, ChevronDown, Clock, Filter, GraduationCap, Search, Sparkles, TrendingUp, User as UserIcon, Users, X } from "lucide-react";
import { useEffect, useState } from "react";

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

// Source filter
export type TemplateSource = "discover" | "club" | "bookmarked";

// Sort options
export type TemplateSortBy = "newest" | "mostUsed" | "mostLiked" | "shortest" | "longest";

export interface TemplateSortOption {
	label: string;
	value: TemplateSortBy;
	icon: React.ReactNode;
}

export const TEMPLATE_SORT_OPTIONS: TemplateSortOption[] = [
	{ label: "Newest First", value: "newest", icon: <Clock size={14} /> },
	{ label: "Most Used", value: "mostUsed", icon: <TrendingUp size={14} /> },
	{ label: "Most Liked", value: "mostLiked", icon: <TrendingUp size={14} /> },
	{ label: "Shortest", value: "shortest", icon: <Clock size={14} /> },
	{ label: "Longest", value: "longest", icon: <Clock size={14} /> },
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

export interface TemplateFiltersProps {
	search: string;
	onSearchChange: (value: string) => void;
	// Source
	source: TemplateSource;
	onSourceChange: (source: TemplateSource) => void;
	// Skills
	selectedSkills: string[];
	onSelectedSkillsChange: (skills: string[]) => void;
	// Duration
	durationRange: [number, number];
	onDurationRangeChange: (range: [number, number]) => void;
	durationMin: number;
	durationMax: number;
	// Level
	selectedLevel?: DifficultyLevel;
	onSelectedLevelChange?: (level: DifficultyLevel | undefined) => void;
	// Author/Club
	selectedAuthorId?: string;
	onSelectedAuthorIdChange?: (authorId: string | undefined) => void;
	selectedClubId?: string;
	onSelectedClubIdChange?: (clubId: string | undefined) => void;
	uniqueAuthors?: AuthorOption[];
	uniqueClubs?: ClubOption[];
	// Filter state
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
	color,
}: {
	children: React.ReactNode;
	selected: boolean;
	onClick: () => void;
	icon?: React.ReactNode;
	color?: "default" | "amber" | "emerald" | "blue";
}) {
	const colorClasses = {
		default: selected
			? "bg-foreground/5 text-foreground border-foreground/40"
			: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground hover:border-foreground/20",
		amber: selected
			? "bg-amber-500/10 text-amber-400 border-amber-500/40"
			: "bg-card/50 text-muted-foreground border-border hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/20",
		emerald: selected
			? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40"
			: "bg-card/50 text-muted-foreground border-border hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20",
		blue: selected
			? "bg-blue-500/10 text-blue-400 border-blue-500/40"
			: "bg-card/50 text-muted-foreground border-border hover:bg-blue-500/10 hover:text-blue-400 hover:border-blue-500/20",
	};

	return (
		<motion.button
			type="button"
			onClick={onClick}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			className={cn(
				"inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
				colorClasses[color || "default"],
			)}>
			{icon}
			{children}
		</motion.button>
	);
}

// ============================================
// Compact Inline Filters (Desktop)
// ============================================

function CompactFilters(props: TemplateFiltersProps) {
	const [expandedSection, setExpandedSection] = useState<string | null>(null);

	const toggleSection = (section: string) => {
		setExpandedSection((prev) => (prev === section ? null : section));
	};

	const isDurationModified = props.durationRange[0] > props.durationMin || props.durationRange[1] < props.durationMax;
	const durationLabel = isDurationModified ? `${props.durationRange[0]}-${props.durationRange[1]} min` : "Duration";

	const hasAuthors = props.uniqueAuthors && props.uniqueAuthors.length > 0;
	const hasClubs = props.uniqueClubs && props.uniqueClubs.length > 0;
	const selectedAuthor = props.uniqueAuthors?.find((a) => a.id === props.selectedAuthorId);
	const selectedClub = props.uniqueClubs?.find((c) => c.id === props.selectedClubId);

	const sections = [
		{ id: "skills", label: "Skills", count: props.selectedSkills.length, icon: <Sparkles size={14} />, hasValue: false },
		{
			id: "level",
			label: props.selectedLevel || "Level",
			count: props.selectedLevel ? 1 : 0,
			icon: <GraduationCap size={14} />,
			hasValue: !!props.selectedLevel,
		},
		{ id: "duration", label: durationLabel, count: 0, icon: <Clock size={14} />, hasValue: isDurationModified },
		...(hasAuthors
			? [
					{
						id: "author",
						label: selectedAuthor?.name || "Author",
						count: props.selectedAuthorId ? 1 : 0,
						icon: <UserIcon size={14} />,
						hasValue: !!props.selectedAuthorId,
					},
				]
			: []),
		...(hasClubs
			? [
					{
						id: "club",
						label: selectedClub?.name || "Club",
						count: props.selectedClubId ? 1 : 0,
						icon: <Building2 size={14} />,
						hasValue: !!props.selectedClubId,
					},
				]
			: []),
	];

	return (
		<div className="space-y-4">
			{/* Search Bar */}
			<div className="relative">
				<Input
					placeholder="Search training plans by name, description, or skill..."
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
				{/* Source Filters */}
				<FilterPill
					selected={props.source === "bookmarked"}
					onClick={() => props.onSourceChange(props.source === "bookmarked" ? "discover" : "bookmarked")}
					icon={<Bookmark size={12} className={props.source === "bookmarked" ? "fill-current" : ""} />}
					color="amber">
					Bookmarked
				</FilterPill>
				<FilterPill
					selected={props.source === "club"}
					onClick={() => props.onSourceChange(props.source === "club" ? "discover" : "club")}
					icon={<Users size={12} />}
					color="blue">
					Club
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
									: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground",
						)}>
						{section.icon}
						{section.label}
						{section.count > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-foreground/10 text-[10px]">{section.count}</span>}
						<ChevronDown size={12} className={cn("transition-transform", expandedSection === section.id && "rotate-180")} />
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
												)}>
												<GraduationCap size={12} />
												{level}
											</button>
										);
									})}
								</div>
							)}

							{expandedSection === "duration" && (
								<div className="max-w-sm">
									<Slider
										label="Total Duration"
										min={props.durationMin}
										max={props.durationMax}
										step={15}
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
												props.onSelectedAuthorIdChange?.(props.selectedAuthorId === author.id ? undefined : author.id);
											}}
											className={cn(
												"inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
												props.selectedAuthorId === author.id
													? "bg-foreground/5 text-foreground border-foreground/40"
													: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground",
											)}>
											<Avatar size="sm" className="size-5">
												{author.avatarUrl ? <AvatarImage src={author.avatarUrl} alt={author.name} /> : null}
												<AvatarFallback className="text-[9px]">{author.name.charAt(0)}</AvatarFallback>
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
												props.onSelectedClubIdChange?.(props.selectedClubId === club.id ? undefined : club.id);
											}}
											className={cn(
												"inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors",
												props.selectedClubId === club.id
													? "bg-foreground/5 text-foreground border-foreground/40"
													: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground",
											)}>
											<Avatar size="sm" className="size-5">
												{club.logoUrl ? <AvatarImage src={club.logoUrl} alt={club.name} /> : null}
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

function DrawerFilters(props: TemplateFiltersProps) {
	const [isOpen, setIsOpen] = useState(false);

	const isDurationModified = props.durationRange[0] > props.durationMin || props.durationRange[1] < props.durationMax;

	return (
		<>
			{/* Trigger Bar */}
			<div className="space-y-4">
				<div className="relative">
					<Input
						placeholder="Search training plans..."
						leftIcon={<Search size={18} className="text-muted-foreground" />}
						value={props.search}
						onChange={(e) => props.onSearchChange(e.target.value)}
					/>
				</div>

				<div className="flex items-center gap-2 overflow-x-auto pb-1">
					<Button variant="outline" onClick={() => setIsOpen(true)} leftIcon={<Filter size={16} />} className="shrink-0">
						Filters
						{props.filterCount > 0 && (
							<span className="ml-2 px-2 py-0.5 rounded-full bg-foreground/10 text-foreground text-xs font-bold">{props.filterCount}</span>
						)}
					</Button>

					{/* Source Toggles */}
					<FilterPill
						selected={props.source === "bookmarked"}
						onClick={() => props.onSourceChange(props.source === "bookmarked" ? "discover" : "bookmarked")}
						icon={<Bookmark size={12} className={props.source === "bookmarked" ? "fill-current" : ""} />}
						color="amber">
						Saved
					</FilterPill>
					<FilterPill
						selected={props.source === "club"}
						onClick={() => props.onSourceChange(props.source === "club" ? "discover" : "club")}
						icon={<Users size={12} />}
						color="blue">
						Club
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
						{props.selectedLevel && (
							<span
								className={cn(
									"inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
									DIFFICULTY_LEVEL_COLORS[props.selectedLevel].bg,
									DIFFICULTY_LEVEL_COLORS[props.selectedLevel].text,
								)}>
								<GraduationCap size={10} />
								{props.selectedLevel}
								<button
									type="button"
									onClick={() => props.onSelectedLevelChange?.(undefined)}
									className="hover:bg-foreground/20 rounded-full p-0.5">
									<X size={10} />
								</button>
							</span>
						)}
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
						{props.filterCount > 0 && (
							<button type="button" onClick={props.onClearFilters} className="text-xs text-muted-foreground hover:text-foreground ml-auto">
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
										<button type="button" onClick={props.onClearFilters} className="text-sm text-accent hover:text-accent/80">
											Reset
										</button>
									)}
									<button type="button" onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-muted transition-colors">
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
													)}>
													<GraduationCap size={14} />
													{level}
												</button>
											);
										})}
									</div>
								</div>

								{/* Duration */}
								<div>
									<Slider
										label="Total Duration"
										min={props.durationMin}
										max={props.durationMax}
										step={15}
										rangeValue={props.durationRange}
										onRangeChange={props.onDurationRangeChange}
										formatValue={(v) => `${v} min`}
										color="accent"
									/>
								</div>

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
														props.onSelectedAuthorIdChange?.(props.selectedAuthorId === author.id ? undefined : author.id);
													}}
													className={cn(
														"inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
														props.selectedAuthorId === author.id
															? "bg-foreground/5 text-foreground border-foreground/40"
															: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground",
													)}>
													<Avatar size="sm" className="size-6">
														{author.avatarUrl ? <AvatarImage src={author.avatarUrl} alt={author.name} /> : null}
														<AvatarFallback className="text-[10px]">{author.name.charAt(0)}</AvatarFallback>
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
														props.onSelectedClubIdChange?.(props.selectedClubId === club.id ? undefined : club.id);
													}}
													className={cn(
														"inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
														props.selectedClubId === club.id
															? "bg-foreground/5 text-foreground border-foreground/40"
															: "bg-card/50 text-muted-foreground border-border hover:bg-card hover:text-foreground",
													)}>
													<Avatar size="sm" className="size-6">
														{club.logoUrl ? <AvatarImage src={club.logoUrl} alt={club.name} /> : null}
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

export function TemplateFilters(props: TemplateFiltersProps) {
	const isMobile = useMediaQuery("(max-width: 767px)");

	return isMobile ? <DrawerFilters {...props} /> : <CompactFilters {...props} />;
}

export default TemplateFilters;
