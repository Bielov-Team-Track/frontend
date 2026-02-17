"use client";

import { useState } from "react";
import { Button, Card } from "@/components/ui";

export type UserRole = "player" | "coach" | "parent" | "clubManager" | "other";

interface RoleSelectionStepProps {
	onComplete: (roles: UserRole[]) => void;
	isAdult: boolean; // Only adults see Parent/Guardian option
	defaultRoles?: UserRole[];
}

const ROLES: { value: UserRole; label: string; description: string; adultOnly?: boolean }[] = [
	{ value: "player", label: "Player", description: "I play volleyball and want to join events" },
	{ value: "coach", label: "Coach", description: "I coach volleyball teams or players" },
	{ value: "parent", label: "Parent / Guardian", description: "I manage accounts for my children", adultOnly: true },
	{ value: "clubManager", label: "Club Manager", description: "I manage a volleyball club or organization" },
	{ value: "other", label: "Other", description: "I'm here for a different reason" },
];

export function RoleSelectionStep({ onComplete, isAdult, defaultRoles = [] }: RoleSelectionStepProps) {
	const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(defaultRoles);

	const availableRoles = ROLES.filter((r) => !r.adultOnly || isAdult);

	const toggleRole = (role: UserRole) => {
		setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
	};

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="text-center">
				<h2 className="text-2xl font-bold">What brings you to VolleySpike?</h2>
				<p className="text-muted mt-2">Select all that apply. You can change this later.</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{availableRoles.map((role) => (
					<Card
						key={role.value}
						className={`p-4 cursor-pointer transition-all ${
							selectedRoles.includes(role.value) ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
						}`}
						onClick={() => toggleRole(role.value)}>
						<div className="flex items-start gap-3">
							<div>
								<p className="font-medium">{role.label}</p>
								<p className="text-sm text-muted">{role.description}</p>
							</div>
						</div>
					</Card>
				))}
			</div>

			<Button onClick={() => onComplete(selectedRoles)} disabled={selectedRoles.length === 0} className="w-full">
				Continue
			</Button>
		</div>
	);
}
