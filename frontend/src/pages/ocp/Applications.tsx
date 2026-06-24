import { useTranslation as useT } from "react-i18next";
import { Link } from "react-router";
import Button from "src/stories/button/Button";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

import ApplicationsList from "../../components/ApplicationsList";
import { USER_TYPES } from "../../constants";

function Applications() {
  const { t } = useT();

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 lg:mb-8 md:mb-8 mb-4 md:grid-cols-2 gap-4 ">
        <div className="flex items-end col-span-1 md:mr-10">
          <Title className="mb-0" type="page" label={t("Applications")} />
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
      <Text className="mb-8">
        {t(
          "You can view applications and make updates to any missing or incomplete open contracting data. Approved and completed applications can be viewed, but the data is only stored for one week after the completion date.",
        )}
      </Text>
      <ApplicationsList type={USER_TYPES.OCP} />
    </>
  );
}

export default Applications;
