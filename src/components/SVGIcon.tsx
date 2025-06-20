import React from "react";

interface SVGIconProps {
  svg: string;
  width?: number;
  height?: number;
  className?: string;
  color?: string;
  viewBox?: string;
}

/**
 * Component để thêm SVG dưới dạng chuỗi
 *
 * Sử dụng:
 * ```tsx
 * <SVGIcon
 *   svg="<path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' />"
 *   width={24}
 *   height={24}
 * />
 * ```
 */
const SVGIcon: React.FC<SVGIconProps> = ({
  svg,
  width = 24,
  height = 24,
  className = "",
  color = "currentColor",
  viewBox = "0 0 24 24",
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox={viewBox}
      fill="none"
      stroke={color}
      className={className}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default SVGIcon;
