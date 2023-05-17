import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";

import * as Variable from "./index.ts";
import * as BMaps from "../strconv/bmap.ts";
import * as Dictionary from "../Dictionary/index.ts";

Deno.test({
  name: "Variable.local",
  fn() {
    const x = Variable.local(0);

    let y = x.get();
    assertEquals(y, 0);

    y = 42;
    assertEquals(y, 42);
    assertEquals(x.get(), 0);

    x.set(y);
    assertEquals(y, 42);
    assertEquals(x.get(), 42);
  },
});

Deno.test({
  name: "Variable.copy",
  fn() {
    const x = Variable.copy(
      new URLSearchParams(),
      (x) => new URLSearchParams(x)
    );
    const y = x.get();

    const get = (name: string) => x.get().get(name);
    assertEquals(get("name"), null);

    y.set("name", "value");
    assertEquals(get("name"), null);

    x.set(y);
    assertEquals(get("name"), "value");
  },
});

Deno.test({
  name: "Variable.location",
  fn() {
    const impl = (val: string) => ({
      toString() {
        return val;
      },
      replace(url: string) {
        val = url;
      },
    });
    const base = "https://domain.local/";
    const x = Variable.location({ location: impl(base) });

    const y = x.get();
    assertEquals(y.toString(), base);

    y.pathname = "/x";
    assertEquals(y.toString(), `${base}x`);
    assertEquals(x.get().toString(), base);

    x.set(y);
    assertEquals(x.get().toString(), `${base}x`);
  },
});

Deno.test({
  name: "Variable.location",
  fn() {
    const impl = (val: string) => ({
      toString() {
        return val;
      },
      replace(url: string) {
        val = url;
      },
    });
    const base = "https://domain.local/";
    const x = Variable.location({ location: impl(base) });

    const y = x.get();
    assertEquals(y.toString(), base);

    y.pathname = "/x";
    assertEquals(y.toString(), `${base}x`);
    assertEquals(x.get().toString(), base);

    x.set(y);
    assertEquals(x.get().toString(), `${base}x`);
  },
});

Deno.test({
  name: "Variable.extract",
  fn() {
    const x = { seven: "test" };
    const y = Variable.extract(x, "seven");
    assertEquals(x.seven, "test");
    assertEquals(y.get(), "test");

    y.set("other");
    assertEquals(x.seven, "other");
    assertEquals(y.get(), "other");

    x.seven = "seven";
    assertEquals(x.seven, "seven");
    assertEquals(y.get(), "seven");
  },
});

Deno.test({
  name: "Variable.defineProperty",
  fn() {
    const x = Variable.local("123");
    const y = Variable.defineProperty(x, "seven", x);

    y.seven = "042";
    assertEquals(x.get(), "042");
    assertEquals(y.get(), "042");
    assertEquals(y.seven, "042");

    let z = y.seven;
    assertEquals(z, "042");

    z = "321";
    y.seven = "123";
    assertEquals(x.get(), "123");
    assertEquals(y.get(), "123");
    assertEquals(y.seven, "123");
    assertEquals(z, "321");
  },
});

Deno.test({
  name: "Variable.transform",
  fn() {
    type Nomable<T> = T & {
      desc?: string;
    };

    interface NomableVar<T> extends Variable.Variable<T> {
      set: Nomable<Variable.Variable<T>["set"]>;
    }

    const a = Variable.local<string | undefined>("10");
    const b: NomableVar<string | undefined> = {
      ...a,
      set: Object.assign(a.set, { desc: "123" }),
    };

    const c = Variable.transform(b, BMaps.number());
    assertEquals(a.get(), "10");
    assertEquals(b.get(), "10");
    assertEquals(c.get(), 0x10);
    assertEquals(c.set.desc, "123");

    c.set(42);
    assertEquals(c.get(), 42);

    c.set.desc = "hello!";
    assertEquals(c.set.desc, "hello!");
  },
});

Deno.test({
  name: "Variable.transpose",
  fn() {
    type Nomable<T> = T & {
      desc?: string;
    };

    interface NomableVar<T> extends Variable.Variable<T> {
      set: Nomable<Variable.Variable<T>["set"]>;
    }

    const a = Variable.local(new URLSearchParams("?x=1"));
    const b: NomableVar<URLSearchParams> = { ...a,
      set: Object.assign(a.set, { desc: "123" }),
    };

    const c = Variable.transpose(b, (x) => Dictionary.reroot(x, "x"));
    assertEquals(a.get().toString(), "x=1");
    assertEquals(b.get().toString(), "x=1");
    assertEquals(c.get(), "1");
    assertEquals(b.set.desc, "123");
    assertEquals(c.set.desc, "123");

    c.set("42");
    assertEquals(c.get(), "42");

    c.set.desc = "hello!";
    assertEquals(c.set.desc, "hello!");

    const d = Variable.transform(c, BMaps.number());
    assertEquals(d.get(), 10);
  },
});
