"use client";

import { Button, Input, Map, TextArea } from "@/components";
import AddressAutocomplete, { ParsedAddress } from "@/components/ui/address-autocomplete";
import { APIProvider } from "@vis.gl/react-google-maps";
import { MapPin, Plus } from "lucide-react";
import { useCallback, useState } from "react";

export interface VenueFormData {
	tempId: string;
	name: string;
	addressLine1?: string;
	city?: string;
	postalCode?: string;
	country?: string;
	latitude?: number;
	longitude?: number;
	howToGetThereInstructions?: string;
}

interface VenueFormProps {
	onAddVenue: (venue: VenueFormData) => void;
	title?: string;
	description?: string;
	className?: string;
}

export default function VenueForm({ onAddVenue, title = "Add a venue", description, className = "" }: VenueFormProps) {
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
			city: newVenue.city,
			country: newVenue.country,
			latitude: newVenue.latitude,
			longitude: newVenue.longitude,
			postalCode: newVenue.postalCode,
			howToGetThereInstructions: newVenue.howToGetThereInstructions,
		};

		onAddVenue(venueToAdd);
	};

	return (
		<div className={className}>
			{(title || description) && (
				<div className="mb-4">
					{title && <div className="text-sm font-medium text-white">{title}</div>}
					{description && <p className="text-muted text-sm">{description}</p>}
				</div>
			)}

			<div className="space-y-4">
				<APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
					<AddressAutocomplete
						value={addressInput || ""}
						onAddressSelected={handleAddressSelected}
						label="Address"
						placeholder="e.g., 123 Sports Center Drive"
					/>
				</APIProvider>

				<div className="space-y-2">
					<div className="flex items-center gap-2 text-sm text-muted">
						<MapPin size={14} />
						<span>Click on the map to fine-tune location</span>
					</div>
					<div className="rounded-xl overflow-hidden border border-white/10 h-48">
						<Map
							readonly={false}
							defaultAddress={newVenue.addressLine1}
							onAddressSelected={handleAddressSelected}
							onPositionChanged={handleMapPositionChanged}
						/>
					</div>
				</div>

				<Input
					label="Venue Name"
					placeholder="e.g., Main Training Hall"
					value={newVenue.name || ""}
					onChange={(e) => setNewVenue((prev) => ({ ...prev, name: e.target.value }))}
					className="bg-black/20"
				/>

				<TextArea label="How to get there" optional={true} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
				<Button type="button" onClick={handleAddVenue} disabled={!newVenue.name || !addressInput} leftIcon={<Plus size={16} />} className="w-full">
					Add Venue
				</Button>
			</div>
		</div>
	);
}
