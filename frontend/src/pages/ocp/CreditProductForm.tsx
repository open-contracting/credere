import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation as useT } from "react-i18next";
import { Link } from "react-router";
import useConstants from "src/hooks/useConstants";
import { type CreditProductInput, creditProductSchema } from "src/schemas/OCPsettings";
import Button from "src/stories/button/Button";
import Checkbox from "src/stories/checkbox/Checkbox";
import FormInput, { FormInputError } from "src/stories/form-input/FormInput";
import FormSelect from "src/stories/form-select/FormSelect";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";
import { z } from "zod";

import { getCreditProductFn, getProcurementCategoriesFn } from "../../api/private";
import { CREDIT_PRODUCT_OPTIONS, DEFAULT_BORROWER_SIZE, QUERY_KEYS } from "../../constants";
import { useParamsTypeSafe } from "../../hooks/useParamsTypeSafe";
import useUpsertCreditProduct from "../../hooks/useUpsertCreditProduct";
import type { ICreditProduct } from "../../schemas/application";
import Loader from "../../stories/loader/Loader";
import ApplicationErrorPage from "../msme/ApplicationErrorPage";

interface CreditProductFormProps {
  lenderId: number;
  creditProduct?: ICreditProduct | null;
}

function CreditProductForm({ creditProduct = null, lenderId }: CreditProductFormProps) {
  const { t } = useT();
  const constants = useConstants();
  const { createCreditProductMutation, updateCreditProductMutation, isLoading, isError } = useUpsertCreditProduct();

  const methods = useForm<CreditProductInput>({
    resolver: zodResolver(creditProductSchema),
    defaultValues: creditProduct || {
      required_document_types: {},
    },
  });

  const { data: procurementCategories } = useQuery({
    queryKey: [QUERY_KEYS.procurement_categories],
    queryFn: async (): Promise<Array<string> | []> => getProcurementCategoriesFn(),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitSuccessful, errors },
  } = methods;

  useEffect(() => {
    if (isSubmitSuccessful && !isError && !isLoading) {
      reset();
    }
  }, [isSubmitSuccessful, isError, isLoading, reset]);

  const onSubmitHandler: SubmitHandler<CreditProductInput> = (values) => {
    if (creditProduct) {
      updateCreditProductMutation({ ...values, id: creditProduct.id, lender_id: creditProduct.lender_id });
    } else {
      createCreditProductMutation({ ...values, lender_id: lenderId });
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

      <Title
        type="section"
        label={
          creditProduct
            ? t("Edit Credit Product for {{lenderName}}", { lenderName: creditProduct.lender?.name })
            : t("Add New Credit Product")
        }
        className="mb-6"
      />
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
          <FormSelect
            className="w-3/5"
            label={t("Select type of business the credit provider is willing to offer credit to")}
            name="borrower_size"
            options={(constants?.BorrowerSize || []).filter((o) => o.value !== DEFAULT_BORROWER_SIZE)}
            placeholder={t("Borrower size")}
          />
          <FormSelect
            className="w-3/5"
            label={t("Select type of procurement category to exclude (if any)")}
            name="procurement_category_to_exclude"
            options={procurementCategories || []}
            placeholder={t("Procurement category to exclude")}
          />

          <FormSelect
            className="w-3/5"
            label={t("Select the type of credit product")}
            name="type"
            options={CREDIT_PRODUCT_OPTIONS}
            placeholder={t("Type")}
          />

          <Text className="mb-4">
            {t("Select the legal type of business the credit provider is willing to offer credit to")}
          </Text>
          <Box className="mb-4">
            <Box className="w-3/5 flex flex-col items-start justify-start gap-2">
              {(constants?.BorrowerType || []).map((type) => (
                <Checkbox
                  key={type.value}
                  label={type.label}
                  name={`borrower_types.${type.value}`}
                  className={errors.borrower_types ? "text-red" : ""}
                />
              ))}
            </Box>
            <FormInputError fieldError={errors.borrower_types} />
          </Box>

          <Text className="mb-1">
            {t(
              "Enter the lower and upper limits that the credit provider will be willing to offer for this credit product",
            )}
          </Text>
          <Box className="mb-2 w-3/5 flex flex-row items-start justify-start gap-2">
            <FormInput label="" name="lower_limit" placeholder={t("Lower limit")} type="currency" />
            <FormInput label="" name="upper_limit" placeholder={t("Upper limit")} type="currency" />
          </Box>

          <FormInput
            className="w-3/5"
            label={t("Interest rate of the credit product")}
            name="interest_rate"
            multiline
            rows={4}
            big={false}
            placeholder={t("Interes rate")}
          />

          <Text className="mb-4">
            {t("Select all the documents that the credit provider will require from the business")}
          </Text>
          <Box className="mb-4">
            <Box className="w-3/5 flex flex-col items-start justify-start gap-2">
              {(constants?.BorrowerDocumentType || []).map((type) => (
                <Checkbox
                  key={type.value}
                  label={type.label}
                  name={`required_document_types.${type.value}`}
                  className={errors.required_document_types ? "text-red" : ""}
                />
              ))}
            </Box>
            <FormInputError fieldError={errors.required_document_types} />
          </Box>

          <FormInput
            className="w-3/5"
            label={t("Enter the total amount of other fees that the credit provider will charge the business")}
            name="other_fees_total_amount"
            big={false}
            type="currency"
            placeholder={t("Other fees total amount")}
          />

          <FormInput
            className="w-3/5"
            label={t("Enter de details of the other fees that the credit provider will charge the business")}
            name="other_fees_description"
            multiline
            rows={4}
            big={false}
            placeholder={t("Other fees description")}
          />

          <FormInput
            className="w-3/5"
            label={t("Enter any additional information for tne business about the credit product")}
            name="additional_information"
            multiline
            rows={4}
            big={false}
            placeholder={t("Additional information")}
          />

          <FormInput
            className="w-3/5"
            label={t("Enter the URL where the business can find more information about the credit product")}
            name="more_info_url"
            big={false}
            placeholder={t("More info URL")}
          />

          <div className="mt-5 grid grid-cols-1 gap-4 md:flex md:gap-0">
            <div>
              <Button
                className="md:mr-4"
                primary={false}
                label={t("Back")}
                component={Link}
                to={`/settings/lender/${lenderId}/edit`}
              />
            </div>
            <div>
              <Button
                disabled={isLoading}
                label={creditProduct ? t("Update Credit product") : t("Add New Credit product")}
                type="submit"
              />
            </div>
          </div>
        </Box>
      </FormProvider>
    </>
  );
}

export function LoadCreditProduct() {
  const { t } = useT();
  const [queryError, setQueryError] = useState<string>("");

  const { id, lenderId } = useParamsTypeSafe(
    z.object({
      id: z.coerce.string().optional(),
      lenderId: z.coerce.string(),
    }),
  );

  const { isLoading, data } = useQuery({
    queryKey: [QUERY_KEYS.credit_product, `${id}`],
    queryFn: async (): Promise<ICreditProduct | null> => {
      const creditProduct = await getCreditProductFn(`${id}`);
      return creditProduct;
    },
    retry: 1,
    enabled: !!id,
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        setQueryError(error.response.data.detail);
      } else {
        setQueryError(t("Error loading credit product"));
      }
    },
  });

  if (!id) {
    return <CreditProductForm lenderId={Number(lenderId)} />;
  }

  return (
    <>
      {isLoading && <Loader />}
      {!isLoading && !queryError && <CreditProductForm lenderId={Number(lenderId)} creditProduct={data} />}
      {queryError && <ApplicationErrorPage message={queryError} />}
    </>
  );
}
