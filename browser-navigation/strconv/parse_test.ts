import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";

import * as Parsers from "./parse.ts";

type Errorable<T> = Readonly<[T, undefined] | [unknown, Error]>;

function errorable(v: any, err?: Error): Errorable<any> {
  if (err) {
    return [null, err] as const;
  }
  if (typeof v !== "undefined") {
    return [v, undefined] as const;
  }
  throw new TypeError();
}

Deno.test({
  name: "bool",
  fn() {
    assertEquals(Parsers.bool("false"), errorable(false));
    assertEquals(Parsers.bool("true"), errorable(true));
    assertEquals(Parsers.bool("123"), errorable(null, new TypeError()));
    assertEquals(Parsers.bool("xxxxx"), errorable(null, new SyntaxError()));
  },
});

Deno.test({
  name: "number",
  fn() {
    assertEquals(Parsers.number("320"), errorable(320));
    assertEquals(Parsers.number("0.4"), errorable(0.4));
    assertEquals(Parsers.number("true"), errorable(null, new TypeError()));
    assertEquals(Parsers.number("xxxx"), errorable(null, new SyntaxError()));
  },
});

Deno.test({
  name: "list",
  fn() {
    assertEquals(Parsers.list("[[42]]"), errorable([[42]]));
    assertEquals(Parsers.list(`["hi"]`), errorable(["hi"]));
    assertEquals(Parsers.list(`[7,42]`), errorable([7, 42]));
    assertEquals(Parsers.list("true"), errorable(null, new TypeError()));
    assertEquals(Parsers.list("xxxx"), errorable(null, new SyntaxError()));
  },
});

Deno.test({
  name: "object",
  fn() {
    assertEquals(Parsers.jsonObject(`{ "a": 1 }`), errorable({a: 1}));
    assertEquals(Parsers.jsonObject(`{ "b": true }`), errorable({b: true}));
    assertEquals(Parsers.jsonObject(`{ "c": [1] }`), errorable({c: [1]}));
    assertEquals(Parsers.jsonObject(`[42]`), errorable(null, new TypeError()));
    assertEquals(Parsers.jsonObject("true"), errorable(null, new TypeError()));
    assertEquals(Parsers.jsonObject("xxxx"), errorable(null, new SyntaxError()));
  },
});
