"use client";

import { Button, Input, Select, TextArea } from "@/components";
import { Modal } from "@/components/ui";
import { useCreateTournament } from "@/hooks/useTournaments";
import { CreateTournamentRequest, ScoringFormat } from "@/lib/models/Tournament";
import { Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface CreateTournamentModalProps {
	isOpen: boolean;
	onClose: () => void;
	contextId?: string;
}

const SCORING_OPTIONS = [
	{ value: ScoringFormat.SetsBased, label: "Sets Based" },
	{ value: ScoringFormat.Timed, label: "Timed" },
	{ value: ScoringFormat.RaceToPoints, label: "Race to Points" },
];

const VISIBILITY_OPTIONS = [
	{ value: "Public", label: "Public - Visible to everyone" },
	{ value: "Private", label: "Private - Invite only" },
];

export default function CreateTournamentModal({
	isOpen,
	onClose,
	contextId,
}: CreateTournamentModalProps) {
	const router = useRouter();
	const createTournament = useCreateTournament();

	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [maxTeams, setMaxTeams] = useState("8");
	const [visibility, setVisibility] = useState("Public");
	const [scoringFormat, setScoringFormat] = useState(ScoringFormat.SetsBased);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [registrationDeadline, setRegistrationDeadline] = useState("");
	const [registrationFee, setRegistrationFee] = useState("");
	const [minRosterSize, setMinRosterSize] = useState("");
	const [maxRosterSize, setMaxRosterSize] = useState("");
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (isOpen) {
			setName("");
			setDescription("");
			setMaxTeams("8");
			setVisibility("Public");
			setScoringFormat(ScoringFormat.SetsBased);
			setStartDate("");
			setEndDate("");
			setRegistrationDeadline("");
			setRegistrationFee("");
			setMinRosterSize("");
			setMaxRosterSize("");
			setErrors({});
		}
	}, [isOpen]);

	const validate = (): boolean => {
		const newErrors: Record<string, string> = {};
		if (!name.trim()) newErrors.name = "Tournament name is required";
		const teams = parseInt(maxTeams);
		if (isNaN(teams) || teams < 4 || teams > 32) {
			newErrors.maxTeams = "Must be between 4 and 32";
		}
		if (endDate && startDate && new Date(endDate) < new Date(startDate)) {
			newErrors.endDate = "End date must be after start date";
		}
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async () => {
		if (!validate()) return;

		const request: CreateTournamentRequest = {
			name: name.trim(),
			description: description.trim() || undefined,
			maxTeams: parseInt(maxTeams),
			visibility: visibility as "Public" | "Private",
			defaultScoringFormat: scoringFormat,
			startDate: startDate ? new Date(startDate) : undefined,
			endDate: endDate ? new Date(endDate) : undefined,
			registrationDeadline: registrationDeadline
				? new Date(registrationDeadline)
				: undefined,
			registrationFee: registrationFee ? parseFloat(registrationFee) : undefined,
			minRosterSize: minRosterSize ? parseInt(minRosterSize) : undefined,
			maxRosterSize: maxRosterSize ? parseInt(maxRosterSize) : undefined,
			contextId: contextId,
		};

		try {
			const created = await createTournament.mutateAsync(request);
			onClose();
			router.push(`/tournament/${created.id}`);
		} catch (error) {
			console.error("Failed to create tournament:", error);
		}
	};

	const isLoading = createTournament.isPending;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Create Tournament"
			description="Set up a new tournament for your community"
			size="lg"
			isLoading={isLoading}
		>
			<div className="space-y-6">
				{/* Basic Info */}
				<Input
					label="Tournament Name"
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="e.g., Winter Cup 2026"
					required
					leftIcon={<Trophy size={16} />}
					error={errors.name}
				/>

				<TextArea
					label="Description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Describe the tournament format, prizes, etc."
					maxLength={1000}
					showCharCount
					minRows={3}
					optional
				/>

				{/* Configuration */}
				<div className="grid grid-cols-2 gap-4">
					<Input
						label="Max Teams"
						type="number"
						value={maxTeams}
						onChange={(e) => setMaxTeams(e.target.value)}
						min={4}
						max={32}
						required
						error={errors.maxTeams}
					/>
					<Select
						label="Visibility"
						value={visibility}
						onChange={(value) => setVisibility(value)}
						options={VISIBILITY_OPTIONS}
					/>
				</div>

				<Select
					label="Scoring Format"
					value={scoringFormat}
					onChange={(value) => setScoringFormat(value as ScoringFormat)}
					options={SCORING_OPTIONS}
				/>

				{/* Dates */}
				<div className="grid grid-cols-2 gap-4">
					<Input
						label="Start Date"
						type="date"
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						optional
					/>
					<Input
						label="End Date"
						type="date"
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						optional
						error={errors.endDate}
					/>
				</div>

				<Input
					label="Registration Deadline"
					type="date"
					value={registrationDeadline}
					onChange={(e) => setRegistrationDeadline(e.target.value)}
					optional
				/>

				{/* Optional Fields */}
				<div className="grid grid-cols-3 gap-4">
					<Input
						label="Entry Fee"
						type="number"
						value={registrationFee}
						onChange={(e) => setRegistrationFee(e.target.value)}
						placeholder="0.00"
						min={0}
						step="0.01"
						optional
					/>
					<Input
						label="Min Roster"
						type="number"
						value={minRosterSize}
						onChange={(e) => setMinRosterSize(e.target.value)}
						placeholder="6"
						min={1}
						optional
					/>
					<Input
						label="Max Roster"
						type="number"
						value={maxRosterSize}
						onChange={(e) => setMaxRosterSize(e.target.value)}
						placeholder="14"
						min={1}
						optional
					/>
				</div>

				{/* Actions */}
				<div className="pt-4 border-t border-border flex items-center justify-end gap-3">
					<Button
						type="button"
						variant="ghost"
						color="neutral"
						onClick={onClose}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						type="button"
						onClick={handleSubmit}
						disabled={isLoading}
						loading={isLoading}
					>
						{isLoading ? "Creating..." : "Create Tournament"}
					</Button>
				</div>
			</div>
		</Modal>
	);
}
