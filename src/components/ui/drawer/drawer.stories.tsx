import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Drawer from "./index";

// Mock the Header component since it's not available in Storybook
const MockHeader = () => (
	<header className="bg-primary text-primary-content p-4">
		<div className="flex justify-between items-center">
			<h1>App Header</h1>
			<label htmlFor="my-drawer-3" className="btn btn-square btn-ghost">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					className="inline-block w-6 h-6 stroke-current"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="2"
						d="M4 6h16M4 12h16M4 18h16"
					></path>
				</svg>
			</label>
		</div>
	</header>
);

const meta: Meta<typeof Drawer> = {
	title: "UI/Drawer",
	component: Drawer,
	parameters: {
		layout: "fullscreen",
		docs: {
			description: {
				component:
					"A drawer/sidebar navigation component with toggle functionality. Contains header and navigation links.",
			},
		},
		nextjs: {
			appDirectory: true,
			navigation: {
				pathname: "/events",
			},
		},
	},
	tags: ["autodocs"],
	argTypes: {
		children: {
			control: { type: "text" },
			description: "Content to display in the main area",
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		children: (
			<main className="p-8">
				<h1 className="text-3xl font-bold mb-4">Main Content</h1>
				<p className="mb-4">
					This is the main content area. Click the hamburger menu in the header
					to open the drawer.
				</p>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div className="bg-base-100 p-6 rounded-lg shadow">
						<h3 className="font-bold text-lg mb-2">Card 1</h3>
						<p>Some content for the first card.</p>
					</div>
					<div className="bg-base-100 p-6 rounded-lg shadow">
						<h3 className="font-bold text-lg mb-2">Card 2</h3>
						<p>Some content for the second card.</p>
					</div>
					<div className="bg-base-100 p-6 rounded-lg shadow">
						<h3 className="font-bold text-lg mb-2">Card 3</h3>
						<p>Some content for the third card.</p>
					</div>
				</div>
			</main>
		),
	},
};

export const WithEventsPage: Story = {
	args: {
		children: (
			<main className="p-8">
				<h1 className="text-3xl font-bold mb-6">Events</h1>
				<div className="grid gap-4">
					<div className="bg-base-100 p-6 rounded-lg shadow border-l-4 border-primary">
						<h3 className="font-bold text-xl mb-2">Volleyball Tournament</h3>
						<p className="/70 mb-2">
							Beach volleyball tournament at Santa Monica
						</p>
						<div className="flex justify-between items-center">
							<span className="text-sm">Date: Aug 15, 2024</span>
							<button className="btn btn-primary btn-sm">Join Event</button>
						</div>
					</div>
					<div className="bg-base-100 p-6 rounded-lg shadow border-l-4 border-secondary">
						<h3 className="font-bold text-xl mb-2">Training Session</h3>
						<p className="/70 mb-2">Weekly training at Indoor Sports Center</p>
						<div className="flex justify-between items-center">
							<span className="text-sm">Date: Aug 12, 2024</span>
							<button className="btn btn-secondary btn-sm">Join Event</button>
						</div>
					</div>
				</div>
			</main>
		),
	},
};

export const WithAdminPage: Story = {
	args: {
		children: (
			<main className="p-8">
				<h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<div className="bg-primary text-primary-content p-6 rounded-lg">
						<h3 className="font-bold text-2xl">125</h3>
						<p>Total Events</p>
					</div>
					<div className="bg-secondary text-secondary-content p-6 rounded-lg">
						<h3 className="font-bold text-2xl">2,341</h3>
						<p>Total Users</p>
					</div>
					<div className="bg-accent text-accent-content p-6 rounded-lg">
						<h3 className="font-bold text-2xl">18</h3>
						<p>Locations</p>
					</div>
					<div className="bg-base-300 p-6 rounded-lg">
						<h3 className="font-bold text-2xl">42</h3>
						<p>Active Events</p>
					</div>
				</div>
				<div className="bg-base-100 p-6 rounded-lg shadow">
					<h2 className="font-bold text-xl mb-4">Recent Activity</h2>
					<p>Admin controls and recent activity would be displayed here.</p>
				</div>
			</main>
		),
	},
};
