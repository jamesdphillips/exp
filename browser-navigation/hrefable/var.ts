import type { Variable } from "../Var/index.ts";
import type { Hrefable } from "./hrefable.ts";

export interface Var<T> {
  get: Variable<T>["get"];
  set: Hrefable<Variable<T>["set"]>;
}
