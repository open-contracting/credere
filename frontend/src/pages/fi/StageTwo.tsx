import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Dialog } from "@mui/material";
import { useEffect, useState } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation as useT } from "react-i18next";
import { Link, useNavigate } from "react-router";
import EmailIcon from "src/assets/icons/email.svg";
import StepImageEN from "src/assets/pages/en/stage-two.svg";
import StepImageES from "src/assets/pages/es/stage-two.svg";
import useApplicationContext from "src/hooks/useSecureApplicationContext";
import Button from "src/stories/button/Button";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

import ApplicationDocumentsTable from "../../components/ApplicationDocumentsTable";
import { APPLICATION_STATUS } from "../../constants";
import useEmailToSME from "../../hooks/useEmailToSME";
import useLangContext from "../../hooks/useLangContext";
import { type FormEmailInput, formEmailSchema } from "../../schemas/application";
import FormInput from "../../stories/form-input/FormInput";
import LinkButton from "../../stories/link-button/LinkButton";

function StageTwo() {
  const { t } = useT();
  const [openEmailDialog, setOpenEmailDialog] = useState<boolean>(false);
  const navigate = useNavigate();
  const applicationContext = useApplicationContext();
  const application = applicationContext.state.data;
  const { isLoading, isError, emailToSMEMutation } = useEmailToSME();
  const [emailSent, setEmailSent] = useState(false);

  const langContext = useLangContext();
  const StepImage = langContext.state.selected.startsWith("en") ? StepImageEN : StepImageES;

  const onGoHomeHandler = () => {
    navigate("/");
  };

  const onBackHandler = () => {
    navigate("../stage-one");
  };

  const onNextHandler = () => {
    navigate("../stage-three");
  };

  const onComposeEmailHandler = () => {
    setOpenEmailDialog(true);
  };

  const handleClose = () => {
    setOpenEmailDialog(false);
  };

  const methods = useForm<FormEmailInput>({
    resolver: zodResolver(formEmailSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitSuccessful },
  } = methods;

  useEffect(() => {
    if (isSubmitSuccessful && !isError && !isLoading) {
      reset();
      setEmailSent(true);
    }
  }, [isSubmitSuccessful, isError, isLoading, reset]);

  const onSubmitHandler: SubmitHandler<FormEmailInput> = (values) => {
    if (application?.id) {
      emailToSMEMutation({ application_id: application.id, message: values.message });
    }
  };

  const rootElement = document.getElementById("root-app");

  return (
    <>
      <Title type="page" label={t("Application Approval Process")} className="mb-4" />
      <Text className="text-lg mb-12">{application?.borrower.legal_name}</Text>
      <Link to="../stage-two" />
      <img className="mb-14 ml-8" src={StepImage} alt="step" />
      <Title type="section" label={t("Stage 2: Business Documents")} className="mb-8" />
      {application?.lender?.external_onboarding_url ? (
        <Text className="mb-4">{t("No documents subbmited as part of this application")}</Text>
      ) : (
        <div>
          <Text className="mb-4">{t("Review and verify the data for the business.")}</Text>
          <Text className="mb-4">
            {t(
              "If a document looks incorrect or is not clearly visible, contact the business and ask them to provide the document again.",
            )}
          </Text>
          <LinkButton
            className="mb-2 px-1"
            icon={EmailIcon}
            disabled={application?.status === APPLICATION_STATUS.INFORMATION_REQUESTED}
            label={t("Email SME for documents")}
            onClick={onComposeEmailHandler}
          />
          {application && (
            <ApplicationDocumentsTable allowDataVerification className="xl:w-4/5" application={application} />
          )}
        </div>
      )}
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
      <Dialog fullWidth maxWidth="sm" container={rootElement} open={openEmailDialog} onClose={handleClose}>
        <FormProvider {...methods}>
          <Box
            component="form"
            className="flex flex-col py-7 px-8"
            onSubmit={handleSubmit(onSubmitHandler)}
            noValidate
            autoComplete="off"
          >
            <Title type="section" label={emailSent ? t("Email sent") : t("Send email to business")} className="mb-1" />

            {!emailSent && (
              <FormInput rows={10} multiline formControlClasses="mb-0" big={false} noIcon name="message" label="" />
            )}

            <div className="mt-4 grid grid-cols-1 gap-4 md:flex md:justify-end md:gap-0">
              <div>
                <Button
                  primary={emailSent}
                  className="md:mr-4"
                  label={emailSent ? t("Close") : t("Cancel")}
                  onClick={handleClose}
                />
              </div>

              {!emailSent && (
                <div>
                  <Button label={t("Send")} type="submit" disabled={isLoading} />
                </div>
              )}
            </div>
          </Box>
        </FormProvider>
      </Dialog>
    </>
  );
}

export default StageTwo;
