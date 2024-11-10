import React from "react";
import Form, { FormError, FormLoading } from "..";

<Form onSubmit={() => {}} />;
<Form onSubmit={() => {}} onError={() => {}} />;
<Form onSubmit={() => {}} onChange={() => {}} />;
<Form onSubmit={() => {}} autoReset />;
<Form onSubmit={() => {}} encType="multipart/form-data" />;

<FormError />;

// A simple message that is displayed only when there's an error
<FormError>There was an issue...</FormError>;

// Use the actual error message within a callback
<FormError>
  {(msg: string) => (msg ? <p className="error">{msg}</p> : "")}
</FormError>;

<FormLoading />;
<FormLoading>{(loading: boolean) => (loading ? "a" : "b")}</FormLoading>;
