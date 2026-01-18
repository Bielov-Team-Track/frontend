"use client";

import { useClosePoll, useRemovePollVote, useVotePoll } from "@/hooks/usePosts";
import { Poll } from "@/lib/models/Post";
import { formatDistanceToNow } from "date-fns";
import { BarChart3, Clock, Lock, X } from "lucide-react";
import { useState } from "react";
import PollOption from "./PollOption";

interface PollDisplayProps {
	poll: Poll;
	isAuthor?: boolean;
}

export default function PollDisplay({ poll, isAuthor = false }: PollDisplayProps) {
	const [selectedOptions, setSelectedOptions] = useState<string[]>(poll.myVotes);

	const voteMutation = useVotePoll();
	const removeVoteMutation = useRemovePollVote();
	const closePollMutation = useClosePoll();

	const hasVoted = poll.myVotes.length > 0;
	const canVote = !poll.isClosed && !hasVoted;
	const canSeeResults = poll.canSeeResults;

	const handleOptionSelect = (optionId: string) => {
		if (!canVote) return;

		if (poll.allowMultipleChoices) {
			setSelectedOptions((prev) => (prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]));
		} else {
			setSelectedOptions([optionId]);
		}
	};

	const handleVote = () => {
		if (selectedOptions.length === 0) return;
		voteMutation.mutate({ pollId: poll.id, optionIds: selectedOptions });
	};

	const handleRemoveVote = () => {
		removeVoteMutation.mutate(poll.id);
		setSelectedOptions([]);
	};

	const handleClosePoll = () => {
		if (!confirm("Close this poll? This cannot be undone.")) return;
		closePollMutation.mutate(poll.id);
	};

	const closesIn = poll.closesAt ? formatDistanceToNow(new Date(poll.closesAt), { addSuffix: true }) : null;

	return (
		<div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-4">
			{/* Header */}
			<div className="flex items-start justify-between gap-3">
				<div className="flex items-center gap-2">
					<BarChart3 size={18} className="text-primary shrink-0" />
					<h4 className="text-sm font-medium text-white">{poll.question}</h4>
				</div>
				{poll.isClosed && (
					<span className="flex items-center gap-1 text-xs text-muted-foreground bg-white/5 px-2 py-1 rounded">
						<Lock size={12} />
						Closed
					</span>
				)}
			</div>

			{/* Options */}
			<div className="space-y-2">
				{poll.options.map((option) => (
					<PollOption
						key={option.id}
						option={option}
						isSelected={selectedOptions.includes(option.id)}
						canVote={canVote}
						canSeeResults={canSeeResults}
						totalVotes={poll.totalVotes}
						allowMultiple={poll.allowMultipleChoices}
						onSelect={() => handleOptionSelect(option.id)}
					/>
				))}
			</div>

			{/* Actions */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3 text-xs text-muted-foreground">
					<span>
						{poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
					</span>
					{closesIn && !poll.isClosed && (
						<span className="flex items-center gap-1">
							<Clock size={12} />
							Closes {closesIn}
						</span>
					)}
					{poll.allowMultipleChoices && <span>Multiple choices allowed</span>}
					{poll.isAnonymous && <span>Anonymous</span>}
				</div>

				<div className="flex items-center gap-2">
					{canVote && selectedOptions.length > 0 && (
						<button
							onClick={handleVote}
							disabled={voteMutation.isPending}
							className="px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
							{voteMutation.isPending ? "Voting..." : "Vote"}
						</button>
					)}
					{hasVoted && !poll.isClosed && (
						<button
							onClick={handleRemoveVote}
							disabled={removeVoteMutation.isPending}
							className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-white hover:bg-white/10 transition-colors">
							<X size={14} />
							Remove vote
						</button>
					)}
					{isAuthor && !poll.isClosed && (
						<button
							onClick={handleClosePoll}
							disabled={closePollMutation.isPending}
							className="px-3 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
							Close poll
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
