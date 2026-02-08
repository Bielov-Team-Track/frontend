"use client";

import { Button } from "@/components";
import { TemplateCard, TemplateFilters } from "@/components/features/templates";
import type { TemplateSource } from "@/components/features/templates";
import type { AuthorOption, ClubOption } from "@/components/features/templates/TemplateFilters";
import { EmptyState, Loader } from "@/components/ui";
import {
	useMyTemplates,
	useClubTemplates,
	usePublicTemplates,
	useBookmarkedTemplates,
} from "@/hooks/useTemplates";
import { TEMPLATE_SORT_OPTIONS } from "@/components/features/templates/TemplateFilters";
import type { TemplateSortBy } from "@/components/features/templates";
import { DifficultyLevel, TemplateFilterRequest } from "@/lib/models/Template";
import { ArrowUpDown, BookOpen, ChevronDown, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_DURATION_MIN = 30;
const DEFAULT_DURATION_MAX = 180;

export default function CoachingTrainingPlansPage() {
	const [source, setSource] = useState<TemplateSource>("discover");
	const [search, setSearch] = useState("");
	const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
	const [selectedLevel, setSelectedLevel] = useState<DifficultyLevel | undefined>(undefined);
	const [sortBy, setSortBy] = useState<TemplateSortBy>("newest");
	const [selectedAuthorId, setSelectedAuthorId] = useState<string | undefined>(undefined);
	const [selectedClubId, setSelectedClubId] = useState<string | undefined>(undefined);
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

	const currentSort = TEMPLATE_SORT_OPTIONS.find((opt) => opt.value === sortBy) || TEMPLATE_SORT_OPTIONS[0];

	// Build filter request for API
	const filter: TemplateFilterRequest = useMemo(
		() => ({
			searchTerm: search || undefined,
			skills: selectedSkills.length > 0 ? selectedSkills : undefined,
			level: selectedLevel,
			sortBy,
		}),
		[search, selectedSkills, selectedLevel, sortBy]
	);

	// Always fetch user's own templates (shown in pinned section)
	const {
		data: myTemplates = [],
		isLoading: isLoadingMy,
		error: errorMy,
	} = useMyTemplates();

	const {
		data: clubTemplates = [],
		isLoading: isLoadingClub,
		error: errorClub,
	} = useClubTemplates("", filter, source === "club");

	const {
		data: publicTemplates = [],
		isLoading: isLoadingPublic,
		error: errorPublic,
	} = usePublicTemplates(filter, source === "discover");

	const {
		data: bookmarkedTemplates = [],
		isLoading: isLoadingBookmarked,
		error: errorBookmarked,
	} = useBookmarkedTemplates(filter, source === "bookmarked");

	// Get current data based on source (discover section)
	const templates = useMemo(() => {
		switch (source) {
			case "club":
				return clubTemplates;
			case "discover":
				return publicTemplates;
			case "bookmarked":
				return bookmarkedTemplates;
			default:
				return [];
		}
	}, [source, clubTemplates, publicTemplates, bookmarkedTemplates]);

	const isLoading =
		(source === "club" && isLoadingClub) ||
		(source === "discover" && isLoadingPublic) ||
		(source === "bookmarked" && isLoadingBookmarked);

	const error = errorMy || errorClub || errorPublic || errorBookmarked;

	// Calculate min/max duration from loaded templates
	const { durationMin, durationMax } = useMemo(() => {
		if (templates.length === 0) {
			return { durationMin: DEFAULT_DURATION_MIN, durationMax: DEFAULT_DURATION_MAX };
		}
		const durations = templates.filter((t) => t.totalDuration != null).map((t) => t.totalDuration!);
		return {
			durationMin: durations.length > 0 ? Math.min(...durations) : DEFAULT_DURATION_MIN,
			durationMax: durations.length > 0 ? Math.max(...durations) : DEFAULT_DURATION_MAX,
		};
	}, [templates]);

	const [durationRange, setDurationRange] = useState<[number, number]>([DEFAULT_DURATION_MIN, DEFAULT_DURATION_MAX]);

	// Update range when templates load
	useEffect(() => {
		if (templates.length > 0) {
			setDurationRange([durationMin, durationMax]);
		}
	}, [templates.length, durationMin, durationMax]);

	// Extract unique authors from loaded templates
	const uniqueAuthors: AuthorOption[] = useMemo(() => {
		const map = new Map<string, AuthorOption>();
		templates.forEach((t) => {
			if (t.author?.id) {
				const name =
					t.author.firstName && t.author.lastName
						? `${t.author.firstName} ${t.author.lastName}`
						: t.author.firstName || t.author.lastName || "Unknown";
				map.set(t.author.id, { id: t.author.id, name, avatarUrl: t.author.avatarUrl });
			}
		});
		return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
	}, [templates]);

	// Extract unique clubs from loaded templates
	const uniqueClubs: ClubOption[] = useMemo(() => {
		const map = new Map<string, ClubOption>();
		templates.forEach((t) => {
			if (t.clubId && t.clubName) {
				map.set(t.clubId, { id: t.clubId, name: t.clubName, logoUrl: t.clubLogoUrl });
			}
		});
		return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
	}, [templates]);

	// Apply client-side filters (duration range, author, club)
	const filteredTemplates = useMemo(() => {
		return templates.filter((template) => {
			if (
				template.totalDuration != null &&
				(template.totalDuration < durationRange[0] || template.totalDuration > durationRange[1])
			) {
				return false;
			}
			if (selectedAuthorId && template.author?.id !== selectedAuthorId) return false;
			if (selectedClubId && template.clubId !== selectedClubId) return false;
			return true;
		});
	}, [templates, durationRange, selectedAuthorId, selectedClubId]);

	const isDurationModified = durationRange[0] > durationMin || durationRange[1] < durationMax;

	const hasFilters =
		selectedSkills.length > 0 ||
		search ||
		sortBy !== "newest" ||
		isDurationModified ||
		source !== "discover" ||
		!!selectedLevel ||
		!!selectedAuthorId ||
		!!selectedClubId;

	const filterCount =
		selectedSkills.length +
		(sortBy !== "newest" ? 1 : 0) +
		(isDurationModified ? 1 : 0) +
		(selectedLevel ? 1 : 0) +
		(selectedAuthorId ? 1 : 0) +
		(selectedClubId ? 1 : 0);

	const clearFilters = () => {
		setSelectedSkills([]);
		setSelectedLevel(undefined);
		setSearch("");
		setSortBy("newest");
		setDurationRange([durationMin, durationMax]);
		setSource("discover");
		setSelectedAuthorId(undefined);
		setSelectedClubId(undefined);
	};

	// Source label for empty state context
	const sourceLabel =
		source === "club"
			? "club"
			: source === "bookmarked"
				? "bookmarked"
				: "public";

	if (error) {
		return (
			<div className="space-y-6">
				<EmptyState
					icon={BookOpen}
					title="Failed to load training plans"
					description="There was an error loading training plans. Please try again."
					action={{ label: "Retry", onClick: () => window.location.reload() }}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
						<BookOpen size={28} className="text-accent" />
						Training Plans
					</h1>
					<p className="text-muted-foreground mt-1">Browse and manage training plan templates</p>
				</div>
				<Link href="/dashboard/coaching/training/plans/wizard">
					<Button color="primary" leftIcon={<Plus size={16} />}>
						Create Plan
					</Button>
				</Link>
			</div>

			{/* Your Plans - Pinned Section */}
			<div className="pb-6 border-b border-border">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<h2 className="text-lg font-semibold text-foreground">Your Plans</h2>
						{myTemplates.length > 0 && (
							<span className="px-2 py-0.5 rounded-full bg-foreground/10 text-xs font-bold text-muted-foreground">
								{myTemplates.length}
							</span>
						)}
					</div>
					{myTemplates.length > 6 && (
						<Link
							href="/dashboard/coaching/training/plans/wizard"
							className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:text-accent/80 transition-colors">
							View All
							<ChevronRight size={14} />
						</Link>
					)}
				</div>

				{isLoadingMy ? (
					<div className="flex justify-center py-6">
						<Loader />
					</div>
				) : myTemplates.length === 0 ? (
					<Link
						href="/dashboard/coaching/training/plans/wizard"
						className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-border hover:border-accent/40 hover:bg-accent/5 transition-colors group">
						<div className="flex items-center justify-center size-10 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
							<Plus size={20} />
						</div>
						<div>
							<p className="text-sm font-semibold text-foreground">Create your first training plan</p>
							<p className="text-xs text-muted-foreground">Build a reusable template for your training sessions</p>
						</div>
					</Link>
				) : (
					<div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
						{myTemplates.map((template) => (
							<div key={template.id} className="shrink-0 w-[280px]">
								<TemplateCard template={template} variant="compact" />
							</div>
						))}
					</div>
				)}
			</div>

			{/* Filters */}
			<TemplateFilters
				search={search}
				onSearchChange={setSearch}
				source={source}
				onSourceChange={setSource}
				selectedSkills={selectedSkills}
				onSelectedSkillsChange={setSelectedSkills}
				durationRange={durationRange}
				onDurationRangeChange={setDurationRange}
				durationMin={durationMin}
				durationMax={durationMax}
				selectedLevel={selectedLevel}
				onSelectedLevelChange={setSelectedLevel}
				selectedAuthorId={selectedAuthorId}
				onSelectedAuthorIdChange={setSelectedAuthorId}
				selectedClubId={selectedClubId}
				onSelectedClubIdChange={setSelectedClubId}
				uniqueAuthors={uniqueAuthors}
				uniqueClubs={uniqueClubs}
				filterCount={filterCount}
				hasFilters={hasFilters}
				onClearFilters={clearFilters}
			/>

			{/* Results Header */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-muted-foreground">
					{filteredTemplates.length} plan{filteredTemplates.length !== 1 ? "s" : ""}
					{hasFilters && " (filtered)"}
				</p>
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

					{showSortDropdown && (
						<div className="absolute right-0 top-full mt-2 w-48 rounded-xl bg-card border border-border shadow-lg z-50 overflow-hidden">
							{TEMPLATE_SORT_OPTIONS.map((option) => {
								const isSelected = option.value === sortBy;
								return (
									<button
										key={option.value}
										type="button"
										onClick={() => {
											setSortBy(option.value);
											setShowSortDropdown(false);
										}}
										className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-medium transition-colors text-left ${
											isSelected
												? "bg-foreground/5 text-foreground"
												: "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
										}`}>
										{option.icon}
										{option.label}
									</button>
								);
							})}
						</div>
					)}
				</div>
			</div>

			{/* Content */}
			{isLoading ? (
				<div className="flex justify-center py-12">
					<Loader />
				</div>
			) : filteredTemplates.length === 0 ? (
				<EmptyState
					icon={BookOpen}
					title={hasFilters ? "No plans found" : `No ${sourceLabel} training plans yet`}
					description={
						hasFilters
							? "Try adjusting your search or filters"
							: source === "bookmarked"
								? "You haven't bookmarked any training plans yet"
								: source === "club"
									? "Your club hasn't created any training plan templates yet"
									: "No public training plans have been shared yet"
					}
					action={
						hasFilters
							? { label: "Clear Filters", onClick: clearFilters }
							: source === "discover"
								? {
										label: "Create Plan",
										onClick: () => (window.location.href = "/dashboard/coaching/training/plans/wizard"),
								  }
								: undefined
					}
				/>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredTemplates.map((template) => (
						<TemplateCard key={template.id} template={template} />
					))}
				</div>
			)}
		</div>
	);
}
