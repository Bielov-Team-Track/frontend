import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import BlockOverlay from "./index";
import { Button } from "@/components";

const meta: Meta<typeof BlockOverlay> = {
	title: "UI/BlockOverlay",
	component: BlockOverlay,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"A blocking overlay component that displays a lock icon and reason for blocking, typically used to prevent user interaction.",
			},
		},
	},
	tags: ["autodocs"],
	argTypes: {
		reason: {
			control: { type: "text" },
			description: "The reason for blocking (can be text or ReactNode)",
		},
		className: {
			control: { type: "text" },
			description: "Additional CSS classes to apply",
		},
		children: {
			control: { type: "text" },
			description: "Optional children content to display below the reason",
		},
	},
	decorators: [
		(Story) => (
			<div
				style={{
					position: "relative",
					width: "400px",
					height: "300px",
					border: "1px solid #ccc",
				}}
			>
				<div
					style={{
						padding: "20px",
						backgroundColor: "#f9f9f9",
						height: "100%",
					}}
				>
					<h3>Content behind overlay</h3>
					<p>This content should be blocked by the overlay.</p>
				</div>
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		reason: "This content is blocked",
	},
};

export const WithCustomReason: Story = {
	args: {
		reason: "You need to complete the previous step first",
	},
};

export const WithChildren: Story = {
	args: {
		reason: "Payment required",
		children: <Button>Upgrade Account</Button>,
	},
};

export const WithCustomStyling: Story = {
	args: {
		reason: "Custom styled overlay",
		className: "bg-red-900/80 text-white",
	},
};

export const WithComplexReason: Story = {
	args: {
		reason: (
			<div className="text-center">
				<h3 className="text-lg font-bold text-white mb-2">Access Restricted</h3>
				<p className="text-gray-200">
					This feature requires a premium subscription
				</p>
			</div>
		),
	},
};

export const InFormContext: Story = {
	render: () => (
		<div
			style={{
				position: "relative",
				width: "400px",
				height: "350px",
				border: "1px solid #ccc",
			}}
		>
			<div
				style={{ padding: "20px", backgroundColor: "#ffffff", height: "100%" }}
			>
				<h3>Registration Form</h3>
				<form>
					<div style={{ marginBottom: "15px" }}>
						<label>Name:</label>
						<input
							type="text"
							style={{
								width: "100%",
								padding: "8px",
								border: "1px solid #ccc",
							}}
						/>
					</div>
					<div style={{ marginBottom: "15px" }}>
						<label>Email:</label>
						<input
							type="email"
							style={{
								width: "100%",
								padding: "8px",
								border: "1px solid #ccc",
							}}
						/>
					</div>
					<button
						type="submit"
						style={{
							padding: "10px 20px",
							backgroundColor: "#007bff",
							color: "white",
						}}
					>
						Submit
					</button>
				</form>
			</div>
			<BlockOverlay reason="Registration is temporarily disabled" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Example of BlockOverlay used to disable a form.",
			},
		},
	},
};
