import { default as React } from "react";
export type Data =
  | FormData
  | {
      [key: string]: any;
    };
export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (data: Data) => any | Promise<any>;
  onSubmitError?: (error: Error) => any | Promise<any>;
  onChange?: (data: Data) => any;
  autoReset?: boolean;
}
export type FormErrorChildren =
  | React.ReactNode
  | ((message: string, error: Error) => React.ReactNode);
export interface FormErrorProps {
  children?: FormErrorChildren;
}
export type FormLoadingChildren =
  | React.ReactNode
  | ((loading: boolean) => React.ReactNode);
export interface FormLoadingProps {
  children?: FormLoadingChildren;
}
