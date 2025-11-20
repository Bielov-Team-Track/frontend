"use client";

import { useRealtimeChats } from "@/hooks/useRealtimeChats";

function ChatsRealtimeClient() {
	useRealtimeChats();
	return null;
}

export default ChatsRealtimeClient;
