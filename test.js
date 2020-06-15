import "babel-polyfill";
import React from "react";
import $ from "react-test";
import Form from "./index.js";

const delay = (t) => new Promise((done) => setTimeout(done, t));

describe("form-mate", () => {
  it("defaults to an empty object", async () => {
    const cb = jest.fn();
    const form = $(
      <Form onSubmit={cb}>
        <button>Submit</button>
      </Form>
    );
    await form.find("button").click();
    expect(cb).toBeCalledWith({});
  });

  it("can get the data correctly", async () => {
    const cb = jest.fn();
    const form = $(
      <Form onSubmit={cb}>
        <input name="hello" defaultValue="world" />
        <button>Submit</button>
      </Form>
    );
    await form.find("button").click();
    expect(cb).toBeCalled();
    expect(cb).toBeCalledWith({ hello: "world" });
  });

  it("handles checkboxes and radiobuttons well", async () => {
    const cb = jest.fn();
    const form = $(
      <Form onSubmit={cb}>
        <input name="name" defaultValue="Francisco" />
        <input name="subscribe" defaultChecked type="checkbox" />
        <input name="terms" value="accepted" defaultChecked type="checkbox" />
        <input name="gender" value="male" type="radio" />
        <input name="gender" value="female" defaultChecked type="radio" />
        <button>Submit</button>
      </Form>
    );
    await form.find("button").click();
    expect(cb).toBeCalledWith({
      name: "Francisco",
      subscribe: "on", // The default when no "value" is provided
      terms: "accepted",
      gender: "female",
    });
  });
});
