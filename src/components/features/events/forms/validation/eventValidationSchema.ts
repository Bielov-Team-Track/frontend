import { EventFormat, EventType, PlayingSurface, RecurrencePattern, TimeOffsetUnit } from "@/lib/models/Event";
import { PaymentMethod, PricingModel, Unit } from "@/lib/models/EventPaymentConfig";
import * as yup from "yup";
import { CasualPlayFormat, RegistrationType } from "../types/registration";

// Time offset validation schema (for relative registration timing)
const timeOffsetSchema = yup.object().shape({
	value: yup.number().min(0, "Value must be positive").required("Value is required"),
	unit: yup
		.mixed<TimeOffsetUnit>()
		.oneOf(Object.values(TimeOffsetUnit) as TimeOffsetUnit[])
		.required("Unit is required"),
});

export const eventValidationSchema = yup.object().shape({
	// Recurring event toggle
	isRecurring: yup.boolean().default(false),

	// Single event date/time fields (required when NOT recurring)
	startTime: yup.date().when("isRecurring", {
		is: false,
		then: (schema) => schema.required("Start time is required").min(new Date(), "Please choose future date and time"),
		otherwise: (schema) => schema.nullable().optional(),
	}),
	endTime: yup.date().when("isRecurring", {
		is: false,
		then: (schema) =>
			schema
				.required("End time is required")
				.min(new Date(), "Please choose future date and time")
				.test("is-greater", "End time should be greater than start time", function (value) {
					const { startTime } = this.parent as any;
					if (!startTime || !value) return true;
					const start = new Date(startTime);
					const end = new Date(value);
					return end > start;
				}),
		otherwise: (schema) => schema.nullable().optional(),
	}),

	// New separated date/time fields for single events (alternative to startTime/endTime)
	eventDate: yup.date().when("isRecurring", {
		is: false,
		then: (schema) => schema.required("Event date is required").min(new Date(), "Event date must be in the future"),
		otherwise: (schema) => schema.nullable().optional(),
	}),

	// Recurring event fields (required when recurring)
	recurrencePattern: yup
		.mixed<RecurrencePattern>()
		.oneOf(Object.values(RecurrencePattern) as RecurrencePattern[])
		.when("isRecurring", {
			is: true,
			then: (schema) => schema.required("Recurrence pattern is required"),
			otherwise: (schema) => schema.optional(),
		}),
	firstOccurrenceDate: yup.date().when("isRecurring", {
		is: true,
		then: (schema) => schema.required("First occurrence date is required").min(new Date(), "First occurrence must be in the future"),
		otherwise: (schema) => schema.nullable().optional(),
	}),
	seriesEndDate: yup.date().when("isRecurring", {
		is: true,
		then: (schema) =>
			schema.required("Series end date is required").test("is-after-first", "End date must be after first occurrence", function (value) {
				const { firstOccurrenceDate } = this.parent as any;
				if (!firstOccurrenceDate || !value) return true;
				return new Date(value) > new Date(firstOccurrenceDate);
			}),
		otherwise: (schema) => schema.nullable().optional(),
	}),
	eventStartTime: yup
		.string()
		.required("Start time is required")
		.matches(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
	eventEndTime: yup
		.string()
		.required("End time is required")
		.matches(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)")
		.test("is-after-start", "End time must be after start time", function (value) {
			const { eventStartTime } = this.parent as any;
			if (!eventStartTime || !value) return true;
			return value > eventStartTime;
		}),

	// Registration timing offsets (for recurring events)
	registrationOpenOffset: timeOffsetSchema.optional().default(undefined),
	registrationDeadlineOffset: timeOffsetSchema.optional().default(undefined),
	location: yup
		.object()
		.shape({
			name: yup.string().required("Location name is required"),
			address: yup.string().optional(),
			city: yup.string().optional(),
			country: yup.string().optional(),
			postalCode: yup.string().optional(),
			latitude: yup.number().optional(),
			longitude: yup.number().optional(),
			instructions: yup.string().optional(),
		})
		.required("Location is required"),
	name: yup.string().required("Name is required"),
	type: yup
		.mixed<EventType>()
		.oneOf(Object.values(EventType) as EventType[])
		.default(EventType.CasualPlay)
		.required("Type is required"),
	eventFormat: yup
		.mixed<EventFormat>()
		.oneOf(Object.values(EventFormat) as EventFormat[])
		.default(EventFormat.TeamsWithPositions)
		.required("Event format is required"),
	registrationUnit: yup
		.mixed<Unit>()
		.oneOf(Object.values(Unit) as Unit[])
		.default(Unit.Individual)
		.when(["type", "casualPlayFormat"], {
			is: (type: EventType, casualPlayFormat: CasualPlayFormat) =>
				type === EventType.CasualPlay && (casualPlayFormat === "openTeams" || casualPlayFormat === "teamsWithPositions"),
			then: (schema) => schema.required("Registration unit is required"),
			otherwise: (schema) => schema.optional(),
		}),
	surface: yup
		.mixed<PlayingSurface>()
		.oneOf(Object.values(PlayingSurface) as PlayingSurface[])
		.required("Surface is required"),
	isPublic: yup.boolean().required(),
	registrationType: yup
		.mixed<RegistrationType>()
		.oneOf(["open", "closed"] as const)
		.default("open")
		.required("Registration type is required"),
	registrationOpenTime: yup.date().nullable().optional(),
	registrationDeadline: yup.date().nullable().optional(),
	invitees: yup.array().of(yup.string().uuid()).optional(),
	casualPlayFormat: yup
		.mixed<CasualPlayFormat>()
		.oneOf(["list", "openTeams", "teamsWithPositions"] as const)
		.when("type", {
			is: EventType.CasualPlay,
			then: (schema) => schema.required("Please select a format for casual play"),
			otherwise: (schema) => schema.optional(),
		}),
	capacity: yup
		.number()
		.nullable()
		.transform((v, o) => (o === "" ? null : v))
		.min(1, "Must be at least 1")
		.optional(),
	usePayments: yup.boolean().default(false),
	paymentsConfig: yup
		.object()
		.shape({
			paymentMethods: yup
				.array()
				.of(
					yup
						.mixed<PaymentMethod>()
						.oneOf(Object.values(PaymentMethod) as PaymentMethod[])
						.required(),
				)
				.optional(),
			pricingModel: yup
				.mixed<PricingModel>()
				.oneOf(Object.values(PricingModel) as PricingModel[])
				.test("required-when-payment-config-enabled", "Pricing model is required", function (value) {
					// Access the root form values via this.from
					const root = this.from?.[1]?.value;
					if (root?.usePaymentConfig && !value) {
						return false;
					}
					return true;
				}),
			cost: yup
				.number()
				.min(0, "Cost cannot be negative")
				.test("required-when-payment-config-enabled", "Cost is required", function (value) {
					// Access the root form values via this.from
					const root = this.from?.[1]?.value;
					if (root?.usePaymentConfig && (value === undefined || value === null)) {
						return false;
					}
					return true;
				}),
			payToJoin: yup.boolean().optional().default(false),
			minUnitsForPaymentConfig: yup
				.number()
				.min(1, "Must be at least 1")
				.optional()
				.transform((v, o) => (o === "" ? null : v)),
			dropoutDeadlineHours: yup
				.number()
				.min(0, "Cannot be negative")
				.optional()
				.transform((v, o) => (o === "" ? null : v)),
		})
		.default(undefined),
	// Payment Config management fields (used by EventPaymentConfigStep)
	usePaymentConfig: yup.boolean().default(false),
	paymentConfig: yup
		.object()
		.shape({
			paymentMethods: yup
				.array()
				.of(
					yup
						.mixed<PaymentMethod>()
						.oneOf(Object.values(PaymentMethod) as PaymentMethod[])
						.required(),
				)
				.optional(),
			pricingModel: yup
				.mixed<PricingModel>()
				.oneOf(Object.values(PricingModel) as PricingModel[])
				.test("required-when-payment-config-enabled", "Pricing model is required", function (value) {
					const root = this.from?.[1]?.value;
					if (root?.usePaymentConfig && !value) {
						return false;
					}
					return true;
				}),
			cost: yup
				.number()
				.transform((v, o) => (o === "" ? 0 : v))
				.test("required-when-payment-config-enabled", "Cost is required", function (value) {
					const root = this.from?.[1]?.value;
					if (root?.usePaymentConfig && (!value || value < 1)) {
						return this.createError({ message: "Cost must be at least 1" });
					}
					return true;
				}),
			payToJoin: yup.boolean().optional().default(false),
			minUnitsForPaymentConfig: yup
				.number()
				.min(1, "Must be at least 1")
				.optional()
				.nullable()
				.transform((v, o) => (o === "" ? null : v)),
			dropoutDeadlineHours: yup
				.number()
				.min(0, "Cannot be negative")
				.optional()
				.nullable()
				.transform((v, o) => (o === "" ? null : v)),
			paymentReminderDaysBefore: yup
				.number()
				.min(0, "Cannot be negative")
				.optional()
				.nullable()
				.transform((v, o) => (o === "" ? null : v)),
		})
		.default(undefined),
	description: yup.string().optional(),
	payToEnter: yup.boolean().required("Pay to enter is required").default(false),
});

export type EventFormData = yup.InferType<typeof eventValidationSchema>;
