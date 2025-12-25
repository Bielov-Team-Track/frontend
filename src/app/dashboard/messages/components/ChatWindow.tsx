import { Button } from "@/components";
import { useAuth } from "@/providers";
import { Chat, Message } from "@/lib/models/Messages";
import { stringToColor } from "@/lib/utils/color";
import { getFormattedDate } from "@/lib/utils/date";
import { ChevronDown, Image as ImageIcon, Info, Paperclip, Send, Smile } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import ChatInfoPanel from "./ChatInfoPanel";
import MessageComponent from "./Message";

type ChatWindowProps = {
	chat: Chat;
	messages: Message[];
	onSendMessage: (text: string) => Promise<void>;
	onViewChatInfo: () => void;
	onChatUpdated: (chatId: string) => void;
};

const ChatWindow = ({ chat, messages, onSendMessage, onViewChatInfo, onChatUpdated }: ChatWindowProps) => {
	const { userProfile: currentUser } = useAuth();
	const [messageText, setMessageText] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [showInfoPanel, setShowInfoPanel] = useState(false);
	const [showScrollToBottom, setShowScrollToBottom] = useState(false);

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const textAreaRef = useRef<HTMLTextAreaElement>(null);

	// Determine chat title and image
	const isGroup = (chat.participants?.length || 0) > 2;
	const otherParticipant = chat.participants?.find((p) => p.userId !== currentUser?.userId);
	const chatTitle = chat.title || otherParticipant?.userProfile?.name || "Unknown Chat";
	const chatSubtitle = isGroup ? `${chat.participants?.length} participants` : otherParticipant?.role || "Active now";

	const chatImage = chat.imageUrl || (isGroup ? undefined : otherParticipant?.userProfile?.imageUrl);
	const fallbackInitial = chatTitle.charAt(0).toUpperCase();
	const fallbackColor = stringToColor(isGroup ? `group_${chat.id}` : otherParticipant?.userProfile?.email || "default");

	// Scroll to bottom when messages change
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "auto" });
		}
	}, [messages]);

	// Reset input when chat changes
	useEffect(() => {
		setMessageText("");
		if (textAreaRef.current) {
			textAreaRef.current.style.height = "auto";
		}
	}, [chat.id]);

	const handleScroll = () => {
		if (!scrollAreaRef.current) return;
		const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
		const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
		setShowScrollToBottom(!isNearBottom);
	};

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const handleSend = async () => {
		if (!messageText.trim() || isSending) return;

		setIsSending(true);
		try {
			await onSendMessage(messageText.trim());
			setMessageText("");
			if (textAreaRef.current) {
				textAreaRef.current.style.height = "auto";
			}
		} finally {
			setIsSending(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setMessageText(e.target.value);
		// Auto-grow
		e.target.style.height = "auto";
		e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`; // Max 128px
	};

	const sortedMessages = useMemo(() => {
		return [...messages].sort((m1, m2) => new Date(m1.sentAt).getTime() - new Date(m2.sentAt).getTime());
	}, [messages]);

	// Group messages by date
	const groupedMessages = useMemo(() => {
		const groups: { date: string; messages: Message[] }[] = [];
		let currentDate = "";

		sortedMessages.forEach((msg) => {
			const msgDate = getFormattedDate(msg.sentAt);
			if (msgDate !== currentDate) {
				currentDate = msgDate;
				groups.push({ date: currentDate, messages: [] });
			}
			groups[groups.length - 1].messages.push(msg);
		});

		return groups;
	}, [sortedMessages]);

	return (
		<div className="flex flex-col flex-1 min-h-0 h-full relative bg-background">
			{/* Header */}
			<div className="flex justify-between items-center h-16 bg-background/80 backdrop-blur-md shrink-0 px-4 border-b border-white/10 z-10">
				<div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowInfoPanel(!showInfoPanel)}>
					<div
						className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden shrink-0 relative"
						style={{ backgroundColor: !chatImage ? fallbackColor : undefined }}>
						{chatImage ? (
							<Image src={chatImage} alt={chatTitle} fill className="object-cover" />
						) : (
							<span className="text-white font-bold">{fallbackInitial}</span>
						)}
					</div>
					<div className="flex flex-col">
						<span className="font-bold text-base leading-tight truncate text-white max-w-[200px] md:max-w-md">{chatTitle}</span>
						<span className="text-xs text-muted">{chatSubtitle}</span>
					</div>
				</div>

				<div className="flex items-center gap-1">
					<Button
						variant="icon"
						color="neutral"
						leftIcon={<Info size={20} />}
						onClick={() => setShowInfoPanel(!showInfoPanel)}
						className={showInfoPanel ? "bg-accent/10 text-accent!" : ""}
						title="Chat details"
					/>
				</div>
			</div>

			{/* Messages Area */}
			<div ref={scrollAreaRef} onScroll={handleScroll} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 space-y-6 relative">
				{messages.length === 0 ? (
					<div className="absolute inset-0 flex flex-col items-center justify-center text-muted opacity-50 gap-2">
						<div className="bg-white/5 p-4 rounded-full">
							<Smile size={48} />
						</div>
						<p>No messages yet. Start the conversation!</p>
					</div>
				) : (
					groupedMessages.map((group) => (
						<div key={group.date} className="space-y-4">
							<div className="flex justify-center sticky top-0 z-0">
								<span className="bg-background/80 backdrop-blur-xs border border-white/5 text-xs font-medium px-3 py-1 rounded-full text-muted shadow-xs">
									{group.date}
								</span>
							</div>
							<div className="flex flex-col gap-1">
								{group.messages.map((message) => (
									<MessageComponent key={message.id} type={isGroup ? "group" : "direct"} message={message} />
								))}
							</div>
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>

			{/* Scroll to Bottom Button */}
			{showScrollToBottom && (
				<button
					onClick={scrollToBottom}
					className="absolute bottom-28 right-8 bg-white/10 text-white p-2 rounded-full shadow-lg hover:bg-accent/90 transition-all z-20 animate-in fade-in zoom-in">
					<ChevronDown size={20} />
				</button>
			)}

			{/* Input Area */}
			<div className="shrink-0 p-4 bg-background/50 backdrop-blur-md border-t border-white/5 z-10">
				<div className="max-w-4xl mx-auto flex items-center gap-2 bg-white/5 p-2 rounded-3xl border border-white/10 focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/50 transition-all shadow-xs">
					<button className="p-2.5 rounded-full text-muted hover:text-white hover:bg-white/10 transition-colors">
						<Paperclip size={20} />
					</button>

					<textarea
						ref={textAreaRef}
						value={messageText}
						onChange={handleTextChange}
						onKeyDown={handleKeyDown}
						placeholder="Type a message..."
						className="flex-1 bg-transparent border-0 focus:ring-0 text-sm text-white placeholder:text-muted resize-none py-2.5 max-h-32 min-h-[40px] leading-relaxed outline-hidden"
						rows={1}
						disabled={isSending}
					/>

					<div className="flex items-center gap-1">
						<button className="p-2.5 rounded-full text-muted hover:text-white hover:bg-white/10 transition-colors">
							<ImageIcon size={20} />
						</button>
						<button className="p-2.5 rounded-full text-muted hover:text-white hover:bg-white/10 transition-colors">
							<Smile size={20} />
						</button>
						<button
							onClick={handleSend}
							disabled={isSending || !messageText.trim()}
							className={`ml-1 p-2.5 rounded-full transition-all ${
								messageText.trim()
									? "bg-accent text-white hover:bg-accent/90"
									: "text-muted hover:text-white hover:bg-white/10"
							} disabled:opacity-50`}>
							<Send size={18} />
						</button>
					</div>
				</div>
			</div>

			{/* Info Panel Overlay */}
			<ChatInfoPanel chat={chat} isOpen={showInfoPanel} onClose={() => setShowInfoPanel(false)} onChatUpdated={onChatUpdated} />
		</div>
	);
};

export default ChatWindow;
