import "babel-polyfill";
import React, { useEffect } from "react";
import $ from "react-test";
import Form, { FormError, FormLoading } from "./index.js";

const delay = (t) => new Promise((done) => setTimeout(done, t));

const throwError = () => {
  throw new Error("my mistake");
};

describe("form-mate", () => {
  it("defaults to an empty object", async () => {
    const cb = jest.fn();
    const form = $(
      <Form onSubmit={cb}>
        <button>Submit</button>
      </Form>
    );
    await form.find("button").click();
    await delay(100);
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

  it("handles FormLoading with plain children", async () => {
    const form = $(
      <Form onSubmit={() => delay(1000)}>
        <div className="loading">
          <FormLoading>Loading...</FormLoading>
        </div>
        <input name="hello" defaultValue="world" />
        <button>Send</button>
      </Form>
    );
    expect(form.find(".loading").text()).toBe("");
    await form.find("button").click();
    expect(form.find(".loading").text()).toBe("Loading...");
    await form.delay(1000);
    expect(form.find(".loading").text()).toBe("");
  });

  it("handles FormLoading with a callback", async () => {
    const form = $(
      <Form onSubmit={() => delay(1000)}>
        <input name="hello" defaultValue="world" />
        <button>
          <FormLoading>
            {(loading) => (loading ? "Sending..." : "Send")}
          </FormLoading>
        </button>
      </Form>
    );
    expect(form.find("button").text()).toBe("Send");
    await form.find("button").click();
    expect(form.find("button").text()).toBe("Sending...");
    await form.delay(1000);
    expect(form.find("button").text()).toBe("Send");
  });

  it("handles FormError with no children", async () => {
    const form = $(
      <Form onSubmit={throwError}>
        <div className="error">
          <FormError />
        </div>
        <input name="hello" defaultValue="world" />
        <button>Send</button>
      </Form>
    );
    expect(form.find(".error").text()).toBe("");
    await form.find("button").click();
    expect(form.find(".error").text()).toBe("my mistake");
  });

  it("handles FormError with plain children", async () => {
    const form = $(
      <Form onSubmit={throwError}>
        <div className="error">
          <FormError>There was an error...</FormError>
        </div>
        <input name="hello" defaultValue="world" />
        <button>Send</button>
      </Form>
    );
    expect(form.find(".error").text()).toBe("");
    await form.find("button").click();
    expect(form.find(".error").text()).toBe("There was an error...");
  });

  it("handles FormError with a callback", async () => {
    const form = $(
      <Form onSubmit={throwError}>
        <div className="error">
          <FormError>{(message) => message}</FormError>
        </div>
        <input name="hello" defaultValue="world" />
        <button>Send</button>
      </Form>
    );
    expect(form.find(".error").text()).toBe("");
    await form.find("button").click();
    expect(form.find(".error").text()).toBe("my mistake");
  });
});
