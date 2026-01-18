import { Avatar, Button } from "@/components/ui";
import { Club, Group, Team } from "@/lib/models/Club";
import { ChevronRight, RefreshCcw, Trash2 } from "lucide-react";

export type ContextIndicatorProps = {
	context?: Club | Group | Team | null;
	onClear?: () => void;
	onChange?: () => void;
};

export function ContextIndicator({ context, onClear, onChange }: ContextIndicatorProps) {
	if (!context) {
		return null;
	}

	const isClub = !("clubId" in context);
	const club = isClub ? context : context.club;
	const subContext = isClub ? null : context;

	return (
		<div className="mt-10 flex flex-col gap-4 pt-6 border-t border-white/10">
			<p className="text-sm text-muted">You are creating this event for:</p>
			<div className="flex items-center gap-2">
				{club && <Avatar src={club.logoUrl} alt={club.name} variant="club" size="sm" />}
				<span className="font-medium text-white">{club?.name ?? "Unknown Club"}</span>

				{subContext && (
					<>
						<ChevronRight className="w-4 h-4 text-muted" />
						<div className="flex items-center gap-2">
							<Avatar src={"logoUrl" in subContext ? subContext.logoUrl : undefined} name={subContext.name} color={subContext.color} size="sm" />
							<span className="text-white">{subContext.name}</span>
						</div>
					</>
				)}

				<div className="ml-auto flex gap-1">
					{onChange && (
						<Button variant="ghost" size="icon" onClick={onChange}>
							<RefreshCcw className="w-4 h-4" />
						</Button>
					)}
					{onClear && (
						<Button variant="ghost" size="icon" onClick={onClear}>
							<Trash2 className="w-4 h-4" />
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
