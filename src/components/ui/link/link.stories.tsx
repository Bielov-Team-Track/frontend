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
					"A versatile Link component with multiple color variants and icon support. Built with responsive design and custom styling.",
			},
		},
	},
	tags: ["autodocs"],
	argTypes: {
		color: {
			control: { type: "select" },
			options: ["neutral", "primary", "secondary", "accent", "success", "info", "warning", "error"],
			description: "The color variant of the Link",
			table: {
				defaultValue: { summary: "primary" },
			},
		},
		hover: {
			control: { type: "boolean" },
			description: "Whether to show underline on hover",
			table: {
				defaultValue: { summary: "false" },
			},
		},
		children: {
			control: { type: "text" },
			description: "The content of the Link",
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default Link story
export const Default: Story = {
	args: {
		children: "Link",
		color: "primary",
		href: "#",
	},
};

// Color stories
export const Primary: Story = {
	args: {
		children: "Primary Link",
		color: "primary",
		href: "#",
	},
};

export const Secondary: Story = {
	args: {
		children: "Secondary Link",
		color: "secondary",
		href: "#",
	},
};

export const Accent: Story = {
	args: {
		children: "Accent Link",
		color: "accent",
		href: "#",
	},
};

export const Neutral: Story = {
	args: {
		children: "Neutral Link",
		color: "neutral",
		href: "#",
	},
};

export const Success: Story = {
	args: {
		children: "Success Link",
		color: "success",
		href: "#",
	},
};

export const Warning: Story = {
	args: {
		children: "Warning Link",
		color: "warning",
		href: "#",
	},
};

export const Error: Story = {
	args: {
		children: "Error Link",
		color: "error",
		href: "#",
	},
};

// Hover state
export const WithHover: Story = {
	args: {
		children: "Hover Link",
		hover: true,
		href: "#",
	},
};

// Showcase all colors
export const AllColors: Story = {
	render: () => (
		<div className="flex flex-wrap gap-4">
			<Link href="#" color="primary">Primary</Link>
			<Link href="#" color="secondary">Secondary</Link>
			<Link href="#" color="accent">Accent</Link>
			<Link href="#" color="neutral">Neutral</Link>
			<Link href="#" color="success">Success</Link>
			<Link href="#" color="info">Info</Link>
			<Link href="#" color="warning">Warning</Link>
			<Link href="#" color="error">Error</Link>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "All available Link colors displayed together.",
			},
		},
	},
};

// Icon examples using leftIcon and rightIcon props
export const WithLeftIcon: Story = {
	args: {
		children: "Add Item",
		href: "#",
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
		href: "#",
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
		color: "secondary",
		href: "#",
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

// Playground story for testing
export const Playground: Story = {
	args: {
		children: "Playground Link",
		color: "primary",
		hover: false,
		href: "#",
	},
	parameters: {
		docs: {
			description: {
				story: "Use this story to test different combinations of props.",
			},
		},
	},
};
