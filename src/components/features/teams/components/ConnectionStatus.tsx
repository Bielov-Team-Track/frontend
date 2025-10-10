"use client";

import { usePositionStore } from "@/lib/realtime/positionStore";

export function ConnectionStatus() {
	const connectionStatus = usePositionStore((s) => s.connectionStatus);

	if (connectionStatus === "connected") {
		return (
			<div className="flex items-center gap-2 text-sm text-success">
				<div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
				<span>Live updates active</span>
			</div>
		);
	}

	if (connectionStatus === "connecting") {
		return (
			<div className="flex items-center gap-2 text-sm text-info">
				<div className="w-2 h-2 bg-info rounded-full animate-pulse"></div>
				<span>Connecting...</span>
			</div>
		);
	}

	if (connectionStatus === "reconnecting") {
		return (
			<div className="flex items-center gap-2 text-sm text-warning">
				<div className="w-2 h-2 bg-warning rounded-full animate-pulse"></div>
				<span>Reconnecting...</span>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2 text-sm text-error">
			<div className="w-2 h-2 bg-error rounded-full"></div>
			<span>Connection lost</span>
		</div>
	);
}
