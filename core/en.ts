
export type Thunk<Value> = () => Value;
export type GetFn<Value> = Thunk<Value>;

export type VoidFunction<T = any> = (...T) => void;
export type SetFn<Value> = VoidFunction<Value>;
