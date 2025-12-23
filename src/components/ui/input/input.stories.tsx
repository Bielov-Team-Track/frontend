import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Input from "./index";
import { User, Mail, Lock, Search, Phone, Calendar } from "lucide-react";

const meta: Meta<typeof Input> = {
	title: "UI/Input",
	component: Input,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"A versatile input component with support for labels, validation, icons, password visibility toggle, and various styling variants. Built with responsive typography and accessibility features.",
			},
		},
	},
	tags: ["autodocs"],
	argTypes: {
		label: {
			control: { type: "text" },
			description: "Label text displayed above the input",
		},
		error: {
			control: { type: "text" },
			description: "Error message displayed below the input",
		},
		helperText: {
			control: { type: "text" },
			description:
				"Helper text displayed below the input when no error is present",
		},
		variant: {
			control: { type: "select" },
			options: ["default", "bordered", "ghost"],
			description: "The visual style variant of the input",
			table: {
				defaultValue: { summary: "bordered" },
			},
		},
		inputSize: {
			control: { type: "select" },
			options: ["sm", "md", "lg"],
			description: "The size of the input field",
			table: {
				defaultValue: { summary: "md" },
			},
		},
		fullWidth: {
			control: { type: "boolean" },
			description:
				"Whether the input should take the full width of its container",
			table: {
				defaultValue: { summary: "true" },
			},
		},
		disabled: {
			control: { type: "boolean" },
			description: "Whether the input is disabled",
		},
		required: {
			control: { type: "boolean" },
			description: "Whether the input is required (shows asterisk in label)",
		},
		showPasswordToggle: {
			control: { type: "boolean" },
			description: "Show password visibility toggle for password inputs",
			table: {
				defaultValue: { summary: "false" },
			},
		},
		type: {
			control: { type: "select" },
			options: ["text", "email", "password", "number", "tel", "url", "search"],
			description: "The input type",
			table: {
				defaultValue: { summary: "text" },
			},
		},
		placeholder: {
			control: { type: "text" },
			description: "Placeholder text for the input",
		},
	},
	args: {
		onChange: () => {},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default input story
export const Default: Story = {
	args: {
		placeholder: "Enter text...",
	},
};

// With label
export const WithLabel: Story = {
	args: {
		label: "Email Address",
		placeholder: "Enter your email",
		type: "email",
	},
};

// Required field
export const Required: Story = {
	args: {
		label: "Username",
		placeholder: "Enter username",
		required: true,
	},
};

// With helper text
export const WithHelperText: Story = {
	args: {
		label: "Password",
		type: "password",
		placeholder: "Enter password",
		helperText: "Must be at least 8 characters long",
	},
};

// With error
export const WithError: Story = {
	args: {
		label: "Email",
		type: "email",
		value: "invalid-email",
		error: "Please enter a valid email address",
	},
};

// Variant stories
export const Bordered: Story = {
	args: {
		label: "Bordered Input",
		variant: "bordered",
		placeholder: "Bordered variant",
	},
};

export const Ghost: Story = {
	args: {
		label: "Ghost Input",
		variant: "ghost",
		placeholder: "Ghost variant",
	},
};

export const DefaultVariant: Story = {
	args: {
		label: "Default Input",
		variant: "default",
		placeholder: "Default variant",
	},
};

// Size stories
export const Small: Story = {
	args: {
		label: "Small Input",
		inputSize: "sm",
		placeholder: "Small size",
	},
};

export const Medium: Story = {
	args: {
		label: "Medium Input",
		inputSize: "md",
		placeholder: "Medium size",
	},
};

export const Large: Story = {
	args: {
		label: "Large Input",
		inputSize: "lg",
		placeholder: "Large size",
	},
};

// State stories
export const Disabled: Story = {
	args: {
		label: "Disabled Input",
		placeholder: "This input is disabled",
		disabled: true,
		value: "Disabled value",
	},
};

export const Focused: Story = {
	args: {
		label: "Focused Input",
		placeholder: "Click to focus",
		autoFocus: true,
	},
};

// Icon stories
export const WithLeftIcon: Story = {
	args: {
		label: "Username",
		placeholder: "Enter username",
		leftIcon: <User size={16} />,
	},
};

export const WithRightIcon: Story = {
	args: {
		label: "Search",
		placeholder: "Search...",
		rightIcon: <Search size={16} />,
	},
};

export const WithBothIcons: Story = {
	args: {
		label: "Email",
		placeholder: "Enter email",
		leftIcon: <Mail size={16} />,
		rightIcon: <Search size={16} />,
	},
};

// Password input with toggle
export const PasswordWithToggle: Story = {
	args: {
		label: "Password",
		type: "password",
		placeholder: "Enter your password",
		showPasswordToggle: true,
		leftIcon: <Lock size={16} />,
	},
};

// Input types
export const EmailInput: Story = {
	args: {
		label: "Email Address",
		type: "email",
		placeholder: "user@example.com",
		leftIcon: <Mail size={16} />,
	},
};

export const PhoneInput: Story = {
	args: {
		label: "Phone Number",
		type: "tel",
		placeholder: "+1 (555) 123-4567",
		leftIcon: <Phone size={16} />,
	},
};

export const NumberInput: Story = {
	args: {
		label: "Age",
		type: "number",
		placeholder: "Enter your age",
		min: 0,
		max: 120,
	},
};

export const SearchInput: Story = {
	args: {
		label: "Search",
		type: "search",
		placeholder: "Search events...",
		leftIcon: <Search size={16} />,
	},
};

// Showcase all variants
export const AllVariants: Story = {
	render: () => (
		<div className="space-y-4 w-80">
			<Input
				label="Bordered Input"
				variant="bordered"
				placeholder="Bordered variant"
			/>
			<Input label="Ghost Input" variant="ghost" placeholder="Ghost variant" />
			<Input
				label="Default Input"
				variant="default"
				placeholder="Default variant"
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "All available input variants displayed together.",
			},
		},
	},
};

// Showcase all sizes
export const AllSizes: Story = {
	render: () => (
		<div className="space-y-4 w-80">
			<Input label="Small Input" inputSize="sm" placeholder="Small size" />
			<Input label="Medium Input" inputSize="md" placeholder="Medium size" />
			<Input label="Large Input" inputSize="lg" placeholder="Large size" />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "All available input sizes displayed together.",
			},
		},
	},
};

// Form examples
export const LoginForm: Story = {
	render: () => (
		<div className="space-y-4 w-80">
			<Input
				label="Email"
				type="email"
				placeholder="Enter your email"
				leftIcon={<Mail size={16} />}
				required
			/>
			<Input
				label="Password"
				type="password"
				placeholder="Enter your password"
				leftIcon={<Lock size={16} />}
				showPasswordToggle
				required
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Example login form using input components with icons and password toggle.",
			},
		},
	},
};

export const ProfileForm: Story = {
	render: () => (
		<div className="space-y-4 w-80">
			<Input
				label="Full Name"
				placeholder="Enter your full name"
				leftIcon={<User size={16} />}
				required
			/>
			<Input
				label="Email Address"
				type="email"
				placeholder="user@example.com"
				leftIcon={<Mail size={16} />}
				required
			/>
			<Input
				label="Phone Number"
				type="tel"
				placeholder="+1 (555) 123-4567"
				leftIcon={<Phone size={16} />}
				helperText="Include country code"
			/>
			<Input label="Date of Birth" type="date" leftIcon={<Calendar size={16} />} />
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Example profile form with various input types and helper text.",
			},
		},
	},
};

// Validation states
export const ValidationStates: Story = {
	render: () => (
		<div className="space-y-4 w-80">
			<Input
				label="Valid Input"
				value="john@example.com"
				leftIcon={<Mail size={16} />}
				helperText="This email is available"
			/>
			<Input
				label="Invalid Email"
				value="invalid-email"
				leftIcon={<Mail size={16} />}
				error="Please enter a valid email address"
			/>
			<Input
				label="Required Field"
				placeholder="This field is required"
				leftIcon={<User size={16} />}
				error="This field cannot be empty"
				required
			/>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Different validation states showing helper text and error messages.",
			},
		},
	},
};

// Width variations
export const WidthVariations: Story = {
	render: () => (
		<div className="space-y-4">
			<div>
				<h3 className="text-lg font-semibold mb-2">Full Width (Default)</h3>
				<Input placeholder="Full width input" fullWidth />
			</div>
			<div>
				<h3 className="text-lg font-semibold mb-2">Auto Width</h3>
				<Input placeholder="Auto width input" fullWidth={false} />
			</div>
		</div>
	),
	parameters: {
		layout: "padded",
		docs: {
			description: {
				story: "Demonstrates full width vs auto width input variations.",
			},
		},
	},
};

// Interactive examples
export const InteractiveExamples: Story = {
	render: () => (
		<div className="space-y-6 w-80">
			<div>
				<h3 className="text-lg font-semibold mb-4">Search with Icon</h3>
				<Input
					placeholder="Search events, players, teams..."
					leftIcon={<Search size={16} />}
					variant="bordered"
				/>
			</div>

			<div>
				<h3 className="text-lg font-semibold mb-4">Password with Toggle</h3>
				<Input
					label="Password"
					type="password"
					placeholder="Enter secure password"
					leftIcon={<Lock size={16} />}
					showPasswordToggle
					helperText="Click the eye icon to show/hide password"
				/>
			</div>

			<div>
				<h3 className="text-lg font-semibold mb-4">Required Field</h3>
				<Input
					label="Username"
					placeholder="Choose a unique username"
					leftIcon={<User size={16} />}
					required
					helperText="Must be 3-20 characters long"
				/>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Interactive examples showing real-world usage patterns.",
			},
		},
	},
};

// Playground for testing
export const Playground: Story = {
	args: {
		label: "Playground Input",
		placeholder: "Test different props...",
		variant: "bordered",
		inputSize: "md",
		fullWidth: true,
		disabled: false,
		required: false,
		showPasswordToggle: false,
		type: "text",
	},
	parameters: {
		docs: {
			description: {
				story: "Use this story to test different combinations of input props.",
			},
		},
	},
};
