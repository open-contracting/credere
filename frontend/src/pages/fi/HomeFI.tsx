import { Box, CircularProgress, Container } from "@mui/material";
import { useTranslation as useT } from "react-i18next";
import useDownloadApplicants from "src/hooks/useDownloadApplicants";
import Button from "src/stories/button/Button";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

import ApplicationsList from "../../components/ApplicationsList";
import { USER_TYPES } from "../../constants";
import CURRENCY_FORMAT_OPTIONS from "../../constants/intl";
import useGetStatisticsFI from "../../hooks/useGetStatisticsFI";
import DashboardItemContainer from "../../stories/dashboard/DashboardItemContainer";
import Loader from "../../stories/loader/Loader";
import { formatCurrency } from "../../util";

function HomeFI() {
  const { t } = useT();
  const { data, isLoading } = useGetStatisticsFI();
  const { downloadDocument, isDownloading } = useDownloadApplicants();

  return (
    <>
      <Title type="page" label={t("Home - Dashboard & business applications")} className="mb-8" />
      <Text className="mb-8">
        {t(
          "The purpose of Credere is to provide business in Colombia that have been awarded a public sector contract access to credit.",
        )}
      </Text>
      <Text className="mb-8">
        {t(
          "Credere has been developed help you review the data from the open contracting process in conjunction with the business applications for credit.",
        )}
      </Text>
      <Title type="section" label={t("Dashboard")} className="mb-6" />
      {data && !isLoading && (
        <Container className="p-0 lg:pr-20 ml-0">
          <div className="grid lg:gap-10 grid-cols-1 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-2">
            <div className="col-span-1">
              <DashboardItemContainer
                description={t("Application(s) received")}
                value={data.statistics_kpis.applications_received_count}
              />
            </div>
            <div className="col-span-1">
              <DashboardItemContainer
                description={t("Application(s) in progress")}
                value={data.statistics_kpis.applications_in_progress_count}
              />
            </div>
            <div className="col-span-1">
              <DashboardItemContainer
                color="red"
                description={t("Application(s) rejected")}
                value={data.statistics_kpis.applications_rejected_count}
              />
            </div>
          </div>
          <div className="grid lg:gap-10 grid-cols-1 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-2">
            <div className="col-span-1">
              <DashboardItemContainer
                description={t("Application(s) with credit disbursed")}
                value={data.statistics_kpis.applications_with_credit_disbursed_count}
              />
            </div>
            <div className="col-span-1">
              <DashboardItemContainer
                color="red"
                description={t("Application(s) overdue")}
                value={data.statistics_kpis.applications_overdue_count}
              />
            </div>
            <div className="col-span-1">
              <DashboardItemContainer
                color="red"
                valueClassName="text-[30px]"
                suffix={` ${t("days")}`}
                description={t("Average time to process an application")}
                value={data.statistics_kpis.average_processing_time}
              />
            </div>
          </div>
          <div className="grid lg:gap-10 grid-cols-1 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-2">
            <div className="col-span-1">
              <DashboardItemContainer
                suffix="%"
                color="red"
                description={t("MSME selecting your credit option")}
                value={data.statistics_kpis.proportion_of_submitted_out_of_opt_in}
              />
            </div>
            <div className="col-span-1">
              <DashboardItemContainer
                valueClassName="text-[20px]"
                description={t("Average amount of credit requested")}
                value={`${CURRENCY_FORMAT_OPTIONS.default.options.currency} ${formatCurrency(
                  data.statistics_kpis.average_amount_requested,
                  CURRENCY_FORMAT_OPTIONS.default.options.currency,
                )}`}
              />
            </div>
            <div className="col-span-1">
              <DashboardItemContainer
                valueClassName="text-[30px]"
                suffix={` ${t("months")}`}
                description={t("Average repayment period requested")}
                value={data.statistics_kpis.average_repayment_period}
              />
            </div>
            <div className="col-span-1">
              <DashboardItemContainer
                color="red"
                description={t("Application(s) waiting on business for information")}
                value={data.statistics_kpis.applications_waiting_for_information_count}
              />
            </div>
          </div>
        </Container>
      )}
      {!data && isLoading && (
        <Container className="p-0 lg:pr-20 ml-0">
          <Loader />
        </Container>
      )}
      <Title type="section" label={t("Applications")} className="mb-6 mt-4" />
      <Text className="mb-8">
        {t(
          "Approve applications by selecting the start or continue options. Completed applications are only stored for one week after approval.",
        )}
      </Text>
      <ApplicationsList type={USER_TYPES.FI} />
      <Box className="flex flex-row gap-x-4 items-center justify-end">
        {isDownloading && <CircularProgress className="text-grass" />}

        <Button
          className="p-3 mb-3 mt-3 justify-start"
          onClick={downloadDocument}
          label={t("Download all applications")}
          size="small"
          noIcon
          disabled={isDownloading}
        />
      </Box>
    </>
  );
}

export default HomeFI;
