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
