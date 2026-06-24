import { useTranslation as useT } from "react-i18next";
import { Link } from "react-router";
import Button from "src/stories/button/Button";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

function PasswordCreated() {
  const { t } = useT();
  return (
    <>
      <Title type="page" label={t("Password Set")} className="mb-8" />
      <Text>{t("Thank you for setting up your Credere account.")}</Text>
      <Text className="mb-8">
        {t("Please login to start reviewing and approving credit applications from MSMEs.")}
      </Text>
      <Button label={t("Login")} component={Link} to="/login" />
    </>
  );
}

export default PasswordCreated;
