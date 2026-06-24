import { Paper, Table, TableBody, TableContainer, TableHead, TableRow } from "@mui/material";
import { useTranslation as useT } from "react-i18next";

import useUpdateBorrower from "../hooks/useUpdateBorrower";
import useVerifyDataField from "../hooks/useVerifyDataField";
import type { IApplication, IUpdateBorrower } from "../schemas/application";
import { formatCurrency, RenderSector, RenderSize } from "../util";
import ApplicationTableDataBorrowerRow from "./ApplicationTableDataBorrowerRow";
import { DataTableHeadCell, DataTableHeadLabel } from "./DataTable";

interface ApplicationBorrowerTableProps {
  application: IApplication;
  readonly?: boolean;
  allowDataVerification?: boolean;
  className?: string;
}

function ApplicationBorrowerTable({
  application,
  readonly = false,
  allowDataVerification = false,
  className = "",
}: ApplicationBorrowerTableProps) {
  const { t } = useT();
  const { updateBorrowerMutation, isLoading } = useUpdateBorrower();
  const { verifyDataFieldMutation, isLoading: isLoadingVerifyDataField } = useVerifyDataField();

  const { borrower } = application;

  // biome-ignore lint/suspicious/noExplicitAny: value type depends on the field being updated
  const updateValue = (value: any, name: keyof IUpdateBorrower) => {
    const payload: IUpdateBorrower = {
      application_id: application.id,
      [name]: value,
    };

    updateBorrowerMutation(payload);
  };

  const verifyDataField = (value: boolean, name: keyof IUpdateBorrower) => {
    const payload: IUpdateBorrower = {
      application_id: application.id,
      [name]: value,
    };

    verifyDataFieldMutation(payload);
  };

  return (
    <Paper elevation={0} square className={className}>
      <TableContainer>
        <Table aria-labelledby="borrower-table" size="medium">
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
            <ApplicationTableDataBorrowerRow
              isLoading={isLoading || isLoadingVerifyDataField}
              readonly={readonly}
              verifiedData={application.secop_data_verification}
              updateValue={updateValue}
              verifyData={allowDataVerification ? verifyDataField : undefined}
              missingData={borrower.missing_data}
              name="legal_name"
              label={t("Legal Name")}
              borrower={borrower}
              modifiedFields={application.modified_data_fields?.borrower_updates}
            />
            <ApplicationTableDataBorrowerRow
              preWhitespace
              isLoading={isLoading || isLoadingVerifyDataField}
              readonly={readonly}
              verifiedData={application.secop_data_verification}
              updateValue={updateValue}
              verifyData={allowDataVerification ? verifyDataField : undefined}
              missingData={borrower.missing_data}
              name="address"
              label={t("Address")}
              borrower={borrower}
              modifiedFields={application.modified_data_fields?.borrower_updates}
            />
            <ApplicationTableDataBorrowerRow
              isLoading={isLoading || isLoadingVerifyDataField}
              readonly={readonly}
              verifiedData={application.secop_data_verification}
              updateValue={updateValue}
              verifyData={allowDataVerification ? verifyDataField : undefined}
              missingData={borrower.missing_data}
              name="legal_identifier"
              label={t("National Tax ID")}
              borrower={borrower}
              modifiedFields={application.modified_data_fields?.borrower_updates}
            />
            <ApplicationTableDataBorrowerRow
              isLoading={isLoading || isLoadingVerifyDataField}
              readonly={readonly}
              verifiedData={application.secop_data_verification}
              updateValue={updateValue}
              verifyData={allowDataVerification ? verifyDataField : undefined}
              missingData={borrower.missing_data}
              name="type"
              label={t("Registration Type")}
              borrower={borrower}
              modifiedFields={application.modified_data_fields?.borrower_updates}
            />
            <ApplicationTableDataBorrowerRow
              isLoading={isLoading || isLoadingVerifyDataField}
              readonly
              withoutVerify
              useTranslation
              name="size"
              label={t("Size")}
              missingData={borrower.missing_data}
              verifiedData={application.secop_data_verification}
              borrower={borrower}
              formatter={RenderSize}
              modifiedFields={application.modified_data_fields?.borrower_updates}
            />
            <ApplicationTableDataBorrowerRow
              isLoading={isLoading || isLoadingVerifyDataField}
              readonly
              withoutVerify
              useTranslation
              name="sector"
              label={t("Sector")}
              missingData={borrower.missing_data}
              verifiedData={application.secop_data_verification}
              borrower={borrower}
              formatter={RenderSector}
              modifiedFields={application.modified_data_fields?.borrower_updates}
            />
            <ApplicationTableDataBorrowerRow
              isLoading={isLoading || isLoadingVerifyDataField}
              readonly
              withoutVerify
              useTranslation
              name="annual_revenue"
              label={t("Annual Revenue")}
              missingData={borrower.missing_data}
              verifiedData={application.secop_data_verification}
              borrower={borrower}
              formatter={(value) =>
                value ? `${borrower.currency} ${formatCurrency(value, borrower.currency)}` : t("Not informed")
              }
              modifiedFields={application.modified_data_fields?.borrower_updates}
            />
            <ApplicationTableDataBorrowerRow
              isLoading={isLoading || isLoadingVerifyDataField}
              readonly={readonly}
              verifiedData={application.secop_data_verification}
              updateValue={updateValue}
              verifyData={allowDataVerification ? verifyDataField : undefined}
              missingData={borrower.missing_data}
              name="email"
              label={t("Business Email")}
              borrower={borrower}
              modifiedFields={application.modified_data_fields?.borrower_updates}
            />
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default ApplicationBorrowerTable;
