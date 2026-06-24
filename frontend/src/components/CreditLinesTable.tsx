import { Box, Link as MUILink, Paper, Table, TableBody, TableContainer, TableHead, TableRow } from "@mui/material";
import { useTranslation as useT } from "react-i18next";
import ReactMarkdown from "react-markdown";
import Text from "src/stories/text/Text";

import type { ICreditProduct } from "../schemas/application";
import Button from "../stories/button/Button";
import { formatCurrency } from "../util";
import { DataTableCell, DataTableHeadCell, DataTableHeadLabel, TransparentDataTableCell } from "./DataTable";

interface CreditLinesTableProps {
  rows: ICreditProduct[];
  currency: string;
  isLoading?: boolean;
  selectOption: (value: ICreditProduct) => void;
}

function CreditLinesTable({ rows, currency, isLoading = false, selectOption }: CreditLinesTableProps) {
  const { t } = useT();

  if (!rows.length && !isLoading) {
    return <Text>{t("No credit line options available")}</Text>;
  }

  return (
    <Box>
      <Paper elevation={0} square className="bg-background">
        <TableContainer>
          <Table aria-labelledby="credit-lines-table" size="medium">
            <TableHead>
              <TableRow>
                <DataTableHeadCell width={240}>
                  <span style={{ width: "240px" }} />
                </DataTableHeadCell>
                {rows.map((row) => (
                  <DataTableHeadCell key={`header-${row.id}`}>
                    {row.lender.logo_filename ? (
                      <img
                        src={`/images/lenders/${row.lender.logo_filename}`}
                        alt="lender-logo"
                        style={{ width: "8rem" }}
                      />
                    ) : (
                      <DataTableHeadLabel label={row.lender.name} />
                    )}
                  </DataTableHeadCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <DataTableCell width={240}>{t("Max amount")}</DataTableCell>
                {rows.map((row) => (
                  <DataTableCell key={`amount-${row.id}`}>
                    {`${currency} ${formatCurrency(row.upper_limit, currency)}`}
                  </DataTableCell>
                ))}
              </TableRow>
              <TableRow>
                <DataTableCell>{t("Additional Information")}</DataTableCell>
                {rows.map((row) => (
                  <DataTableCell key={`additional-information-${row.id}`}>{row.additional_information}</DataTableCell>
                ))}
              </TableRow>
              <TableRow>
                <DataTableCell>{t("Interest rate")}</DataTableCell>
                {rows.map((row) => (
                  <DataTableCell key={`interest-rate-${row.id}`}>{row.interest_rate}</DataTableCell>
                ))}
              </TableRow>
              <TableRow>
                <DataTableCell>{t("Other fees")}</DataTableCell>
                {rows.map((row) => (
                  <DataTableCell key={`other-fees-details-${row.id}`}>
                    <ReactMarkdown>{row.other_fees_description}</ReactMarkdown>
                  </DataTableCell>
                ))}
              </TableRow>
              <TableRow>
                <DataTableCell>{t("More information")}</DataTableCell>
                {rows.map((row) => (
                  <DataTableCell key={`more-info-${row.id}`}>
                    <MUILink color="inherit" target="_blank" rel="noreferrer" href={row.more_info_url}>
                      {t("View details")}
                    </MUILink>
                  </DataTableCell>
                ))}
              </TableRow>
              <TableRow className="border-0">
                <TransparentDataTableCell />
                {rows.map((row) => (
                  <TransparentDataTableCell key={`pick-${row.id}`}>
                    <Button disabled={isLoading} label={t("Select")} onClick={() => selectOption(row)} />
                  </TransparentDataTableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}

export default CreditLinesTable;
