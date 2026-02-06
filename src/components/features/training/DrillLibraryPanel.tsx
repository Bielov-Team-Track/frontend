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
} from "lucide-react";
import { Input, Badge, Card, CollapsibleSection, Button } from "@/components";
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
	DrillCategoryEnum,
	DrillIntensityEnum,
	DrillSkillEnum,
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

// Category colors (from design system)
const CATEGORY_COLORS: Record<DrillCategory, string> = {
	Warmup: "#29757A",
	Technical: "#2E5A88",
	Tactical: "#FF7D00",
	Game: "#D99100",
	Conditioning: "#BE3F23",
	Cooldown: "#4A7A45",
};

// Intensity colors (from design system)
const INTENSITY_COLORS: Record<DrillIntensity, string> = {
	Low: "#4A7A45",
	Medium: "#D99100",
	High: "#BE3F23",
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
// COMPONENT
// =============================================================================

export default function DrillLibraryPanel({
	onAddDrill,
	onViewDetails,
}: DrillLibraryPanelProps) {
	// Filter state
	const [search, setSearch] = useState("");
	const [selectedCategories, setSelectedCategories] = useState<DrillCategory[]>([]);
	const [selectedIntensities, setSelectedIntensities] = useState<DrillIntensity[]>([]);
	const [selectedDuration, setSelectedDuration] = useState<DurationFilter>("all");
	const [selectedSkills, setSelectedSkills] = useState<DrillSkill[]>([]);
	const [sortBy, setSortBy] = useState<SortBy>("name");
	const [filtersOpen, setFiltersOpen] = useState(false);

	// Build API filter request
	const apiFilters = useMemo<DrillFilterRequest>(() => {
		const filters: DrillFilterRequest = {};

		if (search.trim()) {
			filters.searchTerm = search.trim();
		}

		// Note: API supports single category/intensity/skill, but we'll filter client-side for multi-select

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
	}, [drills, selectedCategories, selectedIntensities, selectedDuration, selectedSkills]);

	// Calculate active filter count
	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (selectedCategories.length > 0) count += selectedCategories.length;
		if (selectedIntensities.length > 0) count += selectedIntensities.length;
		if (selectedDuration !== "all") count += 1;
		if (selectedSkills.length > 0) count += selectedSkills.length;
		return count;
	}, [selectedCategories, selectedIntensities, selectedDuration, selectedSkills]);

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
	};

	const hasActiveFilters = activeFilterCount > 0;

	return (
		<div className="space-y-4">
			{/* Search + Filters */}
			<Card className="p-4">
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
					<button
						onClick={() => setFiltersOpen(!filtersOpen)}
						className={cn(
							"flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all flex-shrink-0",
							"focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
							filtersOpen
								? "bg-foreground/5 text-foreground border-foreground/30"
								: "text-muted-foreground border-border hover:text-foreground hover:border-foreground/20"
						)}
						aria-label="Toggle filters"
						aria-expanded={filtersOpen}
					>
						<ChevronDown
							size={12}
							className={cn(
								"transition-transform",
								filtersOpen && "rotate-180"
							)}
						/>
						<span>Filters</span>
						{activeFilterCount > 0 && (
							<span className="flex items-center justify-center w-4 h-4 rounded-full bg-accent text-white text-[9px] font-bold">
								{activeFilterCount}
							</span>
						)}
					</button>
				</div>

				{/* Collapsible Filter Panel */}
				{filtersOpen && (
					<div className="mt-3 pt-3 border-t border-border space-y-2.5">
						{/* Category */}
						<div className="flex items-start gap-2">
							<span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider w-14 flex-shrink-0 pt-1.5">
								Cat.
							</span>
							<div className="flex flex-wrap gap-1">
								{CATEGORIES.map((cat) => (
									<button
										key={cat}
										onClick={() => toggleCategory(cat)}
										className={cn(
											"inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border transition-all",
											"focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
											selectedCategories.includes(cat)
												? "border-foreground/40 text-foreground"
												: "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
										)}
										style={
											selectedCategories.includes(cat)
												? {
														backgroundColor: `${CATEGORY_COLORS[cat]}15`,
														borderColor: `${CATEGORY_COLORS[cat]}40`,
														color: CATEGORY_COLORS[cat],
												  }
												: {}
										}
										aria-label={`Filter by ${cat} category`}
										aria-pressed={selectedCategories.includes(cat)}
									>
										<span
											className="w-2 h-2 rounded-full"
											style={{ backgroundColor: CATEGORY_COLORS[cat] }}
										/>
										{cat}
									</button>
								))}
							</div>
						</div>

						{/* Intensity */}
						<div className="flex items-start gap-2">
							<span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider w-14 flex-shrink-0 pt-1.5">
								Level
							</span>
							<div className="flex gap-1">
								{INTENSITIES.map((int) => (
									<button
										key={int}
										onClick={() => toggleIntensity(int)}
										className={cn(
											"px-2 py-1 rounded text-xs font-medium border transition-all",
											"focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
											selectedIntensities.includes(int)
												? "border-foreground/40 text-foreground"
												: "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
										)}
										style={
											selectedIntensities.includes(int)
												? {
														backgroundColor: `${INTENSITY_COLORS[int]}15`,
														borderColor: `${INTENSITY_COLORS[int]}40`,
														color: INTENSITY_COLORS[int],
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
							<span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider w-14 flex-shrink-0 pt-1.5">
								Time
							</span>
							<div className="flex gap-1">
								{DURATION_FILTERS.map((dur) => (
									<button
										key={dur.value}
										onClick={() =>
											setSelectedDuration(
												selectedDuration === dur.value ? "all" : dur.value
											)
										}
										className={cn(
											"px-2 py-1 rounded text-xs font-medium border transition-all",
											selectedDuration === dur.value
												? "bg-foreground/5 border-foreground/40 text-foreground"
												: "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
										)}
									>
										{dur.label}
									</button>
								))}
							</div>
						</div>

						{/* Skills */}
						<div className="flex items-start gap-2">
							<span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider w-14 flex-shrink-0 pt-1.5">
								Skills
							</span>
							<div className="flex flex-wrap gap-1">
								{SKILLS.map((skill) => (
									<button
										key={skill}
										onClick={() => toggleSkill(skill)}
										className={cn(
											"px-2 py-1 rounded text-xs font-medium border transition-all",
											selectedSkills.includes(skill)
												? "bg-foreground/5 border-foreground/40 text-foreground"
												: "border-border text-muted-foreground hover:border-foreground/20 hover:text-foreground"
										)}
									>
										{skill}
									</button>
								))}
							</div>
						</div>

						{/* Clear all */}
						{hasActiveFilters && (
							<div className="flex justify-end">
								<button
									onClick={clearAllFilters}
									className="text-xs text-muted-foreground hover:text-accent transition-colors"
								>
									Clear all filters
								</button>
							</div>
						)}
					</div>
				)}
			</Card>

			{/* Drill List */}
			<Card className="flex flex-col overflow-hidden" style={{ maxHeight: "550px" }}>
				<div className="px-4 py-3 border-b border-border flex items-center justify-between">
					<div>
						<h3 className="font-bold text-foreground text-sm">Drill Library</h3>
						<p className="text-xs text-muted-foreground mt-0.5">
							{isLoading ? "Loading..." : `${filteredDrills.length} drills`}
						</p>
					</div>
					{/* Sort Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-muted-foreground border border-border hover:border-border-strong hover:text-foreground transition-all">
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
				<div className="flex-1 overflow-y-auto p-3 space-y-2">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
						</div>
					) : filteredDrills.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-12 text-center">
							<p className="text-sm text-muted-foreground">No drills found</p>
							{hasActiveFilters && (
								<button
									onClick={clearAllFilters}
									className="mt-2 text-xs text-accent hover:underline"
								>
									Clear filters
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
	const [isHovered, setIsHovered] = useState(false);

	const categoryColor = CATEGORY_COLORS[drill.category];
	const intensityColor = INTENSITY_COLORS[drill.intensity];

	return (
		<div
			className="group relative rounded-lg bg-surface border border-border hover:border-border-strong transition-all cursor-pointer overflow-hidden"
			onClick={() => onAdd(drill)}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		>
			{/* Category color bar on left edge */}
			<div
				className="absolute left-0 top-0 bottom-0 w-1"
				style={{ backgroundColor: categoryColor }}
			/>

			<div className="pl-3 pr-2 py-2.5">
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1 min-w-0">
						<h4 className="font-semibold text-sm text-foreground truncate">
							{drill.name}
						</h4>
						<div className="flex flex-wrap items-center gap-1.5 mt-1">
							{/* Duration badge */}
							{drill.duration && (
								<Badge
									variant="secondary"
									size="sm"
									className="text-[10px] font-medium"
								>
									<Clock size={9} className="mr-1" />
									{drill.duration}m
								</Badge>
							)}
							{/* Category badge */}
							<Badge
								variant="secondary"
								size="sm"
								className="text-[10px] font-medium"
								style={{
									backgroundColor: `${categoryColor}15`,
									color: categoryColor,
								}}
							>
								{drill.category}
							</Badge>
							{/* Intensity badge */}
							<Badge
								variant="secondary"
								size="sm"
								className="text-[10px] font-medium"
								style={{
									backgroundColor: `${intensityColor}15`,
									color: intensityColor,
								}}
							>
								{drill.intensity}
							</Badge>
						</div>
						{/* Like count (if any) */}
						{drill.likeCount > 0 && (
							<div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
								<Heart size={9} className="fill-current" />
								<span>{drill.likeCount}</span>
							</div>
						)}
					</div>

					{/* Eye button for details (on hover) */}
					{isHovered && (
						<button
							onClick={(e) => {
								e.stopPropagation();
								onViewDetails(drill);
							}}
							className="flex-shrink-0 w-6 h-6 rounded-full bg-subtle flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-white transition-all"
						>
							<Eye size={12} />
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
