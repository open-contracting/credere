import { Box } from "@mui/material";
import { useCallback } from "react";
import { useTranslation as useT } from "react-i18next";

import Text from "../stories/text/Text";

interface DataDisplayProps {
  data: { [key: string]: unknown };
  className?: string;
}

function DataDisplay({ data, className = "" }: DataDisplayProps) {
  const { t } = useT();

  const formatValue = useCallback(
    (value: unknown) => {
      if (typeof value === "boolean") {
        return value ? t("Yes") : t("No");
      }
      if (value === null || value === undefined) {
        return "";
      }
      return String(value);
    },
    [t],
  );

  const formatKey = useCallback(
    (key: string) => {
      const replacedStr = key.replace(/_/g, " ");
      // Convert the first letter to uppercase
      const firstLetter = replacedStr.charAt(0).toUpperCase();
      const remainingLetters = replacedStr.slice(1);

      // Concatenate the converted first letter and remaining letters
      const convertedStr = firstLetter + remainingLetters;
      return t(convertedStr);
    },
    [t],
  );

  return (
    <Box className={`flex flex-col mb-8 ${className}`}>
      {Object.keys(data).map((key) => (
        <Box key={key} className="flex flex-row">
          <Text className="mb-0 mr-2">{formatKey(key)}</Text>
          <Text className="font-light mb-0">{formatValue(data[key])}</Text>
        </Box>
      ))}
    </Box>
  );
}

export default DataDisplay;
