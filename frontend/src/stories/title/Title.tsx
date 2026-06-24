import { Typography } from "@mui/material";
import { twMerge } from "tailwind-merge";

type TitleProps = {
  label?: string;
  type?: "page" | "section" | "subsection";
  className?: string;
};

type VariantType = "h1" | "h2" | "h3";
function Title({ label = "", type = "section", className = "" }: TitleProps) {
  let variant: VariantType = "h2";
  let fontSizeClass = "text-2xl font-medium";
  if (type === "page") {
    variant = "h1";
    fontSizeClass = "text-[32px]";
  } else if (type === "subsection") {
    variant = "h3";
    fontSizeClass = "text-xl";
  }

  return (
    <Typography variant={variant} className={twMerge(`text-darkest font-bold mb-4 ${fontSizeClass} ${className}`)}>
      {label}
    </Typography>
  );
}

export default Title;
