"use client";

import { Avatar, Button, Input, Loader } from "@/components";
import { getClubs } from "@/lib/api/clubs";
import { Club } from "@/lib/models/Club";
import { useQuery } from "@tanstack/react-query";
import { Filter, Grid, List, MapPin, Plus, Search, Shield, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const VIEWS = [
	{ value: "grid", label: "Grid", icon: Grid },
	{ value: "list", label: "List", icon: List },
] as const;

type ViewType = (typeof VIEWS)[number]["value"];

export default function ClubsPageClient() {
	const [currentView, setCurrentView] = useState<ViewType>("grid");
	const [searchQuery, setSearchQuery] = useState("");

	const { data: clubs = [], isLoading } = useQuery({
		queryKey: ["clubs"],
		queryFn: getClubs,
	});

	const filteredClubs = clubs.filter((club) => club.name.toLowerCase().includes(searchQuery.toLowerCase()));

	return (
		<div className="h-full flex flex-col space-y-6">
			{/* Toolbar */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-neutral-900 backdrop-blur-md p-4 rounded-2xl border border-white/5">
				{/* Search & Filter */}
				<div className="flex gap-4">
					<Input placeholder="Find clubs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} leftIcon={<Search />} />
					<Button variant={"outline"} leftIcon={<Filter />}>
						<span className="hidden sm:inline">Filters</span>
					</Button>
				</div>

				{/* View Toggles & Action */}
				<div className="flex items-center gap-3 w-full sm:w-auto justify-end">
					{/* View Switcher */}
					<div className="flex p-1 bg-white/5 border border-white/10 rounded-xl">
						{VIEWS.map((view) => (
							<button
								key={view.value}
								onClick={() => setCurrentView(view.value)}
								className={`p-2 rounded-lg transition-all ${
									currentView === view.value ? "bg-white/10 text-white shadow-xs" : "text-muted hover:text-white hover:bg-white/5"
								}`}
								title={view.label}>
								<view.icon size={18} />
							</button>
						))}
					</div>

					<Link
						href="/clubs/create"
						className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-bold rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-95">
						<Plus size={18} />
						<span className="hidden sm:inline">Create Club</span>
					</Link>
				</div>
			</div>

			{/* Content Area */}
			<div className="flex-1 min-h-0">
				{isLoading ? (
					<div className="flex flex-col items-center justify-center h-64">
						<Loader />
						<div className="text-muted">Loading clubs...</div>
					</div>
				) : currentView === "grid" ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredClubs.map((club) => (
							<ClubGridCard key={club.id} club={club} />
						))}
						{filteredClubs.length === 0 && <EmptyState />}
					</div>
				) : (
					<ClubListView clubs={filteredClubs} />
				)}
			</div>
		</div>
	);
}

function ClubGridCard({ club }: { club: Club }) {
	return (
		<Link href={`/dashboard/clubs/${club.id}`} className="group block h-full">
			<div className="flex flex-col h-full rounded-2xl bg-white/5 border border-white/5 hover:border-accent/40 hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-300 shadow-xs hover:shadow-xl">
				{/* Banner */}
				<div className="h-24 bg-linear-to-br from-accent/20 via-primary/10 to-transparent relative overflow-hidden rounded-t-2xl">
					<div className="absolute inset-0 bg-linear-to-t from-background-dark/80 to-transparent" />
				</div>

				{/* Content */}
				<div className="p-5 flex-1 flex flex-col -mt-8 relative">
					{/* Logo */}
					<Avatar src={club.logoUrl || undefined} name={club.name} size="lg" className="mb-4" />

					<h3 className="font-bold text-white leading-tight mb-1 truncate group-hover:text-accent transition-colors">{club.name}</h3>

					{club.description && <p className="text-xs text-muted line-clamp-2 mb-3">{club.description}</p>}

					<div className="mt-auto pt-3 border-t border-white/5 flex items-center gap-3 text-xs text-muted">
						<span className="flex items-center gap-1">
							<Users size={12} />
							{club.memberCount || 0} members
						</span>
						{club.location && (
							<span className="flex items-center gap-1">
								<MapPin size={12} />
								{club.location}
							</span>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}

function ClubListView({ clubs }: { clubs: Club[] }) {
	if (clubs.length === 0) {
		return <EmptyState />;
	}

	return (
		<div className="space-y-3">
			{clubs.map((club) => (
				<Link
					key={club.id}
					href={`/dashboard/clubs/${club.id}`}
					className="group flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-accent/30 hover:bg-white/[0.07] transition-all">
					{/* Logo */}
					<Avatar src={club.logoUrl || undefined} name={club.name} size="md" />

					{/* Info */}
					<div className="flex-1 min-w-0">
						<h3 className="font-bold text-white truncate group-hover:text-accent transition-colors">{club.name}</h3>
						<div className="flex items-center gap-3 text-xs text-muted mt-1">
							<span className="flex items-center gap-1">
								<Users size={12} />
								{club.memberCount || 0} members
							</span>
							{club.location && (
								<span className="flex items-center gap-1">
									<MapPin size={12} />
									{club.location}
								</span>
							)}
						</div>
					</div>
				</Link>
			))}
		</div>
	);
}

function EmptyState() {
	return (
		<div className="col-span-full flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-2xl bg-white/2">
			<div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-muted">
				<Shield size={32} />
			</div>
			<h3 className="text-xl font-bold text-white mb-2">No clubs found</h3>
			<p className="text-muted max-w-sm mb-6">We couldn&apos;t find any clubs matching your search. Try adjusting filters or create a new one.</p>
			<div className="flex gap-4">
				<Button asChild variant={"outline"}>
					<Search size={16} />
					<Link href="/clubs">Find Club</Link>
				</Button>
				<Button asChild variant={"outline"}>
					<Plus size={16} />
					<Link href="/clubs/create">Create Club</Link>
				</Button>
			</div>
		</div>
	);
}
