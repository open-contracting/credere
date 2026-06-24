import { TextField } from "@mui/material";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell, { type TableCellProps } from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { type ChangeEvent, type JSX, type MouseEvent, useEffect, useMemo, useState } from "react";
import { useTranslation as useT } from "react-i18next";
import SorterIcon from "src/assets/icons/sorter.svg";
import SorterDownIcon from "src/assets/icons/sorter-down.svg";
import SorterUpIcon from "src/assets/icons/sorter-up.svg";
import { twMerge } from "tailwind-merge";

import { PAGE_SIZES } from "../constants";
import useLocalizedDateFormatter from "../hooks/useLocalizedDateFormatter";
import { formatCurrency } from "../util";

function Sorter() {
  return <img className="pl-2" src={SorterIcon} alt="sorter-icon" />;
}

function SorterDirection({ className }: { className: string }) {
  let icon = SorterUpIcon;
  let alt = "sorter-up-icon";
  if (className.includes("MuiTableSortLabel-iconDirectionDesc")) {
    alt = "sorter-down-icon";
    icon = SorterDownIcon;
  }

  return <img className="pl-2 transition" src={icon} alt={alt} />;
}

function descendingComparator<T>(a: T, b: T, orderBy: Extract<keyof T, string>) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export type Order = "asc" | "desc";

// Since 2020 all major browsers ensure sort stability with Array.prototype.sort().
// stableSort() brings sort stability to non-modern browsers (notably IE11). If you
// only support modern browsers you can replace stableSort(exampleArray, exampleComparator)
// with exampleArray.slice().sort(exampleComparator)
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) {
      return order;
    }
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

type DataCellType = "date" | "currency" | "label" | undefined;

export interface HeadCell<T> {
  disablePadding: boolean;
  id: Extract<keyof T, string>;
  label: string;
  type?: DataCellType;
  render?: (row: T, headCell: HeadCell<T>) => JSX.Element | string;
  sortable?: boolean;
  width?: number;
}

interface DataTableHeadProps<T> {
  onRequestSort: (event: MouseEvent<unknown>, property: Extract<keyof T, string>) => void;
  order: Order | undefined;
  orderBy: string | undefined;
  headCells: HeadCell<T>[];
  hasActions?: boolean;
}

export function DataTableHeadCell(props: TableCellProps) {
  const { children, className, width } = props;
  return (
    <TableCell
      sx={{ width: width || "auto" }}
      {...props}
      className={twMerge(
        `px-4 py-5 border-solid border-l border-r-0 border-t-0 border-background bg-white ${className}`,
      )}
    >
      {children}
    </TableCell>
  );
}

export function DataTableHeadLabel({ label }: { label: string }) {
  return <span className="flex flex-row justify-between text-moody-blue text-sm font-normal">{label}</span>;
}

export function DataTableCell(props: TableCellProps) {
  const { children, className } = props;
  return (
    <TableCell
      {...props}
      className={twMerge(
        `px-4 text-darkest text-sm font-normal border-solid border-l border-r-0 border-t-0 border-background bg-white ${className}`,
      )}
    >
      {children}
    </TableCell>
  );
}

export function TransparentDataTableCell(props: TableCellProps) {
  const { children, className } = props;
  return (
    <TableCell
      {...props}
      className={twMerge(`px-4 text-darkest text-sm font-normal border-0 bg-background ${className}`)}
    >
      {children}
    </TableCell>
  );
}

function DataTableHead<T>({
  order = "asc",
  orderBy,
  hasActions = false,
  onRequestSort,
  headCells,
}: DataTableHeadProps<T>) {
  const { t } = useT();

  const createSortHandler = (property: Extract<keyof T, string>) => (event: MouseEvent<unknown>) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <DataTableHeadCell
            width={headCell.width}
            key={String(headCell.id)}
            align="left"
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {headCell.sortable && (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                className="flex flex-row justify-between text-moody-blue text-sm font-normal"
                IconComponent={orderBy === headCell.id ? SorterDirection : Sorter}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
              </TableSortLabel>
            )}
            {!headCell.sortable && <DataTableHeadLabel label={headCell.label} />}
          </DataTableHeadCell>
        ))}
        {hasActions && (
          <DataTableHeadCell>
            <DataTableHeadLabel label={t("Actions")} />
          </DataTableHeadCell>
        )}
      </TableRow>
    </TableHead>
  );
}

interface HandlePagination {
  totalCount: number;
  handleChangePage: (newPage: number, rowsPerPage: number) => void;
}

export interface DataTableProps<T> {
  rows: T[];
  headCells: HeadCell<T>[];
  useEmptyRows?: boolean;
  handleRequestSort?: (property: Extract<keyof T, string>, sortOrder: Order) => void;
  handleSearch?: (searchValue: string) => void;
  pagination?: HandlePagination;
  actions?: (row: T, isLoading?: boolean) => JSX.Element;
  isLoading?: boolean;
}

function renderValue<T>(row: T, headCell: HeadCell<T>) {
  if (headCell.render) {
    return headCell.render(row, headCell);
  }

  if (headCell.type === "currency") {
    return formatCurrency(Number(row[headCell.id]));
  }
  return String(row[headCell.id]);
}

export function DataTable<T>({
  rows,
  headCells,
  useEmptyRows = true,
  handleRequestSort = undefined,
  handleSearch = undefined,
  pagination = undefined,
  actions = undefined,
  isLoading = false,
}: DataTableProps<T>) {
  const { t } = useT();
  const { formatDateFromString } = useLocalizedDateFormatter();
  const [visibleRows, setVisibleRows] = useState<T[]>(rows);
  const [order, setOrder] = useState<Order>("asc");
  const [orderBy, setOrderBy] = useState<Extract<keyof T, string> | undefined>();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZES[0]);
  const [searchValue, setSearchQuery] = useState("");

  useEffect(() => {
    if (!handleRequestSort && orderBy) {
      if (order === "desc") {
        setVisibleRows(stableSort(rows, (a, b) => descendingComparator(a, b, orderBy)));
      } else {
        setVisibleRows(stableSort(rows, (a, b) => -descendingComparator(a, b, orderBy)));
      }
    } else {
      setVisibleRows(rows);
    }
  }, [order, orderBy, handleRequestSort, rows]);

  const onRequestSort = (_event: MouseEvent<unknown>, property: Extract<keyof T, string>) => {
    const isAsc = orderBy === property && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";
    setOrder(newOrder);
    setOrderBy(property);
    if (handleRequestSort) {
      handleRequestSort(property, newOrder);
    }
  };

  const onChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
    pagination?.handleChangePage(newPage, rowsPerPage);
  };

  const onChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = Number.parseInt(`${event.target.value}`, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    pagination?.handleChangePage(0, newRowsPerPage);
  };
  const onChangeSearchValue = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSearchQuery(event.target.value);
    if (handleSearch) {
      handleSearch(event.target.value);
    }
  };

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = useMemo(
    () => (useEmptyRows ? Math.max(0, rowsPerPage - rows.length) : 0),
    [rows, rowsPerPage, useEmptyRows],
  );

  return (
    <Box>
      {handleSearch && (
        <Box className="pb-5 w-full">
          <TextField
            className="w-full bg-background bg-white"
            label={t("Search by business: name, email or identifier, or buyer name")}
            onChange={onChangeSearchValue}
            value={searchValue}
          />
        </Box>
      )}

      <Paper elevation={0} square className="bg-background">
        <TableContainer>
          <Table aria-labelledby="data-table" size="medium">
            <DataTableHead
              hasActions={Boolean(actions)}
              order={order}
              orderBy={orderBy}
              onRequestSort={onRequestSort}
              headCells={headCells}
            />
            <TableBody>
              {visibleRows.map((row: T, index) => (
                <TableRow tabIndex={-1} key={String(index)}>
                  {headCells.map((headCell) => (
                    <DataTableCell key={`${String(`${row[headCell.id]}-${index}-${headCell.id}`)}`}>
                      {headCell.type === "label" && renderValue(row, headCell)}
                      {headCell.type !== "date" && headCell.type !== "label" && renderValue(row, headCell)}
                      {headCell.type === "date" && formatDateFromString(String(row[headCell.id]))}
                    </DataTableCell>
                  ))}
                  {actions && <DataTableCell>{actions(row, isLoading)}</DataTableCell>}
                </TableRow>
              ))}

              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 53 * emptyRows,
                  }}
                >
                  <DataTableCell colSpan={headCells.length + (actions ? 1 : 0)} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {pagination && (
          <TablePagination
            className="border-solid border-l border-r-0 border-t-0 border-background  bg-white"
            classes={{
              selectLabel: "text-darkest text-sm font-normal",
              select: "text-darkest text-sm font-normal",
              menuItem: "text-darkest text-sm font-normal",
              input: "text-darkest text-sm font-normal",
              displayedRows: "text-darkest text-sm font-normal",
            }}
            rowsPerPageOptions={PAGE_SIZES}
            labelRowsPerPage={t("Rows in page")}
            labelDisplayedRows={({ from, to, count }: { from: number; to: number; count: number }) =>
              `${from}–${to} ${t("of")} ${count !== -1 ? count : `${t("more than")} ${to}`}`
            }
            component="div"
            count={pagination.totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
          />
        )}
      </Paper>
    </Box>
  );
}
