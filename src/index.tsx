import React, { createContext, useContext, useRef, useState } from "react";

type Data = FormData | Record<string, any>;

// Standard Schema v1 (https://standardschema.dev): Zod, Valibot, ArkType, etc.
interface StandardIssue {
  readonly message: string;
  readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }>;
}

type StandardResult<Output> =
  | { readonly value: Output; readonly issues?: undefined }
  | { readonly issues: ReadonlyArray<StandardIssue> };

interface StandardSchemaV1<Input = unknown, Output = Input> {
  readonly "~standard": {
    readonly version: 1;
    readonly vendor: string;
    readonly validate: (
      value: unknown,
    ) => StandardResult<Output> | Promise<StandardResult<Output>>;
    readonly types?: { readonly input: Input; readonly output: Output };
  };
}

type Output<S, E> = E extends "multipart/form-data"
  ? FormData
  : S extends StandardSchemaV1
    ? NonNullable<S["~standard"]["types"]>["output"]
    : Data;

interface FormProps<
  S extends StandardSchemaV1 | undefined,
  E extends string,
> extends Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  "onSubmit" | "onError" | "onChange" | "encType"
> {
  // The return value is ignored (awaited when it's a promise), so these are
  // typed as `unknown` rather than `void | Promise<void>`. TypeScript only
  // ignores a handler's return value when the expected return type is exactly
  // `void`; uniting it with `Promise<void>` loses that, and then anything that
  // returns a value gets rejected, e.g. `onError={(e) => toast.error(e)}`.
  onSubmit: (data: Output<S, E>) => unknown;
  onError?: (error: Error) => unknown;
  onChange?: (data: Data, valid: boolean) => void;
  autoReset?: boolean;
  schema?: S;
  encType?: E;
}

type FormErrorChildren =
  React.ReactNode | ((message: string, error: Error) => React.ReactNode);

interface FormErrorProps {
  children?: FormErrorChildren;
}

type FormLoadingChildren =
  React.ReactNode | ((loading: boolean) => React.ReactNode);

interface FormLoadingProps {
  children?: FormLoadingChildren;
}

interface FormContextType {
  loading: boolean;
  error: Error | false;
  handled: React.MutableRefObject<boolean>;
}

export const FormContext = createContext<FormContextType>({
  loading: false,
  error: false,
  handled: { current: false },
});

const toObject = (formData: FormData) => {
  const data: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};
  for (let key of formData.keys()) {
    const name = key.replace(/\[\]$/, "");
    data[name] = formData.getAll(key);
    // Single item => make them a key:value
    // Multiple items => keep it an array
    if (data[name].length === 1) {
      data[name] = data[name][0];
    }
    // If there's no item, just don't define it
    if (data[name] === "") {
      delete data[name];
    }
  }
  return data;
};

const serialize = (form: HTMLFormElement): Data => {
  const formData = new FormData(form);
  const enctype = (form.enctype || "").toLowerCase();
  return enctype === "multipart/form-data" ? formData : toObject(formData);
};

// Multipart forms are validated as a plain object too
const validate = async (schema: StandardSchemaV1, form: HTMLFormElement) => {
  const result = await schema["~standard"].validate(
    toObject(new FormData(form)),
  );
  if (!result.issues) return result.value;
  const message = result.issues
    .map(({ path, message }) => {
      const keys = (path || []).map((p) =>
        String(typeof p === "object" ? p.key : p),
      );
      return keys.length ? `${keys.join(".")}: ${message}` : message;
    })
    .join("\n");
  throw Object.assign(new Error(message), { issues: result.issues });
};

export function FormError({ children }: FormErrorProps): React.ReactNode {
  const { error, handled } = useContext(FormContext);
  handled.current = true;
  const message = error ? error.message : "";
  if (!children) return message || null;
  if (typeof children === "function")
    return (children as (message: string, error: Error) => React.ReactNode)(
      message,
      error as Error,
    );
  return error ? children : null;
}

export function FormLoading({ children }: FormLoadingProps): React.ReactNode {
  const { loading } = useContext(FormContext);
  if (typeof children === "function")
    return (children as (loading: boolean) => React.ReactNode)(loading);
  return loading ? children : null;
}

function Form<
  S extends StandardSchemaV1 | undefined = undefined,
  E extends string = string,
>({
  onSubmit,
  onError = (e: Error) => console.error(e),
  onChange,
  autoReset,
  schema,
  children,
  ...props
}: FormProps<S, E>): JSX.Element {
  const handled = useRef(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | false>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setError(false);
      setLoading(true);

      const form = e.target as HTMLFormElement;
      let data: unknown = serialize(form);
      if (schema) {
        const value = await validate(schema, form);
        if (!(data instanceof FormData)) data = value;
      }
      await onSubmit(data as Output<S, E>);

      // Reset the data from the form if there was no issue
      if (autoReset) form.reset();
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError(error);
    } finally {
      // If the component unmounts before the callback finishes, ignore it
      setLoading(false);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLFormElement>) => {
    if (!onChange) return;
    const form = e.currentTarget;
    const data = serialize(form);
    let valid = form.checkValidity();
    if (valid && schema) {
      valid = await validate(schema, form).then(
        () => true,
        () => false,
      );
    }
    onChange(data, valid);
  };

  return (
    <form onSubmit={handleSubmit} onChange={handleChange} {...props}>
      <FormContext.Provider value={{ loading, error, handled }}>
        <fieldset
          style={{ padding: 0, margin: 0, border: "none" }}
          disabled={loading}
        >
          {children}
        </fieldset>
      </FormContext.Provider>
    </form>
  );
}

Form.Error = FormError;
Form.Loading = FormLoading;

export default Form;
