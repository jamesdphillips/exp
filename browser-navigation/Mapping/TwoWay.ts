import OneWay from "./OneWay.ts";

type Func<P extends any[], R> = (...args: P) => R;
type AnyFunc = Func<any, any>;
type Tagged<T> = { [symbol]: T };

export const symbol = Symbol();

/**
 * A Reversable is a function with a special property containing an
 * implementation of the function with the arguments and return type reversed.
 *
 * @example
 *
 * import * as Reversable from "./Reversible";
 *
 * interface Mapping<X, Y> {
 *   (x: X): Y;
 * }
 * const a: Mapping<string, number> = (x: string) => parseInt(x, 10);
 * const b: Mapping<number, string> = (x: number) => x.toString();
 * const c: Reversable.Maybe<typeof a> = Reversable.tag(a, b);
 *
 * console.log(
 *   c("10"),                   // Number(10)
 *   Reversable.reverse(c)(10); // String(10)
 * );
 */
export interface TwoWay<From, To> extends OneWay<From, To> {
  [symbol]: OneWay<To, From>;
}

// const x: OneWay<number, string> = null;
// const y: Flipped<typeof x> = null;
// const z = x(1);

// the whole point is that we've got to be able to communicate with the context
// of our object
// degree.

// should I use a weak map?

/**
 * Given a pair of functions we define that the second implements the reverse
 * operation as the first.
 *
 * @param target function to tag
 * @param fn should implement the reverse operation as the target
 * @returns Reversible<typeof target>
 */
export function make<To, From>(to: OneWay<To, From>, fro: OneWay<From, To>) {
  return Object.assign(to, { [symbol]: fro }) as TwoWayConstructor<To, From>;
}

/**
 * Extracts the reverse function from the given function
 *
 * @param target function containing tag
 * @returns Reversed<typeof target> | undefined
 */
export function extract<To, From>(target: TwoWay<To, From>) {
  return target[symbol];
}

/**
 * Produces a new bi-directional mapping where X => Y becomes Y => X.
 */
export function flip<To, From>(target: TwoWay<To, From>): TwoWay<From, To> {
  const reverse = extract(target);
  return Object.assign(reverse, { ...target, [symbol]: target });
}

/**
 * Applies the given arguments to the target's reverse property.
 *
 * @param target function containing tag
 * @returns Reversed<typeof target> | undefined
 */
export function apply<R extends AnyFunc>(
  target: Tagged<R>,
  ...args: Parameters<R>
): ReturnType<R> {
  const fn = target[symbol];
  return fn(...(args as any));
}

/**
 * Bi-directional mapping of two parameters.
 *
 * @example
 *
 * const to = (x: string) => parseInt(x, 10);
 * const fro = (x: string) => parseInt(x, 10);
 * const mapping = new TwoWay(to, fro);
 *
 * console.log(mapping(10));
 * console.log(mapping(10));
 *
 */
class TwoWayConstructor<From, To> {
  static readonly apply = apply;
  static readonly extract = extract;
  static readonly flip = flip;
  static readonly make = make;
}
interface TwoWayConstructor<From, To> extends OneWay<From, To> {
  [symbol]: OneWay<To, From>;
  __proto__?: TwoWayConstructor<From, To>;
}
export default TwoWayConstructor;
