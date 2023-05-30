/**
 * a function that returns a value
 */
export type Thunk<Value> = () => Value;

/**
 * describes a getter function
 */
export type GetFn<Value> = Thunk<Value>;

/**
 * function that takes a value and is implicitly expected to perform some
 * side-effect
 */
export type Sink<T> = (val: T) => void;

/**
 * describes a setter function
 */
export type SetFn<Value> = Sink<Value>;

/**
 * vanity type annotation for functions
 */
export type Func<P extends any[], R> = (...args: P) => R;

/**
 * describes any function
 */
export type AnyFunc = Func<any, any>;