import type { StoryObj, Meta } from "@storybook/nextjs-vite";
import EventList from "./index";
import {
	Event,
	EventFormat,
	EventType,
	PlayingSurface,
} from "@/lib/models/Event";
import { Unit } from "@/lib/models/EventPaymentConfig";

const meta: Meta<typeof EventList> = {
	title: "Events/EventList",
	component: EventList,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
};

export default meta;

const mockEvents: Event[] = [
	{
		id: "evt_1a2b3c4d5e",
		name: "Weekend Volleyball Tournament",
		startTime: new Date("2024-01-20T10:00:00"),
		endTime: new Date("2024-01-20T14:00:00"),
		location: {
			name: "Downtown Sports Complex",
			address: "123 Main Street",
		},
		costToEnter: 25.0,
		type: EventType.CasualPlay,
		surface: PlayingSurface.Indoor,
		registrationUnit: Unit.Team,
		eventFormat: EventFormat.TeamsWithPositions,
		isPrivate: false,
		teamsNumber: 4,
		description:
			"Join us for a fun-filled day of volleyball with teams from all over the city. Prizes for the winners!",
	},
	{
		id: "evt_2b3c4d5e6f",
		name: "Beach Volleyball Classic",
		startTime: new Date("2024-01-21T10:00:00"),
		endTime: new Date("2024-01-21T14:00:00"),
		location: {
			name: "Sunset Beach Courts",
			address: "456 Ocean Drive",
		},
		costToEnter: 30.0,
		type: EventType.CasualPlay,
		surface: PlayingSurface.Beach,
		registrationUnit: Unit.Team,
		eventFormat: EventFormat.TeamsWithPositions,
		isPrivate: false,
		teamsNumber: 8,
		description:
			"Summer beach volleyball event with music and refreshments.",
	},
	{
		id: "evt_3c4d5e6f7g",
		name: "Indoor League Night",
		startTime: new Date("2024-01-22T18:00:00"),
		endTime: new Date("2024-01-22T21:00:00"),
		location: {
			name: "Community Center Gym",
			address: "789 Park Avenue",
		},
		registrationUnit: Unit.Team,
		eventFormat: EventFormat.TeamsWithPositions,
		costToEnter: 15.0,
		type: EventType.CasualPlay,
		surface: PlayingSurface.Indoor,
		isPrivate: false,
		teamsNumber: 6,
		description:
			"Weekly indoor league games. All skill levels welcome!",
	},
	{
		id: "evt_4d5e6f7g8h",
		name: "Grass Court Open",
		startTime: new Date("2024-01-23T09:00:00"),
		endTime: new Date("2024-01-23T17:00:00"),
		location: {
			name: "Central Park Fields",
			address: "101 Green Street",
		},
		costToEnter: 20.0,
		registrationUnit: Unit.Team,
		eventFormat: EventFormat.TeamsWithPositions,
		type: EventType.CasualPlay,
		surface: PlayingSurface.Grass,
		isPrivate: false,
		teamsNumber: 4,
		description:
			"Full day grass court tournament with multiple rounds.",
	},
	{
		id: "evt_5e6f7g8h9i",
		name: "Summer Championship",
		startTime: new Date("2024-08-20T10:00:00"),
		endTime: new Date("2024-08-20T14:00:00"),
		location: {
			name: "Downtown Sports Complex",
			address: "123 Main Street",
		},
		costToEnter: 25.0,
		registrationUnit: Unit.Team,
		eventFormat: EventFormat.TeamsWithPositions,
		type: EventType.CasualPlay,
		surface: PlayingSurface.Indoor,
		isPrivate: false,
		teamsNumber: 4,
		description:
			"Annual summer championship with prizes for top teams.",
	},
];
type Story = StoryObj<typeof meta>;

export const Preview: Story = {
	args: {
		events: mockEvents,
	},
	render: (args) => <EventList {...args} />,
};
