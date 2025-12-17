import type { Meta, StoryObj } from "@storybook/react";
import PlayerInfoStep from "./PlayerInfoStep";
import { DominantHand } from "@/lib/models/Profile";

const meta: Meta<typeof PlayerInfoStep> = {
	title: "Features/Profile/Forms/PlayerInfoStep",
	component: PlayerInfoStep,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		formId: "player-info-form",
		onNext: (data) => console.log("onNext", data),
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
	args: {
		defaultValues: {
			heightCm: 185,
			verticalJumpCm: 70,
			dominantHand: DominantHand.Right,
			preferredPosition: "Outside Hitter",
			secondaryPositions: ["Opposite Hitter"],
			highestLevelPlayed: "Advanced",
		},
	},
};
