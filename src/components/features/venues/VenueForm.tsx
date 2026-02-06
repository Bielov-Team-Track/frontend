"use client";

import { Button, Input, Map, TextArea } from "@/components";
import AddressAutocomplete, { ParsedAddress } from "@/components/ui/address-autocomplete";
import { APIProvider } from "@vis.gl/react-google-maps";
import { MapPin, Plus } from "lucide-react";
import { useCallback, useState } from "react";

export interface VenueFormData {
	tempId?: string;
	clubId?: string;
	name: string;
	addressLine1?: string;
	addressLine2?: string;
	city?: string;
	country?: string;
	region?: string;
	postalCode?: string;
	latitude?: number;
	longitude?: number;
	howToGetThereInstructions?: string;
}

interface VenueFormProps {
	onAddVenue: (venue: VenueFormData) => void;
	title?: string;
	description?: string;
	className?: string;
	buttonVariant?: "default" | "outline";
}

export default function VenueForm({ onAddVenue, title = "Add a venue", description, className = "", buttonVariant = "default" }: VenueFormProps) {
	const [newVenue, setNewVenue] = useState<Partial<VenueFormData>>({
		name: "",
		addressLine1: "",
	});
	const [addressInput, setAddressInput] = useState("");
	const [instructions, setInstructions] = useState("");

	const handleAddressSelected = useCallback((address: ParsedAddress) => {
		setNewVenue((prev) => ({
			...prev,
			name: prev.name || address.addressName || "",
			addressLine1: [address.addressName, address.addressLine1 || address.formattedAddress].filter(Boolean).join(", "),
			city: address.city,
			country: address.country,
			postalCode: address.postalCode,
			latitude: address.latitude,
			longitude: address.longitude,
		}));
		setAddressInput(address.formattedAddress);
	}, []);

	const handleMapPositionChanged = useCallback((lat: number, lng: number) => {
		setNewVenue((prev) => ({
			...prev,
			latitude: lat,
			longitude: lng,
		}));
	}, []);

	const handleAddVenue = () => {
		if (!newVenue.name || !newVenue.addressLine1) return;

		const venueToAdd: VenueFormData = {
			tempId: crypto.randomUUID(),
			name: newVenue.name,
			addressLine1: newVenue.addressLine1,
			addressLine2: newVenue.addressLine2,
			city: newVenue.city,
			country: newVenue.country,
			region: newVenue.region,
			latitude: newVenue.latitude,
			longitude: newVenue.longitude,
			postalCode: newVenue.postalCode,
			howToGetThereInstructions: instructions || undefined,
		};

		onAddVenue(venueToAdd);

		// Clear form after adding venue
		setNewVenue({
			name: "",
			addressLine1: "",
		});
		setAddressInput("");
		setInstructions("");
	};

	return (
		<div className={className}>
			{(title || description) && (
				<div className="mb-4">
					{title && <div className="text-sm font-medium text-foreground">{title}</div>}
					{description && <p className="text-muted-foreground text-sm">{description}</p>}
				</div>
			)}

			<div className="space-y-4">
				<Input
					label="Venue Name"
					placeholder="e.g., Main Training Hall"
					value={newVenue.name || ""}
					onChange={(e) => setNewVenue((prev) => ({ ...prev, name: e.target.value }))}
				/>

				<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
					<AddressAutocomplete
						value={addressInput || ""}
						onAddressSelected={handleAddressSelected}
						label="Address"
						placeholder="e.g., 123 Sports Center Drive"
					/>
				</APIProvider>

				<div className="space-y-2">
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<MapPin size={14} />
						<span>Click on the map to fine-tune location</span>
					</div>
					<div className="rounded-xl overflow-hidden border border-border h-48">
						<Map
							readonly={false}
							defaultAddress={newVenue.addressLine1}
							onAddressSelected={handleAddressSelected}
							onPositionChanged={handleMapPositionChanged}
						/>
					</div>
				</div>

				<TextArea label="How to get there" optional={true} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
				<Button type="button" variant={buttonVariant} onClick={handleAddVenue} disabled={!newVenue.name || !addressInput} leftIcon={<Plus size={16} />} className="w-full">
					Add Venue
				</Button>
			</div>
		</div>
	);
}
