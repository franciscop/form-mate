import React, { createContext, useContext, useRef, useState } from "react";
import { Data, FormErrorProps, FormLoadingProps, FormProps } from "./types";

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

const serialize = (form: HTMLFormElement): Data => {
  const enctype = (form.enctype || "").toLowerCase();
  const formData = new FormData(form);
  if (enctype === "multipart/form-data") {
    return formData;
  }
  const data: { [key: string]: string | string[] } = {};
  for (let key of formData.keys()) {
    const name = key.replace(/\[\]$/, "");
    data[name] = formData.getAll(key) as string[];
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

export default function Form({
  onSubmit,
  onSubmitError = (e: Error) => console.error(e),
  onChange,
  autoReset,
  children,
  ...props
}: FormProps): JSX.Element {
  const handled = useRef(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | false>(false);

  if (!onSubmit && !onChange) {
    throw new Error("onSubmit() callback is required");
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.persist();
      e.preventDefault();

      // Disable the form while everything is going on
      setLoading(true);

      await onSubmit(serialize(e.target as HTMLFormElement));

      // Reset the data from the form if there was no issue
      if (autoReset) (e.target as HTMLFormElement).reset();
    } catch (err) {
      const error = err as Error;
      setError(error);
      onSubmitError(error);
    } finally {
      // If the component unmounts before the callback finishes, ignore it
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLFormElement>) => {
    return onChange ? onChange(serialize(e.currentTarget)) : null;
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
