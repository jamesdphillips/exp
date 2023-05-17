import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";

import * as BMaps from "./bmap.ts";
import * as Reversible from "../Reversible/index.ts";

Deno.test({
  name: "bool",
  fn() {
    const x = BMaps.bool(() => undefined);
    assertEquals(x("true"), true);
    assertEquals(x("false"), false);
    assertEquals(x("jh2kl43jh23k4jh"), undefined);
    assertEquals(x(undefined), undefined);

    const y = Reversible.flip(x);
    assertEquals(y(false), "false");
  }
});

Deno.test({
  name: "number",
  fn() {
    const x = BMaps.number();
    assertEquals(x("64"), 64);
    assertEquals(x("test"), undefined);
    assertEquals(x(undefined), undefined);

    const y = Reversible.extract(x);
    assertEquals(y(42), "42");
    assertEquals(y(undefined), undefined);

    const z = BMaps.number((err) => 0);
    assertEquals(z("64"), 64);
    assertEquals(z("abc"), 0);
    assertEquals(z(undefined), undefined);
  }
});

Deno.test({
  name: "list",
  fn() {
    const x = BMaps.list();
    assertEquals(x("[1]"), [1]);
    assertEquals(x("[[1]]"), [[1]]);
    assertEquals(x("sdfasdfas"), undefined);
    assertEquals(x(undefined), undefined);

    const y = Reversible.extract(x);
    assertEquals(y([1,[2,3]]), "[1,[2,3]]");
    assertEquals(y(undefined), undefined);

    const z = BMaps.list(() => []);
    assertEquals(z("[1]"), [1]);
    assertEquals(z("sdfasdfas"), []);
  }
});

Deno.test({
  name: "object",
  fn() {
    const x = BMaps.jsonObject();
    assertEquals(x(`{"a": 1}`), {a: 1});
    assertEquals(x("sdfasdfas"), undefined);
    assertEquals(x(undefined), undefined);

    const y = Reversible.extract(x);
    assertEquals(y({a: 1}), `{"a":1}`);
    assertEquals(y(undefined), undefined);

    const z = BMaps.jsonObject(() => ({}));
    assertEquals(z(`{"a":1}`), {a: 1});
    assertEquals(z("sdfasdfas"), {});
  }
});
