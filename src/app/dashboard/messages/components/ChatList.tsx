import { Button, Input } from "@/components";
import { Chat as ChatModel } from "@/lib/models/Messages";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
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
						participant.userProfile?.name?.toLowerCase().includes(query) ||
						participant.userProfile?.surname?.toLowerCase().includes(query) ||
						participant.userProfile?.email?.toLowerCase().includes(query)
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
		<div className="flex flex-col h-full bg-background/50 backdrop-blur-xl border border-border  overflow-hidden shadow-2xl">
			<div className="p-4 border-b border-border flex flex-col justify-between gap-4">
				<div className="flex justify-between items-center px-1">
					<span className="font-bold text-xl tracking-tight text-foreground">
						Messages
					</span>
					<Button
						onClick={onCreateChatClick}
						size="icon" variant="ghost"
						color="neutral"
						className="bg-surface hover:bg-hover text-foreground rounded-full w-8 h-8 p-0"
						title="New Chat">
						<Plus size={18} />
					</Button>
				</div>
				<div className="relative">
					<Input
						leftIcon={<Search className="text-muted-foreground" size={16} />}
						placeholder="Search chats..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			<div className="overflow-y-auto flex-1 p-2 space-y-1 scrollbar-thin scrollbar-thumb-foreground/10">
				{chats.length === 0 ? (
					<div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-4 h-full justify-center">
						<div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center">
							<Plus size={24} className="opacity-50" />
						</div>
						<span className="text-sm">
							No chats yet. Start connecting!
						</span>
						<Button
							onClick={onCreateChatClick}
							size="sm"
							variant="outline"
							color="neutral">
							Start a conversation
						</Button>
					</div>
				) : filteredChats.length === 0 ? (
					<div className="p-8 text-center text-muted-foreground h-full flex flex-col items-center justify-center">
						<Search size={24} className="mb-2 opacity-50" />
						<span className="text-sm">
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
