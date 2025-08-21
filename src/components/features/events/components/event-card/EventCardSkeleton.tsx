import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const EventCardSkeleton = () => {
  return (
    <div className="flex flex-col">
      <div className="bg-foreground rounded-lg p-4 max-w-96 h-36 flex flex-grow flex-row gap-4 relative">
        {/* Event image skeleton */}
        <div className="aspect-square h-full">
          <Skeleton className="w-full h-full" rounded="md" />
        </div>
        
        {/* Event details skeleton */}
        <div className="flex flex-col justify-between gap-2 min-w-0 flex-1">
          {/* Event title */}
          <Skeleton height="1.5rem" width="85%" className="mb-2" />
          
          {/* Event details */}
          <div className="flex flex-col text-sm gap-1">
            {/* Location */}
            <div className="flex flex-row items-center gap-2">
              <Skeleton width="1rem" height="1rem" rounded="sm" />
              <Skeleton height="0.875rem" width="60%" />
            </div>
            
            {/* Date */}
            <div className="flex flex-row items-center gap-2">
              <Skeleton width="1rem" height="1rem" rounded="sm" />
              <Skeleton height="0.875rem" width="45%" />
            </div>
            
            {/* Time */}
            <div className="flex flex-row items-center gap-2">
              <Skeleton width="1rem" height="1rem" rounded="sm" />
              <Skeleton height="0.875rem" width="55%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;