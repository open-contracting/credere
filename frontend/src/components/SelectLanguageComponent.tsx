import { Input as _Input, MenuItem, Select } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useTranslation as useT } from "react-i18next";
import { AVAILABLE_LANGUAGES, DISPATCH_ACTIONS } from "../constants";
import useLangContext from "../hooks/useLangContext";
import type { FormSelectOption } from "../stories/form-select/FormSelect";
import { t as tNative } from "../util/i18n";

const InputSelectSmall = styled(_Input)`
  background-color: white;
  padding: 6px 9px;
  font-size: 14px;
  border-width: 1px;
  border-style: solid;
  border-color: var(--color-field-border);
  border-radius: 4px;
  & input {
    padding-top: 4px;
    padding-bottom: 5px;
  }
`;

const loadingOption: FormSelectOption = {
  label: tNative("Loading..."),
  value: "loading",
};

function SelectLanguageComponent() {
  const { t, i18n } = useT();
  const langContext = useLangContext();
  const [value, setValue] = useState<string>(loadingOption.value);
  const [options] = useState<FormSelectOption[]>(AVAILABLE_LANGUAGES);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    if (options && options.length > 0 && langContext.state.selected) {
      setValue(langContext.state.selected);
    }
  }, [options, langContext.state.selected]);

  const onChange = (valueSelected: string) => {
    setValue(valueSelected);
    const selected = options.find((option) => option.value === valueSelected);
    i18n.changeLanguage(valueSelected);
    langContext.dispatch({ type: DISPATCH_ACTIONS.SET_LANG, payload: valueSelected });
    enqueueSnackbar(t("Language changed to: {{language}}", { language: selected?.label }), {
      variant: "info",
    });
  };

  return (
    <Select
      disableUnderline
      input={<InputSelectSmall />}
      value={value}
      onChange={(e) => {
        if (e.target.value) {
          onChange(e.target.value);
        }
      }}
    >
      {value === loadingOption.value && <MenuItem value={loadingOption.value}>{loadingOption.label}</MenuItem>}
      {options.map((option) => (
        <MenuItem key={`key-${option.value}`} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
}

export default SelectLanguageComponent;
