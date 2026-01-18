import {
	CreateEvent,
	CreateEventSeries,
	EventFormat,
	EventType,
	PlayingSurface,
	RecurrencePattern,
	TimeOffsetUnit,
} from "@/lib/models/Event";
import { PricingModel, Unit } from "@/lib/models/EventBudget";
import { EventFormData } from "../validation/eventValidationSchema";

export function transformFormDataToCreateEvent(data: EventFormData): CreateEvent {
	return {
		startTime: new Date(data.startTime),
		endTime: new Date(data.endTime),
		location: {
			name: data.location.name,
			address: data.location.address,
			city: data.location.city,
			country: data.location.country,
			postalCode: data.location.postalCode,
			latitude: data.location.latitude,
			longitude: data.location.longitude,
		},
		budget: data.useBudget ? {
			cost: data.budget?.cost ?? 0,
			payToJoin: data.budget?.payToJoin ?? false,
			pricingModel: data.budget?.pricingModel ?? PricingModel.Individual,
			dropoutDeadlineHours: data.budget?.dropoutDeadlineHours,
			minUnitsForBudget: data.budget?.minUnitsForBudget,
		} : undefined,
		name: data.name,
		eventFormat: data.eventFormat,
		registrationUnit: data.registrationUnit,
		type: data.type,
		surface: data.surface,
		isPrivate: !!data.isPrivate,
		// Legacy fields for backend compatibility
		approveGuests: data.registrationType === "closed",
		teamsNumber: 2, // Default value for now
	};
}

export function transformFormDataToCreateEventSeries(data: EventFormData): CreateEventSeries {
	return {
		name: data.name,
		description: data.description,
		recurrencePattern: data.recurrencePattern!,
		firstOccurrenceDate: new Date(data.firstOccurrenceDate!),
		seriesEndDate: new Date(data.seriesEndDate!),
		eventStartTime: data.eventStartTime!,
		eventEndTime: data.eventEndTime!,
		type: data.type,
		surface: data.surface,
		eventFormat: data.eventFormat,
		isPublic: !data.isPrivate,
		location: data.location
			? {
					name: data.location.name,
					address: data.location.address,
					city: data.location.city,
					country: data.location.country,
					postalCode: data.location.postalCode,
					latitude: data.location.latitude,
					longitude: data.location.longitude,
				}
			: undefined,
		paymentsConfig: data.useBudget
			? {
					cost: data.budget?.cost ?? 0,
					payToJoin: data.budget?.payToJoin ?? false,
					pricingModel: data.budget?.pricingModel ?? PricingModel.Individual,
					dropoutDeadlineHours: data.budget?.dropoutDeadlineHours,
					minUnitsForBudget: data.budget?.minUnitsForBudget,
				}
			: undefined,
		registrationOpenOffset: data.registrationOpenOffset,
		registrationDeadlineOffset: data.registrationDeadlineOffset,
	};
}

/**
 * Calculate the number of occurrences for a recurring event series
 */
export function calculateSeriesOccurrences(
	firstOccurrenceDate: Date,
	seriesEndDate: Date,
	pattern: RecurrencePattern
): Date[] {
	const occurrences: Date[] = [];
	let current = new Date(firstOccurrenceDate);
	const end = new Date(seriesEndDate);

	while (current <= end) {
		occurrences.push(new Date(current));

		switch (pattern) {
			case RecurrencePattern.Weekly:
				current.setDate(current.getDate() + 7);
				break;
			case RecurrencePattern.Biweekly:
				current.setDate(current.getDate() + 14);
				break;
			case RecurrencePattern.Monthly:
				current.setMonth(current.getMonth() + 1);
				break;
			case RecurrencePattern.Semiannually:
				current.setMonth(current.getMonth() + 6);
				break;
			case RecurrencePattern.Annually:
				current.setFullYear(current.getFullYear() + 1);
				break;
		}
	}

	return occurrences;
}

export function getDefaultFormValues() {
	const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
	const tomorrowPlus2Hours = new Date(tomorrow.getTime() + 2 * 60 * 60 * 1000);

	return {
		// Single event date/time (default)
		startTime: tomorrow,
		endTime: tomorrowPlus2Hours,

		// Recurring event fields
		isRecurring: false,
		recurrencePattern: undefined as RecurrencePattern | undefined,
		firstOccurrenceDate: undefined as Date | undefined,
		seriesEndDate: undefined as Date | undefined,
		eventStartTime: "18:00",
		eventEndTime: "20:00",

		// Registration timing offsets (for recurring events)
		registrationOpenOffset: { value: 7, unit: TimeOffsetUnit.Days },
		registrationDeadlineOffset: { value: 1, unit: TimeOffsetUnit.Hours },

		location: {
			name: "",
			address: "",
			city: "",
			country: "",
			postalCode: "",
			latitude: undefined,
			longitude: undefined,
		},
		name: "",
		courtsNumber: 1,
		type: EventType.CasualPlay,
		eventFormat: EventFormat.TeamsWithPositions,
		registrationUnit: Unit.Individual,
		surface: PlayingSurface.Indoor,
		isPrivate: false,
		capacity: null,
		description: "",
		payToEnter: false,
		useBudget: false,
		budget: {
			pricingModel: PricingModel.Individual,
			cost: 0,
			payToJoin: false,
			minUnitsForBudget: undefined,
			dropoutDeadlineHours: undefined,
		},
		registrationType: "open" as const,
		registrationOpenTime: null,
		registrationDeadline: null,
		casualPlayFormat: undefined,
	};
}
