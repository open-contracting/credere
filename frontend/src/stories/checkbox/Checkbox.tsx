import { FormControl, FormControlLabel, FormHelperText, Checkbox as MUICheckbox, Typography } from "@mui/material";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation as useT } from "react-i18next";
import { twMerge } from "tailwind-merge";

import Checked from "../../assets/icons/check-checked.svg";
import NotChecked from "../../assets/icons/check-empty.svg";
import { getProperty } from "../../util";
import type { FieldErrorType } from "../form-input/FormInput";

export type CheckboxProps = {
  name: string;
  label: string;
  className?: string;
  fieldClassName?: string;
  defaultValue?: boolean;
};

function Checkbox({ name, label, fieldClassName = "", defaultValue = false, className = undefined }: CheckboxProps) {
  const {
    control,
    formState: { errors, defaultValues },
  } = useFormContext();
  const { t } = useT();

  const fieldError: FieldErrorType = getProperty(errors, name) as FieldErrorType;
  const defaultValueForm = (getProperty(defaultValues, name) as boolean | undefined) || defaultValue;
  return (
    <Controller
      control={control}
      defaultValue={defaultValueForm}
      name={name}
      render={({ field }) => (
        <FormControl fullWidth className={twMerge(`mb-2 ${fieldClassName}`)}>
          <FormControlLabel
            sx={{ alignItems: "flex-start" }}
            control={
              <MUICheckbox
                sx={{ px: "10px", py: "2px", ":hover": { backgroundColor: "transparent" } }}
                icon={<img src={NotChecked} alt="check-icon-empty" />}
                checkedIcon={<img src={Checked} alt="check-icon-checked" />}
                {...field}
                defaultChecked={defaultValueForm}
              />
            }
            label={
              <Typography
                variant="body1"
                className={twMerge(`text-darkest text-lg ${fieldError ? "text-red" : ""} ${className}`)}
              >
                {label}
              </Typography>
            }
          />
          <FormHelperText className="text-red text-base mx-0" error={!!fieldError}>{`${
            fieldError?.message ? t(`${fieldError.message}`) : ""
          }`}</FormHelperText>
        </FormControl>
      )}
    />
  );
}

export default Checkbox;
