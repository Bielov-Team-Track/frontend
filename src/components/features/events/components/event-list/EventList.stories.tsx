import type { StoryObj, Meta } from "@storybook/nextjs-vite";
import EventList from "./index";
import { Event } from "@/lib/models/Event";

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
    locationId: "loc_xyz789",
    location: {
      id: "loc_xyz789",
      name: "Downtown Sports Complex",
      address: "123 Main Street",
    },
    cost: 25.0,
    type: 0, // Assuming EventType enum
    surface: 0, // Assuming PlayingSurface enum
    isPrivate: false,
    teamsNumber: 4,
    description:
      "Join us for a fun-filled day of volleyball with teams from all over the city. Prizes for the winners!",
    admins: [
      {
        id: "usr_admin1",
        name: "John Doe",
        email: "john@example.com",
        role: "ADMIN",
      },
    ],
  },
  {
    id: "evt_1a2b3c4d5e",
    name: "Weekend Volleyball Tournament",
    startTime: new Date("2024-01-20T10:00:00"),
    endTime: new Date("2024-01-20T14:00:00"),
    locationId: "loc_xyz789",
    location: {
      id: "loc_xyz789",
      name: "Downtown Sports Complex",
      address: "123 Main Street",
    },
    cost: 25.0,
    type: 0, // Assuming EventType enum
    surface: 0, // Assuming PlayingSurface enum
    isPrivate: false,
    teamsNumber: 4,
    description:
      "Join us for a fun-filled day of volleyball with teams from all over the city. Prizes for the winners!",
    admins: [
      {
        id: "usr_admin1",
        name: "John Doe",
        email: "john@example.com",
        role: "ADMIN",
      },
    ],
  },
  {
    id: "evt_1a2b3c4d5e",
    name: "Weekend Volleyball Tournament",
    startTime: new Date("2024-01-20T10:00:00"),
    endTime: new Date("2024-01-20T14:00:00"),
    locationId: "loc_xyz789",
    location: {
      id: "loc_xyz789",
      name: "Downtown Sports Complex",
      address: "123 Main Street",
    },
    cost: 25.0,
    type: 0, // Assuming EventType enum
    surface: 0, // Assuming PlayingSurface enum
    isPrivate: false,
    teamsNumber: 4,
    description:
      "Join us for a fun-filled day of volleyball with teams from all over the city. Prizes for the winners!",
    admins: [
      {
        id: "usr_admin1",
        name: "John Doe",
        email: "john@example.com",
        role: "ADMIN",
      },
    ],
  },
  {
    id: "evt_1a2b3c4d5e",
    name: "Weekend Volleyball Tournament",
    startTime: new Date("2024-01-20T10:00:00"),
    endTime: new Date("2024-01-20T14:00:00"),
    locationId: "loc_xyz789",
    location: {
      id: "loc_xyz789",
      name: "Downtown Sports Complex",
      address: "123 Main Street",
    },
    cost: 25.0,
    type: 0, // Assuming EventType enum
    surface: 0, // Assuming PlayingSurface enum
    isPrivate: false,
    teamsNumber: 4,
    description:
      "Join us for a fun-filled day of volleyball with teams from all over the city. Prizes for the winners!",
    admins: [
      {
        id: "usr_admin1",
        name: "John Doe",
        email: "john@example.com",
        role: "ADMIN",
      },
    ],
  },
  {
    id: "evt_1a2b3c4d5e",
    name: "Weekend Volleyball Tournament",
    startTime: new Date("2024-08-20T10:00:00"),
    endTime: new Date("2024-08-20T14:00:00"),
    locationId: "loc_xyz789",
    location: {
      id: "loc_xyz789",
      name: "Downtown Sports Complex",
      address: "123 Main Street",
    },
    cost: 25.0,
    type: 0, // Assuming EventType enum
    surface: 0, // Assuming PlayingSurface enum
    isPrivate: false,
    teamsNumber: 4,
    description:
      "Join us for a fun-filled day of volleyball with teams from all over the city. Prizes for the winners!",
    admins: [
      {
        id: "usr_admin1",
        name: "John Doe",
        email: "john@example.com",
        role: "ADMIN",
      },
    ],
  },
];
type Story = StoryObj<typeof meta>;

export const Preview: Story = {
  args: {
    events: mockEvents,
    loading: false,
  },
  render: (args) => <EventList {...args} />,
};
