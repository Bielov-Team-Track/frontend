"use client";

import { Checkbox } from "@/components/ui";

interface Props {
	autoRenewalConfirmed: boolean;
	cancellationRightsConfirmed: boolean;
	onAutoRenewalChange: (value: boolean) => void;
	onCancellationRightsChange: (value: boolean) => void;
}

export default function AcknowledgmentCheckbox({
	autoRenewalConfirmed,
	cancellationRightsConfirmed,
	onAutoRenewalChange,
	onCancellationRightsChange,
}: Props) {
	return (
		<div className="space-y-3">
			<Checkbox
				checked={autoRenewalConfirmed}
				onChange={onAutoRenewalChange}
				label="I understand this subscription will auto-renew"
				helperText="You will be automatically charged at the start of each billing period until you cancel."
			/>
			<Checkbox
				checked={cancellationRightsConfirmed}
				onChange={onCancellationRightsChange}
				label="I understand my cancellation rights"
				helperText="I can cancel at any time from my subscription settings. I have a 14-day cooling-off period for a full refund."
			/>
		</div>
	);
}
