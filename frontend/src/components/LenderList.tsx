import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useEffect, useMemo, useState } from "react";
import { useTranslation as useT } from "react-i18next";
import { Link } from "react-router";
import { getLendersFn } from "../api/private";
import { QUERY_KEYS } from "../constants";
import type { ILender, ILenderListResponse } from "../schemas/application";
import LinkButton from "../stories/link-button/LinkButton";
import { renderLenderType } from "../util";
import { DataTable, type HeadCell } from "./DataTable";

const LenderDataTable = DataTable<ILender>;

function LenderList() {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useT();

  const headCells: HeadCell<ILender>[] = useMemo(
    () => [
      {
        id: "name",
        disablePadding: false,
        label: t("Credit Provider"),
        sortable: false,
      },
      {
        id: "created_at",
        type: "date",
        disablePadding: false,
        label: t("Creation Date"),
        sortable: false,
      },
      {
        id: "type",
        disablePadding: false,
        label: t("Type"),
        sortable: false,
        render: (row: ILender) => renderLenderType(row.type),
      },
    ],
    [t],
  );

  const actions = useMemo(
    () => (row: ILender) => (
      <LinkButton
        className="p-1 justify-start"
        component={Link}
        to={`/settings/lender/${row.id}/edit`}
        label={t("Edit")}
        size="small"
        noIcon
      />
    ),
    [t],
  );

  const [rows, setRows] = useState<ILender[]>([]);

  const { data } = useQuery({
    queryKey: [QUERY_KEYS.lenders],
    queryFn: async (): Promise<ILenderListResponse | null> => {
      const response = await getLendersFn();
      return response;
    },
    retry: 1,
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        enqueueSnackbar(t("Error: {{error}}", { error: error.response.data.detail }), {
          variant: "error",
        });
      } else {
        enqueueSnackbar(t("Error loading lenders"), {
          variant: "error",
        });
      }
    },
  });

  useEffect(() => {
    if (data) {
      setRows(data.items);
    }
  }, [data]);

  return <LenderDataTable rows={rows} useEmptyRows={false} headCells={headCells} actions={actions} />;
}

export default LenderList;
