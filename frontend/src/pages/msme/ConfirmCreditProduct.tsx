import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useTranslation as useT } from "react-i18next";
import useApplicationContext from "src/hooks/useApplicationContext";
import Button from "src/stories/button/Button";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

import { getCreditProductFn } from "../../api/public";
import CreditProductConfirmation from "../../components/CreditProductConfirmation";
import NeedHelpComponent from "../../components/NeedHelpComponent";
import { QUERY_KEYS } from "../../constants";
import useSelectCreditProduct from "../../hooks/useSelectCreditProduct";
import type { ICreditProduct } from "../../schemas/application";
import Loader from "../../stories/loader/Loader";
import ApplicationErrorPage from "./ApplicationErrorPage";

function ConfirmCreditProduct() {
  const { t } = useT();
  const [queryError, setQueryError] = useState<string>("");

  const applicationContext = useApplicationContext();
  const { confirmCreditProductMutation, rollbackSelectCreditProductMutation, isLoading } = useSelectCreditProduct();

  const { isLoading: isLoadingCreditProduct, data } = useQuery({
    queryKey: [QUERY_KEYS.credit_product, `${applicationContext.state.data?.application.credit_product_id}`],
    queryFn: async (): Promise<ICreditProduct | null> => {
      const creditProduct = await getCreditProductFn(
        `${applicationContext.state.data?.application.credit_product_id}`,
      );
      return creditProduct;
    },
    retry: 1,
    enabled: !!applicationContext.state.data?.application.credit_product_id,
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        setQueryError(error.response.data.detail);
      } else {
        setQueryError(t("Error loading credit product"));
      }
    },
  });

  const onConfirmHandler = () => {
    confirmCreditProductMutation({ uuid: applicationContext.state.data?.application.uuid });
  };

  const onBackHandler = () => {
    rollbackSelectCreditProductMutation({ uuid: applicationContext.state.data?.application.uuid });
  };

  return (
    <>
      <Title type="page" label={t("Selected Financing Option Confirmation")} className="mb-10" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-1 md:col-span-2 md:mr-10">
          <Text className="mb-8">{t("Please review the selected financing option.")}</Text>
          {isLoadingCreditProduct && <Loader />}
          {!isLoadingCreditProduct && !queryError && data && applicationContext.state.data?.application && (
            <>
              <CreditProductConfirmation
                creditProduct={data}
                application={applicationContext.state.data?.application}
              />
              <div className="mt-5 mb-4 grid grid-cols-1 gap-4 md:flex md:gap-0">
                <div>
                  <Button className="md:mr-4" label={t("Go Back")} onClick={onBackHandler} disabled={isLoading} />
                </div>

                <div>
                  <Button label={t("Select & Continue")} onClick={onConfirmHandler} disabled={isLoading} />
                </div>
              </div>
            </>
          )}
          {queryError && <ApplicationErrorPage message={queryError} />}
        </div>
        <div className="my-6 md:my-0 md:ml-10">
          <NeedHelpComponent />
        </div>
      </div>
    </>
  );
}

export default ConfirmCreditProduct;
