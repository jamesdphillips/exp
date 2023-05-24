import { AnyFunc, Maybe } from "../core/index.ts";

const symbol = Symbol();

export function embed<Fn extends AnyFunc>(fn: Fn, impl: Hrefer<Fn>) {
  return Object.assign(fn, { [symbol]: impl }) as Hrefable<Fn>;
}

export function extract<Fn extends AnyFunc>(fn: Hrefified<Fn>) {
  return fn[symbol].bind(null, fn as any);
}

export function apply<Fn extends AnyFunc>(
  fn: Hrefified<Fn>,
  ...args: Parameters<Fn>
) {
  return extract(fn)(...args);
}

/**
 * A function that is hrefable can answer the prompt: if avaialble, give me the
 * result of executing the given function as a URL.
 * 
 * @example
 * 
 * function(fn: Hrefable<Mapping<string, void>>) {
 *   const href = hrefable.apply(fn, "hello");
 *   return <a href={href}>{ref}</a>;
 * }
 *
 * @example
 * 
 * const setter = (model: string) => window.location.path = `/${model}`;
 * const hrefableSetter = hrefable.embed(
 *   setter,
 *   (receiver, v) => {
 *     const url = new URL(window.location);
 *     url.path = `/${v}`;
 *     return new URL(url);
 *   },
 * )
 * hrefable.apply(hrefableSetter, "Homer S"); // URL("/Homer S")
 * 
 */
export type Hrefable<Fn extends AnyFunc> = Fn & Hrefified<Fn>;

/**
 * An implementation of hrefable
 */
type Hrefer<Fn extends AnyFunc> = (
  receive: Fn,
  ...args: Parameters<Fn>
) => Maybe<URL>;

/**
 * One is hrefified when one contains the hrefable property.
 */
interface Hrefified<Fn extends AnyFunc> {
  [symbol]: Hrefer<Fn>;
}
