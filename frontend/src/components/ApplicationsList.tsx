import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation as useT } from "react-i18next";
import { Link } from "react-router";
import { RenderStatus } from "src/util";
import { getApplicationsFI, getApplicationsOCP } from "../api/private";
import {
  COMPLETED_STATUS,
  NOT_STARTED_STATUS,
  PAGE_SIZES,
  QUERY_KEYS,
  STARTED_STATUS,
  USER_TYPES,
} from "../constants";
import useDownloadApplication from "../hooks/useDownloadApplication";
import useStartApplication from "../hooks/useStartApplication";
import {
  EXTENDED_APPLICATION_FROM,
  type IApplication,
  type IApplicationsListResponse,
  type IExtendedApplication,
  type PaginationInput,
} from "../schemas/application";
import LinkButton from "../stories/link-button/LinkButton";
import { DataTable, type HeadCell, type Order } from "./DataTable";

type ExtendendApplication = IApplication & IExtendedApplication;
const ApplicationDataTable = DataTable<ExtendendApplication>;

interface ApplicationListProps {
  type: USER_TYPES;
}

function ApplicationList({ type }: ApplicationListProps) {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useT();
  const { startApplicationMutation } = useStartApplication();
  const [idToDownload, setIdToDownload] = useState<number | undefined>();

  const { downloadedApplication, isLoading } = useDownloadApplication(idToDownload);

  const [payload, setPayload] = useState<PaginationInput>({
    page: 0,
    page_size: PAGE_SIZES[0],
    sort_field: "application.borrower_submitted_at",
    sort_order: "desc",
    search_value: "",
  });

  const [rows, setRows] = useState<ExtendendApplication[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const handleChangePage = (newPage: number, rowsPerPage: number) => {
    setPayload((prev) => ({
      ...prev,
      page: newPage,
      page_size: rowsPerPage,
    }));
  };

  const handleRequestSort = (property: Extract<keyof ExtendendApplication, string>, sortOrder: Order) => {
    let sort_field: string = property;
    if (Object.keys(EXTENDED_APPLICATION_FROM).includes(property)) {
      sort_field = EXTENDED_APPLICATION_FROM[property as keyof IExtendedApplication];
    }
    setPayload((prev) => ({
      ...prev,
      sort_field,
      sort_order: sortOrder,
    }));
  };

  const handleSearch = (search_value: string) => {
    setPayload((prev) => ({
      ...prev,
      search_value,
    }));
  };

  const { data } = useQuery({
    queryKey: [QUERY_KEYS.applications, payload],
    queryFn: async (): Promise<IApplicationsListResponse | null> => {
      if (type === USER_TYPES.OCP) {
        const response = await getApplicationsOCP(payload);
        return response;
      }
      const response = await getApplicationsFI(payload);
      return response;
    },
    retry: 1,
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        enqueueSnackbar(t("Error: {{error}}", { error: error.response.data.detail }), {
          variant: "error",
        });
      } else {
        enqueueSnackbar(t("Error loading applications"), {
          variant: "error",
        });
      }
    },
  });

  useEffect(() => {
    if (data) {
      const newRows = data.items.map((item) => ({
        ...item,
        borrower_name: item.borrower.legal_name,
        buyer_name: item.award.buyer_name,
        lender_name: item.lender?.name || t("Not Assigned"),
        award_amount: item.award.award_amount,
      }));
      setRows(newRows);
      setTotalCount(data.count);
    }
  }, [data, t]);

  const headCellsBase: HeadCell<ExtendendApplication>[] = useMemo(
    () => [
      {
        id: "borrower_name",
        disablePadding: false,
        label: t("Name of Company"),
        sortable: true,
      },
      {
        id: "buyer_name",
        disablePadding: false,
        label: t("Buyer"),
        sortable: true,
      },
      {
        id: "award_amount",
        disablePadding: false,
        label: t("Award amount"),
        sortable: true,
        type: "currency",
      },
      {
        id: "amount_requested",
        disablePadding: false,
        label: t("Amount requested"),
        sortable: true,
        type: "currency",
      },
      {
        id: "borrower_submitted_at",
        type: "date",
        disablePadding: false,
        label: t("Submission Date"),
        sortable: false,
        width: 155,
      },
      {
        id: "status",
        type: "label",
        disablePadding: false,
        label: t("Stage"),
        sortable: true,
        render: (row: IApplication) => <RenderStatus status={row.status} />,
      },
    ],
    [t],
  );

  const headCellsOCP: HeadCell<ExtendendApplication>[] = useMemo(
    () => [
      {
        id: "lender_name",
        disablePadding: false,
        label: t("Credit Provider"),
        sortable: true,
        width: 174,
      },
    ],
    [t],
  );

  const headCells = useMemo(
    () => (type === USER_TYPES.OCP ? [...headCellsBase, ...headCellsOCP] : headCellsBase),
    [type, headCellsBase, headCellsOCP],
  );

  const onStartApplicationHandler = useCallback(
    (id: number) => {
      startApplicationMutation(id);
    },
    [startApplicationMutation],
  );

  useEffect(() => {
    if (downloadedApplication) {
      const href = window.URL.createObjectURL(downloadedApplication);

      const anchorElement = document.createElement("a");

      anchorElement.href = href;
      const filename = `${t("application")}-${idToDownload}.zip`;
      anchorElement.download = filename;

      document.body.appendChild(anchorElement);
      anchorElement.click();

      document.body.removeChild(anchorElement);
      window.URL.revokeObjectURL(href);
      setIdToDownload(undefined);
    }
  }, [downloadedApplication, idToDownload, t]);

  const onDownloadApplicationHandler = useCallback((id: number) => {
    setIdToDownload(id);
  }, []);

  const actionsFIBase = useCallback(
    (
      row: ExtendendApplication,
      isLoading: boolean,
      onStartApplicationHandler: (id: number) => void,
      onDownloadApplicationHandler: (id: number) => void,
    ) => (
      <Box className="flex flex-row">
        {STARTED_STATUS.includes(row.status) && (
          <LinkButton
            className="p-1 justify-start"
            component={Link}
            disabled={isLoading}
            to={`/applications/${row.id}/stage-one`}
            label={t("Review")}
            size="small"
            noIcon
          />
        )}
        {STARTED_STATUS.includes(row.status) && (
          <LinkButton
            className="p-1 justify-start"
            component={Link}
            disabled={isLoading}
            to={`/applications/${row.id}/stage-five`}
            label={t("Decide")}
            size="small"
            noIcon
          />
        )}
        {NOT_STARTED_STATUS.includes(row.status) && (
          <LinkButton
            className="p-1 justify-start"
            onClick={() => onStartApplicationHandler(row.id)}
            label={t("Start")}
            disabled={isLoading}
            size="small"
            noIcon
          />
        )}
        {COMPLETED_STATUS.includes(row.status) && (
          <LinkButton
            className="p-1 justify-start"
            component={Link}
            to={`/applications/${row.id}/view`}
            label={t("View")}
            disabled={isLoading}
            size="small"
            noIcon
          />
        )}
        <LinkButton
          className="p-1 justify-start"
          onClick={() => onDownloadApplicationHandler(row.id)}
          label={t("Download")}
          disabled={isLoading}
          size="small"
          noIcon
        />
      </Box>
    ),
    [t],
  );

  const actionsOCP = useCallback(
    (row: ExtendendApplication) => (
      <Box className="flex flex-row">
        <LinkButton
          className="p-1 justify-start"
          component={Link}
          to={`/admin/applications/${row.id}/view`}
          label={t("View")}
          size="small"
          noIcon
        />
        {!COMPLETED_STATUS.includes(row.status) && (
          <LinkButton
            className="p-1 justify-start"
            component={Link}
            to={`/admin/applications/${row.id}/update`}
            label={t("Update")}
            size="small"
            noIcon
          />
        )}
      </Box>
    ),
    [t],
  );

  const actionsFI = (row: ExtendendApplication, isLoading?: boolean) =>
    actionsFIBase(
      row,
      isLoading !== undefined ? isLoading : false,
      onStartApplicationHandler,
      onDownloadApplicationHandler,
    );

  return (
    <ApplicationDataTable
      rows={rows}
      useEmptyRows
      handleRequestSort={handleRequestSort}
      handleSearch={handleSearch}
      headCells={headCells}
      pagination={{
        totalCount,
        handleChangePage,
      }}
      isLoading={isLoading}
      actions={type === USER_TYPES.OCP ? actionsOCP : actionsFI}
    />
  );
}

export default ApplicationList;
