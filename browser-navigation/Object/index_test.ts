import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";

import * as Object from "./index.ts";

Deno.test({
  name: "Object.curry",
  fn() {
    const x = {
      get(key: string) {
        if (key === "life") {
          return 42;
        }
        return 7;
      },
    };
    const y = Object.curry(x, "life");
    assertEquals(x.get("test"), 7);
    assertEquals(y.get(), 42);

    const z = Object.curry(x, "idk");
    assertEquals(z.get(), 7);
  },
});

Deno.test({
  name: "Object.pick",
  fn() {
    const x = {
      x: 1,
      y: 2,
      z: 3,
    } as const;
    assertEquals(x.x, 1);
    assertEquals(x.y, 2);

    const y = Object.pick(x, "x");
    assertEquals(y.x, 1);
    assertEquals((y as Record<PropertyKey, number>).y, undefined);
  },
});
