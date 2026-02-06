"use client";

import { Avatar, Button, EmptyState, Loader } from "@/components";
import { ClubCard } from "@/components/features/clubs";
import { ListToolbar, ViewMode } from "@/components/ui/list-toolbar";
import { getUserClubs } from "@/lib/api/clubs";
import { Club } from "@/lib/models/Club";
import { useAuth } from "@/providers";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Plus, Search, Shield, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ClubsPageClient() {
	const [search, setSearch] = useState("");
	const [viewMode, setViewMode] = useState<ViewMode>("grid");
	const { userProfile } = useAuth();

	const { data: clubs = [], isLoading } = useQuery({
		queryKey: ["my-clubs"],
		queryFn: () => getUserClubs(userProfile?.id!),
		enabled: !!userProfile?.id,
	});

	const filteredClubs = clubs.filter((club) => club.name.toLowerCase().includes(search.toLowerCase()));

	return (
		<div className="h-full flex flex-col space-y-6">
			{/* Header Row */}
			<div className="flex items-center justify-between shrink-0">
				<h2 className="text-lg font-semibold text-foreground">My Clubs</h2>
				<div className="flex items-center gap-2">
					<Button asChild variant="outline" leftIcon={<Search size={16} />}>
						<Link href="/clubs">Find Club</Link>
					</Button>
					<Button asChild leftIcon={<Plus size={16} />}>
						<Link href="/clubs/create">Create Club</Link>
					</Button>
				</div>
			</div>

			{/* Toolbar */}
			<ListToolbar
				search={search}
				onSearchChange={setSearch}
				searchPlaceholder="Search clubs..."
				count={filteredClubs.length}
				itemLabel="club"
				viewMode={viewMode}
				onViewModeChange={setViewMode}
				showViewToggle={true}
			/>

			{/* Content Area */}
			<div className="flex-1 min-h-0">
				{isLoading ? (
					<div className="flex flex-col items-center justify-center h-64">
						<Loader />
						<div className="text-muted-foreground">Loading clubs...</div>
					</div>
				) : filteredClubs.length === 0 ? (
					<EmptyState
						icon={Shield}
						title="No clubs found"
						description="We couldn't find any clubs matching your search. Try adjusting filters or create a new one."
					/>
				) : viewMode === "grid" ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredClubs.map((club) => (
							<ClubCard key={club.id} club={club} href={`/dashboard/clubs/${club.id}`} />
						))}
					</div>
				) : (
					<ClubListView clubs={filteredClubs} />
				)}
			</div>
		</div>
	);
}

function ClubListView({ clubs }: { clubs: Club[] }) {
	return (
		<div className="space-y-3">
			{clubs.map((club) => (
				<Link
					key={club.id}
					href={`/dashboard/clubs/${club.id}`}
					className="group flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-accent/30 transition-all">
					<Avatar src={club.logoUrl || undefined} name={club.name} size="md" />
					<div className="flex-1 min-w-0">
						<h3 className="font-bold text-foreground truncate group-hover:text-accent transition-colors">{club.name}</h3>
						<div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
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
