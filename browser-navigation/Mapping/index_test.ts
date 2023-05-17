import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";

import Class, * as Mapping from "./index.ts";

Deno.test({
  name: "signature",
  fn() {
    const x: Class<string, number> = (x: string) => parseInt(x, 10);
    assertEquals(x("10"), 10);
  },
});

Deno.test({
  name: "OneWay",
  fn() {
    const x: Mapping.OneWay<string, number> = (x: string) => parseInt(x, 10);
    assertEquals(x("10"), 10);
  },
});

Deno.test({
  name: "TwoWay",
  fn() {
    const x = (x: string) => parseInt(x, 10);
    const y = (x: number) => x.toString();
    const z = Mapping.TwoWay.make(x, y);
    assertEquals(z("10"), 10);

    const xx = Mapping.TwoWay.flip(z);
    assertEquals(xx(10), "10");
  },
});
