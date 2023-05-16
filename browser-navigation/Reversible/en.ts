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
 * const c: Reversable<typeof a> = Reversable.tag(a, b);
 *
 * console.log(
 *   c("10"),                   // Number(10)
 *   Reversable.reverse(c)(10); // String(10)
 * );
 */
export type Iface<T extends AnyFunc> = T & {
  [symbol]: Reversed<T>;
};

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
// export type Maybe<T extends AnyFunc> = T & (Untagged | Tagged<T>);

/**
 * Reverse utility produces a new type definition where the given function's
 * arguments and return type are reversed.
 */
type Reversed<Fn extends AnyFunc> = (_: ReturnType<Fn>) => Parameters<Fn>[0];

/**
 * Given a pair of functions we define that the second implements the reverse
 * operation as the first.
 *
 * @param target function to tag
 * @param fn should implement the reverse operation as the target
 * @returns Reversible<typeof target>
 */
export function embed<T extends AnyFunc>(target: T, fn: Reversed<T>) {
  return Object.assign(target, { [symbol]: fn }) as Iface<T>;
}

/**
 * 
 */
export type Maybe<T extends AnyFunc> = T & { [symbol]: T | undefined }

/**
 * Extracts the reverse function from the given function 
 *
 * @param target function containing tag
 * @returns Reversed<typeof target> | undefined
 */
export function extract<T extends object>(target: Tagged<T>): T {
  return target[symbol];
}



/**
 * Produces a new bi-directional mapping where X => Y becomes Y => X.
 */
export function flip<T extends object>(target: Tagged<T>): T {
  const reverse = extract(target);
  const without = { ...target, [symbol]: undefined };
  return Object.assign(reverse, without);
}

// const x: Reversible.Maybe<() => string> = () => "hello";
// const y: Reversible.Iface<() => string> = tag(() => "world", (str: string) => []);
// Reversible.get(x);
// Reversible.get(y);
