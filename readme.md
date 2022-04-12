# Form Mate [![npm install form-mate](https://img.shields.io/badge/npm%20install-form--mate-blue.svg)](https://www.npmjs.com/package/form-mate) [![test badge](https://github.com/franciscop/form-mate/workflows/tests/badge.svg)](https://github.com/franciscop/form-mate/actions) [![gzip size](https://img.badgesize.io/franciscop/form-mate/master/index.min.js.svg?compression=gzip)](https://github.com/franciscop/form-mate/blob/master/index.min.js)

A tiny and elegant library to handle forms with React:

```js
import Form from "form-mate";

// { fullname: "Francisco", email: "xxxxxx@francisco.io" }
export default () => (
  <Form onSubmit={data => console.log(data)}>
    <input name="fullname" required />
    <input name="email" type="email" required />
    <button>Subscribe!</button>
  </Form>
);
```

Benefits over a plain `<form>`:

- Parse the form fields into an object for easy access and consumption. Now you can do `onSubmit(item => setItems([...items, item]))`.
- Disable the form while it's submitting to avoid double-submit.
- Prop [`onError`](#onerror) for easy error handling, integrates well with other options.
- Prop [`onChange`](#onchange) to listen to the form changes as they happen.
- Prop [`autoReset`](#autoreset) to clear the form after `onSubmit` finishes successfully.
- Prop [`encType`](#enctype) (like `encType="multipart/form-data"`) for file handling. It makes the callback receive an instance of `FormData` instead of a plain object. This makes it easy to submit files with `fetch()`, Axios, etc.
- Sub Component `<FormError />` for more advanced error management.
- Sub Component `<FormLoading />` for more advanced loading state handling.

## Getting Started

Install `form-mate` with npm:

```
npm install form-mate
```

Import it and use it anywhere in your React project:

```js
import Form from "form-mate";

export default () => (
  <Form onSubmit={data => console.log(data)} autoReset>
    {/* ... */}
  </Form>
);
```

## API

### onSubmit

Mandatory prop that accepts a sync or `async` callback. It will receive the values in the form when submitted:

```js
import Form from "form-mate";

export default function Subscribe() {
  return (
    <Form onSubmit={data => console.log(data)}>
      <input name="name" defaultValue="Francisco" />
      <input name="subscribe" defaultChecked type="checkbox" />
      <input name="terms" value="accepted" defaultChecked type="checkbox" />
      <input name="gender" value="female" type="radio" />
      <input name="gender" value="male" defaultChecked type="radio" />
      <button>Subscribe!</button>
    </Form>
  );
}
// {
//   name: "Francisco",
//   subscribe: "on", // The default when no "value" is provided
//   terms: "accepted",
//   gender: "male"
// }
```

It prevents the default action automatically. See [the tests](https://github.com/franciscop/form-mate/blob/master/test.js) for more examples of how the fields are parsed.

### onError

Optional prop to handle any error happening in the `onSubmit`. This allows the onSubmit to fail as desired. Works well with both sync and async `onSubmit`:

```js
import Form from "form-mate";

export default () => {
  const [error, setError] = useState();
  const onSubmit = data => {
    throw new Error("Aaaaagh");
  };
  return (
    <Form onSubmit={handleForm} onError={setError} autoReset>
      {error ? <p>{error.message}</p> : null}
      <input name="fullname" required />
      <input name="email" type="email" required />
      <button>Subscribe!</button>
    </Form>
  );
};
```

### onChange

Listen to the forms' changes in fields as they happen. It will be triggered on every keystroke, on every click (that changes the data), etc:

```js
import Form from "form-mate";

export default function Subscribe() {
  return (
    <Form onChange={data => console.log(data)}>
      <input name="name" defaultValue="Francisco" />
      <input name="subscribe" defaultChecked type="checkbox" />
      <input name="terms" value="accepted" defaultChecked type="checkbox" />
      <input name="gender" value="female" type="radio" />
      <input name="gender" value="male" defaultChecked type="radio" />
      <button>Subscribe!</button>
    </Form>
  );
}
```

### autoReset

By default the form is not reset after it's submitted. This prop can make the form to reset **after** the onSubmit callback has resolved successfully:

```js
<Form onSubmit={...} autoReset>...</Form>
```

Even with this prop, the form will _not_ be reset if the `onSubmit` throws an error (sync or async).

This prop is very useful when adding new items to a list in succession, [**see codesandbox example**](https://codesandbox.io/s/determined-nightingale-hzmob).

### encType

The encType can be set to `multipart/form-data` to upload files:

```js
import Form from 'form-mate';

export default() => (
  <Form onSubmit={...} encType="multipart/form-data">
    <input name="name" />
    <input type="file" name="file" />
    <button>Send</button>
  </Form>
);
```

In that case, the argument `data` passed to the onSubmit will not be a plain object, it will be an [instance of `FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData) instead.

### <FormError />

When there's an error on the `onSubmit` function, you can use this component to display it in a variety of ways:

```js
import Form, { FormError } from 'form-mate';

export default () => (
  <Form onSubmit={...}>
    // A plain string with any error message from onSubmit
    <FormError />

    // A simple message that is displayed only when there's an error
    <FormError>There was an issue...</FormError>

    // Use the actual error message within a callback
    <FormError>{msg => msg ? <p className="error">{msg}</p> : ''}</FormError>

    <input name="name" />
    <button>Send</button>
  </Form>
);
```

- `<FormError />` will display the `.message` property of the error, only when an error was thrown.
- `<FormError>Hello</FormError>` will display the "Hello" message only when there's an error. This is useful for e.g. complimentary error icons, or messages, that are not the main thing.
- `<FormError>{msg => msg ? 'a' : 'b'}</FormError>` this will *always* call the callback; if there was an error, its `.message` will be the first argument, and if there was no error it will be empty.

### <FormLoading />

A component used to handle loading state of the form. The form starts "loading" when its submitted, and finishes loading when the onSubmit() callback finishes executing (since that function is normally async):

```js
import Form, { FormLoading } from 'form-mate';

export default () => (
  <Form onSubmit={...}>
    <FormLoading>Loading...</FormLoading>  // Renders only while loading
    <input name="name" />
    <button>
      // Is always executed, receiving the loading status as the first param
      <FormLoading>
        {loading => loading ? 'Sending...' : 'Send'}
      </FormLoading>
    </button>
  </Form>
);
```

- `<FormLoading>Hello</FormLoading>` will display the "Hello" message only while the form is loading. This is useful for e.g. complimentary messages, loading indicators, etc.
- `<FormLoading>{loading => loading ? 'a' : 'b'}</FormLoading>` this will *always* call the callback; if the component is loading it will receive `true` as it's only parameter, if it's not then it'll receive `false`.

## Examples

### Add items to a list

A fully working shopping list example ([**see codesandbox**](https://codesandbox.io/s/determined-nightingale-hzmob)):

```js
import React, { useState } from "react";
import Form from "./Form";

export default function Groceries() {
  const [items, setItems] = useState([]);
  return (
    <ul>
      {items.map(item => (
        <li key={item.text}>
          {item.text} × {item.quantity}
        </li>
      ))}
      <li>
        <Form onSubmit={item => setItems([...items, item])} autoReset>
          <input name="text" placeholder="Item to buy" autoFocus />
          {" × "}
          <input type="number" name="quantity" defaultValue={1} />
          <button>Add!</button>
        </Form>
      </li>
    </ul>
  );
}
```

### Upload files with React

To upload files with React and Axios, you can do it like this:

```js
import Form from 'form-mate';

export default function App() {
  const onSubmit = data => {
    // Send the data to the server
    await axios.post("/hello", data, { "Content-Type": "multipart/form-data" });
  };
  return (
    <Form onSubmit={onSubmit} encType="multipart/form-data">
      <input name="name" />
      <input type="file" name="file" />
      <button>Send</button>
    </Form>
  );
}
```
