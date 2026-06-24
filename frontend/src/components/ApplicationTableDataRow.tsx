import type {
  IAward,
  IBorrower,
  IBorrowerDocument,
  IModifiedDataFields,
  IUpdateAward,
  IUpdateBorrower,
} from "../schemas/application";

interface ApplicationTableDataRowProps {
  label: string;
  formLabel?: string;
  missingData: { [key: string]: boolean };
  type?: "currency" | "date-picker" | "date-field";
  preWhitespace?: boolean;
  // biome-ignore lint/suspicious/noExplicitAny: formatter functions accept various types (string, number, objects) depending on the field
  formatter?: (value: any) => string;
  isLoading: boolean;
  readonly: boolean;
  modifiedFields?: { [key: string]: IModifiedDataFields };
}

export interface ApplicationTableAwardDataRowProps extends ApplicationTableDataRowProps {
  name: keyof IAward;
  award: IAward;
  // biome-ignore lint/suspicious/noExplicitAny: value type depends on the field being updated
  updateValue?: (value: any, name: keyof IUpdateAward) => void;
}

export interface ApplicationTableBorrowerDataRowProps extends ApplicationTableDataRowProps {
  name: keyof IBorrower;
  borrower: IBorrower;
  withoutVerify?: boolean;
  useTranslation?: boolean;
  verifiedData: { [key: string]: boolean };
  // biome-ignore lint/suspicious/noExplicitAny: value type depends on the field being updated
  updateValue?: (value: any, name: keyof IUpdateBorrower) => void;
  verifyData?: (value: boolean, name: keyof IUpdateBorrower) => void;
}

export interface ApplicationTableDocumentDataRowProps extends Partial<ApplicationTableDataRowProps> {
  document: IBorrowerDocument;
  downloadDocument?: (id: number, filename: string) => void;
  verifyData?: (value: boolean, id: number) => void;
}
