import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "./index";
import { Plus, ArrowRight, Download, Trash2, Save, Share, Edit, Loader2 } from "lucide-react";

const meta: Meta<typeof Button> = {
	title: "UI/Button",
	component: Button,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"A composite button component built on shadcn primitives with support for loading states, icons, and multiple variants. Includes proper accessibility features and consistent styling.",
			},
		},
	},
	tags: ["autodocs"],
	argTypes: {
		variant: {
			control: { type: "select" },
			options: ["default", "secondary", "destructive", "outline", "ghost", "link"],
			description: "The visual style variant of the button",
			table: {
				defaultValue: { summary: "default" },
			},
		},
		size: {
			control: { type: "select" },
			options: ["default", "xs", "sm", "lg", "icon", "icon-sm", "icon-xs"],
			description: "The size of the button",
			table: {
				defaultValue: { summary: "default" },
			},
		},
		fullWidth: {
			control: { type: "boolean" },
			description: "Whether the button should take the full width of its container",
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
	},
};

// Variant stories
export const Primary: Story = {
	args: {
		children: "Primary Button",
		variant: "default",
	},
};

export const Secondary: Story = {
	args: {
		children: "Secondary Button",
		variant: "secondary",
	},
};

export const Destructive: Story = {
	args: {
		children: "Delete",
		variant: "destructive",
	},
};

export const Outline: Story = {
	args: {
		children: "Outline Button",
		variant: "outline",
	},
};

export const Ghost: Story = {
	args: {
		children: "Ghost Button",
		variant: "ghost",
	},
};

export const Link: Story = {
	args: {
		children: "Link Button",
		variant: "link",
	},
};

// Size stories
export const SizeXS: Story = {
	args: {
		children: "Extra Small",
		size: "xs",
	},
};

export const SizeSM: Story = {
	args: {
		children: "Small",
		size: "sm",
	},
};

export const SizeDefault: Story = {
	args: {
		children: "Default",
		size: "default",
	},
};

export const SizeLG: Story = {
	args: {
		children: "Large",
		size: "lg",
	},
};

export const IconButton: Story = {
	args: {
		size: "icon",
		children: <Plus className="size-4" />,
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

export const FullWidth: Story = {
	args: {
		children: "Full Width Button",
		fullWidth: true,
	},
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
};

// Icon examples
export const WithLeftIcon: Story = {
	args: {
		children: "Add Item",
		leftIcon: <Plus className="size-4" />,
	},
};

export const WithRightIcon: Story = {
	args: {
		children: "Continue",
		variant: "outline",
		rightIcon: <ArrowRight className="size-4" />,
	},
};

export const WithBothIcons: Story = {
	args: {
		children: "Download",
		leftIcon: <Download className="size-4" />,
		rightIcon: <ArrowRight className="size-4" />,
	},
};

// Showcase all variants
export const AllVariants: Story = {
	render: () => (
		<div className="flex flex-wrap gap-4">
			<Button variant="default">Default</Button>
			<Button variant="secondary">Secondary</Button>
			<Button variant="destructive">Destructive</Button>
			<Button variant="outline">Outline</Button>
			<Button variant="ghost">Ghost</Button>
			<Button variant="link">Link</Button>
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
			<Button size="xs">Extra Small</Button>
			<Button size="sm">Small</Button>
			<Button size="default">Default</Button>
			<Button size="lg">Large</Button>
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

// Icon button sizes
export const IconButtonSizes: Story = {
	render: () => (
		<div className="flex items-center gap-4">
			<Button size="icon-xs" variant="outline">
				<Plus className="size-3" />
			</Button>
			<Button size="icon-sm" variant="outline">
				<Plus className="size-3.5" />
			</Button>
			<Button size="icon" variant="outline">
				<Plus className="size-4" />
			</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Icon button sizes for toolbar actions.",
			},
		},
	},
};

// Loading states
export const LoadingStates: Story = {
	render: () => (
		<div className="flex flex-wrap gap-4">
			<Button loading>Saving...</Button>
			<Button variant="secondary" loading>
				Processing...
			</Button>
			<Button variant="outline" loading>
				Loading...
			</Button>
			<Button variant="destructive" loading>
				Deleting...
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

// Icon examples
export const IconExamples: Story = {
	render: () => (
		<div className="flex flex-wrap gap-4">
			<Button leftIcon={<Plus className="size-4" />}>Create New</Button>
			<Button variant="outline" rightIcon={<Save className="size-4" />}>
				Save
			</Button>
			<Button variant="destructive" leftIcon={<Trash2 className="size-4" />}>
				Delete
			</Button>
			<Button variant="secondary" leftIcon={<Edit className="size-4" />}>
				Edit
			</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Examples of buttons with icons using the leftIcon and rightIcon props.",
			},
		},
	},
};

// Full width examples
export const FullWidthExamples: Story = {
	render: () => (
		<div className="space-y-2 w-80">
			<Button fullWidth>Full Width Primary</Button>
			<Button fullWidth variant="secondary">
				Full Width Secondary
			</Button>
			<Button fullWidth variant="outline">
				Full Width Outline
			</Button>
			<Button fullWidth variant="ghost">
				Full Width Ghost
			</Button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Full-width button examples for form actions.",
			},
		},
	},
};

// Button states
export const ButtonStates: Story = {
	render: () => (
		<div className="space-y-4">
			<div>
				<h3 className="text-sm font-semibold mb-3">Normal States</h3>
				<div className="flex flex-wrap gap-4">
					<Button>Normal</Button>
					<Button disabled>Disabled</Button>
					<Button loading>Loading</Button>
				</div>
			</div>
			<div>
				<h3 className="text-sm font-semibold mb-3">Destructive States</h3>
				<div className="flex flex-wrap gap-4">
					<Button variant="destructive">Normal</Button>
					<Button variant="destructive" disabled>
						Disabled
					</Button>
					<Button variant="destructive" loading>
						Loading
					</Button>
				</div>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Different button states: normal, disabled, and loading.",
			},
		},
	},
};

// Real-world examples
export const ActionButtons: Story = {
	render: () => (
		<div className="space-y-6">
			<div>
				<h3 className="text-sm font-semibold mb-3">Form Actions</h3>
				<div className="flex gap-3">
					<Button variant="ghost">Cancel</Button>
					<Button>Save Changes</Button>
				</div>
			</div>
			<div>
				<h3 className="text-sm font-semibold mb-3">Destructive Actions</h3>
				<div className="flex gap-3">
					<Button variant="outline">Cancel</Button>
					<Button variant="destructive" leftIcon={<Trash2 className="size-4" />}>
						Delete Account
					</Button>
				</div>
			</div>
			<div>
				<h3 className="text-sm font-semibold mb-3">Navigation</h3>
				<div className="flex gap-3">
					<Button variant="outline">Back</Button>
					<Button rightIcon={<ArrowRight className="size-4" />}>Continue</Button>
				</div>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Real-world examples showing common button use cases.",
			},
		},
	},
};

// Playground for testing
export const Playground: Story = {
	args: {
		children: "Playground Button",
		variant: "default",
		size: "default",
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
