import { SkillLevel } from "@/lib/models/Profile";
import { Meta, StoryObj } from "@storybook/nextjs-vite";
import CoachInfoStep from "./CoachInfoStep";

const meta: Meta<typeof CoachInfoStep> = {
	title: "Features/Profile/Forms/CoachInfoStep",
	component: CoachInfoStep,
	parameters: {
		layout: "centered",
	},
	tags: ["autodocs"],
	args: {
		formId: "coach-info-form",
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
	args: {
		defaultValues: {
			yearsOfExperience: 5,
			highestLevelCoached: SkillLevel.Advanced,
			qualifications: [
				{ name: "FIVB Level 1", year: 2020 },
				{ name: "National Coaching (2018)", year: 2018 },
			],
		},
	},
};
