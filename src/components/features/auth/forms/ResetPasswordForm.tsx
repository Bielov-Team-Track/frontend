"use client";

import { Button, Input } from "@/components/ui";
import Loader from "@/components/ui/loader";
import { resetPassword } from "@/lib/api/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";
import { Lock } from "lucide-react";

const schema = yup.object().shape({
	newPassword: yup.string().required("New password is required"),
	confirmPassword: yup
		.string()
		.required("Confirm password is required")
		.oneOf([yup.ref("newPassword")], "Passwords must match"),
});

type ResetPasswordFormProps = {
	onPasswordReset: () => void;
	token: string;
};

function ResetPasswordForm({ onPasswordReset, token }: ResetPasswordFormProps) {
	const [error, setError] = React.useState<string | null>(null);
	const [isLoading, setIsLoading] = React.useState(false);
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			newPassword: "",
			confirmPassword: "",
		},
	});

	const submitResetPassword = (data: any) => {
		setIsLoading(true);
		resetPassword(token, data.newPassword)
			.then(() => {
				setIsLoading(false);
				onPasswordReset();
			})
			.catch(({ response }) => {
				setIsLoading(false);
				const errorResponse = response.data as ErrorResponse;
				setError(errorResponse.errors.map((e) => e.errorMessage).join(", "));
			});
	};

	return (
		<form
			onSubmit={handleSubmit(submitResetPassword)}
			className="flex flex-col gap-2"
		>
			{error && <p className="text-error">{error}</p>}
			<div>
				<Controller
					disabled={isLoading}
					name="newPassword"
					control={control}
					render={({ field }) => (
						<Input
							{...field}
							type="password"
							className="input"
							label="Password"
							leftIcon={<Lock size={16} />}
							showPasswordToggle
							required={true}
						/>
					)}
				/>
				{errors.newPassword && (
					<p className="text-error">{errors.newPassword.message}</p>
				)}
			</div>
			<div>
				<Controller
					disabled={isLoading}
					name="confirmPassword"
					control={control}
					render={({ field }) => (
						<Input
							{...field}
							type="password"
							className="input"
							label="Confirm Password"
							leftIcon={<Lock size={16} />}
							showPasswordToggle
							required={true}
						/>
					)}
				/>
				{errors.newPassword && (
					<p className="text-error">{errors.newPassword.message}</p>
				)}
			</div>
			<Button disabled={isLoading}>
				{isLoading ? <Loader /> : "Reset password"}
			</Button>
		</form>
	);
}

export default ResetPasswordForm;
