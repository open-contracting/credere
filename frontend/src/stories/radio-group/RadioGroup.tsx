import {
  FormControl,
  FormControlLabel,
  FormHelperText,
  RadioGroup as MUIRadioGroup,
  Radio,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation as useT } from "react-i18next";
import { twMerge } from "tailwind-merge";

import { getProperty } from "../../util";
import type { FieldErrorType } from "../form-input/FormInput";
import type { FormSelectOption } from "../form-select/FormSelect";
import Text from "../text/Text";

export type RadioGroupProps = {
  name: string;
  label: string;
  className?: string;
  labelClassName?: string;
  defaultValue?: string;
  options: FormSelectOption[] | string[];
  renderOption?: (option: FormSelectOption) => string;
};

const defaultRenderOption = (option: FormSelectOption) => option.label;

const isStringArray = (obj: unknown): obj is string[] =>
  Array.isArray(obj) && obj.every((item) => typeof item === "string");

function RadioGroup({
  name,
  label,
  className = "",
  labelClassName = "",
  defaultValue = undefined,
  renderOption = defaultRenderOption,
  options,
}: RadioGroupProps) {
  const {
    control,
    formState: { errors, defaultValues },
  } = useFormContext();
  const { t } = useT();

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
  const defaultValueForm = getProperty(defaultValues, name) || defaultValue || "";

  return (
    <Controller
      control={control}
      defaultValue={defaultValueForm}
      name={name}
      render={({ field }) => (
        <FormControl fullWidth sx={{ mb: 2 }} className={className} error={!!fieldError}>
          <Text className="mb-2">{label}</Text>
          <MUIRadioGroup {...field}>
            {optionsChecked.map((option) => (
              <FormControlLabel
                sx={{ paddingLeft: "4px" }}
                key={`key-${option.value}`}
                value={option.value}
                control={
                  <Radio
                    sx={{
                      padding: "4px",
                    }}
                    color="default"
                  />
                }
                label={
                  <Typography
                    variant="body1"
                    className={twMerge(`ml-2 text-darkest text-lg ${fieldError ? "text-red" : ""} ${labelClassName}`)}
                  >
                    {t(renderOption(option))}
                  </Typography>
                }
              />
            ))}
          </MUIRadioGroup>

          <FormHelperText className="text-red text-base mx-0" error={!!fieldError}>{`${
            fieldError ? fieldError?.message : ""
          }`}</FormHelperText>
        </FormControl>
      )}
    />
  );
}

export default RadioGroup;
