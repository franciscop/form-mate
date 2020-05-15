import React, { useRef } from "react";
import serialize from "form_to_object";

const logError = error => console.error(error);

export default function Form({
  onSubmit,
  onError = logError,
  autoReset,
  children,
  ...props
}) {
  const ref = useRef();
  if (!onSubmit) throw new Error("onSubmit() callback is required");

  const handleSubmit = async e => {
    try {
      e.persist();
      e.preventDefault();

      // Disable the form while everything is going on
      ref.current.disabled = true;

      // Retrieve the data as a plain object
      const data = serialize(e.target);
      await onSubmit(data || {});

      // Reset the data from the form if there was no issue
      if (autoReset) e.target.reset();
    } catch (error) {
      onError(error);
    } finally {
      ref.current.disabled = false;
    }
  };

  return (
    <form onSubmit={handleSubmit} {...props}>
      <fieldset style={{ padding: 0, border: "none" }} ref={ref}>
        {children}
      </fieldset>
    </form>
  );
}
