import React from "react";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: "sm" | "md" | "lg" | "full" | "none";
  animate?: boolean;
}

const Skeleton = ({ 
  className = "", 
  width, 
  height, 
  rounded = "md",
  animate = true 
}: SkeletonProps) => {
  const roundedClasses = {
    none: "",
    sm: "rounded-sm",
    md: "rounded-md", 
    lg: "rounded-lg",
    full: "rounded-full"
  };

  const baseClasses = `bg-base-300 ${animate ? "animate-pulse" : ""}`;
  const classes = [
    baseClasses,
    roundedClasses[rounded],
    className
  ].filter(Boolean).join(" ");

  const style = {
    ...(width && { width }),
    ...(height && { height })
  };

  return <div className={classes} style={style} />;
};

// Specialized skeleton components
export const SkeletonText = ({ 
  lines = 1, 
  className = "",
  lastLineWidth = "75%"
}: { 
  lines?: number; 
  className?: string;
  lastLineWidth?: string;
}) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        height="0.875rem"
        width={index === lines - 1 ? lastLineWidth : "100%"}
        className="block"
      />
    ))}
  </div>
);

export const SkeletonAvatar = ({ 
  size = "md",
  className = "" 
}: { 
  size?: "sm" | "md" | "lg";
  className?: string;
}) => {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  };
  
  return (
    <Skeleton 
      className={`${sizes[size]} ${className}`}
      rounded="full"
    />
  );
};

export const SkeletonCard = ({
  className = "",
  hasImage = true,
  hasAvatar = false
}: {
  className?: string;
  hasImage?: boolean;
  hasAvatar?: boolean;
}) => (
  <div className={`bg-foreground rounded-lg p-4 ${className}`}>
    <div className="flex gap-4">
      {hasImage && (
        <Skeleton 
          className="aspect-square h-28 flex-shrink-0"
          rounded="md"
        />
      )}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2">
          {hasAvatar && <SkeletonAvatar size="sm" />}
          <Skeleton height="1.25rem" width="60%" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton width="1rem" height="1rem" rounded="sm" />
            <Skeleton height="0.875rem" width="40%" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton width="1rem" height="1rem" rounded="sm" />
            <Skeleton height="0.875rem" width="35%" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton width="1rem" height="1rem" rounded="sm" />
            <Skeleton height="0.875rem" width="50%" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Skeleton;