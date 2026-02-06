import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import EventPaymentCard from "./EventPaymentCard";
import { Event, EventFormat, EventType, PlayingSurface } from "@/lib/models/Event";
import { EventParticipant, InvitedVia, ParticipationStatus } from "@/lib/models/EventParticipant";
import { PricingModel, Unit } from "@/lib/models/EventPaymentConfig";

// Create a base event for testing
const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
	id: "event-123",
	name: "Test Event",
	startTime: new Date("2026-03-15T18:00:00Z"),
	endTime: new Date("2026-03-15T20:00:00Z"),
	type: EventType.CasualPlay,
	eventFormat: EventFormat.List,
	surface: PlayingSurface.Indoor,
	isPrivate: false,
	teamsNumber: 2,
	costToEnter: 15,
	registrationUnit: Unit.Individual,
	budget: {
		id: "budget-123",
		pricingModel: PricingModel.Individual,
		cost: 15,
		currency: "£",
		payToJoin: true,
	},
	...overrides,
});

// Create a mock participant
const createMockParticipant = (overrides: Partial<EventParticipant> = {}): EventParticipant => ({
	id: "participant-123",
	eventId: "event-123",
	userId: "user-123",
	userProfile: {
		id: "user-123",
		firstName: "Test",
		lastName: "User",
		email: "test@example.com",
	} as any,
	status: ParticipationStatus.Invited,
	invitedVia: InvitedVia.Direct,
	role: "participant",
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
});

const meta: Meta<typeof EventPaymentCard> = {
	title: "Features/Events/EventPaymentCard",
	component: EventPaymentCard,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"A payment card component that displays when an event requires payment to join. Shows different text for invited users vs public joins.",
			},
		},
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div className="w-96 bg-slate-900 p-4">
				<Story />
			</div>
		),
	],
	argTypes: {
		event: {
			description: "The event object with budget configuration",
		},
		userParticipant: {
			description: "The current user's participant record, if any",
		},
		isInvited: {
			control: { type: "boolean" },
			description: "Whether the user was invited to the event",
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// Component renders when payToJoin is true
export const PayToJoinEnabled: Story = {
	args: {
		event: createMockEvent(),
		userParticipant: null,
		isInvited: false,
	},
};

// Component doesn't render when payToJoin is false
export const PayToJoinDisabled: Story = {
	args: {
		event: createMockEvent({
			budget: {
				pricingModel: PricingModel.Individual,
				cost: 15,
				currency: "£",
				payToJoin: false,
			},
		}),
		userParticipant: null,
		isInvited: false,
	},
};

// Component doesn't render when budget is null
export const NoBudget: Story = {
	args: {
		event: createMockEvent({
			budget: undefined,
		}),
		userParticipant: null,
		isInvited: false,
	},
};

// Shows "Pay and join" for non-invited users (public join)
export const PublicJoin: Story = {
	args: {
		event: createMockEvent(),
		userParticipant: null,
		isInvited: false,
	},
};

// Shows "Pay and accept" for invited users
export const InvitedUser: Story = {
	args: {
		event: createMockEvent(),
		userParticipant: createMockParticipant({ status: ParticipationStatus.Invited }),
		isInvited: true,
	},
};

// Displays correct amount from event.budget.cost
export const DifferentAmounts: Story = {
	render: () => (
		<div className="space-y-4">
			<EventPaymentCard
				event={createMockEvent({
					budget: {
						pricingModel: PricingModel.Individual,
						cost: 10,
						currency: "£",
						payToJoin: true,
					},
				})}
				userParticipant={null}
				isInvited={false}
			/>
			<EventPaymentCard
				event={createMockEvent({
					budget: {
						pricingModel: PricingModel.Individual,
						cost: 25.5,
						currency: "$",
						payToJoin: true,
					},
				})}
				userParticipant={null}
				isInvited={false}
			/>
			<EventPaymentCard
				event={createMockEvent({
					budget: {
						pricingModel: PricingModel.Individual,
						cost: 100,
						currency: "€",
						payToJoin: true,
					},
				})}
				userParticipant={null}
				isInvited={false}
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Shows different price amounts and currencies correctly.",
			},
		},
	},
};

// Component doesn't render for already accepted participant
export const AcceptedParticipant: Story = {
	args: {
		event: createMockEvent(),
		userParticipant: createMockParticipant({ status: ParticipationStatus.Accepted }),
		isInvited: false,
	},
};

// Shows Stripe security message
export const ShowsStripeMessage: Story = {
	args: {
		event: createMockEvent(),
		userParticipant: null,
		isInvited: false,
	},
};

// Showcase: All states
export const AllStates: Story = {
	render: () => (
		<div className="space-y-6">
			<div>
				<h3 className="text-sm font-semibold mb-3 text-white">Public Join (Pay to Join)</h3>
				<EventPaymentCard
					event={createMockEvent()}
					userParticipant={null}
					isInvited={false}
				/>
			</div>
			<div>
				<h3 className="text-sm font-semibold mb-3 text-white">Invited User (Pay to Accept)</h3>
				<EventPaymentCard
					event={createMockEvent()}
					userParticipant={createMockParticipant({ status: ParticipationStatus.Invited })}
					isInvited={true}
				/>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "All possible visible states of the EventPaymentCard component.",
			},
		},
	},
};

// Playground for testing
export const Playground: Story = {
	args: {
		event: createMockEvent(),
		userParticipant: null,
		isInvited: false,
	},
	parameters: {
		docs: {
			description: {
				story: "Use this story to test different combinations of props.",
			},
		},
	},
};
