import { Button, Input } from "@/components";
import { Chat as ChatModel } from "@/lib/models/Messages";
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
	return (
		<div className="flex flex-col h-full bg-background-dark">
			<div className="p-4 border-b border-muted/20 flex flex-col justify-between gap-2">
				<div className="flex justify-between">
					<span className="font-bold text-2xl">Messages</span>
					<Button
						onClick={onCreateChatClick}
						variant="icon"
						color="neutral"
						leftIcon={<FaPlus />}
						title="New Chat">
						Create chat
					</Button>
				</div>
				<div>
					<Input
						leftIcon={<FaMagnifyingGlass />}
						placeholder="Search chats..."></Input>
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
				) : (
					chats.map((chat) => (
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
