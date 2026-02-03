"use client";

import { Loader } from "@/components/ui";
import {
	approveUser as approveUserRequest,
	disapproveUser as disapproveUserRequest,
	loadApprovalRequests,
	resetApproval as resetApprovalRequest,
} from "@/lib/api/approvals";
import { Approval } from "@/lib/models/Approval";
import { Check, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export default function ApprovalRequestsSection({ eventId }: { eventId: string }) {
	const [isLoading, setIsLoading] = useState<Boolean>(true);
	const [requests, setRequests] = useState<Approval[]>();

	const refreshRequests = useCallback(() => {
		setIsLoading(true);
		loadApprovalRequests(eventId).then((rs) => {
			setIsLoading(false);
			setRequests(rs);
		});
	}, [eventId]);

	useEffect(() => {
		refreshRequests();
	}, [refreshRequests]);

	const newRequestsCount = requests ? requests.filter((r) => r.approved == null).length : 0;

	const approveUser = async (userId: string) => {
		await approveUserRequest(eventId, userId);
		refreshRequests();
	};

	const disapproveUser = async (userId: string) => {
		await disapproveUserRequest(eventId, userId);
		refreshRequests();
	};

	const resetApproval = async (userId: string) => {
		await resetApprovalRequest(eventId, userId);
		refreshRequests();
	};

	return (
		<div className="collapse collapse-arrow bg-primary/5 relative">
			{isLoading && <Loader className="absolute inset-0 bg-black/55" />}
			<input type="checkbox" />
			<div className="collapse-title text-xl font-bold">
				<div className="flex justify-between items-center">
					<span>Approval Requests</span>
					{newRequestsCount > 0 && <span className="badge bg-primary text-primary-content">+{newRequestsCount}</span>}
				</div>
			</div>
			<div className="collapse-content">
				<div className="flex flex-col gap-2">
					{requests && requests.length > 0 ? (
						requests.map((r) => (
							<div key={r.user.id}>
								<div key={r.user?.id} className="bg-primary/90 text-primary-content rounded-md">
									<div className="collapse-title p-4 h-14 rounded-md bg-primary w-full flex justify-between">
										<div className=" flex items-center gap-2">
											<Image alt={r.user?.name!} className="avatar rounded" src={r.user?.imageUrl!} width={32} height={32} />
											<span>{r.user?.name}</span>
										</div>
										<div className="flex items-center gap-2">
											{r.approved == null ? (
												<>
													<button className="btn btn-xs btn-success" onClick={() => approveUser(r.user.id!)}>
														<Check size={14} />
													</button>
													<button className="btn btn-xs btn-error" onClick={() => disapproveUser(r.user.id!)}>
														<X size={14} />
													</button>
												</>
											) : r.approved ? (
												<>
													<button className="btn btn-xs btn-ghost link text-error" onClick={() => resetApproval(r.user.id!)}>
														reset
													</button>
													<span className="flex btn-xs bg-success rounded-md text-center items-center">Approved</span>
												</>
											) : (
												<>
													<button className="btn btn-xs btn-ghost link text-error" onClick={() => resetApproval(r.user.id!)}>
														reset
													</button>
													<span className="flex btn-xs bg-error rounded-md text-center items-center">Disapproved</span>
												</>
											)}
										</div>
									</div>
								</div>
							</div>
						))
					) : (
						<div>No requests yet</div>
					)}
				</div>
			</div>
		</div>
	);
}
