import { Button } from "@/components/ui";
import ImageCropper from "@/components/ui/image-cropper";
import { updateProfileImage } from "@/lib/api/user";
import { yupResolver } from "@hookform/resolvers/yup";
import { Camera } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

const schema = yup.object().shape({
	imageUrl: yup.string().url("Invalid image URL").optional(),
});

type BasicInfoData = {
	imageUrl?: string;
	imageThumbHash?: string;
};

type Props = {
	defaultValues?: Partial<BasicInfoData>;
	onNext: (data: BasicInfoData) => void;
	formId: string;
};

const BasicInfoStep = ({ defaultValues, onNext, formId }: Props) => {
	const [imageError, setImageError] = useState<string | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [showImageCropper, setShowImageCropper] = useState(false);
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(defaultValues?.imageUrl || null);
	const [uploadedThumbHash, setUploadedThumbHash] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const {
		handleSubmit,
		formState: { errors },
	} = useForm<BasicInfoData>({
		resolver: yupResolver(schema) as any,
		defaultValues: {},
	});

	const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		const file = files && files[0];
		if (file) {
			setImageFile(file);
			setShowImageCropper(true);
		}
		event.target.value = "";
	};

	const handleImageSave = async (croppedImage: Blob) => {
		if (!croppedImage) {
			setImageError("Failed to process image");
			return;
		}

		try {
			const { imageUrl, imageThumbHash } = await updateProfileImage(croppedImage);
			setUploadedImageUrl(imageUrl);
			setUploadedThumbHash(imageThumbHash);
			setShowImageCropper(false);
			setImageError(null);
		} catch (error: any) {
			console.error("Image upload error:", error);
			setImageError("Failed to upload image. Please try again.");
		}
	};

	const onSubmit = (data: BasicInfoData) => {
		onNext({
			...data,
			imageUrl: uploadedImageUrl || undefined,
			imageThumbHash: uploadedThumbHash || undefined,
		});
	};

	const skipImageUpload = () => {
		setImageError(null);
		setShowImageCropper(false);
		setImageFile(null);
	};

	if (showImageCropper && imageFile) {
		return (
			<div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
				<div className="flex items-center gap-2">
					<Camera size={24} />
					<h2 className="text-2xl font-bold">Crop Your Profile Picture</h2>
				</div>

				<div className="bg-surface rounded-2xl overflow-hidden border border-border">
					<ImageCropper imageFile={imageFile} onImageSave={handleImageSave} onCancel={skipImageUpload} className="border-0" />
				</div>

				{imageError && <p className="text-error text-center">{imageError}</p>}
			</div>
		);
	}

	return (
		<form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-semibold text-foreground">Profile Picture</h2>
				<p className="text-sm text-muted">Add a profile picture to help others recognize you.</p>
			</div>

			<div className="flex flex-col gap-2">
				<label className="block text-sm font-medium text-foreground mb-2">
					Profile Picture <span className="text-muted ml-1.5 font-normal text-xs">(optional)</span>
				</label>

				{uploadedImageUrl ? (
					<div className="flex flex-col gap-4 items-center p-6 border border-border rounded-xl bg-surface">
						<div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-border shadow-xl">
							<Image src={uploadedImageUrl} alt="Profile" fill className="object-cover" />
						</div>
						<Button
							type="button"
							variant="ghost"
							onClick={() => { setUploadedImageUrl(null); setUploadedThumbHash(null); }}
							className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
							Remove Photo
						</Button>
					</div>
				) : (
					<div
						className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-hover hover:border-border transition-all gap-3 group"
						onClick={() => fileInputRef.current?.click()}>
						<div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center text-foreground/50 group-hover:text-foreground group-hover:bg-hover transition-all">
							<Camera size={24} />
						</div>
						<div className="text-center">
							<span className="text-sm font-medium text-foreground block group-hover:text-accent transition-colors">Upload Profile Picture</span>
							<span className="text-xs text-muted block mt-1">Click to select image</span>
						</div>
						<input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
					</div>
				)}
			</div>

			{imageError && (
				<div className="text-error bg-error/10 p-3 rounded-lg border border-error/20">
					<span className="text-sm font-medium">{imageError}</span>
				</div>
			)}
		</form>
	);
};

export default BasicInfoStep;
