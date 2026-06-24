import { Paper, Table, TableBody, TableContainer, TableHead, TableRow } from "@mui/material";
import { useTranslation as useT } from "react-i18next";

import useGetPreviousAwards from "../hooks/useGetPreviousAwards";
import useLocalizedDateFormatter from "../hooks/useLocalizedDateFormatter";
import useUpdateAward from "../hooks/useUpdateAward";
import type { IApplication, IUpdateAward } from "../schemas/application";
import { formatCurrency, formatPaymentMethod } from "../util";
import ApplicationTableDataAwardRow from "./ApplicationTableDataAwardRow";
import ApplicationTableDataPreviousAwardRow from "./ApplicationTableDataPreviousAwardRow";
import { DataTableHeadCell, DataTableHeadLabel } from "./DataTable";

interface ApplicationAwardTableProps {
  application: IApplication;
  readonly?: boolean;
  className?: string;
}

function ApplicationAwardTable({ application, readonly = false, className = "" }: ApplicationAwardTableProps) {
  const { t } = useT();
  const { formatDateFromString } = useLocalizedDateFormatter();
  const { updateAwardMutation, isLoading } = useUpdateAward();
  const { data: previousAwards, isLoading: isLoadingPreviousAwards } = useGetPreviousAwards(application.id);

  const { award } = application;

  // biome-ignore lint/suspicious/noExplicitAny: value type depends on the field being updated
  const updateValue = (value: any, name: keyof IUpdateAward) => {
    const payload: IUpdateAward = {
      application_id: application.id,
      [name]: value,
    };

    updateAwardMutation(payload);
  };

  return (
    <Paper elevation={0} square className={className}>
      <TableContainer>
        <Table aria-labelledby="application-table" size="medium">
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
            </TableRow>
          </TableHead>
          <TableBody>
            <ApplicationTableDataAwardRow
              isLoading={isLoading}
              readonly={readonly}
              updateValue={updateValue}
              missingData={award.missing_data}
              name="title"
              label={t("Award Title")}
              award={award}
              modifiedFields={application.modified_data_fields?.award_updates}
            />
            <ApplicationTableDataAwardRow
              isLoading={isLoading}
              readonly={readonly}
              updateValue={updateValue}
              missingData={award.missing_data}
              name="contracting_process_id"
              label={t("Contracting Process ID")}
              award={award}
              modifiedFields={application.modified_data_fields?.award_updates}
            />
            <ApplicationTableDataAwardRow
              isLoading={isLoading}
              readonly={readonly}
              updateValue={updateValue}
              missingData={award.missing_data}
              name="description"
              label={t("Award Description")}
              award={award}
              modifiedFields={application.modified_data_fields?.award_updates}
            />
            <ApplicationTableDataAwardRow
              type="date-field"
              isLoading={isLoading}
              readonly={readonly}
              updateValue={updateValue}
              missingData={award.missing_data}
              name="award_date"
              label={t("Award Date")}
              award={award}
              formatter={formatDateFromString}
              modifiedFields={application.modified_data_fields?.award_updates}
            />
            <ApplicationTableDataAwardRow
              type="currency"
              isLoading={isLoading}
              readonly={readonly}
              updateValue={updateValue}
              missingData={award.missing_data}
              name="award_amount"
              label={t("Award Value Currency & Amount")}
              formLabel={t("Award Amount")}
              award={award}
              formatter={(value) => `${award.award_currency} ${formatCurrency(value, award.award_currency)}`}
              modifiedFields={application.modified_data_fields?.award_updates}
            />
            <ApplicationTableDataAwardRow
              type="date-field"
              isLoading={isLoading}
              readonly={readonly}
              updateValue={updateValue}
              missingData={award.missing_data}
              name="contractperiod_startdate"
              label={t("Contract Start Date")}
              award={award}
              formatter={formatDateFromString}
              modifiedFields={application.modified_data_fields?.award_updates}
            />
            <ApplicationTableDataAwardRow
              type="date-field"
              isLoading={isLoading}
              readonly={readonly}
              updateValue={updateValue}
              missingData={award.missing_data}
              name="contractperiod_enddate"
              label={t("Contract End Date")}
              award={award}
              formatter={formatDateFromString}
              modifiedFields={application.modified_data_fields?.award_updates}
            />
            <ApplicationTableDataAwardRow
              preWhitespace
              isLoading={isLoading}
              readonly={readonly}
              updateValue={updateValue}
              missingData={award.missing_data}
              name="payment_method"
              label={t("Payment Method")}
              award={award}
              formatter={formatPaymentMethod}
              modifiedFields={application.modified_data_fields?.award_updates}
            />
            <ApplicationTableDataAwardRow
              isLoading={isLoading}
              readonly={readonly}
              updateValue={updateValue}
              missingData={award.missing_data}
              name="buyer_name"
              label={t("Buyer Name")}
              award={award}
              modifiedFields={application.modified_data_fields?.award_updates}
            />
            <ApplicationTableDataAwardRow
              isLoading={isLoading}
              readonly={readonly}
              updateValue={updateValue}
              missingData={award.missing_data}
              name="procurement_method"
              label={t("Procurement Method")}
              award={award}
              modifiedFields={application.modified_data_fields?.award_updates}
            />
            <ApplicationTableDataAwardRow
              isLoading={isLoading}
              readonly={readonly}
              updateValue={updateValue}
              missingData={award.missing_data}
              name="procurement_category"
              label={t("Contract Type")}
              award={award}
              modifiedFields={application.modified_data_fields?.award_updates}
            />
            <ApplicationTableDataPreviousAwardRow
              label={t("Previous Public Sector Contracts")}
              isLoading={isLoadingPreviousAwards}
              previousAwards={previousAwards}
            />
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export default ApplicationAwardTable;
