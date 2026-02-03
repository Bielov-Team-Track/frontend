"use client";

import { Button } from "@/components";
import {
	CreateDrillModal,
	DrillCard,
	DrillCategory,
	DrillFilters,
	DrillIntensity,
	DrillListItem,
	DrillSkill,
	DrillSortBy,
	DrillSortOrder,
	SORT_OPTIONS,
} from "@/components/features/drills";
import { EmptyState, Loader } from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDrills, useLikeDrill, useUnlikeDrill, useBookmarkDrill, useUnbookmarkDrill } from "@/hooks/useDrills";
import { ArrowUpDown, BookOpen, ChevronDown, Clock, Grid, List, Plus, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";

// Default min/max values for sliders (will be overridden when data loads)
const DEFAULT_DURATION_MIN = 5;
const DEFAULT_DURATION_MAX = 60;
const DEFAULT_PLAYERS_MIN = 2;
const DEFAULT_PLAYERS_MAX = 18;

export default function DrillLibraryPage() {
	const { data: drills = [], isLoading, error, refetch } = useDrills();

	// Like/Bookmark mutations
	const likeMutation = useLikeDrill();
	const unlikeMutation = useUnlikeDrill();
	const bookmarkMutation = useBookmarkDrill();
	const unbookmarkMutation = useUnbookmarkDrill();

	const handleLikeClick = (drillId: string) => {
		const drill = drills.find((d) => d.id === drillId);
		if (!drill) return;

		if (drill.isLiked) {
			unlikeMutation.mutate(drillId, { onSuccess: () => refetch() });
		} else {
			likeMutation.mutate(drillId, { onSuccess: () => refetch() });
		}
	};

	const handleBookmarkClick = (drillId: string) => {
		const drill = drills.find((d) => d.id === drillId);
		if (!drill) return;

		if (drill.isBookmarked) {
			unbookmarkMutation.mutate(drillId, { onSuccess: () => refetch() });
		} else {
			bookmarkMutation.mutate(drillId, { onSuccess: () => refetch() });
		}
	};

	const [search, setSearch] = useState("");
	const [selectedSkills, setSelectedSkills] = useState<DrillSkill[]>([]);
	const [selectedCategories, setSelectedCategories] = useState<DrillCategory[]>([]);
	const [selectedIntensities, setSelectedIntensities] = useState<DrillIntensity[]>([]);
	const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
	const [requiredEquipmentOnly, setRequiredEquipmentOnly] = useState(false);
	const [showLikedOnly, setShowLikedOnly] = useState(false);
	const [showSavedOnly, setShowSavedOnly] = useState(false);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [selectedAuthorId, setSelectedAuthorId] = useState<string | undefined>(undefined);
	const [selectedClubId, setSelectedClubId] = useState<string | undefined>(undefined);
	const [sortBy, setSortBy] = useState<DrillSortBy>("likeCount");
	const [sortOrder, setSortOrder] = useState<DrillSortOrder>("desc");
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

	const currentSort = SORT_OPTIONS.find(
		(opt) => opt.sortBy === sortBy && opt.sortOrder === sortOrder
	) || SORT_OPTIONS[0];

	// Extract unique equipment names from all drills
	const uniqueEquipment = useMemo(() => {
		const equipmentSet = new Set<string>();
		drills.forEach((drill) => {
			drill.equipment?.forEach((eq) => {
				equipmentSet.add(eq.name);
			});
		});
		return Array.from(equipmentSet).sort();
	}, [drills]);

	// Extract unique authors from all drills
	const uniqueAuthors = useMemo(() => {
		const authorsMap = new Map<string, { id: string; name: string; avatarUrl?: string }>();
		drills.forEach((drill) => {
			if (drill.author?.id) {
				const name = drill.author.firstName && drill.author.lastName
					? `${drill.author.firstName} ${drill.author.lastName}`
					: drill.author.firstName || drill.author.lastName || "Unknown";
				authorsMap.set(drill.author.id, {
					id: drill.author.id,
					name,
					avatarUrl: drill.author.avatarUrl,
				});
			}
		});
		return Array.from(authorsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
	}, [drills]);

	// Extract unique clubs from all drills
	const uniqueClubs = useMemo(() => {
		const clubsMap = new Map<string, { id: string; name: string; logoUrl?: string }>();
		drills.forEach((drill) => {
			if (drill.clubId && drill.clubName) {
				clubsMap.set(drill.clubId, {
					id: drill.clubId,
					name: drill.clubName,
					logoUrl: drill.clubLogoUrl,
				});
			}
		});
		return Array.from(clubsMap.values()).sort((a, b) => a.name.localeCompare(b.name));
	}, [drills]);

	// Calculate min/max values from loaded drills
	const { durationMin, durationMax, playersMin, playersMax } = useMemo(() => {
		if (drills.length === 0) {
			return {
				durationMin: DEFAULT_DURATION_MIN,
				durationMax: DEFAULT_DURATION_MAX,
				playersMin: DEFAULT_PLAYERS_MIN,
				playersMax: DEFAULT_PLAYERS_MAX,
			};
		}
		const durationsWithValue = drills.filter((d) => d.duration != null).map((d) => d.duration!);
		const minPlayersValues = drills.filter((d) => d.minPlayers != null).map((d) => d.minPlayers!);
		const maxPlayersValues = drills.filter((d) => d.maxPlayers != null).map((d) => d.maxPlayers!);

		return {
			durationMin: durationsWithValue.length > 0 ? Math.min(...durationsWithValue) : DEFAULT_DURATION_MIN,
			durationMax: durationsWithValue.length > 0 ? Math.max(...durationsWithValue) : DEFAULT_DURATION_MAX,
			playersMin: minPlayersValues.length > 0 ? Math.min(...minPlayersValues) : DEFAULT_PLAYERS_MIN,
			playersMax: maxPlayersValues.length > 0 ? Math.max(...maxPlayersValues) : DEFAULT_PLAYERS_MAX,
		};
	}, [drills]);

	const [durationRange, setDurationRange] = useState<[number, number]>([DEFAULT_DURATION_MIN, DEFAULT_DURATION_MAX]);
	const [playersRange, setPlayersRange] = useState<[number, number]>([DEFAULT_PLAYERS_MIN, DEFAULT_PLAYERS_MAX]);

	// Update ranges when drills load
	useEffect(() => {
		if (drills.length > 0) {
			setDurationRange([durationMin, durationMax]);
			setPlayersRange([playersMin, playersMax]);
		}
	}, [drills.length, durationMin, durationMax, playersMin, playersMax]);

	const filteredDrills = useMemo(() => {
		const filtered = drills.filter((drill) => {
			// Search
			if (search) {
				const q = search.toLowerCase();
				const matches =
					drill.name.toLowerCase().includes(q) ||
					(drill.description && drill.description.toLowerCase().includes(q)) ||
					drill.skills.some((s) => s.toLowerCase().includes(q));
				if (!matches) return false;
			}
			// Skills
			if (selectedSkills.length && !drill.skills.some((s) => selectedSkills.includes(s))) return false;
			// Categories
			if (selectedCategories.length && !selectedCategories.includes(drill.category)) return false;
			// Intensities
			if (selectedIntensities.length && !selectedIntensities.includes(drill.intensity)) return false;
			// Duration
			if (drill.duration != null && (drill.duration < durationRange[0] || drill.duration > durationRange[1])) return false;
			// Players
			if (drill.minPlayers && drill.maxPlayers) {
				if (drill.maxPlayers < playersRange[0] || drill.minPlayers > playersRange[1]) return false;
			}
			// Equipment filter - drill must have ALL selected equipment
			if (selectedEquipment.length > 0) {
				const drillEquipment = drill.equipment ?? [];
				const matchingEquipment = requiredEquipmentOnly
					? drillEquipment.filter((eq) => !eq.isOptional)
					: drillEquipment;
				const hasAllEquipment = selectedEquipment.every((selected) =>
					matchingEquipment.some((eq) => eq.name.toLowerCase() === selected.toLowerCase())
				);
				if (!hasAllEquipment) return false;
			}
			// Liked filter - show drills that the current user has liked
			if (showLikedOnly && !drill.isLiked) return false;
			// Saved filter - show drills that the current user has bookmarked
			if (showSavedOnly && !drill.isBookmarked) return false;
			// Author filter
			if (selectedAuthorId && drill.author?.id !== selectedAuthorId) return false;
			// Club filter
			if (selectedClubId && drill.clubId !== selectedClubId) return false;
			return true;
		});

		// Sort the filtered results
		return [...filtered].sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case "likeCount":
					comparison = (a.likeCount || 0) - (b.likeCount || 0);
					break;
				case "createdAt":
					comparison = new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
					break;
				case "name":
					comparison = a.name.localeCompare(b.name);
					break;
				case "duration":
					comparison = (a.duration || 0) - (b.duration || 0);
					break;
				default:
					comparison = 0;
			}
			return sortOrder === "desc" ? -comparison : comparison;
		});
	}, [search, selectedSkills, selectedCategories, selectedIntensities, durationRange, playersRange, selectedEquipment, requiredEquipmentOnly, showLikedOnly, showSavedOnly, selectedAuthorId, selectedClubId, drills, sortBy, sortOrder]);

	const hasFilters =
		selectedSkills.length > 0 ||
		selectedCategories.length > 0 ||
		selectedIntensities.length > 0 ||
		selectedEquipment.length > 0 ||
		showLikedOnly ||
		showSavedOnly ||
		search ||
		durationRange[0] > durationMin ||
		durationRange[1] < durationMax ||
		playersRange[0] > playersMin ||
		playersRange[1] < playersMax ||
		selectedAuthorId ||
		selectedClubId;

	const filterCount =
		selectedSkills.length +
		selectedCategories.length +
		selectedIntensities.length +
		selectedEquipment.length +
		(showLikedOnly ? 1 : 0) +
		(showSavedOnly ? 1 : 0) +
		(durationRange[0] > durationMin || durationRange[1] < durationMax ? 1 : 0) +
		(playersRange[0] > playersMin || playersRange[1] < playersMax ? 1 : 0) +
		(selectedAuthorId ? 1 : 0) +
		(selectedClubId ? 1 : 0);

	const clearFilters = () => {
		setSelectedSkills([]);
		setSelectedCategories([]);
		setSelectedIntensities([]);
		setSelectedEquipment([]);
		setRequiredEquipmentOnly(false);
		setShowLikedOnly(false);
		setShowSavedOnly(false);
		setSearch("");
		setDurationRange([durationMin, durationMax]);
		setPlayersRange([playersMin, playersMax]);
		setSelectedAuthorId(undefined);
		setSelectedClubId(undefined);
	};

	const handleSortChange = (newSortBy: DrillSortBy, newSortOrder: DrillSortOrder) => {
		setSortBy(newSortBy);
		setSortOrder(newSortOrder);
	};

	if (error) {
		return (
			<div className="space-y-6">
				<EmptyState
					icon={BookOpen}
					title="Failed to load drills"
					description="There was an error loading the drill library. Please try again."
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
					{filteredDrills.length} drill{filteredDrills.length !== 1 ? "s" : ""}
					{hasFilters && " (filtered)"}
				</p>
				<div className="flex items-center gap-3">
					{/* Sort Dropdown */}
					<div className="relative" ref={sortDropdownRef}>
						<button
							type="button"
							onClick={() => setShowSortDropdown(!showSortDropdown)}
							className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground transition-colors">
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
								{SORT_OPTIONS.map((option) => {
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
											}`}>
											{option.sortBy === "likeCount" && <TrendingUp size={14} />}
											{option.sortBy === "createdAt" && <Clock size={14} />}
											{option.sortBy === "name" && <ArrowUpDown size={14} />}
											{option.sortBy === "duration" && <Clock size={14} />}
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

			{/* Drills Display */}
			{isLoading ? (
				<div className="flex justify-center py-12">
					<Loader />
				</div>
			) : filteredDrills.length === 0 ? (
				<EmptyState
					icon={BookOpen}
					title="No drills found"
					description="Try adjusting your search or filters"
					action={hasFilters ? { label: "Clear Filters", onClick: clearFilters } : undefined}
				/>
			) : (
				<>
					<TabsContent value="list">
						<div className="space-y-2">
							{filteredDrills.map((drill) => (
								<DrillListItem
									key={drill.id}
									drill={drill as any}
									highlightedSkills={selectedSkills}
									onSkillClick={(skill) => {
										if (!selectedSkills.includes(skill)) {
											setSelectedSkills((prev) => [...prev, skill]);
										}
									}}
									onLikeClick={handleLikeClick}
									onBookmarkClick={handleBookmarkClick}
								/>
							))}
						</div>
					</TabsContent>
					<TabsContent value="grid">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredDrills.map((drill) => (
								<DrillCard
									key={drill.id}
									drill={drill as any}
									showAddButton={false}
									highlightedSkills={selectedSkills}
									onSkillClick={(skill) => {
										if (!selectedSkills.includes(skill)) {
											setSelectedSkills((prev) => [...prev, skill]);
										}
									}}
									onLikeClick={handleLikeClick}
									onBookmarkClick={handleBookmarkClick}
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
						<BookOpen size={28} className="text-accent" />
						Drill Library
					</h1>
					<p className="text-muted-foreground mt-1">Browse volleyball drills for your training sessions</p>
				</div>
				<Button color="primary" leftIcon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
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
				durationMin={durationMin}
				durationMax={durationMax}
				playersMin={playersMin}
				playersMax={playersMax}
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

			{/* Content */}
			<div className="space-y-4">
				{renderContent()}
			</div>

			{/* Create Drill Modal */}
			<CreateDrillModal
				isOpen={showCreateModal}
				onClose={() => setShowCreateModal(false)}
				onSuccess={() => refetch()}
			/>
		</Tabs>
	);
}
