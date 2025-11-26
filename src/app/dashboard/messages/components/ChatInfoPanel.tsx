import { Avatar, Button, Loader } from "@/components";
import { useAuth } from "@/lib/auth/authContext";
import { Chat } from "@/lib/models/Messages";
import { UserProfile } from "@/lib/models/User";
import { addParticipants, removeParticipant } from "@/lib/requests/messages";
import { getUserProfile } from "@/lib/requests/user";
import { Bell, LogOut, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import UserSelector from "./UserSelector";

type ChatInfoPanelProps = {
	chat: Chat;
	isOpen: boolean;
	onClose: () => void;
	onChatUpdated: (chatId: string) => void;
};

const ChatInfoPanel = ({
	chat,
	isOpen,
	onClose,
	onChatUpdated,
}: ChatInfoPanelProps) => {
	const { userProfile: currentUser } = useAuth();
	const [participants, setParticipants] = useState<UserProfile[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isAdding, setIsAdding] = useState(false);
	const [selectedUsersToAdd, setSelectedUsersToAdd] = useState<UserProfile[]>(
		[]
	);
	const [operationLoading, setOperationLoading] = useState(false);

	const loadParticipants = useCallback(async () => {
		setIsLoading(true);
		try {
			// Fetch all profiles in parallel
			const profiles = await Promise.all(
				chat.participantIds.map((id) => getUserProfile(id))
			);
			// Filter out undefined (in case user not found)
			setParticipants(profiles.filter((p): p is UserProfile => !!p));
		} catch (error: any) {
			console.error(
				"Failed to load participants",
				error.response?.data || error.message || error
			);
		} finally {
			setIsLoading(false);
		}
	}, [chat.participantIds]);

	useEffect(() => {
		if (isOpen) {
			loadParticipants();
			setIsAdding(false);
			setSelectedUsersToAdd([]);
		}
	}, [isOpen, loadParticipants]);

	// Reload participants when chat participant IDs change
	useEffect(() => {
		if (isOpen) {
			loadParticipants();
		}
	}, [chat.participantIds, isOpen, loadParticipants]);

	const handleAddParticipants = async () => {
		if (selectedUsersToAdd.length === 0) return;

		setOperationLoading(true);
		try {
			await addParticipants(
				chat.id,
				selectedUsersToAdd.map((u) => u.userId)
			);
			setIsAdding(false);
			setSelectedUsersToAdd([]);
			await onChatUpdated(chat.id);
			// Reload participants after update
			await loadParticipants();
		} catch (error: any) {
			console.error("Failed to add participants", error);
			alert(
				error.response?.data?.message ||
					"Failed to add participants. Please try again."
			);
		} finally {
			setOperationLoading(false);
		}
	};

	const handleRemoveParticipant = async (userId: string) => {
		const userToRemove = participants.find((p) => p.userId === userId);
		const userName = userToRemove
			? `${userToRemove.name} ${userToRemove.surname}`
			: "this user";

		if (
			!confirm(
				`Are you sure you want to remove ${userName} from this chat?`
			)
		)
			return;

		setOperationLoading(true);
		try {
			await removeParticipant(chat.id, userId);
			await onChatUpdated(chat.id);
			// Reload participants after update
			await loadParticipants();
		} catch (error: any) {
			console.error("Failed to remove participant", error);
			alert(
				error.response?.data?.message ||
					"Failed to remove participant. Please try again."
			);
		} finally {
			setOperationLoading(false);
		}
	};

	return (
		<div
			className={`
            absolute top-0 right-0 w-80 h-full bg-[#1A1A1A] border-l border-white/10 transform transition-transform duration-300 z-20 flex flex-col shadow-2xl
            ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}>
			{/* Panel Header */}
			<div className="h-16 px-6 flex items-center justify-between border-b border-white/5">
				<span className="font-bold text-white">Details</span>
				<Button
					variant="icon"
					color="neutral"
					leftIcon={<X size={20} />}
					onClick={onClose}
				/>
			</div>

			<div className="flex-1 overflow-y-auto p-6">
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader />
					</div>
				) : isAdding ? (
					/* Add Participants View */
					<div className="flex flex-col gap-4 h-full">
						<div className="flex justify-between items-center">
							<span className="font-bold text-white">
								Add Participants
							</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsAdding(false)}>
								Cancel
							</Button>
						</div>
						<div className="flex-1 overflow-hidden">
							<UserSelector
								selectedUsers={selectedUsersToAdd}
								onSelectedUsersChange={setSelectedUsersToAdd}
								excludedUserIds={chat.participantIds}
							/>
						</div>
						<Button
							onClick={handleAddParticipants}
							fullWidth
							disabled={
								selectedUsersToAdd.length === 0 ||
								operationLoading
							}>
							{operationLoading ? "Adding..." : "Add Selected"}
						</Button>
					</div>
				) : (
					/* Main Info View */
					<>
						{/* Chat Info */}
						<div className="flex flex-col items-center text-center mb-8">
							<div className="w-24 h-24 rounded-3xl bg-gray-800 mb-4 overflow-hidden border-4 border-[#1E1E1E] shadow-lg flex items-center justify-center">
								{chat.participantIds?.length > 2 ? (
									<div className="w-full h-full grid grid-cols-2 gap-0.5">
										{participants
											.slice(0, 4)
											.map((p, i) => (
												<div
													key={p.userId}
													className="w-full h-full">
													<Avatar
														profile={p}
														size="small"
													/>
												</div>
											))}
									</div>
								) : (
									participants[0] && (
										<Avatar
											profile={participants[0]}
											size="large"
										/>
									)
								)}
							</div>
							<h3 className="text-xl font-bold text-white mb-1">
								{chat.title}
							</h3>
							<p className="text-sm text-gray-400">
								{chat.participantIds?.length > 2
									? "Group Chat"
									: "Direct Message"}
							</p>
						</div>

						{/* Actions */}
						<div className="flex gap-4 justify-center mb-8 border-b border-white/5 pb-8">
							<ActionBtn icon={Bell} label="Mute" />
							<ActionBtn icon={Search} label="Search" />
							<ActionBtn icon={LogOut} label="Leave" danger />
						</div>

						{/* Participants List */}
						<div>
							<div className="flex justify-between items-center mb-4">
								<h4 className="text-sm font-bold text-white">
									Participants ({participants.length})
								</h4>
								<button
									onClick={() => setIsAdding(true)}
									disabled={operationLoading}
									className={`text-xs flex items-center gap-1 transition-colors ${
										operationLoading
											? "text-gray-600 cursor-not-allowed"
											: "text-accent cursor-pointer hover:underline"
									}`}>
									<FaPlus size={10} /> Add
								</button>
							</div>
							<div className="space-y-3">
								{participants.map((user) => (
									<div
										key={user.userId}
										className="flex items-center justify-between group cursor-pointer">
										<div className="flex items-center gap-3">
											<Avatar
												profile={user}
												size="small"
											/>
											<span className="text-sm text-gray-300 group-hover:text-white">
												{user.name} {user.surname}
												{user.userId ===
													currentUser?.userId &&
													" (You)"}
											</span>
										</div>
										{user.userId !==
											currentUser?.userId && (
											<Button
												variant="icon"
												color="error"
												size="sm"
												disabled={operationLoading}
												onClick={() =>
													handleRemoveParticipant(
														user.userId
													)
												}
												title="Remove participant">
												<FaTrash size={12} />
											</Button>
										)}
									</div>
								))}
							</div>
						</div>

						{/* Shared Media Section (Placeholder) */}
						<div className="mt-8 pt-8 border-t border-white/5">
							<h4 className="text-sm font-bold text-white mb-4">
								Shared Media
							</h4>
							<div className="grid grid-cols-3 gap-2">
								{[1, 2, 3].map((i) => (
									<div
										key={i}
										className="aspect-square bg-white/5 rounded-lg hover:bg-white/10 cursor-pointer"></div>
								))}
							</div>
						</div>

						{operationLoading && (
							<div className="text-center text-sm text-muted mt-4">
								Updating...
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

// Helper for action buttons
function ActionBtn({
	icon: Icon,
	label,
	danger,
}: {
	icon: any;
	label: string;
	danger?: boolean;
}) {
	return (
		<button className="flex flex-col items-center gap-2 group">
			<div
				className={`
                w-10 h-10 rounded-full flex items-center justify-center border transition-all
                ${
					danger
						? "border-error/30 text-error group-hover:bg-error/10"
						: "border-white/10 text-gray-400 group-hover:bg-white/5 group-hover:text-white"
				}
            `}>
				<Icon size={18} />
			</div>
			<span
				className={`text-xs ${
					danger ? "text-error" : "text-gray-500"
				}`}>
				{label}
			</span>
		</button>
	);
}

export default ChatInfoPanel;
