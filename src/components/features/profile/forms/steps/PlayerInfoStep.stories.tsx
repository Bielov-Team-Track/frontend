import { DominantHand, SkillLevel, VolleyballPosition } from "@/lib/models/Profile";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import PlayerInfoStep from "./PlayerInfoStep";

const meta: Meta<typeof PlayerInfoStep> = {
	title: "Features/Profile/Forms/PlayerInfoStep",
	component: PlayerInfoStep,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		formId: "player-info-form",
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
			preferredPosition: VolleyballPosition.OutsideHitter,
			secondaryPositions: [VolleyballPosition.OppositeHitter, VolleyballPosition.MiddleBlocker],
			highestLevelPlayed: SkillLevel.Advanced,
		},
	},
};
