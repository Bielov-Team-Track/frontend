"use client";

import SocialLinksEditor from "@/components/features/clubs/settings/SocialLinksEditor";
import { VenueForm, VenueFormData, VenueList } from "@/components/features/venues";
import { SettingsAlert, SettingsCard, SettingsHeader } from "@/components/layout/settings-layout";
import { Button, EmptyState, ImageCropper, Input, Loader, Modal, TextArea } from "@/components/ui";
import { createVenue, deleteVenue, getClub, updateClub, updateClubSocialLinks, uploadClubImage } from "@/lib/api/clubs";
import { SocialPlatform } from "@/lib/models/Club";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building, Camera, ImageIcon, Plus, Shield } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface FormValues {
	name: string;
	description: string;
	contactEmail: string;
	contactPhone: string;
	websiteUrl: string;
	isPublic: boolean;
	socialLinks: { platform: SocialPlatform; url: string }[];
}

export default function ClubGeneralSettingsPage() {
	const params = useParams();
	const clubId = params.id as string;
	const queryClient = useQueryClient();

	const { data: club } = useQuery({
		queryKey: ["club", clubId],
		queryFn: () => getClub(clubId),
	});

	const [addVenueModalOpen, setAddVenueModalOpen] = useState(false);

	// Image state
	const [logoBlob, setLogoBlob] = useState<Blob | null>(null);
	const [bannerBlob, setBannerBlob] = useState<Blob | null>(null);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [bannerPreview, setBannerPreview] = useState<string | null>(null);

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
		values: club
			? {
					name: club.name,
					description: club.description || "",
					contactEmail: club.contactEmail || "",
					contactPhone: club.contactPhone || "",
					websiteUrl: club.websiteUrl || "",
					isPublic: club.isPublic,
					socialLinks: club.socialLinks?.map((l) => ({ platform: l.platform, url: l.url })) || [],
			  }
			: undefined,
	});

	const updateMutation = useMutation({
		mutationFn: async (data: FormValues) => {
			if (!club) return;

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
			queryClient.invalidateQueries({ queryKey: ["club", clubId] });
			setLogoBlob(null);
			setBannerBlob(null);
		},
	});

	const addVenueMutation = useMutation({
		mutationFn: async (venue: VenueFormData) => {
			return createVenue({
				clubId,
				name: venue.name,
				addressLine1: venue.addressLine1,
				city: venue.city,
				postalCode: venue.postalCode,
				country: venue.country,
				latitude: venue.latitude,
				longitude: venue.longitude,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club", clubId] });
			setAddVenueModalOpen(false);
		},
	});

	const deleteVenueMutation = useMutation({
		mutationFn: async (venueId: string) => {
			return deleteVenue(venueId);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["club", clubId] });
		},
	});

	const handleAddVenue = (venue: VenueFormData) => {
		addVenueMutation.mutate(venue);
	};

	const handleRemoveVenue = (venueId: string) => {
		deleteVenueMutation.mutate(venueId);
	};

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

	const getAlertStatus = () => {
		if (updateMutation.isSuccess) return "success";
		if (updateMutation.isError) return "error";
		return "idle";
	};

	if (!club) return null;

	const currentLogoPreview = logoPreview || club.logoUrl;
	const currentBannerPreview = bannerPreview || club.bannerUrl;

	return (
		<form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
			<SettingsHeader
				title="General Settings"
				isDirty={hasChanges}
				onSave={handleSubmit((data) => updateMutation.mutate(data))}
				isLoading={updateMutation.isPending}
			/>

			<SettingsAlert status={getAlertStatus()} />

			{/* Branding Section */}
			<SettingsCard title="Club Branding">
				<div className="rounded-xl overflow-hidden border border-border">
					{/* Banner */}
					<div className="relative h-32 bg-linear-to-r from-accent/20 to-primary/20 group">
						{currentBannerPreview ? (
							<img src={currentBannerPreview} alt="Club banner" className="w-full h-full object-cover" />
						) : (
							<div className="w-full h-full flex items-center justify-center">
								<ImageIcon className="text-muted" size={32} />
							</div>
						)}
						<div className="absolute inset-0 bg-overlay-light opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
							<button
								type="button"
								onClick={() => bannerInputRef.current?.click()}
								className="px-3 py-1.5 rounded-lg bg-hover hover:bg-surface text-white text-sm flex items-center gap-2">
								<Camera size={14} />
								Change Banner
							</button>
						</div>
						<input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "banner")} />
					</div>

					{/* Logo */}
					<div className="px-6 pb-6">
						<div className="relative w-20 h-20 -mt-10 rounded-xl bg-background border-4 border-background-light overflow-hidden group">
							{currentLogoPreview ? (
								<img src={currentLogoPreview} alt="Club logo" className="w-full h-full object-cover" />
							) : (
								<div className="w-full h-full flex items-center justify-center">
									<Shield className="text-muted" size={24} />
								</div>
							)}
							<div className="absolute inset-0 bg-overlay-light opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
								<button
									type="button"
									onClick={() => logoInputRef.current?.click()}
									className="p-2 rounded-full bg-hover hover:bg-surface text-white">
									<Camera size={12} />
								</button>
							</div>
							<input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "logo")} />
						</div>
						<p className="text-xs text-muted mt-2">Click on logo or banner to change.</p>
					</div>
				</div>
			</SettingsCard>

			{/* Basic Information */}
			<SettingsCard title="Basic Information">
				<Input {...register("name", { required: "Club name is required" })} label="Club Name" required error={errors.name?.message} />
				<TextArea {...register("description")} label="Description" rows={3} placeholder="Tell people about your club..." />
			</SettingsCard>

			<SettingsCard title="Venues">
				{!club.venues || club.venues.length === 0 ? (
					<EmptyState
						icon={Building}
						title="No venues"
						description="Add venues for people to find you via search, and to add them to events"
						action={{
							label: "Add Venue",
							onClick: () => setAddVenueModalOpen(true),
						}}
					/>
				) : (
					<div className="space-y-4">
						<VenueList venues={club.venues} onRemove={handleRemoveVenue} />
						<Button type="button" variant="outline" onClick={() => setAddVenueModalOpen(true)} leftIcon={<Plus size={16} />} className="w-full">
							Add Venue
						</Button>
					</div>
				)}
			</SettingsCard>

			{/* Contact & Social */}
			<SettingsCard title="Contact & Social">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input {...register("contactEmail")} label="Contact Email" type="email" placeholder="club@example.com" />
					<Input {...register("contactPhone")} label="Contact Phone" type="tel" placeholder="+1 234 567 890" />
				</div>
				<Input {...register("websiteUrl")} label="Website URL" placeholder="https://yourclub.com" />
				<Controller name="socialLinks" control={control} render={({ field }) => <SocialLinksEditor value={field.value} onChange={field.onChange} />} />
			</SettingsCard>

			{/* Visibility */}
			<SettingsCard title="Visibility & Preferences">
				<div className="flex items-center gap-3 p-4 rounded-xl bg-surface">
					<input type="checkbox" {...register("isPublic")} className="checkbox checkbox-accent" />
					<div>
						<p className="text-sm font-medium text-white">Public Club</p>
						<p className="text-xs text-muted">Anyone can find the club through the search or public link</p>
					</div>
				</div>
			</SettingsCard>

			{/* Image Cropper Modal */}
			<Modal
				isOpen={cropModalOpen}
				onClose={() => {
					setCropModalOpen(false);
					setSelectedFile(null);
					setActiveField(null);
				}}
				title={`Adjust ${activeField === "banner" ? "Banner" : "Logo"}`}>
				<div className="w-[80vw] max-w-125 p-4">
					{selectedFile && <ImageCropper imageFile={selectedFile} onImageSave={onCropSave} aspect={activeField === "banner" ? 3 / 1 : 1} />}
				</div>
			</Modal>

			{/* Add venue modal */}
			<Modal isOpen={addVenueModalOpen} onClose={() => setAddVenueModalOpen(false)} title="Add Venue">
				<div className="p-4 min-w-100">
					<VenueForm onAddVenue={handleAddVenue} title="" />
					{addVenueMutation.isError && <p className="text-sm text-red-400 mt-4">Failed to add venue. Please try again.</p>}
					{addVenueMutation.isPending && (
						<div className="mt-4 text-center text-sm text-muted">
							<Loader /> Adding venue
						</div>
					)}
				</div>
			</Modal>
		</form>
	);
}
