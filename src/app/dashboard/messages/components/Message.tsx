import { Avatar } from "@/components";
import { useAuth } from "@/lib/auth/authContext";
import { Message } from "@/lib/models/Messages";
import { getFormattedTime } from "@/lib/utils/date";
import getUknownUser from "@/lib/utils/user";
import classNames from "classnames";

type MessageProps = {
	message: Message;
	type?: "direct" | "group";
};

const MessageComponent = ({ message }: MessageProps) => {
	const user = useAuth().userProfile;
	const uknownUser = getUknownUser();

	const currentUserMessage = message.sender?.userId === user?.userId;
	return (
		<div
			className={classNames(
				"flex gap-2 p-4 items-start",
				currentUserMessage ? "flex-row-reverse" : ""
			)}>
			<div className="flex-grow-1 cursor-pointer">
				<Avatar profile={message.sender ?? uknownUser} />
			</div>
			<div
				className={classNames(
					currentUserMessage ? "text-right" : "text-left",
					"w-full"
				)}>
				<div
					className={`inline-block p-2 rounded-lg max-w-[70%] relative break-all ${
						currentUserMessage
							? "bg-primary text-primary-foreground"
							: "bg-muted/10"
					}`}>
					{message.content}
				</div>
				<div className="opacity-60 text-xs">
					{getFormattedTime(message.sentAt)}
				</div>
			</div>
		</div>
	);
};

export default MessageComponent;
