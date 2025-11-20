import { Avatar, Button, Loader } from "@/components";
import { useAuth } from "@/lib/auth/authContext";
import { Chat } from "@/lib/models/Messages";
import { UserProfile } from "@/lib/models/User";
import {
	addParticipants,
	removeParticipant,
} from "@/lib/requests/messages";
import { getUserProfile } from "@/lib/requests/user";
import { useEffect, useState, useCallback } from "react";
import { FaPlus, FaTrash } from "react-icons/fa6";
import UserSelector from "./UserSelector";

type ChatInfoModalProps = {
	chat: Chat;
	onClose: () => void;
    onChatUpdated: (chatId: string) => void;
};

const ChatInfoModal = ({ chat, onClose, onChatUpdated }: ChatInfoModalProps) => {
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
			console.error("Failed to load participants", error.response?.data || error.message || error);
		} finally {
			setIsLoading(false);
		}
	}, [chat.participantIds]);

	useEffect(() => {
		loadParticipants();
	}, [loadParticipants]);

	const handleAddParticipants = async () => {
        if (selectedUsersToAdd.length === 0) return;
        
        setOperationLoading(true);
        try {
            await addParticipants(chat.id, selectedUsersToAdd.map(u => u.userId));
            setIsAdding(false);
            setSelectedUsersToAdd([]);
            onChatUpdated(chat.id);
            // Reload participants will happen when parent updates chat and passes new props, 
            // or we can manually reload if parent doesn't update immediately.
            // Ideally onChatUpdated causes a refresh of the chat object in parent.
        } catch (error) {
            console.error("Failed to add participants", error);
        } finally {
            setOperationLoading(false);
        }
	};

    const handleRemoveParticipant = async (userId: string) => {
        if (!confirm("Are you sure you want to remove this user?")) return;

        setOperationLoading(true);
        try {
            await removeParticipant(chat.id, userId);
            onChatUpdated(chat.id);
        } catch (error) {
            console.error("Failed to remove participant", error);
        } finally {
             setOperationLoading(false);
        }
    };

	if (isLoading) {
		return (
			<div className="w-96 h-64 relative">
				<Loader className="absolute inset-0" />
			</div>
		);
	}

	if (isAdding) {
		return (
			<div className="w-96 flex flex-col gap-4 h-[500px]">
				<div className="flex justify-between items-center">
					<span className="font-bold">Add Participants</span>
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
					disabled={selectedUsersToAdd.length === 0 || operationLoading}>
					{operationLoading ? "Adding..." : "Add Selected"}
				</Button>
			</div>
		);
	}

	return (
		<div className="w-96 flex flex-col gap-4 max-h-[80vh]">
            <div className="flex justify-between items-center">
			    <span className="font-bold">Participants ({participants.length})</span>
                <Button size="sm" variant="ghost" leftIcon={<FaPlus />} onClick={() => setIsAdding(true)}>
                    Add
                </Button>
            </div>
			
			<div className="flex flex-col gap-2 overflow-y-auto">
				{participants.map((user) => (
					<div
						key={user.userId}
						className="flex justify-between items-center p-2 hover:bg-background-light rounded-md">
						<div className="flex items-center gap-3">
							<Avatar profile={user} size="small" />
							<span>
								{user.name} {user.surname}
                                {user.userId === currentUser?.userId && " (You)"}
							</span>
						</div>
                        {user.userId !== currentUser?.userId && (
                            <Button 
                                variant="icon" 
                                color="error" 
                                size="sm" 
                                disabled={operationLoading}
                                onClick={() => handleRemoveParticipant(user.userId)}
                                title="Remove participant"
                            >
                                <FaTrash />
                            </Button>
                        )}
					</div>
				))}
			</div>
            
            {operationLoading && <div className="text-center text-sm text-muted">Updating...</div>}
		</div>
	);
};

export default ChatInfoModal;
