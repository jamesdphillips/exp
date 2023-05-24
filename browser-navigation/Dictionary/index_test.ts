import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";

import * as Dict from "./index.ts";

Deno.test({
  name: "Dictionary.reroot",
  fn() {
    const x = new URLSearchParams("?x=y");
    const y = Dict.reroot(x, "x");
    assertEquals(x.get("x"), "y");
    assertEquals(y.get(), "y");
  },
});

Deno.test({
  name: "Dictionary.rerootList",
  fn() {
    const x = new URLSearchParams("?x=y");
    const y = Dict.rerootList(x, "x");
    assertEquals(x.get("x"), "y");
    assertEquals(y.get(), ["y"]);

    y.set(["y", "z"]);
    assertEquals(y.get(), ["y", "z"]);
  },
});
