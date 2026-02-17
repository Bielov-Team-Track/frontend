"use client";

import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui";
import { Label } from "@/components/ui/label";
import { useHousehold, useHouseholdMembers, useCreateHousehold, useAddChild, useInviteGuardian, useRemoveMember } from "@/hooks/useHousehold";
import { useConsentsForMinor, useGrantConsent, useRevokeConsent } from "@/hooks/useConsent";
import { HouseholdRole, ConsentType, HouseholdMember } from "@/lib/models/Family";
import { showSuccessToast } from "@/lib/errors";
import { Users, UserPlus, Shield, Baby, Trash2, Check, X } from "lucide-react";
import { useState } from "react";

export default function FamilySettings() {
	const { data: household, isLoading } = useHousehold();
	const { data: members } = useHouseholdMembers();

	if (isLoading) {
		return (
			<div className="animate-pulse space-y-4">
				<div className="h-32 bg-surface rounded-xl" />
			</div>
		);
	}

	if (!household) {
		return <CreateHouseholdSection />;
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users size={20} />
						{household.name}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<MembersList members={members ?? []} />
				</CardContent>
			</Card>

			<AddChildSection />
			<InviteGuardianSection />

			{/* Consent dashboard for each minor */}
			{members?.filter(m => m.role === "Minor").map(minor => (
				<ConsentSection key={minor.userId} minorId={minor.userId} minorName={minor.name ?? "Minor"} />
			))}
		</div>
	);
}

function CreateHouseholdSection() {
	const [name, setName] = useState("");
	const createHousehold = useCreateHousehold();

	const handleSubmit = () => {
		if (!name.trim()) return;
		createHousehold.mutate({ name }, {
			onSuccess: () => showSuccessToast("Family created!"),
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create Your Family</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-muted">Create a family group to manage your children's volleyball activities.</p>
				<div className="space-y-2">
					<Label>Family Name</Label>
					<Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., The Smith Family" />
				</div>
				<Button onClick={handleSubmit} disabled={createHousehold.isPending || !name.trim()}>
					{createHousehold.isPending ? "Creating..." : "Create Family"}
				</Button>
			</CardContent>
		</Card>
	);
}

function MembersList({ members }: { members: HouseholdMember[] }) {
	const removeMember = useRemoveMember();

	const getRoleBadge = (role: HouseholdRole) => {
		const variants: Record<HouseholdRole, string> = {
			PrimaryGuardian: "bg-amber-500/10 text-amber-500",
			Guardian: "bg-blue-500/10 text-blue-500",
			Minor: "bg-green-500/10 text-green-500",
			Adult: "bg-gray-500/10 text-gray-500",
		};
		return <Badge className={variants[role]}>{role}</Badge>;
	};

	return (
		<div className="space-y-3">
			{members.map(member => (
				<div key={member.userId} className="flex items-center justify-between p-3 rounded-lg bg-surface">
					<div className="flex items-center gap-3">
						<div className="w-8 h-8 rounded-full bg-surface-elevated flex items-center justify-center text-sm">
							{member.role === "Minor" ? <Baby size={16} /> : <Shield size={16} />}
						</div>
						<div>
							<p className="font-medium text-sm">{member.name ?? "Member"}</p>
							<p className="text-xs text-muted">{member.relationship ?? member.role}</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						{getRoleBadge(member.role)}
						{member.role !== "PrimaryGuardian" && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => removeMember.mutate(member.userId)}
								disabled={removeMember.isPending}
							>
								<Trash2 size={14} />
							</Button>
						)}
					</div>
				</div>
			))}
		</div>
	);
}

function AddChildSection() {
	const addChild = useAddChild();
	const [form, setForm] = useState({ name: "", surname: "", dateOfBirth: "", countryCode: "GB", relationship: "Child" });

	const handleSubmit = () => {
		if (!form.name || !form.surname || !form.dateOfBirth) return;
		addChild.mutate(form, {
			onSuccess: () => {
				showSuccessToast("Child added!");
				setForm({ name: "", surname: "", dateOfBirth: "", countryCode: "GB", relationship: "Child" });
			},
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Baby size={18} /> Add Child
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>First Name</Label>
						<Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
					</div>
					<div className="space-y-2">
						<Label>Last Name</Label>
						<Input value={form.surname} onChange={e => setForm(f => ({ ...f, surname: e.target.value }))} />
					</div>
				</div>
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label>Date of Birth</Label>
						<Input type="date" value={form.dateOfBirth} onChange={e => setForm(f => ({ ...f, dateOfBirth: e.target.value }))} />
					</div>
					<div className="space-y-2">
						<Label>Country</Label>
						<Input value={form.countryCode} onChange={e => setForm(f => ({ ...f, countryCode: e.target.value }))} placeholder="GB" />
					</div>
				</div>
				<Button onClick={handleSubmit} disabled={addChild.isPending}>
					{addChild.isPending ? "Adding..." : "Add Child"}
				</Button>
			</CardContent>
		</Card>
	);
}

function InviteGuardianSection() {
	const inviteGuardian = useInviteGuardian();
	const [email, setEmail] = useState("");

	const handleSubmit = () => {
		if (!email.trim()) return;
		inviteGuardian.mutate({ email }, {
			onSuccess: () => {
				showSuccessToast("Guardian invited!");
				setEmail("");
			},
		});
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<UserPlus size={18} /> Invite Guardian
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<p className="text-muted text-sm">Invite another guardian to help manage your family's activities.</p>
				<div className="flex gap-2">
					<Input value={email} onChange={e => setEmail(e.target.value)} placeholder="guardian@example.com" type="email" className="flex-1" />
					<Button onClick={handleSubmit} disabled={inviteGuardian.isPending}>
						{inviteGuardian.isPending ? "Inviting..." : "Invite"}
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}

function ConsentSection({ minorId, minorName }: { minorId: string; minorName: string }) {
	const { data: consents } = useConsentsForMinor(minorId);
	const grantConsent = useGrantConsent();
	const revokeConsent = useRevokeConsent();

	const consentTypes: ConsentType[] = [
		"CoreProfileData",
		"EventParticipation",
		"Messaging",
		"PhotoStorage",
		"PhotoPublicSharing",
		"VideoStorage",
		"VideoPublicSharing",
		"PaymentProcessing",
		"ThirdPartySharing",
		"Geolocation",
		"AITraining",
	];

	const getConsentStatus = (type: ConsentType) => {
		return consents?.find(c => c.consentType === type && c.status === "Granted");
	};

	const handleToggle = (type: ConsentType) => {
		const existing = getConsentStatus(type);
		if (existing) {
			revokeConsent.mutate({ minorId, dto: { consentType: type } });
		} else {
			grantConsent.mutate({
				minorId,
				dto: { consentType: type, consentScope: "full", verificationMethod: "EmailPlus" },
			});
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Consent for {minorName}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-2">
					{consentTypes.map(type => {
						const active = !!getConsentStatus(type);
						return (
							<div key={type} className="flex items-center justify-between p-3 rounded-lg bg-surface">
								<span className="text-sm">{type.replace(/([A-Z])/g, " $1").trim()}</span>
								<Button
									variant={active ? "default" : "outline"}
									size="sm"
									onClick={() => handleToggle(type)}
								>
									{active ? (
										<>
											<Check size={14} className="mr-1" /> Granted
										</>
									) : (
										<>
											<X size={14} className="mr-1" /> Not Granted
										</>
									)}
								</Button>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
