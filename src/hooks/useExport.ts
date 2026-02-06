import { useMutation } from "@tanstack/react-query";
import {
	exportEventEvaluations,
	exportMyEvaluations,
	exportSkillMatrix,
	downloadBlob,
	ExportFormat,
} from "@/lib/api/export";

// =============================================================================
// EXPORT MUTATIONS
// =============================================================================

/**
 * Hook to export event evaluations
 * Returns a mutation that downloads the file when triggered
 */
export function useExportEventEvaluations() {
	return useMutation({
		mutationFn: async ({
			eventId,
			format = "csv",
			includeDetails = true,
			filename,
		}: {
			eventId: string;
			format?: ExportFormat;
			includeDetails?: boolean;
			filename?: string;
		}) => {
			const blob = await exportEventEvaluations(eventId, format, includeDetails);
			const defaultFilename = `event-evaluations-${eventId}.${format === "excel" ? "xlsx" : "csv"}`;
			downloadBlob(blob, filename || defaultFilename);
			return blob;
		},
	});
}

/**
 * Hook to export current user's evaluations
 * Returns a mutation that downloads the file when triggered
 */
export function useExportMyEvaluations() {
	return useMutation({
		mutationFn: async ({
			format = "csv",
			startDate,
			endDate,
			filename,
		}: {
			format?: ExportFormat;
			startDate?: Date;
			endDate?: Date;
			filename?: string;
		}) => {
			const blob = await exportMyEvaluations(format, startDate, endDate);
			const defaultFilename = `my-evaluations.${format === "excel" ? "xlsx" : "csv"}`;
			downloadBlob(blob, filename || defaultFilename);
			return blob;
		},
	});
}

/**
 * Hook to export skill matrix for an event
 * Returns a mutation that downloads the file when triggered
 */
export function useExportSkillMatrix() {
	return useMutation({
		mutationFn: async ({
			eventId,
			format = "csv",
			filename,
		}: {
			eventId: string;
			format?: ExportFormat;
			filename?: string;
		}) => {
			const blob = await exportSkillMatrix(eventId, format);
			const defaultFilename = `skill-matrix-${eventId}.${format === "excel" ? "xlsx" : "csv"}`;
			downloadBlob(blob, filename || defaultFilename);
			return blob;
		},
	});
}
