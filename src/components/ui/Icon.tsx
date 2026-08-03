import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  filled?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClass = {
  sm: "!text-[18px]",
  md: "!text-[24px]",
  lg: "!text-[32px]",
};

export function Icon({ name, filled, size = "md", className, ...rest }: IconProps) {
  return (
    <span
      {...rest}
      aria-hidden={rest["aria-label"] ? undefined : true}
      className={cn("material-symbols-outlined align-middle", sizeClass[size], filled && "material-symbols-filled", className)}
    >
      {name}
    </span>
  );
}
