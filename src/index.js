import React, { useRef } from "react";
import formToObject from "form_to_object";

const logError = error => console.error(error);

const serialize = form => {
  const enctype = (form.enctype || "").toLowerCase();
  if (enctype === "multipart/form-data") {
    return new FormData(form);
  }
  return formToObject(form) || {};
};

export default function Form({
  onSubmit,
  onError = logError,
  onChange,
  autoReset,
  children,
  ...props
}) {
  const ref = useRef();
  if (!onSubmit && !onChange) {
    throw new Error("onSubmit() callback is required");
  }

  const handleSubmit = async e => {
    try {
      e.persist();
      e.preventDefault();

      // Disable the form while everything is going on
      ref.current.disabled = true;

      await onSubmit(serialize(e.target));

      // Reset the data from the form if there was no issue
      if (autoReset) e.target.reset();
    } catch (error) {
      onError(error);
    } finally {
      // If the component unmounts before the callback finishes, ignore it
      if (!ref || !ref.current) return;
      ref.current.disabled = false;
    }
  };

  const handleChange = e =>
    onChange ? onChange(serialize(e.currentTarget)) : null;

  return (
    <form onSubmit={handleSubmit} onChange={handleChange} {...props}>
      <fieldset style={{ padding: 0, margin: 0, border: "none" }} ref={ref}>
        {children}
      </fieldset>
    </form>
  );
}
