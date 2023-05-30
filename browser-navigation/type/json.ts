/**
 * Represents all valid JSON values
 */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

/**
 * Represents a valid serializable object
 */
export interface JSONObject {
  [key: string]: JSONValue | undefined;
}
