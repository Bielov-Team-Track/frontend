import React, { useRef, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Input, Loader } from "@/components/ui";
import ImageCropper from "@/components/ui/image-cropper";
import { User, Camera, ArrowRight } from "lucide-react";
import Image from "next/image";
import { updateProfileImage } from "@/lib/api/user";

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

type BasicInfoData = {
	name: string;
	surname: string;
	imageUrl?: string;
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
	const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(
		defaultValues?.imageUrl || null
	);
    const fileInputRef = useRef<HTMLInputElement>(null);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<BasicInfoData>({
		resolver: yupResolver(schema),
		defaultValues: {
			name: defaultValues?.name || "",
			surname: defaultValues?.surname || "",
		},
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
			const imageUrl = await updateProfileImage(croppedImage);
			setUploadedImageUrl(imageUrl);
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

				<div className="bg-[#141414] rounded-2xl overflow-hidden border border-white/10">
					<ImageCropper
						imageFile={imageFile}
						onImageSave={handleImageSave}
						onCancel={skipImageUpload}
						className="border-0"
					/>
				</div>

				{imageError && <p className="text-error text-center">{imageError}</p>}
			</div>
		);
	}

	return (
		<form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-white">Basic Information</h2>
                <p className="text-sm text-muted">Let's start with your name and photo.</p>
            </div>

			<div>
				<Controller
					name="name"
					control={control}
					render={({ field }) => (
						<Input
							{...field}
							type="text"
							label="First Name"
							placeholder="Enter your first name"
							leftIcon={<User />}
							required
							error={errors.name?.message}
						/>
					)}
				/>
			</div>

			<div>
				<Controller
					name="surname"
					control={control}
					render={({ field }) => (
						<Input
							{...field}
							type="text"
							label="Last Name"
							placeholder="Enter your last name"
							leftIcon={<User />}
							required
							error={errors.surname?.message}
						/>
					)}
				/>
			</div>

			<div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-white mb-2">
                    Profile Picture <span className="text-muted ml-1.5 font-normal text-xs">(optional)</span>
                </label>
                
                {uploadedImageUrl ? (
                    <div className="flex flex-col gap-4 items-center p-6 border border-white/10 rounded-xl bg-white/5">
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-xl">
                            <Image
                                src={uploadedImageUrl}
                                alt="Profile"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setUploadedImageUrl(null)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                            Remove Photo
                        </Button>
                    </div>
                ) : (
                    <div
                        className="border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 hover:border-white/20 transition-all gap-3 group"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-white/50 group-hover:text-white group-hover:bg-white/10 transition-all">
                            <Camera size={24} />
                        </div>
                        <div className="text-center">
                            <span className="text-sm font-medium text-white block group-hover:text-accent transition-colors">Upload Profile Picture</span>
                            <span className="text-xs text-muted block mt-1">Click to select image</span>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
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
