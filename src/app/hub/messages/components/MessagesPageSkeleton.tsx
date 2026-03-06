const SkeletonPulse = ({ className }: { className?: string }) => (
	<div className={`animate-pulse bg-surface rounded-md ${className}`} />
);

const ChatListItemSkeleton = () => (
	<div className="flex gap-3 p-3 mx-2 rounded-xl border border-transparent">
		<SkeletonPulse className="w-12 h-12 rounded-full shrink-0" />
		<div className="flex flex-col gap-2 flex-1 min-w-0 justify-center">
			<div className="flex justify-between items-center w-full">
				<SkeletonPulse className="h-4 w-24 rounded" />
				<SkeletonPulse className="h-3 w-10 rounded" />
			</div>
			<SkeletonPulse className="h-3 w-2/3 rounded" />
		</div>
	</div>
);

const ChatWindowSkeleton = () => (
	<div className="flex flex-col h-full bg-background/50 backdrop-blur-xl border-l-0 md:border-l border-border">
		{/* Header */}
		<div className="h-16 border-b border-border flex items-center px-6 gap-3 shrink-0">
			<SkeletonPulse className="w-10 h-10 rounded-full" />
			<div className="flex flex-col gap-1.5">
				<SkeletonPulse className="h-4 w-32 rounded" />
				<SkeletonPulse className="h-3 w-20 rounded" />
			</div>
		</div>

		{/* Messages Area */}
		<div className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
			{/* Left message */}
			<div className="flex gap-3 max-w-[70%]">
				<SkeletonPulse className="w-8 h-8 rounded-full shrink-0 mt-auto" />
				<div className="flex flex-col gap-1 w-full">
					<SkeletonPulse className="h-16 w-full rounded-2xl rounded-bl-none" />
					<SkeletonPulse className="h-3 w-12 rounded opacity-50" />
				</div>
			</div>

			{/* Right message */}
			<div className="flex gap-3 max-w-[70%] ml-auto flex-row-reverse">
				<SkeletonPulse className="w-8 h-8 rounded-full shrink-0 mt-auto" />
				<div className="flex flex-col gap-1 w-full items-end">
					<SkeletonPulse className="h-10 w-3/4 rounded-2xl rounded-br-none" />
					<SkeletonPulse className="h-3 w-12 rounded opacity-50" />
				</div>
			</div>

			{/* Left message */}
			<div className="flex gap-3 max-w-[70%]">
				<SkeletonPulse className="w-8 h-8 rounded-full shrink-0 mt-auto" />
				<div className="flex flex-col gap-1 w-full">
					<SkeletonPulse className="h-24 w-full rounded-2xl rounded-bl-none" />
					<SkeletonPulse className="h-3 w-12 rounded opacity-50" />
				</div>
			</div>

			{/* Right message */}
			<div className="flex gap-3 max-w-[60%] ml-auto flex-row-reverse">
				<SkeletonPulse className="w-8 h-8 rounded-full shrink-0 mt-auto" />
				<div className="flex flex-col gap-1 w-full items-end">
					<SkeletonPulse className="h-8 w-1/2 rounded-2xl rounded-br-none" />
					<SkeletonPulse className="h-3 w-12 rounded opacity-50" />
				</div>
			</div>
		</div>

		{/* Footer/Input */}
		<div className="p-4 border-t border-border shrink-0">
			<SkeletonPulse className="h-14 w-full rounded-full" />
		</div>
	</div>
);

const MessagesPageSkeleton = () => {
	return (
		<div className="relative h-[calc(100dvh-7rem)] w-full rounded-2xl overflow-hidden shadow-md bg-surface">
			<div className="flex h-full min-h-0">
				{/* Left Panel - Chat List */}
				<div className="h-full min-h-0 shrink-0 w-full md:w-[384px]">
					<div className="flex flex-col h-full bg-background/50 backdrop-blur-xl border border-border overflow-hidden shadow-2xl">
						{/* Header */}
						<div className="p-4 border-b border-border flex flex-col justify-between gap-4">
							<div className="flex justify-between items-center px-1">
								<SkeletonPulse className="h-7 w-24 rounded" />
								<SkeletonPulse className="h-8 w-8 rounded-full" />
							</div>
							<SkeletonPulse className="h-10 w-full rounded-xl" />
						</div>

						{/* Chat List */}
						<div className="overflow-hidden flex-1 p-2 space-y-1">
							{Array.from({ length: 8 }).map((_, i) => (
								<ChatListItemSkeleton key={i} />
							))}
						</div>
					</div>
				</div>

				{/* Resize Handle - desktop only */}
				<div className="hidden md:flex items-center justify-center w-1.5 shrink-0">
					<div className="w-px h-full bg-border" />
				</div>

				{/* Right Panel - Chat Window (hidden on mobile when no chat selected) */}
				<div className="hidden md:flex md:flex-1 h-full min-h-0 min-w-0">
					<div className="h-full min-h-0 flex flex-col w-full">
						<ChatWindowSkeleton />
					</div>
				</div>
			</div>
		</div>
	);
};

export default MessagesPageSkeleton;
