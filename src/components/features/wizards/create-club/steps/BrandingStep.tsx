"use client";

import ImageCropper from "@/components/ui/image-cropper";
import Modal from "@/components/ui/modal";
import { Image as ImageIcon, Shield, Trash } from "lucide-react";
import { useState } from "react";
import { WizardStepProps } from "../../core/types";
import { ClubFormData } from "../types";

export function BrandingStep({ form }: WizardStepProps<ClubFormData>) {
	const { setValue, watch } = form;
	const logoPreview = watch("logoPreview");
	const bannerPreview = watch("bannerPreview");

	const [cropModalOpen, setCropModalOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [activeField, setActiveField] = useState<"logo" | "banner" | null>(null);
	const [isDraggingBanner, setIsDraggingBanner] = useState(false);
	const [isDraggingLogo, setIsDraggingLogo] = useState(false);

	const processFile = (file: File, field: "logo" | "banner") => {
		setSelectedFile(file);
		setActiveField(field);
		setCropModalOpen(true);
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "banner") => {
		if (e.target.files && e.target.files[0]) {
			processFile(e.target.files[0], field);
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

		const file = new File([croppedBlob], `${activeField}.png`, { type: "image/png" });
		const previewUrl = URL.createObjectURL(croppedBlob);

		if (activeField === "logo") {
			setValue("logo", file);
			setValue("logoPreview", previewUrl);
		} else {
			setValue("banner", file);
			setValue("bannerPreview", previewUrl);
		}

		setCropModalOpen(false);
		setSelectedFile(null);
		setActiveField(null);
	};

	return (
		<div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
			<div>
				<h2 className="text-xl font-bold text-foreground mb-1">Branding</h2>
				<p className="text-muted-foreground text-sm">Add a logo and banner to make your club stand out.</p>
			</div>

			{/* Banner Upload */}
			<div className="space-y-2">
				<label className="block font-medium text-sm">Club Banner</label>
				<div
					className={`relative w-full h-40 rounded-xl border-2 border-dashed transition-colors overflow-hidden group
            ${isDraggingBanner ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
					onDragOver={(e) => onDragOver(e, "banner")}
					onDragLeave={(e) => onDragLeave(e, "banner")}
					onDrop={(e) => onDrop(e, "banner")}>
					{bannerPreview ? (
						<>
							<img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
							<div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
								<div className="flex gap-2">
									<label className="cursor-pointer px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 rounded-lg text-white">
										Change
										<input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, "banner")} />
									</label>
									<button
										type="button"
										onClick={() => {
											setValue("banner", null);
											setValue("bannerPreview", undefined);
										}}
										className="px-3 py-1.5 text-sm bg-destructive/20 hover:bg-destructive/30 rounded-lg text-destructive">
										<Trash size={14} />
									</button>
								</div>
							</div>
						</>
					) : (
						<label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
							<ImageIcon size={32} className={`mb-2 ${isDraggingBanner ? "text-primary" : "text-muted-foreground"}`} />
							<span className={`text-sm font-medium ${isDraggingBanner ? "text-primary" : "text-muted-foreground"}`}>
								{isDraggingBanner ? "Drop banner here" : "Click or drag to upload banner"}
							</span>
							<span className="text-xs text-muted-foreground mt-1">Recommended: 1200x400px</span>
							<input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, "banner")} />
						</label>
					)}
				</div>
			</div>

			{/* Logo Upload */}
			<div className="space-y-2">
				<label className="block font-medium text-sm">Club Logo</label>
				<div className="flex items-center gap-6">
					<div
						className={`relative w-24 h-24 rounded-full border-2 border-dashed transition-colors overflow-hidden group shrink-0
              ${isDraggingLogo ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"}`}
						onDragOver={(e) => onDragOver(e, "logo")}
						onDragLeave={(e) => onDragLeave(e, "logo")}
						onDrop={(e) => onDrop(e, "logo")}>
						{logoPreview ? (
							<>
								<img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
								<div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
									<label className="cursor-pointer text-xs font-medium text-white hover:underline">
										Change
										<input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, "logo")} />
									</label>
									<button
										type="button"
										onClick={() => {
											setValue("logo", null);
											setValue("logoPreview", undefined);
										}}
										className="text-xs font-medium text-destructive hover:underline mt-1">
										Remove
									</button>
								</div>
							</>
						) : (
							<label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
								<Shield size={24} className={`mb-1 ${isDraggingLogo ? "text-primary" : "text-muted-foreground"}`} />
								<span className={`text-xs font-medium ${isDraggingLogo ? "text-primary" : "text-muted-foreground"}`}>
									{isDraggingLogo ? "Drop" : "Upload"}
								</span>
								<input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, "logo")} />
							</label>
						)}
					</div>
					<div className="flex-1 space-y-1">
						<h3 className="text-sm font-medium">Logo Guidelines</h3>
						<p className="text-xs text-muted-foreground leading-relaxed">
							Recommended size: 500x500px.
							<br />
							Formats: PNG, JPG.
							<br />
							Use a centered image with transparent background if possible.
						</p>
					</div>
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
							aspect={activeField === "banner" ? 3 / 1 : 1}
						/>
					)}
				</div>
			</Modal>
		</div>
	);
}
