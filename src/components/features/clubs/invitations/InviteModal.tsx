"use client";

import { Button } from "@/components";
import { Dropdown, Input, Modal } from "@/components/ui";
import { CreateInvitationRequest } from "@/lib/models/Club";
import { createInvitation, getClubFormTemplates } from "@/lib/api/clubs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Link, Mail, Search } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type InviteMethod = "link" | "email" | "user";

interface InviteModalProps {
	clubId: string;
	isOpen: boolean;
	onClose: () => void;
	defaultRequirePlayerProfile?: boolean;
	defaultRequireCoachProfile?: boolean;
}

const InviteModal = ({ clubId, isOpen, onClose, defaultRequirePlayerProfile = false, defaultRequireCoachProfile = false }: InviteModalProps) => {
	const queryClient = useQueryClient();
	const [method, setMethod] = useState<InviteMethod>("link");
	const [generatedLink, setGeneratedLink] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm<{
		targetEmail?: string;
		targetUserId?: string;
		formTemplateId?: string;
		requirePlayerProfile: boolean;
		requireCoachProfile: boolean;
	}>({ defaultValues: { requirePlayerProfile: defaultRequirePlayerProfile, requireCoachProfile: defaultRequireCoachProfile } });

	const { data: formTemplates } = useQuery({
		queryKey: ["club-forms", clubId],
		queryFn: () => getClubFormTemplates(clubId),
		enabled: isOpen,
	});

	const createMutation = useMutation({
		mutationFn: (data: CreateInvitationRequest) => createInvitation(clubId, data),
		onSuccess: (invitation) => {
			queryClient.invalidateQueries({ queryKey: ["club-invitations", clubId] });
			const link = `${window.location.origin}/clubs/${clubId}/invitations/${invitation.token}`;
			if (method === "link") setGeneratedLink(link);
			else {
				toast.success("Invitation sent successfully");
				handleClose();
			}
		},
		onError: (error: any) => toast.error(error.response?.data?.message || "Failed to create invitation"),
	});

	const handleClose = () => {
		reset();
		setGeneratedLink(null);
		setCopied(false);
		setMethod("link");
		onClose();
	};

	const onSubmit = (data: any) => {
		const request: CreateInvitationRequest = {
			targetEmail: method === "email" ? data.targetEmail : undefined,
			targetUserId: method === "user" ? data.targetUserId : undefined,
			formTemplateId: data.formTemplateId || undefined,
			requirePlayerProfile: data.requirePlayerProfile,
			requireCoachProfile: data.requireCoachProfile,
		};
		createMutation.mutate(request);
	};

	const copyLink = () => {
		if (generatedLink) {
			navigator.clipboard.writeText(generatedLink);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const formTemplateOptions = [{ value: "", label: "No form" }, ...(formTemplates?.map((t) => ({ value: t.id, label: t.name })) || [])];

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="Invite Member" size="md">
			{generatedLink ? (
				<div className="flex flex-col gap-4">
					<p className="text-sm text-muted">Share this link with the person you want to invite:</p>
					<div className="flex gap-2">
						<Input value={generatedLink} readOnly className="flex-1" />
						<Button variant="outline" onClick={copyLink} leftIcon={copied ? <Check size={16} /> : <Copy size={16} />}>
							{copied ? "Copied" : "Copy"}
						</Button>
					</div>
					<div className="flex justify-end gap-3 mt-4">
						<Button variant="ghost" onClick={handleClose}>
							Done
						</Button>
						<Button
							variant="outline"
							onClick={() => {
								setGeneratedLink(null);
								reset();
							}}>
							Create Another
						</Button>
					</div>
				</div>
			) : (
				<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
					<div className="flex gap-2">
						<Button
							type="button"
							variant={method === "link" ? "solid" : "ghost"}
							size="sm"
							onClick={() => setMethod("link")}
							leftIcon={<Link size={14} />}>
							Generate Link
						</Button>
						<Button
							type="button"
							variant={method === "email" ? "solid" : "ghost"}
							size="sm"
							onClick={() => setMethod("email")}
							leftIcon={<Mail size={14} />}>
							Send Email
						</Button>
						<Button
							type="button"
							variant={method === "user" ? "solid" : "ghost"}
							size="sm"
							onClick={() => setMethod("user")}
							leftIcon={<Search size={14} />}>
							Find User
						</Button>
					</div>
					{method === "email" && (
						<Input
							{...register("targetEmail", {
								required: "Email is required",
								pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
							})}
							label="Email Address"
							type="email"
							placeholder="Enter email"
							error={errors.targetEmail?.message}
							leftIcon={<Mail size={16} />}
						/>
					)}
					{method === "user" && (
						<Input
							{...register("targetUserId", { required: "User ID is required" })}
							label="User ID"
							placeholder="Enter user ID"
							error={errors.targetUserId?.message}
							leftIcon={<Search size={16} />}
						/>
					)}
					<Dropdown
						value={watch("formTemplateId") || ""}
						onChange={(val) => setValue("formTemplateId", val as string)}
						options={formTemplateOptions}
						label="Registration Form"
						placeholder="Select a form (optional)"
					/>
					<div className="flex flex-col gap-2">
						<label className="text-sm font-medium text-white">Requirements</label>
						<label className="flex items-center gap-2 cursor-pointer">
							<input type="checkbox" {...register("requirePlayerProfile")} className="checkbox checkbox-primary checkbox-sm" />
							<span className="text-sm text-white">Require player profile</span>
						</label>
						<label className="flex items-center gap-2 cursor-pointer">
							<input type="checkbox" {...register("requireCoachProfile")} className="checkbox checkbox-primary checkbox-sm" />
							<span className="text-sm text-white">Require coach profile</span>
						</label>
					</div>
					<div className="flex justify-end gap-3 mt-4">
						<Button type="button" variant="ghost" onClick={handleClose}>
							Cancel
						</Button>
						<Button type="submit" variant="solid" color="primary" isLoading={createMutation.isPending}>
							{method === "link" ? "Generate Link" : "Send Invitation"}
						</Button>
					</div>
				</form>
			)}
		</Modal>
	);
};

export default InviteModal;
