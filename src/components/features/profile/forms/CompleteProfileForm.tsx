"use client";

import React, { useState } from "react";
import { useForm, Controller, set } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Input, Loader } from "@/components/ui";
import ImageCropper from "@/components/ui/image-cropper";
import { FaUser, FaCamera } from "react-icons/fa6";
import { updateProfileImage } from "@/lib/requests/user";
import { useRouter } from "next/navigation";
import Image from "next/image";
import client from "@/lib/client";

const schema = yup.object().shape({
	name: yup
		.string()
		.required("Name is required")
		.min(2, "Name must be at least 2 characters"),
	surname: yup
		.string()
		.required("Surname is required")
		.min(2, "Surname must be at least 2 characters"),
	imageUrl: yup.string().url("Invalid image URL").optional(),
});

type FormData = {
	name: string;
	surname: string;
	imageUrl?: string;
};

type CompleteProfileFormProps = {
	onProfileComplete?: () => void;
};

const CompleteProfileForm = ({
	onProfileComplete,
}: CompleteProfileFormProps) => {
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [showImageCropper, setShowImageCropper] = useState(false);
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: yupResolver(schema),
		defaultValues: {
			name: "",
			surname: "",
		},
	});

	const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		const file = files && files[0];
		if (file) {
			setImageFile(file);
			setShowImageCropper(true);
		}
	};

	const handleImageSave = async (croppedImage: Blob) => {
		if (!croppedImage) {
			setError("Failed to process image");
			return;
		}

		try {
			setIsLoading(true);
			const imageUrl = await updateProfileImage(croppedImage);
			setUploadedImageUrl(imageUrl);
			setShowImageCropper(false);
			setError(null);
		} catch (error: any) {
			console.error("Image upload error:", error);
			setError("Failed to upload image. Please try again.");
		} finally {
			setIsLoading(false);
		}
	};

	const updateProfile = async (data: FormData) => {
		try {
			setIsLoading(true);
			setError(null);

			// Update profile with name, surname, and optional imageUrl
			const profileData = {
				firstName: data.name,
				lastName: data.surname,
				...(uploadedImageUrl && { imageUrl: uploadedImageUrl }),
			};

			const response = await client.put("/events/v1/profiles/me", profileData);

			if (response.status === 200) {
				if (onProfileComplete) {
					onProfileComplete();
				}
			}
		} catch (error: any) {
			console.error("Profile update error:", error);
			const message =
				error.response?.data?.message || "Failed to update profile";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	};

	const skipImageUpload = () => {
		setError(null);
		setShowImageCropper(false);
		setImageFile(null);
	};

	if (showImageCropper && imageFile) {
		return (
			<div className="flex flex-col gap-6">
				<div className="flex items-center gap-2">
					<FaCamera size={"24px"} />
					<h2 className="text-2xl font-bold">Crop Your Profile Picture</h2>
				</div>

				<ImageCropper imageFile={imageFile} onImageSave={handleImageSave} />

				<div className="flex gap-4">
					<Button
						variant="outline"
						onClick={skipImageUpload}
						disabled={isLoading}
						className="flex-1"
					>
						Skip for Now
					</Button>
				</div>

				{error && <p className="text-error text-center">{error}</p>}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<form
				onSubmit={handleSubmit(updateProfile)}
				className="flex flex-col gap-4"
			>
				{error && (
					<div className="text-error">
						<span>{error}</span>
					</div>
				)}

				<div>
					<Controller
						disabled={isLoading}
						name="name"
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								type="text"
								label="First Name"
								placeholder="Enter your first name"
								leftIcon={<FaUser />}
								required
							/>
						)}
					/>
					{errors.name && (
						<p className="text-error text-sm mt-1">{errors.name.message}</p>
					)}
				</div>

				<div>
					<Controller
						disabled={isLoading}
						name="surname"
						control={control}
						render={({ field }) => (
							<Input
								{...field}
								type="text"
								label="Last Name"
								placeholder="Enter your last name"
								leftIcon={<FaUser />}
								required
							/>
						)}
					/>
					{errors.surname && (
						<p className="text-error text-sm mt-1">{errors.surname.message}</p>
					)}
				</div>
				{uploadedImageUrl ? (
					<div className="flex flex-col gap-2">
						<div>
							<label className="font-medium">Profile Picture</label>
							<Button variant="link" onClick={() => setUploadedImageUrl(null)}>
								Remove
							</Button>
						</div>
						<div className="flex justify-center">
							<Image
								className="self-center"
								width={240}
								height={240}
								src={uploadedImageUrl}
								alt="profile picture"
							/>
						</div>
					</div>
				) : (
					<div className="flex flex-col gap-2">
						<label htmlFor="profileImage" className="font-medium">
							Profile Picture
						</label>
						<div className="flex items-center gap-4">
							<Input
								id="profileImage"
								type="file"
								accept="image/*"
								onChange={handleImageSelect}
								className="file-input file-input-bordered w-full"
								disabled={isLoading}
							/>
						</div>
						<p className="text-sm text-primary-content/70">
							Upload a profile picture to help other players recognize you
							(optional)
						</p>
					</div>
				)}

				<div className="flex flex-col gap-4 mt-6">
					<Button type="submit" disabled={isLoading} className="w-full">
						{isLoading ? <Loader /> : "Complete Profile"}
					</Button>
				</div>
			</form>
		</div>
	);
};

export default CompleteProfileForm;
