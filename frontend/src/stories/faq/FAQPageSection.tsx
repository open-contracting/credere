import { Box, Collapse, Typography } from "@mui/material";
import type { PropsWithChildren } from "react";
import { twMerge } from "tailwind-merge";

import Minus from "../../assets/icons/minus.svg";
import Plus from "../../assets/icons/plus.svg";
import Text from "../text/Text";

type FAQPageSectionProps = {
  title: string;
  className?: string;
  open: boolean;
  handleToggle: () => void;
};

function FAQPageSection({
  title,
  className = "",
  open,
  handleToggle,
  children,
}: FAQPageSectionProps & PropsWithChildren) {
  return (
    <Box
      className={twMerge(`mt-1 ${className}`)}
      sx={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box className="px-4 pt-4 pb-2 bg-white flex items-center cursor-pointer" onClick={handleToggle}>
        <Typography variant="h6" className="text-darkest text-lg font-bold">
          {title}
        </Typography>
        <Box className="ml-auto p-2">
          <img
            className={twMerge(`transition-transform duration-300 ease-in-out transform ${open ? "" : "rotate-180"}`)}
            src={open ? Plus : Minus}
            alt="icon"
          />
        </Box>
      </Box>

      <Collapse in={open}>
        <Box className="mt-2 pl-8 pr-14 pt-8 pb-10 bg-light-gray">
          <Text fontVariant className="text-darkest text-base font-normal">
            {children}
          </Text>
        </Box>
      </Collapse>
    </Box>
  );
}

export default FAQPageSection;
