import type { Variable } from "../Var/index.ts";
import * as variable from "../Var/index.ts";
import * as Hrefable from "../hrefable/index.ts";
import { Thunk } from "../type/index.ts";

/**
 * Given a binding returns a hrefable copy.
 * 
 * @param target a binding with the URLSearchParams
 * @param makeURL provide a copy of the current URL
 * @returns hrefable.Var<T>
 */
export function hrefify<T extends URLSearchParams>(
  target: Variable<T>,
  makeURL: Thunk<URL>
) {
  const orig = {
    get: target.get,
    set: target.set,
  };
  let mock: Variable<URLSearchParams> | null = null;
  const setter: (typeof target)["set"] = (val) => {
    mock ? mock.set(val) : orig.set(val);
  };
  target.set = Hrefable.embed(setter, (receiver, ...args) => {
    // 1. get current URL
    const url = makeURL();
    url.search = orig.get().toString();

    // 2. swap the target impl to mock
    mock = variable.local(url.searchParams);

    // 3. run operation on mock
    receiver(...args);

    // 4. apply results to current
    url.search = mock!.get().toString();
    mock = null;

    return url;
    // TODO: should figure out the issue with the type definition here
  }) as any;

  return target as typeof target & Hrefable.Var<T>;
}
