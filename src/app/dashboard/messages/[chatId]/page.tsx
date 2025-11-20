"use client";

import { Loader } from "@/components";
import { Chat } from "@/lib/models/Messages";
import { loadConversationsForUser as loadChatsForUser } from "@/lib/requests/messages";
import { useEffect, useState } from "react";

const MessagesPage = () => {
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [chats, setChats] = useState<Chat[]>([]);

	useEffect(() => {
		loadChatsForUser()
			.then((data) => {
				setChats(data);
				setIsLoading(false);
			})
			.catch((err) => {
				setError("Failed to load conversations.");
				setIsLoading(false);
			});
	}, []);

	return (
		<div className="relative h-full w-full">
			{isLoading ? (
				<Loader className="inset-0 absolute" />
			) : chats ? (
				<div className="flex justify-center h-full">
					<div></div>
					<div>messages</div>
				</div>
			) : (
				<div>No conversations</div>
			)}
		</div>
	);
};

export default MessagesPage;
