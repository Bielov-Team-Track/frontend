import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Input, Dropdown } from "@/components/ui";
import { CreateOrUpdateCoachProfileDto, SkillLevel, CreateQualificationDto } from "@/lib/models/Profile";
import { Clock, X, Award } from "lucide-react";

const schema = yup.object().shape({
	yearsOfExperience: yup
		.number()
		.nullable()
		.transform((v, o) => (o === "" ? null : v))
		.min(0, "Experience must be positive")
        .required("Years of experience is required"),
    highestLevelCoached: yup.string().nullable().optional(),
});

type FormData = {
    yearsOfExperience: number | null;
    highestLevelCoached?: string | null;
};

// Maps for skill level conversion
const skillLevelStringToEnum: Record<string, SkillLevel> = {
	"Beginner": SkillLevel.Beginner,
	"Intermediate": SkillLevel.Intermediate,
	"Advanced": SkillLevel.Advanced,
	"National": SkillLevel.National,
	"Professional": SkillLevel.Professional,
};

const skillLevelEnumToString: Record<SkillLevel, string> = {
	[SkillLevel.Beginner]: "Beginner",
	[SkillLevel.Intermediate]: "Intermediate",
	[SkillLevel.Advanced]: "Advanced",
	[SkillLevel.National]: "National",
	[SkillLevel.Professional]: "Professional",
};

type Props = {
	defaultValues?: Partial<CreateOrUpdateCoachProfileDto>;
	onNext: (data: CreateOrUpdateCoachProfileDto) => void;
    formId: string;
};

type Qualification = {
    id: string;
    name: string;
    year: number;
};

const CoachInfoStep = ({ defaultValues, onNext, formId }: Props) => {
    // Parse initial qualifications from backend format
    const initialQualifications: Qualification[] = defaultValues?.qualifications?.map((qual, index) => ({
        id: index.toString(),
        name: qual.name,
        year: qual.year
    })) || [];

    const [qualifications, setQualifications] = useState<Qualification[]>(initialQualifications);
    const [qualName, setQualName] = useState("");
    const [qualYear, setQualYear] = useState<string | null>(null);
    const [addQualError, setAddQualError] = useState<string | null>(null);

	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		resolver: yupResolver(schema) as any,
		defaultValues: {
			yearsOfExperience: defaultValues?.yearsOfExperience ?? null,
            highestLevelCoached: defaultValues?.highestLevelCoached !== undefined && defaultValues?.highestLevelCoached !== null
                ? skillLevelEnumToString[defaultValues.highestLevelCoached]
                : "",
		},
	});

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 70 }, (_, i) => {
        const year = currentYear - i;
        return { value: year.toString(), label: year.toString() };
    });

    const skillLevels = [
        { value: "Beginner", label: "Beginner" },
        { value: "Intermediate", label: "Intermediate" },
        { value: "Advanced", label: "Advanced" },
        { value: "National", label: "National" },
        { value: "Professional", label: "Professional" },
    ];

    const handleAddQualification = () => {
        if (!qualName.trim()) {
            setAddQualError("Qualification name is required");
            return;
        }
        if (!qualYear) {
            setAddQualError("Year is required");
            return;
        }

        const newQual: Qualification = {
            id: Date.now().toString(),
            name: qualName.trim(),
            year: parseInt(qualYear),
        };

        setQualifications([...qualifications, newQual]);
        setQualName("");
        setQualYear(null);
        setAddQualError(null);
    };

    const handleRemoveQualification = (id: string) => {
        setQualifications(qualifications.filter(q => q.id !== id));
    };

	const onSubmit = (data: FormData) => {
        // Convert form data to API format
        const apiQualifications: CreateQualificationDto[] = qualifications.map(q => ({
            name: q.name,
            year: q.year
        }));

		onNext({
			yearsOfExperience: data.yearsOfExperience,
            highestLevelCoached: data.highestLevelCoached
                ? skillLevelStringToEnum[data.highestLevelCoached]
                : undefined,
			qualifications: apiQualifications,
		});
	};

	return (
		<form
            id={formId}
			onSubmit={handleSubmit(onSubmit)}
			className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
		>
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-semibold text-white">Coach Profile</h2>
                <p className="text-sm text-muted">Share your coaching experience and certifications.</p>
            </div>

			<div className="flex flex-col gap-6">
				<Controller
					name="yearsOfExperience"
					control={control}
					render={({ field }) => (
						<Input
							{...field}
							type="number"
							label="Years of Experience"
							placeholder="e.g. 5"
							leftIcon={<Clock />}
							error={errors.yearsOfExperience?.message}
                            required
                            value={field.value ?? ""}
						/>
					)}
				/>
                
                <Controller
					name="highestLevelCoached"
					control={control}
					render={({ field }) => (
						<Dropdown
							{...field}
							label="Highest Level Coached"
                            placeholder="Select level"
							options={skillLevels}
							value={field.value || ""}
							onChange={(val) => field.onChange(val)}
                            required={false}
                            helperText="Optional"
						/>
					)}
				/>

                <div className="flex flex-col gap-3">
                    <label className="block text-sm font-medium text-white">Qualifications <span className="text-muted font-normal text-xs ml-1">(optional)</span></label>

                    {/* Add New Qualification Form */}
                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px] gap-3">
                             <Input
                                value={qualName}
                                onChange={(e) => {
                                    setQualName(e.target.value);
                                    if (addQualError) setAddQualError(null);
                                }}
                                placeholder="Qualification Name"
                                fullWidth
                            />
                            <Dropdown
                                placeholder="Year"
                                options={yearOptions}
                                value={qualYear}
                                onChange={(val) => {
                                    setQualYear(val as string);
                                    if (addQualError) setAddQualError(null);
                                }}
                                required
                            />
                        </div>
                        {addQualError && <p className="text-red-400 text-xs">{addQualError}</p>}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleAddQualification}
                            className="self-end px-6"
                        >
                            Add
                        </Button>
                    </div>

                    {/* List of Added Qualifications */}
                    {qualifications.length > 0 && (
                        <div className="flex flex-col gap-2 mt-2">
                            {qualifications.map((qual) => (
                                <div key={qual.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                            <Award size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-white">{qual.name}</span>
                                            <span className="text-xs text-muted">Acquired in {qual.year}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveQualification(qual.id)}
                                        className="text-muted hover:text-red-400 transition-colors p-2"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
			</div>
		</form>
	);
};

export default CoachInfoStep;
