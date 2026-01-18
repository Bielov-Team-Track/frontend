import { EventFormat, EventType, PlayingSurface } from "@/lib/models/Event";
import { PaymentMethod, PricingModel, Unit } from "@/lib/models/EventBudget";
import { UserProfile } from "@/lib/models/User";

export interface EventFormData {
	// Context (Step 0)
	clubId?: string;
	teamId?: string;
	groupId?: string;

	// Event Details (Step 1)
	name: string;
	description?: string;
	type: EventType;
	surface: PlayingSurface;

	// Time & Date (Step 2)
	startTime: Date;
	endTime: Date;

	// Location (Step 3)
	locationSource: "club" | "custom";
	venueId?: string;
	location: {
		name: string;
		address?: string;
		city?: string;
		country?: string;
		postalCode?: string;
		latitude?: number;
		longitude?: number;
	};

	// Settings (Step 4)
	eventFormat: EventFormat;
	registrationUnit: Unit;
	capacity?: number;
	isPrivate: boolean;

	// Budget (Step 5)
	useBudget: boolean;
	budget?: {
		cost?: number;
		pricingModel?: PricingModel;
		paymentMethods?: PaymentMethod[];
		payToJoin?: boolean;
		minUnitsForBudget?: number;
		dropoutDeadlineHours?: number;
	};

	// Invite (Step 6)
	invitees: UserProfile[];
}
