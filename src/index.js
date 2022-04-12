import React, { createContext, useRef, useContext, useState } from "react";
import formToObject from "form_to_object";

const logError = (error) => console.error(error);

const serialize = (form) => {
  const enctype = (form.enctype || "").toLowerCase();
  if (enctype === "multipart/form-data") {
    return new FormData(form);
  }
  return formToObject(form) || {};
};

export const FormContext = createContext({});

export function FormError({ children }) {
  const { error, handled } = useContext(FormContext);
  handled.current = true;
  const message = error ? error.message : "";
  if (!children) return message || null;
  if (typeof children === "function") return children(message, error);
  return error ? children : null;
}

export function FormLoading({ children }) {
  const { loading } = useContext(FormContext);
  if (typeof children === "function") return children(loading);
  return loading ? children : null;
}

export default function Form({
  onSubmit,
  onError,
  onChange,
  autoReset,
  children,
  ...props
}) {
  const handled = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  if (!onSubmit && !onChange) {
    throw new Error("onSubmit() callback is required");
  }

  const handleSubmit = async (e) => {
    try {
      e.persist();
      e.preventDefault();

      // Disable the form while everything is going on
      setLoading(true);

      await onSubmit(serialize(e.target));

      // Reset the data from the form if there was no issue
      if (autoReset) e.target.reset();
    } catch (error) {
      setError(error);
      if (onError) onError(error);
      else if (!handled.current) {
        logError(error);
      }
    } finally {
      // If the component unmounts before the callback finishes, ignore it
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    onChange ? onChange(serialize(e.currentTarget)) : null;

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
