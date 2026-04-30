# Form Mate [![npm install form-mate](https://img.shields.io/badge/npm%20install-form--mate-blue.svg)](https://www.npmjs.com/package/form-mate) [![test badge](https://github.com/franciscop/form-mate/workflows/tests/badge.svg)](https://github.com/franciscop/form-mate/actions) [![gzip size](https://img.badgesize.io/franciscop/form-mate/master/index.min.js.svg?compression=gzip)](https://github.com/franciscop/form-mate/blob/master/index.min.js)

A tiny and elegant library to handle forms with React:

```js
import Form from "form-mate";

// { fullname: "Francisco", email: "xxxxxx@francisco.io" }
export default () => (
  <Form onSubmit={(data) => console.log(data)}>
    <input name="fullname" required />
    <input name="email" type="email" required />
    <button>Subscribe!</button>
  </Form>
);
```

Benefits over a plain `<form>`:

- Parse the form fields into an object for easy access and consumption. For example, for a form on a TODO list: `onSubmit(newItem => setItems([...items, newItem]))`.
- Disable the form while it's submitting to avoid double-submit.
- Prop [`onError`](#onerror) for easy error handling, integrates well with other options.
- Prop [`onChange`](#onchange) to listen to the form changes as they happen.
- Prop [`autoReset`](#autoreset) to clear the form after `onSubmit` finishes successfully.
- Prop [`encType`](#enctype) (like `encType="multipart/form-data"`) for file handling. It makes the callback receive an instance of `FormData` instead of a plain object. This makes it easy to submit files with `fetch()`, Axios, etc.
- Sub Component `<Form.Error />` for more advanced error management.
- Sub Component `<Form.Loading />` for more advanced loading state handling.

## Getting Started

Install `form-mate` with npm:

```
npm install form-mate
```

Import it and use it anywhere in your React project:

```js
import Form from "form-mate";

export default () => (
  <Form onSubmit={(data) => console.log(data)} autoReset>
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
    <Form onSubmit={(data) => console.log(data)}>
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

It prevents the default action automatically. See [the tests](https://github.com/franciscop/form-mate/blob/master/src/index.test.tsx) for more examples of how the fields are parsed.

To type the form data, annotate the `data` parameter:

```ts
type SubscribeData = { name: string; gender: "female" | "male" };

<Form onSubmit={(data: SubscribeData) => console.log(data.name)}>
  ...
</Form>
```

### onError

Optional prop to handle any error happening in the `onSubmit`, ideal for external error management:

```js
import Form from "form-mate";
import toast from "react-hot-toast";

export default () => {
  const onSubmit = (data) => {
    throw new Error("Aaaaagh");
  };
  const onError = (error) => toast.error(error.message);
  return (
    <Form onSubmit={onSubmit} onError={onError} autoReset>
      <input name="fullname" required />
      <input name="email" type="email" required />
      <button>Subscribe!</button>
    </Form>
  );
};
```

For inline error management, it would be better to use [`<Form.Error />`](#formerror):

```js
<Form onSubmit={onSubmit} autoReset>
  <Form.Error>{(msg) => (msg ? <p>{msg}</p> : "")}</Form.Error>
  <input name="fullname" required />
  <input name="email" type="email" required />
  <button>Subscribe!</button>
</Form>
```

### onChange

Listen to the forms' changes in fields as they happen. It will be triggered on every keystroke, on every click that changes the data, etc:

```js
import { useState } from "react";
import Form from "form-mate";

export default function Preview() {
  const [name, setName] = useState("");
  return (
    <Form onSubmit={...} onChange={(data) => setName(data.name)}>
      <input name="name" />
      <p>Preview: {name}</p>
      <button>Submit</button>
    </Form>
  );
}
```

It can be useful for e.g. live previews, character counts, or enabling/disabling other parts of the UI based on the current field values.

### autoReset

By default the form is not reset after it's submitted. This prop can make the form to reset **after** the `onSubmit` callback has resolved successfully:

```js
<Form onSubmit={...} autoReset>...</Form>
```

Even with this prop, the form will _not_ be reset if the `onSubmit` throws an error.

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

In that case, the argument `data` passed to the `onSubmit` and `onChange` will be an [instance of `FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData) instead.

### \<Form.Error /\>

When there's an error on the `onSubmit` function, you can use this component to display it in multiple ways:

```js
import Form from 'form-mate';

export default () => (
  <Form onSubmit={...}>
    {/* A plain string with any error message from onSubmit */}
    <Form.Error />

    {/* A simple message that is displayed only when there's an error */}
    <Form.Error>There was an issue...</Form.Error>

    {/* Use the actual error message within a callback */}
    <Form.Error>{msg => msg ? <p className="error">{msg}</p> : ''}</Form.Error>

    <input name="name" />
    <button>Send</button>
  </Form>
);
```

- `<Form.Error />` will display the `.message` property of the error, only when an error was thrown.
- `<Form.Error>Hello</Form.Error>` will display the "Hello" message only when there's an error. This is useful for e.g. complimentary error icons, or messages, that are not the main thing.
- `<Form.Error>{msg => msg ? 'a' : 'b'}</Form.Error>` this will _always_ call the callback; if there was an error, its `.message` will be the first argument, and if there was no error it will be empty.

> Still aliased as `import { FormError } from 'form-mate'`, but the `<Form.Error>` way is recommended now.

### \<Form.Loading /\>

Show the loading state of the form. The form starts "loading" when its submitted, and finishes loading when the onSubmit() callback finishes executing:

```js
import Form from 'form-mate';

export default () => (
  <Form onSubmit={...}>
    {/* Renders only while loading */}
    <Form.Loading>Loading...</Form.Loading>
    <input name="name" />
    <button>
      {/* Always executed, receiving the loading status as the first param */}
      <Form.Loading>
        {loading => loading ? 'Sending...' : 'Send'}
      </Form.Loading>
    </button>
  </Form>
);
```

- `<Form.Loading>Hello</Form.Loading>` will display the "Hello" message only while the form is loading. This is useful for e.g. complimentary messages, loading indicators, etc.
- `<Form.Loading>{loading => loading ? 'a' : 'b'}</Form.Loading>` this will _always_ call the callback; if the component is loading it will receive `true` as it's only parameter, if it's not then it'll receive `false`.

> Still aliased as `import { FormLoading } from 'form-mate'`, but the `<Form.Loading>` way is recommended now.

## Examples

### Add items to a list

A fully working shopping list example ([**see codesandbox**](https://codesandbox.io/s/determined-nightingale-hzmob)):

```js
import React, { useState } from "react";
import Form from "form-mate";

export default function Groceries() {
  const [items, setItems] = useState([]);
  return (
    <ul>
      {items.map((item) => (
        <li key={item.text}>
          {item.text} × {item.quantity}
        </li>
      ))}
      <li>
        <Form onSubmit={(item) => setItems([...items, item])} autoReset>
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
  const onSubmit = async (data) => {
    // Send the data to the server
    const headers = { "Content-Type": "multipart/form-data" };
    await axios.post("/hello", data, { headers });
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

### Axios and Hot-Toast

The common pattern to handle forms is to submit the data with Axios, so let's do so:

```js
// This should be somewhere in your codebase, let's assume that your
// API returns a body with { error: "message" } when appropriate
import axios from "axios";

axios.interceptors.response.use(
  (res) => res.data,
  (error) => {
    // A better message to show to the user than the default HTTP one
    const message = error.response?.data?.error;
    if (message) {
      logError(message); // Or any other preferred way
      throw new Error(message);
    }

    // No message; just re-throw the previous error (or anything else)
    throw error;
  }
);
```

Then when handling our form, we just need to add an onSubmit as usual, without try/catch, since it'll already be caught by Form Mate and handed with the `onError`:

```js
import Form from "form-mate";
import axios from "axios";
import toast from "react-hot-toast";

export default function LoginForm() {
  const redirect = useRedirect(); // With your favourite routing lib

  const onSubmit = async (data) => {
    await axios.post("/login", data);
    toast.success(`Successfully logged in!`);
    redirect("/");
  };

  // Show the error, wherever it comes from, on a popup
  const onError = (error) => toast.error(error.message);

  return (
    <Form onSubmit={onSubmit} onError={onError}>
      ...
    </Form>
  );
}
```

### Conditional fields

Let's say you want a bit of context of where your users are from. So you ask them for their country, and if the country they provide is the USA you also want their state. Otherwise you don't care if in Spain they are from Madrid or Barcelona.

So we want to render the field to select the state only when the user is from the USA, let's see one way of doing it. We create a form-level variable called "showState", which will be set to `true` when in the USA and to false otherwise, and hence render the state selector when set to true.

[**See CodeSandbox**](https://codesandbox.io/s/loving-keller-ef1k27?file=/src/App.js):

```js
export default function RegisterForm() {
  // When in the USA, `showState` should be set to `true`. The select
  // Defaults to the first country, which is the USA
  const [showState, setShowState] = useState(true);

  const onChangeCountry = (e) => {
    const newCountry = e.target.value;
    // If the new value is the same as the old one, React will
    // ignore this, so we don't need to manually check with an if()
    setShowState(newCountry === "usa");
  };

  return (
    <Form onSubmit={onSubmit}>
      <select name="country" onChange={onChangeCountry}>
        <option value="usa">USA</option>
        <option value="esp">Spain</option>
        <option value="jpn">Japan</option>
        ...
      </select>
      {showState ? (
        <select name="state">
          <option value="ca">California</option>
          <option value="ma">Massachusetts</option>
          <option value="ny">New York</option>
          ...
        </select>
      ) : null}
      <br />
      <button>Send</button>
    </Form>
  );
}
```

There are few other ways of doing this, like with `<Form onChange={...}>`, or with a `ref` assigned to the country selector.

If we want to apply styles ot our state selector and not have it jump in but instead transition from opaque to visible, we could always render it but hidden it; for that we'd also remove the `name` when hidden to avoid it being present when submitting:

[**See CodeSandbox**](https://codesandbox.io/s/eloquent-dirac-586e9o?file=/src/App.js):

```js
<select
  name={showState ? "state" : null}
  style={{
    transition: "all .2s ease",
    opacity: showState ? 1 : 0,
    pointerEvents: showState ? "all" : "none",
  }}
>
  <option value="ca">California</option>
  <option value="ma">Massachusetts</option>
  <option value="ny">New York</option>
  ...
</select>
```

### HTML Validation

While React Form is **not** focused on validation, you can still perform three kind of validations: HTML validation, Soft Validation and Hard Validation. We only recommend HTML Validation with this library, but you can do the others in a pinch.

What do we mean by HTML validation? What your browser provides, you can add fields like `required`, specify the `type="email"` and such for proper formatting:

- `required`: the field needs to be filled for it to be valid
- `type="number|email|phone|..."`: the field needs to be formatted like an {number|email|phone|...} to be valid
- `minlength="3"` and `maxlength="10"`: the field needs to have that number of characters (for strings).
- `min="3"` and `max="10"`: the field needs to be between those values (for numbers).
- `pattern`: the data needs to match a regular expression.

As always, [MDN documentation on Built-in validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation#using_built-in_form_validation) is spectacular, so please refer to it for further information.

A basic example for a LoginForm would be:

```js
export default function LoginForm() {
  return (
    <Form onSubmit={console.log}>
      <div>
        <input name="email" type="email" required />
      </div>
      <div>
        <input name="password" type="password" required minlength="10" />
      </div>
      <button>Login</button>
    </Form>
  );
}
```
