import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import BackButton from "./index";

// Mock useRouter for Storybook
const mockRouter = {
	back: () => console.log("Router back clicked"),
	forward: () => console.log("Router forward clicked"),
	refresh: () => console.log("Router refresh clicked"),
	push: (href: string) => console.log("Router push to:", href),
	replace: (href: string) => console.log("Router replace to:", href),
	prefetch: (href: string) => console.log("Router prefetch:", href),
};

const meta: Meta<typeof BackButton> = {
	title: "UI/BackButton",
	component: BackButton,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"A back button component that uses Next.js router to navigate back to the previous page.",
			},
		},
		nextjs: {
			appDirectory: true,
			navigation: {
				pathname: "/some-page",
			},
		},
	},
	tags: ["autodocs"],
	decorators: [
		(Story) => (
			<div
				style={{
					position: "relative",
					width: "300px",
					height: "200px",
					border: "1px solid #ccc",
				}}
			>
				<Story />
			</div>
		),
	],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story:
					"Default back button positioned absolutely in the top-left corner.",
			},
		},
	},
};

export const InContext: Story = {
	render: () => (
		<div
			style={{
				position: "relative",
				width: "400px",
				height: "300px",
				backgroundColor: "#f5f5f5",
				padding: "20px",
			}}
		>
			<BackButton />
			<div style={{ marginTop: "60px", textAlign: "center" }}>
				<h2>Page Content</h2>
				<p>
					This shows how the back button appears in context with other content.
				</p>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Back button shown in the context of a page with content.",
			},
		},
	},
};
