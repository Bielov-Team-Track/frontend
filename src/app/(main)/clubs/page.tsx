"use client";

import { Avatar, Badge, Button, FilterDropdown, Input } from "@/components";
import { Card, CardContent } from "@/components/ui/card";
import { getClubs } from "@/lib/api/clubs";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ImageOff, MapPin, Search, Sun, Trophy, Users, X } from "lucide-react";
import Image from "next/image";
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
	// State for Selected Filters
	const [selections, setSelections] = useState({
		level: [] as string[],
		surface: [] as string[],
		gender: [] as string[],
	});

	// Fetch Clubs
	const {
		data: clubs,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["clubs"],
		queryFn: getClubs,
	});

	// Map API data to UI format
	const displayClubs =
		clubs?.map((club) => ({
			id: club.id,
			name: club.name,
			location: "Unknown",
			members: club.memberCount,
			banner: club.bannerUrl,
			logo: club.logoUrl,
			isVerified: false,
		})) || [];

	const handleFilterChange = (category: keyof typeof selections, values: string[]) => {
		setSelections((prev) => ({
			...prev,
			[category]: values,
		}));
	};

	const totalActiveFilters = selections.level.length + selections.surface.length + selections.gender.length;

	const clearAllFilters = () => {
		setSelections({
			level: [],
			surface: [],
			gender: [],
		});
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

					{/* Clear All Button */}
					{totalActiveFilters > 0 && (
						<button onClick={clearAllFilters} className="btn btn-ghost btn-xs gap-1 ml-auto">
							<X size={12} /> Reset All
						</button>
					)}
				</div>
			</div>

			{/* --- RESULTS GRID --- */}
			<div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{displayClubs.map((club) => (
					<ClubCard key={club.id} club={club} />
				))}

				{/* "Add Your Club" Card */}
				<Card className="flex flex-col items-center justify-center text-center p-6 cursor-pointer border min-h-70 bg-transparent border-base-content/10 hover:border-accent/40">
					<CardContent className="flex flex-col items-center ">
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

// Club Card Component
interface ClubData {
	id: string;
	name: string;
	location: string;
	members: number;
	level: string;
	surface: string;
	gender: string;
	banner?: string;
	logo?: string;
	isVerified: boolean;
}

function ClubCard({ club }: { club: ClubData }) {
	const [bannerError, setBannerError] = useState(false);

	return (
		<Link href={`/clubs/${club.id}`}>
			<Card>
				{/* Banner */}
				<figure className="h-28 relative bg-background">
					<div className="absolute inset-0 bg-linear-to-t from-card via-transparent to-transparent z-10" />
					{club.banner && !bannerError ? (
						<Image
							src={club.banner}
							alt={`${club.name} Banner`}
							width={400}
							height={200}
							className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
							onError={() => setBannerError(true)}
						/>
					) : (
						<div className="w-full h-full flex items-center justify-center text-base-content/20">
							<ImageOff className="text-muted" size={32} />
						</div>
					)}

					{/* Level Badge */}
					{club.level && (
						<div className="absolute top-3 right-3 z-20">
							<Badge variant={"secondary"}>{club.level}</Badge>
						</div>
					)}
				</figure>

				{/* Content */}
				<CardContent className="relative z-20 -mt-10">
					<div className="flex justify-between items-end mb-3">
						{/* Logo */}
						<div className="relative">
							<Avatar size="lg" variant="club" src={club.logo || undefined} name={club.name} />
							{club.isVerified && (
								<div className="absolute -bottom-1 -right-1 bg-primary text-primary-content p-0.5 rounded-full border-2 border-card">
									<Trophy size={10} />
								</div>
							)}
						</div>
					</div>

					<h3 className="card-title text-lg group-hover:text-accent transition-colors">{club.name}</h3>

					<div className="flex items-center gap-4 text-muted text-xs text-base-content/60">
						<span className="flex items-center gap-1">
							<MapPin size={12} /> {club.location}
						</span>
						<span className="w-1 h-1 rounded-full bg-base-content/30"></span>
						<span>{club.members} Members</span>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
