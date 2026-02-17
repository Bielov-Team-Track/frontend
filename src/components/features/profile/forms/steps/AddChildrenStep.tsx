"use client";

import { useState, useEffect } from "react";
import { Button, Input, Select, Card } from "@/components/ui";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { User, Calendar, Globe, UserPlus, Mail, Plus, X } from "lucide-react";
import { addChild, getMembers, inviteGuardian } from "@/lib/api/family";
import { HouseholdMember, AddChildDto, InviteGuardianDto } from "@/lib/models/Family";
import { COUNTRIES } from "@/lib/utils/ageTier";

const addChildSchema = yup.object().shape({
	name: yup.string().required("First name is required").min(2, "Must be at least 2 characters"),
	surname: yup.string().required("Last name is required").min(2, "Must be at least 2 characters"),
	dateOfBirth: yup
		.string()
		.required("Date of birth is required")
		.test("not-future", "Date of birth cannot be in the future", (value) => {
			if (!value) return true;
			return new Date(value) <= new Date();
		})
		.test("under-13", "Child must be under 13 years old", (value) => {
			if (!value) return true;
			const today = new Date();
			const birthDate = new Date(value);
			let age = today.getFullYear() - birthDate.getFullYear();
			const monthDiff = today.getMonth() - birthDate.getMonth();
			if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
				age--;
			}
			return age < 13;
		}),
	countryCode: yup.string().required("Country is required"),
	relationship: yup.string().required("Relationship is required"),
});

const linkTeenSchema = yup.object().shape({
	teenEmail: yup.string().email("Invalid email").required("Email is required"),
});

type AddChildFormData = {
	name: string;
	surname: string;
	dateOfBirth: string;
	countryCode: string;
	relationship: string;
};

type LinkTeenFormData = {
	teenEmail: string;
};

type AddChildrenStepProps = {
	onNext: () => void;
	formId: string;
};

const RELATIONSHIP_OPTIONS = [
	{ value: "parent", label: "Parent" },
	{ value: "legal_guardian", label: "Legal Guardian" },
	{ value: "other", label: "Other" },
];

export function AddChildrenStep({ onNext, formId }: AddChildrenStepProps) {
	const [children, setChildren] = useState<HouseholdMember[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showAddMenu, setShowAddMenu] = useState(false);
	const [addMode, setAddMode] = useState<"child" | "teen" | null>(null);

	const {
		control: childControl,
		handleSubmit: handleChildSubmit,
		formState: { errors: childErrors },
		reset: resetChildForm,
	} = useForm<AddChildFormData>({
		resolver: yupResolver(addChildSchema),
	});

	const {
		control: teenControl,
		handleSubmit: handleTeenSubmit,
		formState: { errors: teenErrors },
		reset: resetTeenForm,
	} = useForm<LinkTeenFormData>({
		resolver: yupResolver(linkTeenSchema),
	});

	// Load existing children
	useEffect(() => {
		loadChildren();
	}, []);

	const loadChildren = async () => {
		setIsLoading(true);
		try {
			const members = await getMembers();
			setChildren(members.filter((m) => m.role === "Minor"));
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to load children");
		} finally {
			setIsLoading(false);
		}
	};

	const handleAddChild = async (data: AddChildFormData) => {
		setIsLoading(true);
		setError(null);

		try {
			const dto: AddChildDto = {
				name: data.name,
				surname: data.surname,
				dateOfBirth: data.dateOfBirth,
				countryCode: data.countryCode,
				relationship: data.relationship,
			};

			await addChild(dto);
			await loadChildren();
			resetChildForm();
			setAddMode(null);
			setShowAddMenu(false);
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to add child");
		} finally {
			setIsLoading(false);
		}
	};

	const handleLinkTeen = async (data: LinkTeenFormData) => {
		setIsLoading(true);
		setError(null);

		try {
			const dto: InviteGuardianDto = {
				email: data.teenEmail,
			};

			// This sends a link request to the teen
			await inviteGuardian(dto);
			resetTeenForm();
			setAddMode(null);
			setShowAddMenu(false);
			// Show success message
			alert("Link request sent successfully! The teen will need to accept the invitation.");
		} catch (err: any) {
			setError(err.response?.data?.message || "Failed to send link request");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setAddMode(null);
		setShowAddMenu(false);
		resetChildForm();
		resetTeenForm();
		setError(null);
	};

	const countryOptions = COUNTRIES.map((c) => ({
		value: c.code,
		label: c.name,
	}));

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-semibold">Add Children</h2>
				<p className="text-sm text-muted">Add or link children you would like to manage on this platform.</p>
			</div>

			{error && (
				<div className="text-error bg-error/10 p-3 rounded-lg border border-error/20">
					<span className="text-sm font-medium">{error}</span>
				</div>
			)}

			{/* Existing Children */}
			{children.length > 0 && (
				<div className="space-y-2">
					<h3 className="text-sm font-semibold text-muted">Your Children</h3>
					{children.map((child) => (
						<Card key={child.id} className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="font-medium">{child.name}</p>
									<p className="text-sm text-muted">{child.relationship || "Child"}</p>
								</div>
								<span className="text-xs text-muted">{child.userId ? "Linked" : "Profile only"}</span>
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Add Child Menu */}
			{!showAddMenu && !addMode && (
				<Button onClick={() => setShowAddMenu(true)} variant="outline" className="w-full gap-2" leftIcon={<Plus size={16} />}>
					Add a Child
				</Button>
			)}

			{/* Choice Menu */}
			{showAddMenu && !addMode && (
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<Card
						className="p-4 cursor-pointer hover:bg-muted/50 transition-all"
						onClick={() => {
							setAddMode("child");
							setShowAddMenu(false);
						}}>
						<div className="flex flex-col items-center text-center gap-2">
							<UserPlus size={24} />
							<p className="font-medium">Create Profile (Under 13)</p>
							<p className="text-xs text-muted">Add a child without account credentials</p>
						</div>
					</Card>

					<Card
						className="p-4 cursor-pointer hover:bg-muted/50 transition-all"
						onClick={() => {
							setAddMode("teen");
							setShowAddMenu(false);
						}}>
						<div className="flex flex-col items-center text-center gap-2">
							<Mail size={24} />
							<p className="font-medium">Link Existing Account (13+)</p>
							<p className="text-xs text-muted">Send a link request to a teen's email</p>
						</div>
					</Card>
				</div>
			)}

			{/* Add Child Form (Under 13) */}
			{addMode === "child" && (
				<form onSubmit={handleChildSubmit(handleAddChild)} className="space-y-4 border border-border rounded-lg p-4">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold">Add Child Profile</h3>
						<Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
							<X size={16} />
						</Button>
					</div>

					<Controller
						name="name"
						control={childControl}
						render={({ field }) => (
							<Input
								{...field}
								type="text"
								label="First Name"
								placeholder="Child's first name"
								leftIcon={<User size={16} />}
								error={childErrors.name?.message}
								required
							/>
						)}
					/>

					<Controller
						name="surname"
						control={childControl}
						render={({ field }) => (
							<Input
								{...field}
								type="text"
								label="Last Name"
								placeholder="Child's last name"
								leftIcon={<User size={16} />}
								error={childErrors.surname?.message}
								required
							/>
						)}
					/>

					<Controller
						name="dateOfBirth"
						control={childControl}
						render={({ field }) => (
							<Input
								{...field}
								type="date"
								label="Date of Birth"
								leftIcon={<Calendar size={16} />}
								error={childErrors.dateOfBirth?.message}
								required
								helperText="Must be under 13 years old"
							/>
						)}
					/>

					<Controller
						name="countryCode"
						control={childControl}
						render={({ field }) => (
							<Select
								{...field}
								label="Country"
								placeholder="Select country"
								options={countryOptions}
								leftIcon={<Globe size={16} />}
								error={childErrors.countryCode?.message}
								required
								fullWidth
							/>
						)}
					/>

					<Controller
						name="relationship"
						control={childControl}
						render={({ field }) => (
							<Select
								{...field}
								label="Relationship"
								placeholder="Select relationship"
								options={RELATIONSHIP_OPTIONS}
								error={childErrors.relationship?.message}
								required
								fullWidth
							/>
						)}
					/>

					<div className="flex gap-2">
						<Button type="button" variant="ghost" onClick={handleCancel} className="flex-1">
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading} loading={isLoading} className="flex-1">
							Add Child
						</Button>
					</div>
				</form>
			)}

			{/* Link Teen Form (13+) */}
			{addMode === "teen" && (
				<form onSubmit={handleTeenSubmit(handleLinkTeen)} className="space-y-4 border border-border rounded-lg p-4">
					<div className="flex items-center justify-between">
						<h3 className="font-semibold">Link Existing Account</h3>
						<Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
							<X size={16} />
						</Button>
					</div>

					<p className="text-sm text-muted">
						Enter the email address of the teen's account. They will receive a link request that they must accept.
					</p>

					<Controller
						name="teenEmail"
						control={teenControl}
						render={({ field }) => (
							<Input
								{...field}
								type="email"
								label="Teen's Email"
								placeholder="teen@example.com"
								leftIcon={<Mail size={16} />}
								error={teenErrors.teenEmail?.message}
								required
							/>
						)}
					/>

					<div className="flex gap-2">
						<Button type="button" variant="ghost" onClick={handleCancel} className="flex-1">
							Cancel
						</Button>
						<Button type="submit" disabled={isLoading} loading={isLoading} className="flex-1">
							Send Link Request
						</Button>
					</div>
				</form>
			)}

			{/* Continue Button */}
			<Button onClick={onNext} variant="outline" className="w-full">
				{children.length > 0 ? "Continue" : "Skip for Now"}
			</Button>
		</div>
	);
}
