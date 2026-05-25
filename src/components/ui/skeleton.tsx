import { cn } from "@/lib/utils";
import React from "react";

type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("km-skeleton rounded-md", className)}
      {...props}
    />
  );
}
