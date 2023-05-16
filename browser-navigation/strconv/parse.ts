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

type Errorable<T> = Readonly<[T, undefined] | [unknown, Error]>;
type Checker<T> = (_: T) => boolean;

/**
 * Given string returns a number; returns error if the input is unparseable or
 * if the result is not a number.
 *
 * @param string
 * @returns Errorable<bigint>
 */
export function number(v: string) {
  return asJSON(v, isNumber);
}

function isNumber(v: number) {
  return typeof v === "number";
}

/**
 * Given string returns a BigInt; returns error if the input is unparseable or
 * if the result is not a number or bigint.
 *
 * @param string
 * @returns Errorable<bigint>
 */
export function bigint(v: string): Errorable<bigint> {
  const [value, err] = asJSON(v, isBigint);
  if (err) {
    return [value, err];
  }
  return [typeof value === "number" ? BigInt(value) : value, err];
}

function isBigint(v: bigint | number) {
  return ["bigint", "number"].includes(typeof v);
}

/**
 * Given string returns a boolean; returns error if the input is unparseable or
 * if the result is not an object.
 *
 * @param string
 * @returns Errorable<boolean>
 */
export function bool(v: string) {
  return asJSON(v, isBool);
}

function isBool(v: boolean) {
  return typeof v === "boolean";
}

/**
 * Given string returns a list of JSONValue(s); returns error if input is
 * unparseable or if the result is not an object.
 *
 * @param string
 * @returns Errorable<JSONValue[]>
 */
export function list(v: string) {
  return asJSON(v, isList);
}

function isList(v: JSONValue[]) {
  return Array.isArray(v);
}

/**
 * Given string returns a JSONObject; returns error if input is unparseable
 * or if the result is not an object.
 *
 * @param string
 * @returns Errorable<JSONObject>
 */
export function jsonObject(v: string) {
  return asJSON(v, isJSONObject);
}

function isJSONObject(v: JSONObject) {
  return typeof v === "object" && !Array.isArray(v);
}

/**
 * Given string returns a JSONValue; returns error if input is unparseable.
 *
 * @param string
 * @returns Errorable<JSONObject>
 */
export function jsonValue(v: string) {
  return _jsonValue(v) as Errorable<JSONValue>;
}

function _jsonValue(v: string): Errorable<JSONValue> {
  try {
    return [JSON.parse(v), undefined];
  } catch (err) {
    return [null, err];
  }
}

function asJSON<T>(v: string, fn: Checker<T>): Errorable<T> {
  const next = _jsonValue(v);
  if (next[1]) {
    return next as Errorable<T>;
  }
  return validate(fn, next[0]);
}

function validate<T>(checker: Checker<T>, value: any): Errorable<T> {
  if (checker(value)) {
    return [value, undefined];
  }
  return [null, new TypeError()];
}
