import { Link as MUILink } from "@mui/material";
import { useTranslation as useT } from "react-i18next";
import FAQComponent from "src/components/FAQComponent";
import Button from "src/stories/button/Button";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

function DeclineCompleted() {
  const { t } = useT();

  return (
    <>
      <Title type="page" label={t("Thank You For Your Feedback")} className="mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2 md:mr-10">
          <Text className="mb-8">
            {t("Your feedback will help us to improve how we support SMEs in Colombia in the future.")}
          </Text>
          <Text className="mb-8">
            {t(
              "If you have any more comments or questions, you can reach out to member of the Open Contracting Partnership team at: credere@open-contracting.org.",
            )}
          </Text>

          <div className="mt-5 mb-10 grid grid-cols-1 gap-4 md:flex md:gap-0">
            <div>
              <Button
                className="md:mr-4"
                label={t("Learn more about OCP")}
                target="_blank"
                rel="noreferrer"
                component={MUILink}
                href={`${import.meta.env.VITE_MORE_INFO_OCP_URL || "https://www.open-contracting.org/es/"}`}
              />
            </div>
          </div>
        </div>
        <div className="my-6 md:my-0 md:ml-10">
          <FAQComponent />
        </div>
      </div>
    </>
  );
}

export default DeclineCompleted;
