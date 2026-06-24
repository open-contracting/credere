import axios from "axios";
import type { EnqueueSnackbar } from "notistack";
import type { ZodError, ZodType, z } from "zod";
import { t } from "../util/i18n";

class ValidationError extends Error {
  constructor(
    message: string,
    public readonly cause: ZodError,
  ) {
    super(message);
  }
}

export const validation = <T extends ZodType>(schema: T, data: unknown, errorMessage?: string): z.infer<T> => {
  const result = schema.safeParse(data);
  if (result.success) return result.data;

  throw new ValidationError(errorMessage ?? "Validation error", result.error);
};

export const handleRequestError = (error: unknown, enqueueSnackbar: EnqueueSnackbar, defaultMessage: string) => {
  if (axios.isAxiosError(error) && error.response) {
    if (error.response.data?.detail) {
      enqueueSnackbar(t("Error: {{error}}", { error: error.response.data.detail }), {
        variant: "error",
      });
    }
  } else {
    enqueueSnackbar(defaultMessage, {
      variant: "error",
    });
  }
};
