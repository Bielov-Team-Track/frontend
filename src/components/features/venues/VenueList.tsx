import { MapPin, Trash2 } from "lucide-react";

interface VenueItem {
	id?: string;
	tempId?: string;
	name: string;
	addressLine1?: string;
	city?: string;
	country?: string;
}

interface VenueListProps {
	venues: VenueItem[];
	onRemove: (id: string) => void;
	className?: string;
}

export default function VenueList({ venues, onRemove, className = "" }: VenueListProps) {
	if (venues.length === 0) return null;

	return (
		<div className={`space-y-2 ${className}`}>
			{venues.map((venue) => {
				const key = venue.id || venue.tempId!;
				return (
					<div key={key} className="flex items-start justify-between p-4 rounded-lg border border-border bg-card">
						<div className="flex items-start gap-3">
							<MapPin size={18} className="text-muted-foreground mt-0.5 shrink-0" />
							<div>
								<div className="font-medium text-foreground">{venue.name}</div>
								<div className="text-sm text-muted-foreground">
									{[venue.addressLine1, venue.city, venue.country].filter(Boolean).join(", ")}
								</div>
							</div>
						</div>
						<button
							type="button"
							onClick={() => onRemove(key)}
							className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors">
							<Trash2 size={16} />
						</button>
					</div>
				);
			})}
		</div>
	);
}
