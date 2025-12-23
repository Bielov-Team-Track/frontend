import { Chat as ChatModel } from "@/lib/models/Messages";
import { clsx } from "clsx";
import { MessageCircle } from "lucide-react";
import Image from "next/image";

type ChatProps = {
	chat: ChatModel;
	active?: boolean;
	onClick?: () => void;
};

const Chat = ({ chat, active, onClick }: ChatProps) => {
	return (
		<div
			onClick={() => onClick && onClick()}
			className={`flex items-center gap-4 p-4 mx-2 my-1 rounded-xl cursor-pointer transition-all border border-transparent ${
				active
					? "bg-accent/10 border-accent/20"
					: "hover:bg-white/5 hover:border-white/5"
			}`}>
			{chat.imageUrl ? (
				<Image
					src={chat.imageUrl}
					alt="Chat image"
					width={48}
					height={48}
					className="rounded-full object-cover w-12 h-12"
				/>
			) : (
				<div
					className={`w-12 h-12 rounded-full flex items-center justify-center ${
						active
							? "bg-accent text-white shadow-lg shadow-accent/20"
							: "bg-white/5 text-muted"
					}`}>
					<MessageCircle size={20} />
				</div>
			)}
			<div className="flex flex-col flex-1 min-w-0 gap-0.5">
				<div className="flex justify-between items-center gap-1">
					<span
						className={`text-sm font-semibold truncate ${
							active ? "text-white" : "text-gray-200"
						}`}>
						{chat.title}
					</span>
					{chat.lastMessage && (
						<span className="text-[10px] text-muted">
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
					className={clsx(
						"text-xs text-ellipsis overflow-hidden whitespace-nowrap",
						chat.unreadCount > 0
							? "text-white font-medium"
							: "text-muted"
					)}>
					{chat.lastMessage?.content || "No messages yet"}
				</span>
			</div>
			{chat.unreadCount > 0 && (
				<div className="min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-sm">
					{chat.unreadCount}
				</div>
			)}
		</div>
	);
};

export default Chat;
