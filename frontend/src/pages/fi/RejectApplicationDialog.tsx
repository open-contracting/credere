import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Dialog } from "@mui/material";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation as useT } from "react-i18next";
import useApplicationContext from "src/hooks/useSecureApplicationContext";
import Button from "src/stories/button/Button";
import Checkbox from "src/stories/checkbox/Checkbox";
import Title from "src/stories/title/Title";

import useRejectApplication from "../../hooks/useRejectApplication";
import { type FormRejectInput, type RejectApplicationInput, rejectSchema } from "../../schemas/application";
import FormInput from "../../stories/form-input/FormInput";

interface RejectApplicationDialogProps {
  open: boolean;
  handleClose: () => void;
}

function RejectApplicationDialog({ open, handleClose }: RejectApplicationDialogProps) {
  const { t } = useT();
  const applicationContext = useApplicationContext();
  const application = applicationContext.state.data;
  const { isLoading, rejectApplicationMutation } = useRejectApplication();

  const methods = useForm<FormRejectInput>({
    resolver: zodResolver(rejectSchema),
  });

  const { watch, handleSubmit } = methods;

  const onSubmitHandler: SubmitHandler<FormRejectInput> = (values) => {
    if (application) {
      const payload: RejectApplicationInput = {
        ...values,
        other_reason: values.other ? values.other_reason : "",
        application_id: application.id,
      };

      rejectApplicationMutation(payload);
    }
  };

  const rootElement = document.getElementById("root-app");

  return (
    <Dialog fullWidth maxWidth="sm" container={rootElement} open={open} onClose={handleClose}>
      <FormProvider {...methods}>
        <Box
          component="form"
          className="flex flex-col py-7 px-8"
          onSubmit={handleSubmit(onSubmitHandler)}
          noValidate
          autoComplete="off"
        >
          <Title type="section" label={t("Select a reason for declining the application")} className="mb-4" />

          <Checkbox
            fieldClassName="mb-0"
            name="compliance_checks_failed"
            defaultValue={false}
            label={t("Compliance checks failed")}
          />
          <Checkbox
            fieldClassName="mb-0"
            name="poor_credit_history"
            defaultValue={false}
            label={t("Poor credit history")}
          />
          <Checkbox fieldClassName="mb-0" name="risk_of_fraud" defaultValue={false} label={t("Risk of fraud")} />
          <Checkbox fieldClassName="mb-0" name="other" defaultValue={false} label={t("Other")} />
          <FormInput
            labelClassName="mb-1"
            disabled={!watch("other")}
            multiline
            name="other_reason"
            label={t("Please specify")}
            big={false}
            rows={3}
          />

          <div className="mt-4 grid grid-cols-1 gap-4 md:flex md:justify-end md:gap-0">
            <div>
              <Button
                primary={false}
                disabled={isLoading}
                className="md:mr-4"
                label={t("Cancel")}
                onClick={handleClose}
              />
            </div>

            <div>
              <Button label={t("Reject")} type="submit" disabled={isLoading} />
            </div>
          </div>
        </Box>
      </FormProvider>
    </Dialog>
  );
}

export default RejectApplicationDialog;
