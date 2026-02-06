import { Badge } from "@/components/ui/badge";
import { ClubRole, TeamRole, GroupRole } from "@/lib/models/Club";

const roleColors: Record<string, string> = {
	// Club roles
	Owner: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
	HeadCoach: "bg-blue-500/10 text-blue-600 border-blue-500/20",
	Admin: "bg-purple-500/10 text-purple-600 border-purple-500/20",
	Treasurer: "bg-green-500/10 text-green-600 border-green-500/20",
	WelfareOfficer: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
	Coach: "bg-blue-500/10 text-blue-600 border-blue-500/20",
	Assistant: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
	Member: "bg-gray-500/10 text-gray-600 border-gray-500/20",
	// Team roles
	Manager: "bg-orange-500/10 text-orange-600 border-orange-500/20",
	Captain: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
	Player: "bg-gray-500/10 text-gray-600 border-gray-500/20",
	AssistantCoach: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
	// Group roles
	Helper: "bg-teal-500/10 text-teal-600 border-teal-500/20",
	Leader: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
};

function formatRoleLabel(role: string): string {
	// Convert "HeadCoach" to "Head Coach", "AssistantCoach" to "Assistant Coach"
	if (typeof role !== "string") return String(role);
	return role.replace(/([A-Z])/g, " $1").trim();
}

interface RoleBadgeProps {
	role: ClubRole | TeamRole | GroupRole | string;
	className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
	const roleStr = typeof role === "string" ? role : String(role);
	const colorClass = roleColors[roleStr] || "bg-muted text-muted-foreground";

	return (
		<Badge variant="outline" className={`${colorClass} ${className || ""}`}>
			{formatRoleLabel(roleStr)}
		</Badge>
	);
}

interface RoleBadgeListProps {
	roles: string[];
	emptyText?: string;
	className?: string;
}

export function RoleBadgeList({ roles, emptyText = "—", className }: RoleBadgeListProps) {
	// Filter out any invalid roles (non-strings, null, undefined)
	const validRoles = (roles || []).filter((role): role is string => typeof role === "string" && role.length > 0);

	if (validRoles.length === 0) {
		return <span className="text-muted-foreground">{emptyText}</span>;
	}

	return (
		<div className={`flex flex-wrap gap-1 ${className || ""}`}>
			{validRoles.map((role) => (
				<RoleBadge key={role} role={role} />
			))}
		</div>
	);
}
