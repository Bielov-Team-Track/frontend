"use client";

import { MultiSelectPills } from "@/components/ui";
import { DrillSkill, SKILLS } from "./types";

interface SkillFilterProps {
	selectedSkills: DrillSkill[];
	onSelectedSkillsChange: (skills: DrillSkill[]) => void;
	label?: string;
}

const SKILL_OPTIONS = SKILLS.map((skill) => ({ value: skill, label: skill }));

export default function SkillFilter({ selectedSkills, onSelectedSkillsChange, label = "Focus Areas" }: SkillFilterProps) {
	return (
		<MultiSelectPills
			label={label}
			options={SKILL_OPTIONS}
			selectedItems={selectedSkills}
			onSelectedItemsChange={(items) => onSelectedSkillsChange(items as DrillSkill[])}
		/>
	);
}
