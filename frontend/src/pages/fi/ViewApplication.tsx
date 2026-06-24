import { Box } from "@mui/material";
import { useTranslation as useT } from "react-i18next";
import { useNavigate } from "react-router";
import useApplicationContext from "src/hooks/useSecureApplicationContext";
import Button from "src/stories/button/Button";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

import ApplicationAwardTable from "../../components/ApplicationAwardTable";
import ApplicationBorrowerTable from "../../components/ApplicationBorrowerTable";
import ApplicationDocumentsTable from "../../components/ApplicationDocumentsTable";
import DataDisplay from "../../components/DataDisplay";
import { APPLICATION_STATUS } from "../../constants";
import { RenderStatusString } from "../../util";

function ViewApplication() {
  const { t } = useT();
  const navigate = useNavigate();
  const applicationContext = useApplicationContext();
  const application = applicationContext.state.data;

  const onGoHomeHandler = () => {
    navigate("/");
  };

  return (
    <>
      <Title type="page" label={t("View Application")} className="mb-4" />
      {application && (
        <>
          <Box className="flex flex-row items-center mb-2">
            <Text className="text-lg mr-2">{t("Status:")}</Text>
            <Text className="text-lg font-light">{RenderStatusString(application.status)}</Text>
          </Box>

          {application.status === APPLICATION_STATUS.APPROVED && (
            <DataDisplay data={application.lender_approved_data} />
          )}

          {application.status === APPLICATION_STATUS.REJECTED && (
            <DataDisplay data={application.lender_rejected_data} />
          )}

          {application.archived_at && <Text className="text-lg">{t("This applicatio is archived")}</Text>}
          {!application.archived_at && (
            <>
              <Title type="section" className="mb-4" label={t("Business Data")} />
              <ApplicationBorrowerTable readonly className="xl:w-4/5" application={application} />

              {!application.lender?.external_onboarding_url && (
                <>
                  <Title type="section" className="mt-10 mb-4" label={t("Business Documents")} />
                  <ApplicationDocumentsTable readonly className="xl:w-4/5" application={application} />
                </>
              )}
              <Title type="section" className="mt-10 mb-4" label={t("Award Data")} />
              <ApplicationAwardTable readonly className="xl:w-4/5" application={application} />
            </>
          )}
          <div className="mt-6 md:mb-8 grid grid-cols-1 gap-4 md:flex md:gap-0">
            <div>
              <Button primary={false} className="md:mr-4" label={t("Go Home")} onClick={onGoHomeHandler} />
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default ViewApplication;
