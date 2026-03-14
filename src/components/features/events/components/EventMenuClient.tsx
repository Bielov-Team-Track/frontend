"use client";

import { cancelEvent } from "@/lib/api/events";
import { ShareMenuItem } from "@/components/features/share";
import type { ShareableEntity } from "@/components/features/share";

export default function EventMenuClient({
	eventId,
	eventName,
	eventUrl,
	isAdmin,
}: {
	eventId: string;
	eventName: string;
	eventUrl: string;
	isAdmin: boolean;
}) {
	const entity: ShareableEntity = {
		type: 'event',
		id: eventId,
		data: {
			title: eventName,
			url: `/events/${eventId}`,
		},
	};

	const onCancel = async () => {
		if (!isAdmin) return;
		await cancelEvent(eventId);
		window.location.reload();
	};

	return (
		<>
			<ShareMenuItem entity={entity} />
			{isAdmin && (
				<li>
					<a onClick={onCancel}>Cancel</a>
				</li>
			)}
		</>
	);
}
