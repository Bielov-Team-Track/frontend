import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Sidebar from "./index";

const meta: Meta<typeof Sidebar> = {
	title: "Layout/Sidebar",
	component: Sidebar,
	parameters: {
		layout: "fullscreen",
	},
	tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Preview: Story = {
	parameters: {
		nextjs: {
			navigation: {
				pathname: "/events",
				asPath: "/events",
			},
			appDirectory: true,
		},
	},
	args: {
		mockPathname: "/events",
	},
	render: (args) => <Sidebar></Sidebar>,
};
