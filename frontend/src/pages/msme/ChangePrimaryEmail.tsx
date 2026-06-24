import { Link as MUILink } from "@mui/material";
import { useTranslation as useT } from "react-i18next";
import Button from "src/stories/button/Button";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";
import { z } from "zod";

import useApplicationContext from "../../hooks/useApplicationContext";
import useConfirmChangeEmail from "../../hooks/useConfirmChangeEmail";
import { useSearchParamsTypeSafe } from "../../hooks/useParamsTypeSafe";

const params = z.object({
  token: z.coerce.string(),
});

function ChangePrimaryEmail() {
  const { t } = useT();
  const applicationContext = useApplicationContext();
  const application = applicationContext.state.data?.application;
  const { token } = useSearchParamsTypeSafe(params, t("This is an invalid link."));

  const { confirmChangeEmailMutation, isLoading, data } = useConfirmChangeEmail();

  const onConfirmEmailChangeHandler = () => {
    if (token && application?.uuid) {
      confirmChangeEmailMutation({
        confirmation_email_token: token,
        uuid: application.uuid,
      });
    }
  };

  return (
    <>
      {data && <Title type="page" label={t("Primary Email Changed")} className="mb-8" />}

      {!data && (
        <Title
          type="page"
          label={
            application?.pending_email_confirmation ? t("Confirm Email Change") : t("Primary email already changed")
          }
          className="mb-8"
        />
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2 md:mr-10">
          {data && (
            <>
              <Text className="mb-8">
                {t(
                  'The primary email to process your application for the award "{award_title}" has successfully been changed.',
                  {
                    award_title: applicationContext.state.data?.award.title,
                  },
                )}
              </Text>
              <Text className="mb-8">
                {t(
                  "If you have any questions, you can reach out to member of the Open Contracting Partnership team at: credere@open-contracting.org.",
                )}
              </Text>
            </>
          )}
          {!data && application?.pending_email_confirmation && (
            <Text className="mb-8">
              {t(
                'Confirm the change of your primary email for to process your application for the award "{award_title}".',
                {
                  award_title: applicationContext.state.data?.award.title,
                },
              )}
            </Text>
          )}
          {!data && !application?.pending_email_confirmation && (
            <Text className="mb-8">
              {t(
                'Your primary email for to process your application for the award "{award_title}" has already been changed.',
                {
                  award_title: applicationContext.state.data?.award.title,
                },
              )}
            </Text>
          )}
          <div className="mt-5 mb-10 grid grid-cols-1 gap-4 md:flex md:gap-0">
            <div>
              {(data || !application?.pending_email_confirmation) && (
                <Button
                  className="md:mr-4"
                  label={t("Learn more about OCP")}
                  target="_blank"
                  rel="noreferrer"
                  component={MUILink}
                  href={`${import.meta.env.VITE_MORE_INFO_OCP_URL || "https://www.open-contracting.org/es/"}`}
                />
              )}
              {!data && application?.pending_email_confirmation && (
                <Button
                  disabled={isLoading}
                  className="md:mr-4"
                  label={t("Confirm Email Change")}
                  onClick={onConfirmEmailChangeHandler}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChangePrimaryEmail;
