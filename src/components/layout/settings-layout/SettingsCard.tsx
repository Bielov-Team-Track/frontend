import { cn } from "@/lib/utils";

interface SettingsCardProps {
	title?: string;
	description?: string;
	children: React.ReactNode;
	danger?: boolean;
	className?: string;
}

export function SettingsCard({ title, description, children, danger, className }: SettingsCardProps) {
	return (
		<div
			className={cn(
				"rounded-2xl border p-6",
				danger ? "bg-red-500/5 border-red-500/20" : "bg-white/5 border-white/10",
				className
			)}>
			{(title || description) && (
				<div className="mb-4">
					{title && <h3 className={cn("text-lg font-bold", danger ? "text-red-400" : "text-white")}>{title}</h3>}
					{description && <p className="text-sm text-muted mt-1">{description}</p>}
				</div>
			)}
			<div className="space-y-4">{children}</div>
		</div>
	);
}
