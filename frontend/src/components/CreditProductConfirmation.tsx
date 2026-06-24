import { Paper, Table, TableBody, TableContainer, TableHead, TableRow } from "@mui/material";
import { useTranslation as useT } from "react-i18next";
import ReactMarkdown from "react-markdown";

import { CREDIT_PRODUCT_TYPE } from "../constants";
import useLocalizedDateFormatter from "../hooks/useLocalizedDateFormatter";
import type { IApplication, ICreditProduct } from "../schemas/application";
import Title from "../stories/title/Title";
import { formatCurrency } from "../util";
import { DataTableCell, DataTableHeadCell, DataTableHeadLabel } from "./DataTable";

interface CreditProductConfirmationProps {
  creditProduct: ICreditProduct;
  application: IApplication;
}

function CreditProductConfirmation({ creditProduct, application }: CreditProductConfirmationProps) {
  const { t } = useT();
  const { formatDateFromString } = useLocalizedDateFormatter();

  const isLoan = creditProduct.type === CREDIT_PRODUCT_TYPE.LOAN;

  return (
    <>
      <Title type="subsection" className="mb-2" label={isLoan ? t("Loan") : t("Credit Line")} />

      <Paper elevation={0} square className="bg-background">
        <TableContainer>
          <Table aria-labelledby="credit-product-confirmation-table" size="medium">
            <TableHead>
              <TableRow>
                <DataTableHeadCell>
                  <DataTableHeadLabel label={t("Lender")} />
                </DataTableHeadCell>

                <DataTableHeadCell>
                  <DataTableHeadLabel label={t("Requested amount")} />
                </DataTableHeadCell>

                {isLoan && (
                  <DataTableHeadCell>
                    <DataTableHeadLabel label={t("Repayment")} />
                  </DataTableHeadCell>
                )}
                <DataTableHeadCell>
                  <DataTableHeadLabel label={t("Additional information")} />
                </DataTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <DataTableCell>{creditProduct.lender.name}</DataTableCell>
                <DataTableCell>
                  {application.currency}{" "}
                  {formatCurrency(application.calculator_data.amount_requested || 0, application.currency)}
                </DataTableCell>

                {isLoan && (
                  <DataTableCell>
                    {t("{{repayment_years}} year(s), {{repayment_months}} month(s)", {
                      repayment_years: application.calculator_data.repayment_years,
                      repayment_months: application.calculator_data.repayment_months,
                    })}
                  </DataTableCell>
                )}
                <DataTableCell>{creditProduct.additional_information}</DataTableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper elevation={0} square className="bg-background mt-4">
        <TableContainer>
          <Table aria-labelledby="credit-product-confirmation-table" size="medium">
            <TableHead>
              <TableRow>
                {isLoan && (
                  <DataTableHeadCell>
                    <DataTableHeadLabel label={t("Payment start date")} />
                  </DataTableHeadCell>
                )}

                <DataTableHeadCell>
                  <DataTableHeadLabel label={t("Interest rate")} />
                </DataTableHeadCell>

                <DataTableHeadCell>
                  <DataTableHeadLabel label={t("Other fees")} />
                </DataTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {isLoan && (
                  <DataTableCell>{formatDateFromString(application.calculator_data.payment_start_date)}</DataTableCell>
                )}
                <DataTableCell>{creditProduct.interest_rate}</DataTableCell>
                <DataTableCell>
                  <ReactMarkdown>{creditProduct.other_fees_description}</ReactMarkdown>
                </DataTableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}

export default CreditProductConfirmation;
