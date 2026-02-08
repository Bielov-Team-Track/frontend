export default function SettingsLoading() {
	return (
		<div className="flex flex-col md:flex-row gap-8">
			{/* Sidebar skeleton (desktop) */}
			<nav className="hidden md:block w-56 shrink-0">
				<div className="sticky top-4 space-y-1">
					{[1, 2].map((i) => (
						<div key={i} className="h-10 w-full bg-hover rounded-lg animate-pulse" />
					))}
				</div>
			</nav>

			{/* Mobile tabs skeleton */}
			<div className="md:hidden flex gap-2 overflow-x-auto -mx-4 px-4 mb-6">
				{[1, 2].map((i) => (
					<div key={i} className="h-10 w-24 bg-hover rounded-lg animate-pulse shrink-0" />
				))}
			</div>

			{/* Content skeleton */}
			<div className="flex-1 min-w-0 space-y-6">
				<div className="space-y-2">
					<div className="h-8 w-48 bg-hover rounded-lg animate-pulse" />
				</div>
				<div className="rounded-2xl border border-border bg-surface p-6 space-y-4">
					<div className="h-5 w-32 bg-hover rounded animate-pulse" />
					<div className="space-y-3">
						<div className="h-10 w-full bg-hover rounded-lg animate-pulse" />
						<div className="h-10 w-full bg-hover rounded-lg animate-pulse" />
						<div className="h-24 w-full bg-hover rounded-lg animate-pulse" />
					</div>
				</div>
			</div>
		</div>
	);
}
