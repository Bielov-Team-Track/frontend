"use client";

import { Avatar, Button } from "@/components";
import { Group, Team } from "@/lib/models/Club";
import { FullProfileDto, getDominantHandLabel, getSkillLevelLabel, getVolleyballPositionLabel } from "@/lib/models/Profile";
import { getClubMembers, getGroupsByClub, getTeamsByClub } from "@/lib/api/clubs";
import { getFullUserProfile } from "@/lib/api/user";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, Dumbbell, History, Layers, Mail, Medal, Trophy, User, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Props {
	clubId: string;
	memberId: string;
	clubName: string;
}

type TabType = "overview" | "history" | "teams";

const TABS = [
	{ id: "overview" as const, label: "Overview", icon: User },
	{ id: "history" as const, label: "History", icon: History },
	{ id: "teams" as const, label: "Teams & Groups", icon: Users, showCount: true },
];

export default function ClubMemberDetailClient({ clubId, memberId, clubName }: Props) {
	const [activeTab, setActiveTab] = useState<TabType>("overview");

	// Queries
	const { data: profile, isLoading: profileLoading } = useQuery({
		queryKey: ["user-full-profile", memberId],
		queryFn: () => getFullUserProfile(memberId),
	});

	const { data: members = [] } = useQuery({
		queryKey: ["club-members", clubId],
		queryFn: () => getClubMembers(clubId),
	});

	const { data: teams = [] } = useQuery({
		queryKey: ["club-teams", clubId],
		queryFn: () => getTeamsByClub(clubId),
	});

	const { data: groups = [] } = useQuery({
		queryKey: ["club-groups", clubId],
		queryFn: () => getGroupsByClub(clubId),
	});

	const clubMember = members.find((m) => m.userId === memberId);

	const userTeams = teams.filter((t) => t.members?.some((m) => m.userId === memberId));

	const userGroups = groups.filter((g) => g.members?.some((m) => m.clubMemberId === clubMember?.id));

	if (profileLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<span className="loading loading-spinner loading-lg text-accent" />
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="text-center py-20">
				<User className="w-16 h-16 text-muted mx-auto mb-4" />
				<h2 className="text-xl font-bold text-white mb-2">Member not found</h2>
				<Button variant="link" color="accent" onClick={() => window.history.back()}>
					Go Back
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<MemberHeader profile={profile} clubName={clubName} clubId={clubId} role={clubMember?.role} />

			{/* Banner Card */}
			<MemberBannerCard
				profile={profile}
				clubMember={clubMember}
				activeTab={activeTab}
				onTabChange={setActiveTab}
				teamsCount={userTeams.length}
				groupsCount={userGroups.length}
			/>

			{/* Tab Content */}
			<div className="min-h-[300px] animate-in fade-in duration-300">
				{activeTab === "overview" && <OverviewTab profile={profile} />}
				{activeTab === "history" && <HistoryTab history={profile.historyEntries || []} />}
				{activeTab === "teams" && <TeamsGroupsTab teams={userTeams} groups={userGroups} />}
			</div>
		</div>
	);
}

// Sub-components

function MemberHeader({ profile, clubName, clubId, role }: { profile: FullProfileDto; clubName: string; clubId: string; role?: string }) {
	return (
		<div className="flex items-center gap-4">
			<Link href={`/dashboard/clubs/${clubId}`} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
				<ArrowLeft size={20} />
			</Link>
			<div className="flex-1">
				<div className="flex items-center gap-3">
					<h1 className="text-2xl font-bold text-white">
						{profile.name} {profile.surname}
					</h1>
					{role && <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-muted uppercase">{role}</span>}
				</div>
				<div className="flex items-center gap-2 text-sm text-muted">
					<span>Member</span>
					<span>•</span>
					<Link href={`/dashboard/clubs/${clubId}`} className="hover:text-accent">
						{clubName}
					</Link>
				</div>
			</div>
		</div>
	);
}

interface MemberBannerCardProps {
	profile: FullProfileDto;
	clubMember: any;
	activeTab: TabType;
	onTabChange: (tab: TabType) => void;
	teamsCount: number;
	groupsCount: number;
}

function MemberBannerCard({ profile, clubMember, activeTab, onTabChange, teamsCount, groupsCount }: MemberBannerCardProps) {
	return (
		<div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
			{/* Banner Area */}
			<div className="h-32 relative bg-gradient-to-r from-accent/20 to-primary/20">
				<div className="absolute inset-0 bg-black/10" />
			</div>

			{/* Info Row */}
			<div className="p-6 flex items-center gap-6">
				{/* Avatar */}
				<div className="w-24 h-24 rounded-xl bg-background-dark border-4 border-background-light overflow-hidden -mt-12 relative z-10 flex items-center justify-center shadow-lg">
					<Avatar profile={profile} size="large" />
				</div>

				{/* Details */}
				<div className="flex-1 min-w-0">
					<h2 className="text-xl font-bold text-white truncate">
						{profile.name} {profile.surname}
					</h2>
					<div className="flex flex-wrap items-center gap-4 text-sm text-muted mt-1">
						{profile.email && (
							<div className="flex items-center gap-1.5">
								<Mail size={14} />
								<span>{profile.email}</span>
							</div>
						)}
						{clubMember?.createdAt && (
							<div className="flex items-center gap-1.5">
								<Calendar size={14} />
								<span>Joined {new Date(clubMember.createdAt).toLocaleDateString()}</span>
							</div>
						)}
					</div>
				</div>

				{/* Quick Stats */}
				<div className="flex gap-6">
					<StatItem label="Teams" value={teamsCount} />
					<StatItem label="Groups" value={groupsCount} />
				</div>
			</div>

			{/* Tabs */}
			<div className="border-t border-white/10 px-6">
				<div className="flex gap-1 overflow-x-auto no-scrollbar">
					{TABS.map((tab) => {
						const count = tab.showCount ? teamsCount + groupsCount : undefined;
						return (
							<button
								key={tab.id}
								onClick={() => onTabChange(tab.id)}
								className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
									activeTab === tab.id ? "text-accent" : "text-muted hover:text-white"
								}`}>
								<tab.icon size={16} />
								{tab.label}
								{count !== undefined && count > 0 && <span className="px-1.5 py-0.5 rounded-full bg-white/10 text-xs">{count}</span>}
								{activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />}
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}

function StatItem({ label, value }: { label: string; value: number | string }) {
	return (
		<div className="text-center">
			<div className="text-2xl font-bold text-white">{value}</div>
			<div className="text-xs text-muted">{label}</div>
		</div>
	);
}

function InfoCard({ title, icon: Icon, children, className = "" }: { title: string; icon?: React.ElementType; children: React.ReactNode; className?: string }) {
	return (
		<div className={`rounded-xl bg-white/5 border border-white/10 p-6 ${className}`}>
			<div className="flex items-center gap-3 mb-6">
				{Icon && (
					<div className="p-2 rounded-lg bg-accent/10 text-accent">
						<Icon size={20} />
					</div>
				)}
				<h3 className="text-lg font-bold text-white">{title}</h3>
			</div>
			{children}
		</div>
	);
}

function StatRowItem({ label, value }: { label: string; value: string | React.ReactNode }) {
	return (
		<div className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
			<div className="text-xs text-muted mb-1 uppercase tracking-wide">{label}</div>
			<div className="font-medium text-white text-lg">{value}</div>
		</div>
	);
}

function OverviewTab({ profile }: { profile: FullProfileDto }) {
	const { playerProfile, coachProfile } = profile;

	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
			{profile.bio && (
				<InfoCard title="About" icon={User} className="lg:col-span-2">
					<p className="text-muted leading-relaxed whitespace-pre-line">{profile.bio}</p>
				</InfoCard>
			)}

			{playerProfile ? (
				<InfoCard title="Player Profile" icon={Trophy}>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<StatRowItem label="Position" value={getVolleyballPositionLabel(playerProfile.preferredPosition) || "Not set"} />
							<StatRowItem label="Height" value={playerProfile.heightCm ? `${playerProfile.heightCm} cm` : "-"} />
							<StatRowItem label="Dominant Hand" value={getDominantHandLabel(playerProfile.dominantHand)} />
							<StatRowItem label="Vertical Jump" value={playerProfile.verticalJumpCm ? `${playerProfile.verticalJumpCm} cm` : "-"} />
						</div>
						<div className="mt-4 pt-4 border-t border-white/10">
							<div className="text-sm text-muted mb-2">Highest Level Played</div>
							<div className="inline-block px-3 py-1 rounded-full bg-accent/20 text-accent text-sm font-medium">
								{getSkillLevelLabel(playerProfile.highestLevelPlayed)}
							</div>
						</div>
					</div>
				</InfoCard>
			) : (
				<div className="rounded-xl bg-white/5 border border-white/10 p-10 flex flex-col items-center justify-center text-center text-muted">
					<Dumbbell size={48} className="mb-4 opacity-20" />
					<p>No player profile available</p>
				</div>
			)}

			{coachProfile ? (
				<InfoCard title="Coach Profile" icon={Medal}>
					<div className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<StatRowItem label="Experience" value={coachProfile.yearsOfExperience ? `${coachProfile.yearsOfExperience} years` : "-"} />
							<StatRowItem label="Highest Level" value={getSkillLevelLabel(coachProfile.highestLevelCoached)} />
						</div>

						{coachProfile.qualifications && coachProfile.qualifications.length > 0 && (
							<div className="mt-4">
								<div className="text-xs text-muted mb-2 uppercase tracking-wide">Qualifications</div>
								<div className="space-y-2">
									{coachProfile.qualifications.map((qual) => (
										<div key={qual.id} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
											<span className="text-white font-medium">{qual.name}</span>
											<span className="text-muted text-sm bg-white/10 px-2 py-0.5 rounded">{qual.year}</span>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				</InfoCard>
			) : (
				<div className="rounded-xl bg-white/5 border border-white/10 p-10 flex flex-col items-center justify-center text-center text-muted">
					<Medal size={48} className="mb-4 opacity-20" />
					<p>No coach profile available</p>
				</div>
			)}
		</div>
	);
}

function HistoryTab({ history }: { history: any[] }) {
	if (history.length === 0) {
		return (
			<div className="text-center py-20 rounded-xl bg-white/5 border border-white/10">
				<History className="w-16 h-16 text-muted mx-auto mb-4 opacity-50" />
				<h3 className="text-lg font-bold text-white mb-2">No History Recorded</h3>
				<p className="text-sm text-muted">This member hasn&apos;t added any volleyball career history yet.</p>
			</div>
		);
	}

	const sortedHistory = [...history].sort((a, b) => b.year - a.year);

	return (
		<div className="rounded-xl bg-white/5 border border-white/10 p-6 md:p-8">
			<h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
				<History size={20} className="text-accent" />
				Career Timeline
			</h3>
			<div className="space-y-8 relative pl-4 md:pl-0">
				{/* Vertical Line */}
				<div className="absolute left-4 md:left-[120px] top-2 bottom-2 w-px bg-gradient-to-b from-accent/50 to-transparent" />

				{sortedHistory.map((entry) => (
					<div key={entry.id} className="relative flex flex-col md:flex-row gap-6 md:items-start group">
						{/* Year Badge */}
						<div className="md:w-[120px] md:text-right flex-shrink-0 relative z-10 pl-8 md:pl-0">
							<span className="inline-block px-3 py-1 rounded-full bg-background-dark border border-accent/30 text-accent font-bold shadow-sm group-hover:scale-105 transition-transform">
								{entry.year}
							</span>
							{/* Dot on line */}
							<div className="absolute left-[-5px] md:left-[115px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-accent ring-4 ring-background-dark" />
						</div>

						{/* Content Card */}
						<div className="flex-1 p-5 rounded-xl bg-white/5 border border-white/5 hover:border-accent/30 hover:bg-white/10 transition-all">
							<div className="flex items-start justify-between gap-4">
								<div>
									<h4 className="font-bold text-xl text-white mb-1">{entry.clubName}</h4>
									{entry.teamName && <p className="text-white/80 font-medium mb-2">{entry.teamName}</p>}
									<div className="flex flex-wrap gap-2 mt-3">
										<span className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/10 text-white/90 border border-white/5">
											Role: {entry.role}
										</span>
										{entry.positions?.map((pos: any) => (
											<span
												key={pos}
												className="px-2.5 py-1 rounded-md text-xs font-medium bg-accent/10 text-accent border border-accent/10">
												{getVolleyballPositionLabel(pos)}
											</span>
										))}
									</div>
								</div>
								{entry.clubLogoUrl && (
									// eslint-disable-next-line @next/next/no-img-element
									<img src={entry.clubLogoUrl} alt={entry.clubName} className="w-16 h-16 rounded-lg object-contain bg-white/10 p-1" />
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

function TeamsGroupsTab({ teams, groups }: { teams: Team[]; groups: Group[] }) {
	return (
		<div className="space-y-8">
			<div>
				<h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
					<Users size={20} className="text-accent" />
					Teams ({teams.length})
				</h3>
				{teams.length === 0 ? (
					<div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center text-muted">
						<p>Not a member of any team in this club.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{teams.map((team) => (
							<Link
								key={team.id}
								href={`/dashboard/teams/${team.id}`}
								className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-accent/50 hover:bg-white/10 transition-all flex items-center gap-4">
								<div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 group-hover:scale-105 transition-transform">
									{team.logoUrl ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img src={team.logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
									) : (
										<Users className="text-muted/50" />
									)}
								</div>
								<div>
									<div className="font-bold text-white group-hover:text-accent transition-colors">{team.name}</div>
									<div className="text-xs text-muted mt-1">{team.skillLevel || "No Level Specified"}</div>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>

			<div>
				<h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
					<Layers size={20} className="text-accent" />
					Groups ({groups.length})
				</h3>
				{groups.length === 0 ? (
					<div className="p-8 rounded-xl bg-white/5 border border-white/10 text-center text-muted">
						<p>Not a member of any group in this club.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{groups.map((group) => (
							<Link
								key={group.id}
								href={`/dashboard/groups/${group.id}`}
								className="group p-4 rounded-xl bg-white/5 border border-white/10 hover:border-accent/50 hover:bg-white/10 transition-all flex items-center gap-4">
								<div
									className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform"
									style={{
										backgroundColor: group.color || "#6B7280",
									}}>
									<Layers className="text-white drop-shadow-md" />
								</div>
								<div>
									<div className="font-bold text-white group-hover:text-accent transition-colors">{group.name}</div>
									<div className="text-xs text-muted mt-1">{group.skillLevel || "No Level Specified"}</div>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
