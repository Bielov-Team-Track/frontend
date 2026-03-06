import { useMemo } from "react";
import type { TrainingPlanDetail, PlanSection, PlanItem } from "@/lib/models/Template";

export interface PlanData {
	sections: PlanSection[];
	unassignedItems: PlanItem[];
	allItemsInOrder: (PlanItem & { sectionIndex: number })[];
	categoryDistribution: [string, number][];
	intensityDistribution: [string, number][];
	totalDuration: number;
	skills: string[];
}

const EMPTY: PlanData = {
	sections: [],
	unassignedItems: [],
	allItemsInOrder: [],
	categoryDistribution: [],
	intensityDistribution: [],
	totalDuration: 0,
	skills: [],
};

export function usePlanData(template: TrainingPlanDetail | undefined): PlanData {
	const sections = useMemo(() => {
		if (!template) return [];
		return (template.sections?.map((section) => ({
			...section,
			items: template.items?.filter((item) => item.sectionId === section.id).sort((a, b) => a.order - b.order) || [],
		})) || []).sort((a, b) => a.order - b.order);
	}, [template]);

	const unassignedItems = useMemo(() => {
		if (!template) return [];
		return template.items?.filter((item) => !item.sectionId).sort((a, b) => a.order - b.order) || [];
	}, [template]);

	const allItemsInOrder = useMemo(() => {
		const items: (PlanItem & { sectionIndex: number })[] = [];
		sections.forEach((section, sIdx) => {
			section.items.forEach((item) => {
				items.push({ ...item, sectionIndex: sIdx });
			});
		});
		unassignedItems.forEach((item) => {
			items.push({ ...item, sectionIndex: -1 });
		});
		return items;
	}, [sections, unassignedItems]);

	const categoryDistribution = useMemo(() => {
		const dist: Record<string, number> = {};
		allItemsInOrder.forEach((item) => {
			const cat = item.drill?.category || "Unknown";
			dist[cat] = (dist[cat] || 0) + (item.duration || 0);
		});
		return Object.entries(dist).sort((a, b) => b[1] - a[1]);
	}, [allItemsInOrder]);

	const intensityDistribution = useMemo(() => {
		const dist: Record<string, number> = {};
		allItemsInOrder.forEach((item) => {
			const int = item.drill?.intensity || "Medium";
			dist[int] = (dist[int] || 0) + (item.duration || 0);
		});
		return Object.entries(dist).sort((a, b) => b[1] - a[1]);
	}, [allItemsInOrder]);

	const totalDuration = template?.totalDuration || 0;

	const skills = useMemo(() => {
		return template?.skills ?? [];
	}, [template]);

	if (!template) return EMPTY;

	return {
		sections,
		unassignedItems,
		allItemsInOrder,
		categoryDistribution,
		intensityDistribution,
		totalDuration,
		skills,
	};
}
