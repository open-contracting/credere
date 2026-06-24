import { useTranslation as useT } from "react-i18next";
import { Link, useNavigate } from "react-router";
import StepImageEN from "src/assets/pages/en/stage-four.svg";
import StepImageES from "src/assets/pages/es/stage-four.svg";
import useApplicationContext from "src/hooks/useSecureApplicationContext";
import Button from "src/stories/button/Button";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

import ApplicationAwardTable from "../../components/ApplicationAwardTable";
import ApplicationBorrowerTable from "../../components/ApplicationBorrowerTable";
import ApplicationDocumentsTable from "../../components/ApplicationDocumentsTable";
import useLangContext from "../../hooks/useLangContext";
import LinkButton from "../../stories/link-button/LinkButton";

function StageFour() {
  const { t } = useT();
  const navigate = useNavigate();
  const applicationContext = useApplicationContext();
  const application = applicationContext.state.data;

  const langContext = useLangContext();
  const StepImage = langContext.state.selected.startsWith("en") ? StepImageEN : StepImageES;

  const onGoHomeHandler = () => {
    navigate("/");
  };

  const onNextHandler = () => {
    navigate("../stage-five");
  };

  const onGoBackHandler = () => {
    navigate("../stage-three");
  };

  return (
    <>
      <Title type="page" label={t("Application Approval Process")} className="mb-4" />
      <Text className="text-lg mb-12">{application?.borrower.legal_name}</Text>
      <img className="mb-14 ml-8" src={StepImage} alt="step" />
      <Title type="section" label={t("Stage 4: Summary")} className="mb-4" />

      {application && <ApplicationBorrowerTable readonly className="xl:w-4/5" application={application} />}
      <LinkButton
        className="mb-8 mt-4 px-1"
        label={t("Go back to business Information")}
        component={Link}
        to="../stage-one"
      />
      {application && !application.lender?.external_onboarding_url && (
        <div>
          <ApplicationDocumentsTable readonly className="xl:w-4/5" application={application} />

          <LinkButton
            className="mb-2 mt-4 px-1"
            label={t("Go back to business Documents")}
            component={Link}
            to="../stage-two"
          />
        </div>
      )}
      {application && <ApplicationAwardTable readonly className="xl:w-4/5" application={application} />}
      <div className="mt-6 md:mb-8 grid grid-cols-1 gap-4 md:flex md:gap-0">
        <div>
          <Button className="md:mr-4" label={t("Go Home")} onClick={onGoHomeHandler} />
        </div>

        <div>
          <Button className="md:mr-4" label={t("Go Back")} onClick={onGoBackHandler} />
        </div>

        <div>
          <Button label={t("Next")} onClick={onNextHandler} />
        </div>
      </div>
    </>
  );
}

export default StageFour;
