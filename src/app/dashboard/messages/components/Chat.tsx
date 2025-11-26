import { Chat as ChatModel } from "@/lib/models/Messages";
import classNames from "classnames";
import Image from "next/image";
import { FaEnvelope } from "react-icons/fa";

type ChatProps = {
	chat: ChatModel;
	active?: boolean;
	onClick?: () => void;
};

const Chat = ({ chat, active, onClick }: ChatProps) => {
	return (
		<div
			onClick={() => onClick && onClick()}
			className={`flex items-center gap-4 p-4 hover:bg-background-light/60 cursor-pointer border-l-2 ${
				active
					? "bg-background-light/30 border-primary"
					: "border-transparent"
			} font-medium`}>
			{chat.imageUrl ? (
				<Image src={chat.imageUrl} alt="Chat image" />
			) : (
				<div
					className={`rounded-full p-4 ${
						active ? "bg-primary/30" : "bg-background-light"
					}`}>
					<FaEnvelope />
				</div>
			)}
			<div className="flex flex-col flex-1 min-w-0 gap-1">
				<span className="truncate block">{chat.title}</span>
				<span
					className={classNames(
						"text-sm text-muted text-ellipsis overflow-hidden whitespace-nowrap",
						chat.unreadCount > 0 && "font-bold"
					)}>
					{chat.lastMessage?.content}
				</span>
			</div>
			{chat.unreadCount > 0 && (
				<div className="badge bg-accent font-bold">
					{chat.unreadCount}
				</div>
			)}
		</div>
	);
};

export default Chat;
