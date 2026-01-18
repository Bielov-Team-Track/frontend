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
function UserAvatar({ user, size = "md" }: { user: User; size?: "xs" | "sm" | "md" | "lg" }) {
	const sizeClasses = {
		xs: "w-6 h-6 text-[10px]",
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
					className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-all"
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
					className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-accent/50 transition-colors cursor-pointer">
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
					className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-accent/50 transition-colors cursor-pointer">
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
					className="px-3 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-accent/50 transition-colors cursor-pointer">
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

// Avatar Stack Component
function AvatarStack({ users, max = 4 }: { users: User[]; max?: number }) {
	const visible = users.slice(0, max);
	const remaining = users.length - max;

	if (users.length === 0) {
		return (
			<div className="flex items-center gap-2 text-neutral-500 text-sm">
				<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
				</svg>
				No invitees selected
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2">
			<div className="flex -space-x-2">
				{visible.map((user) => (
					<UserAvatar key={user.id} user={user} size="sm" />
				))}
				{remaining > 0 && (
					<div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-white font-medium border-2 border-neutral-900">
						+{remaining}
					</div>
				)}
			</div>
			<span className="text-sm text-neutral-400">{users.length} selected</span>
		</div>
	);
}

// Mock Form Fields Component
function MockFormFields({ constrained = false }: { constrained?: boolean }) {
	return (
		<div className={`space-y-4 ${constrained ? "max-w-lg mx-auto" : ""}`}>
			<div>
				<label className="block text-sm font-medium text-white mb-1.5">Event Name</label>
				<input
					type="text"
					placeholder="Beach Volleyball Practice"
					className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-accent/50"
				/>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<div>
					<label className="block text-sm font-medium text-white mb-1.5">Date</label>
					<input
						type="date"
						className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-accent/50"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-white mb-1.5">Time</label>
					<input
						type="time"
						className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white focus:outline-none focus:border-accent/50"
					/>
				</div>
			</div>
			<div>
				<label className="block text-sm font-medium text-white mb-1.5">Location</label>
				<input
					type="text"
					placeholder="Venice Beach Courts"
					className="w-full px-3 py-2.5 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-accent/50"
				/>
			</div>
		</div>
	);
}

// Full InviteeSelector (Sidebar version for large modals)
function FullInviteeSelector({
	selected,
	setSelected,
	showSidebar = true,
}: {
	selected: User[];
	setSelected: (users: User[]) => void;
	showSidebar?: boolean;
}) {
	const [search, setSearch] = useState("");
	const [club, setClub] = useState("");
	const [group, setGroup] = useState("");
	const [team, setTeam] = useState("");
	const [sidebarSearch, setSidebarSearch] = useState("");

	const filtered = filterUsers(MOCK_USERS, search, club, group, team);

	const toggle = (user: User) => {
		setSelected(selected.find((u) => u.id === user.id) ? selected.filter((u) => u.id !== user.id) : [...selected, user]);
	};

	const isSelected = (id: string) => selected.some((u) => u.id === id);

	const selectAll = () => {
		const newSelected = [...selected];
		filtered.forEach((user) => {
			if (!newSelected.find((u) => u.id === user.id)) {
				newSelected.push(user);
			}
		});
		setSelected(newSelected);
	};

	const deselectAll = () => {
		const filteredIds = new Set(filtered.map((u) => u.id));
		setSelected(selected.filter((u) => !filteredIds.has(u.id)));
	};

	const filteredSelected = selected.filter(
		(u) => !sidebarSearch || u.name.toLowerCase().includes(sidebarSearch.toLowerCase())
	);

	const allFilteredSelected = filtered.length > 0 && filtered.every((u) => isSelected(u.id));
	const someFilteredSelected = filtered.some((u) => isSelected(u.id));

	return (
		<div className="flex h-full">
			{/* Main content */}
			<div className={`flex-1 p-4 ${showSidebar ? "border-r border-neutral-800" : ""}`}>
				<FilterBar search={search} setSearch={setSearch} club={club} setClub={setClub} group={group} setGroup={setGroup} team={team} setTeam={setTeam} />

				{/* Select All Bar */}
				{filtered.length > 0 && (
					<div className="mt-3 flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg border border-white/5">
						<div className="flex items-center gap-3">
							<button
								onClick={() => (allFilteredSelected ? deselectAll() : selectAll())}
								className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
									allFilteredSelected
										? "bg-accent border-accent"
										: someFilteredSelected
										? "border-accent bg-accent/20"
										: "border-neutral-600 hover:border-neutral-500"
								}`}>
								{allFilteredSelected && (
									<svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
									</svg>
								)}
								{someFilteredSelected && !allFilteredSelected && <div className="w-2 h-0.5 bg-accent rounded" />}
							</button>
							<span className="text-sm text-neutral-400">
								{filtered.filter((u) => isSelected(u.id)).length}/{filtered.length} selected
							</span>
						</div>
					</div>
				)}

				<div className="mt-3 space-y-1 max-h-[280px] overflow-y-auto">
					{filtered.map((user) => (
						<button
							key={user.id}
							onClick={() => toggle(user)}
							className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left ${
								isSelected(user.id) ? "bg-accent/10 border-l-2 border-accent" : "hover:bg-white/5 border-l-2 border-transparent"
							}`}>
							<div
								className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
									isSelected(user.id) ? "bg-accent border-accent" : "border-neutral-600"
								}`}>
								{isSelected(user.id) && (
									<svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
									</svg>
								)}
							</div>
							<UserAvatar user={user} size="sm" />
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-white truncate">{user.name}</p>
								<p className="text-xs text-neutral-500 truncate">{user.email}</p>
							</div>
						</button>
					))}
				</div>
			</div>

			{/* Sidebar */}
			{showSidebar && (
				<div className="w-[260px] bg-gradient-to-l from-white/5 to-transparent p-4 flex flex-col">
					<div className="flex items-center justify-between mb-3">
						<div className="flex items-center gap-2">
							<div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
								<svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<span className="text-sm font-semibold text-white">Selected ({selected.length})</span>
						</div>
						{selected.length > 0 && (
							<button onClick={() => setSelected([])} className="text-xs text-neutral-500 hover:text-red-400 transition-colors">
								Clear
							</button>
						)}
					</div>

					{selected.length > 3 && (
						<div className="relative mb-3">
							<svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
							<input
								type="text"
								placeholder="Search selected..."
								value={sidebarSearch}
								onChange={(e) => setSidebarSearch(e.target.value)}
								className="w-full pl-8 pr-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-accent/50"
							/>
						</div>
					)}

					<div className="flex-1 min-h-0 overflow-y-auto space-y-1.5">
						{selected.length === 0 ? (
							<div className="py-8 text-center">
								<div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white/5 flex items-center justify-center">
									<svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
									</svg>
								</div>
								<p className="text-neutral-500 text-xs">Select people from the list</p>
							</div>
						) : (
							filteredSelected.map((user) => (
								<div key={user.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 group">
									<UserAvatar user={user} size="xs" />
									<span className="flex-1 text-xs text-white truncate">{user.name}</span>
									<button
										onClick={() => toggle(user)}
										className="p-1 rounded text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
										<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
							))
						)}
					</div>
				</div>
			)}
		</div>
	);
}

// Compact InviteeSelector (Drawer style for narrow modals)
function CompactInviteeSelector({ selected, setSelected }: { selected: User[]; setSelected: (users: User[]) => void }) {
	const [search, setSearch] = useState("");
	const [club, setClub] = useState("");
	const [group, setGroup] = useState("");
	const [team, setTeam] = useState("");
	const [drawerOpen, setDrawerOpen] = useState(false);

	const filtered = filterUsers(MOCK_USERS, search, club, group, team);

	const toggle = (user: User) => {
		setSelected(selected.find((u) => u.id === user.id) ? selected.filter((u) => u.id !== user.id) : [...selected, user]);
	};

	const isSelected = (id: string) => selected.some((u) => u.id === id);

	return (
		<div className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-950">
			{/* Drawer header */}
			<button
				onClick={() => setDrawerOpen(!drawerOpen)}
				className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-accent/5 to-transparent border-b border-neutral-800 hover:bg-accent/10 transition-colors">
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
						{selected.length > 3 && (
							<div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-xs text-white font-medium">
								+{selected.length - 3}
							</div>
						)}
					</div>
					<span className="text-sm font-medium text-white">
						{selected.length === 0 ? "No invitees selected" : `${selected.length} invitee${selected.length !== 1 ? "s" : ""} selected`}
					</span>
				</div>
				<svg
					className={`w-5 h-5 text-neutral-500 transition-transform ${drawerOpen ? "rotate-180" : ""}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{/* Drawer content */}
			<div className={`overflow-hidden transition-all duration-300 ${drawerOpen ? "max-h-[400px]" : "max-h-0"}`}>
				<div className="p-4">
					<FilterBar search={search} setSearch={setSearch} club={club} setClub={setClub} group={group} setGroup={setGroup} team={team} setTeam={setTeam} />

					<div className="mt-3 space-y-1 max-h-[220px] overflow-y-auto">
						{filtered.map((user) => (
							<button
								key={user.id}
								onClick={() => toggle(user)}
								className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all text-left ${
									isSelected(user.id) ? "bg-accent/10" : "hover:bg-white/5"
								}`}>
								<div
									className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
										isSelected(user.id) ? "bg-accent border-accent" : "border-neutral-600"
									}`}>
									{isSelected(user.id) && (
										<svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
										</svg>
									)}
								</div>
								<UserAvatar user={user} size="sm" />
								<div className="flex-1 min-w-0">
									<p className="text-sm font-medium text-white truncate">{user.name}</p>
									<p className="text-xs text-neutral-500 truncate">{user.club}</p>
								</div>
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

// =============================================================================
// OPTION 1: Adaptive Width Modal
// =============================================================================
function Option1AdaptiveWidth() {
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState(1);
	const [selected, setSelected] = useState<User[]>([]);

	const isWide = step === 2; // Registration step

	return (
		<div>
			<button
				onClick={() => {
					setIsOpen(true);
					setStep(1);
				}}
				className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors">
				Open Modal
			</button>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
					<div
						className={`relative bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden transition-all duration-300 ${
							isWide ? "w-full max-w-4xl" : "w-full max-w-xl"
						}`}>
						{/* Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
							<h3 className="text-lg font-semibold text-white">Create Event</h3>
							<button onClick={() => setIsOpen(false)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
								<svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Step indicator */}
						<div className="px-6 py-3 border-b border-neutral-800 flex gap-2">
							{[1, 2].map((s) => (
								<button
									key={s}
									onClick={() => setStep(s)}
									className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
										step === s ? "bg-accent text-white" : "bg-neutral-800 text-neutral-400 hover:text-white"
									}`}>
									{s === 1 ? "Details" : "Invitees"}
								</button>
							))}
						</div>

						{/* Content */}
						<div className="p-6 max-h-[70vh] overflow-auto">
							{step === 1 ? (
								<MockFormFields />
							) : (
								<div className="h-[400px]">
									<FullInviteeSelector selected={selected} setSelected={setSelected} />
								</div>
							)}
						</div>

						{/* Footer */}
						<div className="px-6 py-4 border-t border-neutral-800 flex justify-between">
							<button
								onClick={() => setStep(Math.max(1, step - 1))}
								disabled={step === 1}
								className="px-4 py-2 text-sm text-neutral-400 hover:text-white disabled:opacity-50 transition-colors">
								Back
							</button>
							<button
								onClick={() => (step < 2 ? setStep(step + 1) : setIsOpen(false))}
								className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors">
								{step === 2 ? "Create Event" : "Next"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// OPTION 2: Compact Variant (Drawer style)
// =============================================================================
function Option2CompactVariant() {
	const [isOpen, setIsOpen] = useState(false);
	const [selected, setSelected] = useState<User[]>([]);

	return (
		<div>
			<button
				onClick={() => setIsOpen(true)}
				className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors">
				Open Modal
			</button>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
					<div className="relative w-full max-w-xl bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden">
						{/* Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
							<h3 className="text-lg font-semibold text-white">Create Event</h3>
							<button onClick={() => setIsOpen(false)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
								<svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Content */}
						<div className="p-6 max-h-[70vh] overflow-auto space-y-6">
							<MockFormFields />

							<div>
								<label className="block text-sm font-medium text-white mb-3">Invitees</label>
								<CompactInviteeSelector selected={selected} setSelected={setSelected} />
							</div>
						</div>

						{/* Footer */}
						<div className="px-6 py-4 border-t border-neutral-800 flex justify-end">
							<button
								onClick={() => setIsOpen(false)}
								className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors">
								Create Event
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// OPTION 3: Slide-out Panel
// =============================================================================
function Option3SlideOutPanel() {
	const [isOpen, setIsOpen] = useState(false);
	const [panelOpen, setPanelOpen] = useState(false);
	const [selected, setSelected] = useState<User[]>([]);

	return (
		<div>
			<button
				onClick={() => setIsOpen(true)}
				className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors">
				Open Modal
			</button>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
					<div className="relative w-full max-w-xl bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden">
						{/* Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
							<h3 className="text-lg font-semibold text-white">Create Event</h3>
							<button onClick={() => setIsOpen(false)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
								<svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Content */}
						<div className="p-6 max-h-[70vh] overflow-auto space-y-6">
							<MockFormFields />

							<div>
								<label className="block text-sm font-medium text-white mb-3">Invitees</label>
								<button
									onClick={() => setPanelOpen(true)}
									className="w-full p-4 border border-neutral-800 rounded-xl hover:bg-white/5 transition-colors text-left">
									<div className="flex items-center justify-between">
										<AvatarStack users={selected} max={5} />
										<svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
										</svg>
									</div>
								</button>
							</div>
						</div>

						{/* Footer */}
						<div className="px-6 py-4 border-t border-neutral-800 flex justify-end">
							<button
								onClick={() => setIsOpen(false)}
								className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors">
								Create Event
							</button>
						</div>
					</div>

					{/* Slide-out Panel */}
					<div
						className={`fixed top-0 right-0 h-full w-full max-w-lg bg-neutral-900 border-l border-neutral-800 shadow-2xl transition-transform duration-300 ${
							panelOpen ? "translate-x-0" : "translate-x-full"
						}`}>
						<div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
							<h3 className="text-lg font-semibold text-white">Select Invitees</h3>
							<button onClick={() => setPanelOpen(false)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
								<svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<div className="h-[calc(100%-130px)]">
							<FullInviteeSelector selected={selected} setSelected={setSelected} />
						</div>
						<div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-neutral-800 bg-neutral-900">
							<button
								onClick={() => setPanelOpen(false)}
								className="w-full px-4 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors">
								Done ({selected.length} selected)
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// OPTION 4: Two-Column Layout
// =============================================================================
function Option4TwoColumn() {
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState(1);
	const [selected, setSelected] = useState<User[]>([]);

	return (
		<div>
			<button
				onClick={() => {
					setIsOpen(true);
					setStep(1);
				}}
				className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors">
				Open Modal
			</button>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
					<div className="relative w-full max-w-4xl bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden">
						{/* Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
							<h3 className="text-lg font-semibold text-white">Create Event</h3>
							<button onClick={() => setIsOpen(false)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
								<svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Step indicator */}
						<div className="px-6 py-3 border-b border-neutral-800 flex gap-2">
							{[1, 2].map((s) => (
								<button
									key={s}
									onClick={() => setStep(s)}
									className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
										step === s ? "bg-accent text-white" : "bg-neutral-800 text-neutral-400 hover:text-white"
									}`}>
									{s === 1 ? "Details" : "Invitees"}
								</button>
							))}
						</div>

						{/* Content */}
						<div className="max-h-[70vh] overflow-auto">
							{step === 1 ? (
								<div className="p-6">
									<MockFormFields constrained />
								</div>
							) : (
								<div className="flex min-h-[450px]">
									{/* Left: Form fields (constrained) */}
									<div className="flex-1 p-6 border-r border-neutral-800">
										<FullInviteeSelector selected={selected} setSelected={setSelected} showSidebar={false} />
									</div>
									{/* Right: Selected panel */}
									<div className="w-[280px] bg-gradient-to-l from-white/5 to-transparent p-4 flex flex-col">
										<div className="flex items-center justify-between mb-3">
											<div className="flex items-center gap-2">
												<div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center">
													<svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
													</svg>
												</div>
												<span className="text-sm font-semibold text-white">Selected ({selected.length})</span>
											</div>
											{selected.length > 0 && (
												<button onClick={() => setSelected([])} className="text-xs text-neutral-500 hover:text-red-400 transition-colors">
													Clear
												</button>
											)}
										</div>

										<div className="flex-1 min-h-0 overflow-y-auto space-y-1.5">
											{selected.length === 0 ? (
												<div className="py-8 text-center">
													<div className="w-10 h-10 mx-auto mb-2 rounded-full bg-white/5 flex items-center justify-center">
														<svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
														</svg>
													</div>
													<p className="text-neutral-500 text-xs">Select people from the list</p>
												</div>
											) : (
												selected.map((user) => (
													<div key={user.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/5 group">
														<UserAvatar user={user} size="xs" />
														<span className="flex-1 text-xs text-white truncate">{user.name}</span>
														<button
															onClick={() => setSelected(selected.filter((u) => u.id !== user.id))}
															className="p-1 rounded text-neutral-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
															<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
															</svg>
														</button>
													</div>
												))
											)}
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Footer */}
						<div className="px-6 py-4 border-t border-neutral-800 flex justify-between">
							<button
								onClick={() => setStep(Math.max(1, step - 1))}
								disabled={step === 1}
								className="px-4 py-2 text-sm text-neutral-400 hover:text-white disabled:opacity-50 transition-colors">
								Back
							</button>
							<button
								onClick={() => (step < 2 ? setStep(step + 1) : setIsOpen(false))}
								className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors">
								{step === 2 ? "Create Event" : "Next"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// OPTION 5: Fullscreen Modal for Registration
// =============================================================================
function Option5Fullscreen() {
	const [isOpen, setIsOpen] = useState(false);
	const [step, setStep] = useState(1);
	const [selected, setSelected] = useState<User[]>([]);

	const isFullscreen = step === 2;

	return (
		<div>
			<button
				onClick={() => {
					setIsOpen(true);
					setStep(1);
				}}
				className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors">
				Open Modal
			</button>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
					<div
						className={`relative bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden transition-all duration-300 ${
							isFullscreen ? "w-[calc(100%-2rem)] h-[calc(100%-2rem)]" : "w-full max-w-xl"
						}`}>
						{/* Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
							<h3 className="text-lg font-semibold text-white">Create Event</h3>
							<button onClick={() => setIsOpen(false)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
								<svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Step indicator */}
						<div className="px-6 py-3 border-b border-neutral-800 flex gap-2">
							{[1, 2].map((s) => (
								<button
									key={s}
									onClick={() => setStep(s)}
									className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
										step === s ? "bg-accent text-white" : "bg-neutral-800 text-neutral-400 hover:text-white"
									}`}>
									{s === 1 ? "Details" : "Invitees"}
								</button>
							))}
						</div>

						{/* Content */}
						<div className={`overflow-auto ${isFullscreen ? "h-[calc(100%-140px)]" : "max-h-[70vh] p-6"}`}>
							{step === 1 ? (
								<MockFormFields />
							) : (
								<div className="h-full">
									<FullInviteeSelector selected={selected} setSelected={setSelected} />
								</div>
							)}
						</div>

						{/* Footer */}
						<div className="px-6 py-4 border-t border-neutral-800 flex justify-between">
							<button
								onClick={() => setStep(Math.max(1, step - 1))}
								disabled={step === 1}
								className="px-4 py-2 text-sm text-neutral-400 hover:text-white disabled:opacity-50 transition-colors">
								Back
							</button>
							<button
								onClick={() => (step < 2 ? setStep(step + 1) : setIsOpen(false))}
								className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors">
								{step === 2 ? "Create Event" : "Next"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

// =============================================================================
// OPTION 6: Summary + Edit Pattern
// =============================================================================
function Option6SummaryEdit() {
	const [isOpen, setIsOpen] = useState(false);
	const [editorOpen, setEditorOpen] = useState(false);
	const [selected, setSelected] = useState<User[]>([]);

	return (
		<div>
			<button
				onClick={() => setIsOpen(true)}
				className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors">
				Open Modal
			</button>

			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
					<div className="relative w-full max-w-xl bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden">
						{/* Header */}
						<div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
							<h3 className="text-lg font-semibold text-white">Create Event</h3>
							<button onClick={() => setIsOpen(false)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
								<svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>

						{/* Content */}
						<div className="p-6 max-h-[70vh] overflow-auto space-y-6">
							<MockFormFields />

							{/* Invitees Summary Card */}
							<div>
								<label className="block text-sm font-medium text-white mb-3">Invitees</label>
								<div className="p-4 border border-neutral-800 rounded-xl bg-white/5">
									<div className="flex items-center justify-between">
										<AvatarStack users={selected} max={5} />
										<button
											onClick={() => setEditorOpen(true)}
											className="px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent text-sm font-medium rounded-lg transition-colors">
											{selected.length > 0 ? "Edit" : "Add People"}
										</button>
									</div>
								</div>
							</div>
						</div>

						{/* Footer */}
						<div className="px-6 py-4 border-t border-neutral-800 flex justify-end">
							<button
								onClick={() => setIsOpen(false)}
								className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors">
								Create Event
							</button>
						</div>
					</div>

					{/* Editor Modal */}
					{editorOpen && (
						<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
							<div className="absolute inset-0 bg-black/50" onClick={() => setEditorOpen(false)} />
							<div className="relative w-full max-w-4xl bg-neutral-900 rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden">
								<div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
									<h3 className="text-lg font-semibold text-white">Select Invitees</h3>
									<button onClick={() => setEditorOpen(false)} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors">
										<svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								</div>
								<div className="h-[500px]">
									<FullInviteeSelector selected={selected} setSelected={setSelected} />
								</div>
								<div className="px-6 py-4 border-t border-neutral-800 flex justify-end">
									<button
										onClick={() => setEditorOpen(false)}
										className="px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-lg transition-colors">
										Done ({selected.length} selected)
									</button>
								</div>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

// =============================================================================
// Main Page Component
// =============================================================================
export default function InviteeModalPrototypesPage() {
	return (
		<div className="min-h-screen bg-neutral-950">
			{/* Hero Header */}
			<div className="relative overflow-hidden border-b border-neutral-800">
				<div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-teal-500/5" />
				<div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
				<div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

				<div className="relative max-w-7xl mx-auto px-6 py-16">
					<div className="flex items-center gap-3 mb-4">
						<div className="px-3 py-1 bg-accent/10 border border-accent/20 rounded-full">
							<span className="text-xs font-medium text-accent tracking-wide uppercase">UI Prototypes</span>
						</div>
						<div className="h-px flex-1 bg-gradient-to-r from-neutral-800 to-transparent" />
					</div>
					<h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
						Modal Integration<br />
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-teal-400">Options for InviteeSelector</span>
					</h1>
					<p className="text-neutral-400 text-lg max-w-2xl leading-relaxed">
						Exploring different ways to incorporate the InviteeSelector into a modal context.
						Each option balances <span className="text-white font-medium">space constraints</span> with <span className="text-white font-medium">usability</span>.
					</p>
				</div>
			</div>

			{/* Prototypes Grid */}
			<div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
				{/* Option 1 */}
				<section>
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-2">
							<span className="text-xs font-mono text-neutral-600 bg-neutral-900 px-2 py-1 rounded">01</span>
							<h2 className="text-2xl font-semibold text-white">Adaptive Width Modal</h2>
						</div>
						<p className="text-neutral-500 max-w-xl">
							Modal width changes based on the current step. Narrow for form fields, wide for invitee selection.
							The transition is animated for smooth UX.
						</p>
						<div className="flex flex-wrap gap-2 mt-3">
							<span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded">Full selector experience</span>
							<span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded">Width transition</span>
						</div>
					</div>
					<div className="p-8 border border-neutral-800 rounded-xl bg-neutral-900/30">
						<Option1AdaptiveWidth />
					</div>
				</section>

				{/* Option 2 */}
				<section>
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-2">
							<span className="text-xs font-mono text-neutral-600 bg-neutral-900 px-2 py-1 rounded">02</span>
							<h2 className="text-2xl font-semibold text-white">Compact Variant (Drawer Style)</h2>
						</div>
						<p className="text-neutral-500 max-w-xl">
							InviteeSelector uses a collapsible drawer pattern that fits within the narrow modal.
							Expands in place to show the selection interface.
						</p>
						<div className="flex flex-wrap gap-2 mt-3">
							<span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded">Fits narrow modal</span>
							<span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">Collapsible</span>
							<span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded">All-in-one view</span>
						</div>
					</div>
					<div className="p-8 border border-neutral-800 rounded-xl bg-neutral-900/30">
						<Option2CompactVariant />
					</div>
				</section>

				{/* Option 3 */}
				<section>
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-2">
							<span className="text-xs font-mono text-neutral-600 bg-neutral-900 px-2 py-1 rounded">03</span>
							<h2 className="text-2xl font-semibold text-white">Slide-out Panel</h2>
						</div>
						<p className="text-neutral-500 max-w-xl">
							Main form stays in the modal. Clicking "Select Invitees" slides in a panel from the right
							with the full selector experience. Two layers, but maximum flexibility.
						</p>
						<div className="flex flex-wrap gap-2 mt-3">
							<span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded">Full selector space</span>
							<span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">Slide animation</span>
							<span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded">Two layers</span>
						</div>
					</div>
					<div className="p-8 border border-neutral-800 rounded-xl bg-neutral-900/30">
						<Option3SlideOutPanel />
					</div>
				</section>

				{/* Option 4 */}
				<section>
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-2">
							<span className="text-xs font-mono text-neutral-600 bg-neutral-900 px-2 py-1 rounded">04</span>
							<h2 className="text-2xl font-semibold text-white">Two-Column Layout</h2>
						</div>
						<p className="text-neutral-500 max-w-xl">
							Modal is always wide (xl). Form fields are constrained with max-width on other steps.
							Invitees step uses a two-column layout with selection panel on the right.
						</p>
						<div className="flex flex-wrap gap-2 mt-3">
							<span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded">Consistent width</span>
							<span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">Side-by-side</span>
							<span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded">Constrained forms</span>
						</div>
					</div>
					<div className="p-8 border border-neutral-800 rounded-xl bg-neutral-900/30">
						<Option4TwoColumn />
					</div>
				</section>

				{/* Option 5 */}
				<section>
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-2">
							<span className="text-xs font-mono text-neutral-600 bg-neutral-900 px-2 py-1 rounded">05</span>
							<h2 className="text-2xl font-semibold text-white">Fullscreen Modal</h2>
						</div>
						<p className="text-neutral-500 max-w-xl">
							Modal expands to near-fullscreen when reaching the invitees step.
							Maximum space for selection, but a more dramatic transition.
						</p>
						<div className="flex flex-wrap gap-2 mt-3">
							<span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded">Maximum space</span>
							<span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded">Dramatic transition</span>
							<span className="px-2 py-1 bg-red-500/10 text-red-400 text-xs rounded">Jarring change</span>
						</div>
					</div>
					<div className="p-8 border border-neutral-800 rounded-xl bg-neutral-900/30">
						<Option5Fullscreen />
					</div>
				</section>

				{/* Option 6 */}
				<section>
					<div className="mb-6">
						<div className="flex items-center gap-3 mb-2">
							<span className="text-xs font-mono text-neutral-600 bg-neutral-900 px-2 py-1 rounded">06</span>
							<h2 className="text-2xl font-semibold text-white">Summary + Edit Pattern</h2>
							<span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded font-medium">Recommended</span>
						</div>
						<p className="text-neutral-500 max-w-xl">
							Modal shows a compact summary with avatar stack. "Edit" button opens a dedicated
							selector modal. Clean separation, full editing when needed.
						</p>
						<div className="flex flex-wrap gap-2 mt-3">
							<span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded">Clean form flow</span>
							<span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded">Full editor on demand</span>
							<span className="px-2 py-1 bg-purple-500/10 text-purple-400 text-xs rounded">Nested modal</span>
						</div>
					</div>
					<div className="p-8 border border-neutral-800 rounded-xl bg-neutral-900/30">
						<Option6SummaryEdit />
					</div>
				</section>

				{/* Summary */}
				<section className="border-t border-neutral-800 pt-12">
					<h2 className="text-2xl font-semibold text-white mb-6">Comparison</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
						{[
							{ name: "Adaptive Width", pros: "Smooth, full UX", cons: "Modal size jumps", best: "Step-based forms" },
							{ name: "Compact Drawer", pros: "Single modal", cons: "Cramped selection", best: "Quick selections" },
							{ name: "Slide Panel", pros: "Full space", cons: "Two overlays", best: "Complex selection" },
							{ name: "Two-Column", pros: "Always visible", cons: "Wide modal", best: "Persistent sidebar" },
							{ name: "Fullscreen", pros: "Max space", cons: "Jarring", best: "Data-heavy forms" },
							{ name: "Summary + Edit", pros: "Clean, flexible", cons: "Extra click", best: "Most use cases" },
						].map((item) => (
							<div key={item.name} className="p-4 bg-neutral-900/50 border border-neutral-800 rounded-xl">
								<h3 className="font-medium text-white mb-3">{item.name}</h3>
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-neutral-500">Pros:</span>
										<span className="text-emerald-400">{item.pros}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-neutral-500">Cons:</span>
										<span className="text-red-400">{item.cons}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-neutral-500">Best for:</span>
										<span className="text-blue-400">{item.best}</span>
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
