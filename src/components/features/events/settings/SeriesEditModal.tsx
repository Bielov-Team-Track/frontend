"use client";

import { Button, Modal, RadioCards } from "@/components/ui";
import { SeriesUpdateScope } from "@/lib/api/events";
import { Calendar, CalendarRange, Repeat } from "lucide-react";
import { useState } from "react";

interface SeriesEditModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (scope: SeriesUpdateScope) => void;
	isLoading?: boolean;
	eventName?: string;
	occurrenceNumber?: number;
}

const scopeOptions = [
	{
		value: "thisEventOnly" as SeriesUpdateScope,
		label: "This event only",
		description: "Update only this occurrence. It will be detached from the series.",
		icon: Calendar,
	},
	{
		value: "allFutureEvents" as SeriesUpdateScope,
		label: "This and future events",
		description: "Update this and all future occurrences in the series.",
		icon: CalendarRange,
	},
	{
		value: "allEvents" as SeriesUpdateScope,
		label: "All events in series",
		description: "Update every event in the series, including past ones.",
		icon: Repeat,
	},
];

export function SeriesEditModal({
	isOpen,
	onClose,
	onConfirm,
	isLoading,
	eventName,
	occurrenceNumber,
}: SeriesEditModalProps) {
	const [selectedScope, setSelectedScope] = useState<SeriesUpdateScope>("thisEventOnly");

	const handleConfirm = () => {
		onConfirm(selectedScope);
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Update Recurring Event"
			description={
				occurrenceNumber
					? `This is occurrence #${occurrenceNumber} of "${eventName}". How would you like to apply your changes?`
					: `"${eventName}" is part of a recurring series. How would you like to apply your changes?`
			}
			size="md"
			isLoading={isLoading}
		>
			<div className="space-y-6 pt-2">
				<RadioCards
					options={scopeOptions}
					value={selectedScope}
					onChange={setSelectedScope}
					columns={1}
					size="md"
				/>

				<div className="flex justify-end gap-3 pt-2">
					<Button variant="ghost" color="neutral" onClick={onClose} disabled={isLoading}>
						Cancel
					</Button>
					<Button color="primary" onClick={handleConfirm} disabled={isLoading}>
						{isLoading ? "Saving..." : "Save Changes"}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
