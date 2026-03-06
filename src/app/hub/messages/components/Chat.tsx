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
	collapsed?: boolean;
};

const Chat = ({ chat, active, onClick, currentUserId, collapsed }: ChatProps) => {
	const otherParticipant = currentUserId
		? chat.participants?.find((p) => p.userId !== currentUserId)
		: undefined;
	const participantProfile = otherParticipant?.userProfile;
	const avatarUrl = chat.imageUrl || participantProfile?.imageUrl;
	const initials = participantProfile
		? `${participantProfile.name?.[0] ?? ""}${participantProfile.surname?.[0] ?? ""}`.toUpperCase()
		: undefined;

	const avatar = avatarUrl ? (
		<Image
			src={avatarUrl}
			alt="Chat image"
			width={48}
			height={48}
			className="rounded-full object-cover w-12 h-12 shrink-0"
		/>
	) : initials ? (
		<div
			className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
			style={{ backgroundColor: stringToColor(participantProfile!.name + participantProfile!.surname) }}>
			{initials}
		</div>
	) : (
		<div
			className={clsx(
				"w-12 h-12 rounded-full flex items-center justify-center shrink-0",
				active
					? "bg-accent text-foreground shadow-lg shadow-accent/20"
					: "bg-surface text-muted",
			)}>
			<MessageCircle size={20} />
		</div>
	);

	if (collapsed) {
		return (
			<div
				data-testid="chat-item"
				onClick={() => onClick?.()}
				title={chat.title}
				className={clsx(
					"relative flex items-center justify-center p-2 mx-auto my-1 rounded-xl cursor-pointer transition-all border border-transparent",
					active
						? "bg-accent/10 border-accent/20"
						: "hover:bg-hover hover:border-border",
				)}>
				{avatar}
				{chat.unreadCount > 0 && (
					<div data-testid="unread-badge" className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1.5 flex items-center justify-center rounded-full bg-accent text-[10px] font-bold text-foreground shadow-xs">
						{chat.unreadCount}
					</div>
				)}
			</div>
		);
	}

	return (
		<div
			data-testid="chat-item"
			onClick={() => onClick?.()}
			className={clsx(
				"flex items-center gap-4 p-4 mx-2 my-1 rounded-xl cursor-pointer transition-all border border-transparent",
				active
					? "bg-accent/10 border-accent/20"
					: "hover:bg-hover hover:border-border",
			)}>
			{avatar}
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
