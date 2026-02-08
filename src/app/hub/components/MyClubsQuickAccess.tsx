"use client";

import { Avatar, Badge, Button } from "@/components";
import { Club, ClubRole } from "@/lib/models/Club";
import { ArrowRight, Plus, Shield } from "lucide-react";
import Link from "next/link";

interface ClubWithMeta extends Club {
	userRole?: ClubRole;
	pendingCount?: number;
}

interface MyClubsQuickAccessProps {
	clubs: ClubWithMeta[];
}

function getRoleBadgeVariant(role: ClubRole): "solid" | "soft" | "outline" {
	switch (role) {
		case ClubRole.Owner:
		case ClubRole.Admin:
			return "solid";
		case ClubRole.HeadCoach:
			return "soft";
		default:
			return "outline";
	}
}

function getRoleLabel(role: ClubRole): string {
	switch (role) {
		case ClubRole.Owner:
			return "Owner";
		case ClubRole.Admin:
			return "Admin";
		case ClubRole.HeadCoach:
			return "Head Coach";
		case ClubRole.Member:
			return "Player";
		default:
			return "Member";
	}
}

export function MyClubsQuickAccess({ clubs }: MyClubsQuickAccessProps) {
	if (clubs.length === 0) {
		return <EmptyState />;
	}

	const displayClubs = clubs.slice(0, 4);
	const hasMore = clubs.length > 4;

	return (
		<div className="rounded-2xl bg-surface border border-border p-6">
			{/* Header */}
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold text-white">My Clubs</h2>
				{hasMore && (
					<Link
						href="/hub/clubs"
						className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-1 group">
						View All
						<ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
					</Link>
				)}
			</div>

			{/* Clubs List */}
			<div className="space-y-2">
				{displayClubs.map((club) => (
					<Link
						key={club.id}
						href={`/hub/clubs/${club.id}`}
						className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border hover:bg-hover hover:border-accent/30 transition-all group">
						{/* Avatar with Pending Badge */}
						<div className="relative flex-shrink-0">
							<Avatar size="sm" src={club.logoUrl} name={club.name} variant="club" />
							{club.pendingCount && club.pendingCount > 0 && (
								<span className="absolute -top-1 -right-1 size-5 flex items-center justify-center bg-destructive text-white text-[10px] font-bold rounded-full ring-2 ring-background">
									{club.pendingCount > 9 ? "9+" : club.pendingCount}
								</span>
							)}
						</div>

						{/* Club Info */}
						<div className="flex-1 min-w-0">
							<div className="font-medium text-sm text-white group-hover:text-accent transition-colors truncate">
								{club.name}
							</div>
							{club.userRole && (
								<div className="text-xs text-muted mt-0.5">
									{getRoleLabel(club.userRole)}
								</div>
							)}
						</div>

						{/* Role Badge (Optional - shown on hover on larger screens) */}
						{club.userRole && (club.userRole === ClubRole.Owner || club.userRole === ClubRole.Admin) && (
							<Badge
								variant={getRoleBadgeVariant(club.userRole)}
								className="text-[10px] h-5 font-semibold bg-accent/20 text-accent border-accent/30 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex">
								{getRoleLabel(club.userRole)}
							</Badge>
						)}
					</Link>
				))}

				{/* Join Club CTA */}
				<Link
					href="/clubs"
					className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-border hover:border-accent/50 hover:bg-accent/5 transition-all group">
					<div className="size-10 rounded-lg bg-surface flex items-center justify-center group-hover:bg-accent/10 transition-colors flex-shrink-0">
						<Plus className="size-5 text-muted group-hover:text-accent transition-colors" />
					</div>
					<div className="flex-1">
						<div className="text-sm font-medium text-muted group-hover:text-accent transition-colors">
							Join a Club
						</div>
						<div className="text-xs text-muted/60 mt-0.5">
							Find clubs in your area
						</div>
					</div>
				</Link>
			</div>
		</div>
	);
}

function EmptyState() {
	return (
		<div className="rounded-2xl bg-surface border border-dashed border-border p-6">
			<div className="text-center py-6">
				<div className="size-12 rounded-xl bg-surface flex items-center justify-center mx-auto mb-4">
					<Shield className="size-6 text-muted" />
				</div>
				<h3 className="font-semibold text-white mb-1">Not a member of any clubs yet</h3>
				<p className="text-sm text-muted mb-4">Join a club to find games near you</p>
				<Button variant="outline" asChild leftIcon={<Plus className="size-4" />}>
					<Link href="/clubs">Browse Clubs</Link>
				</Button>
			</div>
		</div>
	);
}
