"use client";

import { Button, Input } from "@/components/ui";
import { RegistrationStatus } from "@/lib/models/Club";
import { CheckCircle, Users, XCircle } from "lucide-react";
import { useState } from "react";

type Props = {
	currentStatus: RegistrationStatus;
	onStatusChange: (status: RegistrationStatus, note?: string) => void;
	isUpdating: boolean;
};

export const RegistrationStatusActions = ({ currentStatus, onStatusChange, isUpdating }: Props) => {
	const [showDeclineNote, setShowDeclineNote] = useState(false);
	const [declineNote, setDeclineNote] = useState("");

	const handleDecline = () => {
		if (!showDeclineNote) {
			setShowDeclineNote(true);
			return;
		}
		onStatusChange(RegistrationStatus.Declined, declineNote || undefined);
	};

	return (
		<div className="p-4 bg-white/5 rounded-xl border border-white/10">
			<h3 className="text-lg font-medium text-white mb-4">Actions</h3>

			<div className="flex flex-col gap-3">
				<div className="flex gap-3">
					<Button
						variant="solid"
						color="success"
						onClick={() => onStatusChange(RegistrationStatus.Accepted)}
						disabled={isUpdating}
						isLoading={isUpdating}
						leftIcon={<CheckCircle size={16} />}
						className="flex-1">
						Accept
					</Button>

					{currentStatus === RegistrationStatus.Pending && (
						<Button
							variant="outline"
							onClick={() => onStatusChange(RegistrationStatus.Waitlist)}
							disabled={isUpdating}
							leftIcon={<Users size={16} />}
							className="flex-1">
							Waitlist
						</Button>
					)}

					<Button variant="outline" color="danger" onClick={handleDecline} disabled={isUpdating} leftIcon={<XCircle size={16} />} className="flex-1">
						Decline
					</Button>
				</div>

				{showDeclineNote && (
					<div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
						<Input placeholder="Reason for declining (optional)" value={declineNote} onChange={(e) => setDeclineNote(e.target.value)} />
						<div className="flex gap-2 justify-end">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setShowDeclineNote(false);
									setDeclineNote("");
								}}>
								Cancel
							</Button>
							<Button
								variant="solid"
								color="danger"
								size="sm"
								onClick={() => onStatusChange(RegistrationStatus.Declined, declineNote || undefined)}
								disabled={isUpdating}
								isLoading={isUpdating}>
								Confirm Decline
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
