import { Box, Paper, Table, TableBody, TableContainer, TableHead, TableRow } from "@mui/material";
import { useState } from "react";
import { useTranslation as useT } from "react-i18next";
import Minus from "src/assets/icons/minus.svg";
import Plus from "src/assets/icons/plus.svg";

import useLocalizedDateFormatter from "../hooks/useLocalizedDateFormatter";
import type { IAward } from "../schemas/application";
import Loader from "../stories/loader/Loader";
import { formatCurrency } from "../util";
import type { ApplicationTableAwardDataRowProps } from "./ApplicationTableDataRow";
import DataAvailability from "./DataAvailability";
import { DataTableCell, DataTableHeadCell, DataTableHeadLabel } from "./DataTable";

type ApplicationTableDataPreviousAwardRowProps = Omit<
  ApplicationTableAwardDataRowProps,
  "name" | "missingData" | "award" | "readonly" | "formLabel"
> & {
  previousAwards?: IAward[];
};

const getIcon = (open: boolean) => {
  let icon = Minus;

  if (!open) {
    icon = Plus;
  }

  return <img className="self-end" src={icon} alt={`icon-${open ? "minus" : "plus"}`} />;
};

function ApplicationTableDataPreviousAwardRow({
  label,
  isLoading,
  previousAwards = undefined,
  preWhitespace,
}: ApplicationTableDataPreviousAwardRowProps) {
  const { t } = useT();
  const { formatDateFromString } = useLocalizedDateFormatter();

  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(!open);
  };

  const missing = !previousAwards || previousAwards.length === 0;
  return (
    <>
      <TableRow>
        <DataTableCell>{label}</DataTableCell>
        <DataTableCell>
          <DataAvailability available={!missing} label={label} readonly />
        </DataTableCell>
        {!missing && (
          <DataTableCell className={preWhitespace ? "whitespace-pre" : ""}>
            <Box className="flex flex-row items-center justify-between" onClick={handleToggle}>
              {t("Data available for {{previos_awards_count}} previous contracts", {
                previos_awards_count: previousAwards?.length,
              })}
              <Box className="self-end">{getIcon(open)}</Box>
            </Box>
          </DataTableCell>
        )}
        {missing && (
          <DataTableCell className={preWhitespace ? "whitespace-pre" : ""}>
            {t("There are not previous contracts")}
          </DataTableCell>
        )}
      </TableRow>
      {open && (
        <TableRow>
          <DataTableCell colSpan={3} className={open ? "bg-soft-gray" : ""}>
            {isLoading && <Loader />}
            {!isLoading && (
              <Paper elevation={0} square className="bg-soft-gray p-1">
                <TableContainer>
                  <Table aria-labelledby="application-table" size="medium">
                    <TableHead>
                      <TableRow>
                        <DataTableHeadCell width={260}>
                          <DataTableHeadLabel label={t("Contract Title")} />
                        </DataTableHeadCell>
                        <DataTableHeadCell width={240}>
                          <DataTableHeadLabel label={t("Buyer")} />
                        </DataTableHeadCell>
                        <DataTableHeadCell>
                          <DataTableHeadLabel label={t("Start Date")} />
                        </DataTableHeadCell>
                        <DataTableHeadCell>
                          <DataTableHeadLabel label={t("End Date")} />
                        </DataTableHeadCell>
                        <DataTableHeadCell>
                          <DataTableHeadLabel label={t("Contract Value")} />
                        </DataTableHeadCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {previousAwards?.map((award: IAward) => (
                        <TableRow key={award.id}>
                          <DataTableCell>
                            {!award.title && <Box className="opacity-50">{t("Data not available")}</Box>}
                            {award.title}
                          </DataTableCell>
                          <DataTableCell>
                            {!award.buyer_name && <Box className="opacity-50">{t("Data not available")}</Box>}
                            {award.buyer_name}
                          </DataTableCell>
                          <DataTableCell>
                            {!award.contractperiod_startdate && (
                              <Box className="opacity-50">{t("Data not available")}</Box>
                            )}

                            {award.contractperiod_startdate && formatDateFromString(award.contractperiod_startdate)}
                          </DataTableCell>
                          <DataTableCell>
                            {!award.contractperiod_enddate && (
                              <Box className="opacity-50">{t("Data not available")}</Box>
                            )}

                            {award.contractperiod_enddate && formatDateFromString(award.contractperiod_enddate)}
                          </DataTableCell>
                          <DataTableCell>{`${award.award_currency} ${formatCurrency(
                            award.award_amount,
                            award.award_currency,
                          )}`}</DataTableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            )}
          </DataTableCell>
        </TableRow>
      )}
    </>
  );
}

export default ApplicationTableDataPreviousAwardRow;
