import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation as useT } from "react-i18next";
import { Link } from "react-router";
import Button from "src/stories/button/Button";
import FormInput from "src/stories/form-input/FormInput";
import FormSelect, { type FormSelectOption } from "src/stories/form-select/FormSelect";
import Title from "src/stories/title/Title";
import { z } from "zod";

import { getLendersFn, getUserFn } from "../../api/private";
import { QUERY_KEYS, USER_TYPE_OPTIONS, USER_TYPES } from "../../constants";
import { useParamsTypeSafe } from "../../hooks/useParamsTypeSafe";
import useUpsertUser from "../../hooks/useUpsertUser";
import type { ILender, ILenderListResponse } from "../../schemas/application";
import { type CreateUserInput, createUserSchema, type IUser } from "../../schemas/auth";
import Loader from "../../stories/loader/Loader";
import ApplicationErrorPage from "../msme/ApplicationErrorPage";

export interface UserFormProps {
  user?: IUser | null;
}
export function UserForm({ user = null }: UserFormProps) {
  const { t } = useT();
  const { createUserMutation, updateUserMutation, isLoading } = useUpsertUser();

  const [options, setOptions] = useState<FormSelectOption[]>([]);

  const methods = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: user || {},
  });

  const { handleSubmit, watch } = methods;

  const [typeValue] = watch(["type"]);
  // Get the lenders from the API
  const { data } = useQuery({
    queryKey: [QUERY_KEYS.lenders],
    queryFn: async (): Promise<ILenderListResponse | null> => {
      const response = await getLendersFn();
      return response;
    },
    retry: 1,
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        enqueueSnackbar(t("Error: {{error}}", { error: error.response.data.detail }), {
          variant: "error",
        });
      } else {
        enqueueSnackbar(t("Error loading lenders"), {
          variant: "error",
        });
      }
    },
  });
  // Asignate the lenders to the options
  useEffect(() => {
    if (data && data.items.length > 0) {
      const lenderOptions: FormSelectOption[] = data.items.map((lender: ILender) => ({
        label: lender.name,
        value: `${lender.id}`,
      }));
      setOptions(lenderOptions);
    }
  }, [data]);

  const onSubmitHandler: SubmitHandler<CreateUserInput> = (values) => {
    if (user) {
      updateUserMutation({ ...values, id: user.id });
    } else {
      createUserMutation(values);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:mb-8 md:mb-8 mb-4 md:grid-cols-2 gap-4 ">
        <div className="flex items-end col-span-1 md:mr-10">
          <Title className="mb-0" type="page" label={t("Settings")} />
        </div>
        <div className="flex justify-start items-start my-4 col-span-1 md:justify-end md:my-0 md:ml-10 lg:justify-end lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:flex md:gap-0">
            <div>
              <Button className="md:mr-4" label={t("Dashboard")} component={Link} to="/" />
            </div>

            <div>
              <Button label={t("Applications")} component={Link} to="/admin/applications" />
            </div>
          </div>
        </div>
      </div>

      <Title type="section" label={user ? t("Update user") : t("Create User")} className="mb-6" />

      <FormProvider {...methods}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmitHandler)}
          noValidate
          autoComplete="off"
          maxWidth="md"
          sx={{
            display: "flex",
            flexDirection: "column",
            borderRadius: 0,
          }}
        >
          <FormInput
            className="w-3/5"
            label={t("Email Address")}
            name="email"
            big={false}
            placeholder={t("Email Address")}
          />
          <FormInput
            className="w-3/5"
            label={t("Name of the user")}
            name="name"
            big={false}
            placeholder={t("Full name")}
          />
          <FormSelect
            className="w-3/5"
            label={t("Select the role of the user")}
            name="type"
            options={USER_TYPE_OPTIONS}
            placeholder={t("User type")}
          />
          {typeValue === USER_TYPES.FI && (
            <FormSelect
              className="w-3/5"
              label={t("Select the lender associated with this FI User")}
              name="lender_id"
              options={options}
              placeholder={t("Lender")}
            />
          )}

          <div className="mt-8 grid grid-cols-1 gap-4 md:flex md:gap-0">
            <div>
              <Button className="md:mr-4" primary={false} label={t("Back")} component={Link} to="/settings" />
            </div>
            <div>
              <Button disabled={isLoading} label={user ? t("Update user") : t("Create User")} type="submit" />
            </div>
          </div>
        </Box>
      </FormProvider>
    </>
  );
}

export function LoadUser() {
  const { t } = useT();
  const [queryError, setQueryError] = useState<string>("");

  const { id } = useParamsTypeSafe(
    z.object({
      id: z.coerce.string(),
    }),
  );

  const { isLoading, data } = useQuery({
    queryKey: [QUERY_KEYS.users, `${id}`],
    queryFn: async (): Promise<IUser | null> => {
      const user = await getUserFn(id);
      return user;
    },
    retry: 1,
    enabled: !!id,
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        setQueryError(error.response.data.detail);
      } else {
        setQueryError(t("Error loading lender"));
      }
    },
  });

  return (
    <>
      {isLoading && <Loader />}
      {!isLoading && !queryError && <UserForm user={data} />}
      {queryError && <ApplicationErrorPage message={queryError} />}
    </>
  );
}
