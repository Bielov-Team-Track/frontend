import { Event } from "@/lib/models/Event";
import {
	getDuration,
	getFormattedDateWithDay,
	getFormattedTime,
} from "@/lib/utils/date";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { Calendar as CalendarIcon, Map as MapIcon, Clock as ClockIcon, Circle as VolleyballIcon } from "lucide-react";

type EventCardProps = {
	event: Event;
	variant?: "vertical" | "horizontal";
};

const EventCard = ({ event, variant = "horizontal" }: EventCardProps) => {
	const variantClasses = {
		vertical: "flex flex-col max-w-60",
		horizontal: "flex flex-row max-w-96 h-32 flex-grow",
	};

	const imageVariantClasses = {
		vertical: "rounded-t-md",
		horizontal: "rounded-l-md h-full w-32",
	};

	const contentVariantClasses = {
		vertical: "p-4",
		horizontal: "flex-1 p-3 pl-4",
	};

	return (
		<Link href={`/events/${event.id}`}>
			<div
				className={clsx(
					variantClasses[variant],
					"rounded-lg relative bg-background-light shadow-md shadow-black/50 overflow-hidden cursor-pointer",
					"transition-all duration-200 ease-in-out transform-gpu",
					"hover:shadow-lg hover:shadow-black/50 hover:scale-[1.01]",
					"active:scale-100",
				)}
			>
				{
					<div
						className={clsx(
							imageVariantClasses[variant],
							"aspect-square h-32 bg-secondary self-stretch grid place-items-center",
						)}
					>
						{event.image ? (
							<Image
								src="/images/event-placeholder.png"
								alt="Event Image"
								className="object-cover"
								width={32}
								height={32}
							/>
						) : (
							<VolleyballIcon className="text-8xl text-accent" />
						)}
					</div>
				}
				<div
					className={clsx(
						contentVariantClasses[variant],
						"flex flex-col justify-between min-w-0 flex-1",
					)}
				>
					<h2 className="flex items-center gap-2">
						<span className="text-2xl font-semibold text-ellipsis overflow-hidden whitespace-nowrap text-nowrap">
							{event.name}
						</span>
						{event.canceled && (
							<span className="text-sm text-error">[canceled]</span>
						)}
					</h2>
					<div className="flex flex-col text-sm gap-1 text-muted">
						<div className="flex flex-row items-center gap-2">
							<div className="w-4 flex justify-center">
								<MapIcon className="w-4 h-4" />
							</div>
							<span className="overflow-hidden text-ellipsis  whitespace-nowrap">
								{event.location?.address || "TBD"}
							</span>
						</div>
						<div className="flex flex-row items-center gap-2">
							<div className="w-4 flex justify-center">
								<CalendarIcon className="w-4 h-4" />
							</div>
							<span>{getFormattedDateWithDay(event.startTime, "short")}</span>
						</div>
						<div className="flex flex-row items-center gap-2">
							<div className="w-4 flex justify-center">
								<ClockIcon className="w-4 h-4" />
							</div>
							<span>{getFormattedTime(event.startTime)},</span>
							{getDuration(event.startTime, event.endTime)}
						</div>
						<div className="flex flex-row items-center gap-2"></div>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default EventCard;
