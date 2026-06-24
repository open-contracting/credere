import { FormControl, FormControlLabel, FormHelperText, Switch as MUISwitch, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { ChangeEvent } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation as useT } from "react-i18next";
import { twMerge } from "tailwind-merge";

import ToggleSwitch from "../../assets/icons/toggle-switch.svg";
import { getProperty } from "../../util";
import type { FieldErrorType } from "../form-input/FormInput";

const LabeledSwitch = styled(MUISwitch)(() => ({
  width: 59,
  height: 29,
  "&": {
    padding: 0,
    marginRight: 10,
    marginLeft: 10,
  },
  "& .MuiSwitch-switchBase": {
    padding: 2,
  },
  "& .MuiSwitch-switchBase.Mui-checked": {
    transform: "translateX(30px)",
  },
  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
    backgroundColor: "var(--color-darkest)",
    opacity: 1,
    "&:before": {
      content: '"Yes"',
      color: "var(--color-white)",
      left: 8,
    },
    "&:after": {
      content: '""',
    },
  },
  "& .Mui-disabled+.MuiSwitch-track": {
    opacity: 0.5,
  },
  "& .MuiSwitch-track": {
    width: 59,
    height: 29,
    opacity: 1,
    borderRadius: 25,
    backgroundColor: "var(--color-field-border)",
    "&:before, &:after": {
      content: '""',
      position: "absolute",
      fontFamily: "GT Eesti Pro Text",
      fontSize: 14,
      top: "50%",
      transform: "translateY(-50%)",
    },
    "&:before": {
      content: '""',
    },
    "&:after": {
      content: '"No"',
      color: "var(--color-black)",
      right: 8,
    },
  },
  "& .MuiSwitch-thumb": {
    boxShadow: "none",
    width: 16,
    height: 16,
    margin: 2,
  },
}));

type ControlledSwitchProps = {
  name: string;
  label: string;
  disabled?: boolean;
  className?: string;
  fieldClassName?: string;
  defaultValue?: boolean;
};

export type SwitchProps = ControlledSwitchProps & {
  onChange?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
  value?: boolean;
  fieldError?: FieldErrorType;
};

export function Switch({
  name,
  label,
  disabled = undefined,
  fieldClassName = "",
  onChange = undefined,
  fieldError = undefined,
  defaultValue = false,
  value = undefined,
  className = undefined,
}: SwitchProps) {
  const { t } = useT();

  return (
    <FormControl fullWidth className={fieldClassName}>
      <FormControlLabel
        sx={{ alignItems: "flex-start" }}
        control={
          <LabeledSwitch
            id={name}
            sx={{
              px: "10px",
              py: "2px",
              ":hover": { backgroundColor: "transparent" },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                "&:before": {
                  content: `'${t("Yes")}'`,
                },
              },
              "& .MuiSwitch-track": {
                "&:after": {
                  content: `'${t("No")}'`,
                },
              },
            }}
            icon={<img className="" src={ToggleSwitch} alt="check-icon-empty" />}
            checkedIcon={<img className="" src={ToggleSwitch} alt="check-icon-checked" />}
            onChange={onChange}
            value={value}
            disabled={disabled}
            defaultChecked={defaultValue}
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
        fieldError ? fieldError?.message : ""
      }`}</FormHelperText>
    </FormControl>
  );
}

function ControlledSwitch({
  name,
  label,
  disabled = undefined,
  fieldClassName = "",
  defaultValue = false,
  className = undefined,
}: ControlledSwitchProps) {
  const {
    control,
    formState: { errors, defaultValues },
  } = useFormContext();

  const fieldError: FieldErrorType = getProperty(errors, name) as FieldErrorType;
  const defaultValueForm = getProperty(defaultValues, name) || defaultValue;
  return (
    <Controller
      control={control}
      defaultValue={defaultValueForm}
      name={name}
      render={({ field }) => (
        <Switch
          name={name}
          value={field.value}
          onChange={(_event, checked) => field.onChange(checked)}
          label={label}
          disabled={disabled}
          fieldError={fieldError}
          className={className}
          fieldClassName={fieldClassName}
        />
      )}
    />
  );
}

export default ControlledSwitch;
