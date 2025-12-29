"use client";

import { Toaster } from "sonner";
import { useUnreadCount } from "@/hooks/useNotifications";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { ReactNode, useEffect } from "react";
import { useAuth } from "./AuthProvider";

interface NotificationProviderProps {
	children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
	const { isAuthenticated } = useAuth();

	// Connect to real-time notifications when authenticated
	useRealtimeNotifications({ enabled: isAuthenticated });

	// Fetch initial unread count when authenticated
	const { refetch } = useUnreadCount();

	useEffect(() => {
		if (isAuthenticated) {
			refetch();
		}
	}, [isAuthenticated, refetch]);

	return (
		<>
			{children}
			<Toaster position="top-right" offset={16} style={{ top: 72 }} />
		</>
	);
}
