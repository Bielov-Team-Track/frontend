/**
 * Module-level mapping of optimistic message IDs to server-assigned message IDs.
 * Shared between the send mutation (page.tsx) and the ReceiveMessage handler (useRealtimeChats.ts).
 */
const optimisticMap = new Map<string, string>();

export function setOptimisticMapping(optimisticId: string, serverId: string) {
	optimisticMap.set(optimisticId, serverId);
}

export function getOptimisticIdForServerId(serverId: string): string | undefined {
	for (const [optId, srvId] of optimisticMap.entries()) {
		if (srvId === serverId) return optId;
	}
	return undefined;
}

export function deleteOptimisticMapping(optimisticId: string) {
	optimisticMap.delete(optimisticId);
}

export function clearOptimisticMap() {
	optimisticMap.clear();
}
