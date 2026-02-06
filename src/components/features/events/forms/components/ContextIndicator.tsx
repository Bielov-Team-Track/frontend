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
		<div className="mt-6 sm:mt-10 flex flex-col gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-border">
			<p className="text-xs sm:text-sm text-muted">You are creating this event for:</p>
			<div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
				{club && <Avatar src={club.logoUrl} alt={club.name} variant="club" size="sm" />}
				<span className="font-medium text-white text-sm sm:text-base truncate max-w-[120px] sm:max-w-none">{club?.name ?? "Unknown Club"}</span>

				{subContext && (
					<>
						<ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted shrink-0" />
						<div className="flex items-center gap-1.5 sm:gap-2">
							<Avatar src={"logoUrl" in subContext ? subContext.logoUrl : undefined} name={subContext.name} color={subContext.color} size="sm" />
							<span className="text-white text-sm sm:text-base truncate max-w-[100px] sm:max-w-none">{subContext.name}</span>
						</div>
					</>
				)}

				<div className="ml-auto flex gap-0.5 sm:gap-1 shrink-0">
					{onChange && (
						<Button variant="ghost" size="icon" onClick={onChange}>
							<RefreshCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
						</Button>
					)}
					{onClear && (
						<Button variant="ghost" size="icon" onClick={onClear}>
							<Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
