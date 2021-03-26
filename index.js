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

      // Retrieve the data as a plain object
      const enctype = (e.target.enctype || "").toLowerCase();
      let data;
      if (enctype === "multipart/form-data") {
        data = new FormData(e.target);
      } else {
        data = serialize(e.target) || {};
      }

      // Disable the form while everything is going on
      ref.current.disabled = true;

      await onSubmit(data);

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

  return (
    <form onSubmit={handleSubmit} {...props}>
      <fieldset style={{ padding: 0, margin: 0, border: "none" }} ref={ref}>
        {children}
      </fieldset>
    </form>
  );
}
