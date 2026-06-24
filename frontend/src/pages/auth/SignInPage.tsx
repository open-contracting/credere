import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Container } from "@mui/material";
import { FormProvider, type SubmitHandler, useForm } from "react-hook-form";
import { useTranslation as useT } from "react-i18next";
import { Link } from "react-router";
import useSignIn from "src/hooks/useSignIn";
import { type LoginInput, loginSchema } from "src/schemas/auth";
import Button from "src/stories/button/Button";
import FormInput from "src/stories/form-input/FormInput";
import Text from "src/stories/text/Text";
import Title from "src/stories/title/Title";

function SignInPage() {
  const { t } = useT();
  const { signInMutation, isLoading } = useSignIn();

  const methods = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const { handleSubmit } = methods;

  const onSubmitHandler: SubmitHandler<LoginInput> = (values) => {
    // Executing the loginUser Mutation
    signInMutation(values);
  };

  return (
    <Box className="bg-background">
      <Title
        type="page"
        className="lg:pt-16 lg:pl-20 md:pt-10 md:pl-12 sm:pt-9 sm:pl-10 pt-8 pl-6 lg:mb-10 mb-6"
        label={t("Login to Credere")}
      />
      <Container
        maxWidth={false}
        className="bg-background"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          <FormProvider {...methods}>
            <Box
              component="form"
              onSubmit={handleSubmit(onSubmitHandler)}
              noValidate
              autoComplete="off"
              sx={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "#ffffff",
                p: { xs: "1rem", sm: "2rem" },
                width: { sm: "580px" },
                borderRadius: 0,
              }}
            >
              <Title type="section" className="self-center mb-8" label={t("Log in")} />
              <FormInput
                name="username"
                label={t("Email Address")}
                type="email"
                placeholder={t("example@email.com")}
              />
              <FormInput name="password" label={t("Password")} type="password" />
              <FormInput name="temp_password" label={t("One-Time Password Code (MFA)")} />

              <Text className="underline mb-10">
                <Link className="text-darkest" to="/reset-password">
                  {t("Forgot Password?")}
                </Link>
              </Text>

              <Button className="mb-10" label={t("Login")} type="submit" disabled={isLoading} />
              <Box>
                <Text className="inline-block">{t("Don't have an account? Email")}</Text>
                <Text className="inline-block underline ml-1 mb-X">
                  <a className="text-darkest" href="mailto:credere@open-contracting.org">
                    credere@open-contracting.org
                  </a>
                </Text>
              </Box>
            </Box>
          </FormProvider>
        </Box>
      </Container>
    </Box>
  );
}

export default SignInPage;
