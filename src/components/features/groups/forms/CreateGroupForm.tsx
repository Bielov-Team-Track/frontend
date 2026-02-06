"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
// import { useSession } from 'next-auth/react';
// import { User } from 'next-auth';
import { createGroup } from "@/lib/api/groups"; // Assuming you have a createGroup function
import { Loader } from "@/components/ui";

const schema = yup.object().shape({
	name: yup.string().required("Name is required"),
	approveMembers: yup.boolean().required(),
});

function CreateGroupForm() {
	// const session = useSession();
	// const user = session?.data?.user as User;

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
		defaultValues: {
			name: "",
			approveMembers: false,
		},
	});

	const router = useRouter();
	const {
		mutate: submitGroup,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: async (groupData: any) => {
			return await createGroup(groupData);
		},
	});

	const saveGroup = async (data: any) => {
		const group = {
			name: data.name,
			approveMembers: data.approveMembers,
		};

		submitGroup(group, {
			onSuccess: () => {
				router.push("/groups");
			},
		});
	};

	return (
		<form className="form relative" onSubmit={handleSubmit(saveGroup)}>
			{isPending && <Loader className="absolute inset-0 bg-overlay" />}
			<div className="flex gap-2">
				<h1 className="text-2xl font-bold">Create Group</h1>
			</div>
			{isError && (
				<p className="text-error">
					Something went wrong, we are working on it.
				</p>
			)}
			<div className="flex flex-col gap-2">
				<label className="font-bold">Name</label>
				<Controller
					name="name"
					control={control}
					render={({ field }) => (
						<input
							{...field}
							className="input input-bordered w-full"
							type="text"
						/>
					)}
				/>
				{errors.name && <p className="text-error">{errors.name.message}</p>}
			</div>
			<div className="flex gap-2 items-center">
				<Controller
					name="approveMembers"
					control={control}
					render={({ field: { value, onChange, ...rest } }) => (
						<input
							className="checkbox"
							type="checkbox"
							checked={!!value}
							onChange={(e) => onChange(e.target.checked)}
							{...rest}
						/>
					)}
				/>
				<label className="font-bold">Approve Members</label>
				{errors.approveMembers && (
					<p className="text-error">
						{(errors as any).approveMembers?.message}
					</p>
				)}
			</div>
			<button type="submit" className="btn btn-primary mt-4">
				Submit
			</button>
		</form>
	);
}

export default CreateGroupForm;
