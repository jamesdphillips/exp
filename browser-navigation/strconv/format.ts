import { JSONObject, JSONValue } from "./types.ts";

/**
 * Given a string converts the value to a valid JSONValue
 * 
 * @param v string
 * @returns JSONValue
 */
export function jsonValue<V extends JSONValue>(v: V): string {
  return JSON.stringify(v);
}

/**
 * Given a string converts the value to a boolean
 * 
 * @param v string
 * @returns boolean
 */
export const bool = jsonValue<boolean>;

/**
 * Given a string converts the value to an array where all the elements are
 * JSON serializable values.
 * 
 * @param v string
 * @returns Array<JSONValue>
 */
export const list = jsonValue<JSONValue[]>;

/**
 * Given a string converts the value to an object where the properties are all
 * JSON serializable values.
 * 
 * @param v string
 * @returns JSONObject
 */
export const jsonObject = jsonValue<JSONObject>;

/**
 * Given a string converts the value to a boolean
 * 
 * @param v string
 * @returns number
 */
export const number = jsonValue<number>;
