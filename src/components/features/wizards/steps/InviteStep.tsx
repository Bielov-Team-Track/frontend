"use client";

import { Avatar, Input } from "@/components/ui";
import { searchUsers } from "@/lib/api/user";
import { UserProfile } from "@/lib/models/User";
import { Search, UserPlus, X } from "lucide-react";
import { useState } from "react";

interface InvitePeopleStepProps {
	selectedUsers: UserProfile[];
	onUserAdd: (user: UserProfile) => void;
	onUserRemove: (userId: string) => void;
	title?: string;
	subtitle?: string;
}

export function InvitePeopleStep({
	selectedUsers,
	onUserAdd,
	onUserRemove,
	title = "Invite People",
	subtitle = "Search and invite users to your event.",
}: InvitePeopleStepProps) {
	const [query, setQuery] = useState("");
	const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
	const [isSearching, setIsSearching] = useState(false);

	const handleSearch = async (value: string) => {
		setQuery(value);
		if (value.length < 2) {
			setSearchResults([]);
			return;
		}

		setIsSearching(true);
		try {
			const response = await searchUsers({ query: value });
			const results = response.items || [];
			// Filter out already selected users
			const filtered = results.filter((user) => !selectedUsers.some((s) => s.id === user.id));
			setSearchResults(filtered);
		} finally {
			setIsSearching(false);
		}
	};

	const handleSelect = (user: UserProfile) => {
		onUserAdd(user);
		setQuery("");
		setSearchResults([]);
	};

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-foreground mb-1">{title}</h2>
				<p className="text-muted-foreground text-sm">{subtitle}</p>
			</div>

			{/* Search Input */}
			<div className="relative">
				<Input type="text" placeholder="Search by name or email..." value={query} onChange={(e) => handleSearch(e.target.value)} className="pl-10" />
				<Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
			</div>

			{/* Search Results */}
			{searchResults.length > 0 && (
				<div className="border border-border rounded-lg max-h-50 overflow-y-auto">
					{searchResults.map((user) => (
						<button
							key={user.id}
							type="button"
							onClick={() => handleSelect(user)}
							className="w-full flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors text-left">
							<Avatar src={user.imageUrl} size="sm" />
							<div className="flex-1 min-w-0">
								<div className="font-medium truncate">
									{user.name} {user.surname}
								</div>
								{user.email && <div className="text-sm text-muted-foreground truncate">{user.email}</div>}
							</div>
							<UserPlus size={16} className="text-primary shrink-0" />
						</button>
					))}
				</div>
			)}

			{/* Selected Users */}
			{selectedUsers.length > 0 && (
				<div className="space-y-2">
					<label className="text-sm font-medium text-muted-foreground">Selected ({selectedUsers.length})</label>
					<div className="flex flex-wrap gap-2">
						{selectedUsers.map((user) => (
							<div key={user.id} className="flex items-center gap-2 bg-muted/50 rounded-full pl-1 pr-2 py-1">
								<Avatar src={user.imageUrl} name={user.name + " " + user.surname} variant="user" size="xs" />
								<span className="text-sm">
									{user.name} {user.surname}
								</span>
								<button
									type="button"
									onClick={() => onUserRemove(user.id!)}
									className="text-muted-foreground hover:text-destructive transition-colors">
									<X size={14} />
								</button>
							</div>
						))}
					</div>
				</div>
			)}

			{selectedUsers.length === 0 && query.length === 0 && (
				<div className="text-center py-8 text-muted-foreground">
					<UserPlus size={32} className="mx-auto mb-2 opacity-50" />
					<p>No users invited yet.</p>
					<p className="text-sm">Search above to add people.</p>
				</div>
			)}
		</div>
	);
}
