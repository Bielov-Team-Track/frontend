"use client";

import { Button, Checkbox, Input, Select } from "@/components/ui";
import { CreatePollRequest, PollResultsVisibility } from "@/lib/models/Post";
import { Clock, GripVertical, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

interface PollCreatorProps {
	onSave: (poll: CreatePollRequest) => void;
	onCancel: () => void;
}

interface PollOptionInput {
	id: string;
	content: string;
	imageUrl?: string;
}

const PollResultsOptions = [
	{ label: "Always", value: "always" },
	{ label: "After voting", value: "afterVote" },
	{ label: "After poll closes", value: "afterClose" },
];

export default function PollCreator({ onSave, onCancel }: PollCreatorProps) {
	const [question, setQuestion] = useState("");
	const [options, setOptions] = useState<PollOptionInput[]>([
		{ id: "1", content: "" },
		{ id: "2", content: "" },
	]);
	const [allowMultipleChoices, setAllowMultipleChoices] = useState(false);
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [showResults, setShowResults] = useState<PollResultsVisibility>("afterVote");
	const [closesAt, setClosesAt] = useState<string>("");

	const addOption = () => {
		if (options.length >= 10) return;
		setOptions([...options, { id: Date.now().toString(), content: "" }]);
	};

	const removeOption = (id: string) => {
		if (options.length <= 2) return;
		setOptions(options.filter((opt) => opt.id !== id));
	};

	const updateOption = (id: string, content: string) => {
		setOptions(options.map((opt) => (opt.id === id ? { ...opt, content } : opt)));
	};

	const handleSave = () => {
		const validOptions = options.filter((opt) => opt.content.trim());
		if (!question.trim() || validOptions.length < 2) return;

		onSave({
			question: question.trim(),
			allowMultipleChoices,
			isAnonymous,
			showResults,
			closesAt: closesAt || undefined,
			options: validOptions.map((opt) => ({
				content: opt.content.trim(),
				imageUrl: opt.imageUrl,
			})),
		});
	};

	const isValid = question.trim() && options.filter((opt) => opt.content.trim()).length >= 2;

	return (
		<div className="rounded-xl border border-border bg-surface p-4 space-y-4">
			{/* Header */}
			<div className="flex items-center justify-between">
				<h4 className="text-sm font-medium text-white">Create Poll</h4>
				<button onClick={onCancel} className="p-1 rounded hover:bg-active text-muted-foreground">
					<X size={16} />
				</button>
			</div>

			{/* Question */}
			<input
				type="text"
				value={question}
				onChange={(e) => setQuestion(e.target.value)}
				placeholder="Ask a question..."
				className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
			/>

			{/* Options */}
			<div className="space-y-2">
				{options.map((option, index) => (
					<div key={option.id} className="flex items-center gap-2">
						<GripVertical size={16} className="text-muted-foreground cursor-grab shrink-0" />
						<input
							type="text"
							value={option.content}
							onChange={(e) => updateOption(option.id, e.target.value)}
							placeholder={`Option ${index + 1}`}
							className="flex-1 bg-surface border border-border rounded-lg px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary"
						/>
						{options.length > 2 && (
							<button
								onClick={() => removeOption(option.id)}
								className="p-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
								<Trash2 size={14} />
							</button>
						)}
					</div>
				))}

				{options.length < 10 && (
					<button onClick={addOption} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors">
						<Plus size={14} />
						Add option
					</button>
				)}
			</div>

			{/* Settings */}
			<div className="space-y-3 pt-2 border-t border-border">
				<div className="flex gap-4">
					<Checkbox label="Allow multiple choices" checked={allowMultipleChoices} onChange={(value) => setAllowMultipleChoices(value)} />

					<Checkbox label="Anonymous voting" checked={isAnonymous} onChange={(value) => setIsAnonymous(value)} />
				</div>

				<div className="flex gap-4">
					<div className="flex items-center gap-3">
						<Select
							leftIcon={<Clock />}
							inlineLabel="Show results:"
							value={showResults}
							options={PollResultsOptions}
							onChange={(value) => setShowResults(value as PollResultsVisibility)}
						/>
					</div>

					<div className="flex items-center gap-3">
						<Input
							leftIcon={<Clock />}
							inlineLabel="Closes at:"
							title="Closes at:"
							type="datetime-local"
							value={closesAt}
							onChange={(e) => setClosesAt(e.target.value)}
						/>
					</div>
				</div>
			</div>

			{/* Actions */}
			<div className="flex justify-end gap-2 pt-2">
				<Button variant="ghost" size="sm" onClick={onCancel}>
					Cancel
				</Button>
				<Button size="sm" onClick={handleSave} disabled={!isValid}>
					Add Poll
				</Button>
			</div>
		</div>
	);
}
