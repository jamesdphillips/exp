import { Mapping } from "../Mapping/en";
import * as Reversible from "../Reversible/en";
import * as Format from "./format";
import * as Parse from "./parse";

type Maybe<T> = T | undefined;
type Errorable<T> = [T, Error | undefined];

const preset =
  <T>(fb: T) =>
  <R>(val: Maybe<R>) =>
    (val as R) || fb;

const ifTruthy =
  <T, R>(fn: (T) => R) =>
  (v: T | undefined) =>
    (v as T) && fn(v);

const prepare =
  <To>(to: Mapping<string, Errorable<To>>, from: Mapping<To, string>) =>
  (errHandler = () => undefined) =>
    Reversible.tag(
      ifTruthy<string, To | undefined>((y: string) => {
        const handler = handleErr(errHandler);
        return handler(to(y));
      }) as Mapping<Maybe<string>,Maybe<To>>,
      ifTruthy(from) as Mapping<Maybe<To>,Maybe<string>>
    );

export const bool = prepare(Parse.bool, Format.bool);
export const list = prepare(Parse.list, Format.list);
export const number = prepare(Parse.number, Format.number);
export const jsonObject = prepare(Parse.jsonObject, Format.jsonObject);
export const jsonValue = prepare(Parse.jsonValue, Format.jsonValue);

type ErrHandler<T> = (err: Error) => T;
const handleErr =
  (handler = () => undefined) =>
  <T>(v: Errorable<T>) =>
    v[1] ? (handler as ErrHandler<ReturnType<typeof handler>>)(v[1]) : v[0];

function flow<IK, OV, IV = any, OK = IV>(
  first: Mapping<IK, IV>,
  ...args: Mapping<OK, OV>[]
) {
  return (x: Parameters<typeof first>[0]) =>
    [first, ...args].reduce((acc: any, fn) => fn(acc), x) as ReturnType<
      (typeof args)[-1]
    >;
}

const next = flow(
  bool(),
  ifTruthy(() => false),
);
const t0 = next("true");

const fn = Reversible.unwrap(number());
const nx = preset(12);
console.debug(10 === nx(1231));
