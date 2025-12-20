import { ResizableContainer } from "@/components";

const SkeletonPulse = ({ className }: { className?: string }) => (
	<div className={`animate-pulse bg-white/5 rounded-md ${className}`} />
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
	<div className="flex flex-col h-full bg-background/50 backdrop-blur-xl border border-white/5">
		{/* Header */}
		<div className="h-16 border-b border-white/10 flex items-center px-6 gap-3 shrink-0">
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
		<div className="p-4 border-t border-white/5 shrink-0">
			<SkeletonPulse className="h-14 w-full rounded-full" />
		</div>
	</div>
);

const MessagesPageSkeleton = () => {
	return (
		<div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl">
			<ResizableContainer
				leftPanel={
					<div className="rounded-2xl h-full min-h-0 bg-background/50 backdrop-blur-xl border border-white/5">
						{/* Search Header */}
						<div className="p-4 flex flex-col gap-4">
							<div className="flex justify-between items-center px-2">
								<SkeletonPulse className="h-8 w-24 rounded" />
								<SkeletonPulse className="h-8 w-8 rounded-full" />
							</div>
							<SkeletonPulse className="h-10 w-full rounded-xl" />
						</div>
						
						{/* Chat List */}
						<div className="flex flex-col gap-1 overflow-hidden">
							{Array.from({ length: 8 }).map((_, i) => (
								<ChatListItemSkeleton key={i} />
							))}
						</div>
					</div>
				}
				rightPanel={<ChatWindowSkeleton />}
			/>
		</div>
	);
};

export default MessagesPageSkeleton;
