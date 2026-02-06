import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import EventCard from "./index";
import {
	Event,
	EventFormat,
	EventType,
	PlayingSurface,
} from "@/lib/models/Event";
import { Unit } from "@/lib/models/EventPaymentConfig";

const meta: Meta<typeof EventCard> = {
	title: "Events/EventCard",
	component: EventCard,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockEvent: Event = {
	id: "evt_1a2b3c4d5e",
	name: "Weekend Volleyball Tournament",
	startTime: new Date("2024-01-20T10:00:00"),
	endTime: new Date("2024-01-20T14:00:00"),
	location: {
		name: "Downtown Sports Complex",
		address: "123 Main Street",
	},
	registrationUnit: Unit.Team,
	eventFormat: EventFormat.TeamsWithPositions,
	costToEnter: 25.0,
	type: EventType.CasualPlay, // Assuming EventType enum
	surface: PlayingSurface.Indoor, // Assuming PlayingSurface enum
	isPrivate: false,
	teamsNumber: 4,
	description:
		"Join us for a fun-filled day of volleyball with teams from all over the city. Prizes for the winners!",
};

export const Preview: Story = {
	args: {
		event: mockEvent,
		variant: "horizontal",
	},
	render: (args) => (
		<div className="flex flex-row gap-4">
			<EventCard event={args.event} variant={"horizontal"}></EventCard>
			<EventCard event={args.event} variant={"vertical"}></EventCard>
		</div>
	),
};

export const Card: Story = {
	args: {
		event: mockEvent,
		variant: "vertical",
	},
	render: (args) => (
		<div className="grid place-content-center h-96">
			<EventCard event={args.event} variant={"vertical"}></EventCard>
		</div>
	),
};

export const Inline: Story = {
	args: {
		event: mockEvent,
		variant: "horizontal",
	},
	render: (args) => (
		<div>
			<EventCard event={args.event} variant={"horizontal"}></EventCard>
		</div>
	),
};
