export default function EventsTabLoading() {
	return (
		<div className="space-y-4">
			{/* Header skeleton */}
			<div className="flex items-center justify-between">
				<div className="h-8 w-32 bg-white/10 rounded-lg animate-pulse" />
				<div className="h-10 w-36 bg-white/10 rounded-lg animate-pulse" />
			</div>

			{/* Events list skeleton */}
			<div className="space-y-3">
				{[1, 2, 3].map((i) => (
					<div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
						<div className="flex items-center gap-4">
							<div className="w-16 h-16 rounded-lg bg-white/10 animate-pulse" />
							<div className="flex-1 space-y-2">
								<div className="h-5 w-48 bg-white/10 rounded animate-pulse" />
								<div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
							</div>
							<div className="h-8 w-20 bg-white/10 rounded-lg animate-pulse" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
