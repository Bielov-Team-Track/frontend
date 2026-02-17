import client from "./client";

const PREFIX = "/coaching";

export type ExportFormat = "csv" | "excel";

/**
 * Export event evaluations
 * @param eventId The event ID
 * @param format Export format (csv or excel)
 * @param includeDetails Whether to include detailed scores
 * @returns Blob for download
 */
export async function exportEventEvaluations(
	eventId: string,
	format: ExportFormat = "csv",
	includeDetails: boolean = true
): Promise<Blob> {
	const endpoint = `/v1/export/event-evaluations/${eventId}`;
	const params = { format, includeDetails };
	const response = await client.get(PREFIX + endpoint, {
		params,
		responseType: "blob",
	});
	return response.data;
}

/**
 * Export current user's evaluations
 * @param format Export format (csv or excel)
 * @param startDate Optional start date filter
 * @param endDate Optional end date filter
 * @returns Blob for download
 */
export async function exportMyEvaluations(
	format: ExportFormat = "csv",
	startDate?: Date,
	endDate?: Date
): Promise<Blob> {
	const endpoint = "/v1/export/my-evaluations";
	const params: { format: ExportFormat; startDate?: string; endDate?: string } = { format };
	if (startDate) {
		params.startDate = startDate.toISOString();
	}
	if (endDate) {
		params.endDate = endDate.toISOString();
	}
	const response = await client.get(PREFIX + endpoint, {
		params,
		responseType: "blob",
	});
	return response.data;
}

/**
 * Export skill matrix for an event
 * @param eventId The event ID
 * @param format Export format (csv or excel)
 * @returns Blob for download
 */
export async function exportSkillMatrix(eventId: string, format: ExportFormat = "csv"): Promise<Blob> {
	const endpoint = `/v1/export/skill-matrix/${eventId}`;
	const params = { format };
	const response = await client.get(PREFIX + endpoint, {
		params,
		responseType: "blob",
	});
	return response.data;
}

/**
 * Helper function to trigger file download from blob
 * @param blob The blob data
 * @param filename The filename to save as
 */
export function downloadBlob(blob: Blob, filename: string): void {
	const url = window.URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	window.URL.revokeObjectURL(url);
}
