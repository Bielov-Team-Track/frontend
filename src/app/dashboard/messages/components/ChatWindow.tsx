import { Button, TextArea } from "@/components";
import { Chat, Message } from "@/lib/models/Messages";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaEllipsisV } from "react-icons/fa";
import { FaPaperPlane } from "react-icons/fa6";
import MessageComponent from "./Message";

type ChatWindowProps = {
	chat: Chat;
	messages: Message[];
	onSendMessage: (text: string) => Promise<void>;
    onViewChatInfo: () => void;
};

const ChatWindow = ({ chat, messages, onSendMessage, onViewChatInfo }: ChatWindowProps) => {
	const [messageText, setMessageText] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Controlled dropdown
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

	// Handle outside click for dropdown
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

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
            (m1, m2) => new Date(m1.sentAt).getTime() - new Date(m2.sentAt).getTime()
        );
    }, [messages]);

	return (
		<div className="flex flex-col h-full">
			{/* Header */}
			<div className="flex justify-between items-center h-16 bg-background-dark flex-shrink-0 px-4 border-b border-muted/10">
				<span className="font-bold truncate">{chat.title}</span>
				<div className={`dropdown dropdown-end ${isDropdownOpen ? "dropdown-open" : ""}`} ref={dropdownRef}>
					<Button
						leftIcon={<FaEllipsisV />}
						variant={"icon"}
						color={"neutral"}
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
					/>
					{isDropdownOpen && (
						<ul className="dropdown-content menu p-2 shadow bg-base-200 rounded-box w-52 absolute right-0 top-full z-50 mt-2">
							<li>
								<button type="button" className="text-left" onClick={(e) => { 
                                    e.stopPropagation(); // Prevent bubbling
                                    setIsDropdownOpen(false); 
                                    onViewChatInfo(); 
                                }}>
									View chat info
								</button>
							</li>
							<li>
								<a onClick={() => setIsDropdownOpen(false)}>
									Mute notifications
								</a>
							</li>
							<li>
								<a onClick={() => setIsDropdownOpen(false)}>
									Search in chat
								</a>
							</li>
							<li>
								<a onClick={() => setIsDropdownOpen(false)}>
									Pin chat
								</a>
							</li>
							<li className="border-t border-muted/20 mt-2 pt-2">
								<a onClick={() => setIsDropdownOpen(false)}>
									Clear chat history
								</a>
							</li>
							<li>
								<a
									onClick={() => setIsDropdownOpen(false)}
									className="text-warning">
									Leave chat
								</a>
							</li>
							<li>
								<a
									onClick={() => setIsDropdownOpen(false)}
									className="text-error">
									Delete chat
								</a>
							</li>
						</ul>
					)}
				</div>
			</div>

			{/* Messages Area */}
			<div className="flex-grow overflow-y-auto p-4 flex flex-col gap-2">
				{sortedMessages.map((message) => (
					<MessageComponent
						type={
							chat.participantIds?.length > 2
								? "group"
								: "direct"
						}
						message={message}
						key={message.id}
					/>
				))}
				<div ref={messagesEndRef} />
			</div>

			{/* Input Area */}
			<div className="p-4 border-t border-muted/20 flex-shrink-0 bg-background-dark/50">
				<div className="flex items-end gap-2">
					<TextArea
						minRows={1}
						maxRows={4}
						textAreaSize="sm"
						placeholder="Type a message..."
						value={messageText}
						onChange={(e) => setMessageText(e.target.value)}
						onKeyDown={handleKeyDown}
						disabled={isSending}
                        className="flex-1"
					/>
					<Button
						onClick={handleSend}
						variant={"icon"}
						color={"neutral"}
						leftIcon={<FaPaperPlane />}
						loading={isSending}
						disabled={isSending || !messageText.trim()}
					/>
				</div>
			</div>
		</div>
	);
};

export default ChatWindow;
