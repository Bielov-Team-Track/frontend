"use client";

import { useState } from "react";

// Mock user data
const MOCK_USERS = [
	{ id: "1", name: "Alex Rivera", email: "alex.rivera@email.com", avatar: null, club: "Beach Wolves", group: "Advanced", team: "Team Alpha" },
	{ id: "2", name: "Jordan Chen", email: "jordan.chen@email.com", avatar: null, club: "Beach Wolves", group: "Advanced", team: "Team Alpha" },
	{ id: "3", name: "Sam Williams", email: "sam.williams@email.com", avatar: null, club: "Beach Wolves", group: "Intermediate", team: "Team Beta" },
	{ id: "4", name: "Taylor Brooks", email: "taylor.brooks@email.com", avatar: null, club: "Beach Wolves", group: "Intermediate", team: "Team Beta" },
	{ id: "5", name: "Morgan Davis", email: "morgan.davis@email.com", avatar: null, club: "Sunset Spikers", group: "Beginner", team: "Team Gamma" },
	{ id: "6", name: "Casey Martinez", email: "casey.martinez@email.com", avatar: null, club: "Sunset Spikers", group: "Beginner", team: "Team Gamma" },
	{ id: "7", name: "Riley Johnson", email: "riley.johnson@email.com", avatar: null, club: "Sunset Spikers", group: "Advanced", team: "Team Delta" },
	{ id: "8", name: "Avery Thompson", email: "avery.thompson@email.com", avatar: null, club: "Coastal Crew", group: "Advanced", team: "Team Epsilon" },
	{ id: "9", name: "Quinn Anderson", email: "quinn.anderson@email.com", avatar: null, club: "Coastal Crew", group: "Intermediate", team: "Team Zeta" },
	{ id: "10", name: "Drew Wilson", email: "drew.wilson@email.com", avatar: null, club: "Coastal Crew", group: "Beginner", team: null },
	{ id: "11", name: "Blake Garcia", email: "blake.garcia@email.com", avatar: null, club: "Beach Wolves", group: "Advanced", team: "Team Alpha" },
	{ id: "12", name: "Reese Miller", email: "reese.miller@email.com", avatar: null, club: "Beach Wolves", group: "Intermediate", team: null },
];

const CLUBS = ["Beach Wolves", "Sunset Spikers", "Coastal Crew"];
const GROUPS = ["Beginner", "Intermediate", "Advanced"];
const TEAMS = ["Team Alpha", "Team Beta", "Team Gamma", "Team Delta", "Team Epsilon", "Team Zeta"];

type User = (typeof MOCK_USERS)[0];

// Generate avatar color from name
function stringToColor(str: string): string {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = str.charCodeAt(i) + ((hash << 5) - hash);
	}
	const hue = Math.abs(hash % 360);
	return `hsl(${hue}, 55%, 45%)`;
}

function getInitials(name: string): string {
	return name
		.split(" ")
		.map((w) => w[0])
		.join("")
		.toUpperCase()
		.slice(0, 2);
}

// Shared Avatar component
function UserAvatar({ user, size = "md" }: { user: User; size?: "sm" | "md" | "lg" }) {
	const sizeClasses = {
		sm: "w-8 h-8 text-xs",
		md: "w-10 h-10 text-sm",
		lg: "w-12 h-12 text-base",
	};
	return (
		<div
			className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium text-white shrink-0`}
			style={{ backgroundColor: stringToColor(user.name) }}>
			{getInitials(user.name)}
		</div>
	);
}

// Shared filter/search bar
function FilterBar({
	search,
	setSearch,
	club,
	setClub,
	group,
	setGroup,
	team,
	setTeam,
	compact = false,
}: {
	search: string;
	setSearch: (v: string) => void;
	club: string;
	setClub: (v: string) => void;
	group: string;
	setGroup: (v: string) => void;
	team: string;
	setTeam: (v: string) => void;
	compact?: boolean;
}) {
	return (
		<div className={`space-y-3 ${compact ? "" : "mb-4"}`}>
			<div className="relative">
				<svg
					className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input
					type="text"
					placeholder="Search by name or email..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/30 transition-all"
				/>
				{search && (
					<button
						onClick={() => setSearch("")}
						className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				)}
			</div>
			<div className={`grid ${compact ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3"} gap-2`}>
				<select
					value={club}
					onChange={(e) => setClub(e.target.value)}
					className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors cursor-pointer">
					<option value="">All Clubs</option>
					{CLUBS.map((c) => (
						<option key={c} value={c}>
							{c}
						</option>
					))}
				</select>
				<select
					value={group}
					onChange={(e) => setGroup(e.target.value)}
					className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors cursor-pointer">
					<option value="">All Groups</option>
					{GROUPS.map((g) => (
						<option key={g} value={g}>
							{g}
						</option>
					))}
				</select>
				<select
					value={team}
					onChange={(e) => setTeam(e.target.value)}
					className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors cursor-pointer">
					<option value="">All Teams</option>
					{TEAMS.map((t) => (
						<option key={t} value={t}>
							{t}
						</option>
					))}
				</select>
			</div>
		</div>
	);
}

// Filter users helper
function filterUsers(users: User[], search: string, club: string, group: string, team: string): User[] {
	return users.filter((u) => {
		const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
		const matchClub = !club || u.club === club;
		const matchGroup = !group || u.group === group;
		const matchTeam = !team || u.team === team;
		return matchSearch && matchClub && matchGroup && matchTeam;
	});
}

// =============================================================================
// VARIATION 1: Split Panel Layout
// Fixed 2-column layout - selected always visible on right
// =============================================================================
function SplitPanelVariation() {
	const [selected, setSelected] = useState<User[]>([]);
	const [search, setSearch] = useState("");
	const [club, setClub] = useState("");
	const [group, setGroup] = useState("");
	const [team, setTeam] = useState("");

	const filtered = filterUsers(MOCK_USERS, search, club, group, team);

	const toggle = (user: User) => {
		setSelected((prev) => (prev.find((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user]));
	};

	const isSelected = (id: string) => selected.some((u) => u.id === id);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-0 border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950 min-h-[480px]">
			{/* Left: Search & List */}
			<div className="p-4 border-r border-neutral-800">
				<FilterBar search={search} setSearch={setSearch} club={club} setClub={setClub} group={group} setGroup={setGroup} team={team} setTeam={setTeam} />

				<div className="mt-4 space-y-1 max-h-[340px] overflow-y-auto pr-2 scrollbar-thin">
					{filtered.map((user) => (
						<button
							key={user.id}
							onClick={() => toggle(user)}
							className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left group ${
								isSelected(user.id)
									? "bg-orange-500/10 border border-orange-500/30"
									: "hover:bg-neutral-900 border border-transparent"
							}`}>
							<div className="relative">
								<UserAvatar user={user} />
								{isSelected(user.id) && (
									<div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
										<svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
										</svg>
									</div>
								)}
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-white truncate">{user.name}</p>
								<p className="text-xs text-neutral-500 truncate">{user.email}</p>
							</div>
							<span className="text-xs text-neutral-600 group-hover:text-neutral-400 transition-colors">{user.club}</span>
						</button>
					))}
					{filtered.length === 0 && (
						<div className="py-12 text-center text-neutral-500 text-sm">No people match your filters</div>
					)}
				</div>
			</div>

			{/* Right: Selected Panel (always visible) */}
			<div className="bg-neutral-900/50 p-4 flex flex-col">
				<div className="flex items-center justify-between mb-4">
					<h4 className="text-sm font-semibold text-white">
						Selected
						<span className="ml-2 px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">{selected.length}</span>
					</h4>
					{selected.length > 0 && (
						<button onClick={() => setSelected([])} className="text-xs text-neutral-500 hover:text-red-400 transition-colors">
							Clear all
						</button>
					)}
				</div>

				{selected.length === 0 ? (
					<div className="flex-1 flex items-center justify-center">
						<div className="text-center">
							<div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-800 flex items-center justify-center">
								<svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={1.5}
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
									/>
								</svg>
							</div>
							<p className="text-neutral-500 text-sm">No people selected</p>
							<p className="text-neutral-600 text-xs mt-1">Click on people to add them</p>
						</div>
					</div>
				) : (
					<div className="space-y-2 overflow-y-auto flex-1">
						{selected.map((user) => (
							<div
								key={user.id}
								className="flex items-center gap-3 p-2 rounded-lg bg-neutral-800/50 group">
								<UserAvatar user={user} size="sm" />
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-white truncate">{user.name}</p>
								</div>
								<button
									onClick={() => toggle(user)}
									className="p-1 rounded-md text-neutral-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-all">
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

// =============================================================================
// VARIATION 2: Floating Pill Stack
// Compact pills at top, "+X more" when overflow
// =============================================================================
function PillStackVariation() {
	const [selected, setSelected] = useState<User[]>([]);
	const [search, setSearch] = useState("");
	const [club, setClub] = useState("");
	const [group, setGroup] = useState("");
	const [team, setTeam] = useState("");
	const [showAllPills, setShowAllPills] = useState(false);

	const filtered = filterUsers(MOCK_USERS, search, club, group, team);
	const MAX_VISIBLE_PILLS = 5;

	const toggle = (user: User) => {
		setSelected((prev) => (prev.find((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user]));
	};

	const isSelected = (id: string) => selected.some((u) => u.id === id);
	const visiblePills = showAllPills ? selected : selected.slice(0, MAX_VISIBLE_PILLS);
	const hiddenCount = selected.length - MAX_VISIBLE_PILLS;

	return (
		<div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
			{/* Fixed-height pill area (prevents jumping) */}
			<div className="min-h-[72px] p-4 bg-gradient-to-b from-neutral-900/80 to-transparent border-b border-neutral-800/50">
				{selected.length === 0 ? (
					<div className="flex items-center gap-2 text-neutral-500">
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
							/>
						</svg>
						<span className="text-sm">Select people to invite</span>
					</div>
				) : (
					<div className="flex items-center gap-2 flex-wrap">
						{visiblePills.map((user) => (
							<span
								key={user.id}
								className="inline-flex items-center gap-2 pl-1 pr-2 py-1 bg-orange-500/15 border border-orange-500/30 rounded-full text-sm group">
								<UserAvatar user={user} size="sm" />
								<span className="text-white text-xs font-medium">{user.name.split(" ")[0]}</span>
								<button
									onClick={() => toggle(user)}
									className="p-0.5 rounded-full text-orange-400/60 hover:text-red-400 hover:bg-red-400/20 transition-colors">
									<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</span>
						))}
						{hiddenCount > 0 && !showAllPills && (
							<button
								onClick={() => setShowAllPills(true)}
								className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-medium rounded-full transition-colors">
								+{hiddenCount} more
							</button>
						)}
						{showAllPills && hiddenCount > 0 && (
							<button
								onClick={() => setShowAllPills(false)}
								className="px-3 py-1.5 text-neutral-400 hover:text-white text-xs transition-colors">
								Show less
							</button>
						)}
						<button
							onClick={() => setSelected([])}
							className="ml-auto px-2 py-1 text-xs text-neutral-500 hover:text-red-400 transition-colors">
							Clear all
						</button>
					</div>
				)}
			</div>

			{/* Search & List */}
			<div className="p-4">
				<FilterBar search={search} setSearch={setSearch} club={club} setClub={setClub} group={group} setGroup={setGroup} team={team} setTeam={setTeam} />

				<div className="mt-4 space-y-1 max-h-[300px] overflow-y-auto">
					{filtered.map((user) => (
						<button
							key={user.id}
							onClick={() => toggle(user)}
							className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
								isSelected(user.id) ? "bg-orange-500/10" : "hover:bg-neutral-900"
							}`}>
							<input
								type="checkbox"
								checked={isSelected(user.id)}
								readOnly
								className="w-4 h-4 rounded border-neutral-700 text-orange-500 focus:ring-orange-500/30 bg-neutral-800 cursor-pointer"
							/>
							<UserAvatar user={user} />
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-white truncate">{user.name}</p>
								<p className="text-xs text-neutral-500 truncate">{user.club} · {user.group}</p>
							</div>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// VARIATION 3: Bottom Drawer
// Selected people in a fixed-height drawer at bottom
// =============================================================================
function BottomDrawerVariation() {
	const [selected, setSelected] = useState<User[]>([]);
	const [search, setSearch] = useState("");
	const [club, setClub] = useState("");
	const [group, setGroup] = useState("");
	const [team, setTeam] = useState("");
	const [drawerOpen, setDrawerOpen] = useState(true);

	const filtered = filterUsers(MOCK_USERS, search, club, group, team);

	const toggle = (user: User) => {
		setSelected((prev) => (prev.find((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user]));
	};

	const isSelected = (id: string) => selected.some((u) => u.id === id);

	return (
		<div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950 flex flex-col min-h-[520px]">
			{/* Main content area */}
			<div className="flex-1 p-4 overflow-hidden flex flex-col">
				<FilterBar search={search} setSearch={setSearch} club={club} setClub={setClub} group={group} setGroup={setGroup} team={team} setTeam={setTeam} />

				<div className="mt-4 flex-1 overflow-y-auto space-y-1 pr-2">
					{filtered.map((user) => (
						<button
							key={user.id}
							onClick={() => toggle(user)}
							className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
								isSelected(user.id) ? "bg-teal-500/10 border border-teal-500/30" : "hover:bg-neutral-900 border border-transparent"
							}`}>
							<UserAvatar user={user} />
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-white truncate">{user.name}</p>
								<p className="text-xs text-neutral-500 truncate">{user.email}</p>
							</div>
							{isSelected(user.id) && (
								<span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs rounded-md">Added</span>
							)}
						</button>
					))}
				</div>
			</div>

			{/* Bottom Drawer - Fixed height, always present */}
			<div className="border-t border-neutral-800 bg-gradient-to-t from-neutral-900 to-neutral-900/80">
				{/* Drawer Header */}
				<button
					onClick={() => setDrawerOpen(!drawerOpen)}
					className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-800/50 transition-colors">
					<div className="flex items-center gap-3">
						<div className="flex -space-x-2">
							{selected.slice(0, 3).map((user) => (
								<UserAvatar key={user.id} user={user} size="sm" />
							))}
							{selected.length === 0 && (
								<div className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center">
									<svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
									</svg>
								</div>
							)}
						</div>
						<span className="text-sm text-white font-medium">
							{selected.length === 0 ? "No people selected" : `${selected.length} ${selected.length === 1 ? "person" : "people"} selected`}
						</span>
					</div>
					<svg
						className={`w-5 h-5 text-neutral-500 transition-transform ${drawerOpen ? "rotate-180" : ""}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
					</svg>
				</button>

				{/* Drawer Content */}
				<div className={`overflow-hidden transition-all duration-300 ${drawerOpen ? "max-h-40" : "max-h-0"}`}>
					{selected.length === 0 ? (
						<div className="px-4 pb-4 text-center text-neutral-500 text-sm">Click on people above to add them to your invitation list</div>
					) : (
						<div className="px-4 pb-4">
							<div className="flex items-center justify-between mb-2">
								<span className="text-xs text-neutral-500">Selected invitees</span>
								<button onClick={() => setSelected([])} className="text-xs text-neutral-500 hover:text-red-400 transition-colors">
									Remove all
								</button>
							</div>
							<div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
								{selected.map((user) => (
									<div
										key={user.id}
										className="flex items-center gap-2 pl-1 pr-2 py-1 bg-neutral-800 rounded-full group">
										<UserAvatar user={user} size="sm" />
										<span className="text-xs text-white">{user.name.split(" ")[0]}</span>
										<button
											onClick={() => toggle(user)}
											className="p-0.5 rounded-full text-neutral-500 hover:text-red-400 transition-colors">
											<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// VARIATION 4: Counter with Modal
// Minimal UI - just counter, click to manage in modal
// =============================================================================
function CounterModalVariation() {
	const [selected, setSelected] = useState<User[]>([]);
	const [search, setSearch] = useState("");
	const [club, setClub] = useState("");
	const [group, setGroup] = useState("");
	const [team, setTeam] = useState("");
	const [modalOpen, setModalOpen] = useState(false);
	const [modalSearch, setModalSearch] = useState("");

	const filtered = filterUsers(MOCK_USERS, search, club, group, team);

	const toggle = (user: User) => {
		setSelected((prev) => (prev.find((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user]));
	};

	const isSelected = (id: string) => selected.some((u) => u.id === id);

	const filteredSelected = selected.filter(
		(u) => !modalSearch || u.name.toLowerCase().includes(modalSearch.toLowerCase())
	);

	return (
		<>
			<div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
				{/* Sticky counter bar */}
				<div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-500/10 via-transparent to-fuchsia-500/10 border-b border-neutral-800">
					<button
						onClick={() => setModalOpen(true)}
						className="flex items-center gap-3 hover:opacity-80 transition-opacity">
						<div className="relative">
							<div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
								<svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
									/>
								</svg>
							</div>
							{selected.length > 0 && (
								<span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-neutral-900 text-xs font-bold rounded-full flex items-center justify-center">
									{selected.length}
								</span>
							)}
						</div>
						<div className="text-left">
							<p className="text-sm font-medium text-white">
								{selected.length === 0 ? "No invitees yet" : `${selected.length} ${selected.length === 1 ? "person" : "people"} selected`}
							</p>
							<p className="text-xs text-neutral-500">Click to view & manage</p>
						</div>
					</button>
					{selected.length > 0 && (
						<div className="flex items-center gap-2">
							<div className="flex -space-x-2">
								{selected.slice(0, 4).map((user) => (
									<UserAvatar key={user.id} user={user} size="sm" />
								))}
								{selected.length > 4 && (
									<div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-white font-medium">
										+{selected.length - 4}
									</div>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Search & List */}
				<div className="p-4">
					<FilterBar search={search} setSearch={setSearch} club={club} setClub={setClub} group={group} setGroup={setGroup} team={team} setTeam={setTeam} />

					<div className="mt-4 space-y-1 max-h-[340px] overflow-y-auto">
						{filtered.map((user) => (
							<button
								key={user.id}
								onClick={() => toggle(user)}
								className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
									isSelected(user.id) ? "bg-violet-500/10 border border-violet-500/30" : "hover:bg-neutral-900 border border-transparent"
								}`}>
								<UserAvatar user={user} />
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-white truncate">{user.name}</p>
									<p className="text-xs text-neutral-500 truncate">{user.club} · {user.group}</p>
								</div>
								{isSelected(user.id) ? (
									<span className="text-violet-400">
										<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
											<path
												fillRule="evenodd"
												d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
												clipRule="evenodd"
											/>
										</svg>
									</span>
								) : (
									<span className="text-neutral-600 group-hover:text-neutral-400">
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<circle cx="12" cy="12" r="10" strokeWidth={1.5} />
										</svg>
									</span>
								)}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Modal */}
			{modalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
					<div className="relative w-full max-w-md bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden border border-neutral-800">
						<div className="flex items-center justify-between p-4 border-b border-neutral-800">
							<h3 className="text-lg font-semibold text-white">Selected People ({selected.length})</h3>
							<button onClick={() => setModalOpen(false)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
								<svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{selected.length === 0 ? (
							<div className="p-8 text-center">
								<div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
									<svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={1.5}
											d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
										/>
									</svg>
								</div>
								<p className="text-neutral-400">No people selected yet</p>
								<p className="text-sm text-neutral-600 mt-1">Close this modal and select people from the list</p>
							</div>
						) : (
							<>
								{selected.length > 5 && (
									<div className="px-4 pt-4">
										<input
											type="text"
											placeholder="Search selected..."
											value={modalSearch}
											onChange={(e) => setModalSearch(e.target.value)}
											className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/50"
										/>
									</div>
								)}
								<div className="p-4 max-h-80 overflow-y-auto space-y-2">
									{filteredSelected.map((user) => (
										<div key={user.id} className="flex items-center gap-3 p-2 rounded-lg bg-neutral-800/50 group">
											<UserAvatar user={user} />
											<div className="flex-1 min-w-0">
												<p className="text-sm font-medium text-white truncate">{user.name}</p>
												<p className="text-xs text-neutral-500 truncate">{user.email}</p>
											</div>
											<button
												onClick={() => toggle(user)}
												className="p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-400/10 transition-all">
												<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
												</svg>
											</button>
										</div>
									))}
								</div>
								<div className="p-4 border-t border-neutral-800 flex justify-between">
									<button
										onClick={() => setSelected([])}
										className="px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
										Remove all
									</button>
									<button
										onClick={() => setModalOpen(false)}
										className="px-4 py-2 text-sm bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors">
										Done
									</button>
								</div>
							</>
						)}
					</div>
				</div>
			)}
		</>
	);
}

// =============================================================================
// VARIATION 5: Permanent Sidebar (Desktop) + Bottom Sheet (Mobile)
// Responsive layout with always-visible sidebar on desktop
// =============================================================================
function SidebarRevealVariation() {
	const [selected, setSelected] = useState<User[]>([]);
	const [search, setSearch] = useState("");
	const [club, setClub] = useState("");
	const [group, setGroup] = useState("");
	const [team, setTeam] = useState("");
	const [sidebarSearch, setSidebarSearch] = useState("");
	const [mobileSheetOpen, setMobileSheetOpen] = useState(false);

	const filtered = filterUsers(MOCK_USERS, search, club, group, team);

	const toggle = (user: User) => {
		setSelected((prev) => (prev.find((u) => u.id === user.id) ? prev.filter((u) => u.id !== user.id) : [...prev, user]));
	};

	const isSelected = (id: string) => selected.some((u) => u.id === id);

	// Select all filtered users
	const selectAll = () => {
		setSelected((prev) => {
			const newSelected = [...prev];
			filtered.forEach((user) => {
				if (!newSelected.find((u) => u.id === user.id)) {
					newSelected.push(user);
				}
			});
			return newSelected;
		});
	};

	// Deselect all filtered users
	const deselectAllFiltered = () => {
		const filteredIds = new Set(filtered.map((u) => u.id));
		setSelected((prev) => prev.filter((u) => !filteredIds.has(u.id)));
	};

	// Filter selected users by sidebar search
	const filteredSelected = selected.filter(
		(u) => !sidebarSearch || u.name.toLowerCase().includes(sidebarSearch.toLowerCase()) || u.email.toLowerCase().includes(sidebarSearch.toLowerCase())
	);

	// Check selection state for current filtered list
	const allFilteredSelected = filtered.length > 0 && filtered.every((u) => isSelected(u.id));
	const someFilteredSelected = filtered.some((u) => isSelected(u.id));

	// Shared Selected Panel Content
	const SelectedPanelContent = ({ isMobile = false }: { isMobile?: boolean }) => (
		<>
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2">
					<div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
						<svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<span className="text-sm font-semibold text-white">Selected ({selected.length})</span>
				</div>
				<div className="flex items-center gap-2">
					{selected.length > 0 && (
						<button onClick={() => setSelected([])} className="text-xs text-neutral-500 hover:text-red-400 transition-colors">
							Clear
						</button>
					)}
					{isMobile && (
						<button
							onClick={() => setMobileSheetOpen(false)}
							className="p-1 ml-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					)}
				</div>
			</div>

			{/* Sidebar Search */}
			<div className="relative mb-3">
				<svg
					className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
				</svg>
				<input
					type="text"
					placeholder="Search selected..."
					value={sidebarSearch}
					onChange={(e) => setSidebarSearch(e.target.value)}
					className="w-full pl-8 pr-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
				/>
				{sidebarSearch && (
					<button
						onClick={() => setSidebarSearch("")}
						className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors">
						<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				)}
			</div>

			{/* Search results info */}
			{sidebarSearch && filteredSelected.length !== selected.length && (
				<p className="text-xs text-neutral-500 mb-2">
					Showing {filteredSelected.length} of {selected.length}
				</p>
			)}

			<div className={`flex-1 min-h-0 overflow-y-auto space-y-2 ${isMobile ? "max-h-[40vh]" : ""}`}>
				{selected.length === 0 ? (
					<div className="py-8 text-center">
						<div className="w-12 h-12 mx-auto mb-3 rounded-full bg-neutral-800 flex items-center justify-center">
							<svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={1.5}
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
								/>
							</svg>
						</div>
						<p className="text-neutral-500 text-sm">No one selected yet</p>
						<p className="text-neutral-600 text-xs mt-1">Select people from the list</p>
					</div>
				) : filteredSelected.length === 0 && sidebarSearch ? (
					<div className="py-6 text-center text-neutral-500 text-xs">
						No selected people match "{sidebarSearch}"
					</div>
				) : (
					filteredSelected.map((user) => (
						<div
							key={user.id}
							className="flex items-center gap-3 p-2 rounded-lg bg-neutral-800/50 group">
							<UserAvatar user={user} size="sm" />
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-white truncate">{user.name}</p>
							</div>
							<button
								onClick={() => toggle(user)}
								className="p-1.5 rounded-md text-neutral-500 hover:text-red-400 hover:bg-red-400/10 md:opacity-0 md:group-hover:opacity-100 transition-all">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
					))
				)}
			</div>

			<div className="pt-4 border-t border-neutral-800 mt-4">
				<button
					disabled={selected.length === 0}
					className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-neutral-800 disabled:text-neutral-500 text-white text-sm font-medium rounded-lg transition-colors">
					{selected.length === 0 ? "Select people to invite" : `Send ${selected.length} Invitation${selected.length !== 1 ? "s" : ""}`}
				</button>
			</div>
		</>
	);

	return (
		<div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950 relative">
			{/* Desktop Layout */}
			<div className="flex">
				{/* Main content */}
				<div className="flex-1 lg:w-[calc(100%-300px)] p-4 pb-24 lg:pb-4">
					<FilterBar search={search} setSearch={setSearch} club={club} setClub={setClub} group={group} setGroup={setGroup} team={team} setTeam={setTeam} />

					{/* Select All Bar */}
					<div className="mt-4 flex items-center justify-between py-2 px-3 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
						<div className="flex items-center gap-3">
							<button
								onClick={() => allFilteredSelected ? deselectAllFiltered() : selectAll()}
								className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
									allFilteredSelected
										? "bg-emerald-500 border-emerald-500"
										: someFilteredSelected
										? "border-emerald-500 bg-emerald-500/20"
										: "border-neutral-600 hover:border-neutral-500"
								}`}>
								{allFilteredSelected && (
									<svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
									</svg>
								)}
								{someFilteredSelected && !allFilteredSelected && (
									<div className="w-2 h-0.5 bg-emerald-500 rounded" />
								)}
							</button>
							<span className="text-sm text-neutral-400">
								{allFilteredSelected ? (
									<span className="text-emerald-400">All {filtered.length} selected</span>
								) : someFilteredSelected ? (
									<>
										<span className="text-white">{filtered.filter((u) => isSelected(u.id)).length}</span>
										<span className="text-neutral-500"> of </span>
										<span className="text-white">{filtered.length}</span>
										<span className="text-neutral-500 hidden sm:inline"> selected</span>
									</>
								) : (
									<span className="hidden sm:inline">{filtered.length} {filtered.length === 1 ? "person" : "people"} in list</span>
								)}
							</span>
						</div>
						<div className="flex items-center gap-2">
							{someFilteredSelected && !allFilteredSelected && (
								<button
									onClick={selectAll}
									className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">
									Select all
								</button>
							)}
							{someFilteredSelected && (
								<button
									onClick={deselectAllFiltered}
									className="text-xs text-neutral-500 hover:text-red-400 transition-colors">
									Deselect
								</button>
							)}
							{!someFilteredSelected && filtered.length > 0 && (
								<button
									onClick={selectAll}
									className="text-xs px-2 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded transition-colors">
									Select all {filtered.length}
								</button>
							)}
						</div>
					</div>

					<div className="mt-3 space-y-1 max-h-[340px] overflow-y-auto pr-2">
						{filtered.map((user) => (
							<button
								key={user.id}
								onClick={() => toggle(user)}
								className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
									isSelected(user.id) ? "bg-emerald-500/10 border-l-2 border-emerald-500" : "hover:bg-neutral-900 border-l-2 border-transparent"
								}`}>
								<UserAvatar user={user} />
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-white truncate">{user.name}</p>
									<p className="text-xs text-neutral-500 truncate">{user.email}</p>
								</div>
								<div className={`transition-all ${isSelected(user.id) ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2"}`}>
									<svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
										<path
											fillRule="evenodd"
											d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
											clipRule="evenodd"
										/>
									</svg>
								</div>
							</button>
						))}
						{filtered.length === 0 && (
							<div className="py-12 text-center text-neutral-500 text-sm">No people match your filters</div>
						)}
					</div>
				</div>

				{/* Desktop Sidebar - Always visible */}
				<div className="hidden lg:block w-[300px] bg-gradient-to-l from-neutral-900 to-neutral-900/95 border-l border-neutral-800">
					<div className="p-4 h-[520px] flex flex-col">
						<SelectedPanelContent />
					</div>
				</div>
			</div>

			{/* Mobile Bottom Bar - Shows when sheet is closed */}
			<div className="lg:hidden absolute bottom-0 left-0 right-0 bg-gradient-to-t from-neutral-900 via-neutral-900 to-neutral-900/95 border-t border-neutral-800">
				<button
					onClick={() => setMobileSheetOpen(true)}
					className="w-full flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors">
					<div className="flex items-center gap-3">
						{/* Avatar Stack */}
						<div className="flex -space-x-2">
							{selected.slice(0, 3).map((user) => (
								<UserAvatar key={user.id} user={user} size="sm" />
							))}
							{selected.length === 0 && (
								<div className="w-8 h-8 rounded-full bg-neutral-800 border-2 border-neutral-700 flex items-center justify-center">
									<svg className="w-4 h-4 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
									</svg>
								</div>
							)}
							{selected.length > 3 && (
								<div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-white font-medium border-2 border-neutral-900">
									+{selected.length - 3}
								</div>
							)}
						</div>
						<div className="text-left">
							<p className="text-sm font-medium text-white">
								{selected.length === 0 ? "No one selected" : `${selected.length} selected`}
							</p>
							<p className="text-xs text-neutral-500">Tap to view & manage</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						{selected.length > 0 && (
							<span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full">
								{selected.length}
							</span>
						)}
						<svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
						</svg>
					</div>
				</button>
			</div>

			{/* Mobile Bottom Sheet */}
			{mobileSheetOpen && (
				<div className="lg:hidden fixed inset-0 z-50">
					{/* Backdrop */}
					<div
						className="absolute inset-0 bg-black/60 backdrop-blur-sm"
						onClick={() => setMobileSheetOpen(false)}
					/>
					{/* Sheet */}
					<div className="absolute bottom-0 left-0 right-0 bg-neutral-900 rounded-t-2xl border-t border-neutral-800 max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
						{/* Handle */}
						<div className="flex justify-center py-3">
							<div className="w-10 h-1 rounded-full bg-neutral-700" />
						</div>
						{/* Content */}
						<div className="px-4 pb-8 flex flex-col flex-1 overflow-hidden">
							<SelectedPanelContent isMobile />
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// Main Page Component
// =============================================================================
export default function InviteeSelectorPrototypesPage() {
	return (
		<div className="min-h-screen bg-neutral-950">
			{/* Hero Header */}
			<div className="relative overflow-hidden border-b border-neutral-800">
				<div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-teal-500/5" />
				<div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
				<div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

				<div className="relative max-w-7xl mx-auto px-6 py-16">
					<div className="flex items-center gap-3 mb-4">
						<div className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full">
							<span className="text-xs font-medium text-orange-400 tracking-wide uppercase">UI Prototypes</span>
						</div>
						<div className="h-px flex-1 bg-gradient-to-r from-neutral-800 to-transparent" />
					</div>
					<h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
						Invitee Selector<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-teal-400">Component Variations</span>
					</h1>
					<p className="text-neutral-400 text-lg max-w-2xl leading-relaxed">
						Exploring different UX patterns for selecting people to invite. Each variation addresses the challenge of
						<span className="text-white font-medium"> preventing layout jumps</span> when selections change.
					</p>
				</div>
			</div>

			{/* Prototypes Grid */}
			<div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
				{/* Variation 1 */}
				<section>
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-2">
							<span className="text-xs font-mono text-neutral-600 bg-neutral-900 px-2 py-1 rounded">01</span>
							<h2 className="text-2xl font-semibold text-white">Split Panel Layout</h2>
						</div>
						<p className="text-neutral-500 max-w-xl">
							Fixed two-column layout where the selected panel is always visible. Zero layout shift since both columns
							maintain their dimensions regardless of selection state.
						</p>
						<div className="flex flex-wrap gap-2 mt-3">
							<span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded">No jumping</span>
							<span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">Desktop optimized</span>
							<span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded">Full visibility</span>
						</div>
					</div>
					<SplitPanelVariation />
				</section>

				{/* Variation 2 */}
				<section>
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-2">
							<span className="text-xs font-mono text-neutral-600 bg-neutral-900 px-2 py-1 rounded">02</span>
							<h2 className="text-2xl font-semibold text-white">Floating Pill Stack</h2>
						</div>
						<p className="text-neutral-500 max-w-xl">
							Selected people appear as compact pills at the top with "+X more" overflow. Fixed header height
							prevents layout shifts. Great for limited space scenarios.
						</p>
						<div className="flex flex-wrap gap-2 mt-3">
							<span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded">Minimal footprint</span>
							<span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">Mobile friendly</span>
							<span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded">Quick scan</span>
						</div>
					</div>
					<PillStackVariation />
				</section>

				{/* Variation 3 */}
				<section>
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-2">
							<span className="text-xs font-mono text-neutral-600 bg-neutral-900 px-2 py-1 rounded">03</span>
							<h2 className="text-2xl font-semibold text-white">Bottom Drawer</h2>
						</div>
						<p className="text-neutral-500 max-w-xl">
							Selected people live in a collapsible drawer at the bottom. Main list scrolls independently above.
							Drawer header shows preview avatars for quick context.
						</p>
						<div className="flex flex-wrap gap-2 mt-3">
							<span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded">Collapsible</span>
							<span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">Touch friendly</span>
							<span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded">Preview on header</span>
						</div>
					</div>
					<BottomDrawerVariation />
				</section>

				{/* Variation 4 */}
				<section>
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-2">
							<span className="text-xs font-mono text-neutral-600 bg-neutral-900 px-2 py-1 rounded">04</span>
							<h2 className="text-2xl font-semibold text-white">Counter with Modal</h2>
						</div>
						<p className="text-neutral-500 max-w-xl">
							Ultra-minimal approach: just a counter and avatar stack. Click to open modal for managing selections.
							Perfect when space is at a premium and selections are secondary.
						</p>
						<div className="flex flex-wrap gap-2 mt-3">
							<span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded">Zero inline space</span>
							<span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">Modal management</span>
							<span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded">Unobtrusive</span>
						</div>
					</div>
					<CounterModalVariation />
				</section>

				{/* Variation 5 */}
				<section>
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-2">
							<span className="text-xs font-mono text-neutral-600 bg-neutral-900 px-2 py-1 rounded">05</span>
							<h2 className="text-2xl font-semibold text-white">Permanent Sidebar + Mobile Sheet</h2>
						</div>
						<p className="text-neutral-500 max-w-xl">
							Desktop shows a permanent sidebar with search and selection management. Mobile uses a bottom bar with
							avatar preview that expands into a full bottom sheet. Includes "Select All" for bulk operations.
						</p>
						<div className="flex flex-wrap gap-2 mt-3">
							<span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded">Fully responsive</span>
							<span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">Bottom sheet on mobile</span>
							<span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded">Select all support</span>
							<span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded">Search in sidebar</span>
						</div>
					</div>
					<SidebarRevealVariation />
				</section>

				{/* Summary */}
				<section className="border-t border-neutral-800 pt-12">
					<h2 className="text-2xl font-semibold text-white mb-6">UX Comparison</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{[
							{ name: "Split Panel", best: "Desktop apps", avoid: "Mobile/narrow screens", jump: "None" },
							{ name: "Pill Stack", best: "Limited space", avoid: "Many selections", jump: "None (fixed header)" },
							{ name: "Bottom Drawer", best: "Mobile first", avoid: "Data-heavy views", jump: "None (fixed footer)" },
							{ name: "Counter Modal", best: "Secondary selection", avoid: "Frequent management", jump: "None" },
							{ name: "Sidebar + Sheet", best: "All screen sizes", avoid: "Very simple forms", jump: "None" },
						].map((item) => (
							<div key={item.name} className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl">
								<h3 className="font-medium text-white mb-3">{item.name}</h3>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-neutral-500">Best for:</span>
										<span className="text-emerald-400">{item.best}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-neutral-500">Avoid when:</span>
										<span className="text-red-400">{item.avoid}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-neutral-500">Layout jump:</span>
										<span className="text-blue-400">{item.jump}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</section>
			</div>
		</div>
	);
}
