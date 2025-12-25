"use client";

import { Badge, Button, Card, CardBody, FilterDropdown, Input } from "@/components";
import { getClubs } from "@/lib/api/clubs";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ImageOff, MapPin, Search, Shield, Sun, Trophy, Users, X } from "lucide-react";
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
			members: 0,
			level: "Social",
			surface: "Indoor",
			gender: "Mixed",
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
						size="lg"
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
				<Card
					variant="dash"
					hoverable
					className="flex flex-col items-center justify-center text-center p-6 cursor-pointer min-h-[280px] bg-transparent border-base-content/10 hover:border-accent/40">
					<CardBody className="items-center">
						<div className="w-12 h-12 rounded-full bg-base-content/5 flex items-center justify-center text-base-content/50 group-hover:bg-accent group-hover:text-white transition-colors mb-4">
							<ArrowUpRight size={24} />
						</div>
						<Link href="/clubs/create">
							<h3 className="text-lg font-bold mb-2">List your Club</h3>
							<p className="text-sm text-base-content/60 max-w-[200px]">Recruit players and manage events.</p>
						</Link>
					</CardBody>
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
	const [logoError, setLogoError] = useState(false);

	return (
		<Link href={`/clubs/${club.id}`}>
			<Card
				hoverable
				className="overflow-hidden border border-base-content/5 bg-base-100 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1">
				{/* Banner */}
				<figure className="h-28 relative bg-base-200">
					<div className="absolute inset-0 bg-linear-to-t from-base-100 via-transparent to-transparent z-10" />
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
							<ImageOff size={32} />
						</div>
					)}

					{/* Level Badge */}
					<div className="absolute top-3 right-3 z-20">
						<Badge variant="soft" color="neutral" size="xs">
							{club.level}
						</Badge>
					</div>
				</figure>

				{/* Content */}
				<CardBody className="relative z-20 -mt-10">
					<div className="flex justify-between items-end mb-3">
						{/* Logo */}
						<div className="relative">
							<div className="w-16 h-16 rounded-xl bg-base-200 border-4 border-base-100 overflow-hidden flex items-center justify-center">
								{club.logo && !logoError ? (
									<Image
										src={club.logo}
										alt={`${club.name} Logo`}
										width={64}
										height={64}
										className="w-full h-full object-cover"
										onError={() => setLogoError(true)}
									/>
								) : (
									<Shield className="text-base-content/30 w-8 h-8" />
								)}
							</div>
							{club.isVerified && (
								<div className="absolute -bottom-1 -right-1 bg-primary text-primary-content p-0.5 rounded-full border-2 border-base-100">
									<Trophy size={10} />
								</div>
							)}
						</div>
					</div>

					<h3 className="card-title text-lg group-hover:text-accent transition-colors">{club.name}</h3>

					<div className="flex items-center gap-4 text-xs text-base-content/60 mb-4">
						<span className="flex items-center gap-1">
							<MapPin size={12} /> {club.location}
						</span>
						<span className="w-1 h-1 rounded-full bg-base-content/30"></span>
						<span>{club.members} Members</span>
					</div>

					{/* Tags Row */}
					<div className="flex flex-wrap gap-2 pt-3 border-t border-base-content/5">
						<Badge variant="ghost" color="neutral" size="xs" icon={<Sun size={10} />}>
							{club.surface}
						</Badge>
						<Badge variant="ghost" color="neutral" size="xs" icon={<Users size={10} />}>
							{club.gender}
						</Badge>
					</div>
				</CardBody>
			</Card>
		</Link>
	);
}
