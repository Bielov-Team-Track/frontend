import { CreateEvent, CreateEventSeries, EventFormat, EventType, PlayingSurface, RecurrencePattern, TimeOffsetUnit } from "@/lib/models/Event";
import { PricingModel, Unit } from "@/lib/models/EventPaymentConfig";
import { EventFormData } from "../validation/eventValidationSchema";
import { ContextSelection } from "../components/ContextSelector";
import type { MatchTeamSlot } from "../types/registration";

/**
 * Maps a frontend MatchTeamSlot to the backend TeamDto shape.
 * Only includes fields the backend currently accepts.
 */
function mapTeamSlotToDto(slot: MatchTeamSlot | null) {
	if (!slot) return undefined;
	return {
		...(slot.teamId ? { id: slot.teamId } : {}),
		name: slot.team?.name || slot.name || "",
	};
}

export function transformFormDataToCreateEvent(data: EventFormData, contextSelection?: ContextSelection): CreateEvent {
	let startTime: Date;
	let endTime: Date;

	if (data.eventDate && data.eventStartTime && data.eventEndTime) {
		// New format: separate date and time fields
		const eventDate = new Date(data.eventDate);
		const [startHours, startMinutes] = data.eventStartTime.split(":").map(Number);
		startTime = new Date(eventDate);
		startTime.setHours(startHours, startMinutes, 0, 0);

		const [endHours, endMinutes] = data.eventEndTime.split(":").map(Number);
		endTime = new Date(eventDate);
		endTime.setHours(endHours, endMinutes, 0, 0);
	} else {
		// Fallback: use existing startTime/endTime if available
		startTime = data.startTime ? new Date(data.startTime) : new Date();
		endTime = data.endTime ? new Date(data.endTime) : new Date();
	}

	return {
		startTime,
		endTime,
		location: {
			name: data.location.name,
			address: data.location.address,
			city: data.location.city,
			country: data.location.country,
			postalCode: data.location.postalCode,
			latitude: data.location.latitude,
			longitude: data.location.longitude,
		},
		paymentConfig: data.usePaymentConfig
			? {
					paymentMethods: data.paymentConfig?.paymentMethods,
					cost: Number(data.paymentConfig?.cost) || 0,
					payToJoin: data.paymentConfig?.payToJoin ?? false,
					pricingModel: data.paymentConfig?.pricingModel ?? PricingModel.Individual,
					dropoutDeadlineHours: data.paymentConfig?.dropoutDeadlineHours ? Number(data.paymentConfig.dropoutDeadlineHours) : undefined,
					minUnitsForPaymentConfig: data.paymentConfig?.minUnitsForPaymentConfig ? Number(data.paymentConfig.minUnitsForPaymentConfig) : undefined,
					paymentReminderDaysBefore: data.paymentConfig?.paymentReminderDaysBefore ? Number(data.paymentConfig.paymentReminderDaysBefore) : undefined,
				}
			: undefined,
		invitedUsers: data.invitees,
		name: data.name,
		description: data.description || undefined,
		eventFormat: data.eventFormat,
		type: data.type,
		surface: data.surface,
		isPublic: !!data.isPublic,
		contextType: contextSelection?.contextType,
		contextId: contextSelection?.context.id,
		...(data.type === EventType.Match && {
			createMatchRequest: {
				homeTeam: mapTeamSlotToDto(data.homeTeamSlot as MatchTeamSlot | null),
				awayTeam: mapTeamSlotToDto(data.awayTeamSlot as MatchTeamSlot | null),
			},
		}),
	};
}

export function transformFormDataToCreateEventSeries(data: EventFormData, contextSelection?: ContextSelection): CreateEventSeries {
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
		isPublic: !!data.isPublic,
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
		paymentConfig: data.usePaymentConfig
			? {
					paymentMethods: data.paymentConfig?.paymentMethods,
					cost: Number(data.paymentConfig?.cost) || 0,
					payToJoin: data.paymentConfig?.payToJoin ?? false,
					pricingModel: data.paymentConfig?.pricingModel ?? PricingModel.Individual,
					dropoutDeadlineHours: data.paymentConfig?.dropoutDeadlineHours ? Number(data.paymentConfig.dropoutDeadlineHours) : undefined,
					minUnitsForPaymentConfig: data.paymentConfig?.minUnitsForPaymentConfig ? Number(data.paymentConfig.minUnitsForPaymentConfig) : undefined,
					paymentReminderDaysBefore: data.paymentConfig?.paymentReminderDaysBefore ? Number(data.paymentConfig.paymentReminderDaysBefore) : undefined,
				}
			: undefined,
		invitedUsers: data.invitees,
		registrationOpenOffset: data.registrationOpenOffset,
		registrationDeadlineOffset: data.registrationDeadlineOffset,
		contextType: contextSelection?.contextType,
		contextId: contextSelection?.context.id,
	};
}

/**
 * Calculate the number of occurrences for a recurring event series
 */
export function calculateSeriesOccurrences(firstOccurrenceDate: Date, seriesEndDate: Date, pattern: RecurrencePattern): Date[] {
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

		// Single event date/time (separated)
		eventDate: tomorrow,
		eventStartTime: "18:00",
		eventEndTime: "20:00",

		// Recurring event fields
		isRecurring: false,
		recurrencePattern: undefined as RecurrencePattern | undefined,
		firstOccurrenceDate: undefined as Date | undefined,
		seriesEndDate: undefined as Date | undefined,

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
			instructions: "",
		},
		name: "",
		courtsNumber: 1,
		type: EventType.CasualPlay,
		eventFormat: EventFormat.List,
		registrationUnit: Unit.Individual,
		surface: PlayingSurface.Indoor,
		isPublic: false,
		capacity: null,
		teamsNumber: null,
		description: "",
		payToEnter: false,
		useBudget: false,
		budget: {
			paymentMethods: [],
			pricingModel: PricingModel.Individual,
			cost: 0,
			payToJoin: false,
			minUnitsForBudget: undefined,
			dropoutDeadlineHours: undefined,
			paymentReminderDaysBefore: undefined,
		},
		registrationType: "open" as const,
		registrationOpenTime: null,
		registrationDeadline: null,
		casualPlayFormat: "list" as const,
		homeTeamSlot: null,
		awayTeamSlot: null,
	};
}
