# Form Mate [![npm install form-mate](https://img.shields.io/badge/npm%20install-form--mate-blue.svg)](https://www.npmjs.com/package/form-mate) [![test badge](https://github.com/franciscop/form-mate/workflows/tests/badge.svg)](https://github.com/franciscop/form-mate/actions) [![gzip size](https://img.badgesize.io/franciscop/form-mate/master/index.min.js.svg?compression=gzip)](https://github.com/franciscop/form-mate/blob/master/index.min.js)

A tiny and elegant library to handle forms with React:

```js
import Form from 'form-mate';

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
- [Error handling](#onerror) neatly integrated through the `onError` prop. You can do `onError={setError}`.
- Option [`autoReset`](#autoreset) to clear the form when the onSubmit callback has finished successfully.
- Option [`encType`](#enctype) (like `encType="multipart/form-data"`) for file handling. It makes the callback receive an instance of `FormData` instead of a plain object. This makes it easy to submit files with `fetch()`, Axios, etc.


## Getting Started

Install `form-mate` with npm:

```
npm install form-mate
```

Import it and use it anywhere in your React project:

```js
import Form from 'form-mate';

export default () => (
  <Form onSubmit={data => console.log(data)}>
    {/* ... */}
  </Form>
);
```



## onSubmit

Mandatory prop that accepts a sync or `async` callback. It will receive the values in the form when submitted:

```js
import Form from 'form-mate';

export default function Subscribe(){
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



## onError

Optional prop to handle any error happening in the `onSubmit`. This allows the onSubmit to fail as desired. Works well with both sync and async `onSubmit`:

```js
import Form from 'form-mate';

export default () => {
  const [error, setError] = useState();
  const onSubmit = data => {
    throw new Error('Aaaaagh');
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



## autoReset

Make the form to reset **after** the onSubmit callback has successfully resolved:

```js
<Form onSubmit={...} autoReset>...</Form>
```

This is very useful when adding new items to a list in succession, [**see codesandbox example**](https://codesandbox.io/s/determined-nightingale-hzmob). To avoid auto resetting the form, just omit this prop altogether:

```js
<Form onSubmit={...}>...</Form>
```

Note that the form will _not_ be reset if the `onSubmit` throws an error (sync or async).



## encType

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



## Example: add items to a list

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


## Example: upload files with React

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
