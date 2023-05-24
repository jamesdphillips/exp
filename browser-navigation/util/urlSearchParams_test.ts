import { assertEquals } from "https://deno.land/std@0.187.0/testing/asserts.ts";

import * as variable from "../Var/index.ts";
import * as hrefable from "../hrefable/index.ts";
import * as Utils from "./urlSearchParams.ts";

Deno.test({
  name: "hrefify",
  fn() {
    const x = new URL("http://x/y?z=123");
    const y = variable.local(new URLSearchParams(x.searchParams));
    assertEquals(y.get().get("z"), "123");

    const z = Utils.hrefify(y, () => new URL(x));
    const copy = z.get();
    copy.set("z", "321");
    assertEquals(hrefable.apply(z.set, copy), new URL("http://x/y?z=321"));
  },
});
