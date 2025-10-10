import { Event } from "@/lib/models/Event";

interface ViewComponentProps {
	events: Event[];
	date: Date;
	onEventClick: (eventId: string) => void;
	scrollToNow?: boolean;
	onViewChange?: (view: "month" | "week" | "year", date: Date) => void;
}

export type { ViewComponentProps };
