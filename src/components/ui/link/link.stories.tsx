import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Link from "./index";

const meta: Meta<typeof Link> = {
	title: "UI/Link",
	component: Link,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"A versatile Link component with multiple variants, sizes, and features including states and icons. Built with responsive design and custom styling.",
			},
		},
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: { type: "select" },
			options: ["primary", "secondary", "accent", "ghost", "outline"],
			description: "The visual style variant of the Link",
			table: {
				defaultValue: { summary: "primary" },
			},
		},
		size: {
			control: { type: "select" },
			options: ["sm", "md", "lg", "xl"],
			description: "The size of the Link",
			table: {
				defaultValue: { summary: "md" },
			},
		},
		fullWidth: {
			control: { type: "boolean" },
			description:
				"Whether the Link should take the full width of its container",
			table: {
				defaultValue: { summary: "false" },
			},
		},
		children: {
			control: { type: "text" },
			description: "The content of the Link",
		},
	},
	args: {
		onClick: () => {},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default Link story
export const Default: Story = {
	args: {
		children: "Link",
		variant: "primary",
		size: "md",
	},
};

// Variant stories
export const Primary: Story = {
	args: {
		children: "Primary Link",
		variant: "primary",
	},
};

export const Secondary: Story = {
	args: {
		children: "Secondary Link",
		variant: "secondary",
	},
};

export const Accent: Story = {
	args: {
		children: "Accent Link",
		variant: "accent",
	},
};

export const Ghost: Story = {
	args: {
		children: "Ghost Link",
		variant: "ghost",
	},
};

export const Outline: Story = {
	args: {
		children: "Outline Link",
		variant: "outline",
	},
};

// Size stories
export const Small: Story = {
	args: {
		children: "Small Link",
		size: "sm",
	},
};

export const Medium: Story = {
	args: {
		children: "Medium Link",
		size: "md",
	},
};

export const Large: Story = {
	args: {
		children: "Large Link",
		size: "lg",
	},
};

export const ExtraLarge: Story = {
	args: {
		children: "Extra Large Link",
		size: "xl",
	},
};

// State stories
export const FullWidth: Story = {
	args: {
		children: "Full Width Link",
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
			<Link variant="primary">Primary</Link>
			<Link variant="secondary">Secondary</Link>
			<Link variant="accent">Accent</Link>
			<Link variant="ghost">Ghost</Link>
			<Link variant="outline">Outline</Link>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "All available Link variants displayed together.",
			},
		},
	},
};

// Showcase all sizes
export const AllSizes: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<Link size="sm">Small</Link>
			<Link size="md">Medium</Link>
			<Link size="lg">Large</Link>
			<Link size="xl">Extra Large</Link>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "All available Link sizes displayed together.",
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
		variant: "secondary",
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
				<Link
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
				</Link>

				<Link
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
				</Link>

				<Link
					variant="secondary"
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
				</Link>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Examples of Links with icons using the leftIcon and rightIcon props.",
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
						<Link size="sm">Small (Responsive)</Link>
						<Link size="md">Medium (Responsive)</Link>
						<Link size="lg">Large (Responsive)</Link>
						<Link size="xl">Extra Large (Responsive)</Link>
					</div>
				</div>
			</div>

			<div>
				<h3 className="text-lg font-semibold mb-4">Full Width Examples</h3>
				<div className="space-y-2 max-w-md">
					<Link fullWidth>Full Width Primary</Link>
					<Link fullWidth variant="outline">
						Full Width Outline
					</Link>
					<Link fullWidth variant="ghost">
						Full Width Ghost
					</Link>
				</div>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Demonstrates responsive typography and full-width Link options.",
			},
		},
	},
};

// Playground story for testing
export const Playground: Story = {
	args: {
		children: "Playground Link",
		variant: "primary",
		size: "md",
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
				<h3 className="text-lg font-semibold mb-4">Link States</h3>
				<div className="flex flex-wrap gap-4">
					<Link>Normal</Link>
					<Link>Loading</Link>
				</div>
			</div>

			<div>
				<h3 className="text-lg font-semibold mb-4">Action Links</h3>
				<div className="flex flex-wrap gap-4">
					<Link
						variant="primary"
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
					</Link>

					<Link
						variant="secondary"
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
					</Link>

					<Link
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
					</Link>
				</div>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Real-world examples showing common Link use cases with icons and various states.",
			},
		},
	},
};
