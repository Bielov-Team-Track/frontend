import type { StoryObj, Meta } from "@storybook/nextjs-vite";
import EventList from "./index";
import {
	Event,
	EventFormat,
	EventType,
	PlayingSurface,
} from "@/lib/models/Event";
import { Unit } from "@/lib/models/EventBudget";

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
			id: "loc_xyz789",
			name: "Downtown Sports Complex",
			address: "123 Main Street",
		},
		costToEnter: 25.0,
		type: EventType.CasualPlay, // Assuming EventType enum
		surface: PlayingSurface.Indoor, // Assuming PlayingSurface enum
		registrationUnit: Unit.Team,
		eventFormat: EventFormat.TeamsWithPositions,
		isPrivate: false,
		teamsNumber: 4,
		description:
			"Join us for a fun-filled day of volleyball with teams from all over the city. Prizes for the winners!",
		admins: [
			{
				userId: "usr_admin1",
				surname: "Smith",
				imageUrl: "https://example.com/avatar1.jpg",
				name: "John Doe",
				email: "john@example.com",
			},
		],
	},
	{
		id: "evt_1a2b3c4d5e",
		name: "Weekend Volleyball Tournament",
		startTime: new Date("2024-01-20T10:00:00"),
		endTime: new Date("2024-01-20T14:00:00"),
		location: {
			id: "loc_xyz789",
			name: "Downtown Sports Complex",
			address: "123 Main Street",
		},
		costToEnter: 25.0,
		type: EventType.CasualPlay, // Assuming EventType enum
		surface: PlayingSurface.Indoor, // Assuming PlayingSurface enum
		registrationUnit: Unit.Team,
		eventFormat: EventFormat.TeamsWithPositions,
		isPrivate: false,
		teamsNumber: 4,
		description:
			"Join us for a fun-filled day of volleyball with teams from all over the city. Prizes for the winners!",
		admins: [
			{
				userId: "usr_admin1",
				surname: "Smith",
				imageUrl: "https://example.com/avatar1.jpg",
				name: "John Doe",
				email: "john@example.com",
			},
		],
	},
	{
		id: "evt_1a2b3c4d5e",
		name: "Weekend Volleyball Tournament",
		startTime: new Date("2024-01-20T10:00:00"),
		endTime: new Date("2024-01-20T14:00:00"),
		location: {
			id: "loc_xyz789",
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
		admins: [
			{
				userId: "usr_admin1",
				surname: "Smith",
				imageUrl: "https://example.com/avatar1.jpg",
				name: "John Doe",
				email: "john@example.com",
			},
		],
	},
	{
		id: "evt_1a2b3c4d5e",
		name: "Weekend Volleyball Tournament",
		startTime: new Date("2024-01-20T10:00:00"),
		endTime: new Date("2024-01-20T14:00:00"),
		location: {
			id: "loc_xyz789",
			name: "Downtown Sports Complex",
			address: "123 Main Street",
		},
		costToEnter: 25.0,
		registrationUnit: Unit.Team,
		eventFormat: EventFormat.TeamsWithPositions,
		type: EventType.CasualPlay, // Assuming EventType enum
		surface: PlayingSurface.Indoor, // Assuming PlayingSurface enum
		isPrivate: false,
		teamsNumber: 4,
		description:
			"Join us for a fun-filled day of volleyball with teams from all over the city. Prizes for the winners!",
		admins: [
			{
				userId: "usr_admin1",
				surname: "Smith",
				imageUrl: "https://example.com/avatar1.jpg",
				name: "John Doe",
				email: "john@example.com",
			},
		],
	},
	{
		id: "evt_1a2b3c4d5e",
		name: "Weekend Volleyball Tournament",
		startTime: new Date("2024-08-20T10:00:00"),
		endTime: new Date("2024-08-20T14:00:00"),
		location: {
			id: "loc_xyz789",
			name: "Downtown Sports Complex",
			address: "123 Main Street",
		},
		costToEnter: 25.0,
		registrationUnit: Unit.Team,
		eventFormat: EventFormat.TeamsWithPositions,
		type: EventType.CasualPlay, // Assuming EventType enum
		surface: PlayingSurface.Indoor, // Assuming PlayingSurface enum
		isPrivate: false,
		teamsNumber: 4,
		description:
			"Join us for a fun-filled day of volleyball with teams from all over the city. Prizes for the winners!",
		admins: [
			{
				userId: "usr_admin1",
				surname: "Smith",
				imageUrl: "https://example.com/avatar1.jpg",
				name: "John Doe",
				email: "john@example.com",
			},
		],
	},
];
type Story = StoryObj<typeof meta>;

export const Preview: Story = {
	args: {
		events: mockEvents,
	},
	render: (args) => <EventList {...args} />,
};
