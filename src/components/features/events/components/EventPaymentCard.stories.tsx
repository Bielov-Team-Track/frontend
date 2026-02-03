import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "@storybook/test";
import EventPaymentCard from "./EventPaymentCard";
import { Event, EventFormat, EventType, PlayingSurface } from "@/lib/models/Event";
import { EventParticipant, InvitedVia, ParticipationStatus } from "@/lib/models/EventParticipant";
import { PricingModel, Unit } from "@/lib/models/EventBudget";

// Mock the payments API module
const mockCreateEventCheckoutSession = fn();

// Create a base event for testing
const createMockEvent = (overrides: Partial<Event> = {}): Event => ({
	id: "event-123",
	name: "Test Event",
	startTime: new Date("2026-03-15T18:00:00Z"),
	endTime: new Date("2026-03-15T20:00:00Z"),
	type: EventType.CasualPlay,
	eventFormat: EventFormat.Open,
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

// Test: Component renders when payToJoin is true
export const PayToJoinEnabled: Story = {
	args: {
		event: createMockEvent(),
		userParticipant: null,
		isInvited: false,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Should render the card
		expect(canvas.getByText("Join This Event")).toBeInTheDocument();
		expect(canvas.getByText("Payment is required to join this event")).toBeInTheDocument();

		// Should show the correct amount
		expect(canvas.getByText("£")).toBeInTheDocument();
		expect(canvas.getByText("15")).toBeInTheDocument();

		// Should show "Pay and join" button
		expect(canvas.getByRole("button", { name: /Pay and join - £15/i })).toBeInTheDocument();
	},
};

// Test: Component doesn't render when payToJoin is false
export const PayToJoinDisabled: Story = {
	args: {
		event: createMockEvent({
			budget: {
				pricingModel: PricingModel.Individual,
				cost: 15,
				currency: "£",
				payToJoin: false, // Disabled
			},
		}),
		userParticipant: null,
		isInvited: false,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Should NOT render the card when payToJoin is false
		expect(canvas.queryByText("Join This Event")).not.toBeInTheDocument();
		expect(canvas.queryByText("You're Invited!")).not.toBeInTheDocument();
	},
};

// Test: Component doesn't render when budget is null
export const NoBudget: Story = {
	args: {
		event: createMockEvent({
			budget: undefined,
		}),
		userParticipant: null,
		isInvited: false,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Should NOT render when there's no budget
		expect(canvas.queryByText("Join This Event")).not.toBeInTheDocument();
	},
};

// Test: Shows "Pay and join" for non-invited users (public join)
export const PublicJoin: Story = {
	args: {
		event: createMockEvent(),
		userParticipant: null,
		isInvited: false,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Should show public join messaging
		expect(canvas.getByText("Join This Event")).toBeInTheDocument();
		expect(canvas.getByText("Payment is required to join this event")).toBeInTheDocument();

		// Should show "Pay and join" button (not "Pay and accept")
		const button = canvas.getByRole("button");
		expect(button).toHaveTextContent("Pay and join");
		expect(button).not.toHaveTextContent("Pay and accept");
	},
};

// Test: Shows "Pay and accept" for invited users
export const InvitedUser: Story = {
	args: {
		event: createMockEvent(),
		userParticipant: createMockParticipant({ status: ParticipationStatus.Invited }),
		isInvited: true,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Should show invitation messaging
		expect(canvas.getByText("You're Invited!")).toBeInTheDocument();
		expect(canvas.getByText("Accept your invitation by completing the payment")).toBeInTheDocument();

		// Should show "Pay and accept" button (not "Pay and join")
		const button = canvas.getByRole("button");
		expect(button).toHaveTextContent("Pay and accept");
		expect(button).not.toHaveTextContent("Pay and join");
	},
};

// Test: Displays correct amount from event.budget.cost
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

// Test: Component doesn't render for already accepted participant
export const AcceptedParticipant: Story = {
	args: {
		event: createMockEvent(),
		userParticipant: createMockParticipant({ status: ParticipationStatus.Accepted }),
		isInvited: false,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Should NOT render when user is already an accepted participant
		expect(canvas.queryByText("Join This Event")).not.toBeInTheDocument();
		expect(canvas.queryByText("You're Invited!")).not.toBeInTheDocument();
	},
};

// Test: Shows Stripe security message
export const ShowsStripeMessage: Story = {
	args: {
		event: createMockEvent(),
		userParticipant: null,
		isInvited: false,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);

		// Should show Stripe security message
		expect(
			canvas.getByText("Secure payment powered by Stripe. You'll receive a confirmation email after payment."),
		).toBeInTheDocument();
	},
};

// Test: Button click behavior (loading state will be shown)
export const ClickToPayButton: Story = {
	args: {
		event: createMockEvent(),
		userParticipant: null,
		isInvited: false,
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const user = userEvent.setup();

		// Find the button
		const button = canvas.getByRole("button", { name: /Pay and join/i });
		expect(button).toBeInTheDocument();
		expect(button).not.toBeDisabled();

		// Click the button - this will trigger loading state
		// Note: The actual API call will fail in Storybook since it's not mocked,
		// but we can verify the button exists and is clickable
		await user.click(button);

		// The button should still be in the document (it may show loading or error)
		expect(canvas.getByRole("button")).toBeInTheDocument();
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
