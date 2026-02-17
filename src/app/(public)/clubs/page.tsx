"use client";

import { Button, FilterDropdown, Input, Loader } from "@/components";
import { Card, CardContent } from "@/components/ui/card";
import { ClubCard } from "@/components/features/clubs";
import { searchClubs } from "@/lib/api/clubs";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ArrowUpRight, MapPin, Search, Sun, Trophy, Users, X } from "lucide-react";
import Link from "next/link";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useCallback, useRef, useState } from "react";

// --- Configuration ---
const FILTERS = {
	level: {
		label: "Level",
		icon: Trophy,
		options: [
			{ value: "Beginner", label: "Beginner" },
			{ value: "Intermediate", label: "Intermediate" },
			{ value: "Advanced", label: "Advanced" },
			{ value: "Elite", label: "Elite" },
		],
	},
	surface: {
		label: "Type",
		icon: Sun,
		options: [
			{ value: "Indoor", label: "Indoor" },
			{ value: "Beach", label: "Beach" },
			{ value: "Grass", label: "Grass" },
		],
	},
	gender: {
		label: "Gender",
		icon: Users,
		options: [
			{ value: "Men", label: "Men" },
			{ value: "Women", label: "Women" },
			{ value: "Mixed", label: "Mixed" },
			{ value: "Juniors", label: "Juniors" },
		],
	},
};

const PAGE_SIZE = 20;

function useInfiniteScroll(fetchNextPage: () => void, hasNextPage: boolean | undefined, isFetchingNextPage: boolean) {
	const observerRef = useRef<IntersectionObserver | null>(null);

	const targetRef = useCallback(
		(node: HTMLDivElement | null) => {
			if (observerRef.current) observerRef.current.disconnect();
			if (!node) return;

			observerRef.current = new IntersectionObserver(
				(entries) => {
					if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
						fetchNextPage();
					}
				},
				{ rootMargin: "200px" }
			);
			observerRef.current.observe(node);
		},
		[fetchNextPage, hasNextPage, isFetchingNextPage]
	);

	return targetRef;
}

export default function ClubsDirectory() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selections, setSelections] = useState({
		level: [] as string[],
		surface: [] as string[],
		gender: [] as string[],
	});

	const debouncedSearch = useDebouncedValue(searchQuery, 300);

	const {
		data,
		isLoading,
		error,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
	} = useInfiniteQuery({
		queryKey: ["clubs", { query: debouncedSearch, isPublic: true }],
		queryFn: ({ pageParam }) =>
			searchClubs({ query: debouncedSearch || undefined, isPublic: true, cursor: pageParam, limit: PAGE_SIZE }),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
	});

	const loadMoreRef = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

	const clubs = data?.pages.flatMap((page) => page.items ?? []) || [];

	const handleFilterChange = (category: keyof typeof selections, values: string[]) => {
		setSelections((prev) => ({ ...prev, [category]: values }));
	};

	const totalActiveFilters = selections.level.length + selections.surface.length + selections.gender.length;

	const clearAllFilters = () => {
		setSelections({ level: [], surface: [], gender: [] });
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<Loader />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="alert alert-error max-w-md">
					<span>Error loading clubs. Please try again.</span>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen p-4 md:p-8 pb-20">
			{/* --- HEADER & SEARCH --- */}
			<div className="max-w-7xl mx-auto mb-10">
				<div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Discover Clubs</h1>
						<p className="text-base-content/60 text-sm mt-1">Find your team. Level up your game.</p>
					</div>
					<Link href="/clubs/create" className="link link-hover flex items-center gap-2 font-bold">
						Create Club <ArrowUpRight size={16} />
					</Link>
				</div>

				{/* Search Bar */}
				<div className="mb-6">
					<Input
						placeholder="Search by name or description..."
						leftIcon={<Search size={18} />}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>

				{/* --- FILTER ROW --- */}
				<div className="flex flex-wrap items-center gap-3">
					<div className="text-xs font-bold text-base-content/60 uppercase tracking-wider mr-2">Filters:</div>
					{(Object.keys(FILTERS) as Array<keyof typeof FILTERS>).map((key) => {
						const config = FILTERS[key];
						return (
							<FilterDropdown
								key={key}
								label={config.label}
								icon={config.icon}
								options={config.options}
								selected={selections[key]}
								onChange={(values) => handleFilterChange(key, values)}
							/>
						);
					})}
					{totalActiveFilters > 0 && (
						<button onClick={clearAllFilters} className="btn btn-ghost btn-xs gap-1 ml-auto">
							<X size={12} /> Reset All
						</button>
					)}
				</div>
			</div>

			{/* --- RESULTS GRID --- */}
			<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{clubs.map((club) => (
					<ClubCard key={club.id} club={club} />
				))}

				{/* "Add Your Club" Card */}
				<Card className="flex flex-col items-center justify-center text-center p-6 cursor-pointer border min-h-70 bg-transparent border-base-content/10 hover:border-accent/40">
					<CardContent className="flex flex-col items-center">
						<ArrowUpRight size={24} />
						<Link href="/clubs/create">
							<h3 className="text-lg font-bold mb-2">List your Club</h3>
							<p className="text-sm text-muted max-w-50">Recruit players and manage events.</p>
						</Link>
					</CardContent>
				</Card>
			</div>

			{/* Infinite scroll sentinel */}
			<div ref={loadMoreRef} className="flex justify-center py-8">
				{isFetchingNextPage && <Loader />}
			</div>
		</div>
	);
}
