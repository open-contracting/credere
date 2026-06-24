import { Typography } from "@mui/material";
import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

type TextProps = {
  className?: string;
  fontVariant?: boolean;
};

function Text({ children, fontVariant = false, className = "" }: TextProps & PropsWithChildren) {
  return (
    <Typography
      variant="body1"
      sx={
        fontVariant
          ? {
              fontFamily: "GT Eesti Pro Text",
            }
          : {}
      }
      className={twMerge(`text-darkest text-lg mb-4 ${className}`)}
    >
      {children}
    </Typography>
  );
}

export default Text;
