import { useState } from "react";
import { useTranslation as useT } from "react-i18next";
import { Link } from "react-router";
import FAQ_QUESTIONS from "src/constants/faq-questions";
import FAQPageSection from "src/stories/faq/FAQPageSection";

import FAQContainer from "../stories/faq/FAQContainer";
import LinkButton from "../stories/link-button/LinkButton";

interface FAQComponentProps {
  className?: string;
}

function FAQComponent({ className = "" }: FAQComponentProps) {
  const { t } = useT();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const handleToggle = (key: string) => {
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };
  return (
    <FAQContainer title={t("Frequently Asked Questions")} className={className}>
      {Object.keys(FAQ_QUESTIONS)
        .slice(0, 3)
        .map((key: string) => (
          <FAQPageSection
            key={key}
            open={open[key]}
            handleToggle={() => handleToggle(key)}
            title={t(FAQ_QUESTIONS[key].question)}
          >
            {t(FAQ_QUESTIONS[key].answer)}
          </FAQPageSection>
        ))}
      <LinkButton className="ml-1 mb-2" label={t("View all FAQs")} component={Link} to="/frequently-asked-questions" />
    </FAQContainer>
  );
}

export default FAQComponent;
