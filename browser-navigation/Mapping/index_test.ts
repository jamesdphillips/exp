import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";

import Mapping from "./index.ts";

Deno.test({
  name: "signature",
  fn() {
    const x: Mapping<string, number> = (x: string) => parseInt(x, 10);
    assertEquals(x("10"), 10);
  }
});
