import { useTranslation as useT } from "react-i18next";
import { useNavigate } from "react-router";
import StepImageEN from "src/assets/pages/en/stage-five.svg";
import StepImageES from "src/assets/pages/es/stage-five.svg";
import useApplicationContext from "src/hooks/useSecureApplicationContext";
import Button from "src/stories/button/Button";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

import useLangContext from "../../hooks/useLangContext";

function StageFiveRejected() {
  const { t } = useT();
  const navigate = useNavigate();
  const applicationContext = useApplicationContext();
  const application = applicationContext.state.data;

  const langContext = useLangContext();
  const StepImage = langContext.state.selected.startsWith("en") ? StepImageEN : StepImageES;

  const onGoHomeHandler = () => {
    navigate("/");
  };

  return (
    <>
      <Title type="page" label={t("Application Approval Process")} className="mb-4" />
      <Text className="text-lg mb-12">{application?.borrower.legal_name}</Text>
      <img className="mb-14 ml-8" src={StepImage} alt="step" />
      <Title type="section" label={t("Stage 5: Approve")} className="mb-8" />

      <Text className="mb-8">
        {t("The credit application has been rejected. The business will be notified by email shortly.")}
      </Text>

      <div className="mt-6 md:mb-8 grid grid-cols-1 gap-4 md:flex md:gap-0">
        <div>
          <Button className="md:mr-4" label={t("Back to home")} onClick={onGoHomeHandler} />
        </div>
      </div>
    </>
  );
}

export default StageFiveRejected;
