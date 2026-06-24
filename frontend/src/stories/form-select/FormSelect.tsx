import { FormControl, FormHelperText, MenuItem, Select } from "@mui/material";
import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation as useT } from "react-i18next";

import { getProperty } from "../../util";
import { type FieldErrorType, Input } from "../form-input/FormInput";
import Text from "../text/Text";

export type FormSelectOption = {
  label: string;
  value: string;
};

export type FormSelectProps = {
  name: string;
  label: string;
  placeholder?: string;
  className?: string;
  options: FormSelectOption[] | string[];
  renderOption?: (option: FormSelectOption) => string;
};

const defaultRenderOption = (option: FormSelectOption) => option.label;

const isStringArray = (obj: unknown): obj is string[] =>
  Array.isArray(obj) && obj.every((item) => typeof item === "string");

function FormSelect({
  name,
  label,
  className = "",
  placeholder = undefined,
  renderOption = defaultRenderOption,
  options,
}: FormSelectProps) {
  const { t } = useT();
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const optionsChecked: FormSelectOption[] = useMemo(() => {
    if (isStringArray(options)) {
      return options.map((option) => ({
        label: option,
        value: option,
      }));
    }
    return options;
  }, [options]);

  const fieldError: FieldErrorType = getProperty(errors, name) as FieldErrorType;

  return (
    <Controller
      control={control}
      defaultValue=""
      name={name}
      render={({ field }) => (
        <FormControl fullWidth sx={{ mb: 2 }} className={className}>
          <Text>{label}</Text>
          <Select
            displayEmpty
            disableUnderline
            error={!!fieldError}
            input={<Input />}
            inputProps={{ name, error: !!fieldError }}
            {...field}
          >
            {placeholder && (
              <MenuItem disabled value="">
                <div className={` ${fieldError ? "text-red opacity-50" : "text-darkest opacity-50"}`}>
                  {placeholder}
                </div>
              </MenuItem>
            )}
            {optionsChecked.map((option) => (
              <MenuItem key={`key-${option.value}`} value={option.value}>
                {t(renderOption(option))}
              </MenuItem>
            ))}
          </Select>

          <FormHelperText className="text-red text-base mx-0" error={!!fieldError}>{`${
            fieldError?.message ? t(`${fieldError.message}`) : ""
          }`}</FormHelperText>
        </FormControl>
      )}
    />
  );
}

export default FormSelect;
