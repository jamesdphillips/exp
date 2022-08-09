const voidfn = () => {};

export interface ReturnablePromise<T> extends Promise<T> {
  resolve(value: T): void;
  reject(reason?: any): void;
}

export function returnable<T>(): ReturnablePromise<T> {
  let resolve: (_: T) => void = voidfn;
  let reject: (_: any) => void = voidfn;
  const promise = new Promise<T>((resolveFn, rejectFn) => {
    resolve = resolveFn;
    reject = rejectFn;
  }) as ReturnablePromise<T>;
  promise.resolve = resolve;
  promise.reject = reject;
  return promise;
}
