import { Box, Dialog } from "@mui/material";
import { useTranslation as useT } from "react-i18next";
import useLapseApplication from "src/hooks/useLapseApplication";
import useApplicationContext from "src/hooks/useSecureApplicationContext";
import Button from "src/stories/button/Button";
import Title from "src/stories/title/Title";

interface LapseApplicationDialogProps {
  open: boolean;
  handleClose: () => void;
}

function LapseApplicationDialog({ open, handleClose }: LapseApplicationDialogProps) {
  const { t } = useT();
  const applicationContext = useApplicationContext();
  const application = applicationContext.state.data;
  const { isLoading, lapseApplicationMutation } = useLapseApplication();

  const rootElement = document.getElementById("root-app");

  return (
    <Dialog fullWidth maxWidth="sm" container={rootElement} open={open} onClose={handleClose}>
      <Box component="form" className="flex flex-col py-7 px-8" autoComplete="off">
        <Title type="section" label={t("Confirm you want to mark this application as lapsed")} className="mb-4" />

        <div>
          {t(
            "Are you sure you want to mark this application as lapsed? This action can't be undone. The application won't be listed in your application list anymore and you won't be able to approve or reject the application.",
          )}
        </div>

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
            <Button
              label={t("Lapse")}
              disabled={isLoading}
              onClick={() => {
                if (application?.id) {
                  lapseApplicationMutation(application?.id);
                }
              }}
            />
          </div>
        </div>
      </Box>
    </Dialog>
  );
}

export default LapseApplicationDialog;
