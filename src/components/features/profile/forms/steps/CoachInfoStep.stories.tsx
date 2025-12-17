import type { Meta, StoryObj } from "@storybook/react";
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
		onNext: (data) => console.log("onNext", data),
	},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
	args: {
		defaultValues: {
			yearsOfExperience: 5,
			highestLevelCoached: "Advanced",
			certifications: ["FIVB Level 1 (2020)", "National Coaching (2018)"],
		},
	},
};
