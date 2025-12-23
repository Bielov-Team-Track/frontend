"use client";

import { AlertCircle, XCircle, Hourglass } from "lucide-react";
import {
	checkUserApproval,
	requestApproval as requestApprovalRequest,
} from "@/lib/api/approvals";
import { Approval } from "@/lib/models/Approval";
import { useState } from "react";
import { Loader } from "@/components/ui";

function ApprovalSection({
	defaultApproval,
	userId,
	eventId,
}: {
	defaultApproval: Approval;
	userId: string;
	eventId: string;
}) {
	const [approval, setApproval] = useState<Approval>(defaultApproval);
	const [isLoading, setIsLoading] = useState<Boolean>();

	const requestApproval = async () => {
		setIsLoading(true);
		requestApprovalRequest(userId, eventId).then(() => {
			checkUserApproval(eventId, userId).then((approval) => {
				setApproval(approval);
				setIsLoading(false);
			});
		});
	};

	return (
		<div>
			{isLoading && <Loader />}
			{!approval ? (
				<div className="flex flex-col items-center gap-4 text-center">
					<AlertCircle size={48} />
					<span>
						To access this event you need to ask orginizers for approval
					</span>
					<button className="btn" onClick={requestApproval}>
						Request approval
					</button>
				</div>
			) : approval.approved == null ? (
				<div className="flex flex-col items-center gap-4 text-center">
					<Hourglass size={48} />
					<span>Your approval is pending</span>
				</div>
			) : (
				!approval.approved && (
					<div className="flex flex-col items-center gap-4 text-center">
						<XCircle size={48} />
						<span>This event is unavailable to you</span>
					</div>
				)
			)}
		</div>
	);
}

export default ApprovalSection;
