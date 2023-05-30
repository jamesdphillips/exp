/**
 * An optional value may be undefined.
 */
export type Optional<Value> = Value | undefined;

/**
 * A nullable value may be null.
 */
export type Nullable<Value> = Value | null; 

/**
 * The value may be null or undefined.
 */
export type Maybe<Value> = Nullable<Optional<Value>>;