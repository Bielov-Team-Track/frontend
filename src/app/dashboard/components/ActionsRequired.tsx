"use client";

import { Badge, Button } from "@/components";
import { Event } from "@/lib/models/Event";
import { Notification } from "@/lib/models/Notification";
import { AlertTriangle, CreditCard, Mail, UserCheck } from "lucide-react";
import Link from "next/link";

interface ActionItem {
	id: string;
	type: "payment" | "invitation" | "rsvp" | "approval";
	title: string;
	description: string;
	link: string;
	actionLabel: string;
	amount?: number;
}

interface ActionsRequiredProps {
	unpaidEvents: Array<Event & { amountDue?: number }>;
	pendingInvitations: Notification[];
	eventsNeedingRsvp: Event[];
}

export function ActionsRequired({ unpaidEvents, pendingInvitations, eventsNeedingRsvp }: ActionsRequiredProps) {
	const actions: ActionItem[] = [];

	// Add unpaid events
	if (unpaidEvents.length > 0) {
		const totalAmount = unpaidEvents.reduce((sum, e) => sum + (e.amountDue || e.paymentConfig?.cost || 0), 0);
		actions.push({
			id: "unpaid-events",
			type: "payment",
			title: `${unpaidEvents.length} event${unpaidEvents.length > 1 ? "s" : ""} need${unpaidEvents.length === 1 ? "s" : ""} payment`,
			description: unpaidEvents.map((e) => e.name).join(" · "),
			link: "/dashboard/payments",
			actionLabel: "Pay Now",
			amount: totalAmount,
		});
	}

	// Add pending invitations
	pendingInvitations.forEach((notification) => {
		const clubName = (notification.payload?.clubName as string) || "a club";
		actions.push({
			id: notification.id,
			type: "invitation",
			title: `Club invitation from "${clubName}"`,
			description: "Invited as Player",
			link: notification.payload?.clubId ? `/dashboard/clubs/${notification.payload.clubId}` : "/dashboard/notifications",
			actionLabel: "View",
		});
	});

	// Add events needing RSVP
	eventsNeedingRsvp.forEach((event) => {
		actions.push({
			id: `rsvp-${event.id}`,
			type: "rsvp",
			title: `Respond to event invitation`,
			description: event.name,
			link: `/dashboard/events/${event.id}`,
			actionLabel: "Respond",
		});
	});

	// Don't render if no actions
	if (actions.length === 0) {
		return null;
	}

	const displayActions = actions.slice(0, 3);
	const hasMore = actions.length > 3;

	const getIcon = (type: ActionItem["type"]) => {
		switch (type) {
			case "payment":
				return <CreditCard className="size-4" />;
			case "invitation":
				return <Mail className="size-4" />;
			case "rsvp":
				return <UserCheck className="size-4" />;
			case "approval":
				return <UserCheck className="size-4" />;
		}
	};

	const getIconColor = (type: ActionItem["type"]) => {
		switch (type) {
			case "payment":
				return "text-orange-500";
			case "invitation":
				return "text-blue-500";
			case "rsvp":
				return "text-purple-500";
			case "approval":
				return "text-green-500";
		}
	};

	return (
		<div className="relative rounded-2xl bg-surface border border-border overflow-hidden">
			{/* Subtle warning accent - left border glow */}
			<div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500/60 via-orange-500/40 to-orange-500/20" />
			<div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-orange-500/5 to-transparent" />

			<div className="p-6">
				{/* Header */}
				<div className="flex items-center gap-2.5 mb-5">
					<div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
						<AlertTriangle className="size-4 text-orange-500" />
					</div>
					<h3 className="font-semibold text-white">Actions Required</h3>
					{hasMore && (
						<Link
							href="/dashboard/notifications"
							className="ml-auto text-xs text-accent hover:text-accent/80 transition-colors font-medium"
						>
							View all ({actions.length})
						</Link>
					)}
				</div>

				{/* Action Items */}
				<div className="space-y-2.5">
					{displayActions.map((action) => (
						<div
							key={action.id}
							className="group relative rounded-xl bg-surface border border-border p-4 hover:bg-hover hover:border-border transition-all duration-200"
						>
							<div className="flex items-center gap-3">
								{/* Icon */}
								<div className={`flex-shrink-0 ${getIconColor(action.type)}`}>
									{getIcon(action.type)}
								</div>

								{/* Content */}
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-1">
										<span className="font-medium text-sm text-white line-clamp-1">
											{action.title}
										</span>
										{action.amount && action.amount > 0 && (
											<Badge
												variant="solid"
												color="error"
												className="text-[10px] h-5 font-semibold flex-shrink-0"
											>
												${action.amount}
											</Badge>
										)}
									</div>
									<p className="text-xs text-muted line-clamp-1">
										{action.description}
									</p>
								</div>

								{/* Action Button */}
								<Button
									size="sm"
									asChild
									className="flex-shrink-0 font-semibold shadow-none"
								>
									<Link href={action.link}>{action.actionLabel}</Link>
								</Button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
