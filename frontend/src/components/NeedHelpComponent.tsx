import { Box } from "@mui/material";
import { useTranslation as useT } from "react-i18next";

import FAQContainer from "../stories/faq/FAQContainer";
import Text from "../stories/text/Text";

function NeedHelpComponent() {
  const { t } = useT();
  return (
    <FAQContainer title={t("Need help? Contact us")}>
      <Box
        className="px-6 pt-4 pb-4"
        sx={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box>
          <Text className="inline-block mb-0">{t("Email: ")}</Text>
          <Text className="inline-block underline ml-1 mb-0">
            <a className="text-darkest" href="mailto:credere@open-contracting.org">
              credere@open-contracting.org
            </a>
          </Text>
        </Box>
      </Box>
    </FAQContainer>
  );
}

export default NeedHelpComponent;
