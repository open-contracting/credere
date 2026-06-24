import { useTranslation as useT } from "react-i18next";
import { Link } from "react-router";
import Button from "src/stories/button/Button";
import Title from "src/stories/title/Title";

import LenderList from "../../components/LenderList";
import UserList from "../../components/UserList";

function Settings() {
  const { t } = useT();

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
      <Title type="section" label={t("Credit Providers")} className="mb-6" />
      <LenderList />
      <Button className="mt-8" label={t("Add New Credit Provider")} component={Link} to="/settings/lender/new" />
      <Title type="section" label={t("Users")} className="mb-6 mt-8" />
      <UserList />
      <Button className="mt-8" label={t("Add New User")} component={Link} to="/settings/user/new" />
    </>
  );
}

export default Settings;
