import { Avatar, Button, Input, Loader } from "@/components";
import { useDebounce } from "@/hooks/useDebounce";
import { createChat } from "@/lib/api/messages";
import { searchUsers as searchUsersAPI } from "@/lib/api/user";
import { Chat } from "@/lib/models/Messages";
import { UserProfile } from "@/lib/models/User";
import { ArrowRight, Camera, Check, ChevronRight, Search, Users, X } from "lucide-react";
import React, { useState } from "react";

interface NewChatModalProps {
	onChatCreated?: (chat: Chat) => void;
}

export default function NewChat({ onChatCreated }: NewChatModalProps) {
	const [mode, setMode] = useState<"direct" | "group">("direct");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([]);
	const [groupName, setGroupName] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// User search state
	const [users, setUsers] = useState<UserProfile[]>([]);
	const [isSearching, setIsSearching] = useState(false);
	const [searchError, setSearchError] = useState<string | null>(null);

	// Search users via API
	const searchUsers = (term: string) => {
		setSearchError(null);
		setIsSearching(true);

		searchUsersAPI({ query: term, excludeCurrentUser: true })
			.then((data) => {
				setUsers(data.items);
				setIsSearching(false);
			})
			.catch((err) => {
				setSearchError("Failed to search users");
				setIsSearching(false);
			});
	};

	const searchUsersDebounced = useDebounce(searchUsers, 300);

	const handleSearchChange = (term: string) => {
		setSearchQuery(term);
		searchUsersDebounced(term);
	};

	// Handle user selection
	const toggleUser = (user: UserProfile) => {
		if (mode === "direct") {
			// For direct message, create chat immediately with single user
			setIsCreating(true);
			setError(null);

			createChat([user])
				.then((newChat) => {
					onChatCreated && onChatCreated(newChat);
				})
				.catch((err) => {
					setError("Failed to create chat. Try again later.");
					setIsCreating(false);
				});
		} else {
			// For group, toggle selection
			const isSelected = selectedUsers.some((u) => u.id === user.id);

			if (isSelected) {
				setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
			} else {
				setSelectedUsers([...selectedUsers, user]);
			}
		}
	};

	const removeSelected = (userId: string, e: React.MouseEvent) => {
		e.stopPropagation();
		setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
	};

	const handleCreateGroup = () => {
		if (selectedUsers.length === 0 || !groupName.trim()) return;

		setIsCreating(true);
		setError(null);

		// For now, create chat with selected users
		// TODO: Add group name to API call when backend supports it
		createChat(selectedUsers)
			.then((newChat) => {
				onChatCreated && onChatCreated(newChat);
			})
			.catch((err) => {
				setError("Failed to create group chat. Try again later.");
				setIsCreating(false);
			});
	};

	return (
		<div className="min-w-60 max-w-md flex flex-col">
			{/* --- MODE SWITCHER --- */}
			<div className="flex p-1 bg-white/5 rounded-xl mb-4 border border-white/5">
				<button
					onClick={() => {
						setMode("direct");
						setSelectedUsers([]);
						setGroupName("");
						setError(null);
					}}
					className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
						mode === "direct" ? "bg-accent text-white shadow-lg" : "text-muted hover:text-white"
					}`}>
					Direct Message
				</button>
				<button
					onClick={() => {
						setMode("group");
						setError(null);
					}}
					className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
						mode === "group" ? "bg-accent text-white shadow-lg" : "text-muted hover:text-white"
					}`}>
					<Users size={14} /> New Group
				</button>
			</div>

			{/* Group Setup Area (Only visible in Group Mode) */}
			{mode === "group" && (
				<div className="mb-4 animate-in slide-in-from-top-2">
					<div className="flex items-center gap-3 mb-4">
						<div className="w-12 h-12 rounded-full bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-muted cursor-pointer hover:text-accent hover:border-accent hover:bg-accent/10 transition-all">
							<Camera size={20} />
						</div>
						<input
							type="text"
							value={groupName}
							onChange={(e) => setGroupName(e.target.value)}
							placeholder="Group Name"
							className="flex-1 bg-transparent border-b border-white/10 py-2 text-white placeholder-muted focus:outline-hidden focus:border-accent transition-colors"
						/>
					</div>

					{/* Selected Chips */}
					{selectedUsers.length > 0 && (
						<div className="flex flex-wrap gap-2 mb-2">
							{selectedUsers.map((user) => (
								<div
									key={user.id}
									className="flex items-center gap-1 pl-2 pr-1 py-1 rounded-full bg-accent/20 text-accent text-xs font-medium border border-accent/20">
									<span>
										{user.name} {user.surname}
									</span>
									<button onClick={(e) => removeSelected(user.id, e)} className="p-0.5 hover:bg-black/20 rounded-full">
										<X size={12} />
									</button>
								</div>
							))}
						</div>
					)}
				</div>
			)}

			{/* Search Bar */}
			<div className="relative mb-3">
				<Input
					type="text"
					leftIcon={<Search className="absolute left-3 top-2.5 text-muted" size={18} />}
					value={searchQuery}
					onChange={(e) => handleSearchChange(e.target.value)}
					placeholder="Search players..."
				/>
			</div>

			{/* --- USER LIST --- */}
			<div className="flex-1 overflow-y-auto space-y-1 min-h-75 max-h-100 scrollbar-thin scrollbar-thumb-white/10">
				{isSearching && (
					<div className="flex items-center justify-center py-8">
						<Loader />
					</div>
				)}

				{searchError && <div className="text-center py-8 text-error text-sm">{searchError}</div>}

				{!isSearching && !searchError && searchQuery.length >= 3 && users.length === 0 && (
					<div className="text-center py-8 text-muted text-sm">No players found.</div>
				)}

				{!isSearching &&
					!searchError &&
					users?.map((user) => {
						const isSelected = selectedUsers.some((u) => u.id === user.id);

						return (
							<div
								key={user.id}
								onClick={() => toggleUser(user)}
								className={`
                   flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all group
                   ${isSelected ? "bg-accent/10 border border-accent/30" : "hover:bg-white/5 border border-transparent"}
                 `}>
								<div className="flex items-center gap-3">
									{/* Avatar */}
									<Avatar src={user.imageUrl} name={user.name + " " + user.surname} variant="user" />

									<div>
										<div className={`text-sm font-medium ${isSelected ? "text-white" : "text-gray-200"}`}>
											{user.name} {user.surname}
										</div>
										<div className="text-xs text-muted">{user.email}</div>
									</div>
								</div>

								{/* Selection Indicator */}
								{mode === "group" ? (
									<div
										className={`
                      w-5 h-5 rounded border flex items-center justify-center transition-all
                      ${isSelected ? "bg-accent border-accent" : "border-white/20 group-hover:border-white/40"}
                   `}>
										{isSelected && <Check size={12} className="text-white" />}
									</div>
								) : (
									<ChevronRight size={16} className="text-muted group-hover:text-white" />
								)}
							</div>
						);
					})}
			</div>

			{/* Error message */}
			{error && <div className="py-2 text-error text-sm text-center mt-4">{error}</div>}

			{/* --- FOOTER (Group Mode Only) --- */}
			{mode === "group" && (
				<div className="pt-4 border-t border-white/10 mt-4">
					<Button
						onClick={handleCreateGroup}
						disabled={selectedUsers.length === 0 || !groupName.trim() || isCreating}
						loading={isCreating}
						fullWidth={true}
						color="accent"
						rightIcon={<ArrowRight size={18} />}>
						{isCreating ? "Creating..." : "Create Group Chat"}
					</Button>
				</div>
			)}
		</div>
	);
}
