import React from "react";
import EventCardSkeleton from "../event-card/EventCardSkeleton";

type EventListSkeletonProps = {
  count?: number;
  variant?: "grid" | "inline";
  className?: string;
};

const EventListSkeleton = ({ 
  count = 6, 
  variant = "grid", 
  className 
}: EventListSkeletonProps) => {
  const variantClasses = {
    grid: "flex gap-4 flex-wrap justify-center",
    inline: "flex gap-4",
  };
  
  const baseClasses = "h-full p-4";
  const classes = [variantClasses[variant], className, baseClasses]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes}>
      {Array.from({ length: count }).map((_, index) => (
        <EventCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default EventListSkeleton;