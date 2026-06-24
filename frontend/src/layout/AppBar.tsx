import { Box, Container, Toolbar, useMediaQuery } from "@mui/material";
import MuiAppBar from "@mui/material/AppBar";
import { useTranslation as useT } from "react-i18next";
import { Link } from "react-router";
import Text from "src/stories/text/Text";

import OCPLogo from "../assets/ocp-logo.svg";
import StriveLogo from "../assets/strive-logo.svg";
import SelectLanguageComponent from "../components/SelectLanguageComponent";
import Button from "../stories/button/Button";

export interface AppBarProps {
  auth?: boolean;
  logout?: () => void;
}

const styleWithMobileLogo = {
  width: "125px",
};

const styleWithMobileLogoStrive = {
  width: "160px",
};

export function AppBar({ auth = true, logout }: AppBarProps) {
  const { t } = useT();
  const matches = useMediaQuery("(min-width:600px)");

  return (
    <MuiAppBar position="static" className="bg-darkest" elevation={0}>
      <Container maxWidth={false} className="lg:px-20 md:px-12 sm:px-10 px-6 mx-0">
        <Toolbar disableGutters sx={{ height: "100px" }}>
          <div className="flex flex-row items-end">
            <Link to="/" style={{ textDecoration: "none", color: "#fff" }}>
              <img style={matches && auth ? {} : styleWithMobileLogo} src={OCPLogo} alt="logo" />
            </Link>
            <div className={`flex ${matches ? "flex-row ml-5 items-end" : "flex-col ml-2"}  justify-end`}>
              <Text className={`mb-2 text-white ${matches ? "text-xl mr-6" : "text-xs mr-1"}`}>Supported by</Text>
              <img
                className="justify-self-end"
                style={matches && auth ? styleWithMobileLogoStrive : { width: "92px" }}
                src={StriveLogo}
                alt="strive-logo"
              />
            </div>
          </div>

          <Box sx={{ display: "flex", flexGrow: 1, justifyContent: "flex-end" }}>
            <SelectLanguageComponent />
            {auth && !!logout && (
              <Button noIcon={!matches} className="ml-2" size="small" label={t("Logout")} onClick={() => logout()} />
            )}
            {!auth && <Button className="ml-2" size="small" label={t("Login")} component={Link} to="/login" />}
          </Box>
        </Toolbar>
      </Container>
    </MuiAppBar>
  );
}
