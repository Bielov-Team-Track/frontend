import { NotificationToastContent } from "@/components/features/notifications/NotificationToast";
import { Notification } from "@/lib/models/Notification";
import { createElement } from "react";
import { toast } from "sonner";
import { create } from "zustand";

type NotificationState = {
	unreadCount: number;
	isDropdownOpen: boolean;
	connectionStatus: "disconnected" | "connecting" | "connected" | "reconnecting";

	setUnreadCount: (count: number) => void;
	incrementUnread: () => void;
	decrementUnread: (by?: number) => void;

	showNotificationToast: (notification: Notification) => void;
	updateNotificationToast: (notification: Notification) => void;
	dismissToast: (id: string) => void;
	clearToasts: () => void;

	setDropdownOpen: (open: boolean) => void;
	setConnectionStatus: (status: "disconnected" | "connecting" | "connected" | "reconnecting") => void;

	reset: () => void;
};

const TOAST_DURATION = 5000;

export const useNotificationStore = create<NotificationState>((set, get) => ({
	unreadCount: 0,
	isDropdownOpen: false,
	connectionStatus: "disconnected",

	setUnreadCount: (count) => set({ unreadCount: count }),
	incrementUnread: () => set((s) => ({ unreadCount: s.unreadCount + 1 })),
	decrementUnread: (by = 1) => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - by) })),

	showNotificationToast: (notification) => {
		const { isDropdownOpen } = get();
		if (isDropdownOpen) return;

		toast.custom((toastId) => createElement(NotificationToastContent, { notification, toastId }), {
			id: notification.id,
			duration: TOAST_DURATION,
		});
	},

	updateNotificationToast: (notification) => {
		const { isDropdownOpen } = get();
		if (isDropdownOpen) return;

		toast.custom((toastId) => createElement(NotificationToastContent, { notification, toastId }), {
			id: notification.id,
			duration: TOAST_DURATION,
		});
	},

	dismissToast: (id) => {
		toast.dismiss(id);
	},

	clearToasts: () => {
		toast.dismiss();
	},

	setDropdownOpen: (open) => {
		set({ isDropdownOpen: open });
		if (open) toast.dismiss();
	},

	setConnectionStatus: (status) => set({ connectionStatus: status }),

	reset: () => {
		toast.dismiss();
		set({
			unreadCount: 0,
			isDropdownOpen: false,
			connectionStatus: "disconnected",
		});
	},
}));
