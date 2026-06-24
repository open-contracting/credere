import { Box, Container, Typography } from "@mui/material";
import { twMerge } from "tailwind-merge";

type DashboardColor = "default" | "red";

type DashboardChartContainerProps = {
  className?: string;
  boxClassName?: string;
  label: string;
  color?: DashboardColor;
  children: React.ReactNode;
};

function DashboardChartContainer({
  className = "",
  boxClassName = "",
  label,
  children,
  color = "default",
}: DashboardChartContainerProps) {
  return (
    <Container className={twMerge(`mb-6 px-0 ${className}`)}>
      <Box
        className={twMerge([
          color === "default" ? "border-moody-blue" : "border-red",
          `px-4 pt-4 pb-10 border-solid border-2 overflow-hidden bg-white ${boxClassName}`,
        ])}
        sx={{
          borderTopLeftRadius: "20px",
          width: "509px",
          height: "317px",
        }}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: "15px",
          }}
          className={twMerge(`text-darkest font-normal mb-2 ${className}`)}
        >
          {label}
        </Typography>
        {children}
      </Box>
    </Container>
  );
}

export default DashboardChartContainer;
