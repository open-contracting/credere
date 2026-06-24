import { Box, Link as MUILink } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { useTranslation as useT } from "react-i18next";
import { Link } from "react-router";
import Button from "src/stories/button/Button";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";
import { z } from "zod";

import { getApplicationFn } from "../../api/private";
import ApplicationAwardTable from "../../components/ApplicationAwardTable";
import ApplicationBorrowerTable from "../../components/ApplicationBorrowerTable";
import ApplicationDocumentsTable from "../../components/ApplicationDocumentsTable";
import DataDisplay from "../../components/DataDisplay";
import { APPLICATION_STATUS, COMPLETED_STATUS, QUERY_KEYS } from "../../constants";
import { useParamsTypeSafe } from "../../hooks/useParamsTypeSafe";
import type { IApplication } from "../../schemas/application";
import LinkButton from "../../stories/link-button/LinkButton";
import Loader from "../../stories/loader/Loader";
import { RenderStatusString } from "../../util";
import ApplicationErrorPage from "../msme/ApplicationErrorPage";

interface ApplicationDetailProps {
  application: IApplication;
  readonly: boolean;
}

function ApplicationDetail({ application, readonly }: ApplicationDetailProps) {
  const { t } = useT();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:mb-8 md:mb-8 mb-4 md:grid-cols-2 gap-4 ">
        <div className="flex items-end col-span-1 md:mr-10">
          <Title className="mb-0" type="page" label={t("Application Details")} />
        </div>
        <div className="flex justify-start items-start my-4 col-span-1 md:justify-end md:my-0 md:ml-10 lg:justify-end lg:col-span-2">
          <div className="grid grid-cols-1 gap-4 md:flex md:gap-0">
            <div>
              <Button className="md:mr-4" label={t("Dashboard")} component={Link} to="/" />
            </div>

            <div>
              <Button label={t("Settings")} component={Link} to="/settings" />
            </div>
          </div>
        </div>
      </div>
      <Box className="flex flex-row items-center mb-2">
        <Text className="text-lg mr-2">{t("Status:")}</Text>
        <Text className="text-lg font-light">{RenderStatusString(application.status)}</Text>
      </Box>

      {application.status === APPLICATION_STATUS.APPROVED && <DataDisplay data={application.lender_approved_data} />}

      {application.status === APPLICATION_STATUS.REJECTED && <DataDisplay data={application.lender_rejected_data} />}
      {!COMPLETED_STATUS.includes(application.status) && !readonly && (
        <Text className="mb-8">{t("Review and update missing data.")}</Text>
      )}
      <Title type="section" className="mb-0" label={t("Award Data")} />
      <LinkButton
        className="my-2 px-1"
        target="_blank"
        rel="noreferrer"
        label={t("View data in SECOP II")}
        component={MUILink}
        href={application.award.source_url}
      />
      <ApplicationAwardTable application={application} readonly={readonly} />
      <Title type="section" className="mt-10 mb-4" label={t("Business Data")} />
      <ApplicationBorrowerTable application={application} readonly={readonly} allowDataVerification={false} />
      <Title type="section" className="mt-10 mb-4" label={t("Business Documents")} />
      <ApplicationDocumentsTable readonly application={application} />
      <Button className="my-8" primary={false} label={t("Go back")} component={Link} to="/admin/applications" />
    </>
  );
}

export interface LoadApplicationProps {
  readonly?: boolean;
}

export function LoadApplication({ readonly = false }: LoadApplicationProps) {
  const { t } = useT();
  const [queryError, setQueryError] = useState<string>("");

  const { id } = useParamsTypeSafe(
    z.object({
      id: z.coerce.string(),
    }),
  );

  const { isLoading, data } = useQuery({
    queryKey: [QUERY_KEYS.applications, `${id}`],
    queryFn: async (): Promise<IApplication | null> => {
      const application = await getApplicationFn(id);
      return application;
    },
    retry: 1,
    enabled: !!id,
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response && error.response.data && error.response.data.detail) {
        setQueryError(error.response.data.detail);
      } else {
        setQueryError(t("Error loading application"));
      }
    },
  });

  return (
    <>
      {isLoading && <Loader />}
      {!isLoading && !queryError && data && <ApplicationDetail application={data} readonly={!!readonly} />}
      {queryError && <ApplicationErrorPage message={queryError} />}
    </>
  );
}
