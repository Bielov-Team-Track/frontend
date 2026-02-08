"use client";

import { AppShell } from "@/components/layout";
import { PraiseNotification } from "@/components/features/feedback/PraiseNotification";
import type { BadgeType } from "@/components/features/feedback/BadgeDisplay";
import { ClubProvider } from "@/providers";
import { CreateModalsProvider } from "@/providers/CreateModalsProvider";
import { NotificationProvider } from "@/providers/NotificationProvider";
import { useState } from "react";

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const [praiseNotification, setPraiseNotification] = useState<{
		isOpen: boolean;
		badgeType: BadgeType;
		message: string;
		coachName: string;
	}>({
		isOpen: false,
		badgeType: "FirstEvent",
		message: "",
		coachName: "",
	});

	return (
		<ClubProvider>
			<NotificationProvider>
				<CreateModalsProvider>
					<AppShell>{children}</AppShell>
					<PraiseNotification
						isOpen={praiseNotification.isOpen}
						onClose={() => setPraiseNotification((prev) => ({ ...prev, isOpen: false }))}
						badgeType={praiseNotification.badgeType}
						message={praiseNotification.message}
						coachName={praiseNotification.coachName}
					/>
				</CreateModalsProvider>
			</NotificationProvider>
		</ClubProvider>
	);
}
