import { Button, Input, MultiSelectPills, Select } from "@/components/ui";
import { getTeamsByClub, searchClubs } from "@/lib/api/clubs/clubs";
import { Club, Team } from "@/lib/models/Club";
import { yupResolver } from "@hookform/resolvers/yup";
import { Calendar, Loader2, Plus, Shield, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";

// Suggestion type for autocomplete
type Suggestion = {
	id: string;
	name: string;
	logoUrl?: string;
	clubId?: string; // For teams to link to a club
};

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

// Convert Club to Suggestion
const clubToSuggestion = (club: Club): Suggestion => ({
	id: club.id,
	name: club.name,
	logoUrl: club.logoUrl,
});

// Convert Team to Suggestion
const teamToSuggestion = (team: Team): Suggestion => ({
	id: team.id,
	name: team.name,
	logoUrl: team.logoUrl,
	clubId: team.clubId,
});

const schema = yup.object().shape({
	bio: yup.string().nullable(),
});

type FormData = {
	bio?: string | null;
};

type Props = {
	defaultValues?: { bio?: string };
	initialEntries?: HistoryEntry[];
	onNext: (data: { bio: string; entries: HistoryEntry[] }) => void;
	formId: string;
};

export type HistoryEntry = {
	id: string;
	year: string;
	clubName: string;
	clubLogoUrl?: string;
	teamName?: string;
	teamLogoUrl?: string;
	role: string;
	positions: string[];
};

const HistoryStep = ({ onNext, formId, initialEntries = [] }: Props) => {
	const [entries, setEntries] = useState<HistoryEntry[]>(initialEntries);

	// Add Entry State
	const [year, setYear] = useState<string | undefined>();
	const [clubName, setClubName] = useState("");
	const [teamName, setTeamName] = useState("");
	const [role, setRole] = useState<string | undefined>();
	const [positions, setPositions] = useState<string[]>([]);
	const [addError, setAddError] = useState<string | null>(null);

	// Track selected objects to capture logos
	const [selectedClub, setSelectedClub] = useState<Suggestion | null>(null);
	const [selectedTeam, setSelectedTeam] = useState<Suggestion | null>(null);

	// Suggestions State
	const [showClubSuggestions, setShowClubSuggestions] = useState(false);
	const [filteredClubSuggestions, setFilteredClubSuggestions] = useState<Suggestion[]>([]);
	const [isLoadingClubs, setIsLoadingClubs] = useState(false);
	const clubInputRef = useRef<HTMLDivElement>(null);

	const [showTeamSuggestions, setShowTeamSuggestions] = useState(false);
	const [filteredTeamSuggestions, setFilteredTeamSuggestions] = useState<Suggestion[]>([]);
	const [isLoadingTeams, setIsLoadingTeams] = useState(false);
	const teamInputRef = useRef<HTMLDivElement>(null);

	// Debounced search queries
	const debouncedClubSearch = useDebounce(clubName, 300);

	const currentYear = new Date().getFullYear();
	const yearOptions = Array.from({ length: 50 }, (_, i) => {
		const y = currentYear - i;
		return { value: y.toString(), label: y.toString() };
	});

	const roleOptions = [
		{ value: "Player", label: "Player" },
		{ value: "Head Coach", label: "Head Coach" },
		{ value: "Assistant Coach", label: "Assistant Coach" },
		{ value: "Team Manager", label: "Team Manager" },
	];

	const positionOptions = [
		{ value: "Setter", label: "Setter" },
		{ value: "Outside Hitter", label: "Outside Hitter" },
		{ value: "Opposite Hitter", label: "Opposite Hitter" },
		{ value: "Middle Blocker", label: "Middle Blocker" },
		{ value: "Libero", label: "Libero" },
	];

	const { handleSubmit } = useForm<FormData>({
		resolver: yupResolver(schema) as any,
	});

	// Handle clicks outside for suggestions
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (clubInputRef.current && !clubInputRef.current.contains(event.target as Node)) {
				setShowClubSuggestions(false);
			}
			if (teamInputRef.current && !teamInputRef.current.contains(event.target as Node)) {
				setShowTeamSuggestions(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Fetch clubs when debounced search changes
	useEffect(() => {
		const fetchClubs = async () => {
			if (debouncedClubSearch.length < 2) {
				setFilteredClubSuggestions([]);
				return;
			}

			setIsLoadingClubs(true);
			try {
				const clubs = await searchClubs({ query: debouncedClubSearch });
				setFilteredClubSuggestions(clubs.map(clubToSuggestion));
			} catch (error) {
				console.error("Failed to search clubs:", error);
				setFilteredClubSuggestions([]);
			} finally {
				setIsLoadingClubs(false);
			}
		};

		fetchClubs();
	}, [debouncedClubSearch]);

	// Fetch teams when a club is selected
	const fetchTeamsForClub = useCallback(async (clubId: string) => {
		setIsLoadingTeams(true);
		try {
			const teams = await getTeamsByClub(clubId);
			setFilteredTeamSuggestions(teams.map(teamToSuggestion));
		} catch (error) {
			console.error("Failed to fetch teams:", error);
			setFilteredTeamSuggestions([]);
		} finally {
			setIsLoadingTeams(false);
		}
	}, []);

	const handleClubNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setClubName(value);
		// Reset selected club if user types manually
		setSelectedClub(null);
		// Also reset selected team as club changed context
		setSelectedTeam(null);
		setTeamName("");
		setFilteredTeamSuggestions([]);

		if (value.length >= 2) {
			setShowClubSuggestions(true);
		} else {
			setShowClubSuggestions(false);
		}
		if (addError) setAddError(null);
	};

	const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setTeamName(value);
		// Reset selected team if user types manually
		setSelectedTeam(null);

		if (value.length > 0 && filteredTeamSuggestions.length > 0) {
			setShowTeamSuggestions(true);
		} else {
			setShowTeamSuggestions(false);
		}
	};

	const handleSelectClubSuggestion = (club: Suggestion) => {
		setClubName(club.name);
		setSelectedClub(club);
		// Reset team when club is selected
		setSelectedTeam(null);
		setTeamName("");

		setShowClubSuggestions(false);
		if (addError) setAddError(null);

		// Fetch teams for this club
		fetchTeamsForClub(club.id);
	};

	const handleSelectTeamSuggestion = (team: Suggestion) => {
		setTeamName(team.name);
		setSelectedTeam(team);
		setShowTeamSuggestions(false);
	};

	const handleAddEntry = () => {
		if (!year || !clubName || !role) {
			setAddError("Year, Club, and Role are required.");
			return;
		}

		// Use selected club/team logo if available, or check from current suggestions
		let finalClubLogo = selectedClub?.logoUrl;
		if (!finalClubLogo) {
			const match = filteredClubSuggestions.find((c) => c.name.toLowerCase() === clubName.toLowerCase());
			if (match) finalClubLogo = match.logoUrl;
		}

		let finalTeamLogo = selectedTeam?.logoUrl;
		if (!finalTeamLogo) {
			const match = filteredTeamSuggestions.find((t) => t.name.toLowerCase() === teamName.toLowerCase());
			if (match) finalTeamLogo = match.logoUrl;
		}

		const newEntry: HistoryEntry = {
			id: Date.now().toString(),
			year,
			clubName,
			clubLogoUrl: finalClubLogo,
			teamName,
			teamLogoUrl: finalTeamLogo,
			role,
			positions: role === "Player" ? positions : [],
		};

		// Add to top
		setEntries([newEntry, ...entries]);

		// Reset form
		setClubName("");
		setTeamName("");
		setSelectedClub(null);
		setSelectedTeam(null);
		setFilteredClubSuggestions([]);
		setFilteredTeamSuggestions([]);
		setRole(undefined);
		setPositions([]);
		setAddError(null);
	};

	const handleRemoveEntry = (id: string) => {
		setEntries(entries.filter((e) => e.id !== id));
	};

	// Sort entries by year descending
	// Group by Year -> Club
	const groupedEntries = entries.reduce((acc, entry) => {
		if (!acc[entry.year]) {
			acc[entry.year] = {};
		}
		if (!acc[entry.year][entry.clubName]) {
			acc[entry.year][entry.clubName] = [];
		}
		acc[entry.year][entry.clubName].push(entry);
		return acc;
	}, {} as Record<string, Record<string, HistoryEntry[]>>);

	const sortedYears = Object.keys(groupedEntries).sort((a, b) => parseInt(b) - parseInt(a));

	const onSubmit = () => {
		const bioString = sortedYears
			.map((year) => {
				const clubs = groupedEntries[year];
				return Object.keys(clubs)
					.map((clubName) => {
						const clubEntries = clubs[clubName];
						const entriesString = clubEntries
							.map((e) => {
								let details = e.role;
								if (e.teamName) details = `${e.teamName} - ${details}`;
								if (e.positions.length > 0) details += `, ${e.positions.join(", ")}`;
								return details;
							})
							.join("\n");
						return `${year}\n${clubName}\n${entriesString}`;
					})
					.join("\n\n");
			})
			.join("\n\n");

		onNext({ bio: bioString, entries });
	};

	const renderSuggestionItem = (item: Suggestion, onSelect: (item: Suggestion) => void) => (
		<li key={item.id} className="px-4 py-2 hover:bg-hover cursor-pointer flex items-center gap-3" onMouseDown={() => onSelect(item)}>
			{item.logoUrl ? (
				<div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 bg-foreground/10">
					<Image src={item.logoUrl} alt={item.name} fill className="object-cover" />
				</div>
			) : (
				<div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 text-muted">
					<Shield size={14} />
				</div>
			)}
			<span className="text-sm text-foreground truncate">{item.name}</span>
		</li>
	);

	return (
		<form id={formId} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-semibold text-foreground">Experience & History</h2>
				<p className="text-sm text-muted-foreground">Add your past teams, clubs, and roles.</p>
			</div>

			{/* Add Entry Form */}
			<div className="bg-surface rounded-xl border border-border p-4 flex flex-col gap-4">
				<h3 className="font-medium text-foreground flex items-center gap-2">
					<Plus size={16} className="text-accent" /> Add New Entry
				</h3>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<Select
						placeholder="Year"
						options={yearOptions}
						value={year}
						onChange={(val) => setYear(val as string)}
						leftIcon={<Calendar size={14} />}
						required
					/>
					<div className="relative" ref={clubInputRef}>
						<Input
							placeholder="Club Name (min 2 chars)"
							value={clubName}
							onChange={handleClubNameChange}
							onFocus={() => {
								if (clubName.length >= 2) setShowClubSuggestions(true);
							}}
							onBlur={() => setTimeout(() => setShowClubSuggestions(false), 200)}
							required
						/>
						{showClubSuggestions && filteredClubSuggestions.length > 0 && !isLoadingClubs && (
							<ul className="absolute z-10 w-full bg-surface-elevated border border-border rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
								{filteredClubSuggestions.map((club) => renderSuggestionItem(club, handleSelectClubSuggestion))}
							</ul>
						)}
						{showClubSuggestions && isLoadingClubs && (
							<div className="absolute z-10 w-full bg-surface-elevated border border-border rounded-md shadow-lg p-3 mt-1 flex items-center justify-center gap-2 text-muted-foreground text-sm">
								<Loader2 size={14} className="animate-spin" />
								Searching clubs...
							</div>
						)}
						{showClubSuggestions && !isLoadingClubs && filteredClubSuggestions.length === 0 && clubName.length >= 2 && (
							<div className="absolute z-10 w-full bg-surface-elevated border border-border rounded-md shadow-lg p-3 mt-1 text-muted-foreground text-sm text-center">
								No clubs found. You can still enter manually.
							</div>
						)}
					</div>
					<Select
						placeholder="Role"
						options={roleOptions}
						value={role}
						onChange={(val) => {
							setRole(val as string);
							if (val !== "Player") setPositions([]);
						}}
						required
					/>
					<div className="relative" ref={teamInputRef}>
						<Input
							placeholder="Team Name (Optional)"
							value={teamName}
							onChange={handleTeamNameChange}
							onFocus={() => {
								// Show teams if we have a selected club and teams are loaded
								if (selectedClub && filteredTeamSuggestions.length > 0) {
									setShowTeamSuggestions(true);
								}
							}}
							onBlur={() => setTimeout(() => setShowTeamSuggestions(false), 200)}
							disabled={!selectedClub}
						/>
						{showTeamSuggestions && filteredTeamSuggestions.length > 0 && (
							<ul className="absolute z-10 w-full bg-surface-elevated border border-border rounded-md shadow-lg max-h-40 overflow-y-auto mt-1">
								{filteredTeamSuggestions.map((team) => renderSuggestionItem(team, handleSelectTeamSuggestion))}
							</ul>
						)}
						{isLoadingTeams && (
							<div className="absolute z-10 w-full bg-surface-elevated border border-border rounded-md shadow-lg p-3 mt-1 flex items-center justify-center gap-2 text-muted-foreground text-sm">
								<Loader2 size={14} className="animate-spin" />
								Loading teams...
							</div>
						)}
					</div>
				</div>

				{role === "Player" && (
					<div className="animate-in fade-in slide-in-from-top-2">
						<MultiSelectPills
							label="Positions Played"
							options={positionOptions}
							selectedItems={positions}
							onSelectedItemsChange={setPositions}
							optional
						/>
					</div>
				)}

				{addError && <p className="text-red-400 text-xs">{addError}</p>}

				<Button type="button" variant="outline" size="sm" onClick={handleAddEntry} className="self-end px-6">
					Add Entry
				</Button>
			</div>

			{/* Timeline Visualization */}
			{sortedYears.length > 0 && (
				<div className="relative pl-4 ml-2 border-l-2 border-border space-y-8 py-2">
					{sortedYears.map((year) => (
						<div key={year} className="relative animate-in fade-in slide-in-from-left-4">
							{/* Dot on line */}
							<div className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-accent border-2 border-background" />

							<div className="flex flex-col gap-4">
								<span className="text-accent font-bold text-lg leading-none">{year}</span>

								{Object.keys(groupedEntries[year]).map((clubNameKey) => {
									// We need to find the entry that represents this club to get the logo
									// Since grouped by name, any entry in the array has the same clubName.
									// But different entries might have different logoUrls if they were added differently?
									// Ideally logo is tied to club name. Let's pick the first one's logo.
									const clubEntries = groupedEntries[year][clubNameKey];
									const firstEntry = clubEntries[0];

									return (
										<div key={clubNameKey} className="flex flex-col gap-2 ml-1">
											<div className="flex items-center gap-2 border-b border-border pb-1 mb-1">
												{firstEntry.clubLogoUrl ? (
													<div className="relative w-6 h-6 rounded-full overflow-hidden bg-foreground/10 shrink-0">
														<Image src={firstEntry.clubLogoUrl} alt={clubNameKey} fill className="object-cover" />
													</div>
												) : (
													<div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-muted-foreground shrink-0">
														<Shield size={14} />
													</div>
												)}
												<span className="text-foreground font-semibold text-base">{clubNameKey}</span>
											</div>

											<div className="flex flex-col gap-3">
												{clubEntries.map((entry) => (
													<div
														key={entry.id}
														className="flex justify-between items-start group bg-surface p-3 rounded-lg border border-border hover:border-border/80 transition-colors">
														<div className="flex flex-col gap-1">
															{entry.teamName && (
																<div className="flex items-center gap-2 mb-1">
																	{entry.teamLogoUrl && (
																		<div className="relative w-4 h-4 rounded-full overflow-hidden bg-foreground/10 shrink-0">
																			<Image src={entry.teamLogoUrl} alt={entry.teamName} fill className="object-cover" />
																		</div>
																	)}
																	<span className="text-foreground text-sm font-medium">{entry.teamName}</span>
																</div>
															)}

															<div className="text-foreground/90 text-sm flex items-center gap-2">
																<span className={entry.teamName ? "text-muted" : "font-medium"}>{entry.role}</span>

																{entry.positions.length > 0 && (
																	<span className="text-muted-foreground text-xs italic before:content-['•'] before:mr-2">
																		{entry.positions.join(", ")}
																	</span>
																)}
															</div>
														</div>

														<button
															type="button"
															onClick={() => handleRemoveEntry(entry.id)}
															className="text-muted-foreground hover:text-red-400 transition-colors p-1"
															title="Remove entry">
															<Trash2 size={14} />
														</button>
													</div>
												))}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					))}
				</div>
			)}

			{sortedYears.length === 0 && (
				<div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-xl">No history entries added yet.</div>
			)}
		</form>
	);
};

export default HistoryStep;
