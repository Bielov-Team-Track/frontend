import { Button, Input } from "@/components";
import { Chat as ChatModel } from "@/lib/models/Messages";
import { useMemo, useState } from "react";
import { FaMagnifyingGlass, FaPlus } from "react-icons/fa6";
import Chat from "./Chat";

type ChatListProps = {
	chats: ChatModel[];
	selectedChatId?: string;
	onSelectChat: (chat: ChatModel) => void;
	onCreateChatClick: () => void;
};

const ChatList = ({
	chats,
	selectedChatId,
	onSelectChat,
	onCreateChatClick,
}: ChatListProps) => {
	const [searchQuery, setSearchQuery] = useState("");

	// Filter chats based on search query
	const filteredChats = useMemo(() => {
		if (!searchQuery.trim()) {
			return chats;
		}

		const query = searchQuery.toLowerCase();
		return chats.filter((chat) => {
			// Search in chat title
			if (chat.title?.toLowerCase().includes(query)) {
				return true;
			}

			// Search in participant names
			if (
				chat.participants?.some(
					(participant) =>
						participant.name?.toLowerCase().includes(query) ||
						participant.surname?.toLowerCase().includes(query) ||
						participant.email?.toLowerCase().includes(query)
				)
			) {
				return true;
			}

			// Search in last message content
			if (chat.lastMessage?.content?.toLowerCase().includes(query)) {
				return true;
			}

			return false;
		});
	}, [chats, searchQuery]);

	return (
		<div className="flex flex-col h-full bg-black/30">
			<div className="p-4 border-muted/20 flex flex-col justify-between gap-2">
				<div className="flex justify-between">
					<span className="font-bold text-2xl">Messages</span>
					<Button
						onClick={onCreateChatClick}
						variant="icon"
						color="neutral"
						leftIcon={<FaPlus />}
						title="New Chat">
						new chat
					</Button>
				</div>
				<div>
					<Input
						leftIcon={<FaMagnifyingGlass />}
						placeholder="Search chats..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			<div className="overflow-y-auto flex-1">
				{chats.length === 0 ? (
					<div className="p-4 text-center text-muted flex flex-col items-center gap-2">
						<span>No chats yet.</span>
						<Button onClick={onCreateChatClick} size="sm">
							Start a conversation
						</Button>
					</div>
				) : filteredChats.length === 0 ? (
					<div className="p-4 text-center text-muted">
						<span>
							No chats found matching &quot;{searchQuery}&quot;
						</span>
					</div>
				) : (
					filteredChats.map((chat) => (
						<Chat
							chat={chat}
							key={chat.id}
							active={selectedChatId === chat.id}
							onClick={() => onSelectChat(chat)}
						/>
					))
				)}
			</div>
		</div>
	);
};

export default ChatList;
