import { Link as MUILink } from "@mui/material";
import { useTranslation as useT } from "react-i18next";
import { Link, useNavigate } from "react-router";
import StepImageEN from "src/assets/pages/en/stage-one.svg";
import StepImageES from "src/assets/pages/es/stage-one.svg";
import useApplicationContext from "src/hooks/useSecureApplicationContext";
import Button from "src/stories/button/Button";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

import ApplicationBorrowerTable from "../../components/ApplicationBorrowerTable";
import useLangContext from "../../hooks/useLangContext";
import LinkButton from "../../stories/link-button/LinkButton";

function StageOne() {
  const { t } = useT();
  const navigate = useNavigate();
  const applicationContext = useApplicationContext();
  const langContext = useLangContext();
  const application = applicationContext.state.data;

  const StepImage = langContext.state.selected.startsWith("en") ? StepImageEN : StepImageES;

  const onBackHandler = () => {
    navigate("/");
  };

  const onNextHandler = () => {
    navigate("../stage-two");
  };

  return (
    <>
      <Title type="page" label={t("Application Approval Process")} className="mb-4" />
      <Text className="text-lg mb-12">{application?.borrower.legal_name}</Text>
      <Link to="../stage-one">.</Link>
      <img className="mb-14 ml-8" src={StepImage} alt="step" />
      <Title type="section" label={t("Stage 1: Business Information")} className="mb-8" />
      <Text className="mb-4">
        {t("Review and verify the data for the business. Where information is missing it can be edited manually.")}
      </Text>
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
      {application && (
        <ApplicationBorrowerTable allowDataVerification className="xl:w-4/5" application={application} />
      )}

      <div className="mt-6 md:mb-8 grid grid-cols-1 gap-4 md:flex md:gap-0">
        <div>
          <Button className="md:mr-4" label={t("Go Home")} onClick={onBackHandler} />
        </div>

        <div>
          <Button label={t("Next")} onClick={onNextHandler} />
        </div>
      </div>
    </>
  );
}

export default StageOne;
