import { useCallback, useEffect, useState } from "react";
import { useTranslation as useT } from "react-i18next";
import { useNavigate } from "react-router";
import StepImageEN from "src/assets/pages/en/stage-five.svg";
import StepImageES from "src/assets/pages/es/stage-five.svg";
import useApplicationContext from "src/hooks/useSecureApplicationContext";
import Button from "src/stories/button/Button";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

import useDownloadApplication from "../../hooks/useDownloadApplication";
import useLangContext from "../../hooks/useLangContext";

function StageFiveApproved() {
  const { t } = useT();
  const navigate = useNavigate();
  const applicationContext = useApplicationContext();
  const application = applicationContext.state.data;
  const [idToDownload, setIdToDownload] = useState<number | undefined>();

  const langContext = useLangContext();
  const StepImage = langContext.state.selected.startsWith("en") ? StepImageEN : StepImageES;

  const { downloadedApplication, isLoading } = useDownloadApplication(idToDownload);

  const onDownloadApplicationHandler = useCallback(() => {
    setIdToDownload(application?.id);
  }, [application?.id]);

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

  const onGoHomeHandler = () => {
    navigate("/");
  };

  return (
    <>
      <Title type="page" label={t("Application Approval Process")} className="mb-4" />
      <Text className="text-lg mb-12">{application?.borrower.legal_name}</Text>
      <img className="mb-14 ml-8" src={StepImage} alt="step" />
      <Title type="section" label={t("Stage 5: Approve")} className="mb-8" />

      <Text className="mb-4">
        {t("The credit application has been approved. The business will be notified by email shortly.")}
      </Text>
      <div className="mt-6 md:mb-8 grid grid-cols-1 gap-4 md:flex md:gap-0">
        <div>
          <Button primary={false} className="md:mr-4" label={t("Back to home")} onClick={onGoHomeHandler} />
        </div>
        <div>
          <Button disabled={isLoading} label={t("Download application")} onClick={onDownloadApplicationHandler} />
        </div>
      </div>
    </>
  );
}

export default StageFiveApproved;
