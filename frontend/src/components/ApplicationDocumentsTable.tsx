import { Paper, Table, TableBody, TableContainer, TableHead, TableRow } from "@mui/material";
import { useEffect, useState } from "react";
import { useTranslation as useT } from "react-i18next";

import useDownloadDocument from "../hooks/useDownloadDocument";
import useVerifyDocument from "../hooks/useVerifyDocument";
import type { IApplication, IVerifyDocument } from "../schemas/application";
import ApplicationTableDataDocumentRow from "./ApplicationTableDataDocumentRow";
import { DataTableHeadCell, DataTableHeadLabel } from "./DataTable";

interface ApplicationDocumentTableProps {
  application: IApplication;
  readonly?: boolean;
  allowDataVerification?: boolean;
  className?: string;
}

function ApplicationDocumentTable({
  application,
  readonly = false,
  allowDataVerification = false,
  className = "",
}: ApplicationDocumentTableProps) {
  const { t } = useT();
  const [idToDownload, setIdToDownload] = useState<number | undefined>();
  const [filename, setFilename] = useState<string | undefined>();
  const { downloadedDocument, isLoading } = useDownloadDocument(idToDownload);
  const { verifyDocumentMutation, isLoading: isLoadingVerifyDocument } = useVerifyDocument();

  const { borrower_documents } = application;

  const downloadDocument = async (id: number, name: string) => {
    setIdToDownload(id);
    setFilename(name);
  };

  useEffect(() => {
    if (downloadedDocument && filename) {
      const href = window.URL.createObjectURL(downloadedDocument);

      const anchorElement = document.createElement("a");

      anchorElement.href = href;
      anchorElement.download = filename;

      document.body.appendChild(anchorElement);
      anchorElement.click();

      document.body.removeChild(anchorElement);
      window.URL.revokeObjectURL(href);
      setIdToDownload(undefined);
    }
  }, [downloadedDocument, filename]);

  const verifyDataField = (value: boolean, id: number) => {
    const payload: IVerifyDocument = {
      document_id: id,
      verified: value,
    };

    verifyDocumentMutation(payload);
  };

  return (
    <Paper elevation={0} square className={className}>
      <TableContainer>
        <Table aria-labelledby="documents-table" size="medium">
          <TableHead>
            <TableRow>
              <DataTableHeadCell width={260}>
                <DataTableHeadLabel label={t("Open Contracting Field")} />
              </DataTableHeadCell>
              <DataTableHeadCell width={240}>
                <DataTableHeadLabel label={t("Data Available")} />
              </DataTableHeadCell>
              <DataTableHeadCell>
                <DataTableHeadLabel label={t("Data")} />
              </DataTableHeadCell>
              <DataTableHeadCell>
                <DataTableHeadLabel label={t("Data Verified")} />
              </DataTableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {borrower_documents.map((document) => (
              <ApplicationTableDataDocumentRow
                key={`document-${document.id}`}
                isLoading={isLoadingVerifyDocument || isLoading}
                readonly={readonly}
                downloadDocument={downloadDocument}
                verifyData={allowDataVerification ? verifyDataField : undefined}
                document={document}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default ApplicationDocumentTable;
