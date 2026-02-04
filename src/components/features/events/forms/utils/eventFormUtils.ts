import { CreateEvent, CreateEventSeries, EventFormat, EventType, PlayingSurface, RecurrencePattern, TimeOffsetUnit } from "@/lib/models/Event";
import { PricingModel, Unit } from "@/lib/models/EventPaymentConfig";
import { EventFormData } from "../validation/eventValidationSchema";
import { ContextSelection } from "../components/ContextSelector";

export function transformFormDataToCreateEvent(data: EventFormData, contextSelection?: ContextSelection): CreateEvent {
	// Combine eventDate + eventStartTime into startTime
	const eventDate = new Date(data.eventDate);
	const [startHours, startMinutes] = data.eventStartTime.split(":").map(Number);
	const startTime = new Date(eventDate);
	startTime.setHours(startHours, startMinutes, 0, 0);

	// Combine eventDate + eventEndTime into endTime
	const [endHours, endMinutes] = data.eventEndTime.split(":").map(Number);
	const endTime = new Date(eventDate);
	endTime.setHours(endHours, endMinutes, 0, 0);

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
		paymentsConfig: data.usePaymentConfig
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
		name: data.name,
		eventFormat: data.eventFormat,
		type: data.type,
		surface: data.surface,
		isPublic: !!data.isPublic,
		contextType: contextSelection?.contextType,
		contextId: contextSelection?.context.id,
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
		paymentsConfig: data.usePaymentConfig
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
		eventFormat: EventFormat.TeamsWithPositions,
		registrationUnit: Unit.Individual,
		surface: PlayingSurface.Indoor,
		isPublic: false,
		capacity: null,
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
		casualPlayFormat: undefined,
	};
}
