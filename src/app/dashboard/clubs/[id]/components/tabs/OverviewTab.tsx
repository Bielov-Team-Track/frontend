"use client";

import { Button } from "@/components";
import { Club, ClubMember, ClubRole, Group, Team } from "@/lib/models/Club";
import { Layers, Mail, MapPin, Phone, UserPlus, Users } from "lucide-react";

// Helper to extract role strings from role objects or strings
function extractRoleStrings(roles: any[] | undefined): string[] {
	if (!roles) return [];
	return roles.map((r) => (typeof r === "string" ? r : r?.role)).filter(Boolean);
}

interface OverviewTabProps {
	club: Club;
	members: ClubMember[];
	teams: Team[];
	groups: Group[];
	onInvite: () => void;
}

export default function OverviewTab({ club, members, teams, groups, onInvite }: OverviewTabProps) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{/* Club Info Card */}
			<div className="lg:col-span-2 space-y-6">
				<div className="rounded-2xl bg-surface border border-border p-6">
					<h3 className="text-lg font-bold text-white mb-4">Club Information</h3>
					<div className="space-y-4">
						{club.description && <p className="text-muted text-sm">{club.description}</p>}
						<div className="grid grid-cols-2 gap-4">
							{club.contactEmail && (
								<div className="flex items-center gap-3 text-sm">
									<Mail className="text-muted" size={16} />
									<span className="text-white">{club.contactEmail}</span>
								</div>
							)}
							{club.contactPhone && (
								<div className="flex items-center gap-3 text-sm">
									<Phone className="text-muted" size={16} />
									<span className="text-white">{club.contactPhone}</span>
								</div>
							)}
							{club.location && (
								<div className="flex items-center gap-3 text-sm">
									<MapPin className="text-muted" size={16} />
									<span className="text-white">{club.location}</span>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Recent Activity */}
				<div className="rounded-2xl bg-surface border border-border p-6">
					<h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
					<div className="text-center py-8 text-muted">
						<p>No recent activity</p>
					</div>
				</div>
			</div>

			{/* Quick Actions */}
			<div className="space-y-6">
				<div className="rounded-2xl bg-surface border border-border p-6">
					<h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
					<div className="space-y-2">
						<Button variant="ghost" color="neutral" fullWidth onClick={onInvite} leftIcon={<UserPlus size={16} />} className="justify-start">
							Invite Member
						</Button>
						<Button variant="ghost" color="neutral" fullWidth leftIcon={<Users size={16} />} className="justify-start">
							Create Team
						</Button>
						<Button variant="ghost" color="neutral" fullWidth leftIcon={<Layers size={16} />} className="justify-start">
							Create Group
						</Button>
					</div>
				</div>

				{/* Role Distribution */}
				<div className="rounded-2xl bg-surface border border-border p-6">
					<h3 className="text-lg font-bold text-white mb-4">Role Distribution</h3>
					<div className="space-y-3">
						{Object.values(ClubRole).map((role) => {
							const count = members.filter((m) => extractRoleStrings(m.roles).includes(role)).length;
							return (
								<div key={role} className="flex items-center justify-between">
									<span className="text-sm text-muted">{role}</span>
									<span className="text-sm font-medium text-white">{count}</span>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
}
