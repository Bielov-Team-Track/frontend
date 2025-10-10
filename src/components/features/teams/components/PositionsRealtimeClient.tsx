"use client";

import { useRealtimePositions } from "@/hooks/useRealtimePositions";

function PositionsRealtimeClient() {
	useRealtimePositions();
	return null;
}

export default PositionsRealtimeClient;
