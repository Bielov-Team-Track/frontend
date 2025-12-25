// frontend/src/components/features/clubs/settings/GeneralSettingsForm.tsx
"use client";

import SettingsSidebar, { SettingsSection } from "@/components/features/clubs/settings/SettingsSidebar";
import SocialLinksEditor from "@/components/features/clubs/settings/SocialLinksEditor";
import { Button, ImageCropper, Input, Modal, TextArea } from "@/components/ui";
import { Club, SocialPlatform } from "@/lib/models/Club";
import { updateClub, updateClubSocialLinks, uploadClubImage } from "@/lib/api/clubs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, ImageIcon, Save, Shield } from "lucide-react";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface GeneralSettingsSectionProps {
	club: Club;
	onTabChange?: (tabId: SettingsSection) => void;
	activeTab?: SettingsSection;
}

interface FormValues {
	name: string;
	description: string;
	contactEmail: string;
	contactPhone: string;
	websiteUrl: string;
	isPublic: boolean;
	socialLinks: { platform: SocialPlatform; url: string }[];
}

export default function GeneralSettingsSection({ club, onTabChange, activeTab }: GeneralSettingsSectionProps) {
	const queryClient = useQueryClient();
	console.log("General settings", club);

	// Image state
	const [logoBlob, setLogoBlob] = useState<Blob | null>(null);
	const [bannerBlob, setBannerBlob] = useState<Blob | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(club.logoUrl || null);
	const [bannerPreview, setBannerPreview] = useState<string | null>(club.bannerUrl || null);

	// Cropper state
	const [cropModalOpen, setCropModalOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [activeField, setActiveField] = useState<"logo" | "banner" | null>(null);

	// File input refs
	const logoInputRef = useRef<HTMLInputElement>(null);
	const bannerInputRef = useRef<HTMLInputElement>(null);

	const {
		register,
		handleSubmit,
		control,
		formState: { errors, isDirty },
	} = useForm<FormValues>({
		defaultValues: {
			name: club.name,
			description: club.description || "",
			contactEmail: club.contactEmail || "",
			contactPhone: club.contactPhone || "",
			websiteUrl: club.websiteUrl || "",
			isPublic: club.isPublic,
			socialLinks: club.socialLinks?.map((l) => ({ platform: l.platform, url: l.url })) || [],
		},
	});

	const updateMutation = useMutation({
		mutationFn: async (data: FormValues) => {
			let logoUrl = club.logoUrl;
			let bannerUrl = club.bannerUrl;

			// Upload new images if changed
			if (logoBlob) {
				logoUrl = await uploadClubImage(club.id, logoBlob, "logo");
			}
			if (bannerBlob) {
				bannerUrl = await uploadClubImage(club.id, bannerBlob, "banner");
			}

			// Update social links
			await updateClubSocialLinks(
				club.id,
				data.socialLinks.map((l, i) => ({ ...l, orderIndex: i }))
			);

			return updateClub(club.id, {
				name: data.name,
				description: data.description || undefined,
				contactEmail: data.contactEmail || undefined,
				contactPhone: data.contactPhone || undefined,
				websiteUrl: data.websiteUrl || undefined,
				isPublic: data.isPublic,
				logoUrl,
				bannerUrl,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club", club.id] });
			setLogoBlob(null);
			setBannerBlob(null);
		},
	});

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "banner") => {
		if (e.target.files && e.target.files[0]) {
			setSelectedFile(e.target.files[0]);
			setActiveField(field);
			setCropModalOpen(true);
			e.target.value = "";
		}
	};

	const onCropSave = (croppedBlob: Blob) => {
		const previewUrl = URL.createObjectURL(croppedBlob);

		if (activeField === "logo") {
			setLogoBlob(croppedBlob);
			setLogoPreview(previewUrl);
		} else {
			setBannerBlob(croppedBlob);
			setBannerPreview(previewUrl);
		}

		setCropModalOpen(false);
		setSelectedFile(null);
		setActiveField(null);
	};

	const hasChanges = isDirty || logoBlob !== null || bannerBlob !== null;

	return (
		<div className="flex gap-2">
			<SettingsSidebar clubId={club.id} onTabChange={onTabChange} activeTab={activeTab} />
			<form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="flex-1 relative">
				<div className="sticky top-0 z-10 h-16 bg-background-dark py-4 mb-6 flex justify-between items-center">
					<h2 className="text-lg font-bold text-white">General Settings</h2>
					{hasChanges && (
						<Button type="submit" variant="solid" color="accent" size="sm" loading={updateMutation.isPending} leftIcon={<Save size={16} />}>
							Save Changes
						</Button>
					)}
				</div>
				<div className="space-y-8">
					{/* Branding Section */}
					<section className="space-y-4">
						<h2 className="text-lg font-bold text-white">Club Branding</h2>
						<div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
							{/* Banner */}
							<div className="relative h-32 bg-linear-to-r from-accent/20 to-primary/20 group">
								{bannerPreview ? (
									<img src={bannerPreview} alt="Club banner" className="w-full h-full object-cover" />
								) : (
									<div className="w-full h-full flex items-center justify-center">
										<ImageIcon className="text-white/20" size={32} />
									</div>
								)}
								<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
									<button
										type="button"
										onClick={() => bannerInputRef.current?.click()}
										className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-none gap-2">
										<Camera size={14} />
										Change Banner
									</button>
								</div>
								<input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "banner")} />
							</div>

							{/* Logo */}
							<div className="px-6 pb-6">
								<div className="relative w-20 h-20 -mt-10 rounded-xl bg-background-dark border-4 border-background-light overflow-hidden group">
									{logoPreview ? (
										<img src={logoPreview} alt="Club logo" className="w-full h-full object-cover" />
									) : (
										<div className="w-full h-full flex items-center justify-center">
											<Shield className="text-muted" size={24} />
										</div>
									)}
									<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
										<button
											type="button"
											onClick={() => logoInputRef.current?.click()}
											className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white">
											<Camera size={12} />
										</button>
									</div>
									<input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "logo")} />
								</div>
								<p className="text-xs text-muted mt-2">Click on logo or banner to change.</p>
							</div>
						</div>
					</section>

					{/* Basic Information */}
					<section className="space-y-4">
						<h2 className="text-lg font-bold text-white">Basic Information</h2>
						<div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
							<Input {...register("name", { required: "Club name is required" })} label="Club Name" required error={errors.name?.message} />
							<TextArea {...register("description")} label="Description" rows={3} placeholder="Tell people about your club..." />
						</div>
					</section>

					{/* Contact & Social */}
					<section className="space-y-4">
						<h2 className="text-lg font-bold text-white">Contact & Social</h2>
						<div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<Input {...register("contactEmail")} label="Contact Email" type="email" placeholder="club@example.com" />
								<Input {...register("contactPhone")} label="Contact Phone" type="tel" placeholder="+1 234 567 890" />
							</div>
							<Input {...register("websiteUrl")} label="Website URL" placeholder="https://yourclub.com" />
							<Controller
								name="socialLinks"
								control={control}
								render={({ field }) => <SocialLinksEditor value={field.value} onChange={field.onChange} />}
							/>
						</div>
					</section>

					{/* Visibility */}
					<section className="space-y-4">
						<h2 className="text-lg font-bold text-white">Visibility & Preferences</h2>
						<div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
							<div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
								<input type="checkbox" {...register("isPublic")} className="checkbox checkbox-accent" />
								<div>
									<p className="text-sm font-medium text-white">Public Club</p>
									<p className="text-xs text-muted">Anyone can find the club through the search or public link</p>
								</div>
							</div>
						</div>
					</section>
				</div>

				{updateMutation.isSuccess && (
					<div className="rounded-xl bg-green-500/20 border border-green-500/30 p-4 text-green-400 text-sm">Settings saved successfully!</div>
				)}

				{updateMutation.isError && (
					<div className="rounded-xl bg-red-500/20 border border-red-500/30 p-4 text-red-400 text-sm">Failed to save settings. Please try again.</div>
				)}

				{/* Image Cropper Modal */}
				<Modal
					isOpen={cropModalOpen}
					onClose={() => {
						setCropModalOpen(false);
						setSelectedFile(null);
						setActiveField(null);
					}}
					title={`Adjust ${activeField === "banner" ? "Banner" : "Logo"}`}>
					<div className="w-[80vw] max-w-[500px] p-4">
						{selectedFile && <ImageCropper imageFile={selectedFile} onImageSave={onCropSave} aspect={activeField === "banner" ? 3 / 1 : 1} />}
					</div>
				</Modal>
			</form>
		</div>
	);
}
