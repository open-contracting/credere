import { useEffect, useState } from "react";
import { useTranslation as useT } from "react-i18next";
import { useNavigate } from "react-router";
import Button from "src/stories/button/Button";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

import useDownloadApplication from "../../hooks/useDownloadApplication";
import useApplicationContext from "../../hooks/useSecureApplicationContext";

function ApplicationCompleted() {
  const { t } = useT();
  const navigate = useNavigate();
  const applicationContext = useApplicationContext();
  const application = applicationContext.state.data;
  const [idToDownload, setIdToDownload] = useState<number | undefined>();

  const { downloadedApplication, isLoading } = useDownloadApplication(idToDownload);

  const onGoHomeHandler = () => {
    navigate("/");
  };

  const onDownloadApplication = async () => {
    setIdToDownload(application?.id);
  };

  useEffect(() => {
    if (downloadedApplication) {
      const href = window.URL.createObjectURL(downloadedApplication);

      const anchorElement = document.createElement("a");

      anchorElement.href = href;
      const filename = `${t("application")}-${application?.borrower.legal_identifier}.zip`;
      anchorElement.download = filename;

      document.body.appendChild(anchorElement);
      anchorElement.click();

      document.body.removeChild(anchorElement);
      window.URL.revokeObjectURL(href);
      setIdToDownload(undefined);
    }
  }, [application?.borrower.legal_identifier, downloadedApplication, t]);

  return (
    <div className="xl:w-4/5">
      <Title type="page" label={t("Application Completed")} className="mb-4" />
      <Text className="text-lg mb-10">{application?.borrower.legal_name}</Text>

      <Text className="mb-4">{t("This application has been completed.")}</Text>

      <div className="mt-4 md:mb-4 grid grid-cols-1 gap-4 md:flex md:gap-0">
        <div>
          <Button primary={false} className="md:mr-4" label={t("Back to home")} onClick={onGoHomeHandler} />
        </div>
        <div>
          <Button label={t("Download application")} onClick={onDownloadApplication} disabled={isLoading} />
        </div>
      </div>
      <Text className="mb-10 text-sm font-light">
        {t("Data for the application will only be stored for one week after the process has been completed. ")}
      </Text>
    </div>
  );
}

export default ApplicationCompleted;
