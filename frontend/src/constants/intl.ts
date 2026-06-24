interface CurrencyFormatOptions {
  locale: string;
  options: Intl.NumberFormatOptions;
}

const CURRENCY_FORMAT_OPTIONS: { [key: string]: CurrencyFormatOptions } = {
  COP: {
    locale: "es-CO", // 'en-US
    options: {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    },
  },
  USD: {
    locale: "en-US",
    options: {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
  default: {
    locale: import.meta.env.VITE_LOCALE,
    options: {
      style: "currency",
      currency: import.meta.env.VITE_CURRENCY,
    },
  },
};

export default CURRENCY_FORMAT_OPTIONS;
