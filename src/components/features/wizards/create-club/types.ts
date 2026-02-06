import { VenueFormData } from "@/components/features/venues";
import { UserProfile } from "@/lib/models/User";

export interface ClubFormData {
	// Basic Info (Step 1)
	name: string;
	description?: string;
	isPublic: boolean;

	// Branding (Step 2)
	logo: File | null;
	banner: File | null;
	logoPreview?: string;
	bannerPreview?: string;

	// Contact and venues (Step 3)
	contactEmail?: string;
	contactPhone?: string;
	venues?: VenueFormData[];

	// Invite (Step 4)
	invitees: UserProfile[];
}
