"use client";

import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import ImageCropper from "@/components/ui/image-cropper";
import Input from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import TextArea from "@/components/ui/textarea";
import { CreateClubRequest } from "@/lib/models/Club";
import { createClub, updateClub, uploadClubImage } from "@/lib/api/clubs";
import { yupResolver } from "@hookform/resolvers/yup";
import { Image as ImageIcon, Shield, ArrowLeft, ArrowRight, Check, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";

// --- Toast Component ---
interface ToastState {
	message: string;
	type: "success" | "error";
}

function Toast({ toast, onClose }: { toast: ToastState | null; onClose: () => void }) {
	useEffect(() => {
		if (toast) {
			const timer = setTimeout(onClose, 5000);
			return () => clearTimeout(timer);
		}
	}, [toast, onClose]);

	if (!toast) return null;

	return (
		<div className="toast toast-top toast-center z-50">
			<div className={`alert ${toast.type === "success" ? "alert-success" : "alert-error"}`}>
				<span>{toast.message}</span>
				<button onClick={onClose} className="btn btn-sm btn-ghost">
					✕
				</button>
			</div>
		</div>
	);
}

// --- Types & Schema ---

interface CreateClubFormValues {
	name: string;
	description: string;
	is_public: boolean;
	logo: File | null; // Changed from URL string
	banner: File | null; // New field
	contact_email: string;
	contact_phone: string;
}

const clubSchema = yup.object().shape({
	name: yup.string().required("Club name is required").min(3, "Name must be at least 3 characters"),
	description: yup.string().max(500, "Description cannot exceed 500 characters"),
	is_public: yup.boolean().default(true),
	logo: yup.mixed().nullable(), // We'll validate manually or check if File
	banner: yup.mixed().nullable(),
	contact_email: yup.string().email("Must be a valid email").nullable(),
	contact_phone: yup.string().nullable(),
});

// --- Steps Configuration ---

const STEPS = [
	{
		id: 1,
		title: "Basic Info",
		fields: ["name", "description", "is_public"],
	},
	{ id: 2, title: "Branding", fields: ["logo", "banner"] },
	{ id: 3, title: "Contact", fields: ["contact_email", "contact_phone"] },
	{ id: 4, title: "Review", fields: [] },
];

export default function CreateClubPage() {
	const router = useRouter();
	const [currentStep, setCurrentStep] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// --- Image Upload State ---
	const [cropModalOpen, setCropModalOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [activeField, setActiveField] = useState<"logo" | "banner" | null>(null);

	// Drag & Drop State
	const [isDraggingBanner, setIsDraggingBanner] = useState(false);
	const [isDraggingLogo, setIsDraggingLogo] = useState(false);

	// Previews (Blob URLs)
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [bannerPreview, setBannerPreview] = useState<string | null>(null);

	// Toast State
	const [toast, setToast] = useState<ToastState | null>(null);

	const {
		register,
		handleSubmit,
		trigger,
		watch,
		control,
		setValue,
		formState: { errors },
	} = useForm<CreateClubFormValues>({
		resolver: yupResolver(clubSchema) as any,
		defaultValues: {
			name: "",
			description: "",
			is_public: true,
			logo: null,
			banner: null,
			contact_email: "",
			contact_phone: "",
		},
		mode: "onChange",
	});

	const formData = watch();

	// Navigation Handlers
	const handleNext = async () => {
		const currentStepFields = STEPS[currentStep - 1].fields as any[];
		const isValid = await trigger(currentStepFields);
		if (isValid) {
			setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
		}
	};

	const handleBack = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
	};

	const onSubmit: SubmitHandler<CreateClubFormValues> = async (data) => {
		setIsSubmitting(true);
		try {
			// First create the club without images to get the club ID
			const createClubRequest: CreateClubRequest = {
				name: data.name,
				description: data.description || undefined,
				contactEmail: data.contact_email || undefined,
				contactPhone: data.contact_phone || undefined,
				isPublic: data.is_public,
			};

			const createdClub = await createClub(createClubRequest);

			// Now upload images if provided
			let logoUrl: string | undefined;
			let bannerUrl: string | undefined;

			if (data.logo) {
				try {
					logoUrl = await uploadClubImage(createdClub.id, data.logo, "logo");
				} catch (error) {
					console.error("Failed to upload logo:", error);
				}
			}

			if (data.banner) {
				try {
					bannerUrl = await uploadClubImage(createdClub.id, data.banner, "banner");
				} catch (error) {
					console.error("Failed to upload banner:", error);
				}
			}

			// Update club with image URLs if any were uploaded
			if (logoUrl || bannerUrl) {
				await updateClub(createdClub.id, {
					logoUrl,
					bannerUrl,
				});
			}

			setToast({
				message: "Club created successfully!",
				type: "success",
			});
			router.push(`/clubs/${createdClub.id}`);
		} catch (error: any) {
			console.error("Failed to create club", error);
			const errorMessage = error?.response?.data?.message || error?.message || "Failed to create club. Please try again.";
			setToast({ message: errorMessage, type: "error" });
		} finally {
			setIsSubmitting(false);
		}
	};

	// --- Image Handling ---

	const processFile = (file: File, field: "logo" | "banner") => {
		setSelectedFile(file);
		setActiveField(field);
		setCropModalOpen(true);
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "banner") => {
		if (e.target.files && e.target.files[0]) {
			processFile(e.target.files[0], field);
			// Reset input value so same file can be selected again if needed
			e.target.value = "";
		}
	};

	const onDragOver = (e: React.DragEvent, field: "logo" | "banner") => {
		e.preventDefault();
		e.stopPropagation();
		if (field === "banner") setIsDraggingBanner(true);
		else setIsDraggingLogo(true);
	};

	const onDragLeave = (e: React.DragEvent, field: "logo" | "banner") => {
		e.preventDefault();
		e.stopPropagation();
		if (field === "banner") setIsDraggingBanner(false);
		else setIsDraggingLogo(false);
	};

	const onDrop = (e: React.DragEvent, field: "logo" | "banner") => {
		e.preventDefault();
		e.stopPropagation();
		if (field === "banner") setIsDraggingBanner(false);
		else setIsDraggingLogo(false);

		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			const file = e.dataTransfer.files[0];
			if (file.type.startsWith("image/")) {
				processFile(file, field);
			}
		}
	};

	const onCropSave = async (croppedBlob: Blob) => {
		if (!activeField) return;

		// Create a File from the Blob
		const file = new File([croppedBlob], `${activeField}.png`, {
			type: "image/png",
		});

		// Create preview URL
		const previewUrl = URL.createObjectURL(croppedBlob);

		if (activeField === "logo") {
			setValue("logo", file);
			setLogoPreview(previewUrl);
		} else {
			setValue("banner", file);
			setBannerPreview(previewUrl);
		}

		setCropModalOpen(false);
		setSelectedFile(null);
		setActiveField(null);
	};

	// --- Render Steps ---

	const renderStep1 = () => (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-white mb-1">Basic Information</h2>
				<p className="text-muted text-sm">Tell us about your club.</p>
			</div>

			<div className="space-y-4">
				<Input
					label="Club Name"
					placeholder="e.g. Spikers United"
					error={errors.name?.message}
					required
					variant="bordered"
					className="bg-black/20"
					{...register("name")}
				/>
				<TextArea
					label="Description"
					placeholder="Describe your club's mission, skill levels, etc..."
					error={errors.description?.message}
					rows={4}
					variant="bordered"
					className="bg-black/20"
					{...register("description")}
				/>
				<div className="p-4 rounded-lg bg-black/10 border border-white/5">
					<Controller
						name="is_public"
						control={control}
						render={({ field: { value, onChange, ref } }) => (
							<Checkbox
								ref={ref}
								checked={value}
								onChange={onChange}
								label="Make this club public"
								helperText="Public clubs are visible to everyone. Private clubs require an invite."
							/>
						)}
					/>
				</div>
			</div>
		</div>
	);

	const renderStep2 = () => (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-white mb-1">Branding</h2>
				<p className="text-muted text-sm">Add a logo and banner to make your club stand out.</p>
			</div>

			{/* Banner Upload */}
			<div className="space-y-2">
				<label className="block font-medium text-white text-sm">Club Banner</label>
				<div
					className={`relative w-full h-40 md:h-48 rounded-xl border-2 border-dashed transition-colors overflow-hidden group 
            ${isDraggingBanner ? "border-primary bg-primary/10" : "border-white/10 bg-black/20 hover:border-primary/50"}`}
					onDragOver={(e) => onDragOver(e, "banner")}
					onDragLeave={(e) => onDragLeave(e, "banner")}
					onDrop={(e) => onDrop(e, "banner")}>
					{bannerPreview ? (
						<>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
							<div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
								<div className="flex gap-2">
									<label className="cursor-pointer btn btn-sm btn-ghost text-white border border-white/20 hover:bg-white/10">
										Change
										<input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, "banner")} />
									</label>
									<button
										type="button"
										onClick={() => {
											setValue("banner", null);
											setBannerPreview(null);
										}}
										className="btn btn-sm btn-ghost text-red-400 border border-white/20 hover:bg-red-500/10">
										<Trash size={14} />
									</button>
								</div>
							</div>
						</>
					) : (
						<label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
							<ImageIcon
								size={32}
								className={`mb-2 transition-colors ${isDraggingBanner ? "text-primary" : "text-muted group-hover:text-white"}`}
							/>
							<span className={`text-sm font-medium ${isDraggingBanner ? "text-primary" : "text-muted"}`}>
								{isDraggingBanner ? "Drop banner here" : "Click or drag to upload banner"}
							</span>
							<span className="text-xs text-muted/50 mt-1">Rec: 1200x400px</span>
							<input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, "banner")} />
						</label>
					)}
				</div>
			</div>

			{/* Logo Upload */}
			<div className="space-y-2">
				<label className="block font-medium text-white text-sm">Club Logo</label>
				<div className="flex items-center gap-6">
					<div
						className={`relative w-32 h-32 rounded-full border-2 border-dashed transition-colors overflow-hidden group shrink-0
                ${isDraggingLogo ? "border-primary bg-primary/10" : "border-white/10 bg-black/20 hover:border-primary/50"}`}
						onDragOver={(e) => onDragOver(e, "logo")}
						onDragLeave={(e) => onDragLeave(e, "logo")}
						onDrop={(e) => onDrop(e, "logo")}>
						{logoPreview ? (
							<>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
								<div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
									<div className="flex flex-col gap-2">
										<label className="cursor-pointer text-xs font-medium text-white hover:underline">
											Change
											<input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, "logo")} />
										</label>
										<button
											type="button"
											onClick={() => {
												setValue("logo", null);
												setLogoPreview(null);
											}}
											className="text-xs font-medium text-red-400 hover:underline">
											Remove
										</button>
									</div>
								</div>
							</>
						) : (
							<label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors">
								<Shield
									size={24}
									className={`mb-1 transition-colors ${isDraggingLogo ? "text-primary" : "text-muted group-hover:text-white"}`}
								/>
								<span className={`text-xs font-medium ${isDraggingLogo ? "text-primary" : "text-muted"}`}>
									{isDraggingLogo ? "Drop" : "Upload"}
								</span>
								<input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, "logo")} />
							</label>
						)}
					</div>
					<div className="flex-1 space-y-1">
						<h3 className="text-sm font-medium text-white">Logo Guidelines</h3>
						<p className="text-xs text-muted leading-relaxed">
							Recommended size: 500x500px.
							<br />
							Formats: PNG, JPG.
							<br />
							Make sure it&apos;s centered and has a transparent background if possible.
						</p>
					</div>
				</div>
			</div>
		</div>
	);

	const renderStep3 = () => (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-white mb-1">Contact Details</h2>
				<p className="text-muted text-sm">How can members reach you?</p>
			</div>
			<div className="space-y-4">
				<Input
					label="Contact Email"
					type="email"
					placeholder="contact@club.com"
					error={errors.contact_email?.message}
					optional
					variant="bordered"
					className="bg-background-light"
					{...register("contact_email")}
				/>
				<Input
					label="Contact Phone"
					type="tel"
					placeholder="+1 (555) 000-0000"
					error={errors.contact_phone?.message}
					optional
					variant="bordered"
					className="bg-background-light"
					{...register("contact_phone")}
				/>
			</div>
		</div>
	);

	const renderStep4 = () => (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-white mb-1">Review & Create</h2>
				<p className="text-muted text-sm">Double check everything before creating your club.</p>
			</div>

			{/* Preview Card */}
			<div className="relative w-full rounded-2xl overflow-hidden bg-background-light border border-white/10 shadow-xl">
				{/* Banner Preview */}
				<div className="h-32 w-full bg-black/40 relative">
					{bannerPreview ? (
						/* eslint-disable-next-line @next/next/no-img-element */
						<img src={bannerPreview} alt="Banner" className="w-full h-full object-cover opacity-80" />
					) : (
						<div className="w-full h-full flex items-center justify-center bg-white/5">
							<ImageIcon className="text-white/10" size={48} />
						</div>
					)}
					<div className="absolute inset-0 bg-gradient-to-t from-background-light via-transparent to-transparent" />
				</div>

				<div className="px-6 pb-6 relative">
					<div className="flex justify-between items-end -mt-10 mb-4">
						{/* Logo Preview */}
						<div className="w-20 h-20 rounded-2xl border-4 border-background-light bg-background-dark overflow-hidden shadow-lg flex items-center justify-center">
							{logoPreview ? (
								/* eslint-disable-next-line @next/next/no-img-element */
								<img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
							) : (
								<Shield className="text-muted/30" />
							)}
						</div>
					</div>

					<div className="space-y-4">
						<div>
							<h3 className="text-xl font-bold text-white">{formData.name || "Untitled Club"}</h3>
							<p className="text-sm text-muted">{formData.is_public ? "Public Club" : "Private Club"}</p>
						</div>

						<p className="text-sm text-gray-300">{formData.description || "No description provided."}</p>

						<div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
							<div>
								<span className="text-xs text-muted block uppercase tracking-wider">Contact Email</span>
								<span className="text-sm text-white">{formData.contact_email || "N/A"}</span>
							</div>
							<div>
								<span className="text-xs text-muted block uppercase tracking-wider">Phone</span>
								<span className="text-sm text-white">{formData.contact_phone || "N/A"}</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
				<Check className="text-primary mt-1 shrink-0" size={16} />
				<p className="text-sm text-primary-content/80">
					By clicking &quot;Create Club&quot;, you agree to our Terms of Service. You will automatically be assigned as the owner.
				</p>
			</div>
		</div>
	);

	return (
		<div className="w-full max-w-3xl mx-auto py-8 px-4 font-sans text-white">
			{/* Header */}
			<div className="mb-10 text-center">
				<h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">Create a New Club</h1>
				<p className="text-muted text-lg">Set up your space for teams, events, and community.</p>
			</div>

			{/* Stepper */}
			<div className="mb-12">
				<div className="flex items-center justify-between relative">
					{/* Connector Line */}
					<div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-white/10 -z-10"></div>

					{STEPS.map((step) => {
						const isActive = step.id === currentStep;
						const isCompleted = step.id < currentStep;

						return (
							<div key={step.id} className="flex flex-col items-center gap-2 bg-background-dark px-2">
								<div
									className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300
                                ${
									isActive
										? "border-primary bg-primary text-white scale-110 shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
										: isCompleted
										? "border-primary bg-primary text-white"
										: "border-white/20 bg-background-dark text-muted"
								}
                            `}>
									{isCompleted ? <Check size={12} /> : step.id}
								</div>
								<span className={`text-xs md:text-sm font-medium hidden sm:block ${isActive ? "text-primary" : "text-muted"}`}>
									{step.title}
								</span>
							</div>
						);
					})}
				</div>
			</div>

			{/* Form Content */}
			<div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm min-h-[450px] flex flex-col justify-between relative overflow-hidden">
				{/* Decorative Gradient Blob */}
				<div className="absolute -top-20 -right-20 w-60 h-60 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />

				<div className="relative z-10 flex-1">
					{currentStep === 1 && renderStep1()}
					{currentStep === 2 && renderStep2()}
					{currentStep === 3 && renderStep3()}
					{currentStep === 4 && renderStep4()}
				</div>

				{/* Footer Navigation */}
				<div className="relative z-10 mt-10 flex items-center justify-between pt-6 border-t border-white/10">
					<Button
						variant="ghost"
						onClick={handleBack}
						disabled={currentStep === 1 || isSubmitting}
						leftIcon={<ArrowLeft size={16} />}
						className="text-muted hover:text-white">
						Back
					</Button>

					{currentStep < STEPS.length ? (
						<Button variant="solid" color="primary" onClick={handleNext} rightIcon={<ArrowRight size={16} />} className="px-8 shadow-lg shadow-primary/20">
							Next Step
						</Button>
					) : (
						<Button
							variant="solid"
							color="primary"
							onClick={handleSubmit(onSubmit)}
							loading={isSubmitting}
							className="px-8 bg-green-600 hover:bg-green-700 text-white border-none shadow-lg shadow-green-600/20"
							rightIcon={!isSubmitting && <Check size={16} />}>
							Create Club
						</Button>
					)}
				</div>
			</div>

			{/* Image Cropper Modal */}
			<Modal
				isOpen={cropModalOpen}
				onClose={() => {
					setCropModalOpen(false);
					setSelectedFile(null);
				}}
				title={`Adjust ${activeField === "banner" ? "Banner" : "Logo"}`}
				size="lg">
				<div className="p-1">
					{selectedFile && (
						<ImageCropper
							imageFile={selectedFile}
							onImageSave={onCropSave}
							onCancel={() => {
								setCropModalOpen(false);
								setSelectedFile(null);
							}}
							aspect={activeField === "banner" ? 3 / 1 : 1} // 3:1 for banner, 1:1 for logo
							className="border-0 bg-transparent rounded-none"
						/>
					)}
				</div>
			</Modal>

			{/* Toast Notification */}
			<Toast toast={toast} onClose={() => setToast(null)} />
		</div>
	);
}
