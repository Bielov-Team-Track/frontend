export default function EventsTabLoading() {
	return (
		<div className="space-y-4">
			{/* Header skeleton */}
			<div className="flex items-center justify-between">
				<div className="h-8 w-32 bg-hover rounded-lg animate-pulse" />
				<div className="h-10 w-36 bg-hover rounded-lg animate-pulse" />
			</div>

			{/* Events list skeleton */}
			<div className="space-y-3">
				{[1, 2, 3].map((i) => (
					<div key={i} className="p-4 rounded-xl bg-surface border border-border">
						<div className="flex items-center gap-4">
							<div className="w-16 h-16 rounded-lg bg-hover animate-pulse" />
							<div className="flex-1 space-y-2">
								<div className="h-5 w-48 bg-hover rounded animate-pulse" />
								<div className="h-4 w-32 bg-hover rounded animate-pulse" />
							</div>
							<div className="h-8 w-20 bg-hover rounded-lg animate-pulse" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
