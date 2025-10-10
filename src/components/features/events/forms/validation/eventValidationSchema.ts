import * as yup from "yup";
import { EventFormat, EventType, PlayingSurface } from "@/lib/models/Event";
import {
	EventBudget,
	PaymentMethod,
	PricingModel,
	Unit,
} from "@/lib/models/EventBudget";

export const eventValidationSchema = yup.object().shape({
	startTime: yup
		.date()
		.required("Start time is required")
		.min(new Date(), "Please choose future date and time"),
	endTime: yup
		.date()
		.required("End time is required")
		.min(new Date(), "Please choose future date and time")
		.test(
			"is-greater",
			"End time should be greater than start time",
			function (value) {
				const { startTime } = this.parent as any;
				const start = new Date(startTime);
				const end = new Date(value);
				return end > start;
			},
		),
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
		})
		.required("Location is required"),
	name: yup.string().required("Name is required"),
	approveGuests: yup.boolean(),
	teamsNumber: yup.number().when("eventFormat", {
		is: (eventFormat: EventFormat) => eventFormat !== EventFormat.Open,
		then: (schema) =>
			schema
				.required("Number of teams is required")
				.min(1, "Number of teams should be greater than 0"),
		otherwise: (schema) => schema.notRequired(),
	}),
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
		.required("Registration unit is required"),
	courtsNumber: yup
		.number()
		.min(1, "There must be at least one court")
		.required("Number of courts is required"),
	surface: yup
		.mixed<PlayingSurface>()
		.oneOf(Object.values(PlayingSurface) as PlayingSurface[])
		.required("Surface is required"),
	isPrivate: yup.boolean().required(),
	capacity: yup
		.number()
		.nullable()
		.transform((v, o) => (o === "" ? null : v))
		.min(1, "Must be at least 1")
		.optional(),
	useBudget: yup.boolean().default(false),
	budget: yup
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
				.when("$useBudget", {
					is: true,
					then: (schema) => schema.required("Pricing model is required"),
					otherwise: (schema) => schema.optional(),
				}),
			cost: yup
				.number()
				.min(0, "Cost cannot be negative")
				.when("$useBudget", {
					is: true,
					then: (schema) => schema.required("Cost is required"),
					otherwise: (schema) => schema.optional(),
				}),
			payToJoin: yup.boolean().optional().default(false),
			minUnitsForBudget: yup
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
	description: yup.string().optional(),
	payToEnter: yup.boolean().required("Pay to enter is required").default(false),
});

export type EventFormData = yup.InferType<typeof eventValidationSchema>;
