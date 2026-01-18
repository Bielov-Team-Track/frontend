import { EventType } from "@/lib/models/Event";
import { useEventFormContext } from "../context/EventFormContext";
import { getEventFormatForType } from "../types/registration";
import { ListRegistration } from "./registration/ListRegistration";
import { MatchTeamSlots } from "./registration/MatchTeamSlots";
import { CasualPlayRegistration } from "./registration/CasualPlayRegistration";

export function RegistrationStep() {
	const { form } = useEventFormContext();
	const { watch } = form;
	const eventType = watch("type") as EventType;

	const formatType = getEventFormatForType(eventType);

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div className="border-b-2 pb-4">
				<h2 className="text-xl font-bold text-white mb-1">Registration</h2>
				<p className="text-muted text-sm">Configure how participants can join your event.</p>
			</div>

			<div className="space-y-6">
				{formatType === "match" && <MatchTeamSlots />}

				{formatType === "list" && <ListRegistration />}

				{formatType === "choice" && <CasualPlayRegistration />}
			</div>
		</div>
	);
}
