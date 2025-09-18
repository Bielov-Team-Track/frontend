import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import EventCard from "./index";
import { Event, EventType, PlayingSurface } from "@/lib/models/Event";

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
    id: "loc_xyz789",
    name: "Downtown Sports Complex",
    address: "123 Main Street",
  },
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
};

export const Preview: Story = {
  args: {
    event: mockEvent,
    style: "card",
  },
  render: (args) => (
    <div className="flex flex-row gap-4">
      <EventCard event={args.event} style={"card"}></EventCard>
      <EventCard event={args.event} style={"inline"}></EventCard>
    </div>
  ),
};

export const Card: Story = {
  args: {
    event: mockEvent,
    style: "card",
  },
  render: (args) => (
    <div className="grid place-content-center h-96">
      <EventCard event={args.event} style={"card"}></EventCard>
    </div>
  ),
};

export const Inline: Story = {
  args: {
    event: mockEvent,
    style: "inline",
  },
  render: (args) => (
    <div>
      <EventCard event={args.event} style={"inline"}></EventCard>
    </div>
  ),
};
