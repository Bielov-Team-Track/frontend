"use client";

import {
	Club,
	ClubMember,
	ClubRole,
	Group,
	GroupMember,
	SkillLevel,
	UpdateGroupRequest,
} from "@/lib/models/Club";
import {
	addGroupMember,
	deleteGroup,
	getClub,
	getClubMembers,
	getGroup,
	removeGroupMember,
	updateGroup,
} from "@/lib/api/clubs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	AlertTriangle,
	ArrowLeft,
	Calendar,
	Check,
	Clock,
	Edit,
	Layers,
	MapPin,
	MessageSquare,
	Plus,
	Search,
	Settings,
	Shield,
	Trash2,
	UserMinus,
	UserPlus,
	Users,
	X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Predefined colors for groups
const GROUP_COLORS = [
	"#FF6B6B",
	"#4ECDC4",
	"#45B7D1",
	"#96CEB4",
	"#FFEAA7",
	"#DDA0DD",
	"#98D8C8",
	"#F7DC6F",
	"#BB8FCE",
	"#85C1E9",
	"#F1948A",
	"#82E0AA",
	"#F8C471",
	"#AED6F1",
	"#D7BDE2",
];

interface Props {
	groupId: string;
}

type TabType = "events" | "posts" | "members" | "settings";

// Mock Event interface (consistent with ClubDetailClient)
interface GroupEvent {
	id: string;
	name: string;
	description?: string;
	startTime: Date;
	endTime: Date;
	location?: string;
	createdAt: Date;
}

// Mock Post interface
interface GroupPost {
	id: string;
	authorName: string;
	content: string;
	createdAt: Date;
	likes: number;
	comments: number;
}

export default function GroupDetailClient({ groupId }: Props) {
	const [activeTab, setActiveTab] = useState<TabType>("events");
	const router = useRouter();

	const { data: group, isLoading: groupLoading } = useQuery({
		queryKey: ["group", groupId],
		queryFn: () => getGroup(groupId),
	});

	const { data: club } = useQuery({
		queryKey: ["club", group?.clubId],
		queryFn: () => getClub(group!.clubId),
		enabled: !!group?.clubId,
	});

	const { data: clubMembers = [] } = useQuery({
		queryKey: ["club-members", group?.clubId],
		queryFn: () => getClubMembers(group!.clubId),
		enabled: !!group?.clubId,
	});

	if (groupLoading) {
		return (
			<div className="flex items-center justify-center h-96">
				<span className="loading loading-spinner loading-lg text-accent" />
			</div>
		);
	}

	if (!group) {
		return (
			<div className="text-center py-20">
				<Layers className="w-16 h-16 text-muted mx-auto mb-4" />
				<h2 className="text-xl font-bold text-white mb-2">
					Group not found
				</h2>
				<Link
					href="/dashboard/clubs"
					className="text-accent hover:underline">
					Back to clubs
				</Link>
			</div>
		);
	}

	const tabs = [
		{ id: "events" as const, label: "Events", icon: Calendar },
		{ id: "posts" as const, label: "Posts", icon: MessageSquare },
		{
			id: "members" as const,
			label: "Members",
			icon: Users,
			count: group.members?.length || 0,
		},
		{ id: "settings" as const, label: "Settings", icon: Settings },
	];

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center gap-4">
				<Link
					href={`/dashboard/clubs/${group.clubId}`}
					className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
					<ArrowLeft size={20} />
				</Link>
				<div className="flex-1">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-bold text-white">
							{group.name}
						</h1>
						{group.skillLevel && (
							<span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-muted">
								{group.skillLevel}
							</span>
						)}
					</div>
					<div className="flex items-center gap-2 text-sm text-muted">
						<span>Group</span>
						<span>•</span>
						<Link
							href={`/dashboard/clubs/${group.clubId}`}
							className="hover:text-accent">
							{club?.name || "Loading club..."}
						</Link>
					</div>
				</div>
			</div>

			{/* Group Banner/Info */}
			<div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
				{/* Banner Area (using color) */}
				<div
					className="h-32 relative"
					style={{
						backgroundColor: group.color || "#6B7280",
						opacity: 0.8,
					}}>
					<div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
				</div>

				{/* Info Row */}
				<div className="p-6 flex items-center gap-6">
					{/* Icon */}
					<div
						className="w-24 h-24 rounded-xl border-4 border-background-light overflow-hidden -mt-12 relative z-10 flex items-center justify-center shadow-lg"
						style={{ backgroundColor: group.color || "#6B7280" }}>
						<Layers className="text-white w-10 h-10" />
					</div>

					{/* Details */}
					<div className="flex-1 min-w-0">
						<h2 className="text-xl font-bold text-white truncate">
							{group.name}
						</h2>
						{group.description && (
							<p className="text-sm text-muted truncate">
								{group.description}
							</p>
						)}
					</div>

					{/* Quick Stats */}
					<div className="flex gap-6">
						<div className="text-center">
							<div className="text-2xl font-bold text-white">
								{group.members?.length || 0}
							</div>
							<div className="text-xs text-muted">Members</div>
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className="border-t border-white/10 px-6">
					<div className="flex gap-1 overflow-x-auto no-scrollbar">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative whitespace-nowrap ${
									activeTab === tab.id
										? "text-accent"
										: "text-muted hover:text-white"
								}`}>
								<tab.icon size={16} />
								{tab.label}
								{tab.count !== undefined && (
									<span className="px-1.5 py-0.5 rounded-full bg-white/10 text-xs">
										{tab.count}
									</span>
								)}
								{activeTab === tab.id && (
									<span className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
								)}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Tab Content */}
			<div className="min-h-[400px]">
				{activeTab === "events" && <EventsTab />}
				{activeTab === "posts" && <PostsTab />}
				{activeTab === "members" && (
					<MembersTab
						group={group}
						clubMembers={clubMembers}
						groupId={groupId}
					/>
				)}
				{activeTab === "settings" && (
					<SettingsTab group={group} clubId={group.clubId} />
				)}
			</div>
		</div>
	);
}

// Events Tab
function EventsTab() {
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [events, setEvents] = useState<GroupEvent[]>([]);

	const handleCreateEvent = (event: Omit<GroupEvent, "id" | "createdAt">) => {
		const newEvent: GroupEvent = {
			...event,
			id: crypto.randomUUID(),
			createdAt: new Date(),
		};
		setEvents([newEvent, ...events]);
		setShowCreateModal(false);
	};

	const formatDateTime = (date: Date) => {
		return new Date(date).toLocaleDateString("en-US", {
			weekday: "short",
			month: "short",
			day: "numeric",
			hour: "numeric",
			minute: "2-digit",
		});
	};

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-bold text-white">Group Events</h3>
				<button
					onClick={() => setShowCreateModal(true)}
					className="btn bg-accent hover:bg-accent/90 text-white border-none gap-2">
					<Plus size={16} />
					Create Event
				</button>
			</div>

			{/* Events List */}
			{events.length === 0 ? (
				<EmptyState
					icon={Calendar}
					title="No events yet"
					description="Create events for your group members"
				/>
			) : (
				<div className="space-y-3">
					{events.map((event) => (
						<div
							key={event.id}
							className="rounded-xl bg-white/5 border border-white/10 p-4 hover:border-accent/30 transition-colors">
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1 min-w-0">
									<h4 className="font-bold text-white truncate">
										{event.name}
									</h4>
									{event.description && (
										<p className="text-sm text-muted line-clamp-2 mt-1">
											{event.description}
										</p>
									)}
									<div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted">
										<div className="flex items-center gap-1.5">
											<Clock size={14} />
											<span>
												{formatDateTime(
													event.startTime
												)}
											</span>
										</div>
										{event.location && (
											<div className="flex items-center gap-1.5">
												<MapPin size={14} />
												<span>{event.location}</span>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Create Event Modal */}
			{showCreateModal && (
				<CreateGroupEventModal
					onClose={() => setShowCreateModal(false)}
					onSubmit={handleCreateEvent}
				/>
			)}
		</div>
	);
}

// Posts Tab
function PostsTab() {
	const [posts, setPosts] = useState<GroupPost[]>([]);
	const [newPostContent, setNewPostContent] = useState("");

	const handlePostSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newPostContent.trim()) return;

		const newPost: GroupPost = {
			id: crypto.randomUUID(),
			authorName: "You", // Placeholder
			content: newPostContent,
			createdAt: new Date(),
			likes: 0,
			comments: 0,
		};
		setPosts([newPost, ...posts]);
		setNewPostContent("");
	};

	return (
		<div className="space-y-6">
			{/* Create Post */}
			<div className="rounded-2xl bg-white/5 border border-white/10 p-4">
				<form onSubmit={handlePostSubmit} className="space-y-3">
					<textarea
						value={newPostContent}
						onChange={(e) => setNewPostContent(e.target.value)}
						placeholder="Share something with the group..."
						rows={3}
						className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-muted/50 focus:outline-hidden focus:border-accent resize-none"
					/>
					<div className="flex justify-end">
						<button
							type="submit"
							disabled={!newPostContent.trim()}
							className="btn bg-accent hover:bg-accent/90 text-white border-none btn-sm disabled:opacity-50">
							Post
						</button>
					</div>
				</form>
			</div>

			{/* Posts Feed */}
			{posts.length === 0 ? (
				<EmptyState
					icon={MessageSquare}
					title="No posts yet"
					description="Be the first to post in this group"
				/>
			) : (
				<div className="space-y-4">
					{posts.map((post) => (
						<div
							key={post.id}
							className="rounded-2xl bg-white/5 border border-white/10 p-6">
							<div className="flex items-center gap-3 mb-4">
								<div className="w-10 h-10 rounded-full bg-background-light flex items-center justify-center text-sm font-bold text-muted">
									{post.authorName[0]}
								</div>
								<div>
									<div className="font-bold text-white">
										{post.authorName}
									</div>
									<div className="text-xs text-muted">
										{new Date(
											post.createdAt
										).toLocaleDateString()}{" "}
										at{" "}
										{new Date(
											post.createdAt
										).toLocaleTimeString([], {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</div>
								</div>
							</div>
							<p className="text-white whitespace-pre-wrap">
								{post.content}
							</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

// Members Tab
function MembersTab({
	group,
	clubMembers,
	groupId,
}: {
	group: Group;
	clubMembers: ClubMember[];
	groupId: string;
}) {
	const [showAddModal, setShowAddModal] = useState(false);
	const queryClient = useQueryClient();

	const addMemberMutation = useMutation({
		mutationFn: (userId: string) => addGroupMember(groupId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["group", groupId] });
			setShowAddModal(false);
		},
	});

	const removeMemberMutation = useMutation({
		mutationFn: (userId: string) => removeGroupMember(groupId, userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["group", groupId] });
		},
	});

	return (
		<div className="space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-bold text-white">
					Members ({group.members?.length || 0})
				</h3>
				<button
					onClick={() => setShowAddModal(true)}
					className="btn bg-accent hover:bg-accent/90 text-white border-none gap-2">
					<UserPlus size={16} />
					Add Member
				</button>
			</div>

			{/* Members List */}
			{(!group.members || group.members.length === 0) ? (
				<EmptyState
					icon={Users}
					title="No members yet"
					description="Add members to this group"
				/>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{group.members.map((member) => (
						<div
							key={member.id}
							className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-background-light flex items-center justify-center text-sm font-bold text-muted">
									{member.clubMember?.userProfile?.firstName?.[0] ||
										"?"}
								</div>
								<div>
									<div className="font-bold text-white">
										{member.clubMember?.userProfile
											?.firstName}{" "}
										{
											member.clubMember?.userProfile
												?.lastName
										}
									</div>
									<div className="text-xs text-muted">
										{member.role || "Member"}
									</div>
								</div>
							</div>
							<button
								onClick={() =>
									confirm(
										"Are you sure you want to remove this member?"
									) &&
									removeMemberMutation.mutate(
										member.clubMember!.userId
									)
								}
								className="p-2 rounded-lg hover:bg-red-500/20 text-muted hover:text-red-400 transition-colors">
								<UserMinus size={16} />
							</button>
						</div>
					))}
				</div>
			)}

			{/* Add Member Modal */}
			{showAddModal && (
				<AddGroupMemberModal
					clubMembers={clubMembers}
					currentMemberIds={
						group.members?.map((m) => m.clubMemberId) || []
					}
					onClose={() => setShowAddModal(false)}
					onAdd={(userId) => addMemberMutation.mutate(userId)}
					isLoading={addMemberMutation.isPending}
				/>
			)}
		</div>
	);
}

// Settings Tab
function SettingsTab({ group, clubId }: { group: Group; clubId: string }) {
	const queryClient = useQueryClient();
	const router = useRouter();

	const updateMutation = useMutation({
		mutationFn: (data: UpdateGroupRequest) =>
			updateGroup(group.id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["group", group.id] });
		},
	});

	const deleteMutation = useMutation({
		mutationFn: () => deleteGroup(group.id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["club-groups", clubId],
			});
			router.push(`/dashboard/clubs/${clubId}`);
		},
	});

	return (
		<div className="space-y-8">
			{/* General Settings */}
			<div className="space-y-6">
				<h3 className="text-lg font-bold text-white">Group Settings</h3>
				<GroupSettingsForm
					group={group}
					onSubmit={(data) => updateMutation.mutate(data)}
					isLoading={updateMutation.isPending}
				/>
			</div>

			{/* Danger Zone */}
			<div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6">
				<h3 className="text-lg font-bold text-red-400 mb-2">
					Danger Zone
				</h3>
				<p className="text-muted text-sm mb-4">
					Once you delete a group, there is no going back. Please be
					certain.
				</p>
				<button
					onClick={() => {
						if (
							confirm(
								"Are you sure you want to delete this group? This action cannot be undone."
							)
						) {
							deleteMutation.mutate();
						}
					}}
					disabled={deleteMutation.isPending}
					className="btn bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30">
					{deleteMutation.isPending ? (
						<span className="loading loading-spinner loading-sm" />
					) : (
						"Delete Group"
					)}
				</button>
			</div>
		</div>
	);
}

// Helper Components
function EmptyState({
	icon: Icon,
	title,
	description,
}: {
	icon: React.ElementType;
	title: string;
	description: string;
}) {
	return (
		<div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10">
			<Icon className="w-12 h-12 text-muted mx-auto mb-4" />
			<h4 className="text-lg font-bold text-white mb-2">{title}</h4>
			<p className="text-sm text-muted">{description}</p>
		</div>
	);
}

function CreateGroupEventModal({
	onClose,
	onSubmit,
}: {
	onClose: () => void;
	onSubmit: (event: Omit<GroupEvent, "id" | "createdAt">) => void;
}) {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [location, setLocation] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !startTime || !endTime) return;

		onSubmit({
			name: name.trim(),
			description: description.trim(),
			startTime: new Date(startTime),
			endTime: new Date(endTime),
			location: location.trim(),
		});
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-xs"
				onClick={onClose}
			/>
			<div className="relative w-full max-w-md rounded-2xl bg-background-light border border-white/10 shadow-2xl">
				<div className="flex items-center justify-between p-6 border-b border-white/10">
					<h3 className="text-lg font-bold text-white">Create Event</h3>
					<button
						onClick={onClose}
						className="p-2 rounded-lg hover:bg-white/10 transition-colors">
						<X size={18} className="text-muted" />
					</button>
				</div>
				<form onSubmit={handleSubmit} className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-medium text-muted mb-2">
							Event Name *
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
							className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-muted mb-2">
							Description
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={2}
							className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent resize-none"
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-medium text-muted mb-2">
								Start Time *
							</label>
							<input
								type="datetime-local"
								value={startTime}
								onChange={(e) => setStartTime(e.target.value)}
								required
								className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-muted mb-2">
								End Time *
							</label>
							<input
								type="datetime-local"
								value={endTime}
								onChange={(e) => setEndTime(e.target.value)}
								required
								className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent"
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-muted mb-2">
							Location
						</label>
						<input
							type="text"
							value={location}
							onChange={(e) => setLocation(e.target.value)}
							className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-hidden focus:border-accent"
						/>
					</div>
					<div className="flex gap-3 pt-4">
						<button
							type="button"
							onClick={onClose}
							className="flex-1 btn bg-white/5 hover:bg-white/10 border-white/10 text-white">
							Cancel
						</button>
						<button
							type="submit"
							className="flex-1 btn bg-accent hover:bg-accent/90 text-white border-none">
							Create Event
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

function AddGroupMemberModal({
	clubMembers,
	currentMemberIds,
	onClose,
	onAdd,
	isLoading,
}: {
	clubMembers: ClubMember[];
	currentMemberIds: string[];
	onClose: () => void;
	onAdd: (userId: string) => void;
	isLoading: boolean;
}) {
	const [searchQuery, setSearchQuery] = useState("");

	const filteredMembers = clubMembers
		.filter((member) => !currentMemberIds.includes(member.id))
		.filter((member) => {
			const name = `${member.userProfile?.firstName || ""} ${
				member.userProfile?.lastName || ""
			}`.toLowerCase();
			return name.includes(searchQuery.toLowerCase());
		});

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
			<div
				className="absolute inset-0 bg-black/60 backdrop-blur-xs"
				onClick={onClose}
			/>
			<div className="relative w-full max-w-lg rounded-2xl bg-background-light border border-white/10 shadow-2xl max-h-[80vh] flex flex-col">
				<div className="flex items-center justify-between p-6 border-b border-white/10">
					<h3 className="text-lg font-bold text-white">Add Member</h3>
					<button
						onClick={onClose}
						className="p-2 rounded-lg hover:bg-white/10 transition-colors">
						<X size={18} className="text-muted" />
					</button>
				</div>
				<div className="p-4 border-b border-white/10">
					<div className="relative">
						<Search
							className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
							size={18}
						/>
						<input
							type="text"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search club members..."
							className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-hidden focus:border-accent"
						/>
					</div>
				</div>
				<div className="flex-1 overflow-y-auto p-4 space-y-2">
					{filteredMembers.length === 0 ? (
						<div className="text-center py-8 text-muted">
							<p>No available members found</p>
						</div>
					) : (
						filteredMembers.map((member) => (
							<div
								key={member.id}
								className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-background-dark flex items-center justify-center text-sm font-bold text-muted">
										{member.userProfile?.firstName?.[0] ||
											"?"}
									</div>
									<div>
										<div className="text-sm font-medium text-white">
											{member.userProfile?.firstName}{" "}
											{member.userProfile?.lastName}
										</div>
										<div className="text-xs text-muted">
											{member.role}
										</div>
									</div>
								</div>
								<button
									onClick={() => onAdd(member.userId)}
									disabled={isLoading}
									className="p-2 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent transition-colors">
									<Plus size={18} />
								</button>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}

function GroupSettingsForm({
	group,
	onSubmit,
	isLoading,
}: {
	group: Group;
	onSubmit: (data: UpdateGroupRequest) => void;
	isLoading: boolean;
}) {
	const [name, setName] = useState(group.name);
	const [description, setDescription] = useState(group.description || "");
	const [color, setColor] = useState(group.color || GROUP_COLORS[0]);
	const [skillLevel, setSkillLevel] = useState<string>(
		group.skillLevel || ""
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) return;

		onSubmit({
			name: name.trim(),
			description: description.trim() || undefined,
			color,
			skillLevel: skillLevel || undefined,
		});
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-muted mb-2">
							Group Name
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-hidden focus:border-accent"
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-muted mb-2">
							Description
						</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							rows={3}
							className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-hidden focus:border-accent resize-none"
						/>
					</div>
				</div>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-muted mb-2">
							Skill Level
						</label>
						<select
							value={skillLevel}
							onChange={(e) => setSkillLevel(e.target.value)}
							className="w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-hidden focus:border-accent">
							<option value="">Select skill level</option>
							{Object.values(SkillLevel).map((level) => (
								<option key={level} value={level}>
									{level}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-muted mb-2">
							Color Theme
						</label>
						<div className="flex flex-wrap gap-2">
							{GROUP_COLORS.map((c) => (
								<button
									key={c}
									type="button"
									onClick={() => setColor(c)}
									className={`w-8 h-8 rounded-lg transition-all ${
										color === c
											? "ring-2 ring-white ring-offset-2 ring-offset-background-light scale-110"
											: "hover:scale-105"
									}`}
									style={{ backgroundColor: c }}>
									{color === c && (
										<Check
											size={16}
											className="text-white mx-auto"
										/>
									)}
								</button>
							))}
						</div>
					</div>
				</div>
			</div>
			<div className="flex justify-end pt-4 border-t border-white/10">
				<button
					type="submit"
					disabled={isLoading}
					className="btn bg-accent hover:bg-accent/90 text-white border-none">
					{isLoading ? (
						<span className="loading loading-spinner loading-sm" />
					) : (
						"Save Changes"
					)}
				</button>
			</div>
		</form>
	);
}
