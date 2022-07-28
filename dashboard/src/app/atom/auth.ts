import { atomWithReducer } from "jotai/utils";

export namespace Auth {
  type JWT = string;

  interface OAuth2 {
    type: "OAuth2";
    tokens: {
      accessToken: JWT;
      refreshToken: JWT;
      expiry: Date;
    };
  }

  interface APIKey {
    type: "APIKey";
    key: string;
  }

  export type AuthToken = OAuth2 | APIKey;

  export interface Container {
    valid: boolean;
    token: AuthToken;
  }

  export const container = () => {
    const base = atomWithReducer<Container | null, {
      type: "set";
      token: AuthToken;
    } | { type: "invalidate" }>(
      null,
      (prev, action) => {
        if (action?.type === "set") {
          return {
            valid: true,
            token: action.token,
          };
        }
        if (prev && action?.type === "invalidate") {
          return {
            ...prev,
            valid: false,
          }
        }
        return prev;
      },
    );
    base.write = (get, set, update) => {
      base.write(get, set, update);
    }
  }

}
