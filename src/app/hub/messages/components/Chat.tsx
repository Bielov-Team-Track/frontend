import { Chat as ChatModel } from "@/lib/models/Messages";
import { stringToColor } from "@/lib/utils/color";
import { clsx } from "clsx";
import { MessageCircle } from "lucide-react";
import Image from "next/image";

type ChatProps = {
	chat: ChatModel;
	active?: boolean;
	onClick?: () => void;
	currentUserId?: string;
};

const Chat = ({ chat, active, onClick, currentUserId }: ChatProps) => {
	const otherParticipant = currentUserId
		? chat.participants?.find((p) => p.userId !== currentUserId)
		: undefined;
	const participantProfile = otherParticipant?.userProfile;
	const avatarUrl = chat.imageUrl || participantProfile?.imageUrl;
	const initials = participantProfile
		? `${participantProfile.name?.[0] ?? ""}${participantProfile.surname?.[0] ?? ""}`.toUpperCase()
		: undefined;

	return (
		<div
			data-testid="chat-item"
			onClick={() => onClick && onClick()}
			className={`flex items-center gap-4 p-4 mx-2 my-1 rounded-xl cursor-pointer transition-all border border-transparent ${
				active
					? "bg-accent/10 border-accent/20"
					: "hover:bg-hover hover:border-border"
			}`}>
			{avatarUrl ? (
				<Image
					src={avatarUrl}
					alt="Chat image"
					width={48}
					height={48}
					className="rounded-full object-cover w-12 h-12"
				/>
			) : initials ? (
				<div
					className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
					style={{ backgroundColor: stringToColor(participantProfile!.name + participantProfile!.surname) }}>
					{initials}
				</div>
			) : (
				<div
					className={`w-12 h-12 rounded-full flex items-center justify-center ${
						active
							? "bg-accent text-foreground shadow-lg shadow-accent/20"
							: "bg-surface text-muted"
					}`}>
					<MessageCircle size={20} />
				</div>
			)}
			<div className="flex flex-col flex-1 min-w-0 gap-0.5">
				<div className="flex justify-between items-center gap-1">
					<span
						data-testid="chat-title"
						className={`text-sm font-semibold truncate ${
							active ? "text-accent" : "text-foreground"
						}`}>
						{chat.title}
					</span>
					{chat.lastMessage && (
						<span data-testid="chat-timestamp" className="text-[10px] text-muted">
							{new Date(
								chat.lastMessage.sentAt
							).toLocaleTimeString([], {
								hour: "2-digit",
								minute: "2-digit",
							})}
						</span>
					)}
				</div>
				<span
					data-testid="chat-last-message"
					className={clsx(
						"text-xs text-ellipsis overflow-hidden whitespace-nowrap",
						chat.unreadCount > 0
							? "text-foreground font-medium"
							: "text-muted"
					)}>
					{chat.lastMessage?.content || "No messages yet"}
				</span>
			</div>
			{chat.unreadCount > 0 && (
				<div data-testid="unread-badge" className="min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-accent text-[10px] font-bold text-foreground shadow-xs">
					{chat.unreadCount}
				</div>
			)}
		</div>
	);
};

export default Chat;
