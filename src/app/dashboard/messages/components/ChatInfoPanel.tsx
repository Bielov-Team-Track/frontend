import { Button, Modal } from "@/components";
import UserProfileModal from "@/components/features/user/UserProfileModal";
import { addParticipants, removeParticipant } from "@/lib/api/messages";
import { Chat } from "@/lib/models/Messages";
import { UserProfile } from "@/lib/models/User";
import { stringToColor } from "@/lib/utils/color";
import { useAuth } from "@/providers";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, LogOut, Search, Trash, UserPlus, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import UserSelector from "./UserSelector";

type ChatInfoPanelProps = {
	chat: Chat;
	isOpen: boolean;
	onClose: () => void;
	onChatUpdated: (chatId: string) => void;
};

const ChatInfoPanel = ({ chat, isOpen, onClose, onChatUpdated }: ChatInfoPanelProps) => {
	const { userProfile: currentUser } = useAuth();
	const [participants, setParticipants] = useState<UserProfile[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isAdding, setIsAdding] = useState(false);
	const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<UserProfile[]>([]);
	const [operationLoading, setOperationLoading] = useState(false);

	const [isSearching, setIsSearching] = useState(false);
	const [participantSearchQuery, setParticipantSearchQuery] = useState("");

	const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfile | null>(null);

	const loadParticipants = useCallback(async () => {
		setIsLoading(true);
		try {
			setParticipants(chat.participants.map((p) => p.userProfile!));
		} catch (error: any) {
			console.error("Failed to load participants", error);
		} finally {
			setIsLoading(false);
		}
	}, [chat.participants]);

	useEffect(() => {
		if (isOpen) {
			loadParticipants();
			setIsAdding(false);
			setSelectedUsersToAdd([]);
			setIsSearching(false);
			setParticipantSearchQuery("");
		}
	}, [isOpen, loadParticipants]);

	const filteredParticipants = useMemo(() => {
		if (!participantSearchQuery.trim()) return participants;
		const query = participantSearchQuery.toLowerCase();
		return participants.filter(
			(p) => p.name?.toLowerCase().includes(query) || p.surname?.toLowerCase().includes(query) || p.email?.toLowerCase().includes(query),
		);
	}, [participants, participantSearchQuery]);

	const handleAddParticipants = async () => {
		if (selectedUsersToAdd.length === 0) return;

		setOperationLoading(true);
		try {
			await addParticipants(
				chat.id,
				selectedUsersToAdd.map((u) => u.id),
			);
			setIsAdding(false);
			setSelectedUsersToAdd([]);
			await onChatUpdated(chat.id);
			await loadParticipants();
		} catch (error: any) {
			console.error("Failed to add participants", error);
			alert(error.response?.data?.message || "Failed to add participants.");
		} finally {
			setOperationLoading(false);
		}
	};

	const handleRemoveParticipant = async (userId: string) => {
		const userToRemove = participants.find((p) => p.id === userId);
		const userName = userToRemove ? `${userToRemove.name} ${userToRemove.surname}` : "this user";

		if (!confirm(`Are you sure you want to remove ${userName}?`)) return;

		setOperationLoading(true);
		try {
			await removeParticipant(chat.id, userId);
			await onChatUpdated(chat.id);
			await loadParticipants();
		} catch (error: any) {
			console.error("Failed to remove participant", error);
			alert(error.response?.data?.message || "Failed to remove participant.");
		} finally {
			setOperationLoading(false);
		}
	};

	const handleParticipantClick = (user: UserProfile) => {
		setSelectedUserProfile(user);
	};

	const ChatAvatar = ({ profile, size = "md" }: { profile?: UserProfile; size?: "sm" | "md" | "lg" | "xl" }) => {
		if (!profile) return null;

		const dimensions = {
			sm: "w-8 h-8 text-xs",
			md: "w-10 h-10 text-sm",
			lg: "w-16 h-16 text-xl",
			xl: "w-24 h-24 text-3xl",
		};

		const initials = (profile.name || "?")
			.split(" ")
			.map((w) => w[0])
			.join("")
			.slice(0, 2)
			.toUpperCase();
		const bgColor = stringToColor(profile.email || "default");

		return (
			<div
				className={`${dimensions[size]} rounded-full flex items-center justify-center overflow-hidden shrink-0 relative select-none`}
				style={{ backgroundColor: !profile.imageUrl ? bgColor : undefined }}>
				{profile.imageUrl ? (
					<Image src={profile.imageUrl} alt={profile.name || "User"} fill className="object-cover" />
				) : (
					<span className="font-bold text-black/70">{initials}</span>
				)}
			</div>
		);
	};

	return (
		<>
			<Modal isOpen={isOpen} onClose={onClose} title="Chat Details" className="max-w-md bg-background border border-border">
				{isAdding ? (
					<div className="flex flex-col gap-4 h-[400px]">
						<div className="flex justify-between items-center">
							<h3 className="font-medium text-foreground">Add Participants</h3>
							<Button variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
								Cancel
							</Button>
						</div>
						<div className="flex-1 overflow-hidden border border-border rounded-xl">
							<UserSelector
								selectedUsers={selectedUsersToAdd}
								onSelectedUsersChange={setSelectedUsersToAdd}
								excludedUserIds={chat.participants.map((p) => p.userId)}
							/>
						</div>
						<Button
							onClick={handleAddParticipants}
							fullWidth
							disabled={selectedUsersToAdd.length === 0 || operationLoading}
							className="bg-accent text-white hover:bg-accent/90">
							{operationLoading ? "Adding..." : "Add Selected"}
						</Button>
					</div>
				) : (
					<div className="flex flex-col gap-6">
						{/* Header Info */}
						<div className="flex flex-col items-center text-center">
							<div className="mb-4 relative">
								{chat.participants.length > 2 ? (
									<div className="w-24 h-24 rounded-full bg-surface p-1 grid grid-cols-2 gap-1 overflow-hidden border-2 border-border shadow-inner">
										{participants.slice(0, 4).map((p) => (
											<div key={p.id} className="w-full h-full relative overflow-hidden rounded-full">
												{p.imageUrl ? (
													<Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
												) : (
													<div
														className="w-full h-full flex items-center justify-center text-[10px] font-bold text-black/60"
														style={{ backgroundColor: stringToColor(p.email || p.id) }}>
														{p.name?.[0]}
													</div>
												)}
											</div>
										))}
									</div>
								) : (
									<ChatAvatar profile={participants[0]} size="xl" />
								)}
							</div>
							<h2 className="text-xl font-bold text-foreground tracking-tight">{chat.title}</h2>
							<p className="text-sm text-muted">{chat.participants.length > 2 ? `${participants.length} participants` : "Direct Message"}</p>
						</div>

						{/* Actions Grid */}
						<div className="grid grid-cols-3 gap-3 border-y border-border py-4">
							<ActionButton icon={Bell} label="Mute" />
							<ActionButton icon={Search} label="Find" />
							<ActionButton icon={LogOut} label="Leave" danger />
						</div>

						{/* Participants List */}
						<div className="flex flex-col gap-3">
							<div className="flex justify-between items-center min-h-[40px]">
								<AnimatePresence mode="wait">
									{!isSearching ? (
										<motion.h3
											initial={{ opacity: 0, x: -10 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: -10 }}
											className="font-semibold text-foreground text-sm">
											Participants
										</motion.h3>
									) : (
										<motion.div
											initial={{ opacity: 0, width: 0 }}
											animate={{ opacity: 1, width: "100%" }}
											exit={{ opacity: 0, width: 0 }}
											className="flex-1 mr-4">
											<div className="relative flex items-center">
												<input
													autoFocus
													type="text"
													value={participantSearchQuery}
													onChange={(e) => setParticipantSearchQuery(e.target.value)}
													placeholder="Search list..."
													className="w-full bg-surface border border-border rounded-lg py-1.5 pl-3 pr-8 text-xs text-foreground placeholder:text-muted focus:outline-hidden focus:border-accent/50"
												/>
												<button
													onClick={() => {
														setIsSearching(false);
														setParticipantSearchQuery("");
													}}
													className="absolute right-2 text-muted hover:text-foreground transition-colors">
													<X size={14} />
												</button>
											</div>
										</motion.div>
									)}
								</AnimatePresence>

								<div className="flex items-center gap-1 shrink-0">
									{!isSearching && <IconButton icon={Search} tooltip="Search participants" onClick={() => setIsSearching(true)} />}
									<IconButton icon={UserPlus} tooltip="Add participants" onClick={() => setIsAdding(true)} />
								</div>
							</div>

							<div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-foreground/10">
								{isLoading ? (
									<div className="text-center py-4 text-muted text-sm">Loading...</div>
								) : filteredParticipants.length === 0 ? (
									<div className="text-center py-8 text-muted text-xs opacity-50">
										{participantSearchQuery ? "No results found" : "No participants"}
									</div>
								) : (
									filteredParticipants.map((user) => (
										<div
											key={user.id}
											className="flex items-center justify-between p-2 rounded-lg hover:bg-surface transition-colors group cursor-pointer"
											onClick={() => handleParticipantClick(user)}>
											<div className="flex items-center gap-3">
												<ChatAvatar profile={user} size="md" />
												<div className="flex flex-col">
													<span className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
														{user.name} {user.surname}
													</span>
													{user.id === currentUser?.id && (
														<span className="text-[10px] text-accent font-medium uppercase tracking-wider">You</span>
													)}
												</div>
											</div>

											{user.id !== currentUser?.id && (
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleRemoveParticipant(user.id);
													}}
													className="opacity-0 group-hover:opacity-100 p-2 text-muted hover:text-error transition-all"
													title="Remove participant">
													<Trash size={16} />
												</button>
											)}
										</div>
									))
								)}
							</div>
						</div>
					</div>
				)}
			</Modal>

			{selectedUserProfile && <UserProfileModal user={selectedUserProfile} isOpen={!!selectedUserProfile} onClose={() => setSelectedUserProfile(null)} />}
		</>
	);
};

function ActionButton({ icon: Icon, label, danger, onClick }: { icon: any; label: string; danger?: boolean; onClick?: () => void }) {
	return (
		<button
			onClick={onClick}
			className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl transition-all ${
				danger ? "bg-error/10 text-error hover:bg-error/20" : "bg-surface text-muted hover:bg-hover hover:text-foreground"
			}`}>
			<Icon size={20} />
			<span className="text-xs font-medium">{label}</span>
		</button>
	);
}

function IconButton({ icon: Icon, tooltip, onClick }: { icon: any; tooltip: string; onClick: () => void }) {
	return (
		<button onClick={onClick} title={tooltip} className="p-2 text-muted hover:text-foreground hover:bg-surface rounded-full transition-all group relative">
			<Icon size={18} />
			{/* Simple CSS-only tooltip if needed, or rely on browser title */}
		</button>
	);
}

export default ChatInfoPanel;
