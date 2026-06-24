import { Box, Collapse, Typography } from "@mui/material";
import { type PropsWithChildren, useState } from "react";
import { twMerge } from "tailwind-merge";

import ArrowGreen from "../../assets/icons/arrow-green.svg";
import Text from "../text/Text";

export type FAQSectionProps = {
  title: string;
  className?: string;
};

export function FAQSection({ title, className = "", children }: FAQSectionProps & PropsWithChildren) {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <Box
      className={twMerge(`px-6 pt-4 pb-4 border-light-gray bg-white boder-b ${className}`)}
      sx={{
        display: "flex",
        flexDirection: "column",
        borderBottomStyle: "solid",
      }}
    >
      <Box className="border-b-2 border-light-gray flex items-center cursor-pointer" onClick={handleToggle}>
        <Typography variant="h6" className="text-darkest text-base font-normal">
          {title}
        </Typography>
        <Box className="ml-auto py-2 pr-2 pl-5">
          <img
            className={twMerge(`transition-transform duration-300 ease-in-out transform ${open ? "" : "rotate-180"}`)}
            src={ArrowGreen}
            alt="icon"
          />
        </Box>
      </Box>

      <Collapse in={open}>
        <Text className="text-darkest text-base font-light">{children}</Text>
      </Collapse>
    </Box>
  );
}
