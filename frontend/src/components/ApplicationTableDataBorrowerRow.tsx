import { TableRow } from "@mui/material";
import { useTranslation as useT } from "react-i18next";

import type { IUpdateBorrower } from "../schemas/application";
import type { ApplicationTableBorrowerDataRowProps } from "./ApplicationTableDataRow";
import DataAvailability from "./DataAvailability";
import DataAvailabilityForm from "./DataAvailabilityForm";
import { DataTableCell } from "./DataTable";
import DataVerificationForm from "./DataVerificationForm";

const DATA_REQUESTED_FROM_MSME = ["size", "sector", "annual_revenue"];
function ApplicationTableDataBorrowerRow({
  label,
  name,
  useTranslation = false,
  borrower,
  formLabel = undefined,
  missingData,
  verifiedData,
  type = undefined,
  formatter = undefined,
  preWhitespace = false,
  updateValue = undefined,
  verifyData,
  withoutVerify = false,
  isLoading,
  readonly,
  modifiedFields = undefined,
}: ApplicationTableBorrowerDataRowProps) {
  const { t } = useT();

  // biome-ignore lint/suspicious/noExplicitAny: borrower field types are heterogeneous (string, number, unknown)
  const value = borrower[name] as any;
  const missing = missingData[name] === undefined ? true : missingData[name];

  const verified = verifiedData?.[name] || false;

  let formattedValue = formatter ? formatter(value) : value;
  if (useTranslation) {
    formattedValue = t(formattedValue);
  }

  const verifyDataValue = (verify: boolean) => {
    if (verifyData) {
      verifyData(verify, name as keyof IUpdateBorrower);
    }
  };

  return (
    <TableRow>
      <DataTableCell>{label}</DataTableCell>
      <DataTableCell>
        <DataAvailability
          available={DATA_REQUESTED_FROM_MSME.includes(name) || !missing}
          name={name}
          label={label}
          readonly={readonly}
          modifiedFields={modifiedFields}
        />
      </DataTableCell>
      {(!missing || withoutVerify) && (
        <DataTableCell className={preWhitespace ? "whitespace-pre" : ""}>{formattedValue}</DataTableCell>
      )}
      {missing && updateValue && (
        <DataTableCell>
          <DataAvailabilityForm
            type={type}
            readonly={readonly}
            name={formLabel || label}
            value={value ? formattedValue : value}
            isLoading={isLoading}
            // biome-ignore lint/suspicious/noExplicitAny: value type depends on the field being updated
            updateValue={(value: any) => updateValue(value, name as keyof IUpdateBorrower)}
          />
        </DataTableCell>
      )}
      <DataTableCell>
        <DataVerificationForm
          name={name}
          customLabel={withoutVerify ? t("Completed by business") : undefined}
          value={verified || Boolean(withoutVerify)}
          readonly={readonly || !verifyData}
          verifyData={verifyDataValue}
          isLoading={verifyData ? isLoading : true}
        />
      </DataTableCell>
    </TableRow>
  );
}

export default ApplicationTableDataBorrowerRow;
