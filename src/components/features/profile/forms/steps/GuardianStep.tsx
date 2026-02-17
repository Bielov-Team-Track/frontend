"use client";

import { useState, useEffect } from "react";
import { Button, Input, Select } from "@/components/ui";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { Mail, UserCheck, RefreshCw, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { createGuardianRequest, updateGuardianRequest, getGuardianStatus, GuardianStatusResponse } from "@/lib/api/guardian";

const schema = yup.object().shape({
	guardianEmail: yup.string().email("Invalid email").required("Guardian email is required"),
	relationship: yup.string().required("Relationship is required"),
});

interface GuardianFormData {
	guardianEmail: string;
	relationship: string;
}

type GuardianStepProps = {
	onNext: () => void;
	formId: string;
	mandatory?: boolean; // Teen13ToConsent = true, TeenConsentTo17 = false
};

const RELATIONSHIP_OPTIONS = [
	{ value: "parent", label: "Parent" },
	{ value: "legal_guardian", label: "Legal Guardian" },
	{ value: "other", label: "Other" },
];

export function GuardianStep({ onNext, formId, mandatory = true }: GuardianStepProps) {
	const [showChoice, setShowChoice] = useState(!mandatory); // Optional mode shows choice first
	const [showForm, setShowForm] = useState(mandatory); // Mandatory mode shows form directly
	const [showHoldingScreen, setShowHoldingScreen] = useState(false);
	const [guardianStatus, setGuardianStatus] = useState<GuardianStatusResponse | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		control,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<GuardianFormData>({
		resolver: yupResolver(schema),
	});

	// Load guardian status on mount if already past form submission
	useEffect(() => {
		if (showHoldingScreen) {
			refreshStatus();
		}
	}, [showHoldingScreen]);

	const refreshStatus = async () => {
		setIsRefreshing(true);
		setError(null);
		try {
			const status = await getGuardianStatus();
			setGuardianStatus(status);

			// If consent granted, allow proceeding
			if (status.hasRequiredConsent) {
				onNext();
			}
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to refresh status");
		} finally {
			setIsRefreshing(false);
		}
	};

	const onSubmit = async (data: GuardianFormData) => {
		setIsSubmitting(true);
		setError(null);

		try {
			// Check if invitation already exists
			const status = await getGuardianStatus();

			if (status.guardianEmail) {
				// Update existing invitation
				await updateGuardianRequest({
					guardianEmail: data.guardianEmail,
					relationship: data.relationship,
				});
			} else {
				// Create new invitation
				await createGuardianRequest({
					guardianEmail: data.guardianEmail,
					relationship: data.relationship,
				});
			}

			// Transition to holding screen
			setShowHoldingScreen(true);
			setShowForm(false);
			await refreshStatus();
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to send guardian invitation");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleChangeEmail = () => {
		setShowHoldingScreen(false);
		setShowForm(true);
		reset();
	};

	const handleChoiceAddGuardian = () => {
		setShowChoice(false);
		setShowForm(true);
	};

	const handleChoiceContinueWithout = () => {
		onNext();
	};

	// Optional mode: show choice screen
	if (showChoice && !mandatory) {
		return (
			<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div className="text-center">
					<h2 className="text-2xl font-bold">Guardian Consent</h2>
					<p className="text-muted mt-2">Would you like to add a parent or guardian to your account?</p>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<Button variant="outline" onClick={handleChoiceAddGuardian} className="h-auto py-6 flex-col gap-2">
						<UserCheck size={24} />
						<span className="font-semibold">Add a Guardian</span>
						<span className="text-xs text-muted">Invite a parent or guardian</span>
					</Button>

					<Button variant="outline" onClick={handleChoiceContinueWithout} className="h-auto py-6 flex-col gap-2">
						<CheckCircle2 size={24} />
						<span className="font-semibold">Continue Without</span>
						<span className="text-xs text-muted">You can add one later</span>
					</Button>
				</div>
			</div>
		);
	}

	// Holding screen: waiting for guardian approval
	if (showHoldingScreen && guardianStatus) {
		const isExpired = guardianStatus.invitationExpiresAt && new Date(guardianStatus.invitationExpiresAt) < new Date();
		const isPending = guardianStatus.invitationStatus === "pending";

		return (
			<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div className="text-center">
					<h2 className="text-2xl font-bold">Waiting for Guardian Approval</h2>
					<p className="text-muted mt-2">We've sent an invitation to your guardian</p>
				</div>

				{/* Status Indicator */}
				<div className={`border rounded-lg p-6 ${isExpired ? "border-red-500/30 bg-red-500/5" : "border-blue-500/30 bg-blue-500/5"}`}>
					<div className="flex items-center gap-3 mb-3">
						{isPending && !isExpired ? (
							<Clock className="text-blue-500" size={24} />
						) : (
							<AlertCircle className="text-red-500" size={24} />
						)}
						<div>
							<p className="font-semibold">{guardianStatus.guardianEmail}</p>
							<p className="text-sm text-muted">
								{isExpired ? "Invitation expired" : isPending ? "Invitation pending" : "Invitation sent"}
							</p>
						</div>
					</div>

					{guardianStatus.invitationExpiresAt && !isExpired && (
						<p className="text-xs text-muted">
							Expires: {new Date(guardianStatus.invitationExpiresAt).toLocaleDateString()}
						</p>
					)}
				</div>

				{error && (
					<div className="text-error bg-error/10 p-3 rounded-lg border border-error/20">
						<span className="text-sm font-medium">{error}</span>
					</div>
				)}

				{/* Actions */}
				<div className="space-y-2">
					<Button
						onClick={refreshStatus}
						disabled={isRefreshing}
						loading={isRefreshing}
						variant="outline"
						className="w-full gap-2"
						leftIcon={<RefreshCw size={16} />}>
						Refresh Status
					</Button>

					<Button onClick={handleChangeEmail} variant="ghost" className="w-full">
						Change Guardian Email
					</Button>

					{!mandatory && (
						<Button onClick={onNext} variant="ghost" className="w-full text-muted">
							Continue Without Approval (for now)
						</Button>
					)}
				</div>

				<p className="text-xs text-muted text-center">
					Ask your guardian to check their email and click the invitation link.
					{mandatory && " You'll need their approval to continue."}
				</p>
			</div>
		);
	}

	// Form: enter guardian email and relationship
	return (
		<form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-semibold">Guardian Information</h2>
				<p className="text-sm text-muted">
					{mandatory
						? "We need a parent or guardian to approve your account before you can continue."
						: "Add a parent or guardian who can manage your account."}
				</p>
			</div>

			{error && (
				<div className="text-error bg-error/10 p-3 rounded-lg border border-error/20">
					<span className="text-sm font-medium">{error}</span>
				</div>
			)}

			<Controller
				name="guardianEmail"
				control={control}
				render={({ field }) => (
					<Input
						{...field}
						type="email"
						label="Guardian Email"
						placeholder="guardian@example.com"
						leftIcon={<Mail size={16} />}
						error={errors.guardianEmail?.message}
						required
					/>
				)}
			/>

			<Controller
				name="relationship"
				control={control}
				render={({ field }) => (
					<Select
						{...field}
						label="Relationship"
						placeholder="Select relationship"
						options={RELATIONSHIP_OPTIONS}
						leftIcon={<UserCheck size={16} />}
						error={errors.relationship?.message}
						required
						fullWidth
					/>
				)}
			/>

			<p className="text-xs text-muted">
				We'll send an email to your guardian with instructions to approve your account.
			</p>
		</form>
	);
}
