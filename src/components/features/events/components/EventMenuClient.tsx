"use client";

import { cancelEvent } from "@/lib/api/events";

export default function EventMenuClient({
	eventId,
	eventUrl,
	isAdmin,
}: {
	eventId: string;
	eventUrl: string;
	isAdmin: boolean;
}) {
	const copyUrl = async () => {
		try {
			await navigator.clipboard.writeText(eventUrl);
		} catch (_) {}
	};

	const onCancel = async () => {
		if (!isAdmin) return;
		await cancelEvent(eventId);
		window.location.reload();
	};

	return (
		<>
			<li>
				<a onClick={copyUrl}>Copy URL</a>
			</li>
			{isAdmin && (
				<li>
					<a onClick={onCancel}>Cancel</a>
				</li>
			)}
		</>
	);
}
