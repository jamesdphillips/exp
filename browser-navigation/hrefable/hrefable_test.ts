import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";

import type { Hrefable } from "./hrefable.ts";
import * as hrefable from "./hrefable.ts";
import Mapping from "../Mapping/index.ts";

Deno.test({
  name: "hrefable.embed",
  fn() {
    const x: Mapping<number, string> = (x: number) => x.toLocaleString();
    assertEquals(x(10), "10");

    const y = hrefable.embed(x, (y, z) => new URL("http://" + y(z)));
    assertEquals(y(10), "10");
    assertEquals(hrefable.apply(y, 10), new URL("http://10"));
  },
});

Deno.test({
  name: "hrefable.extract",
  fn() {
    const x: Mapping<number, string> = (x: number) => x.toLocaleString();
    assertEquals(x(10), "10");

    const y = hrefable.embed(x, (y, z) => new URL("http://" + y(z)));
    assertEquals(y(10), "10");

    const z = hrefable.extract(y);
    assertEquals(z(10), new URL("http://10"));
  },
});

Deno.test({
  name: "hrefable.apply",
  fn() {
    const x: Mapping<number, string> = (x: number) => x.toLocaleString();
    assertEquals(x(10), "10");

    const y = hrefable.embed(x, (y, z) => new URL("http://" + y(z)));
    assertEquals(y(10), "10");
    assertEquals(hrefable.apply(y, 10), new URL("http://10"));
  },
});

Deno.test({
  name: "hrefable.Hrefable",
  fn() {
    const x = (y: Hrefable<(_: string) => void>) => {
      return hrefable.apply(y, "test");
    }
    const y = (x: string) => console.debug(x);
    assertEquals(y("10"), undefined);

    const z = hrefable.embed(y, (_, x) => new URL("http://" + x));
    assertEquals(x(z), new URL("http://test"));
  },
});
