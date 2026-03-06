export { SessionOverviewBar } from "./SessionOverviewBar";
export { default as DrillLibraryPanel } from "./DrillLibraryPanel";
export { TimelineBuilderPanel } from "./TimelineBuilderPanel";
export { KeyboardShortcutsOverlay } from "./KeyboardShortcutsOverlay";
export { default as SessionTimelineSummary } from "./SessionTimelineSummary";
export { default as DrillSectionsTimeline } from "./DrillSectionsTimeline";
export { SideCard } from "./SideCard";

// Shared color constants
export {
	CATEGORY_SEGMENT_COLORS,
	INTENSITY_SEGMENT_COLORS,
	CATEGORY_PILL_COLORS,
	INTENSITY_PILL_COLORS,
	CATEGORY_LABELS,
	INTENSITY_LABELS,
	SECTION_COLORS,
	SKILL_COLOR_MAP,
	getSkillBadgeColor,
} from "./colors";

// Re-export types
export type { TimelineItem, Section, SessionOverviewBarProps } from "./SessionOverviewBar";
