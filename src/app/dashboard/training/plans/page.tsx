"use client";

import { Button } from "@/components";
import { SkillFilter } from "@/components/features/drills";
import { TemplateCard } from "@/components/features/templates";
import { EmptyState, Input, Loader, Slider } from "@/components/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	useMyTemplates,
	useClubTemplates,
	usePublicTemplates,
	useBookmarkedTemplates,
} from "@/hooks/useTemplates";
import { TemplateFilterRequest } from "@/lib/models/Template";
import { BookOpen, Plus, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// Default min/max values for duration slider (will be overridden when data loads)
const DEFAULT_DURATION_MIN = 30;
const DEFAULT_DURATION_MAX = 180;

type TabValue = "my-plans" | "club" | "discover" | "bookmarked";

export default function TrainingPlansPage() {
	const [activeTab, setActiveTab] = useState<TabValue>("my-plans");
	const [search, setSearch] = useState("");
	const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
	const [sortBy, setSortBy] = useState<"newest" | "mostUsed" | "mostLiked" | "shortest" | "longest">("newest");
	const [showFilters, setShowFilters] = useState(false);

	// Build filter request
	const filter: TemplateFilterRequest = useMemo(
		() => ({
			searchTerm: search || undefined,
			skills: selectedSkills.length > 0 ? selectedSkills : undefined,
			sortBy,
		}),
		[search, selectedSkills, sortBy]
	);

	// Fetch data based on active tab
	const {
		data: myTemplates = [],
		isLoading: isLoadingMy,
		error: errorMy,
	} = useMyTemplates(filter, activeTab === "my-plans");

	const {
		data: clubTemplates = [],
		isLoading: isLoadingClub,
		error: errorClub,
	} = useClubTemplates("", filter, activeTab === "club"); // TODO: Get actual club ID from context

	const {
		data: publicTemplates = [],
		isLoading: isLoadingPublic,
		error: errorPublic,
	} = usePublicTemplates(filter, activeTab === "discover");

	const {
		data: bookmarkedTemplates = [],
		isLoading: isLoadingBookmarked,
		error: errorBookmarked,
	} = useBookmarkedTemplates(filter, activeTab === "bookmarked");

	// Get current data based on active tab
	const templates = useMemo(() => {
		switch (activeTab) {
			case "my-plans":
				return myTemplates;
			case "club":
				return clubTemplates;
			case "discover":
				return publicTemplates;
			case "bookmarked":
				return bookmarkedTemplates;
			default:
				return [];
		}
	}, [activeTab, myTemplates, clubTemplates, publicTemplates, bookmarkedTemplates]);

	const isLoading = isLoadingMy || isLoadingClub || isLoadingPublic || isLoadingBookmarked;
	const error = errorMy || errorClub || errorPublic || errorBookmarked;

	// Calculate min/max duration from loaded templates
	const { durationMin, durationMax } = useMemo(() => {
		if (templates.length === 0) {
			return {
				durationMin: DEFAULT_DURATION_MIN,
				durationMax: DEFAULT_DURATION_MAX,
			};
		}
		const durationsWithValue = templates.filter((t) => t.totalDuration != null).map((t) => t.totalDuration!);

		return {
			durationMin: durationsWithValue.length > 0 ? Math.min(...durationsWithValue) : DEFAULT_DURATION_MIN,
			durationMax: durationsWithValue.length > 0 ? Math.max(...durationsWithValue) : DEFAULT_DURATION_MAX,
		};
	}, [templates]);

	const [durationRange, setDurationRange] = useState<[number, number]>([DEFAULT_DURATION_MIN, DEFAULT_DURATION_MAX]);

	// Update range when templates load
	useEffect(() => {
		if (templates.length > 0) {
			setDurationRange([durationMin, durationMax]);
		}
	}, [templates.length, durationMin, durationMax]);

	// Apply client-side filters (duration range)
	const filteredTemplates = useMemo(() => {
		return templates.filter((template) => {
			// Duration range filter
			if (
				template.totalDuration != null &&
				(template.totalDuration < durationRange[0] || template.totalDuration > durationRange[1])
			) {
				return false;
			}
			return true;
		});
	}, [templates, durationRange]);

	const hasFilters =
		selectedSkills.length > 0 ||
		search ||
		sortBy !== "newest" ||
		durationRange[0] > durationMin ||
		durationRange[1] < durationMax;

	const filterCount = selectedSkills.length + (sortBy !== "newest" ? 1 : 0);

	const clearFilters = () => {
		setSelectedSkills([]);
		setSearch("");
		setSortBy("newest");
		setDurationRange([durationMin, durationMax]);
	};

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
					<h1 className="text-2xl font-bold text-white flex items-center gap-3">
						<BookOpen size={28} className="text-accent" />
						Training Plans
					</h1>
					<p className="text-muted mt-1">Browse and manage training plan templates</p>
				</div>
				<Link href="/dashboard/training/plans/new">
					<Button color="primary" leftIcon={<Plus size={16} />}>
						Create Plan
					</Button>
				</Link>
			</div>

			{/* Tabs */}
			<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="space-y-6">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="my-plans">My Plans</TabsTrigger>
					<TabsTrigger value="club">Club</TabsTrigger>
					<TabsTrigger value="discover">Discover</TabsTrigger>
					<TabsTrigger value="bookmarked">Bookmarked</TabsTrigger>
				</TabsList>

				{/* Search & Filter Toggle */}
				<div className="flex flex-col sm:flex-row gap-4">
					<div className="flex-1">
						<Input
							placeholder="Search training plans..."
							leftIcon={<Search size={18} />}
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
					<Button
						variant={showFilters ? "default" : "outline"}
						color={showFilters ? "primary" : "neutral"}
						leftIcon={<SlidersHorizontal size={16} />}
						onClick={() => setShowFilters(!showFilters)}>
						Filters
						{filterCount > 0 && (
							<span className="ml-2 px-2 py-0.5 rounded-full bg-accent text-white text-xs">{filterCount}</span>
						)}
					</Button>
				</div>

				{/* Filters Panel */}
				{showFilters && (
					<div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-6 animate-in slide-in-from-top-2">
						{/* Skills */}
						<SkillFilter selectedSkills={selectedSkills as any} onSelectedSkillsChange={setSelectedSkills as any} label="Skills" />

						{/* Sort By */}
						<FilterSection title="Sort By">
							<div className="flex flex-wrap gap-2">
								<FilterPill selected={sortBy === "newest"} onClick={() => setSortBy("newest")}>
									Newest
								</FilterPill>
								<FilterPill selected={sortBy === "mostUsed"} onClick={() => setSortBy("mostUsed")}>
									Most Used
								</FilterPill>
								<FilterPill selected={sortBy === "mostLiked"} onClick={() => setSortBy("mostLiked")}>
									Most Liked
								</FilterPill>
								<FilterPill selected={sortBy === "shortest"} onClick={() => setSortBy("shortest")}>
									Shortest
								</FilterPill>
								<FilterPill selected={sortBy === "longest"} onClick={() => setSortBy("longest")}>
									Longest
								</FilterPill>
							</div>
						</FilterSection>

						{/* Duration Slider */}
						<Slider
							label="Total Duration"
							min={durationMin}
							max={durationMax}
							step={15}
							rangeValue={durationRange}
							onRangeChange={setDurationRange}
							formatValue={(v) => `${v} min`}
							color="accent"
						/>

						{hasFilters && (
							<div className="pt-4 border-t border-white/10">
								<button onClick={clearFilters} className="text-sm text-accent hover:underline">
									Clear all filters
								</button>
							</div>
						)}
					</div>
				)}

				{/* Results */}
				<div className="flex items-center justify-between">
					<p className="text-sm text-muted">
						{filteredTemplates.length} plan{filteredTemplates.length !== 1 ? "s" : ""}
						{hasFilters && " (filtered)"}
					</p>
				</div>

				{/* Tab Content */}
				<TabsContent value="my-plans" className="mt-0">
					{isLoadingMy ? (
						<div className="flex justify-center py-12">
							<Loader />
						</div>
					) : filteredTemplates.length === 0 ? (
						<EmptyState
							icon={BookOpen}
							title={hasFilters ? "No plans found" : "No training plans yet"}
							description={
								hasFilters
									? "Try adjusting your search or filters"
									: "Create your first training plan template to reuse it across events"
							}
							action={
								hasFilters
									? { label: "Clear Filters", onClick: clearFilters }
									: {
											label: "Create Plan",
											onClick: () => (window.location.href = "/dashboard/training/plans/new"),
									  }
							}
						/>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredTemplates.map((template) => (
								<TemplateCard key={template.id} template={template} />
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="club" className="mt-0">
					{isLoadingClub ? (
						<div className="flex justify-center py-12">
							<Loader />
						</div>
					) : filteredTemplates.length === 0 ? (
						<EmptyState
							icon={BookOpen}
							title={hasFilters ? "No plans found" : "No club plans yet"}
							description={
								hasFilters
									? "Try adjusting your search or filters"
									: "Your club hasn't created any training plan templates yet"
							}
							action={hasFilters ? { label: "Clear Filters", onClick: clearFilters } : undefined}
						/>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredTemplates.map((template) => (
								<TemplateCard key={template.id} template={template} />
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="discover" className="mt-0">
					{isLoadingPublic ? (
						<div className="flex justify-center py-12">
							<Loader />
						</div>
					) : filteredTemplates.length === 0 ? (
						<EmptyState
							icon={BookOpen}
							title={hasFilters ? "No plans found" : "No public plans available"}
							description={
								hasFilters ? "Try adjusting your search or filters" : "No public training plans have been shared yet"
							}
							action={hasFilters ? { label: "Clear Filters", onClick: clearFilters } : undefined}
						/>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredTemplates.map((template) => (
								<TemplateCard key={template.id} template={template} />
							))}
						</div>
					)}
				</TabsContent>

				<TabsContent value="bookmarked" className="mt-0">
					{isLoadingBookmarked ? (
						<div className="flex justify-center py-12">
							<Loader />
						</div>
					) : filteredTemplates.length === 0 ? (
						<EmptyState
							icon={BookOpen}
							title={hasFilters ? "No plans found" : "No bookmarked plans"}
							description={
								hasFilters
									? "Try adjusting your search or filters"
									: "You haven't bookmarked any training plans yet"
							}
							action={hasFilters ? { label: "Clear Filters", onClick: clearFilters } : undefined}
						/>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{filteredTemplates.map((template) => (
								<TemplateCard key={template.id} template={template} />
							))}
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div>
			<h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">{title}</h3>
			{children}
		</div>
	);
}

function FilterPill({ children, selected, onClick }: { children: React.ReactNode; selected: boolean; onClick: () => void }) {
	return (
		<button
			onClick={onClick}
			className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
				selected ? "bg-accent text-white" : "bg-white/5 text-muted hover:bg-white/10 hover:text-white"
			}`}>
			{children}
		</button>
	);
}
