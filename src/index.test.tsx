import $ from "react-test";
import { describe, expect, it, vi } from "vitest";
import Form, { FormError, FormLoading } from "./index";

const delay = (t: number) => new Promise<void>((done) => setTimeout(done, t));

const throwError = () => {
  throw new Error("my mistake");
};

// A hand-rolled Standard Schema that coerces `age` to a number, like z.coerce
const ageSchema = (isAsync = false) => ({
  "~standard": {
    version: 1 as const,
    vendor: "test",
    validate: (data: any) => {
      const age = Number(data.age);
      const result =
        data.age && age >= 18
          ? { value: { ...data, age } }
          : { issues: [{ message: "Must be an adult", path: ["age"] }] };
      return isAsync ? Promise.resolve(result) : result;
    },
  },
});

describe("form-mate", () => {
  it("defaults to an empty object", async () => {
    const cb = vi.fn();
    const form = $(
      <Form onSubmit={cb}>
        <button>Submit</button>
      </Form>,
    );
    await form.find("button").click();
    expect(cb).toHaveBeenCalledWith({});
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
    expect(cb).toHaveBeenCalledWith({ hello: "world" });
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
    expect(cb).toHaveBeenCalledWith({
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
    expect(cb).toHaveBeenCalledWith({ name: ["Francisco", "Presencia"] });
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
    expect(cb).toHaveBeenCalledWith({
      name: ["Francisco", "Presencia"],
      lastname: "Presencia",
    });
  });

  it("handles FormLoading with plain children", async () => {
    let during = "";
    // click() awaits the whole submit, so read the loading state from inside it
    const onSubmit = async () => {
      await delay(100);
      during = form.find(".loading").text();
    };
    const form = $(
      <Form onSubmit={onSubmit}>
        <div className="loading">
          <FormLoading>Loading...</FormLoading>
        </div>
        <input name="hello" defaultValue="world" />
        <button>Send</button>
      </Form>,
    );
    expect(form.find(".loading").text()).toBe("");
    await form.find("button").click();
    expect(during).toBe("Loading...");
    expect(form.find(".loading").text()).toBe("");
  });

  it("handles FormLoading with a callback", async () => {
    let during = "";
    const onSubmit = async () => {
      await delay(100);
      during = form.find("button").text();
    };
    const form = $(
      <Form onSubmit={onSubmit}>
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
    expect(during).toBe("Sending...");
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
    expect(onError).toHaveBeenCalledWith(new Error("my mistake"));
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
    expect(cb).toHaveBeenCalledWith({ hello: "world" }, true);
  });

  it("flags the form as invalid by the HTML constraints", async () => {
    const cb = vi.fn();
    const form = $(
      <Form onSubmit={() => {}} onChange={cb}>
        <input name="hello" minLength={3} required />
        <input name="other" />
        <button>Send</button>
      </Form>,
    );
    await form.find("[name=other]").type("a");
    expect(cb).toHaveBeenLastCalledWith({ other: "a" }, false);
    await form.find("[name=hello]").type("abc");
    expect(cb).toHaveBeenLastCalledWith({ other: "a", hello: "abc" }, true);
  });

  it("flags the form as invalid by the schema", async () => {
    const cb = vi.fn();
    const form = $(
      <Form onSubmit={() => {}} onChange={cb} schema={ageSchema()}>
        <input name="age" />
        <button>Send</button>
      </Form>,
    );
    await form.find("input").type("1");
    await delay(0);
    expect(cb).toHaveBeenLastCalledWith({ age: "1" }, false);
    await form.find("input").type("18");
    await delay(0);
    expect(cb).toHaveBeenLastCalledWith({ age: "18" }, true);
  });
});

describe("schema", () => {
  it("passes the parsed value to onSubmit", async () => {
    const cb = vi.fn();
    const form = $(
      <Form onSubmit={cb} schema={ageSchema()}>
        <input name="name" defaultValue="Francisco" />
        <input name="age" defaultValue="25" />
        <button>Send</button>
      </Form>,
    );
    await form.find("button").click();
    expect(cb).toHaveBeenCalledWith({ name: "Francisco", age: 25 });
  });

  it("works with an async schema", async () => {
    const cb = vi.fn();
    const form = $(
      <Form onSubmit={cb} schema={ageSchema(true)}>
        <input name="age" defaultValue="25" />
        <button>Send</button>
      </Form>,
    );
    await form.find("button").click();
    expect(cb).toHaveBeenCalledWith({ age: 25 });
  });

  it("throws the issues instead of calling onSubmit", async () => {
    const cb = vi.fn();
    const onError = vi.fn();
    const form = $(
      <Form onSubmit={cb} onError={onError} schema={ageSchema()}>
        <div className="error">
          <Form.Error />
        </div>
        <input name="age" defaultValue="12" />
        <button>Send</button>
      </Form>,
    );
    await form.find("button").click();
    expect(cb).not.toBeCalled();
    expect(form.find(".error").text()).toBe("age: Must be an adult");
    const error = onError.mock.calls[0][0];
    expect(error.issues).toEqual([
      { message: "Must be an adult", path: ["age"] },
    ]);
  });

  it("joins multiple issues and reads path segments", async () => {
    const schema = {
      "~standard": {
        version: 1 as const,
        vendor: "test",
        validate: () => ({
          issues: [
            { message: "Required", path: [{ key: "user" }, "email"] },
            { message: "Form is closed" },
          ],
        }),
      },
    };
    const onError = vi.fn();
    const form = $(
      <Form onSubmit={() => {}} onError={onError} schema={schema}>
        <button>Send</button>
      </Form>,
    );
    await form.find("button").click();
    expect(onError.mock.calls[0][0].message).toBe(
      "user.email: Required\nForm is closed",
    );
  });

  it("validates multipart forms but still passes the FormData", async () => {
    const cb = vi.fn();
    const form = $(
      <Form onSubmit={cb} schema={ageSchema()} encType="multipart/form-data">
        <input name="age" defaultValue="25" />
        <button>Send</button>
      </Form>,
    );
    await form.find("button").click();
    const arg = cb.mock.calls[0][0];
    expect(arg).toBeInstanceOf(FormData);
    expect(arg.get("age")).toBe("25");
  });

  it("rejects invalid multipart forms", async () => {
    const cb = vi.fn();
    const onError = vi.fn();
    const form = $(
      <Form
        onSubmit={cb}
        onError={onError}
        schema={ageSchema()}
        encType="multipart/form-data"
      >
        <input name="age" defaultValue="12" />
        <button>Send</button>
      </Form>,
    );
    await form.find("button").click();
    expect(cb).not.toBeCalled();
    expect(onError.mock.calls[0][0].message).toBe("age: Must be an adult");
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
    expect(cb).toHaveBeenCalledWith({});

    await form.find("input").type("world");
    await form.find("button").click();
    expect(cb).toHaveBeenCalledWith({});
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
    expect(cb).toHaveBeenCalledWith({});

    await box.find("input").click();

    await box.find("button").click();
    expect(box.find("input").is(":checked")).toBe(true);
    expect(cb).toHaveBeenCalledWith({ tos: "on" });
  });
});
