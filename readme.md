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
- Provide `autoReset` to clear the form when the onSubmit callback has finished successfully.
- [Error handling](#onerror) neatly integrated with the above through the `onError` prop. You can do `onError={setError}`.


## onSubmit

onSubmit accepst an `async` function. This function will be called with the values in the form:

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

See [the tests](https://github.com/franciscop/form-mate/blob/master/test.js) for more examples of how these are parsed.


## autoReset

This will make the form to reset **after** the onSubmit callback has successfully resolved:

```js
<Form onSubmit={...} autoReset>...</Form>
```

This is very useful when adding new items to a list in succession, [**see codesandbox example**](https://codesandbox.io/s/determined-nightingale-hzmob). To avoid auto resetting the form, just omit this prop altogether:

```js
<Form onSubmit={...}>...</Form>
```


## onError

You can provide an `onError` to handle any error in the `onSubmit`. This allows the onSubmit to fail as desired without resetting the form:

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



## Demo

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
