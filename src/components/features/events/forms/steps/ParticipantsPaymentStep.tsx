"use client";

import { EventType } from "@/lib/models/Event";
import { useEventFormContext } from "../context/EventFormContext";
import { getEventFormatForType } from "../types/registration";
import { CasualPlayFormatSelector } from "./registration/CasualPlayFormatSelector";
import { CommonRegistrationSettings } from "./registration/CommonRegistrationSettings";
import { MatchTeamSlots } from "./registration/MatchTeamSlots";
import { CasualPlayTeamConfig } from "./registration/CasualPlayTeamConfig";

export default function ParticipantsPaymentStep() {
	const { form } = useEventFormContext();
	const { watch } = form;
	const eventType = watch("type") as EventType;
	const casualPlayFormat = watch("casualPlayFormat");

	const formatType = getEventFormatForType(eventType);
	const showTeamConfig = formatType === "choice" && (casualPlayFormat === "openTeams" || casualPlayFormat === "teamsWithPositions");

	return (
		<div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-right-4 duration-300" data-testid="participants-payment-step">
			{/* Section Header */}
			<div className="border-b-2 pb-3 sm:pb-4">
				<h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Participants</h2>
				<p className="text-muted-foreground text-xs sm:text-sm">Configure who can join and how</p>
			</div>

			{/* Event-Type-Specific Controls */}
			{formatType === "match" && <MatchTeamSlots />}

			{formatType === "choice" && <CasualPlayFormatSelector />}

			{showTeamConfig && <CasualPlayTeamConfig />}

			{/* Shared Registration Settings (all event types) */}
			<CommonRegistrationSettings />
		</div>
	);
}
