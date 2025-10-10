import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Loader from "./index";

const meta: Meta<typeof Loader> = {
	title: "UI/Loader",
	component: Loader,
	parameters: {
		layout: "centered",
		docs: {
			description: {
				component:
					"A loading spinner component that centers itself and displays a large spinning animation.",
			},
		},
	},
	tags: ["autodocs"],
	argTypes: {
		className: {
			control: { type: "text" },
			description: "Additional CSS classes to apply to the loader container",
		},
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {},
};

export const WithCustomStyling: Story = {
	args: {
		className: "bg-gray-100 rounded-lg p-8",
	},
};

export const InCard: Story = {
	render: () => (
		<div className="bg-white rounded-lg shadow-lg border p-6 w-80">
			<h3 className="text-lg font-semibold mb-4">Loading Content</h3>
			<div className="h-32">
				<Loader />
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Loader displayed inside a card component.",
			},
		},
	},
};

export const FullScreenOverlay: Story = {
	render: () => (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
			<div className="bg-white rounded-lg p-6">
				<div className="text-center mb-4">
					<h3 className="text-lg font-semibold">Please wait...</h3>
					<p className="text-gray-600">Loading your data</p>
				</div>
				<Loader />
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story:
					"Loader used as a full-screen overlay with a modal-like container.",
			},
		},
	},
};

export const InButton: Story = {
	render: () => (
		<div className="space-y-4">
			<button
				disabled
				className="btn bg-primary text-white px-6 py-2 rounded disabled:opacity-50 flex items-center gap-2"
			>
				<div className="w-4 h-4">
					<span className="loading loading-spinner loading-sm"></span>
				</div>
				Loading...
			</button>
			<button
				disabled
				className="btn bg-secondary text-white px-6 py-2 rounded disabled:opacity-50 flex items-center gap-2"
			>
				<div className="w-4 h-4">
					<span className="loading loading-spinner loading-sm"></span>
				</div>
				Saving...
			</button>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Small loaders used within buttons to indicate loading states.",
			},
		},
	},
};

export const LoadingStates: Story = {
	render: () => (
		<div className="space-y-8">
			<div>
				<h3 className="text-lg font-semibold mb-4">Loading Table Data</h3>
				<div className="border rounded-lg overflow-hidden">
					<table className="w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-2 text-left">Name</th>
								<th className="px-4 py-2 text-left">Email</th>
								<th className="px-4 py-2 text-left">Status</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td colSpan={3} className="h-32">
									<Loader />
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div>
				<h3 className="text-lg font-semibold mb-4">Loading Dashboard</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="bg-white border rounded-lg p-4 h-24">
						<Loader />
					</div>
					<div className="bg-white border rounded-lg p-4 h-24">
						<Loader />
					</div>
					<div className="bg-white border rounded-lg p-4 h-24">
						<Loader />
					</div>
				</div>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Examples of loaders in different content loading scenarios.",
			},
		},
	},
};

export const Sizes: Story = {
	render: () => (
		<div className="flex items-center gap-8">
			<div className="text-center">
				<div className="mb-2">
					<span className="loading loading-spinner loading-xs"></span>
				</div>
				<p className="text-sm text-gray-600">Extra Small</p>
			</div>
			<div className="text-center">
				<div className="mb-2">
					<span className="loading loading-spinner loading-sm"></span>
				</div>
				<p className="text-sm text-gray-600">Small</p>
			</div>
			<div className="text-center">
				<div className="mb-2">
					<span className="loading loading-spinner loading-md"></span>
				</div>
				<p className="text-sm text-gray-600">Medium</p>
			</div>
			<div className="text-center">
				<div className="mb-2">
					<span className="loading loading-spinner loading-lg"></span>
				</div>
				<p className="text-sm text-gray-600">Large (Default)</p>
			</div>
		</div>
	),
	parameters: {
		docs: {
			description: {
				story: "Different sizes of loading spinners available.",
			},
		},
	},
};
