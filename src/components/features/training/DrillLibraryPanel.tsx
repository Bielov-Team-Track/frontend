"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
	Search,
	ChevronDown,
	X,
	ArrowUpDown,
	Heart,
	Bookmark,
	Clock,
	Eye,
	User,
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { Input, Badge, Card, Button } from "@/components";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { loadDrills } from "@/lib/api/drills";
import {
	Drill,
	DrillCategory,
	DrillIntensity,
	DrillSkill,
	DrillFilterRequest,
} from "@/lib/models/Drill";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

interface DrillLibraryPanelProps {
	onAddDrill: (drill: Drill) => void;
	onViewDetails: (drill: Drill) => void;
}

type SortBy = "name" | "duration" | "intensity" | "category" | "likes" | "bookmarks" | "recent";

type DurationFilter = "all" | "0-5" | "5-10" | "10-15" | "15+";

type QuickFilter = "liked" | "saved" | "mine";

// =============================================================================
// CONSTANTS
// =============================================================================

const CATEGORIES: DrillCategory[] = ["Warmup", "Technical", "Tactical", "Game", "Conditioning", "Cooldown"];
const INTENSITIES: DrillIntensity[] = ["Low", "Medium", "High"];
const SKILLS: DrillSkill[] = ["Serving", "Passing", "Setting", "Attacking", "Blocking", "Defense", "Conditioning", "Footwork"];
const DURATION_FILTERS: { value: DurationFilter; label: string }[] = [
	{ value: "0-5", label: "≤5m" },
	{ value: "5-10", label: "5-10m" },
	{ value: "10-15", label: "10-15m" },
	{ value: "15+", label: "15m+" },
];

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
			style={color ? { backgroundColor: `${color}15`, borderColor: `${color}30`, color } : undefined}
		>
			{label}
			<button
				onClick={(e) => {
					e.stopPropagation();
					onRemove();
				}}
				className="hover:text-foreground transition-colors"
				aria-label={`Remove ${label} filter`}
			>
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

export default function DrillLibraryPanel({
	onAddDrill,
	onViewDetails,
}: DrillLibraryPanelProps) {
	const { user } = useAuth();

	// Filter state
	const [search, setSearch] = useState("");
	const [selectedCategories, setSelectedCategories] = useState<DrillCategory[]>([]);
	const [selectedIntensities, setSelectedIntensities] = useState<DrillIntensity[]>([]);
	const [selectedDuration, setSelectedDuration] = useState<DurationFilter>("all");
	const [selectedSkills, setSelectedSkills] = useState<DrillSkill[]>([]);
	const [sortBy, setSortBy] = useState<SortBy>("name");
	const [quickFilters, setQuickFilters] = useState<QuickFilter[]>([]);

	// Toggle quick filter
	const toggleQuickFilter = (filter: QuickFilter) => {
		setQuickFilters((prev) =>
			prev.includes(filter)
				? prev.filter((f) => f !== filter)
				: [...prev, filter]
		);
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
		if (selectedDuration !== "all" && selectedDuration) {
			result = result.filter((drill) => {
				if (!drill.duration) return false;
				if (selectedDuration === "0-5") return drill.duration <= 5;
				if (selectedDuration === "5-10") return drill.duration > 5 && drill.duration <= 10;
				if (selectedDuration === "10-15") return drill.duration > 10 && drill.duration <= 15;
				if (selectedDuration === "15+") return drill.duration > 15;
				return true;
			});
		}

		// Skills filter
		if (selectedSkills.length > 0) {
			result = result.filter((drill) =>
				selectedSkills.some((skill) => drill.skills.includes(skill))
			);
		}

		return result;
	}, [drills, selectedCategories, selectedIntensities, selectedDuration, selectedSkills, quickFilters, user?.id]);

	// Calculate active filter count
	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (selectedCategories.length > 0) count += selectedCategories.length;
		if (selectedIntensities.length > 0) count += selectedIntensities.length;
		if (selectedDuration !== "all") count += 1;
		if (selectedSkills.length > 0) count += selectedSkills.length;
		count += quickFilters.length;
		return count;
	}, [selectedCategories, selectedIntensities, selectedDuration, selectedSkills, quickFilters]);

	// Toggle functions
	const toggleCategory = (category: DrillCategory) => {
		setSelectedCategories((prev) =>
			prev.includes(category)
				? prev.filter((c) => c !== category)
				: [...prev, category]
		);
	};

	const toggleIntensity = (intensity: DrillIntensity) => {
		setSelectedIntensities((prev) =>
			prev.includes(intensity)
				? prev.filter((i) => i !== intensity)
				: [...prev, intensity]
		);
	};

	const toggleSkill = (skill: DrillSkill) => {
		setSelectedSkills((prev) =>
			prev.includes(skill)
				? prev.filter((s) => s !== skill)
				: [...prev, skill]
		);
	};

	const clearAllFilters = () => {
		setSelectedCategories([]);
		setSelectedIntensities([]);
		setSelectedDuration("all");
		setSelectedSkills([]);
		setQuickFilters([]);
	};

	const hasActiveFilters = activeFilterCount > 0;

	return (
		<div className="space-y-3">
			{/* Search + Quick Filters */}
			<Card className="p-3 space-y-3">
				{/* Search Row */}
				<div className="flex items-center gap-2">
					<div className="relative flex-1">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
						<Input
							placeholder="Search drills..."
							value={search}
							onChange={(e) => setSearch(e.target.value)}
							className="pl-9 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
							data-search-input
							aria-label="Search drills"
						/>
					</div>
				</div>

				{/* Quick Filters Row */}
				<div className="flex items-center gap-1.5">
					<button
						onClick={() => toggleQuickFilter("liked")}
						className={cn(
							"flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all",
							"focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
							quickFilters.includes("liked")
								? "bg-rose-500/10 border-rose-500/30 text-rose-400"
								: "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 hover:bg-foreground/5"
						)}
						aria-label="Show liked drills"
						aria-pressed={quickFilters.includes("liked")}
					>
						<Heart size={12} className={quickFilters.includes("liked") ? "fill-current" : ""} />
						Liked
					</button>
					<button
						onClick={() => toggleQuickFilter("saved")}
						className={cn(
							"flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all",
							"focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
							quickFilters.includes("saved")
								? "bg-amber-500/10 border-amber-500/30 text-amber-400"
								: "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 hover:bg-foreground/5"
						)}
						aria-label="Show saved drills"
						aria-pressed={quickFilters.includes("saved")}
					>
						<Bookmark size={12} className={quickFilters.includes("saved") ? "fill-current" : ""} />
						Saved
					</button>
					<button
						onClick={() => toggleQuickFilter("mine")}
						className={cn(
							"flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all",
							"focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
							quickFilters.includes("mine")
								? "bg-primary/10 border-primary/30 text-primary"
								: "border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 hover:bg-foreground/5"
						)}
						aria-label="Show my drills"
						aria-pressed={quickFilters.includes("mine")}
					>
						<User size={12} />
						My Drills
					</button>
				</div>

				{/* Filter Sections - Always Visible */}
				<div className="pt-3 border-t border-border/50 space-y-3">
					{/* Category */}
					<div className="flex items-start gap-2">
						<span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest w-14 flex-shrink-0 pt-1.5">
							Cat.
						</span>
						<div className="flex flex-wrap gap-1.5">
							{CATEGORIES.map((cat) => (
								<button
									key={cat}
									onClick={() => toggleCategory(cat)}
									className={cn(
										"inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all",
										"focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
										"hover:scale-[1.02]",
										selectedCategories.includes(cat)
											? "border-foreground/40 text-foreground"
											: "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-foreground/5"
									)}
									style={
										selectedCategories.includes(cat)
											? {
													backgroundColor: `${CATEGORY_COLORS[cat]}12`,
													borderColor: `${CATEGORY_COLORS[cat]}50`,
													color: CATEGORY_COLORS[cat],
													boxShadow: `0 0 0 2px ${CATEGORY_COLORS[cat]}08`,
											  }
											: {}
									}
									aria-label={`Filter by ${cat} category`}
									aria-pressed={selectedCategories.includes(cat)}
								>
									<span
										className="w-2.5 h-2.5 rounded-full shadow-sm"
										style={{
											backgroundColor: CATEGORY_COLORS[cat],
											boxShadow: `0 0 4px ${CATEGORY_COLORS[cat]}40`
										}}
									/>
									{cat}
								</button>
							))}
						</div>
					</div>

					{/* Intensity */}
					<div className="flex items-start gap-2">
						<span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest w-14 flex-shrink-0 pt-1.5">
							Level
						</span>
						<div className="flex gap-1.5">
							{INTENSITIES.map((int) => (
								<button
									key={int}
									onClick={() => toggleIntensity(int)}
									className={cn(
										"px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all",
										"focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
										"hover:scale-[1.02]",
										selectedIntensities.includes(int)
											? "border-foreground/40 text-foreground"
											: "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-foreground/5"
									)}
									style={
										selectedIntensities.includes(int)
											? {
													backgroundColor: `${INTENSITY_COLORS[int]}12`,
													borderColor: `${INTENSITY_COLORS[int]}50`,
													color: INTENSITY_COLORS[int],
													boxShadow: `0 0 0 2px ${INTENSITY_COLORS[int]}08`,
											  }
											: {}
									}
									aria-label={`Filter by ${int} intensity`}
									aria-pressed={selectedIntensities.includes(int)}
								>
									{int}
								</button>
							))}
						</div>
					</div>

					{/* Duration */}
					<div className="flex items-start gap-2">
						<span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest w-14 flex-shrink-0 pt-1.5">
							Time
						</span>
						<div className="flex gap-1.5">
							{DURATION_FILTERS.map((dur) => (
								<button
									key={dur.value}
									onClick={() =>
										setSelectedDuration(
											selectedDuration === dur.value ? "all" : dur.value
										)
									}
									className={cn(
										"px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all",
										"hover:scale-[1.02]",
										selectedDuration === dur.value
											? "bg-accent/15 border-accent/40 text-accent"
											: "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-foreground/5"
									)}
								>
									{dur.label}
								</button>
							))}
						</div>
					</div>

					{/* Skills */}
					<div className="flex items-start gap-2">
						<span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest w-14 flex-shrink-0 pt-1.5">
							Skills
						</span>
						<div className="flex flex-wrap gap-1.5">
							{SKILLS.map((skill) => (
								<button
									key={skill}
									onClick={() => toggleSkill(skill)}
									className={cn(
										"px-2.5 py-1.5 rounded-md text-xs font-medium border transition-all",
										"hover:scale-[1.02]",
										selectedSkills.includes(skill)
											? "bg-accent/15 border-accent/40 text-accent"
											: "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground hover:bg-foreground/5"
									)}
								>
									{skill}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Active Filter Tags */}
				{hasActiveFilters && (
					<div className="flex items-center gap-2 pt-2 border-t border-border/30 overflow-x-auto scrollbar-thin">
						<span className="text-[10px] text-muted-foreground/70 shrink-0">Active:</span>
						<div className="flex items-center gap-1.5 flex-wrap">
							{quickFilters.includes("liked") && (
								<FilterTag label="Liked" onRemove={() => toggleQuickFilter("liked")} />
							)}
							{quickFilters.includes("saved") && (
								<FilterTag label="Saved" onRemove={() => toggleQuickFilter("saved")} />
							)}
							{quickFilters.includes("mine") && (
								<FilterTag label="My Drills" onRemove={() => toggleQuickFilter("mine")} />
							)}
							{selectedCategories.map((cat) => (
								<FilterTag
									key={cat}
									label={cat}
									color={CATEGORY_COLORS[cat]}
									onRemove={() => toggleCategory(cat)}
								/>
							))}
							{selectedIntensities.map((int) => (
								<FilterTag
									key={int}
									label={int}
									color={INTENSITY_COLORS[int]}
									onRemove={() => toggleIntensity(int)}
								/>
							))}
							{selectedDuration !== "all" && (
								<FilterTag
									label={DURATION_FILTERS.find(d => d.value === selectedDuration)?.label || selectedDuration}
									onRemove={() => setSelectedDuration("all")}
								/>
							)}
							{selectedSkills.map((skill) => (
								<FilterTag
									key={skill}
									label={skill}
									onRemove={() => toggleSkill(skill)}
								/>
							))}
						</div>
						<button
							onClick={clearAllFilters}
							className="text-[10px] text-muted-foreground hover:text-accent transition-colors shrink-0 ml-auto"
						>
							Clear all
						</button>
					</div>
				)}
			</Card>

			{/* Drill List */}
			<Card className="flex flex-col overflow-hidden" style={{ maxHeight: "480px" }}>
				<div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
					<h3 className="font-bold text-foreground text-base flex items-baseline gap-2">
						Drill Library
						<span className="text-sm font-normal text-muted-foreground">
							{isLoading ? "..." : filteredDrills.length}
						</span>
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
									className={cn(
										sortBy === option.value && "text-accent"
									)}
								>
									{option.label}
									{sortBy === option.value && <span className="ml-auto">✓</span>}
								</DropdownMenuItem>
							))}
							<DropdownMenuSeparator />
							{SORT_OPTIONS.slice(4).map((option) => (
								<DropdownMenuItem
									key={option.value}
									onClick={() => setSortBy(option.value)}
									className={cn(
										sortBy === option.value && "text-accent"
									)}
								>
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
							<p className="text-xs text-muted-foreground/70 max-w-[240px]">
								Try adjusting your filters or search terms
							</p>
							{hasActiveFilters && (
								<button
									onClick={clearAllFilters}
									className="mt-3 text-xs text-accent hover:underline"
								>
									Clear all filters
								</button>
							)}
						</div>
					) : (
						filteredDrills.map((drill) => (
							<DrillListItem
								key={drill.id}
								drill={drill}
								onAdd={onAddDrill}
								onViewDetails={onViewDetails}
							/>
						))
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
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					onAdd(drill);
				}
			}}
			className="group relative rounded-lg bg-surface border border-border hover:border-border-strong hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer overflow-hidden"
			onClick={() => onAdd(drill)}
		>
			{/* Category color bar on left edge */}
			<div
				className="absolute left-0 top-0 bottom-0 w-1.5 opacity-90"
				style={{
					background: `linear-gradient(to right, ${categoryColor}, ${categoryColor}00)`
				}}
			/>

			<div className="pl-4 pr-2 py-3">
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1 min-w-0">
						<h4 className="font-semibold text-sm text-foreground line-clamp-2 leading-tight">
							{drill.name}
						</h4>
						<div className="flex items-center justify-between gap-2 mt-1.5">
							<div className="flex flex-wrap items-center gap-1.5">
								{/* Duration badge - neutral styling */}
								{drill.duration && (
									<Badge
										variant="secondary"
										size="sm"
										className="text-[10px] font-semibold bg-foreground/8 text-foreground/90"
									>
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
									}}
								>
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
									}}
								>
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
						aria-label={`View details for ${drill.name}`}
					>
						<Eye size={14} />
					</button>
				</div>
			</div>
		</div>
	);
}
