import { Box } from "@mui/material";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useState } from "react";
import { useTranslation as useT } from "react-i18next";
import { uploadFileFn } from "src/api/public";
import Text from "src/stories/text/Text";

import useApplicationContext from "../hooks/useApplicationContext";
import useSecureApplicationContext from "../hooks/useSecureApplicationContext";
import type { IBorrowerDocument, UploadFileInput } from "../schemas/application";
import LinkButton from "../stories/link-button/LinkButton";
import FileUploader from "./FileUploader";

interface DocumentFieldProps {
  className?: string;
  label: string;
  secure?: boolean;
  documentType: string;
  setUploadState?: React.Dispatch<
    React.SetStateAction<{
      [key: string]: boolean;
    }>
  >;
}

function DocumentField({
  label,
  documentType,
  secure = false,
  className = "",
  setUploadState = undefined,
}: DocumentFieldProps) {
  const { t } = useT();
  const { enqueueSnackbar } = useSnackbar();
  const [current, setCurrent] = useState<IBorrowerDocument | undefined>();
  const [showUploader, setShowUploader] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  const applicationContext = useApplicationContext();
  const secureApplicationContext = useSecureApplicationContext();

  useEffect(() => {
    let documents = applicationContext.state.data?.documents;
    if (secure) {
      documents = secureApplicationContext.state.data?.borrower_documents;
    }

    if (documents) {
      const currentDocument = documents.find((document: IBorrowerDocument) => document.type === documentType);

      if (currentDocument) {
        setCurrent(currentDocument);
        setShowUploader(false);
        if (setUploadState) setUploadState((prev) => ({ ...prev, [documentType]: true }));
      }
    }
  }, [
    applicationContext.state.data?.documents,
    documentType,
    secure,
    secureApplicationContext.state.data?.borrower_documents,
    setUploadState,
  ]);

  const onAcceptedFile = useCallback(
    async (file: File) => {
      let application = applicationContext.state.data?.application;
      if (secure) {
        application = secureApplicationContext.state.data || undefined;
      }

      if (!application) return;

      try {
        setLoading(true);

        const payload: UploadFileInput = {
          file,
          type: documentType,
          uuid: application?.uuid,
        };

        const uploaded = await uploadFileFn(payload);
        setCurrent(uploaded);

        setLoading(false);
        setShowUploader(false);
        if (setUploadState) setUploadState((prev) => ({ ...prev, [documentType]: true }));
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          if (error.response.data?.detail) {
            enqueueSnackbar(t("Error: {{error}}", { error: error.response.data.detail }), {
              variant: "error",
            });
          }
        } else {
          enqueueSnackbar(t("Error uploading file. {{error}}", { error }), {
            variant: "error",
          });
        }
      }
    },
    [
      applicationContext.state.data?.application,
      documentType,
      enqueueSnackbar,
      secure,
      secureApplicationContext.state.data,
      setUploadState,
      t,
    ],
  );

  return (
    <Box className="mb-8">
      <Text className="mb-4">{label}</Text>
      {current && (
        <Box className="flex flex-row items-center mb-4">
          <Box className="flex flex-col items-start">
            <Text className="mb-0 text-sm">{t("Current uploaded document")}</Text>
            <Text className="mb-0 text-sm font-thin">{current.name}</Text>
          </Box>
          <LinkButton
            className="ml-4 "
            noIcon
            label={showUploader ? t("Keep current") : t("Replace")}
            onClick={() => setShowUploader((prev) => !prev)}
          />
        </Box>
      )}
      {showUploader && <FileUploader loading={loading} className={className} onAcceptedFile={onAcceptedFile} />}
    </Box>
  );
}

export default DocumentField;
