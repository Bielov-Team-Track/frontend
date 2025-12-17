import type { Meta, StoryObj } from "@storybook/react";
import HistoryStep, { HistoryEntry } from "./HistoryStep";

const meta: Meta<typeof HistoryStep> = {
	title: "Features/Profile/Forms/HistoryStep",
	component: HistoryStep,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		formId: "history-form",
		onNext: (data) => console.log("onNext", data),
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
	args: {
		initialEntries: [
			{
				id: "1",
				year: "2024",
				clubName: "Newcastle Panthers",
				clubLogoUrl:
					"https://api.dicebear.com/7.x/identicon/svg?seed=Newcastle",
				teamName: "White Panthers",
				teamLogoUrl:
					"https://api.dicebear.com/7.x/identicon/svg?seed=WhitePanthers",
				role: "Player",
				positions: ["Outside Hitter", "Opposite Hitter"],
			},
			{
				id: "2",
				year: "2023",
				clubName: "Marden Volleyball Club",
				clubLogoUrl:
					"https://api.dicebear.com/7.x/identicon/svg?seed=Marden",
				role: "Head Coach",
				positions: [],
			},
		],
	},
};
