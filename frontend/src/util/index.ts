import dayjs from "dayjs";
import lodash from "lodash";
import { createElement } from "react";
import useConstants from "src/hooks/useConstants";
import { CREDIT_PRODUCT_OPTIONS, LENDER_TYPES, USER_TYPE_OPTIONS } from "../constants";
import CURRENCY_FORMAT_OPTIONS from "../constants/intl";
import type { FormSelectOption } from "../stories/form-select/FormSelect";
import { t } from "../util/i18n";

const dateFormatOptions: Intl.DateTimeFormatOptions = {
  month: "long", // Display full month name
  day: "numeric", // Display day of the month
  year: "numeric", // Display full year
};

const dateFileNameFormatOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
};

export const formatDateForFileName = (date: Date) => date.toLocaleDateString("en-US", dateFileNameFormatOptions);
export const formatLocalizedDate = (locale: string, date: Date) => date.toLocaleDateString(locale, dateFormatOptions);

export const formatLocalizedDateFromString = (locale: string, date: string | null | undefined) => {
  if (!date) {
    return t("No defined");
  }

  const dateObj = new Date(date);
  return dateObj.toLocaleDateString(locale, dateFormatOptions);
};

export const formatCurrency = (amount: number, currency?: string) => {
  const currencyFormatOptions = CURRENCY_FORMAT_OPTIONS[currency || "default"] || CURRENCY_FORMAT_OPTIONS.default;

  const formatter = new Intl.NumberFormat(currencyFormatOptions.locale, currencyFormatOptions.options);
  return formatter.format(amount);
};

export const formatPaymentMethod = (value: { [key: string]: string }) => {
  if (!value) {
    return t("No defined");
  }

  let paymentMethodString = "";

  Object.keys(value).forEach((key) => {
    if (Number(value[key])) {
      paymentMethodString += `${lodash.startCase(key)}: ${formatCurrency(Number(value[key]))}\n`;
    } else {
      paymentMethodString += `${lodash.startCase(key)}: ${value[key]}\n`;
    }
  });

  return paymentMethodString;
};

function findLabelByValue(value: string, options: FormSelectOption[]): string {
  const foundType = options.find((option) => option.value === value);
  return foundType?.label || value;
}

export const renderLenderType = (type: string) => findLabelByValue(type, LENDER_TYPES);
export const renderUserType = (type: string) => findLabelByValue(type, USER_TYPE_OPTIONS);
export const renderCreditProductType = (type: string) => findLabelByValue(type, CREDIT_PRODUCT_OPTIONS);

export const RenderSector = (type: string) => {
  const constants = useConstants();
  return findLabelByValue(type, constants?.BorrowerSector || []);
};

export const RenderSize = (type: string) => {
  const constants = useConstants();
  return findLabelByValue(type, constants?.BorrowerSize || []);
};

export const RenderStatusString = (status: string) => {
  const constants = useConstants();
  return findLabelByValue(status, constants?.ApplicationStatus || []);
};

export function RenderStatus({ status }: { status: string }) {
  const constants = useConstants();
  return createElement("div", {}, findLabelByValue(status, constants?.ApplicationStatus || []));
}

export function getProperty(obj: unknown, propertyString: string): unknown {
  const properties = propertyString.split(".");
  let result = obj;

  for (const property of properties) {
    if (result && typeof result === "object" && property in result) {
      result = (result as Record<string, unknown>)[property];
    } else {
      return undefined;
    }
  }

  return result;
}

export const isDateAfterCurrentDate = (date: string) => {
  const currentDate = dayjs();
  return dayjs(date).isAfter(currentDate, "day");
};

export const downloadBlob = (blob: Blob, filename: string) => {
  if (blob) {
    const href = window.URL.createObjectURL(blob);
    const anchorElement = document.createElement("a");
    anchorElement.href = href;
    anchorElement.download = filename;
    document.body.appendChild(anchorElement);
    anchorElement.click();
    document.body.removeChild(anchorElement);
    window.URL.revokeObjectURL(href);
  }
};
