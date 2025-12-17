"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Avatar } from "@/components";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import { ClubRole } from "@/lib/models/Club";
import { UserProfile } from "@/lib/models/User";
import { searchUsers } from "@/lib/requests/user";

interface InviteMemberModalProps {
	isOpen: boolean;
	onClose: () => void;
	onInvite: (data: { userId: string; role: string }) => void;
	isLoading?: boolean;
}

export default function InviteMemberModal({
	isOpen,
	onClose,
	onInvite,
	isLoading = false,
}: InviteMemberModalProps) {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
	const [role, setRole] = useState<string>(ClubRole.Member);

	const handleSearch = async () => {
		if (!searchQuery.trim()) return;
		setIsSearching(true);
		try {
			const results = await searchUsers(searchQuery);
			setSearchResults(results || []);
		} catch (error) {
			console.error("Search failed:", error);
		} finally {
			setIsSearching(false);
		}
	};

	const handleInvite = () => {
		if (!selectedUser) return;
		onInvite({ userId: selectedUser.userId, role });
	};

	const handleClose = () => {
		setSearchQuery("");
		setSearchResults([]);
		setSelectedUser(null);
		setRole(ClubRole.Member);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Invite Member" size="md">
			<div className="space-y-6">
				{!selectedUser ? (
					<div className="space-y-4">
						{/* Search Input */}
						<div className="flex gap-2">
							<div className="relative flex-1">
								<Search
									className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
									size={18}
								/>
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleSearch()}
									placeholder="Search by name or email..."
									className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-accent"
								/>
							</div>
							<Button
								variant="ghost"
								color="neutral"
								onClick={handleSearch}
								disabled={isSearching || !searchQuery.trim()}
								loading={isSearching}>
								Search
							</Button>
						</div>

						{/* Search Results */}
						<div className="space-y-2 max-h-[300px] overflow-y-auto">
							{searchResults.length > 0 ? (
								searchResults.map((user) => (
									<button
										key={user.userId}
										onClick={() => setSelectedUser(user)}
										className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-accent hover:bg-accent/10 transition-colors text-left">
										<Avatar profile={user} />
										<div>
											<div className="font-medium text-white">
												{user.name} {user.surname}
											</div>
											<div className="text-xs text-muted">{user.email}</div>
										</div>
									</button>
								))
							) : searchQuery && !isSearching ? (
								<div className="text-center py-8 text-muted">
									<p>No users found</p>
								</div>
							) : null}
						</div>
					</div>
				) : (
					<div className="space-y-6">
						{/* Selected User Display */}
						<div className="flex items-center gap-4 p-4 rounded-xl bg-accent/10 border border-accent/20">
							<Avatar profile={selectedUser} />
							<div className="flex-1">
								<div className="font-bold text-white">
									{selectedUser.name} {selectedUser.surname}
								</div>
								<div className="text-sm text-muted">{selectedUser.email}</div>
							</div>
							<button
								onClick={() => setSelectedUser(null)}
								className="text-xs text-accent hover:underline">
								Change
							</button>
						</div>

						{/* Role Selection */}
						<div>
							<label className="block text-sm font-medium text-white mb-2">
								Select Role
							</label>
							<div className="space-y-2">
								{Object.values(ClubRole).map((r) => (
									<label
										key={r}
										className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
											role === r
												? "bg-accent/20 border-accent"
												: "bg-white/5 border-white/10 hover:border-white/20"
										}`}>
										<div className="flex items-center gap-3">
											<input
												type="radio"
												name="role"
												value={r}
												checked={role === r}
												onChange={(e) => setRole(e.target.value)}
												className="accent-accent"
											/>
											<span className="text-white">{r}</span>
										</div>
									</label>
								))}
							</div>
						</div>
					</div>
				)}

				{/* Actions */}
				<div className="flex gap-3 pt-2">
					<Button
						variant="ghost"
						color="neutral"
						fullWidth
						onClick={handleClose}>
						Cancel
					</Button>
					<Button
						variant="solid"
						color="accent"
						fullWidth
						onClick={handleInvite}
						disabled={!selectedUser}
						loading={isLoading}>
						Invite Member
					</Button>
				</div>
			</div>
		</Modal>
	);
}
