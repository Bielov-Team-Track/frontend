import { Button, Input } from "@/components";
import { Chat as ChatModel } from "@/lib/models/Messages";
import { Plus, Search } from "lucide-react";
import Chat from "./Chat";

type ChatListProps = {
	chats: ChatModel[];
	selectedChatId?: string;
	onSelectChat: (chat: ChatModel) => void;
	onCreateChatClick: () => void;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	onLoadMore?: () => void;
	hasMore?: boolean;
	isLoadingMore?: boolean;
	currentUserId?: string;
	collapsed?: boolean;
};

const ChatList = ({
	chats,
	selectedChatId,
	onSelectChat,
	onCreateChatClick,
	searchQuery,
	onSearchChange,
	onLoadMore,
	hasMore,
	isLoadingMore,
	currentUserId,
	collapsed,
}: ChatListProps) => {
	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		if (!hasMore || isLoadingMore || !onLoadMore) return;
		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
		if (scrollHeight - scrollTop - clientHeight < 200) {
			onLoadMore();
		}
	};
	return (
		<div data-testid="chat-list" className="flex flex-col h-full bg-background/50 backdrop-blur-xl border border-border overflow-hidden shadow-2xl">
			<div className={`border-b border-border flex flex-col justify-between ${collapsed ? "p-2 items-center" : "p-4 gap-4"}`}>
				{collapsed ? (
					<Button
						data-testid="new-chat-button"
						onClick={onCreateChatClick}
						size="icon" variant="ghost"
						color="neutral"
						className="bg-surface hover:bg-hover text-foreground rounded-full w-8 h-8 p-0"
						title="New Chat">
						<Plus size={18} />
					</Button>
				) : (
					<>
						<div className="flex justify-between items-center px-1">
							<span className="font-bold text-xl tracking-tight text-foreground">
								Messages
							</span>
							<Button
								data-testid="new-chat-button"
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
								data-testid="search-chats"
								leftIcon={<Search className="text-muted-foreground" size={16} />}
								placeholder="Search chats..."
								value={searchQuery}
								onChange={(e) => onSearchChange(e.target.value)}
							/>
						</div>
					</>
				)}
			</div>

			<div className={`overflow-y-auto flex-1 space-y-1 scrollbar-thin scrollbar-thumb-foreground/10 ${collapsed ? "p-1" : "p-2"}`} onScroll={handleScroll}>
				{chats.length === 0 && !searchQuery ? (
					collapsed ? (
						<div data-testid="empty-chat-list" className="flex justify-center py-4">
							<div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
								<Plus size={18} className="opacity-50" />
							</div>
						</div>
					) : (
						<div data-testid="empty-chat-list" className="p-8 text-center text-muted-foreground flex flex-col items-center gap-4 h-full justify-center">
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
					)
				) : chats.length === 0 && searchQuery ? (
					<div data-testid="no-search-results" className={`text-center text-muted-foreground h-full flex flex-col items-center justify-center ${collapsed ? "p-2" : "p-8"}`}>
						<Search size={collapsed ? 18 : 24} className="mb-2 opacity-50" />
						{!collapsed && (
							<span className="text-sm">
								No chats found matching &quot;{searchQuery}&quot;
							</span>
						)}
					</div>
				) : (
					<>
						{chats.map((chat) => (
							<Chat
								chat={chat}
								key={chat.id}
								active={selectedChatId === chat.id}
								onClick={() => onSelectChat(chat)}
								currentUserId={currentUserId}
								collapsed={collapsed}
							/>
						))}
						{isLoadingMore && (
							<div data-testid="loading-more-chats" className="flex justify-center py-3">
								<div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-accent rounded-full animate-spin" />
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
};

export default ChatList;
