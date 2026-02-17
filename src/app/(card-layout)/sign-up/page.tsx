"use client";

import { Button, Input, Loader, Select } from "@/components/ui";
import { register, RegisterPayload } from "@/lib/api/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import { AxiosError } from "axios";
import { Calendar, Lock, Mail, Globe, User, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import { COUNTRIES, getAgeTier, AgeTier } from "@/lib/utils/ageTier";

interface SignUpFormInputs {
	dateOfBirth: string;
	countryCode: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
}

const schema = yup.object().shape({
	dateOfBirth: yup
		.string()
		.required("Date of birth is required")
		.test("not-future", "Date of birth cannot be in the future", (value) => {
			if (!value) return true;
			return new Date(value) <= new Date();
		}),
	countryCode: yup.string().required("Country is required"),
	firstName: yup.string().when(["dateOfBirth", "countryCode"], {
		is: (dob: string, country: string) => {
			if (!dob || !country) return false;
			const tier = getAgeTier(new Date(dob), country);
			return tier !== "Under13";
		},
		then: (schema) => schema.required("First name is required").min(2, "Must be at least 2 characters"),
		otherwise: (schema) => schema.optional(),
	}),
	lastName: yup.string().when(["dateOfBirth", "countryCode"], {
		is: (dob: string, country: string) => {
			if (!dob || !country) return false;
			const tier = getAgeTier(new Date(dob), country);
			return tier !== "Under13";
		},
		then: (schema) => schema.required("Last name is required").min(2, "Must be at least 2 characters"),
		otherwise: (schema) => schema.optional(),
	}),
	email: yup.string().when(["dateOfBirth", "countryCode"], {
		is: (dob: string, country: string) => {
			if (!dob || !country) return false;
			const tier = getAgeTier(new Date(dob), country);
			return tier !== "Under13";
		},
		then: (schema) => schema.email("Invalid email").required("Email is required"),
		otherwise: (schema) => schema.optional(),
	}),
	password: yup.string().when(["dateOfBirth", "countryCode"], {
		is: (dob: string, country: string) => {
			if (!dob || !country) return false;
			const tier = getAgeTier(new Date(dob), country);
			return tier !== "Under13";
		},
		then: (schema) => schema.min(8, "Password must be at least 8 characters").required("Password is required"),
		otherwise: (schema) => schema.optional(),
	}),
	confirmPassword: yup.string().when(["dateOfBirth", "countryCode"], {
		is: (dob: string, country: string) => {
			if (!dob || !country) return false;
			const tier = getAgeTier(new Date(dob), country);
			return tier !== "Under13";
		},
		then: (schema) => schema.oneOf([yup.ref("password")], "Passwords must match").required("Please confirm your password"),
		otherwise: (schema) => schema.optional(),
	}),
});

function SignUpPage() {
	const router = useRouter();
	const [error, setError] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const {
		handleSubmit,
		control,
		watch,
		formState: { errors },
	} = useForm<SignUpFormInputs>({
		resolver: yupResolver(schema) as any,
	});

	const dateOfBirth = watch("dateOfBirth");
	const countryCode = watch("countryCode");

	// Calculate age tier when DOB and country are both provided
	const ageTier: AgeTier | null = useMemo(() => {
		if (!dateOfBirth || !countryCode) return null;
		try {
			return getAgeTier(new Date(dateOfBirth), countryCode);
		} catch {
			return null;
		}
	}, [dateOfBirth, countryCode]);

	const showRemainingFields = ageTier !== null && ageTier !== "Under13";
	const isUnder13 = ageTier === "Under13";
	const isTeen13ToConsent = ageTier === "Teen13ToConsent";

	const onSubmit: SubmitHandler<SignUpFormInputs> = async (data) => {
		if (isUnder13) return; // Prevent submission for under 13

		setIsLoading(true);
		setError("");

		try {
			const payload: RegisterPayload = {
				email: data.email,
				password: data.password,
				dateOfBirth: data.dateOfBirth,
				countryCode: data.countryCode,
				firstName: data.firstName,
				lastName: data.lastName,
			};

			await register(payload);
			router.push("/email-verification");
		} catch (error) {
			console.error(error);
			const axiosError = error as AxiosError;
			const errorResponse = axiosError?.response?.data as any;

			if (errorResponse?.message) {
				setError(errorResponse.message);
			} else if (errorResponse?.errors) {
				setError(errorResponse.errors.map((e: any) => e.description || e.errorMessage).join(", "));
			} else {
				setError("Registration failed. Please try again.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleShareWithParent = () => {
		// TODO: Implement share functionality (email/SMS)
		alert("Share with parent functionality coming soon!");
	};

	const countryOptions = COUNTRIES.map((c) => ({
		value: c.code,
		label: c.name,
	}));

	return (
		<>
			{isLoading && <Loader className="bg-overlay absolute inset-0 rounded-md" />}
			<form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
				<h1 className="text-5xl font-bold text-accent self-center mb-4">Spike</h1>
				<div>
					Already have an account?{" "}
					<Link href={"/login"} className="link">
						Login
					</Link>
				</div>
				{error && <div className="text-red-500">{error}</div>}

				{/* Date of Birth - First Field */}
				<Controller
					name="dateOfBirth"
					control={control}
					render={({ field }) => (
						<Input
							{...field}
							type="date"
							label="Date of Birth"
							placeholder="Select your date of birth"
							leftIcon={<Calendar size={16} />}
							error={errors.dateOfBirth?.message}
							required
							helperText="We need your age to comply with child protection laws"
							onChange={(e) => {
								field.onChange(e);
								setError("");
							}}
						/>
					)}
				/>

				{/* Country - Second Field */}
				<Controller
					name="countryCode"
					control={control}
					render={({ field }) => (
						<Select
							{...field}
							label="Country"
							placeholder="Select your country"
							options={countryOptions}
							leftIcon={<Globe size={16} />}
							error={errors.countryCode?.message}
							required
							fullWidth
							onChange={(value) => {
								field.onChange(value);
								setError("");
							}}
						/>
					)}
				/>

				{/* Under 13 Message */}
				{isUnder13 && (
					<div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 space-y-3">
						<div className="flex items-start gap-3">
							<AlertCircle className="text-yellow-500 mt-0.5" size={20} />
							<div className="flex-1">
								<h3 className="font-semibold text-yellow-500">Parent or Guardian Required</h3>
								<p className="text-sm text-muted mt-1">
									You need a parent or guardian to create an account for you. Share this page with them to get started.
								</p>
							</div>
						</div>
						<Button type="button" variant="outline" onClick={handleShareWithParent} className="w-full">
							Share with Parent
						</Button>
					</div>
				)}

				{/* Guardian Info Banner for Teen13ToConsent */}
				{isTeen13ToConsent && showRemainingFields && (
					<div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
						<div className="flex items-start gap-3">
							<Info className="text-blue-500 mt-0.5" size={20} />
							<div className="flex-1">
								<h3 className="font-semibold text-blue-500">Guardian Consent Required</h3>
								<p className="text-sm text-muted mt-1">
									After registration, you'll need a parent or guardian to approve your account before you can use all features.
								</p>
							</div>
						</div>
					</div>
				)}

				{/* Remaining Fields - Only shown when age tier is calculated and not Under13 */}
				{showRemainingFields && (
					<>
						<Controller
							name="firstName"
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									type="text"
									label="First Name"
									placeholder="Enter your first name"
									leftIcon={<User size={16} />}
									error={errors.firstName?.message}
									required
									onChange={(e) => {
										field.onChange(e);
										setError("");
									}}
								/>
							)}
						/>

						<Controller
							name="lastName"
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									type="text"
									label="Last Name"
									placeholder="Enter your last name"
									leftIcon={<User size={16} />}
									error={errors.lastName?.message}
									required
									onChange={(e) => {
										field.onChange(e);
										setError("");
									}}
								/>
							)}
						/>

						<Controller
							name="email"
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									type="email"
									label="Email"
									placeholder="Enter your email"
									leftIcon={<Mail size={16} />}
									error={errors.email?.message}
									required
									onChange={(e) => {
										field.onChange(e);
										setError("");
									}}
								/>
							)}
						/>

						<Controller
							name="password"
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									type="password"
									label="Password"
									placeholder="Enter your password"
									leftIcon={<Lock size={16} />}
									showPasswordToggle
									error={errors.password?.message}
									required
									onChange={(e) => {
										field.onChange(e);
										setError("");
									}}
								/>
							)}
						/>

						<Controller
							name="confirmPassword"
							control={control}
							render={({ field }) => (
								<Input
									{...field}
									type="password"
									label="Confirm Password"
									placeholder="Confirm your password"
									leftIcon={<Lock size={16} />}
									showPasswordToggle
									error={errors.confirmPassword?.message}
									required
									onChange={(e) => {
										field.onChange(e);
										setError("");
									}}
								/>
							)}
						/>

						<span className="text-sm text-muted">
							By continuing you agree to our{" "}
							<Link className="link" href={"/terms-of-service"}>
								Terms of service
							</Link>{" "}
							and{" "}
							<Link className="link" href={"/privacy-policy"}>
								Privacy policy
							</Link>
						</span>

						<Button type="submit" disabled={isLoading}>
							Create Account
						</Button>
					</>
				)}
			</form>
		</>
	);
}

export default SignUpPage;
