// Type-level tests, checked by `npm run lint` (tsc), not by vitest.
import Form from "./index";

// Real handlers return something: toast.error() returns the toast id, an API
// call returns the response. A handler type whose return is ignored has to
// accept those, the same way React's own onClick does.
const toastError = (message: string): string => message;
const post = async (data: unknown): Promise<Response> =>
  new Response(String(data));

export const returningHandlers = (
  <Form onSubmit={(data) => post(data)} onError={(e) => toastError(e.message)}>
    <button>Submit</button>
  </Form>
);

export const voidHandlers = (
  <Form onSubmit={() => {}} onError={() => {}} onChange={() => {}}>
    <button>Submit</button>
  </Form>
);

export const asyncVoidHandlers = (
  <Form onSubmit={async () => {}} onError={async () => {}}>
    <button>Submit</button>
  </Form>
);

const userSchema = {
  "~standard": {
    version: 1 as const,
    vendor: "test",
    validate: (value: unknown) => ({ value: value as { age: number } }),
    types: undefined as unknown as { input: unknown; output: { age: number } },
  },
};

export const schemaInfersOutput = (
  <Form schema={userSchema} onSubmit={(data) => data.age.toFixed()}>
    <button>Submit</button>
  </Form>
);

export const schemaRejectsWrongOutput = (
  <Form
    schema={userSchema}
    // @ts-expect-error `age` is a number after parsing
    onSubmit={(data: { age: string }) => data.age}
  >
    <button>Submit</button>
  </Form>
);

export const changeFlag = (
  <Form
    onSubmit={() => {}}
    onChange={(_data, valid) => valid satisfies boolean}
  >
    <button>Submit</button>
  </Form>
);

export const multipartIsFormData = (
  <Form
    schema={userSchema}
    encType="multipart/form-data"
    onSubmit={(data) => data.get("age") satisfies FormDataEntryValue | null}
  >
    <button>Submit</button>
  </Form>
);

export const multipartRejectsSchemaOutput = (
  <Form
    schema={userSchema}
    encType="multipart/form-data"
    // @ts-expect-error multipart forms pass the FormData, not the output
    onSubmit={(data: { age: number }) => data.age}
  >
    <button>Submit</button>
  </Form>
);
