import { useMemo } from "react";
import { useTranslation as useT } from "react-i18next";
import { Link } from "react-router";
import type { ICreditProduct } from "../schemas/application";
import LinkButton from "../stories/link-button/LinkButton";
import { RenderSize, renderCreditProductType } from "../util";
import { DataTable, type HeadCell } from "./DataTable";

const CreditProductDataTable = DataTable<ICreditProduct>;

interface CreditProductListProps {
  rows: ICreditProduct[];
}

function CreditProductList({ rows }: CreditProductListProps) {
  const { t } = useT();

  const headCells: HeadCell<ICreditProduct>[] = useMemo(
    () => [
      {
        id: "borrower_size",
        disablePadding: false,
        label: t("Borrower size"),
        sortable: false,
        render: (row: ICreditProduct) => RenderSize(row.borrower_size),
      },
      {
        id: "lower_limit",
        type: "currency",
        disablePadding: false,
        label: t("Lower"),
        sortable: false,
      },
      {
        id: "upper_limit",
        type: "currency",
        disablePadding: false,
        label: t("Upper"),
        sortable: false,
      },

      {
        id: "interest_rate",
        disablePadding: false,
        label: t("Interest rate"),
        sortable: false,
      },
      {
        id: "type",
        disablePadding: false,
        label: t("Type"),
        sortable: false,
        render: (row: ICreditProduct) => renderCreditProductType(row.type),
      },
    ],
    [t],
  );

  const actions = useMemo(
    () => (row: ICreditProduct) => (
      <LinkButton
        className="p-1 justify-start"
        component={Link}
        to={`/settings/lender/${row.lender_id}/credit-product/${row.id}/edit`}
        label={t("Edit")}
        size="small"
        noIcon
      />
    ),
    [t],
  );

  return <CreditProductDataTable rows={rows} useEmptyRows={false} headCells={headCells} actions={actions} />;
}

export default CreditProductList;
