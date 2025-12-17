import { Dropdown, MultiSelectPills, Slider } from "@/components/ui";
import {
	CreateOrUpdatePlayerProfileDto,
	DominantHand,
	SkillLevel,
	VolleyballPosition,
} from "@/lib/models/Profile";
import { yupResolver } from "@hookform/resolvers/yup";
import { Hand, Star } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import * as yup from "yup";

// Form data type (uses strings for dropdowns)
interface PlayerFormData {
	heightCm: number | null;
	verticalJumpCm: number | null;
	dominantHand: DominantHand;
	preferredPosition: string;
	secondaryPositions: string[];
	highestLevelPlayed: string;
}

const schema = yup.object().shape({
	heightCm: yup
		.number()
		.nullable()
		.transform((v, o) => (o === "" ? null : v))
		.min(120, "Height must be at least 120cm")
		.max(220, "Height must be under 220cm")
		.required("Height is required"),
	verticalJumpCm: yup
		.number()
		.nullable()
		.transform((v, o) => (o === "" ? null : v))
		.min(0, "Jump must be positive")
		.max(200, "Jump must be realistic")
		.optional(),
	dominantHand: yup
		.mixed<DominantHand>()
		.oneOf(
			Object.values(DominantHand).filter(
				(v) => typeof v === "number"
			) as DominantHand[]
		)
		.required("Dominant hand is required"),
	preferredPosition: yup.string().required("Preferred position is required"),
	secondaryPositions: yup.array().of(yup.string().required()).optional(),
	highestLevelPlayed: yup.string().nullable().optional(),
});

// Maps for converting between string labels and enum values
const positionStringToEnum: Record<string, VolleyballPosition> = {
	Setter: VolleyballPosition.Setter,
	"Outside Hitter": VolleyballPosition.OutsideHitter,
	"Opposite Hitter": VolleyballPosition.OppositeHitter,
	"Middle Blocker": VolleyballPosition.MiddleBlocker,
	Libero: VolleyballPosition.Libero,
};

const positionEnumToString: Record<VolleyballPosition, string> = {
	[VolleyballPosition.Setter]: "Setter",
	[VolleyballPosition.OutsideHitter]: "Outside Hitter",
	[VolleyballPosition.OppositeHitter]: "Opposite Hitter",
	[VolleyballPosition.MiddleBlocker]: "Middle Blocker",
	[VolleyballPosition.Libero]: "Libero",
};

const skillLevelStringToEnum: Record<string, SkillLevel> = {
	Beginner: SkillLevel.Beginner,
	Intermediate: SkillLevel.Intermediate,
	Advanced: SkillLevel.Advanced,
	National: SkillLevel.National,
	Professional: SkillLevel.Professional,
};

const skillLevelEnumToString: Record<SkillLevel, string> = {
	[SkillLevel.Beginner]: "Beginner",
	[SkillLevel.Intermediate]: "Intermediate",
	[SkillLevel.Advanced]: "Advanced",
	[SkillLevel.National]: "National",
	[SkillLevel.Professional]: "Professional",
};

type Props = {
	defaultValues?: Partial<CreateOrUpdatePlayerProfileDto>;
	onNext: (data: CreateOrUpdatePlayerProfileDto) => void;
	formId: string;
};

const PlayerInfoStep = ({ defaultValues, onNext, formId }: Props) => {
	const {
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<PlayerFormData>({
		resolver: yupResolver(schema) as any,
		defaultValues: {
			heightCm: defaultValues?.heightCm ?? null,
			verticalJumpCm: defaultValues?.verticalJumpCm ?? null,
			dominantHand: defaultValues?.dominantHand ?? DominantHand.Right,
			preferredPosition:
				defaultValues?.preferredPosition !== undefined &&
				defaultValues?.preferredPosition !== null
					? positionEnumToString[defaultValues.preferredPosition]
					: "",
			secondaryPositions:
				defaultValues?.secondaryPositions?.map(
					(p) => positionEnumToString[p]
				) || [],
			highestLevelPlayed:
				defaultValues?.highestLevelPlayed !== undefined &&
				defaultValues?.highestLevelPlayed !== null
					? skillLevelEnumToString[defaultValues.highestLevelPlayed]
					: "",
		},
	});

	const selectedPreferredPosition = watch("preferredPosition");

	const dominantHandOptions = [
		{ value: DominantHand.Right, label: "Right" },
		{ value: DominantHand.Left, label: "Left" },
		{ value: DominantHand.Ambidextrous, label: "Ambidextrous" },
	];

	const positionOptions = [
		{ value: "Setter", label: "Setter" },
		{ value: "Outside Hitter", label: "Outside Hitter" },
		{ value: "Opposite Hitter", label: "Opposite Hitter" },
		{ value: "Middle Blocker", label: "Middle Blocker" },
		{ value: "Libero", label: "Libero" },
		{ value: "No preferred position", label: "No preferred position" },
	];

	const skillLevels = [
		{ value: "Beginner", label: "Beginner" },
		{ value: "Intermediate", label: "Intermediate" },
		{ value: "Advanced", label: "Advanced" },
		{ value: "National", label: "National" },
		{ value: "Professional", label: "Professional" },
	];

	const secondaryPositionOptions = positionOptions.filter(
		(p) =>
			p.value !== "No preferred position" &&
			p.value !== selectedPreferredPosition
	);

	const cmToFeetAndInches = (cm: number) => {
		const totalInches = cm / 2.54;
		const feet = Math.floor(totalInches / 12);
		const inches = Math.round(totalInches % 12);
		return `${feet}' ${inches}"`;
	};

	const cmToInches = (cm: number) => {
		return `${Math.round(cm / 2.54)}"`;
	};

	const onSubmit = (data: PlayerFormData) => {
		// Convert form data to API DTO format
		const apiData: CreateOrUpdatePlayerProfileDto = {
			heightCm: data.heightCm,
			verticalJumpCm: data.verticalJumpCm,
			dominantHand: data.dominantHand,
			preferredPosition:
				data.preferredPosition &&
				data.preferredPosition !== "No preferred position"
					? positionStringToEnum[data.preferredPosition]
					: undefined,
			secondaryPositions:
				data.secondaryPositions
					?.filter((p) => p in positionStringToEnum)
					.map((p) => positionStringToEnum[p]) || [],
			highestLevelPlayed: data.highestLevelPlayed
				? skillLevelStringToEnum[data.highestLevelPlayed]
				: undefined,
		};
		onNext(apiData);
	};

	return (
		<form
			id={formId}
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<div className="flex flex-col gap-2">
				<h2 className="text-xl font-semibold text-white">
					Player Profile
				</h2>
				<p className="text-sm text-muted">
					Tell us about your physical stats and preferences.
				</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Controller
					name="heightCm"
					control={control}
					render={({ field: { value, onChange, ...field } }) => (
						<Slider
							{...field}
							value={value ?? 170}
							onChange={(e) => onChange(Number(e.target.value))}
							min={120}
							max={220}
							step={1}
							label="Height"
							color={"accent"}
							error={errors.heightCm?.message}
							required
							formatValue={(v) => `${v} cm`}
							alternativeValues={[cmToFeetAndInches]}
						/>
					)}
				/>

				<Controller
					name="verticalJumpCm"
					control={control}
					render={({ field: { value, onChange, ...field } }) => (
						<Slider
							{...field}
							value={value ?? 40}
							onChange={(e) => onChange(Number(e.target.value))}
							min={0}
							max={100}
							step={1}
							label="Vertical Jump"
							variant={"default"}
							color={"accent"}
							error={errors.verticalJumpCm?.message}
							optional
							formatValue={(v) => `${v} cm`}
							alternativeValues={[cmToInches]}
						/>
					)}
				/>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Controller
					name="dominantHand"
					control={control}
					render={({ field }) => (
						<Dropdown
							{...field}
							label="Dominant Hand"
							options={dominantHandOptions}
							error={errors.dominantHand?.message}
							leftIcon={<Hand />}
							value={field.value}
							onChange={(val) => field.onChange(Number(val))}
							required
						/>
					)}
				/>

				<Controller
					name="preferredPosition"
					control={control}
					render={({ field }) => (
						<Dropdown
							{...field}
							label="Preferred Position"
							placeholder="Select position"
							options={positionOptions}
							leftIcon={<Star />}
							error={errors.preferredPosition?.message}
							value={field.value || ""}
							required
						/>
					)}
				/>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Controller
					name="highestLevelPlayed"
					control={control}
					render={({ field }) => (
						<Dropdown
							{...field}
							label="Highest Level Played"
							placeholder="Select level"
							options={skillLevels}
							value={field.value || ""}
							onChange={(val) => field.onChange(val)}
							required={false}
							helperText="Optional"
						/>
					)}
				/>
			</div>

			<div>
				<Controller
					name="secondaryPositions"
					control={control}
					render={({ field }) => (
						<MultiSelectPills
							label="Secondary Positions"
							options={secondaryPositionOptions}
							selectedItems={field.value || []}
							onSelectedItemsChange={(items) =>
								field.onChange(items)
							}
							optional
						/>
					)}
				/>
			</div>
		</form>
	);
};

export default PlayerInfoStep;
