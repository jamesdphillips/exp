import * as Mapping from "../Mapping/index.ts";
import * as Format from "./format.ts";
import * as Parse from "./parse.ts";

/**
 * Two-way mapping of strings to boolean values.
 *
 * @example
 *
 * const a = bool();
 * const b = Mapping.TwoWay.flip(a);
 * const c = a("true"); // === true
 * const d = b(true)    // === "true"
 */
export const bool = prepare(Parse.bool, Format.bool);

/**
 * Two-way mapping of strings to lists.
 */
export const list = prepare(Parse.list, Format.list);

/**
 * Two-way mapping of strings to numbers.
 */
export const number = prepare(Parse.number, Format.number);

/**
 * Two-way mapping of strings to objects formattable as JSON.
 */
export const jsonObject = prepare(Parse.jsonObject, Format.jsonObject);

/**
 * Two-way mapping of strings to values formattable as JSON.
 */
export const jsonValue = prepare(Parse.jsonValue, Format.jsonValue);

type Maybe<T> = T | undefined;
type Errorable<T> = Readonly<[T, undefined] | [unknown, Error]>;

function ifDefined<T, R>(cb: Mapping.OneWay<T, R>) {
  return (val: Maybe<T>) => {
    if (typeof val === "undefined") {
      return val;
    }
    return cb(val);
  };
}

function unlessError<K, T, R extends Errorable<T>>(
  cb: Mapping.OneWay<K, R>,
  fn: ErrorHandler<T>
) {
  return (val: K) => {
    return unwrapErrorable(cb(val) as Errorable<T>, fn);
  };
}

function prepare<To>(
  _to: Mapping.OneWay<string, Errorable<To>>,
  _from: Mapping.OneWay<To, string>
) {
  return (handler: ErrorHandler<To | undefined> = undef) => {
    const from = ifDefined(_from);
    const to = ifDefined(unlessError(_to, handler));

    return Mapping.TwoWay.make(to, from);
  };
}

type ErrorHandler<T> = (err: Error) => T;

function undef(_err: Error) {
  return undefined;
}

function unwrapErrorable<T, U>(
  [target, err]: Errorable<T>,
  handle: ErrorHandler<U>
) {
  if (err) {
    return handle(err);
  }
  return target;
}
// <R>(handler: ((_: Error) => R) = () => undefined) =>
// <T>(v: Errorable<T>) =>
//   v[1] ? (handler as ErrHandler<ReturnType<typeof handler>>)(v[1]) : v[0];

// const preset =
//   <T>(fb: T) =>
//   <R>(val: Maybe<R>) =>
//     (val as R) || fb;

// function flow<IK, OV, IV = any, OK = IV>(
//   first: Mapping<IK, IV>,
//   ...args: Mapping<OK, OV>[]
// ) {
//   return (x: Parameters<typeof first>[0]) =>
//     [first, ...args].reduce((acc: any, fn) => fn(acc), x) as ReturnType<
//       (typeof args)[-1]
//     >;
// }

// const next = flow(
//   bool(),
//   ifTruthy(() => false),
// );
// const t0 = next("true");

// const fn = Reversible.unwrap(number());
// const nx = preset(12);
// console.debug(10 === nx(1231));
