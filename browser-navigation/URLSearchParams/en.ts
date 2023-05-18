import { Variable, local } from "../Var/index.ts";
import * as Hrefable from "../Hrefable/index.ts";
import { Thunk } from "../core/index.ts";
import * as Object from "../Object/index.ts";

type OmitFirstArg<T> = T extends (arg1: any, ...args: infer R) => infer U
  ? (...args: R) => U
  : never;
type CurryInterface<T> = {
  [P in keyof T]: OmitFirstArg<T[P]>;
};

const curriableProperties = [
  "append",
  "delete",
  "get",
  "getAll",
  "has",
  "set",
] as const;
type URLSearchParamsCurriableProperties = (typeof curriableProperties)[number];
export type URLSearchParam = CurryInterface<
  Pick<URLSearchParams, URLSearchParamsCurriableProperties>
>;

export function toURLSearchParam(
  params: Pick<URLSearchParams, URLSearchParamsCurriableProperties>,
  property: PropertyKey
): URLSearchParam {
  return Object.curry(params, property);
}

export interface URLSearchProperties {
  [_: string]: URLSearchParam;
}

export function toURLSearchProperties(
  search: URLSearchParams
): URLSearchProperties {
  return new Proxy(search as object, {
    get(_, prop) {
      return toURLSearchParam(search, prop);
    },
  }) as URLSearchProperties;
}

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
  target.set = Hrefable.tag(setter, (receiver, ...args) => {
    // 1. get current URL
    const url = makeURL();
    url.search = orig.get().toString();

    // 2. swap the target impl to mock
    mock = local(url.searchParams);

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
