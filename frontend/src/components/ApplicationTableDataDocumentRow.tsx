import { TableRow } from "@mui/material";
import DocumentIcon from "src/assets/icons/document.svg";
import useConstants from "src/hooks/useConstants";

import LinkButton from "../stories/link-button/LinkButton";
import type { ApplicationTableDocumentDataRowProps } from "./ApplicationTableDataRow";
import DataAvailability from "./DataAvailability";
import { DataTableCell } from "./DataTable";
import DataVerificationForm from "./DataVerificationForm";

function ApplicationTableDataDocumentRow({
  document,
  formatter = undefined,
  preWhitespace = false,
  downloadDocument = undefined,
  verifyData,
  isLoading = false,
  readonly = false,
}: ApplicationTableDocumentDataRowProps) {
  const constants = useConstants();
  const value = document.name;
  const missing = false;

  const formattedValue = formatter ? formatter(value) : value;
  const verifyDataValue = (verify: boolean) => {
    if (verifyData) {
      verifyData(verify, document.id);
    }
  };

  return (
    <TableRow>
      <DataTableCell>
        {(constants?.BorrowerDocumentType || []).filter((d) => d.value === document.type)[0]?.label || ""}
      </DataTableCell>
      <DataTableCell>
        <DataAvailability available={!missing} label={document.type} readonly={readonly} />
      </DataTableCell>
      {!downloadDocument && (
        <DataTableCell className={preWhitespace ? "whitespace-pre" : ""}>{formattedValue}</DataTableCell>
      )}
      {downloadDocument && (
        <DataTableCell>
          <LinkButton
            className="p-1 justify-start"
            onClick={() => downloadDocument(document.id, document.name)}
            label={value}
            size="small"
            icon={DocumentIcon}
          />
        </DataTableCell>
      )}
      <DataTableCell>
        <DataVerificationForm
          name={document.type}
          value={document.verified}
          readonly={readonly}
          verifyData={verifyDataValue}
          isLoading={verifyData ? isLoading : true}
        />
      </DataTableCell>
    </TableRow>
  );
}

export default ApplicationTableDataDocumentRow;
