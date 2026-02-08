export default function MembersTabLoading() {
	return (
		<div className="space-y-4">
			{/* Header skeleton */}
			<div className="flex items-center justify-between">
				<div className="h-8 w-28 bg-hover rounded-lg animate-pulse" />
				<div className="flex gap-2">
					<div className="h-10 w-32 bg-hover rounded-lg animate-pulse" />
					<div className="h-10 w-28 bg-hover rounded-lg animate-pulse" />
				</div>
			</div>

			{/* Search bar skeleton */}
			<div className="h-10 w-full max-w-sm bg-hover rounded-lg animate-pulse" />

			{/* Members list skeleton */}
			<div className="space-y-2">
				{[1, 2, 3, 4, 5].map((i) => (
					<div key={i} className="p-3 rounded-xl bg-surface border border-border flex items-center gap-3">
						<div className="w-10 h-10 rounded-full bg-hover animate-pulse" />
						<div className="flex-1 space-y-2">
							<div className="h-4 w-36 bg-hover rounded animate-pulse" />
							<div className="h-3 w-24 bg-hover rounded animate-pulse" />
						</div>
						<div className="h-6 w-16 bg-hover rounded-full animate-pulse" />
					</div>
				))}
			</div>
		</div>
	);
}
