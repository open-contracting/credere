import { useTranslation as useT } from "react-i18next";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

type ApplicationErrorPageProps = {
  message: string;
};

function ApplicationErrorPage({ message }: ApplicationErrorPageProps) {
  const { t } = useT();

  return (
    <>
      <Title type="page" label={t("Something went wrong")} className="mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2 md:mr-10">
          <Text className="mb-8">{message || t("An error occurred while processing your request")}</Text>
        </div>
      </div>
    </>
  );
}

export default ApplicationErrorPage;
