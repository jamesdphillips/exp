import React from "react";

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Env {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface Values {}

  export type ProviderProps<T extends Values> = Omit<Partial<T>, "children"> & {
    children: React.ReactNode;
  };

  export interface ConsumerProps<T extends Values> {
    children: (_: T) => React.ReactElement<any, any>;
  }

  export const Context = React.createContext<Values>({});

  export function Provider<T extends Values>({
    children,
    ...props
  }: ProviderProps<T>) {
    return <Context.Provider value={props}>{children}</Context.Provider>;
  }

  export function Consumer<T extends Values>(props: ConsumerProps<T>) {
    const env = React.useContext(Context);
    return props.children(env as T);
  }
}

export default Env;
