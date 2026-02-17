"use client";

import { SettingsCard, SettingsHeader } from "@/components/layout/settings-layout";
import { EmptyState, Loader } from "@/components/ui";
import { LevelManager, type EditorLevel } from "@/components/features/evaluations/skill-matrix/LevelManager";
import { MatrixEditor } from "@/components/features/evaluations/skill-matrix/MatrixEditor";
import { VOLLEYBALL_SKILLS } from "@/components/features/evaluations/types";
import {
	useDefaultSkillMatrix,
	useCreateSkillMatrixFromTemplate,
	useUpdateSkillMatrixFull,
} from "@/hooks/useSkillMatrix";
import type { ClubSkillMatrix, UpdateSkillMatrixFullRequest } from "@/lib/models/SkillMatrix";
import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { BarChart3 } from "lucide-react";
import { COLOR_PALETTE } from "@/components/features/evaluations/skill-matrix/LevelManager";

// ---------- Editor State Types ----------

interface EditorState {
	name: string;
	levels: EditorLevel[];
	anchors: number[][]; // anchors[skillIndex][levelBoundaryIndex]
	criteria: Record<string, string>; // "SkillName-levelIndex" -> text
}

// ---------- Conversion Helpers ----------

function matrixToEditorState(matrix: ClubSkillMatrix): EditorState {
	const firstSkill = matrix.skills[0];
	if (!firstSkill) {
		return { name: matrix.name, levels: [], anchors: [], criteria: {} };
	}

	const sortedBands = [...firstSkill.bands].sort((a, b) => a.order - b.order);

	// Extract levels from first skill's bands
	const levels: EditorLevel[] = sortedBands.map((band) => ({
		name: band.label,
		color: band.color || "#64748b",
		description: band.description || "",
	}));

	// Extract anchors per skill: all bands' MaxScore except the last one (always 10)
	const anchors: number[][] = matrix.skills.map((skill) => {
		const sorted = [...skill.bands].sort((a, b) => a.order - b.order);
		// Anchors are MaxScore of all bands except the last
		return sorted.slice(0, -1).map((band) => band.maxScore);
	});

	// Extract criteria
	const criteria: Record<string, string> = {};
	matrix.skills.forEach((skill) => {
		const sorted = [...skill.bands].sort((a, b) => a.order - b.order);
		sorted.forEach((band, levelIndex) => {
			if (band.criteria) {
				criteria[`${skill.skill}-${levelIndex}`] = band.criteria;
			}
		});
	});

	return { name: matrix.name, levels, anchors, criteria };
}

function buildUpdateRequest(state: EditorState): UpdateSkillMatrixFullRequest {
	return {
		name: state.name,
		skills: VOLLEYBALL_SKILLS.map((skill, skillIndex) => ({
			skill,
			bands: state.levels.map((level, levelIndex) => ({
				order: levelIndex + 1,
				minScore: levelIndex === 0 ? 0 : state.anchors[skillIndex][levelIndex - 1],
				maxScore:
					levelIndex === state.levels.length - 1
						? 10
						: state.anchors[skillIndex][levelIndex],
				label: level.name,
				criteria: state.criteria[`${skill}-${levelIndex}`] || undefined,
				color: level.color,
				description: level.description || undefined,
			})),
		})),
	};
}

function roundToHalf(value: number) {
	return Math.round(value * 2) / 2;
}

// ---------- Page Component ----------

export default function EvaluationsSettingsPage() {
	const params = useParams();
	const clubId = params.id as string;

	const { data: matrix, isLoading } = useDefaultSkillMatrix(clubId);
	const createFromTemplate = useCreateSkillMatrixFromTemplate(clubId);
	const updateFull = useUpdateSkillMatrixFull(clubId);

	const [editorState, setEditorState] = useState<EditorState | null>(null);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	// Sync API data into editor state
	useEffect(() => {
		if (matrix) {
			setEditorState(matrixToEditorState(matrix));
			setHasUnsavedChanges(false);
		}
	}, [matrix]);

	const markDirty = useCallback(() => setHasUnsavedChanges(true), []);

	// ---------- Level Handlers ----------

	const handleAddLevel = useCallback(() => {
		if (!editorState) return;

		// Find the largest gap to insert the new level
		let maxGap = 0;
		let insertIndex = 0;

		for (let i = 0; i < editorState.levels.length; i++) {
			const avgTop =
				i === editorState.levels.length - 1
					? 10
					: editorState.anchors.reduce((sum, a) => sum + a[i], 0) / editorState.anchors.length;
			const avgBottom =
				i === 0
					? 0
					: editorState.anchors.reduce((sum, a) => sum + a[i - 1], 0) / editorState.anchors.length;
			const gap = avgTop - avgBottom;
			if (gap > maxGap) {
				maxGap = gap;
				insertIndex = i;
			}
		}

		const newLevel: EditorLevel = {
			name: "New Level",
			color: COLOR_PALETTE[editorState.levels.length % COLOR_PALETTE.length],
			description: "",
		};

		// Insert anchor at midpoint for each skill
		const newAnchors = editorState.anchors.map((skillAnchors) => {
			const updated = [...skillAnchors];
			const top = insertIndex >= updated.length ? 10 : updated[insertIndex];
			const bottom = insertIndex === 0 ? 0 : updated[insertIndex - 1];
			const mid = roundToHalf((top + bottom) / 2);
			updated.splice(insertIndex, 0, mid);
			return updated;
		});

		// Re-key criteria: shift indices for levels at or after insert
		const newCriteria: Record<string, string> = {};
		Object.entries(editorState.criteria).forEach(([key, value]) => {
			const dashIdx = key.lastIndexOf("-");
			const skill = key.substring(0, dashIdx);
			const idx = parseInt(key.substring(dashIdx + 1));
			if (idx < insertIndex) {
				newCriteria[key] = value;
			} else {
				newCriteria[`${skill}-${idx + 1}`] = value;
			}
		});

		const newLevels = [...editorState.levels];
		newLevels.splice(insertIndex, 0, newLevel);

		setEditorState({ ...editorState, levels: newLevels, anchors: newAnchors, criteria: newCriteria });
		markDirty();
	}, [editorState, markDirty]);

	const handleDeleteLevel = useCallback(
		(index: number) => {
			if (!editorState || editorState.levels.length <= 2) return;

			const newLevels = editorState.levels.filter((_, i) => i !== index);

			const newAnchors = editorState.anchors.map((skillAnchors) => {
				const updated = [...skillAnchors];
				if (index < updated.length) {
					updated.splice(index, 1);
				} else {
					updated.pop();
				}
				return updated;
			});

			// Re-key criteria
			const newCriteria: Record<string, string> = {};
			Object.entries(editorState.criteria).forEach(([key, value]) => {
				const dashIdx = key.lastIndexOf("-");
				const skill = key.substring(0, dashIdx);
				const idx = parseInt(key.substring(dashIdx + 1));
				if (idx < index) {
					newCriteria[key] = value;
				} else if (idx > index) {
					newCriteria[`${skill}-${idx - 1}`] = value;
				}
				// idx === index: drop criteria for deleted level
			});

			setEditorState({ ...editorState, levels: newLevels, anchors: newAnchors, criteria: newCriteria });
			markDirty();
		},
		[editorState, markDirty]
	);

	const handleRenameLevel = useCallback(
		(index: number, name: string) => {
			if (!editorState) return;
			const newLevels = [...editorState.levels];
			newLevels[index] = { ...newLevels[index], name };
			setEditorState({ ...editorState, levels: newLevels });
			markDirty();
		},
		[editorState, markDirty]
	);

	const handleReorderLevel = useCallback(
		(fromIndex: number, toIndex: number) => {
			if (!editorState) return;

			const newLevels = [...editorState.levels];
			const [moved] = newLevels.splice(fromIndex, 1);
			newLevels.splice(toIndex, 0, moved);

			// Reorder anchors: compute segment sizes per skill, reorder, rebuild
			const newAnchors = editorState.anchors.map((skillAnchors) => {
				const allBounds = [0, ...skillAnchors, 10];
				const segSizes: number[] = [];
				for (let i = 0; i < allBounds.length - 1; i++) {
					segSizes.push(allBounds[i + 1] - allBounds[i]);
				}
				const [movedSize] = segSizes.splice(fromIndex, 1);
				segSizes.splice(toIndex, 0, movedSize);

				const rebuilt: number[] = [];
				let cumulative = 0;
				for (let i = 0; i < segSizes.length - 1; i++) {
					cumulative += segSizes[i];
					rebuilt.push(roundToHalf(cumulative));
				}
				return rebuilt;
			});

			// Re-key criteria
			const newCriteria: Record<string, string> = {};
			Object.entries(editorState.criteria).forEach(([key, value]) => {
				const dashIdx = key.lastIndexOf("-");
				const skill = key.substring(0, dashIdx);
				let idx = parseInt(key.substring(dashIdx + 1));
				if (idx === fromIndex) {
					idx = toIndex;
				} else if (fromIndex < toIndex && idx > fromIndex && idx <= toIndex) {
					idx = idx - 1;
				} else if (fromIndex > toIndex && idx >= toIndex && idx < fromIndex) {
					idx = idx + 1;
				}
				newCriteria[`${skill}-${idx}`] = value;
			});

			setEditorState({ ...editorState, levels: newLevels, anchors: newAnchors, criteria: newCriteria });
			markDirty();
		},
		[editorState, markDirty]
	);

	const handleColorChange = useCallback(
		(index: number, color: string) => {
			if (!editorState) return;
			const newLevels = [...editorState.levels];
			newLevels[index] = { ...newLevels[index], color };
			setEditorState({ ...editorState, levels: newLevels });
			markDirty();
		},
		[editorState, markDirty]
	);

	const handleDescriptionChange = useCallback(
		(index: number, description: string) => {
			if (!editorState) return;
			const newLevels = [...editorState.levels];
			newLevels[index] = { ...newLevels[index], description };
			setEditorState({ ...editorState, levels: newLevels });
			markDirty();
		},
		[editorState, markDirty]
	);

	// ---------- Matrix Handlers ----------

	const handleAnchorChange = useCallback(
		(skillIndex: number, levelIndex: number, value: number) => {
			if (!editorState) return;
			const newAnchors = editorState.anchors.map((a) => [...a]);
			newAnchors[skillIndex][levelIndex] = value;
			setEditorState((prev) => (prev ? { ...prev, anchors: newAnchors } : prev));
			markDirty();
		},
		[editorState, markDirty]
	);

	const handleCriteriaChange = useCallback(
		(key: string, value: string) => {
			if (!editorState) return;
			const newCriteria = { ...editorState.criteria };
			if (value) {
				newCriteria[key] = value;
			} else {
				delete newCriteria[key];
			}
			setEditorState({ ...editorState, criteria: newCriteria });
			markDirty();
		},
		[editorState, markDirty]
	);

	// ---------- Save ----------

	const handleSave = useCallback(() => {
		if (!editorState || !matrix) return;
		const request = buildUpdateRequest(editorState);
		updateFull.mutate(
			{ id: matrix.id, request },
			{ onSuccess: () => setHasUnsavedChanges(false) }
		);
	}, [editorState, matrix, updateFull]);

	// ---------- Render ----------

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-20">
				<Loader />
			</div>
		);
	}

	// No matrix exists — show empty state
	if (!matrix || !editorState) {
		return (
			<div className="space-y-6">
				<SettingsHeader title="Skill Levels" />
				<EmptyState
					icon={BarChart3}
					title="No skill matrix configured"
					description="Create a skill matrix to define how player scores map to skill levels. You can customize levels, score ranges, and criteria for each skill."
					action={{
						label: "Add Skill Levels",
						onClick: () => createFromTemplate.mutate(),
					}}
				/>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<SettingsHeader
				title="Skill Levels"
				isDirty={hasUnsavedChanges}
				onSave={handleSave}
				isLoading={updateFull.isPending}
			/>

			<SettingsCard title="Skill Levels" description="Define the levels and their colors. Drag to reorder.">
				<LevelManager
					levels={editorState.levels}
					onAddLevel={handleAddLevel}
					onDeleteLevel={handleDeleteLevel}
					onRenameLevel={handleRenameLevel}
					onReorderLevel={handleReorderLevel}
					onColorChange={handleColorChange}
					onDescriptionChange={handleDescriptionChange}
				/>
			</SettingsCard>

			<SettingsCard
				title="Score Matrix"
				description="Drag anchors between levels to adjust score ranges per skill. Click a segment to add criteria."
			>
				<MatrixEditor
					levels={editorState.levels}
					anchors={editorState.anchors}
					criteria={editorState.criteria}
					onAnchorChange={handleAnchorChange}
					onCriteriaChange={handleCriteriaChange}
				/>
			</SettingsCard>
		</div>
	);
}
