export function number(v: string) {
  const validator = validate<number>((v) => typeof v === "number");
  return validator(_jsonValue(v));
}

export function bignum(v: string) {
  const validator = validate<bigint | number>((v) =>
    ["bigint", "number"].includes(typeof v)
  );
  const value = validator(_jsonValue(v));
  return typeof value === "number" ? BigInt(value) : value;
}

export function bool(v: string) {
  const validator = validate<boolean>((v) => typeof v === "boolean");
  return validator(_jsonValue(v));
}

export function list(v: string) {
  const validator = validate<Array<JSONValue>>((v) => Array.isArray(v));
  return validator(_jsonValue(v));
}

export function jsonObject(v: string) {
  const validator = validate<JSONObject>(
    (v) => typeof v === "object" && !Array.isArray(v)
  );
  return validator(_jsonValue(v));
}

export function jsonValue(v: string) {
  return _jsonValue(v) as Errorable<JSONValue>;
}

function _jsonValue(v: string) {
  return JSON.parse(v) as JSONValue;
}

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

interface JSONObject {
  [key: string]: JSONValue;
}
type Errorable<T> = [T, Error | undefined];
type Checker<T> = (_: T | unknown) => boolean;
export const validate =
  <T>(checker: Checker<T>) =>
  (v: T | unknown): Errorable<T> =>
    [v as T, checker(v) ? new TypeError() : undefined];
