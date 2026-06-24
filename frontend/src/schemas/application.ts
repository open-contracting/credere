import { type TypeOf, z } from "zod";
import type { APPLICATION_STATUS, USER_TYPES } from "../constants";
import { isDateAfterCurrentDate } from "../util";
import { t } from "../util/i18n";
import { emailSchema } from "./auth";

export const introSchema = z.object({
  accept_terms_and_conditions: z.boolean().refine((value) => value === true, {
    message: "You need to check this option to Access the Scheme",
  }),
});

export type IntroInput = TypeOf<typeof introSchema>;

export const submitSchema = z.object({
  agree_topass_info_to_banking_partner: z.boolean().refine((value) => value === true, {
    message: "You need to check this option to submit the application",
  }),
});

export type SubmitInput = TypeOf<typeof submitSchema>;

const UUIDType = z.string().optional();

const applicationBaseSchema = z.object({
  uuid: UUIDType,
});

export type ApplicationBaseInput = TypeOf<typeof applicationBaseSchema>;

export const declineApplicationSchema = z
  .object({
    decline_this: z.boolean(),
    decline_all: z.boolean(),
    uuid: UUIDType,
  })
  .refine((data) => data.decline_this || data.decline_all, {
    path: ["decline_all"],
    message: "You need to check at least one option to Decline the Scheme",
  });

export type DeclineApplicationInput = TypeOf<typeof declineApplicationSchema>;

enum DECLINE_FEEDBACK {
  dont_need_access_credit = "dont_need_access_credit",
  already_have_acredit = "already_have_acredit",
  preffer_to_go_to_bank = "preffer_to_go_to_bank",
  dont_want_access_credit = "dont_want_access_credit",
  suspicious_email = "suspicious_email",
  other = "other",
}

export const DECLINE_FEEDBACK_NAMES: { [key: string]: string } = {
  [DECLINE_FEEDBACK.dont_need_access_credit]: t("Don't need access credit"),
  [DECLINE_FEEDBACK.already_have_acredit]: t("Already have acredit"),
  [DECLINE_FEEDBACK.preffer_to_go_to_bank]: t("Preffer to go to bank"),
  [DECLINE_FEEDBACK.dont_want_access_credit]: t("Don't want access credit"),
  [DECLINE_FEEDBACK.suspicious_email]: t(
    "I perceive the email as suspicious or I do not trust that the credit proposal is true",
  ),
  [DECLINE_FEEDBACK.other]: t("Other"),
};

export const declineFeedbackSchema = z.object({
  [DECLINE_FEEDBACK.dont_need_access_credit]: z.boolean(),
  [DECLINE_FEEDBACK.already_have_acredit]: z.boolean(),
  [DECLINE_FEEDBACK.preffer_to_go_to_bank]: z.boolean(),
  [DECLINE_FEEDBACK.dont_want_access_credit]: z.boolean(),
  [DECLINE_FEEDBACK.suspicious_email]: z.boolean(),
  [DECLINE_FEEDBACK.other]: z.boolean(),
  other_comments: z.string().optional(),
  uuid: UUIDType,
});

export type DeclineFeedbackInput = TypeOf<typeof declineFeedbackSchema>;

const creditOptionsSchema = z.object({
  borrower_size: z.string().min(1, "Borrower size is required"),
  sector: z.string().min(1, "Sector is required"),
  annual_revenue: z.coerce.number().optional().nullable(),
  amount_requested: z.coerce.number().min(1, "Amount requested must be greater than 0"),
  uuid: UUIDType,
});

export type CreditOptionsInput = TypeOf<typeof creditOptionsSchema>;

export type GetCreditProductsOptionsInput = Omit<CreditOptionsInput, "sector" | "annual_revenue">;

export const repaymentTermsSchema = z.object({
  repayment_years: z.coerce
    .number({
      required_error: "Years is required",
      invalid_type_error: "Years must be a number",
    })
    .gte(0, "Years must be greater or equal than "),
  repayment_months: z.coerce.number().min(1, "Months must be greater or equal than 1"),
  payment_start_date: z
    .string()
    .min(1, "Payment start date is required")
    .refine((value) => isDateAfterCurrentDate(value), {
      message: "Payment start date must be after current date",
    }),
});

export type RepaymentTermsInput = TypeOf<typeof repaymentTermsSchema>;

export type SelectCreditProductInput = CreditOptionsInput &
  Partial<RepaymentTermsInput> & { credit_product_id: number };

export interface IAward {
  id: number;
  borrower_id: number;
  source_contract_id: string;
  title: string;
  description: string;
  award_date: string;
  award_amount: number;
  award_currency: string;
  contractperiod_startdate: string;
  contractperiod_enddate: string;
  missing_data: { [key: string]: boolean };
  payment_method: unknown;
  buyer_name: string;
  source_url: string;
  entity_code: string;
  contract_status: string;
  procurement_method: string;
  contracting_process_id: string;
  procurement_category: string;
  created_at: string;
  updated_at: string;
}

type PrivateApplicationInput = {
  application_id: number;
};

export type IUpdateAward = Partial<Omit<IAward, "id" | "borrower_id" | "missing_data" | "created_at" | "updated_at">> &
  PrivateApplicationInput;

export interface IBorrower {
  id: number;
  borrower_identifier: string;
  legal_name: string;
  email: string;
  address: string;
  legal_identifier: string;
  type: string;
  sector: string;
  size: string;
  annual_revenue?: number;
  currency: string;
  status: string;
  missing_data: { [key: string]: boolean };
  created_at: string;
  updated_at: string;
  declined_at?: string | null;
}

export type IUpdateBorrower = Partial<
  Omit<
    IBorrower,
    "id" | "borrower_identifier" | "status" | "missing_data" | "created_at" | "updated_at" | "declined_at"
  >
> &
  PrivateApplicationInput;

export type IVerifyDocument = {
  document_id: number;
  verified: boolean;
};
export interface ILenderBase {
  name: string;
  email_group: string;
  type: string;
  sla_days: number;
  logo_filename: string;
  external_onboarding_url: string;
}

export interface ILenderUpdate extends ILenderBase {
  id: number;
}

export interface ICreditProductBase {
  borrower_size: string;
  lower_limit: number;
  upper_limit: number;
  interest_rate: string;
  procurement_category_to_exclude: string;
  type: string;
  required_document_types: { [key: string]: boolean };
  other_fees_total_amount: number;
  other_fees_description: string;
  additional_information: string;
  more_info_url: string;
  lender_id: number;
}

export interface ICreditProductUpdate extends ICreditProductBase {
  id: number;
}

export interface ICreditProduct extends ICreditProductUpdate {
  lender: ILenderUpdate;
  created_at?: string;
  updated_at?: string;
}

export interface ILender extends ILenderUpdate {
  created_at: string;
  updated_at: string;
  credit_products: ICreditProduct[];
}

export interface IBorrowerDocument {
  id: number;
  type: string;
  verified: boolean;
  name: string;
}

export interface IModifiedDataFields {
  modified_at: string;
  user: string;
  user_type: USER_TYPES;
}

interface ICalculatorData {
  borrower_size?: string;
  amount_requested?: number;
  repayment_years?: number;
  repayment_months?: number;
  payment_start_date?: string;
}

export interface IApplication {
  id: number;
  borrower: IBorrower;
  award: IAward;
  lender?: ILender;
  award_id: number;
  uuid: string;
  primary_email: string;
  status: APPLICATION_STATUS;
  award_borrowed_identifier: string;
  borrower_id: number;
  lender_id?: number;
  amount_requested?: number | null;
  currency: string;
  repayment_months?: number;
  repayment_years?: number;
  payment_start_date?: string;
  calculator_data: ICalculatorData;
  pending_documents: boolean;
  pending_email_confirmation: boolean;
  borrower_submitted_at?: string | null;
  borrower_accepted_at?: string | null;
  borrower_declined_at?: string | null;
  borrower_declined_preferences_data: { [key: string]: unknown };
  borrower_declined_data: { [key: string]: unknown };
  lender_started_at?: string | null;
  secop_data_verification: { [key: string]: boolean };
  lender_approved_at?: string | null;
  lender_approved_data: { [key: string]: unknown };
  lender_rejected_data: { [key: string]: unknown };
  borrower_accessed_external_onboarding_at?: string | null;
  completed_in_days?: number | null;
  created_at: string;
  updated_at: string;
  expired_at: string;
  archived_at?: string | null;
  credit_product_id?: number;
  credit_product?: ICreditProduct;
  borrower_documents: IBorrowerDocument[];
  modified_data_fields?: {
    award_updates: { [key: string]: IModifiedDataFields };
    borrower_updates: { [key: string]: IModifiedDataFields };
  };
}

export interface UploadFileInput {
  type: string;
  file: File;
  uuid: string;
}

export interface IExtendedApplication {
  buyer_name: string;
  borrower_name: string;
  lender_name: string;
  award_amount: number;
}

export const EXTENDED_APPLICATION_FROM = {
  buyer_name: "award.buyer_name",
  borrower_name: "borrower.legal_name",
  lender_name: "lender.name",
  award_amount: "award.award_amount",
};

export interface IExtendedUser {
  lender_name: string;
  name: string;
}

export const EXTENDED_USER_FROM: IExtendedUser = {
  lender_name: "lender.name",
  name: "name",
};

export interface IApplicationResponse {
  application: IApplication;
  borrower: IBorrower;
  award: IAward;
  lender: ILender;
  documents: IBorrowerDocument[];
  creditProduct: ICreditProduct;
}

export interface PaginationInput {
  page: number;
  page_size: number;
  sort_field: string;
  sort_order: "asc" | "desc";
  search_value?: string;
}

export interface IApplicationsListResponse {
  items: IApplication[];
  count: number;
  page: number;
  page_size: number;
}

export interface IApplicationCreditOptions {
  loans: ICreditProduct[];
  credit_lines: ICreditProduct[];
}

export interface ILenderListResponse {
  items: ILender[];
  count: number;
  page: number;
  page_size: number;
}

export const formEmailSchema = z.object({
  message: z.string().min(1, "A message is required"),
});

export type FormEmailInput = TypeOf<typeof formEmailSchema>;

export type EmailToSMEInput = FormEmailInput & PrivateApplicationInput;

export const approveSchema = z.object({
  compliant_checks_completed: z.boolean(),
  compliant_checks_passed: z.boolean(),
  disbursed_final_amount: z.coerce
    .number({
      required_error: "Disbursed final amount is required",
      invalid_type_error: "Disbursed final amount must be a number",
    })
    .gt(0, "Disbursed final amount must be greater than 0"),
});

export type FormApprovedInput = TypeOf<typeof approveSchema>;

export type ApproveApplicationInput = FormApprovedInput & PrivateApplicationInput;

export const rejectSchema = z.object({
  compliance_checks_failed: z.boolean(),
  poor_credit_history: z.boolean(),
  risk_of_fraud: z.boolean(),
  other: z.boolean(),
  other_reason: z.string(),
});

export type FormRejectInput = TypeOf<typeof rejectSchema>;

export type RejectApplicationInput = FormRejectInput & PrivateApplicationInput;

export const changeEmailSchema = z.object({
  new_email: emailSchema,
});

export type FormChangeEmailInput = TypeOf<typeof changeEmailSchema>;

export type ChangeEmailInput = FormChangeEmailInput & ApplicationBaseInput;

export interface ConfirmChangeEmailInput {
  uuid: string;
  confirmation_email_token: string;
}
