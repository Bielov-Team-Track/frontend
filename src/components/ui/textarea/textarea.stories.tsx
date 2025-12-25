import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TextArea } from "./index";

const meta: Meta<typeof TextArea> = {
	title: "UI/TextArea",
	component: TextArea,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"A composite textarea component built on shadcn primitives with support for labels, validation, character counting, and helper text. Includes proper accessibility features and consistent styling.",
			},
		},
	},
	tags: ["autodocs"],
	argTypes: {
		label: {
			control: { type: "text" },
			description: "Label text displayed above the textarea",
		},
		error: {
			control: { type: "text" },
			description: "Error message displayed below the textarea",
		},
		helperText: {
			control: { type: "text" },
			description: "Helper text displayed below the textarea when no error is present",
		},
		disabled: {
			control: { type: "boolean" },
			description: "Whether the textarea is disabled",
		},
		required: {
			control: { type: "boolean" },
			description: "Whether the textarea is required (shows asterisk in label)",
		},
		optional: {
			control: { type: "boolean" },
			description: "Whether to show (optional) text in label",
		},
		maxLength: {
			control: { type: "number" },
			description: "Maximum character length",
		},
		showCharCount: {
			control: { type: "boolean" },
			description: "Show character count when maxLength is set",
			table: {
				defaultValue: { summary: "false" },
			},
		},
		minRows: {
			control: { type: "number" },
			description: "Minimum number of rows",
			table: {
				defaultValue: { summary: "3" },
			},
		},
		placeholder: {
			control: { type: "text" },
			description: "Placeholder text for the textarea",
		},
	},
	args: {
		onChange: () => {},
	},
	decorators: [
		(Story) => (
			<div className="w-80">
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default textarea story
export const Default: Story = {
	args: {
		placeholder: "Enter text...",
	},
};

// With label
export const WithLabel: Story = {
	args: {
		label: "Description",
		placeholder: "Enter a description",
	},
};

// Required field
export const Required: Story = {
	args: {
		label: "Bio",
		placeholder: "Tell us about yourself",
		required: true,
	},
};

// Optional field
export const Optional: Story = {
	args: {
		label: "Additional Notes",
		placeholder: "Any additional information",
		optional: true,
	},
};

// With helper text
export const WithHelperText: Story = {
	args: {
		label: "Event Description",
		placeholder: "Describe your event...",
		helperText: "Include details about what participants should expect",
	},
};

// With error
export const WithError: Story = {
	args: {
		label: "Message",
		defaultValue: "Hi",
		error: "Message must be at least 10 characters long",
	},
};

// With character count
export const WithCharCount: Story = {
	args: {
		label: "Bio",
		placeholder: "Write a short bio...",
		maxLength: 200,
		showCharCount: true,
		defaultValue: "I love playing volleyball on weekends!",
	},
};

// Character count near limit
export const CharCountNearLimit: Story = {
	args: {
		label: "Summary",
		placeholder: "Brief summary...",
		maxLength: 100,
		showCharCount: true,
		defaultValue:
			"This is a longer text that approaches the character limit to show the warning state.",
	},
};

// Character count at limit
export const CharCountAtLimit: Story = {
	args: {
		label: "Tweet",
		placeholder: "What's happening?",
		maxLength: 50,
		showCharCount: true,
		defaultValue: "This text is exactly at the character limit now!",
	},
};

// State stories
export const Disabled: Story = {
	args: {
		label: "Disabled TextArea",
		placeholder: "This textarea is disabled",
		disabled: true,
		defaultValue: "You cannot edit this content",
	},
};

// Different row sizes
export const SmallRows: Story = {
	args: {
		label: "Short Input",
		placeholder: "Enter a brief note...",
		minRows: 2,
	},
};

export const LargeRows: Story = {
	args: {
		label: "Long Form Content",
		placeholder: "Write your detailed content here...",
		minRows: 6,
	},
};

// Form examples
export const EventDescription: Story = {
	render: () => (
		<div className="space-y-4 w-80">
			<TextArea
				label="Event Description"
				placeholder="Describe your event, rules, what to bring, etc..."
				maxLength={500}
				showCharCount
				minRows={4}
				helperText="Help participants know what to expect"
				optional
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Example textarea for event descriptions with character counting.",
			},
		},
	},
};

export const FeedbackForm: Story = {
	render: () => (
		<div className="space-y-4 w-80">
			<TextArea
				label="Your Feedback"
				placeholder="Tell us what you think..."
				minRows={4}
				required
				helperText="Your feedback helps us improve"
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Example feedback form textarea.",
			},
		},
	},
};

// Validation states
export const ValidationStates: Story = {
	render: () => (
		<div className="space-y-4 w-80">
			<TextArea
				label="Valid Input"
				defaultValue="This is valid content that meets all requirements."
				helperText="Looking good!"
			/>
			<TextArea
				label="Invalid Input"
				defaultValue="Too short"
				error="Description must be at least 20 characters"
			/>
			<TextArea
				label="Required Field"
				placeholder="This field is required"
				error="This field cannot be empty"
				required
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Different validation states showing helper text and error messages.",
			},
		},
	},
};

// Playground for testing
export const Playground: Story = {
	args: {
		label: "Playground TextArea",
		placeholder: "Test different props...",
		disabled: false,
		required: false,
		optional: false,
		showCharCount: false,
		minRows: 3,
	},
	parameters: {
		docs: {
			description: {
				story: "Use this story to test different combinations of textarea props.",
			},
		},
	},
};
