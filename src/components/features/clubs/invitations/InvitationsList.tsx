"use client";

import { Button } from "@/components";
import { Dropdown, Loader } from "@/components/ui";
import { ClubInvitation, InvitationStatus } from "@/lib/models/Club";
import { getClubInvitationsPaged, revokeInvitation } from "@/lib/api/clubs";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Link, Loader2, Mail, Trash2, User } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface InvitationsListProps {
	clubId: string;
}

const statusColors: Record<InvitationStatus, string> = {
	[InvitationStatus.Pending]: "bg-warning/20 text-warning",
	[InvitationStatus.Accepted]: "bg-success/20 text-success",
	[InvitationStatus.Declined]: "bg-red-500/20 text-red-400",
	[InvitationStatus.Expired]: "bg-muted/20 text-muted-foreground-foreground",
	[InvitationStatus.Revoked]: "bg-muted/20 text-muted-foreground-foreground",
};

const InvitationsList = ({ clubId }: InvitationsListProps) => {
	const queryClient = useQueryClient();
	const [statusFilter, setStatusFilter] = useState<InvitationStatus | "">("");
	const [copiedId, setCopiedId] = useState<string | null>(null);
	const sentinelRef = useRef<HTMLDivElement>(null);

	const {
		data,
		isLoading,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	} = useInfiniteQuery({
		queryKey: ["club-invitations", clubId, statusFilter],
		queryFn: ({ pageParam }) =>
			getClubInvitationsPaged(clubId, statusFilter || undefined, pageParam, 20),
		initialPageParam: undefined as string | undefined,
		getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : undefined),
	});

	const invitations = useMemo(
		() => data?.pages.flatMap((p) => p.items) ?? [],
		[data]
	);

	// Infinite scroll observer
	useEffect(() => {
		if (!hasNextPage || isFetchingNextPage) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					fetchNextPage();
				}
			},
			{ threshold: 0.1 }
		);

		const el = sentinelRef.current;
		if (el) observer.observe(el);

		return () => {
			if (el) observer.unobserve(el);
		};
	}, [hasNextPage, isFetchingNextPage, fetchNextPage]);

	const revokeMutation = useMutation({
		mutationFn: (invitationId: string) => revokeInvitation(clubId, invitationId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club-invitations", clubId] });
			toast.success("Invitation revoked");
		},
		onError: () => toast.error("Failed to revoke invitation"),
	});

	const copyLink = (invitation: ClubInvitation) => {
		const link = `${window.location.origin}/clubs/${clubId}/invitations/${invitation.token}`;
		navigator.clipboard.writeText(link);
		setCopiedId(invitation.id);
		setTimeout(() => setCopiedId(null), 2000);
	};

	const filterOptions = [
		{ value: "", label: "All Statuses" },
		{ value: InvitationStatus.Pending, label: "Pending" },
		{ value: InvitationStatus.Accepted, label: "Accepted" },
		{ value: InvitationStatus.Declined, label: "Declined" },
		{ value: InvitationStatus.Expired, label: "Expired" },
		{ value: InvitationStatus.Revoked, label: "Revoked" },
	];

	if (isLoading) return <Loader />;

	return (
		<div className="flex flex-col gap-4">
			<Dropdown
				value={statusFilter}
				onChange={(val) => setStatusFilter(val as InvitationStatus | "")}
				options={filterOptions}
				placeholder="Filter by status"
			/>
			{invitations.length === 0 ? (
				<div className="p-8 bg-surface rounded-xl text-center">
					<p className="text-muted-foreground-foreground">No invitations found</p>
				</div>
			) : (
				<div className="flex flex-col gap-2">
					{invitations.map((invitation) => (
						<div key={invitation.id} className="p-4 bg-surface rounded-xl border border-border flex items-center justify-between gap-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
									{invitation.targetEmail ? (
										<Mail size={18} className="text-muted-foreground" />
									) : invitation.targetUserId ? (
										<User size={18} className="text-muted-foreground" />
									) : (
										<Link size={18} className="text-muted-foreground" />
									)}
								</div>
								<div>
									<p className="text-sm font-medium text-foreground">{invitation.targetEmail || invitation.targetUserId || "Link Invitation"}</p>
									<p className="text-xs text-muted-foreground">Created {new Date(invitation.createdAt).toLocaleDateString()}</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[invitation.status]}`}>{invitation.status}</span>
								{invitation.status === InvitationStatus.Pending && (
									<>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => copyLink(invitation)}
											leftIcon={copiedId === invitation.id ? <Check size={14} /> : <Copy size={14} />}>
											{copiedId === invitation.id ? "Copied" : "Copy"}
										</Button>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => revokeMutation.mutate(invitation.id)}
											loading={revokeMutation.isPending}
											className="text-red-400 hover:text-red-300">
											<Trash2 size={14} />
										</Button>
									</>
								)}
							</div>
						</div>
					))}

					{/* Infinite scroll sentinel */}
					{hasNextPage && (
						<div ref={sentinelRef} className="flex justify-center py-4">
							{isFetchingNextPage && <Loader2 className="animate-spin text-muted-foreground" size={20} />}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default InvitationsList;
