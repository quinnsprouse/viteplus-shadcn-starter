import { HugeiconsIcon, type HugeiconsIconProps, type IconSvgElement } from "@hugeicons/react";

interface IconProps extends Omit<HugeiconsIconProps, "icon"> {
  icon: IconSvgElement;
  className?: string;
}

export function Icon({ icon, className, size = 16, strokeWidth = 1.5, ...props }: IconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      {...props}
    />
  );
}

// Re-export icons from Pro packages
export * from "@hugeicons-pro/core-stroke-rounded";
export * as Twotone from "@hugeicons-pro/core-twotone-rounded";
