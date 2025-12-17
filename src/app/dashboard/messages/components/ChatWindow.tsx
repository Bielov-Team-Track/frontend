import { Button } from "@/components";
import { Chat, Message } from "@/lib/models/Messages";
import { Image as ImageIcon, Info, Paperclip, Send, Smile } from "lucide-react";
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

const ChatWindow = ({
	chat,
	messages,
	onSendMessage,
	onViewChatInfo,
	onChatUpdated,
}: ChatWindowProps) => {
	const [messageText, setMessageText] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [showInfoPanel, setShowInfoPanel] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Scroll to bottom when messages change
	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
	}, [messages]);

	// Reset input when chat changes
	useEffect(() => {
		setMessageText("");
	}, [chat.id]);

	const handleSend = async () => {
		if (!messageText.trim() || isSending) return;

		setIsSending(true);
		try {
			await onSendMessage(messageText.trim());
			setMessageText("");
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

	const sortedMessages = useMemo(() => {
		return [...messages].sort(
			(m1, m2) =>
				new Date(m1.sentAt).getTime() - new Date(m2.sentAt).getTime()
		);
	}, [messages]);

	return (
		<div className="flex flex-col flex-1 min-h-0 h-full">
			{/* Header - Fixed */}
			<div className="flex justify-between items-center h-16 bg-background/80 backdrop-blur-md shrink-0 px-6 border-b border-white/10">
				<div className="flex items-center gap-3">
					<span className="font-bold text-lg truncate text-white">
						{chat.title}
					</span>
					<span className="text-xs text-muted">
						{chat.participantIds?.length > 2
							? `${chat.participantIds.length} participants`
							: "Active now"}
					</span>
				</div>

				<Button
					variant="icon"
					color="neutral"
					leftIcon={<Info size={20} />}
					onClick={() => setShowInfoPanel(!showInfoPanel)}
					className={showInfoPanel ? "bg-accent/10 !text-accent" : ""}
					title="Chat details"
				/>
			</div>

			{/* Messages Area - Scrollable */}
			<div className="flex-1 min-h-0 overflow-y-auto">
				<div className="p-4 flex flex-col gap-2">
					{sortedMessages.map((message) => (
						<MessageComponent
							type={chat.participantIds?.length > 2 ? "group" : "direct"}
							message={message}
							key={message.id}
						/>
					))}
					<div ref={messagesEndRef} />
				</div>
			</div>

			{/* Input Area - Fixed */}
			<div className="shrink-0 p-4 border-t border-white/5 bg-background/50 backdrop-blur-md">
				<div className="max-w-4xl mx-auto bg-white/5 border border-white/10 rounded-2xl p-2 flex items-end gap-2">
					<Button
						variant="icon"
						color="neutral"
						leftIcon={<Paperclip size={18} />}
					/>
					<textarea
						value={messageText}
						onChange={(e) => setMessageText(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder="Type a message..."
						className="flex-1 bg-transparent text-white text-sm placeholder-muted resize-none outline-none py-2 max-h-32"
						rows={1}
						disabled={isSending}
					/>
					<div className="flex items-center gap-1">
						<Button
							variant="icon"
							color="neutral"
							leftIcon={<ImageIcon size={18} />}
						/>
						<Button
							variant="icon"
							color="neutral"
							leftIcon={<Smile size={18} />}
						/>
						<Button
							onClick={handleSend}
							disabled={isSending || !messageText.trim()}
							variant="icon"
							color={messageText.trim() ? "accent" : "neutral"}
							loading={isSending}
							leftIcon={<Send size={16} />}
							className="ml-1"
						/>
					</div>
				</div>
			</div>

			{/* Info Panel Overlay */}
			<ChatInfoPanel
				chat={chat}
				isOpen={showInfoPanel}
				onClose={() => setShowInfoPanel(false)}
				onChatUpdated={onChatUpdated}
			/>
		</div>
	);
};

export default ChatWindow;
