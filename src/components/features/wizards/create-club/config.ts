import { createClub, updateClub, uploadClubImage } from "@/lib/api/clubs";
import * as yup from "yup";
import { WizardConfig } from "../core/types";
import { BrandingStep, ContactStep, InviteStep, ReviewStep } from "./steps";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { ClubFormData } from "./types";

export const clubValidationSchema = yup.object().shape({
	name: yup.string().required("Club name is required").min(3, "Name must be at least 3 characters"),
	description: yup.string().max(500, "Description cannot exceed 500 characters"),
	isPublic: yup.boolean().default(true),
	logo: yup.mixed<File>().nullable(),
	banner: yup.mixed<File>().nullable(),
	logoPreview: yup.string(),
	bannerPreview: yup.string(),
	contactEmail: yup.string().email("Must be a valid email").nullable(),
	contactPhone: yup.string().nullable(),
	venues: yup.array(),
	invitees: yup.array(),
});

const defaultValues: ClubFormData = {
	name: "",
	description: "",
	isPublic: true,
	logo: null,
	banner: null,
	contactEmail: "",
	contactPhone: "",
	invitees: [],
};

export const createClubWizardConfig: WizardConfig<ClubFormData> = {
	id: "create-club",
	title: "Create Club",
	subtitle: "Set up your space for teams, events, and community",
	steps: [
		{
			id: "basic-info",
			label: "Basic Info",
			component: BasicInfoStep,
			fields: ["name", "description", "isPublic"],
		},
		{
			id: "branding",
			label: "Branding",
			component: BrandingStep,
			fields: [],
		},
		{
			id: "contact",
			label: "Contact and Venues",
			component: ContactStep,
			fields: ["contactEmail", "contactPhone", "venues"],
		},
		{
			id: "invite",
			label: "Invite",
			component: InviteStep,
			fields: [],
		},
		{
			id: "review",
			label: "Review",
			component: ReviewStep,
			fields: [],
		},
	],
	defaultValues,
	validationSchema: clubValidationSchema as any,
	onSubmit: async (data, context) => {
		// Create club first
		const club = await createClub({
			name: data.name,
			description: data.description || undefined,
			isPublic: data.isPublic,
			contactEmail: data.contactEmail || undefined,
			contactPhone: data.contactPhone || undefined,
		});

		// Upload images if provided
		let logoUrl: string | undefined;
		let bannerUrl: string | undefined;

		if (data.logo) {
			try {
				logoUrl = await uploadClubImage(club.id, data.logo, "logo");
			} catch (error) {
				console.error("Failed to upload logo:", error);
			}
		}

		if (data.banner) {
			try {
				bannerUrl = await uploadClubImage(club.id, data.banner, "banner");
			} catch (error) {
				console.error("Failed to upload banner:", error);
			}
		}

		// Update with image URLs
		if (logoUrl || bannerUrl) {
			await updateClub(club.id, { logoUrl, bannerUrl });
		}

		// TODO: Send invitations to invitees

		return { id: club.id };
	},
	successConfig: {
		title: "Club Created!",
		message: "Your club has been created successfully. Start adding teams and events!",
		linkText: "View Club",
		getLinkHref: (id) => `/dashboard/clubs/${id}`,
	},
};
