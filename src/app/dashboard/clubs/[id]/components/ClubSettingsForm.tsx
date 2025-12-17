"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Save, Shield, ImageIcon } from "lucide-react";
import Modal from "@/components/ui/modal";
import ImageCropper from "@/components/ui/image-cropper";
import { Club } from "@/lib/models/Club";
import { updateClub, uploadClubImage } from "@/lib/requests/clubs";

interface ClubSettingsFormProps {
    club: Club;
}

interface FormValues {
    name: string;
    description: string;
    contactEmail: string;
    contactPhone: string;
    isPublic: boolean;
}

export default function ClubSettingsForm({ club }: ClubSettingsFormProps) {
    const queryClient = useQueryClient();

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
        formState: { errors, isDirty },
    } = useForm<FormValues>({
        defaultValues: {
            name: club.name,
            description: club.description || "",
            contactEmail: club.contactEmail || "",
            contactPhone: club.contactPhone || "",
            isPublic: club.isPublic,
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

            return updateClub(club.id, {
                name: data.name,
                description: data.description || undefined,
                contactEmail: data.contactEmail || undefined,
                contactPhone: data.contactPhone || undefined,
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

    const onSubmit = (data: FormValues) => {
        updateMutation.mutate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
            {/* Banner Section */}
            <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                <div className="relative h-32 bg-gradient-to-r from-accent/20 to-primary/20 group">
                    {bannerPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={bannerPreview}
                            alt="Club banner"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="text-white/20" size={32} />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => bannerInputRef.current?.click()}
                            className="btn btn-sm bg-white/20 hover:bg-white/30 text-white border-none gap-2"
                        >
                            <Camera size={14} />
                            Change Banner
                        </button>
                    </div>
                    <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileSelect(e, "banner")}
                    />
                </div>

                {/* Logo */}
                <div className="px-6 pb-6">
                    <div className="relative w-20 h-20 -mt-10 rounded-xl bg-background-dark border-4 border-background-light overflow-hidden group">
                        {logoPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={logoPreview}
                                alt="Club logo"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Shield className="text-muted" size={24} />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                                type="button"
                                onClick={() => logoInputRef.current?.click()}
                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white"
                            >
                                <Camera size={12} />
                            </button>
                        </div>
                        <input
                            ref={logoInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileSelect(e, "logo")}
                        />
                    </div>
                    <p className="text-xs text-muted mt-2">
                        Click on logo or banner to change. Changes save when you submit the form.
                    </p>
                </div>
            </div>

            {/* Form Fields */}
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
                <h3 className="text-lg font-bold text-white mb-4">Club Information</h3>

                <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                        Club Name *
                    </label>
                    <input
                        type="text"
                        {...register("name", { required: "Club name is required" })}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-accent"
                    />
                    {errors.name && (
                        <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted mb-2">
                        Description
                    </label>
                    <textarea
                        {...register("description")}
                        rows={3}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-accent resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Contact Email
                        </label>
                        <input
                            type="email"
                            {...register("contactEmail")}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-accent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted mb-2">
                            Contact Phone
                        </label>
                        <input
                            type="tel"
                            {...register("contactPhone")}
                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-muted/50 focus:outline-none focus:border-accent"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                    <input
                        type="checkbox"
                        {...register("isPublic")}
                        className="checkbox checkbox-accent"
                    />
                    <div>
                        <p className="text-sm font-medium text-white">Public Club</p>
                        <p className="text-xs text-muted">Anyone can find and request to join</p>
                    </div>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
                <button
                    type="submit"
                    disabled={!hasChanges || updateMutation.isPending}
                    className="btn bg-accent hover:bg-accent/90 text-white border-none gap-2 disabled:opacity-50"
                >
                    {updateMutation.isPending ? (
                        <span className="loading loading-spinner loading-sm" />
                    ) : (
                        <Save size={16} />
                    )}
                    Save Changes
                </button>
            </div>

            {updateMutation.isSuccess && (
                <div className="rounded-xl bg-green-500/20 border border-green-500/30 p-4 text-green-400 text-sm">
                    Settings saved successfully!
                </div>
            )}

            {updateMutation.isError && (
                <div className="rounded-xl bg-red-500/20 border border-red-500/30 p-4 text-red-400 text-sm">
                    Failed to save settings. Please try again.
                </div>
            )}

            {/* Image Cropper Modal */}
            <Modal
                isOpen={cropModalOpen}
                onClose={() => {
                    setCropModalOpen(false);
                    setSelectedFile(null);
                    setActiveField(null);
                }}
                title={`Adjust ${activeField === "banner" ? "Banner" : "Logo"}`}
            >
                <div className="w-[80vw] max-w-[500px] p-4">
                    {selectedFile && (
                        <ImageCropper
                            imageFile={selectedFile}
                            onImageSave={onCropSave}
                            aspect={activeField === "banner" ? 3 / 1 : 1}
                        />
                    )}
                </div>
            </Modal>
        </form>
    );
}
