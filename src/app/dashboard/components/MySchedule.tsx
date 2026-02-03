"use client";

import { Badge } from "@/components";
import { Event } from "@/lib/models/Event";
import { EventParticipant } from "@/lib/models/EventParticipant";
import { ArrowRight, Check, CreditCard } from "lucide-react";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";

interface ScheduleEvent extends Event {
	participant?: EventParticipant | null;
	isHosting?: boolean;
}

interface MyScheduleProps {
	events: ScheduleEvent[];
}

export function MySchedule({ events }: MyScheduleProps) {
	if (events.length === 0) {
		return null;
	}

	return (
		<div>
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-lg font-semibold text-white">My Schedule</h2>
				<Link
					href="/dashboard/events?view=calendar"
					className="text-sm text-accent hover:text-accent/80 transition-colors flex items-center gap-1 group"
				>
					View Calendar
					<ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
				</Link>
			</div>

			<ScrollableSchedule events={events} />
		</div>
	);
}

function ScrollableSchedule({ events }: { events: ScheduleEvent[] }) {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [showLeftFade, setShowLeftFade] = useState(false);
	const [showRightFade, setShowRightFade] = useState(true);

	const handleScroll = () => {
		if (!scrollRef.current) return;

		const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
		setShowLeftFade(scrollLeft > 0);
		setShowRightFade(scrollLeft < scrollWidth - clientWidth - 1);
	};

	useEffect(() => {
		const element = scrollRef.current;
		if (!element) return;

		// Initial check
		handleScroll();

		// Add scroll listener
		element.addEventListener("scroll", handleScroll);
		return () => element.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<div className="relative">
			{/* Left fade indicator */}
			{showLeftFade && (
				<div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
			)}

			{/* Right fade indicator */}
			{showRightFade && (
				<div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
			)}

			{/* Scrollable container */}
			<div
				ref={scrollRef}
				className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
			>
				{events.slice(0, 7).map((event) => (
					<ScheduleEventCard key={event.id} event={event} />
				))}
			</div>
		</div>
	);
}

function ScheduleEventCard({ event }: { event: ScheduleEvent }) {
	const startDate = new Date(event.startTime);
	const day = startDate.getDate();
	const dayName = startDate.toLocaleDateString(undefined, { weekday: "short" }).toUpperCase();
	const monthName = startDate.toLocaleDateString(undefined, { month: "short" }).toUpperCase();
	const time = startDate.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });

	const paymentStatus = event.participant?.payment?.status;
	const amountDue = event.budget?.amount || event.costToEnter || 0;
	const isUnpaid = amountDue > 0 && paymentStatus !== "completed";
	const isPaid = amountDue > 0 && paymentStatus === "completed";
	const isFree = amountDue === 0;

	return (
		<Link
			href={`/dashboard/events/${event.id}`}
			className="block flex-shrink-0 group"
		>
			<div className="w-[170px] rounded-2xl bg-white/5 border border-white/10 overflow-hidden transition-all duration-200 hover:bg-white/[0.07] hover:border-accent/50">
				{/* Date Header */}
				<div className="p-4 pb-3 text-center border-b border-white/10 bg-white/[0.02]">
					<div className="text-[10px] font-bold text-muted tracking-wider mb-1">
						{dayName} • {monthName}
					</div>
					<div className="text-3xl font-bold text-white tabular-nums">
						{day}
					</div>
				</div>

				{/* Event Details */}
				<div className="p-4 space-y-3">
					{/* Event Name */}
					<div className="font-semibold text-sm text-white truncate group-hover:text-accent transition-colors">
						{event.name}
					</div>

					{/* Time */}
					<div className="text-xs text-muted flex items-center gap-1">
						<span className="tabular-nums">{time}</span>
					</div>

					{/* Status Badges */}
					<div className="flex flex-wrap items-center gap-1.5">
						{isUnpaid && (
							<Badge
								variant="destructive"
								className="text-[10px] gap-1 h-5 font-semibold"
							>
								<CreditCard className="size-3" />
								${amountDue}
							</Badge>
						)}
						{isPaid && (
							<Badge
								variant="secondary"
								className="text-[10px] gap-1 h-5 font-semibold bg-success/20 text-success border-success/30"
							>
								<Check className="size-3" />
								Paid
							</Badge>
						)}
						{isFree && (
							<Badge
								variant="outline"
								className="text-[10px] h-5 font-semibold border-white/20 text-muted"
							>
								Free
							</Badge>
						)}
						{event.isHosting && (
							<Badge
								variant="default"
								className="text-[10px] h-5 font-semibold bg-accent/20 text-accent border-accent/30"
							>
								Host
							</Badge>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}
