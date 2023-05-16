import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";

import * as Formatters from "./format.ts";

Deno.test({
  name: "bool",
  fn() {
    assertEquals(Formatters.bool(true), "true");
    assertEquals(Formatters.bool(false), "false");
  }
});

Deno.test({
  name: "number",
  fn() {
    assertEquals(Formatters.number(320), "320");
    assertEquals(Formatters.number(0.4), "0.4");
    assertEquals(Formatters.number(0x0), "0");
  }
});

Deno.test({
  name: "list",
  fn() {
    assertEquals(Formatters.list([[42]]), "[[42]]");
    assertEquals(Formatters.list(["hi"]), `["hi"]`);
    assertEquals(Formatters.list([7,42]), "[7,42]");
  }
});

Deno.test({
  name: "object",
  fn() {
    assertEquals(Formatters.jsonObject({a: 1}), `{"a":1}`);
    assertEquals(Formatters.jsonObject({b: true}), `{"b":true}`);
    assertEquals(Formatters.jsonObject({c: [1]}), `{"c":[1]}`);
  }
});
