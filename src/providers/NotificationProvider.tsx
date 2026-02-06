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
			<Toaster
				position="top-right"
				offset={16}
				style={{ top: 72 }}
				theme="dark"
				toastOptions={{
					className: "!bg-popover !text-popover-foreground !border-border",
					style: {
						background: "var(--popover)",
						border: "1px solid hsl(var(--border))",
						boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
					},
				}}
			/>
		</>
	);
}
