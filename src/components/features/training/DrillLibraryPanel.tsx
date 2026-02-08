"use client";

import { Badge, Card, Input, Slider } from "@/components";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { loadDrills } from "@/lib/api/drills";
import { Drill, DrillCategory, DrillFilterRequest, DrillIntensity, DrillSkill } from "@/lib/models/Drill";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpDown, Bookmark, ChevronDown, Clock, Eye, Heart, Search, SlidersHorizontal, User, X } from "lucide-react";
import { useMemo, useState } from "react";

// =============================================================================
// TYPES
// =============================================================================

interface DrillLibraryPanelProps {
	onAddDrill: (drill: Drill) => void;
	onViewDetails: (drill: Drill) => void;
}

type SortBy = "name" | "duration" | "intensity" | "category" | "likes" | "bookmarks" | "recent";

type QuickFilter = "liked" | "saved" | "mine";

const DURATION_MIN = 0;
const DURATION_MAX = 30;

// =============================================================================
// CONSTANTS
// =============================================================================

const CATEGORIES: DrillCategory[] = ["Warmup", "Technical", "Tactical", "Game", "Conditioning", "Cooldown"];
const INTENSITIES: DrillIntensity[] = ["Low", "Medium", "High"];
const SKILLS: DrillSkill[] = ["Serving", "Passing", "Setting", "Attacking", "Blocking", "Defense", "Conditioning", "Footwork"];

// Category colors (brighter for better readability)
const CATEGORY_COLORS: Record<DrillCategory, string> = {
	Warmup: "#3DBCC4",
	Technical: "#5B9BD5",
	Tactical: "#FF9533",
	Game: "#FFBC33",
	Conditioning: "#E85A3D",
	Cooldown: "#6ABF62",
};

// Intensity colors (brighter for better readability)
const INTENSITY_COLORS: Record<DrillIntensity, string> = {
	Low: "#6ABF62",
	Medium: "#FFBC33",
	High: "#E85A3D",
};

// Sort options
const SORT_OPTIONS: { value: SortBy; label: string }[] = [
	{ value: "name", label: "Name" },
	{ value: "duration", label: "Duration" },
	{ value: "intensity", label: "Intensity" },
	{ value: "category", label: "Category" },
	{ value: "likes", label: "Most Liked" },
	{ value: "bookmarks", label: "Most Saved" },
	{ value: "recent", label: "Recent" },
];

// =============================================================================
// FILTER TAG COMPONENT
// =============================================================================

interface FilterTagProps {
	label: string;
	color?: string;
	onRemove: () => void;
}

function FilterTag({ label, color, onRemove }: FilterTagProps) {
	return (
		<span
			className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-foreground/5 text-foreground/80 border border-border/50"
			style={color ? { backgroundColor: `${color}15`, borderColor: `${color}30`, color } : undefined}>
			{label}
			<button
				onClick={(e) => {
					e.stopPropagation();
					onRemove();
				}}
				className="hover:text-foreground transition-colors"
				aria-label={`Remove ${label} filter`}>
				<X size={10} />
			</button>
		</span>
	);
}

// =============================================================================
// SKELETON LOADER
// =============================================================================

function DrillCardSkeleton() {
	return (
		<div className="rounded-lg bg-surface border border-border p-3 animate-pulse">
			<div className="h-4 bg-muted/20 rounded w-3/4 mb-2" />
			<div className="flex gap-1.5">
				<div className="h-5 bg-muted/15 rounded w-12" />
				<div className="h-5 bg-muted/15 rounded w-16" />
				<div className="h-5 bg-muted/15 rounded w-14" />
			</div>
		</div>
	);
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function DrillLibraryPanel({ onAddDrill, onViewDetails }: DrillLibraryPanelProps) {
	const { user } = useAuth();

	// Filter state
	const [search, setSearch] = useState("");
	const [selectedCategories, setSelectedCategories] = useState<DrillCategory[]>([]);
	const [selectedIntensities, setSelectedIntensities] = useState<DrillIntensity[]>([]);
	const [durationRange, setDurationRange] = useState<[number, number]>([DURATION_MIN, DURATION_MAX]);
	const [selectedSkills, setSelectedSkills] = useState<DrillSkill[]>([]);
	const [sortBy, setSortBy] = useState<SortBy>("name");
	const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([]);

	// Check if duration filter is active (not at default range)
	const isDurationFilterActive = durationRange[0] > DURATION_MIN || durationRange[1] < DURATION_MAX;

	// Toggle quick filter
	const toggleQuickFilter = (filter: QuickFilter) => {
		setQuickFilters((prev) => (prev.includes(filter) ? prev.filter((f) => f !== filter) : [...prev, filter]));
	};

	// Build API filter request
	const apiFilters = useMemo<DrillFilterRequest>(() => {
		const filters: DrillFilterRequest = {};

		if (search.trim()) {
			filters.searchTerm = search.trim();
		}

		// Sort mapping
		if (sortBy === "likes") {
			filters.sortBy = "likeCount";
			filters.sortOrder = "desc";
		} else if (sortBy === "bookmarks") {
			filters.sortBy = "bookmarkCount";
			filters.sortOrder = "desc";
		} else if (sortBy === "recent") {
			filters.sortBy = "createdAt";
			filters.sortOrder = "desc";
		} else if (sortBy === "name") {
			filters.sortBy = "name";
			filters.sortOrder = "asc";
		} else if (sortBy === "duration") {
			filters.sortBy = "duration";
			filters.sortOrder = "asc";
		} else if (sortBy === "intensity") {
			filters.sortBy = "intensity";
			filters.sortOrder = "asc";
		} else if (sortBy === "category") {
			filters.sortBy = "category";
			filters.sortOrder = "asc";
		}

		return filters;
	}, [search, sortBy]);

	// Fetch drills
	const { data: drills = [], isLoading } = useQuery({
		queryKey: ["drills", apiFilters],
		queryFn: () => loadDrills(apiFilters),
	});

	// Client-side filtering (for multi-select filters not supported by API)
	const filteredDrills = useMemo(() => {
		let result = [...drills];

		// Quick filters
		if (quickFilters.includes("liked")) {
			result = result.filter((drill) => drill.isLiked);
		}
		if (quickFilters.includes("saved")) {
			result = result.filter((drill) => drill.isBookmarked);
		}
		if (quickFilters.includes("mine") && user?.id) {
			result = result.filter((drill) => drill.createdByUserId === user.id);
		}

		// Category filter
		if (selectedCategories.length > 0) {
			result = result.filter((drill) => selectedCategories.includes(drill.category));
		}

		// Intensity filter
		if (selectedIntensities.length > 0) {
			result = result.filter((drill) => selectedIntensities.includes(drill.intensity));
		}

		// Duration filter
		if (isDurationFilterActive) {
			result = result.filter((drill) => {
				if (!drill.duration) return false;
				// If max is at DURATION_MAX, include all drills >= min (no upper bound)
				if (durationRange[1] >= DURATION_MAX) {
					return drill.duration >= durationRange[0];
				}
				return drill.duration >= durationRange[0] && drill.duration <= durationRange[1];
			});
		}

		// Skills filter
		if (selectedSkills.length > 0) {
			result = result.filter((drill) => selectedSkills.some((skill) => drill.skills.includes(skill)));
		}

		return result;
	}, [drills, selectedCategories, selectedIntensities, durationRange, isDurationFilterActive, selectedSkills, quickFilters, user?.id]);

	// Calculate active filter count
	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (selectedCategories.length > 0) count += selectedCategories.length;
		if (selectedIntensities.length > 0) count += selectedIntensities.length;
		if (isDurationFilterActive) count += 1;
		if (selectedSkills.length > 0) count += selectedSkills.length;
		count += quickFilters.length;
		return count;
	}, [selectedCategories, selectedIntensities, isDurationFilterActive, selectedSkills, quickFilters]);

	// Toggle functions
	const toggleCategory = (category: DrillCategory) => {
		setSelectedCategories((prev) => (prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]));
	};

	const toggleIntensity = (intensity: DrillIntensity) => {
		setSelectedIntensities((prev) => (prev.includes(intensity) ? prev.filter((i) => i !== intensity) : [...prev, intensity]));
	};

	const toggleSkill = (skill: DrillSkill) => {
		setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
	};

	const clearAllFilters = () => {
		setSelectedCategories([]);
		setSelectedIntensities([]);
		setDurationRange([DURATION_MIN, DURATION_MAX]);
		setSelectedSkills([]);
		setQuickFilters([]);
	};

	const hasActiveFilters = activeFilterCount > 0;
	const [showFilters, setShowFilters] = useState(false);

	// Count of detailed filters (excluding quick filters)
	const detailedFilterCount = selectedCategories.length + selectedIntensities.length + selectedSkills.length + (isDurationFilterActive ? 1 : 0);

	return (
		<div className="flex flex-col gap-2">
			{/* Search + Filter Toggle */}
			<div className="flex items-center gap-2">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
					<Input
						placeholder="Search drills..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9 h-9"
						data-search-input
						aria-label="Search drills"
					/>
				</div>
				<button
					onClick={() => setShowFilters(!showFilters)}
					className={cn(
						"flex items-center gap-1.5 px-3 h-9 rounded-lg border text-xs font-medium transition-all",
						showFilters || detailedFilterCount > 0
							? "bg-accent/10 border-accent/30 text-accent"
							: "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20",
					)}>
					<SlidersHorizontal size={14} />
					{detailedFilterCount > 0 && (
						<span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-accent text-[10px] text-white font-bold">
							{detailedFilterCount}
						</span>
					)}
				</button>
			</div>

			{/* Quick Filters - Always visible, compact */}
			<div className="flex items-center gap-1.5 overflow-x-auto">
				<button
					onClick={() => toggleQuickFilter("liked")}
					className={cn(
						"flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium transition-all shrink-0",
						quickFilters.includes("liked")
							? "bg-rose-500/10 border-rose-500/30 text-rose-400"
							: "border-border text-muted-foreground hover:text-foreground hover:bg-foreground/5",
					)}>
					<Heart size={11} className={quickFilters.includes("liked") ? "fill-current" : ""} />
					Liked
				</button>
				<button
					onClick={() => toggleQuickFilter("saved")}
					className={cn(
						"flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium transition-all shrink-0",
						quickFilters.includes("saved")
							? "bg-amber-500/10 border-amber-500/30 text-amber-400"
							: "border-border text-muted-foreground hover:text-foreground hover:bg-foreground/5",
					)}>
					<Bookmark size={11} className={quickFilters.includes("saved") ? "fill-current" : ""} />
					Saved
				</button>
				<button
					onClick={() => toggleQuickFilter("mine")}
					className={cn(
						"flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium transition-all shrink-0",
						quickFilters.includes("mine")
							? "bg-accent/10 border-accent/30 text-accent"
							: "border-border text-muted-foreground hover:text-foreground hover:bg-foreground/5",
					)}>
					<User size={11} />
					Mine
				</button>

				{/* Active filter tags inline */}
				{hasActiveFilters && (
					<>
						<div className="w-px h-4 bg-border mx-1" />
						{selectedCategories.map((cat) => (
							<FilterTag key={cat} label={cat} color={CATEGORY_COLORS[cat]} onRemove={() => toggleCategory(cat)} />
						))}
						{selectedIntensities.map((int) => (
							<FilterTag key={int} label={int} color={INTENSITY_COLORS[int]} onRemove={() => toggleIntensity(int)} />
						))}
						{isDurationFilterActive && (
							<FilterTag
								label={durationRange[1] >= DURATION_MAX ? `${durationRange[0]}m+` : `${durationRange[0]}-${durationRange[1]}m`}
								onRemove={() => setDurationRange([DURATION_MIN, DURATION_MAX])}
							/>
						)}
						{selectedSkills.map((skill) => (
							<FilterTag key={skill} label={skill} onRemove={() => toggleSkill(skill)} />
						))}
						{detailedFilterCount > 0 && (
							<button onClick={clearAllFilters} className="text-[10px] text-muted-foreground hover:text-accent transition-colors shrink-0">
								Clear
							</button>
						)}
					</>
				)}
			</div>

			{/* Collapsible Detailed Filters */}
			{showFilters && (
				<Card className="p-3 space-y-3 animate-in slide-in-from-top-2 duration-200">
					{/* Category */}
					<div className="space-y-1.5">
						<span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">Category</span>
						<div className="flex flex-wrap gap-1">
							{CATEGORIES.map((cat) => (
								<button
									key={cat}
									onClick={() => toggleCategory(cat)}
									className={cn(
										"inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium border transition-all",
										selectedCategories.includes(cat)
											? "border-foreground/40 text-foreground"
											: "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-foreground/5",
									)}
									style={
										selectedCategories.includes(cat)
											? {
													backgroundColor: `${CATEGORY_COLORS[cat]}12`,
													borderColor: `${CATEGORY_COLORS[cat]}50`,
													color: CATEGORY_COLORS[cat],
												}
											: {}
									}>
									<span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
									{cat}
								</button>
							))}
						</div>
					</div>

					{/* Intensity + Duration row */}
					<div className="flex gap-4">
						<div className="space-y-1.5">
							<span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">Level</span>
							<div className="flex gap-1">
								{INTENSITIES.map((int) => (
									<button
										key={int}
										onClick={() => toggleIntensity(int)}
										className={cn(
											"px-2 py-1 rounded-md text-[11px] font-medium border transition-all",
											selectedIntensities.includes(int)
												? "border-foreground/40 text-foreground"
												: "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-foreground/5",
										)}
										style={
											selectedIntensities.includes(int)
												? {
														backgroundColor: `${INTENSITY_COLORS[int]}12`,
														borderColor: `${INTENSITY_COLORS[int]}50`,
														color: INTENSITY_COLORS[int],
													}
												: {}
										}>
										{int}
									</button>
								))}
							</div>
						</div>

						<div className="flex-1 space-y-1.5">
							<span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">Duration</span>
							<Slider
								rangeValue={durationRange}
								onRangeChange={setDurationRange}
								min={DURATION_MIN}
								max={DURATION_MAX}
								step={1}
								size="sm"
								color="accent"
								formatValue={(v) => (v >= DURATION_MAX ? `${v}m+` : `${v}m`)}
							/>
						</div>
					</div>

					{/* Skills */}
					<div className="space-y-1.5">
						<span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest">Skills</span>
						<div className="flex flex-wrap gap-1">
							{SKILLS.map((skill) => (
								<button
									key={skill}
									onClick={() => toggleSkill(skill)}
									className={cn(
										"px-2 py-1 rounded-md text-[11px] font-medium border transition-all",
										selectedSkills.includes(skill)
											? "bg-accent/15 border-accent/40 text-accent"
											: "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-foreground/5",
									)}>
									{skill}
								</button>
							))}
						</div>
					</div>
				</Card>
			)}

			{/* Drill List */}
			<Card className="flex flex-col overflow-hidden flex-1" style={{ maxHeight: "600px" }}>
				<div className="px-4 border-b border-border flex items-center justify-between">
					<h3 className="font-bold text-foreground text-base flex items-baseline gap-2">
						Drill Library
						<span className="text-sm font-normal text-muted-foreground">{isLoading ? "..." : filteredDrills.length}</span>
					</h3>
					{/* Sort Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground border border-border hover:border-border-strong hover:text-foreground hover:bg-surface-hover transition-all">
								<ArrowUpDown size={12} />
								<span>{SORT_OPTIONS.find((opt) => opt.value === sortBy)?.label}</span>
								<ChevronDown size={10} />
							</button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							{SORT_OPTIONS.slice(0, 4).map((option) => (
								<DropdownMenuItem
									key={option.value}
									onClick={() => setSortBy(option.value)}
									className={cn(sortBy === option.value && "text-accent")}>
									{option.label}
									{sortBy === option.value && <span className="ml-auto">✓</span>}
								</DropdownMenuItem>
							))}
							<DropdownMenuSeparator />
							{SORT_OPTIONS.slice(4).map((option) => (
								<DropdownMenuItem
									key={option.value}
									onClick={() => setSortBy(option.value)}
									className={cn(sortBy === option.value && "text-accent")}>
									<div className="flex items-center gap-1.5">
										{option.value === "likes" && <Heart size={11} />}
										{option.value === "bookmarks" && <Bookmark size={11} />}
										{option.value === "recent" && <Clock size={11} />}
										<span>{option.label}</span>
									</div>
									{sortBy === option.value && <span className="ml-auto">✓</span>}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Scrollable drill list */}
				<div className="flex-1 overflow-y-auto p-2 space-y-1.5">
					{isLoading ? (
						<div className="space-y-1.5">
							{[1, 2, 3, 4, 5].map((i) => (
								<DrillCardSkeleton key={i} />
							))}
						</div>
					) : filteredDrills.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 text-center">
							<div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mb-3">
								<Search size={20} className="text-muted-foreground/50" />
							</div>
							<p className="text-sm font-medium text-foreground/80 mb-1">No drills found</p>
							<p className="text-xs text-muted-foreground/70 max-w-[240px]">Try adjusting your filters or search terms</p>
							{hasActiveFilters && (
								<button onClick={clearAllFilters} className="mt-3 text-xs text-accent hover:underline">
									Clear all filters
								</button>
							)}
						</div>
					) : (
						filteredDrills.map((drill) => <DrillListItem key={drill.id} drill={drill} onAdd={onAddDrill} onViewDetails={onViewDetails} />)
					)}
				</div>
			</Card>
		</div>
	);
}

// =============================================================================
// DRILL LIST ITEM
// =============================================================================

interface DrillListItemProps {
	drill: Drill;
	onAdd: (drill: Drill) => void;
	onViewDetails: (drill: Drill) => void;
}

function DrillListItem({ drill, onAdd, onViewDetails }: DrillListItemProps) {
	const categoryColor = CATEGORY_COLORS[drill.category];
	const intensityColor = INTENSITY_COLORS[drill.intensity];

	const handleDragStart = (e: React.DragEvent) => {
		e.dataTransfer.setData("application/json", JSON.stringify(drill));
		e.dataTransfer.effectAllowed = "copy";
	};

	return (
		<div
			role="button"
			tabIndex={0}
			draggable
			onDragStart={handleDragStart}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onAdd(drill);
				}
			}}
			className="group relative rounded-lg bg-surface border border-border hover:border-border-strong hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
			onClick={() => onAdd(drill)}>
			{/* Category color bar on left edge */}
			<div
				className="absolute left-0 top-0 bottom-0 w-1.5 opacity-90"
				style={{
					background: `linear-gradient(to right, ${categoryColor}, ${categoryColor}00)`,
				}}
			/>

			<div className="pl-4 pr-2 py-3">
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1 min-w-0">
						<h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">{drill.name}</h4>
						<div className="flex items-center justify-between gap-2 mt-1.5">
							<div className="flex flex-wrap items-center gap-1.5">
								{/* Duration badge - neutral styling */}
								{drill.duration && (
									<Badge variant="secondary" size="sm" className="text-[10px] font-semibold bg-foreground/8 text-foreground/90">
										<Clock size={10} className="mr-1 opacity-60" />
										{drill.duration}m
									</Badge>
								)}
								{/* Category badge - colored, no border */}
								<Badge
									variant="secondary"
									size="sm"
									className="text-[10px] font-medium shadow-sm"
									style={{
										backgroundColor: `${categoryColor}18`,
										color: categoryColor,
									}}>
									{drill.category}
								</Badge>
								{/* Intensity badge - colored with border for distinction */}
								<Badge
									variant="secondary"
									size="sm"
									className="text-[10px] font-medium border"
									style={{
										backgroundColor: `${intensityColor}10`,
										borderColor: `${intensityColor}30`,
										color: intensityColor,
									}}>
									{drill.intensity}
								</Badge>
							</div>

							{/* Like count - more prominent */}
							{drill.likeCount > 0 && (
								<div className="flex items-center gap-1 text-[11px] text-muted-foreground/80">
									<Heart size={11} className="fill-rose-500/20 text-rose-500/60" />
									<span className="font-medium">{drill.likeCount}</span>
								</div>
							)}
						</div>
					</div>

					{/* Eye button - always rendered, opacity transition */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							onViewDetails(drill);
						}}
						className="flex-shrink-0 w-7 h-7 rounded-md bg-surface/50 flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-white transition-all opacity-0 group-hover:opacity-100"
						aria-label={`View details for ${drill.name}`}>
						<Eye size={14} />
					</button>
				</div>
			</div>
		</div>
	);
}
