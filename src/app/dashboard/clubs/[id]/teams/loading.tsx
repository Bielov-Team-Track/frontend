export default function TeamsTabLoading() {
	return (
		<div className="space-y-4">
			{/* Header skeleton */}
			<div className="flex items-center justify-between">
				<div className="h-8 w-24 bg-white/10 rounded-lg animate-pulse" />
				<div className="h-10 w-32 bg-white/10 rounded-lg animate-pulse" />
			</div>

			{/* Teams grid skeleton */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{[1, 2, 3].map((i) => (
					<div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10">
						<div className="flex items-center gap-3 mb-3">
							<div className="w-12 h-12 rounded-full bg-white/10 animate-pulse" />
							<div className="flex-1 space-y-2">
								<div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
								<div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
							</div>
						</div>
						<div className="flex gap-2">
							{[1, 2, 3, 4].map((j) => (
								<div key={j} className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
