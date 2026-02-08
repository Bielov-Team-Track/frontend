"use client";

import { Button } from "@/components";
import {
	CreateDrillModal,
	DrillCard,
	DrillFilters,
	SORT_OPTIONS,
	type AuthorOption,
	type ClubOption,
	type DrillSortBy,
	type DrillSortOrder,
} from "@/components/features/drills";
import { EmptyState, Loader } from "@/components/ui";
import { useBookmarkDrill, useDrills, useLikeDrill, useUnbookmarkDrill, useUnlikeDrill } from "@/hooks/useDrills";
import type { DrillCategory, DrillIntensity, DrillSkill } from "@/lib/models/Drill";
import { cn } from "@/lib/utils";
import { BookOpen, ChevronDown, Plus } from "lucide-react";
import { useMemo, useState } from "react";

// Constants for filter ranges
const DURATION_MIN = 0;
const DURATION_MAX = 120;
const PLAYERS_MIN = 1;
const PLAYERS_MAX = 24;

export default function DrillsPage() {
	// Fetch drills
	const { data: drills = [], isLoading, error } = useDrills({ limit: 200 });

	// Debug logging
	console.log("[DrillsPage] isLoading:", isLoading, "error:", error, "drills count:", drills.length);

	// Like/Unlike mutations
	const likeMutation = useLikeDrill();
	const unlikeMutation = useUnlikeDrill();
	const bookmarkMutation = useBookmarkDrill();
	const unbookmarkMutation = useUnbookmarkDrill();

	// Modal state
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

	// Filter state
	const [search, setSearch] = useState("");
	const [selectedSkills, setSelectedSkills] = useState<DrillSkill[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<DrillCategory[]>([]);
	const [selectedIntensities, setSelectedIntensities] = useState<DrillIntensity[]>([]);
	const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
	const [requiredEquipmentOnly, setRequiredEquipmentOnly] = useState(false);
	const [showLikedOnly, setShowLikedOnly] = useState(false);
	const [showSavedOnly, setShowSavedOnly] = useState(false);
	const [durationRange, setDurationRange] = useState<[number, number]>([DURATION_MIN, DURATION_MAX]);
	const [playersRange, setPlayersRange] = useState<[number, number]>([PLAYERS_MIN, PLAYERS_MAX]);
	const [selectedAuthorId, setSelectedAuthorId] = useState<string | undefined>();
	const [selectedClubId, setSelectedClubId] = useState<string | undefined>();

	// Sort state
	const [sortBy, setSortBy] = useState<DrillSortBy>("likeCount");
	const [sortOrder, setSortOrder] = useState<DrillSortOrder>("desc");
	const [showSortMenu, setShowSortMenu] = useState(false);

	// Compute unique equipment, authors, and clubs from drills
	const { uniqueEquipment, uniqueAuthors, uniqueClubs } = useMemo(() => {
		const equipmentSet = new Set<string>();
		const authorMap = new Map<string, AuthorOption>();
		const clubMap = new Map<string, ClubOption>();

		drills.forEach((drill) => {
			drill.equipment?.forEach((eq) => equipmentSet.add(eq.name));

			if (drill.author?.id) {
				const authorName = [drill.author.firstName, drill.author.lastName].filter(Boolean).join(" ");
				if (authorName && !authorMap.has(drill.author.id)) {
					authorMap.set(drill.author.id, {
						id: drill.author.id,
						name: authorName,
						avatarUrl: drill.author.avatarUrl,
					});
				}
			}

			if (drill.clubId && drill.clubName) {
				if (!clubMap.has(drill.clubId)) {
					clubMap.set(drill.clubId, {
						id: drill.clubId,
						name: drill.clubName,
						logoUrl: drill.clubLogoUrl,
					});
				}
			}
		});

		return {
			uniqueEquipment: Array.from(equipmentSet).sort(),
			uniqueAuthors: Array.from(authorMap.values()),
			uniqueClubs: Array.from(clubMap.values()),
		};
	}, [drills]);

	// Filter and sort drills
	const filteredDrills = useMemo(() => {
		let result = drills.filter((drill) => {
			// Search filter
			if (search) {
				const searchLower = search.toLowerCase();
				const matchesName = drill.name.toLowerCase().includes(searchLower);
				const matchesDescription = drill.description?.toLowerCase().includes(searchLower);
				const matchesSkills = drill.skills.some((s) => s.toLowerCase().includes(searchLower));
				if (!matchesName && !matchesDescription && !matchesSkills) return false;
			}

			// Skills filter
			if (selectedSkills.length > 0) {
				if (!selectedSkills.some((skill) => drill.skills.includes(skill))) return false;
			}

			// Categories filter
			if (selectedCategories.length > 0) {
				if (!selectedCategories.includes(drill.category)) return false;
			}

			// Intensities filter
			if (selectedIntensities.length > 0) {
				if (!selectedIntensities.includes(drill.intensity)) return false;
			}

			// Equipment filter
			if (selectedEquipment.length > 0) {
				const drillEquipmentNames = drill.equipment?.map((e) => e.name) || [];
				if (requiredEquipmentOnly) {
					// All selected equipment must be in drill
					if (!selectedEquipment.every((eq) => drillEquipmentNames.includes(eq))) return false;
				} else {
					// Any selected equipment
					if (!selectedEquipment.some((eq) => drillEquipmentNames.includes(eq))) return false;
				}
			}

			// Duration filter
			if (drill.duration !== undefined) {
				if (drill.duration < durationRange[0] || drill.duration > durationRange[1]) return false;
			}

			// Players filter
			if (drill.minPlayers !== undefined) {
				if (drill.minPlayers < playersRange[0]) return false;
			}
			if (drill.maxPlayers !== undefined) {
				if (drill.maxPlayers > playersRange[1]) return false;
			}

			// Liked only filter
			if (showLikedOnly && !drill.isLiked) return false;

			// Saved only filter
			if (showSavedOnly && !drill.isBookmarked) return false;

			// Author filter
			if (selectedAuthorId && drill.author?.id !== selectedAuthorId) return false;

			// Club filter
			if (selectedClubId && drill.clubId !== selectedClubId) return false;

			return true;
		});

		// Sort
		result.sort((a, b) => {
			let comparison = 0;

			switch (sortBy) {
				case "likeCount":
					comparison = (a.likeCount || 0) - (b.likeCount || 0);
					break;
				case "createdAt":
					comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
					break;
				case "name":
					comparison = a.name.localeCompare(b.name);
					break;
				case "duration":
					comparison = (a.duration || 0) - (b.duration || 0);
					break;
			}

			return sortOrder === "desc" ? -comparison : comparison;
		});

		return result;
	}, [
		drills,
		search,
		selectedSkills,
		selectedCategories,
		selectedIntensities,
		selectedEquipment,
		requiredEquipmentOnly,
		durationRange,
		playersRange,
		showLikedOnly,
		showSavedOnly,
		selectedAuthorId,
		selectedClubId,
		sortBy,
		sortOrder,
	]);

	// Filter count for UI
	const filterCount =
		selectedSkills.length +
		selectedCategories.length +
		selectedIntensities.length +
		selectedEquipment.length +
		(durationRange[0] > DURATION_MIN || durationRange[1] < DURATION_MAX ? 1 : 0) +
		(playersRange[0] > PLAYERS_MIN || playersRange[1] < PLAYERS_MAX ? 1 : 0) +
		(selectedAuthorId ? 1 : 0) +
		(selectedClubId ? 1 : 0);

	const hasFilters = filterCount > 0 || showLikedOnly || showSavedOnly || search.length > 0;

	const clearFilters = () => {
		setSearch("");
		setSelectedSkills([]);
		setSelectedCategories([]);
		setSelectedIntensities([]);
		setSelectedEquipment([]);
		setRequiredEquipmentOnly(false);
		setShowLikedOnly(false);
		setShowSavedOnly(false);
		setDurationRange([DURATION_MIN, DURATION_MAX]);
		setPlayersRange([PLAYERS_MIN, PLAYERS_MAX]);
		setSelectedAuthorId(undefined);
		setSelectedClubId(undefined);
	};

	const handleLikeClick = (drillId: string) => {
		const drill = drills.find((d) => d.id === drillId);
		if (!drill) return;

		if (drill.isLiked) {
			unlikeMutation.mutate(drillId);
		} else {
			likeMutation.mutate(drillId);
		}
	};

	const handleBookmarkClick = (drillId: string) => {
		const drill = drills.find((d) => d.id === drillId);
		if (!drill) return;

		if (drill.isBookmarked) {
			unbookmarkMutation.mutate(drillId);
		} else {
			bookmarkMutation.mutate(drillId);
		}
	};

	const handleSkillClick = (skill: DrillSkill) => {
		setSelectedSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]));
	};

	const currentSortOption = SORT_OPTIONS.find((opt) => opt.sortBy === sortBy && opt.sortOrder === sortOrder) || SORT_OPTIONS[0];

	if (error) {
		console.error("[DrillsPage] Error loading drills:", error);
		return (
			<div className="flex flex-col items-center justify-center h-64 gap-2">
				<p className="text-error">Failed to load drills. Please try again.</p>
				<p className="text-sm text-muted-foreground">{String(error)}</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6 h-full">
			{/* Header */}
			<div className="flex items-center justify-between shrink-0">
				<div>
					<h1 className="text-xl font-bold text-foreground">Drill Library</h1>
					<p className="text-sm text-muted-foreground mt-0.5">Browse and discover volleyball drills from the community</p>
				</div>
				<Button leftIcon={<Plus size={16} />} onClick={() => setIsCreateModalOpen(true)}>
					Create Drill
				</Button>
			</div>

			{/* Filters */}
			<DrillFilters
				search={search}
				onSearchChange={setSearch}
				selectedSkills={selectedSkills}
				onSelectedSkillsChange={setSelectedSkills}
				selectedCategories={selectedCategories}
				onSelectedCategoriesChange={setSelectedCategories}
				selectedIntensities={selectedIntensities}
				onSelectedIntensitiesChange={setSelectedIntensities}
				selectedEquipment={selectedEquipment}
				onSelectedEquipmentChange={setSelectedEquipment}
				requiredEquipmentOnly={requiredEquipmentOnly}
				onRequiredEquipmentOnlyChange={setRequiredEquipmentOnly}
				showLikedOnly={showLikedOnly}
				onShowLikedOnlyChange={setShowLikedOnly}
				showSavedOnly={showSavedOnly}
				onShowSavedOnlyChange={setShowSavedOnly}
				durationRange={durationRange}
				onDurationRangeChange={setDurationRange}
				playersRange={playersRange}
				onPlayersRangeChange={setPlayersRange}
				durationMin={DURATION_MIN}
				durationMax={DURATION_MAX}
				playersMin={PLAYERS_MIN}
				playersMax={PLAYERS_MAX}
				uniqueEquipment={uniqueEquipment}
				filterCount={filterCount}
				hasFilters={hasFilters}
				onClearFilters={clearFilters}
				selectedAuthorId={selectedAuthorId}
				onSelectedAuthorIdChange={setSelectedAuthorId}
				selectedClubId={selectedClubId}
				onSelectedClubIdChange={setSelectedClubId}
				uniqueAuthors={uniqueAuthors}
				uniqueClubs={uniqueClubs}
			/>

			{/* Results header with sort */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{isLoading ? (
						"Loading..."
					) : (
						<>
							<span className="font-semibold text-foreground">{filteredDrills.length}</span> {filteredDrills.length === 1 ? "drill" : "drills"}{" "}
							found
						</>
					)}
				</p>

				{/* Sort dropdown */}
				<div className="relative">
					<button
						type="button"
						onClick={() => setShowSortMenu(!showSortMenu)}
						className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-hover transition-colors border border-border">
						{currentSortOption.icon}
						<span>{currentSortOption.label}</span>
						<ChevronDown size={12} className={cn("transition-transform", showSortMenu && "rotate-180")} />
					</button>

					{showSortMenu && (
						<>
							<div className="fixed inset-0 z-40" onClick={() => setShowSortMenu(false)} />
							<div className="absolute right-0 mt-1 z-50 min-w-[180px] rounded-xl bg-card border border-border shadow-lg py-1">
								{SORT_OPTIONS.map((option) => (
									<button
										key={`${option.sortBy}-${option.sortOrder}`}
										type="button"
										onClick={() => {
											setSortBy(option.sortBy);
											setSortOrder(option.sortOrder);
											setShowSortMenu(false);
										}}
										className={cn(
											"w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors",
											option.sortBy === sortBy && option.sortOrder === sortOrder
												? "text-foreground bg-surface"
												: "text-muted-foreground hover:text-foreground hover:bg-hover",
										)}>
										{option.icon}
										{option.label}
									</button>
								))}
							</div>
						</>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin pr-1">
				{isLoading ? (
					<div className="flex items-center justify-center h-64">
						<Loader size="lg" />
					</div>
				) : filteredDrills.length === 0 ? (
					<EmptyState
						icon={<BookOpen size={48} />}
						title={hasFilters ? "No drills match your filters" : "No drills yet"}
						description={
							hasFilters
								? "Try adjusting your filters or search term to find what you're looking for."
								: "Be the first to create a drill and share it with the community!"
						}
						action={
							hasFilters ? (
								<Button variant="outline" onClick={clearFilters}>
									Clear Filters
								</Button>
							) : (
								<Button leftIcon={<Plus size={16} />} onClick={() => setIsCreateModalOpen(true)}>
									Create Drill
								</Button>
							)
						}
					/>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
						{filteredDrills.map((drill) => (
							<DrillCard
								key={drill.id}
								drill={drill}
								showAddButton={false}
								onSkillClick={handleSkillClick}
								onLikeClick={handleLikeClick}
								onBookmarkClick={handleBookmarkClick}
								highlightedSkills={selectedSkills}
							/>
						))}
					</div>
				)}
			</div>

			{/* Create Drill Modal */}
			<CreateDrillModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={() => setIsCreateModalOpen(false)} />
		</div>
	);
}
