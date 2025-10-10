import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Button from "./index";

const meta: Meta<typeof Button> = {
	title: "UI/Button",
	component: Button,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"A versatile button component with multiple variants, sizes, and features including loading states and icons. Built with responsive design and custom styling.",
			},
		},
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: { type: "select" },
			options: ["primary", "secondary", "accent", "ghost", "outline"],
			description: "The visual style variant of the button",
			table: {
				defaultValue: { summary: "primary" },
			},
		},
		size: {
			control: { type: "select" },
			options: ["sm", "md", "lg", "xl"],
			description: "The size of the button",
			table: {
				defaultValue: { summary: "md" },
			},
		},
		fullWidth: {
			control: { type: "boolean" },
			description:
				"Whether the button should take the full width of its container",
			table: {
				defaultValue: { summary: "false" },
			},
		},
		loading: {
			control: { type: "boolean" },
			description: "Whether the button is in a loading state",
			table: {
				defaultValue: { summary: "false" },
			},
		},
		disabled: {
			control: { type: "boolean" },
			description: "Whether the button is disabled",
		},
		children: {
			control: { type: "text" },
			description: "The content of the button",
		},
	},
	args: {
		onClick: () => {},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default button story
export const Default: Story = {
	args: {
		children: "Button",
		variant: "solid",
		size: "md",
	},
};

// Variant stories
export const Primary: Story = {
	args: {
		children: "Primary Button",
		variant: "solid",
	},
};

export const Secondary: Story = {
	args: {
		children: "Secondary Button",
		variant: "solid",
	},
};

export const Accent: Story = {
	args: {
		children: "Accent Button",
		variant: "solid",
	},
};

export const Ghost: Story = {
	args: {
		children: "Ghost Button",
		variant: "ghost",
	},
};

export const Outline: Story = {
	args: {
		children: "Outline Button",
		variant: "outline",
	},
};

// Size stories
export const Small: Story = {
	args: {
		children: "Small Button",
		size: "sm",
	},
};

export const Medium: Story = {
	args: {
		children: "Medium Button",
		size: "md",
	},
};

export const Large: Story = {
	args: {
		children: "Large Button",
		size: "lg",
	},
};

export const ExtraLarge: Story = {
	args: {
		children: "Extra Large Button",
		size: "xl",
	},
};

// State stories
export const Disabled: Story = {
	args: {
		children: "Disabled Button",
		disabled: true,
	},
};

export const Loading: Story = {
	args: {
		children: "Loading...",
		loading: true,
	},
};

export const LoadingWithVariants: Story = {
	render: () => (
		<div className="flex flex-wrap gap-4">
			<Button variant="solid" loading>
				Saving...
			</Button>
			<Button variant="solid" loading>
				Processing...
			</Button>
			<Button variant="outline" loading>
				Loading...
			</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Loading states across different button variants.",
			},
		},
	},
};

export const FullWidth: Story = {
	args: {
		children: "Full Width Button",
		fullWidth: true,
	},
	parameters: {
		layout: "padded",
	},
};

// Showcase all variants
export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-wrap gap-4">
			<Button variant="solid">Primary</Button>
			<Button variant="solid">Secondary</Button>
			<Button variant="solid">Accent</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="outline">Outline</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "All available button variants displayed together.",
			},
		},
	},
};

// Showcase all sizes
export const AllSizes: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<Button size="sm">Small</Button>
			<Button size="md">Medium</Button>
			<Button size="lg">Large</Button>
			<Button size="xl">Extra Large</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "All available button sizes displayed together.",
			},
		},
	},
};

// Icon examples using leftIcon and rightIcon props
export const WithLeftIcon: Story = {
	args: {
		children: "Add Item",
		leftIcon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="w-4 h-4"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M12 4.5v15m7.5-7.5h-15"
				/>
			</svg>
		),
	},
};

export const WithRightIcon: Story = {
	args: {
		children: "Continue",
		variant: "outline",
		rightIcon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="w-4 h-4"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
				/>
			</svg>
		),
	},
};

export const WithBothIcons: Story = {
	args: {
		children: "Download",
		variant: "solid",
		leftIcon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="w-4 h-4"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
				/>
			</svg>
		),
		rightIcon: (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				strokeWidth={1.5}
				stroke="currentColor"
				className="w-4 h-4"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
				/>
			</svg>
		),
	},
};

// Interactive examples
export const IconExamples: Story = {
	render: () => (
		<div className="space-y-4">
			<div className="flex flex-wrap gap-4">
				<Button
					leftIcon={
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-4 h-4"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 4.5v15m7.5-7.5h-15"
							/>
						</svg>
					}
				>
					Create New
				</Button>

				<Button
					variant="outline"
					rightIcon={
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-4 h-4"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
							/>
						</svg>
					}
				>
					Save
				</Button>

				<Button
					variant="solid"
					leftIcon={
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="w-4 h-4"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
							/>
						</svg>
					}
				>
					Delete
				</Button>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Examples of buttons with icons using the leftIcon and rightIcon props.",
			},
		},
	},
};

// Responsive showcase
export const ResponsiveShowcase: Story = {
	render: () => (
		<div className="space-y-8">
			<div>
				<h3 className="text-lg font-semibold mb-4">Responsive Typography</h3>
				<div className="space-y-4">
					<div className="flex flex-wrap gap-4">
						<Button size="sm">Small (Responsive)</Button>
						<Button size="md">Medium (Responsive)</Button>
						<Button size="lg">Large (Responsive)</Button>
						<Button size="xl">Extra Large (Responsive)</Button>
					</div>
				</div>
			</div>

			<div>
				<h3 className="text-lg font-semibold mb-4">Full Width Examples</h3>
				<div className="space-y-2 max-w-md">
					<Button fullWidth>Full Width Primary</Button>
					<Button fullWidth variant="outline">
						Full Width Outline
					</Button>
					<Button fullWidth variant="ghost">
						Full Width Ghost
					</Button>
				</div>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Demonstrates responsive typography and full-width button options.",
			},
		},
	},
};

// Playground story for testing
export const Playground: Story = {
	args: {
		children: "Playground Button",
		variant: "solid",
		size: "md",
		disabled: false,
		loading: false,
		fullWidth: false,
	},
	parameters: {
		docs: {
			description: {
				story: "Use this story to test different combinations of props.",
			},
		},
	},
};

// Complex interaction examples
export const InteractionExamples: Story = {
	render: () => (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-semibold mb-4">Button States</h3>
				<div className="flex flex-wrap gap-4">
					<Button>Normal</Button>
					<Button disabled>Disabled</Button>
					<Button loading>Loading</Button>
				</div>
			</div>

			<div>
				<h3 className="text-lg font-semibold mb-4">Action Buttons</h3>
				<div className="flex flex-wrap gap-4">
					<Button
						variant="solid"
						leftIcon={
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/>
							</svg>
						}
					>
						Create Event
					</Button>

					<Button
						variant="solid"
						leftIcon={
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/>
							</svg>
						}
					>
						Edit Profile
					</Button>

					<Button
						variant="outline"
						rightIcon={
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
								/>
							</svg>
						}
					>
						Share
					</Button>
				</div>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Real-world examples showing common button use cases with icons and various states.",
			},
		},
	},
};
