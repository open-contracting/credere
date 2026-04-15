import { Input as _Input, FormControl, FormHelperText, InputAdornment, type InputProps } from "@mui/material";
import { styled } from "@mui/material/styles";
import { DateField as MUIDateField, DatePicker as MUIDatePicker } from "@mui/x-date-pickers";
import dayjs, { type Dayjs } from "dayjs";
import React from "react";
import { Controller, type FieldError, type FieldErrorsImpl, type Merge, useFormContext } from "react-hook-form";
import { useTranslation as useT } from "react-i18next";
import { NumericFormat, type NumericFormatProps } from "react-number-format";

import EmailIcon from "../../assets/icons/email.svg";
import KeyIcon from "../../assets/icons/key.svg";
import { getProperty } from "../../util";
import { Text } from "../text/Text";

export const Input = styled(_Input, {
  // Can remove in material-ui >9.0.0.
  shouldForwardProp: (prop) => prop !== "notched",
})`
  background-color: white;
  padding: 17px 18px;
  margin-bottom: 0.5rem;
  border-width: 1px;
  border-style: solid;
  border-color: var(--color-field-border);
  &.Mui-error {
    border-color: var(--color-red);
    color: var(--color-red);
  }
`;

export const InputFormCell = styled(_Input)`
  background-color: white;
  padding: 6px 9px;
  font-size: 14px;
  border-width: 1px;
  border-style: solid;
  border-color: var(--color-field-border);
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
  &.Mui-error {
    border-color: var(--color-red);
    color: var(--color-red);
  }
  & input {
    padding-top: 4px;
    padding-bottom: 5px;
  }
`;

export const DateField = styled(MUIDateField)`
  .MuiInputBase-root.MuiInput-root:before,
  .MuiInputBase-root.MuiInput-root:after,
  .MuiInputBase-root.MuiInput-root:hover:before,
  .MuiInputBase-root.MuiInput-root:hover {
    content: '';
    border-bottom: 0px;
  }
  .Mui-error {
    input {
      border-color: var(--color-red);
      color: var(--color-red);
    }
  }
  & input {
    background-color: white;
    padding-top: 10px;
    padding-right: 9px;
    padding-bottom: 11px;
    padding-left: 9px;
    font-size: 14px;
    border-width: 1px;
    border-style: solid;
    border-color: var(--color-field-border);
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    &.Mui-error {
      border-color: var(--color-red);
      color: var(--color-red);
    }
  }
`;

export const DatePickerCell = styled(MUIDatePicker)`
  .MuiInputBase-root.MuiInput-root:before,
  .MuiInputBase-root.MuiInput-root:after,
  .MuiInputBase-root.MuiInput-root:hover:before,
  .MuiInputBase-root.MuiInput-root:hover {
    content: '';
    border-bottom: 0px;
  }
  .Mui-error {
    input {
      border-color: var(--color-red);
      color: var(--color-red);
    }
  }
  &.MuiTextField-root {
    background-color: white;
    padding-top: 6px;
    padding-right: 9px;
    padding-bottom: 6px;
    padding-left: 9px;
    font-size: 14px;
    border-width: 1px;
    border-style: solid;
    border-color: var(--color-field-border);
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    &.Mui-error {
      border-color: var(--color-red);
      color: var(--color-red);
    }
  }
  & input {
    font-size: 14px;
  }
  & .MuiInputAdornment-root.MuiInputAdornment-positionEnd .MuiButtonBase-root.MuiIconButton-root {
    margin-right: -8px;
    padding-top: 1px;
    padding-bottom: 0px;
  }
`;

export const DatePicker = styled(MUIDatePicker)`
  .MuiInputBase-root.MuiInput-root:before,
  .MuiInputBase-root.MuiInput-root:after,
  .MuiInputBase-root.MuiInput-root:hover:before,
  .MuiInputBase-root.MuiInput-root:hover {
    content: '';
    border-bottom: 0px;
  }
  .Mui-error {
    input {
      border-color: var(--color-red);
      color: var(--color-red);
    }
  }
  &.MuiTextField-root {
    background-color: white;
    padding: 18px 18px;
    margin-bottom: 0.5rem;
    border-width: 1px;
    border-style: solid;
    font-size: 14px;
    border-width: 1px;
    border-style: solid;
    border-color: var(--color-field-border);
    &.Mui-error,
    &:has(.Mui-error) {
      border-color: var(--color-red);
      color: var(--color-red);
    }
  }
  & input {
    font-size: 14px;
  }
  & .MuiInputAdornment-root.MuiInputAdornment-positionEnd .MuiButtonBase-root.MuiIconButton-root {
    margin-right: -8px;
    padding-top: 1px;
    padding-bottom: 0px;
  }
`;

interface CustomProps {
  onChange: (value: string) => void;
}

const NumericFormatCustom = React.forwardRef<NumericFormatProps, CustomProps>((props, ref) => {
  const { onChange, ...other } = props;

  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange(values.value);
      }}
      thousandSeparator
      valueIsNumericString
      prefix="$"
    />
  );
});

export type FormInputProps = {
  name: string;
  label: string;
  big?: boolean;
  fullWidth?: boolean;
  noIcon?: boolean;
  placeholder?: string;
  helperText?: string;
  labelClassName?: string;
  formControlClasses?: string;
  fontVariant?: boolean;
  inputCell?: boolean;
} & InputProps;

const getIcon = (type: string | undefined) => {
  if (!type) {
    return undefined;
  }

  let icon: string | undefined;
  if (type === "email") {
    icon = EmailIcon;
  }
  if (type === "password") {
    icon = KeyIcon;
  }

  if (icon) {
    return (
      <InputAdornment position="start">
        <img src={icon} alt="icon" />
      </InputAdornment>
    );
  }

  return undefined;
};

const TEXT_TYPES = ["text", "email", "password", "number"];
// biome-ignore lint/suspicious/noExplicitAny: FieldErrorsImpl is a generic type from react-hook-form that requires any
export type FieldErrorType = FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
interface FormInputErrorProps {
  fieldError: FieldErrorType;
  className?: string;
}

export function FormInputError({ fieldError, className = "" }: FormInputErrorProps) {
  const { t } = useT();
  if (!fieldError) {
    return null;
  }

  return (
    <FormHelperText className={`text-red text-base mx-0 ${className}`} error={!!fieldError}>{`${
      fieldError?.message ? t(`${fieldError.message}`) : ""
    }`}</FormHelperText>
  );
}

const AUTH_LABELS_CLASSNAMES = "text-moody-blue text-xl mb-3";
export function FormInput({
  name,
  label,
  placeholder = undefined,
  helperText = undefined,
  big = true,
  fullWidth = true,
  noIcon = false,
  type,
  labelClassName = "",
  fontVariant = undefined,
  className,
  inputCell = undefined,
  formControlClasses = "",
  ...otherProps
}: FormInputProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const { t } = useT();

  const fieldError: FieldErrorType = getProperty(errors, name) as FieldErrorType;
  return (
    <Controller
      control={control}
      defaultValue=""
      name={name}
      render={({ field }) => (
        <FormControl fullWidth={fullWidth} sx={{ mb: 2 }} className={formControlClasses} error={!!fieldError}>
          <Text fontVariant={fontVariant} className={`${big ? AUTH_LABELS_CLASSNAMES : ""} ${labelClassName}`}>
            {label}
          </Text>
          {!inputCell && (!type || TEXT_TYPES.includes(type)) && (
            <Input
              type={type}
              startAdornment={noIcon ? undefined : getIcon(type)}
              {...field}
              fullWidth={fullWidth}
              placeholder={placeholder}
              disableUnderline
              error={!!fieldError}
              sx={
                fontVariant
                  ? {
                      fontFamily: "GT Eesti Pro Text",
                    }
                  : {}
              }
              {...otherProps}
              className={className}
            />
          )}
          {!inputCell && type === "currency" && (
            <Input
              // biome-ignore lint/suspicious/noExplicitAny: NumericFormatCustom typing incompatibility with MUI Input component
              inputComponent={NumericFormatCustom as any}
              type={type}
              startAdornment={noIcon ? undefined : getIcon(type)}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
              fullWidth={fullWidth}
              placeholder={placeholder}
              disableUnderline
              error={!!fieldError}
              {...otherProps}
              className={className}
            />
          )}
          {inputCell && !type && (
            <InputFormCell
              type={type}
              startAdornment={noIcon ? undefined : getIcon(type)}
              {...field}
              fullWidth={fullWidth}
              placeholder={placeholder}
              disableUnderline
              error={!!fieldError}
              sx={
                fontVariant
                  ? {
                      fontFamily: "GT Eesti Pro Text",
                    }
                  : {}
              }
              {...otherProps}
              className={className}
            />
          )}
          {inputCell && type === "date-picker" && (
            <DatePickerCell
              autoFocus
              localeText={{
                fieldYearPlaceholder: () => t("YYYY"),
              }}
              className={className}
              onChange={(value: unknown) => {
                const date = value as Dayjs;
                if (date.isValid()) {
                  field.onChange(date.toISOString());
                }
              }}
              slotProps={{
                textField: {
                  variant: "standard",
                  value: dayjs(field.value),
                  onBlur: field.onBlur,
                  fullWidth,
                  error: !!fieldError,
                },
              }}
              sx={
                fontVariant
                  ? {
                      fontFamily: "GT Eesti Pro Text",
                    }
                  : {}
              }
            />
          )}
          {!inputCell && type === "date-picker" && (
            <DatePicker
              autoFocus
              localeText={{
                fieldYearPlaceholder: () => t("YYYY"),
              }}
              className={className}
              onChange={(value: unknown) => {
                const date = value as Dayjs;
                if (date.isValid()) {
                  field.onChange(date.toISOString());
                }
              }}
              slotProps={{
                textField: {
                  variant: "standard",
                  value: dayjs(field.value),
                  onBlur: field.onBlur,
                  fullWidth,
                  error: !!fieldError,
                },
              }}
              sx={
                fontVariant
                  ? {
                      fontFamily: "GT Eesti Pro Text",
                    }
                  : {}
              }
            />
          )}
          {inputCell && type === "date-field" && (
            <DateField
              autoFocus
              onChange={(value: unknown) => {
                const date = value as Dayjs;
                if (date.isValid()) {
                  field.onChange(date.toISOString());
                }
              }}
              variant="standard"
              slotProps={{
                textField: {
                  value: dayjs(field.value),
                  onBlur: field.onBlur,
                  fullWidth,
                  error: !!fieldError,
                },
              }}
              sx={
                fontVariant
                  ? {
                      fontFamily: "GT Eesti Pro Text",
                    }
                  : {}
              }
            />
          )}
          {inputCell && type === "currency" && (
            <InputFormCell
              // biome-ignore lint/suspicious/noExplicitAny: NumericFormatCustom typing incompatibility with MUI Input component
              inputComponent={NumericFormatCustom as any}
              type={type}
              startAdornment={noIcon ? undefined : getIcon(type)}
              value={field.value}
              onBlur={field.onBlur}
              onChange={field.onChange}
              fullWidth={fullWidth}
              placeholder={placeholder}
              disableUnderline
              error={!!fieldError}
              sx={
                fontVariant
                  ? {
                      fontFamily: "GT Eesti Pro Text",
                    }
                  : {}
              }
              {...otherProps}
              className={className}
            />
          )}
          {helperText && (
            <FormHelperText className={`font-light text-sm mx-0 ${className}`}>{helperText}</FormHelperText>
          )}
          <FormInputError className={labelClassName} fieldError={fieldError} />
        </FormControl>
      )}
    />
  );
}

export default FormInput;
