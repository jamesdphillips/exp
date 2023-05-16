
export type Thunk<Value> = () => Value;
export type GetFn<Value> = Thunk<Value>;

export type Sink<T> = (val: T) => void;
export type SetFn<Value> = Sink<Value>;
