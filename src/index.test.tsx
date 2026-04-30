import $ from "react-test";
import { describe, expect, it, vi } from "vitest";
import Form, { FormError, FormLoading } from "./index";

const delay = (t: number) => new Promise<void>((done) => setTimeout(done, t));

const throwError = () => {
  throw new Error("my mistake");
};

describe("form-mate", () => {
  it("defaults to an empty object", async () => {
    const cb = vi.fn();
    const form = $(
      <Form onSubmit={cb}>
        <button>Submit</button>
      </Form>,
    );
    await form.find("button").click();
    await delay(100);
    expect(cb).toBeCalledWith({});
  });

  it("can get the data correctly", async () => {
    const cb = vi.fn();
    const form = $(
      <Form onSubmit={cb}>
        <input name="hello" defaultValue="world" />
        <button>Submit</button>
      </Form>,
    );
    await form.find("button").click();
    expect(cb).toBeCalled();
    expect(cb).toBeCalledWith({ hello: "world" });
  });

  it("handles checkboxes and radiobuttons well", async () => {
    const cb = vi.fn();
    const form = $(
      <Form onSubmit={cb}>
        <input name="name" defaultValue="Francisco" />
        <input name="age" defaultValue={25} type="number" />
        <input name="subscribe" defaultChecked type="checkbox" />
        <input name="terms" value="accepted" defaultChecked type="checkbox" />
        <input name="gender" value="male" type="radio" />
        <input name="gender" value="female" defaultChecked type="radio" />
        <button>Submit</button>
      </Form>,
    );
    await form.find("button").click();
    expect(cb).toBeCalledWith({
      name: "Francisco",
      age: "25", // Casted to string
      subscribe: "on", // The default when no "value" is provided
      terms: "accepted",
      gender: "female",
    });
  });

  it("can serialize multiple similar values", async () => {
    const cb = vi.fn();
    const form = $(
      <Form onSubmit={cb}>
        <input name="name" defaultValue="Francisco" />
        <input name="name" defaultValue="Presencia" />
        <button>Submit</button>
      </Form>,
    );
    await form.find("button").click();
    expect(cb).toBeCalledWith({ name: ["Francisco", "Presencia"] });
  });

  it("removes trailing `[]` from names", async () => {
    const cb = vi.fn();
    const form = $(
      <Form onSubmit={cb}>
        <input name="name[]" defaultValue="Francisco" />
        <input name="name[]" defaultValue="Presencia" />
        <input name="lastname[]" defaultValue="Presencia" />
        <button>Submit</button>
      </Form>,
    );
    await form.find("button").click();
    expect(cb).toBeCalledWith({
      name: ["Francisco", "Presencia"],
      lastname: "Presencia",
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
      </Form>,
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
            {(loading: boolean) => (loading ? "Sending..." : "Send")}
          </FormLoading>
        </button>
      </Form>,
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
      </Form>,
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
      </Form>,
    );
    expect(form.find(".error").text()).toBe("");
    await form.find("button").click();
    expect(form.find(".error").text()).toBe("There was an error...");
  });

  it("handles FormError with a callback", async () => {
    const form = $(
      <Form onSubmit={throwError}>
        <div className="error">
          <FormError>{(message: string) => message}</FormError>
        </div>
        <input name="hello" defaultValue="world" />
        <button>Send</button>
      </Form>,
    );
    expect(form.find(".error").text()).toBe("");
    await form.find("button").click();
    expect(form.find(".error").text()).toBe("my mistake");
  });
});

describe("Form.Error and Form.Loading aliases", () => {
  it("Form.Error is the same as FormError", () => {
    expect(Form.Error).toBe(FormError);
  });

  it("Form.Loading is the same as FormLoading", () => {
    expect(Form.Loading).toBe(FormLoading);
  });
});

describe("autoReset", () => {
  it("does not reset the form after submit by default", async () => {
    const cb = vi.fn();
    const form = $(
      <Form onSubmit={cb}>
        <input name="hello" defaultValue="world" />
        <button>Send</button>
      </Form>,
    );
    await form.find("button").click();
    await form.find("button").click();
    expect(cb).toHaveBeenLastCalledWith({ hello: "world" });
  });

  it("resets the form after a successful submit", async () => {
    const cb = vi.fn();
    const form = $(
      <Form onSubmit={cb} autoReset>
        <input name="hello" />
        <button>Send</button>
      </Form>,
    );
    (form.find("input").get(0) as HTMLInputElement).value = "world";
    await form.find("button").click();
    await form.find("button").click();
    expect(cb).toHaveBeenLastCalledWith({});
  });

  it("does not reset the form when onSubmit throws", async () => {
    const cb = vi.fn();
    let shouldThrow = true;
    const form = $(
      <Form
        onSubmit={(data) => {
          if (shouldThrow) throw new Error("oops");
          cb(data);
        }}
        autoReset
      >
        <input name="hello" defaultValue="world" />
        <button>Send</button>
      </Form>,
    );
    await form.find("button").click();
    shouldThrow = false;
    await form.find("button").click();
    expect(cb).toHaveBeenCalledWith({ hello: "world" });
  });
});

describe("onError", () => {
  it("calls onError with the thrown error", async () => {
    const onError = vi.fn();
    const form = $(
      <Form onSubmit={throwError} onError={onError}>
        <button>Send</button>
      </Form>,
    );
    await form.find("button").click();
    expect(onError).toBeCalledWith(new Error("my mistake"));
  });

  it("clears the error on a successful re-submit", async () => {
    let shouldThrow = true;
    const form = $(
      <Form
        onSubmit={() => {
          if (shouldThrow) throw new Error("oops");
        }}
      >
        <div className="error">
          <FormError />
        </div>
        <button>Send</button>
      </Form>,
    );
    await form.find("button").click();
    expect(form.find(".error").text()).toBe("oops");
    shouldThrow = false;
    await form.find("button").click();
    expect(form.find(".error").text()).toBe("");
  });
});

describe("onChange", () => {
  it("calls onChange with serialized data on field change", async () => {
    const cb = vi.fn();
    const form = $(
      <Form onSubmit={() => {}} onChange={cb}>
        <input name="hello" defaultValue="" />
        <button>Send</button>
      </Form>,
    );
    await form.find("input").type("world");
    expect(cb).toBeCalledWith({ hello: "world" });
  });
});

describe("encType", () => {
  it("passes a FormData instance to onSubmit when encType is multipart/form-data", async () => {
    const cb = vi.fn();
    const form = $(
      <Form onSubmit={cb} encType="multipart/form-data">
        <input name="hello" defaultValue="world" />
        <button>Send</button>
      </Form>,
    );
    await form.find("button").click();
    expect(cb).toBeCalled();
    const arg = cb.mock.calls[0][0];
    expect(arg).toBeInstanceOf(FormData);
    expect(arg.get("hello")).toBe("world");
  });
});

describe("Form interaction", () => {
  it("can handle a form being filled", async () => {
    const cb = vi.fn();
    const form = $(
      <Form onSubmit={cb}>
        <input name="hello" />
        <button>Send</button>
      </Form>,
    );
    await form.find("button").click();
    expect(cb).toBeCalledWith({});

    await form.find("input").type("world");
    await form.find("button").click();
    expect(cb).toBeCalledWith({});
  });

  it("works with a checkbox", async () => {
    const cb = vi.fn();
    const box = $(
      <Form onSubmit={cb}>
        <input name="tos" type="checkbox" />
        <button>Send</button>
      </Form>,
    );

    await box.find("button").click();
    expect(box.find("input").is(":checked")).toBe(false);
    expect(cb).toBeCalledWith({});

    await box.find("input").click();

    await box.find("button").click();
    expect(box.find("input").is(":checked")).toBe(true);
    expect(cb).toBeCalledWith({ tos: "on" });
  });
});
