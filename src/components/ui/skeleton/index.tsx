import { cn } from "@/lib/utils";

interface SkeletonProps {
	className?: string;
	width?: string | number;
	height?: string | number;
	rounded?: "sm" | "md" | "lg" | "full" | "none";
}

const Skeleton = ({ className = "", width, height, rounded = "md" }: SkeletonProps) => {
	const roundedClasses = {
		none: "",
		sm: "rounded-sm",
		md: "rounded-md",
		lg: "rounded-lg",
		full: "rounded-full",
	};

	const style = {
		...(width && { width }),
		...(height && { height }),
	};

	return <div className={cn("skeleton", roundedClasses[rounded], className)} style={style} />;
};

// Specialized skeleton components
export const SkeletonText = ({ lines = 1, className = "", lastLineWidth = "75%" }: { lines?: number; className?: string; lastLineWidth?: string }) => (
	<div className={cn("space-y-2", className)}>
		{Array.from({ length: lines }).map((_, index) => (
			<div key={index} className="skeleton h-4" style={{ width: index === lines - 1 ? lastLineWidth : "100%" }} />
		))}
	</div>
);

export const SkeletonAvatar = ({ size = "md", className = "" }: { size?: "sm" | "md" | "lg"; className?: string }) => {
	const sizes = {
		sm: "w-8 h-8",
		md: "w-12 h-12",
		lg: "w-16 h-16",
	};

	return <div className={cn("skeleton rounded-full", sizes[size], className)} />;
};

export const SkeletonCard = ({ className = "", hasImage = true, hasAvatar = false }: { className?: string; hasImage?: boolean; hasAvatar?: boolean }) => (
	<div className={cn("rounded-lg p-4", className)}>
		<div className="flex gap-4">
			{hasImage && <div className="skeleton aspect-square h-28 shrink-0 rounded-md" />}
			<div className="flex-1 space-y-3">
				<div className="flex items-center gap-2">
					{hasAvatar && <SkeletonAvatar size="sm" />}
					<div className="skeleton h-5 w-3/5" />
				</div>
				<div className="space-y-2">
					<div className="flex items-center gap-2">
						<div className="skeleton w-4 h-4 rounded-sm" />
						<div className="skeleton h-4 w-2/5" />
					</div>
					<div className="flex items-center gap-2">
						<div className="skeleton w-4 h-4 rounded-sm" />
						<div className="skeleton h-4 w-1/3" />
					</div>
					<div className="flex items-center gap-2">
						<div className="skeleton w-4 h-4 rounded-sm" />
						<div className="skeleton h-4 w-1/2" />
					</div>
				</div>
			</div>
		</div>
	</div>
);

export default Skeleton;
