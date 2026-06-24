import { Box, Button as MUIButton, type ButtonProps as MUIButtonProps } from "@mui/material";
import { twMerge } from "tailwind-merge";

import ArrowInCircleIcon from "../../assets/icons/arrow-in-circle.svg";

type SizeType = "large" | "small";

interface LinkButtonProps {
  label: string;
  size?: SizeType;
  noIcon?: boolean;
  iconClassName?: string;
  labelClassName?: string;
  icon?: string; // svg imported
  onClick?: () => void;
}

function LinkButton<C extends React.ElementType>({
  size = "large",
  label,
  noIcon = false,
  iconClassName = undefined,
  labelClassName = undefined,
  className,
  icon = ArrowInCircleIcon,
  ...props
}: MUIButtonProps<C, { component?: C }> & LinkButtonProps) {
  return (
    <MUIButton
      disableElevation
      size={size}
      startIcon={!noIcon ? <img className={iconClassName} src={icon} alt="button-icon" /> : undefined}
      className={twMerge(
        [
          "text-darkest font-normal disabled:opacity-50",
          size === "large" ? "px-6 py-4 text-lg" : "px-4 py-2 text-sm",
          `bg-transparent hover:bg-transparent normal-case ${className}`,
        ].join(" "),
      )}
      {...props}
    >
      <Box
        className={`border-grass border-b-2 ${labelClassName}`}
        sx={{
          borderBottomStyle: "solid",
        }}
      >
        {label}
      </Box>
    </MUIButton>
  );
}

export default LinkButton;
