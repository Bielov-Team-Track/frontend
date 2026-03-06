interface SideCardProps {
	title: string;
	children: React.ReactNode;
}

export function SideCard({ title, children }: SideCardProps) {
	return (
		<div className="bg-surface border border-border rounded-2xl p-4">
			<h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title}</h3>
			{children}
		</div>
	);
}
