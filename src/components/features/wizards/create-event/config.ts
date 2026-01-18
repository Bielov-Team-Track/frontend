import { createEvent } from "@/lib/api/events";
import { EventFormat, EventType, PlayingSurface } from "@/lib/models/Event";
import { Unit } from "@/lib/models/EventBudget";
import * as yup from "yup";
import { WizardConfig } from "../core/types";
import { EventFormData } from "./types";

// Steps imported from step files (we'll create these next)
import { BudgetStep } from "./steps/BudgetStep";
import { ContextStep } from "./steps/ContextStep";
import { EventDetailsStep } from "./steps/EventDetailsStep";
import { InviteStep } from "./steps/InviteStep";
import { LocationStep } from "./steps/LocationStep";
import { ReviewStep } from "./steps/ReviewStep";
import { SettingsStep } from "./steps/SettingsStep";
import { TimeAndDateStep } from "./steps/TimeAndDateStep";

export const eventValidationSchema = yup.object().shape({
	name: yup.string().required("Event name is required"),
	type: yup.mixed<EventType>().oneOf(Object.values(EventType)).required(),
	surface: yup.mixed<PlayingSurface>().oneOf(Object.values(PlayingSurface)).required(),
	startTime: yup.date().required("Start time is required").min(new Date(), "Must be in the future"),
	endTime: yup.date().required("End time is required").min(yup.ref("startTime"), "Must be after start time"),
	location: yup.object().shape({
		name: yup.string().required("Location name is required"),
		address: yup.string().optional(),
	}),
	eventFormat: yup.mixed<EventFormat>().oneOf(Object.values(EventFormat)).required(),
	registrationUnit: yup.mixed<Unit>().oneOf(Object.values(Unit)).required(),
	courtsNumber: yup.number().min(1).required(),
	isPrivate: yup.boolean().required(),
});

const defaultValues: EventFormData = {
	name: "",
	type: EventType.CasualPlay,
	surface: PlayingSurface.Indoor,
	startTime: new Date(),
	endTime: new Date(),
	locationSource: "custom",
	location: { name: "" },
	eventFormat: EventFormat.Open,
	registrationUnit: Unit.Individual,
	isPrivate: false,
	useBudget: false,
	invitees: [],
};

export const createEventWizardConfig: WizardConfig<EventFormData> = {
	id: "create-event",
	title: "Create Event",
	subtitle: "Set up your volleyball game, practice, or tournament",
	steps: [
		{
			id: "context",
			label: "Context",
			component: ContextStep,
			fields: [],
			isConditional: (context, hasClubs) => context.source === "events" && hasClubs,
		},
		{
			id: "details",
			label: "Details",
			component: EventDetailsStep,
			fields: ["name", "type", "surface"],
		},
		{
			id: "datetime",
			label: "Time & Date",
			component: TimeAndDateStep,
			fields: ["startTime", "endTime"],
		},
		{
			id: "location",
			label: "Location",
			component: LocationStep,
			fields: ["location.name"],
		},
		{
			id: "settings",
			label: "Settings",
			component: SettingsStep,
			fields: ["eventFormat", "courtsNumber", "isPrivate"],
		},
		{
			id: "budget",
			label: "Budget",
			component: BudgetStep,
			fields: [],
		},
		{
			id: "invite",
			label: "Invite",
			component: InviteStep,
			fields: [],
		},
		{
			id: "review",
			label: "Review",
			component: ReviewStep,
			fields: [],
		},
	],
	defaultValues,
	validationSchema: eventValidationSchema,
	onSubmit: async (data, context) => {
		const payload = {
			name: data.name,
			description: data.description,
			type: data.type,
			surface: data.surface,
			startTime: data.startTime.toISOString(),
			endTime: data.endTime.toISOString(),
			location: data.location,
			eventFormat: data.eventFormat,
			registrationUnit: data.registrationUnit,
			capacity: data.capacity,
			isPrivate: data.isPrivate,
			clubId: data.clubId || context.clubId,
			teamId: data.teamId || context.teamId,
			groupId: data.groupId || context.groupId,
			budget: data.useBudget ? data.budget : undefined,
			// TODO: Handle invitees after event creation
		};

		await createEvent(payload as any);
	},
	successConfig: {
		title: "Event Created!",
		message: "Your event has been created successfully. Share it with others to get players!",
		linkText: "View Event",
		getLinkHref: (id) => `/dashboard/events/${id}`,
	},
};
