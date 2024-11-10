type Data = FormData | { [key: string]: any };

type FormProps = {
  children?: any;

  onSubmit: (data: Data) => any | Promise<any>;
  onError?: (error: Error) => any | Promise<any>;
  onChange?: (data: Data) => any;

  autoReset?: boolean;
  encType?: "multipart/form-data";
};

export default function Form(props: FormProps): any;
export function FormError(props: { children?: any }): any;
export function FormLoading(props: { children?: any }): any;
