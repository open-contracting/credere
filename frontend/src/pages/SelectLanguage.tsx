import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation as useT } from "react-i18next";
import { type TypeOf, z } from "zod";

import { AVAILABLE_LANGUAGES, DISPATCH_ACTIONS } from "../constants";
import useLangContext from "../hooks/useLangContext";
import Button from "../stories/button/Button";
import FormSelect, { type FormSelectOption } from "../stories/form-select/FormSelect";
import Title from "../stories/title/Title";

const langSchema = z.object({
  lang: z.string(),
});

type LangInput = TypeOf<typeof langSchema>;

function SelectLanguage() {
  const { t, i18n } = useT();
  const langContext = useLangContext();

  const [options] = useState<FormSelectOption[]>(AVAILABLE_LANGUAGES);
  const { enqueueSnackbar } = useSnackbar();

  const methods = useForm<LangInput>({
    resolver: zodResolver(langSchema),
  });

  const { handleSubmit, setValue } = methods;

  useEffect(() => {
    if (langContext.state.selected) {
      setValue("lang", langContext.state.selected);
    }
  }, [setValue, langContext.state.selected]);

  const onSubmitHandler: SubmitHandler<LangInput> = (values) => {
    i18n.changeLanguage(values.lang);
    langContext.dispatch({ type: DISPATCH_ACTIONS.SET_LANG, payload: values.lang });
    enqueueSnackbar(t("Language changed to: {{language}}", { language: values.lang }), {
      variant: "success",
    });
  };

  return (
    <>
      <Title type="page" label={t("Configure Language")} className="mb-8" />
      <FormProvider {...methods}>
        <Box component="form" onSubmit={handleSubmit(onSubmitHandler)} noValidate autoComplete="off">
          <FormSelect options={options} name="lang" label={t("Select Language")} />

          <Button className="mb-10" label={t("Save")} type="submit" />
        </Box>
      </FormProvider>
    </>
  );
}

export default SelectLanguage;
