import i18n from "../i18n";

// A substitute for t() from @transifex/native.
export const t = (key: string, options?: Record<string, unknown>): string => {
  // If t() is always provided all interpolation variables and never provided {returnDetails: true},
  // the result will always be a string.
  return i18n.t(key, options) as string;
};
