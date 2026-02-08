"use client";

import { Button, FilterDropdown, Input } from "@/components";
import { Card, CardContent } from "@/components/ui/card";
import { ClubCard } from "@/components/features/clubs";
import { getClubs } from "@/lib/api/clubs";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, MapPin, Search, Sun, Trophy, Users, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

export default function ClubsDirectory() {
	const [selections, setSelections] = useState({
		level: [] as string[],
		surface: [] as string[],
		gender: [] as string[],
	});

	const {
		data: clubs,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["clubs"],
		queryFn: getClubs,
	});

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
				<span className="loading loading-spinner loading-lg text-primary"></span>
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
						placeholder="Search by name, city, or league..."
						leftIcon={<Search size={18} />}
						rightIcon={
							<div className="hidden md:flex items-center gap-2">
								<Button variant="ghost" color="neutral" size="sm" leftIcon={<MapPin size={16} />}>
									Location
								</Button>
								<Button size="sm">Search</Button>
							</div>
						}
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
				{(clubs || []).map((club) => (
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
		</div>
	);
}
