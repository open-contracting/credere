import { Link as MUILink } from "@mui/material";
import { useTranslation as useT } from "react-i18next";
import { useNavigate } from "react-router";
import StepImageEN from "src/assets/pages/en/stage-three.svg";
import StepImageES from "src/assets/pages/es/stage-three.svg";
import useApplicationContext from "src/hooks/useSecureApplicationContext";
import Button from "src/stories/button/Button";
import LinkButton from "src/stories/link-button/LinkButton";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

import ApplicationAwardTable from "../../components/ApplicationAwardTable";
import useLangContext from "../../hooks/useLangContext";

function StageThree() {
  const { t } = useT();
  const navigate = useNavigate();
  const applicationContext = useApplicationContext();
  const application = applicationContext.state.data;

  const langContext = useLangContext();
  const StepImage = langContext.state.selected.startsWith("en") ? StepImageEN : StepImageES;

  const onGoHomeHandler = () => {
    navigate("/");
  };

  const onBackHandler = () => {
    navigate("../stage-two");
  };

  const onNextHandler = () => {
    navigate("../stage-four");
  };

  return (
    <>
      <Title type="page" label={t("Application Approval Process")} className="mb-4" />
      <Text className="text-lg mb-12">{application?.borrower.legal_name}</Text>
      <img className="mb-14 ml-8" src={StepImage} alt="step" />
      <Title type="section" label={t("Stage 3: Award Data")} className="mb-8" />
      <Text className="mb-4">{t("Review the data for the business.")}</Text>
      <Text className="mb-4">
        {t(
          "You can search for any missing information by reviewing data and documents for the contracting process in SECOP II.",
        )}
      </Text>
      <LinkButton
        className="mb-2 px-1"
        target="_blank"
        rel="noreferrer"
        label={t("View data in SECOP II")}
        component={MUILink}
        href={application?.award.source_url}
      />
      {application && <ApplicationAwardTable className="xl:w-4/5" application={application} />}
      <div className="mt-6 md:mb-8 grid grid-cols-1 gap-4 md:flex md:gap-0">
        <div>
          <Button className="md:mr-4" label={t("Go Home")} onClick={onGoHomeHandler} />
        </div>
        <div>
          <Button className="md:mr-4" label={t("Go Back")} onClick={onBackHandler} />
        </div>
        <div>
          <Button label={t("Next")} onClick={onNextHandler} />
        </div>
      </div>
    </>
  );
}

export default StageThree;
