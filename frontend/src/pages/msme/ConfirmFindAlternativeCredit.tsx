import { useTranslation as useT } from "react-i18next";
import Button from "src/stories/button/Button";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

import useApplicationContext from "../../hooks/useApplicationContext";
import useConfirmFindAlternativeCredit from "../../hooks/useConfirmFindAlternativeCredit";

function ConfirmFindAlternativeCredit() {
  const { t } = useT();
  const applicationContext = useApplicationContext();
  const application = applicationContext.state.data?.application;

  const { confirmFindAlternativeCreditMutation, isLoading } = useConfirmFindAlternativeCredit();

  const onConfirmNewApplicationHandler = () => {
    if (application?.uuid) {
      confirmFindAlternativeCreditMutation({
        uuid: application.uuid,
      });
    }
  };

  return (
    <>
      <Title type="page" label={t("Find Alternative Credit")} className="mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2 md:mr-10">
          <Text className="mb-8">
            {t(
              "Your application for credit with {fi_name} has been rejected, but you are still able to seek credit from one of the other credit providers in Credere.",
              {
                fi_name: applicationContext.state.data?.lender.name,
              },
            )}
          </Text>
          <Text className="mb-8">
            {t("Confirming this will allow you to submit a new application to other credit provider in Credere.")}
          </Text>
          <Text className="mb-8">
            {t(
              "If you have any questions, you can reach out to member of the Open Contracting Partnership team at: credere@open-contracting.org.",
            )}
          </Text>

          <div className="mt-5 mb-10 grid grid-cols-1 gap-4 md:flex md:gap-0">
            <div>
              <Button
                disabled={isLoading}
                className="md:mr-4"
                label={t("Confirm new application")}
                onClick={onConfirmNewApplicationHandler}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ConfirmFindAlternativeCredit;
