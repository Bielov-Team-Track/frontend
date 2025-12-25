import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Section from "./index";
import { CreditCard, Bell } from "lucide-react";

const meta: Meta<typeof Section> = {
	title: "UI/Section",
	component: Section,
	parameters: {
		layout: "padded",
	},
	argTypes: {
		variant: {
			control: { type: "select" },
			options: ["info", "warning", "error", "success", "neutral"],
		},
		showIcon: {
			control: { type: "boolean" },
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: "Default Section",
		description: "This is a neutral section with default styling.",
		children: <p>Additional content can go here.</p>,
	},
};

export const Info: Story = {
	args: {
		variant: "info",
		title: "Information",
		description: "This section provides helpful information to the user.",
		children: (
			<ul className="list-disc list-inside space-y-1 text-sm">
				<li>Feature is available in your plan</li>
				<li>No additional setup required</li>
			</ul>
		),
	},
};

export const Warning: Story = {
	args: {
		variant: "warning",
		title: "Setup Required",
		description: "Action needed before you can proceed.",
		children: <p>Please complete your profile setup to continue.</p>,
		actions: <button className="btn btn-warning btn-sm">Complete Setup</button>,
	},
};

export const Error: Story = {
	args: {
		variant: "error",
		title: "Account Verification Failed",
		description: "There was an issue verifying your account.",
		children: (
			<div className="space-y-2">
				<p>Please check the following:</p>
				<ul className="list-disc list-inside space-y-1 text-sm">
					<li>Ensure all documents are clear and readable</li>
					<li>Information matches your official documents</li>
				</ul>
			</div>
		),
		actions: <button className="btn btn-error btn-sm">Contact Support</button>,
	},
};

export const Success: Story = {
	args: {
		variant: "success",
		title: "Account Verified",
		description: "Your payment account is now active and ready to use.",
		children: <p>You can now accept card payments for your events.</p>,
	},
};

export const CustomIcon: Story = {
	args: {
		variant: "info",
		title: "Payment Account",
		description: "Manage your payment settings and account information.",
		icon: <CreditCard size={20} className="text-primary" />,
		children: (
			<div className="space-y-2">
				<p>
					Account Status: <span className="badge badge-success">Active</span>
				</p>
				<p>Last Updated: Today</p>
			</div>
		),
		actions: <button className="btn btn-primary btn-sm">Manage Account</button>,
	},
};

export const WithoutIcon: Story = {
	args: {
		title: "Profile Settings",
		description: "Update your personal information and preferences.",
		showIcon: false,
		children: (
			<div className="form-control">
				<label className="label">
					<span className="label-text">Display Name</span>
				</label>
				<input
					type="text"
					className="input input-bordered input-sm"
					defaultValue="John Doe"
				/>
			</div>
		),
		actions: <button className="btn btn-primary btn-sm">Save Changes</button>,
	},
};

export const PaymentSetup: Story = {
	args: {
		variant: "warning",
		title: "Payment Account Setup Required",
		description:
			"To accept card payments for your events, you need to set up a payment account.",
		icon: <CreditCard size={20} className="text-warning" />,
		children: (
			<div className="space-y-3">
				<p className="text-sm">Setting up a payment account allows you to:</p>
				<ul className="list-disc list-inside space-y-1 text-sm opacity-80">
					<li>Accept card payments from event participants</li>
					<li>Process payments securely through Stripe</li>
					<li>Track payment history and analytics</li>
				</ul>
			</div>
		),
		actions: (
			<div className="flex space-x-2">
				<button className="btn btn-warning btn-sm">Set up Account</button>
				<button className="btn btn-outline btn-sm">Learn More</button>
			</div>
		),
	},
};

export const MultipleActions: Story = {
	args: {
		variant: "neutral",
		title: "Event Management",
		description: "Manage your volleyball events and settings.",
		icon: <Bell size={20} className="text-primary" />,
		children: (
			<div className="stats stats-horizontal shadow-xs bg-base-100">
				<div className="stat">
					<div className="stat-title text-xs">Active Events</div>
					<div className="stat-value text-lg">3</div>
				</div>
				<div className="stat">
					<div className="stat-title text-xs">This Month</div>
					<div className="stat-value text-lg">12</div>
				</div>
			</div>
		),
		actions: (
			<div className="dropdown dropdown-end">
				<div tabIndex={0} role="button" className="btn btn-sm btn-ghost">
					Options
				</div>
				<ul
					tabIndex={0}
					className="dropdown-content z-1 menu p-2 shadow-sm bg-base-100 rounded-box w-52"
				>
					<li>
						<a>View All Events</a>
					</li>
					<li>
						<a>Create New Event</a>
					</li>
					<li>
						<a>Event Settings</a>
					</li>
				</ul>
			</div>
		),
	},
};
