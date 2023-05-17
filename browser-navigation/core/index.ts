export type Thunk<Value> = () => Value;
export type GetFn<Value> = Thunk<Value>;

export type Sink<T> = (val: T) => void;
export type SetFn<Value> = Sink<Value>;

export type Func<P extends any[], R> = (...args: P) => R;
export type AnyFunc = Func<any, any>;

export type Maybe<Value> = Value | undefined;
export type Binding<T> = { value: T };
