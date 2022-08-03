import handle from "/app/exceptionHandler";

import React from "react";
import ReactDOM from "react-dom";
import gql from "graphql-tag";

import { BrowserRouter } from "react-router-dom";

// eslint-disable-next-line import/extensions
import "typeface-roboto";

import polyfill from "/app/polyfill";

import ErrorBoundary from "/app/component/util/ErrorBoundary";
import NavigationProvider from "/app/component/util/NavigationProvider";
import AppProvider from "./AppProvider";

import Glyph from "/app/component/icon/Glyph";

import AppRoot from "/app/component/root/AppRoot";

import PreferencesKeybinding from "/app/component/keybind/PreferencesKeybinding";
import ContextSwitcherKeybinding from "/app/component/keybind/ContextSwitcherKeybinding";
import SystemStatusKeybinding from "/app/component/keybind/SystemStatusKeybinding";

import {
  Provider as URQLProvider,
  createClient,
  dedupExchange,
  cacheExchange,
  fetchExchange,
} from "urql";

import { retryExchange } from "@urql/exchange-retry";

// TODO: Remove me.
import createApolloClient from "/app/apollo/client";
import invalidateTokens from "/app/mutation/invalidateTokens";
import { refreshTokens } from "./util/authAPI";
import tap from "./util/tap";

// Lazy load
const AppView = React.lazy(() => import("/app/component/view/AppView"));
const ContextSwitcherDialog = React.lazy(
  () => import("/app/component/dialog/ContextSwitcherDialog"),
);
const SystemStatusDialog = React.lazy(
  () => import("/app/component/partial/SystemStatusDialog"),
);
const PreferencesDialog = React.lazy(
  () => import("/app/component/dialog/PreferencesDialog"),
);
const ChangePasswordDialog = React.lazy(
  () => import("/app/component/dialog/ChangePasswordDialog"),
);
const EntityLimitAlert = React.lazy(
  () => import("/app/component/partial/EntityLimitAlert"),
);
const SystemStatusAlert = React.lazy(
  () => import("/app/component/partial/SystemStatusAlert"),
);
const LicenseAlert = React.lazy(
  () => import("/app/component/partial/LicenseExpiringAlert"),
);
const ServiceWorker = React.lazy(
  () => import("/app/component/util/ServiceWorker"),
);

const openSwitcher = gql`
  mutation OpenSwitcher {
    toggleModal(modal: CONTEXT_SWITCHER_MODAL) @client
  }
`;

interface BearerToken {
  type: "Bearer";
  token: string;
}

function createFetch(getAuthToken: () => Promise<BearerToken>): typeof fetch {
  return (input, initArg) =>
    getAuthToken().then((token) => {
      const init: RequestInit = initArg || {};
      if (token) {
        init.headers = {
          authorization: `${token.type} ${token.token}`,
          ...init.headers,
        };
      }
      return window.fetch(input, init);
    });
}

const authQueryKey = "$SYNC.SyncAuthQuery";

interface SyncAuthQuery {
  auth?: {
    invalid?: false;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: string;
  };
}

interface Var<T> {
  get(callback: (_: T) => void): void;
  set(nextValue: T, callback?: () => Error): void;
  [Symbol.iterator]: AsyncIterableIterator<T>;
}

interface BearerToken {
  kind: "Bearer";
  token: string;
}

interface AuthState {
  tokensValid?: boolean;
  tokens?: {
    kind: "OAuth";
    accessToken: string;
    refreshToken: string;
    expiresAt: string;
  };
}

interface Auth {
  state: Var<AuthState>;
  getAuthToken(): Promise<BearerToken>;
  logout(): Promise<Error>;
}

interface BroadcastStream<T> {
  write(msg: T): Promise<void>;
  [Symbol.asyncIterator]: () => AsyncIterator<T>;
}

interface ReturnablePromise<T> extends Promise<T> {
  resolve(value: T): void;
  reject(reason?: any): void;
}

const voidfn = () => {};

function createReturnablePromise<T>(): ReturnablePromise<T> {
  let resolve: (_: T) => void = voidfn;
  let reject: (_: any) => void = voidfn;
  const promise = new Promise<T>((one, two) => {
    resolve = one;
    reject = two;
  });
  const proxy = new Proxy(promise, {
    get(target, p) {
      switch (p) {
        case "resolve":
          return resolve;
        case "reject":
          return reject;
      }
      return;
    },
  });
  return proxy as ReturnablePromise<T>;
}

class PromisedBroadcastStream<T> {
  #next: ReturnablePromise<T>;

  constructor() {
    this.#next = createReturnablePromise();
  }

  next() {
    // NOTE: maybe we can switch the implementation on our first read?
    return this.#next.then((value) => ({ value }));
  }

  write(next: T): Promise<void> {
    return tap((resolver) => {
      resolver.resolve(next);
      this.#reset();
    })(this.#next);
  }

  [Symbol.asyncIterator]() {
    return this;
  }

  #reset() {
    this.#next = createReturnablePromise();
  }
}

type Unsubscriber = () => void;

function createStorageEventListener(
  callback: (ev: StorageEvent) => void,
): Unsubscriber {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

type StorageValue = string | null;

class StorageEntryEventListener {
  #streams: WeakMap<Storage, Map<string, BroadcastStream<StorageValue>>>;
  #unsub?: Unsubscriber;

  constructor() {
    this.#streams = new WeakMap();
  }

  listen(storage: Storage, key: string): AsyncIterable<StorageValue> {
    let map = this.#streams.get(storage);
    if (!map) {
      map = new Map();
      this.#streams.set(storage, map);
    }
    let stream = map.get(key);
    if (!stream) {
      stream = new PromisedBroadcastStream();
      map.set(key, stream);
    }
    return stream;
  }

  start() {
    this.stop();
    this.#unsub = createStorageEventListener((storageEv) => {
      if (!storageEv.storageArea || !storageEv.key) {
        return;
      }
      const map = this.#streams.get(storageEv.storageArea);
      if (!map) {
        return;
      }
      const stream = map.get(storageEv.key);
      if (!stream) {
        return;
      }
      stream.write(storageEv.newValue);
    });
  }

  stop() {
    this.#unsub && this.#unsub();
  }
}

const stream = new PromisedBroadcastStream<string>();

interface UserPreferences {
  drawer?: {
    minified?: boolean;
  };
  theme?: {
    value: string;
    dark?: boolean;
  };
}

function getAuthToken() {
  // TODO: RWLock, only one refresh at a time.
  const raw = localStorage.getItem(authQueryKey);
  let json: SyncAuthQuery = {};
  try {
    json = JSON.parse(raw || "{}");
  } catch (err) {
    console.error("error parsing SyncAuthQuery:", err);
  }
  const expiresAt = new Date(json.auth?.expiresAt || "0");
  const now = () => new Date().getTime();
  const leeway = 15000;
  // TODO: Cover error case
  if (expiresAt.getTime() + 60_000 < now()) {
    const promise = refreshTokens(json.auth).then(
      tap((next) => localStorage.setItem(authQueryKey, JSON.stringify(next))),
    );
    if (expiresAt.getTime() + leeway < now()) {
      return promise;
    }
  }
  return Promise.resolve({
    type: "Bearer",
    token: json.auth?.accessToken || "",
  } as const);
}

const renderApp = () => {
  // GQL
  const fetch = createFetch(getAuthToken);
  const gqlclient = createClient({
    url: "/graphql",
    fetch,
    fetchOptions: {
      method: "POST",
    },
    exchanges: [
      dedupExchange,
      cacheExchange,
      retryExchange({
        initialDelayMs: 850,
        maxDelayMs: 15 * 60 * 1000,
        randomDelay: true,
        maxNumberAttempts: 0,
        retryIf: (err) => Boolean(err && err.networkError),
      }),
      fetchExchange,
    ],
  });

  // Start deprecated Apollo Client
  const apolloClient = createApolloClient();

  // Renderer
  ReactDOM.render(
    <ErrorBoundary handle={handle}>
      <URQLProvider value={gqlclient}>
        <BrowserRouter>
          <AppProvider>
            <React.Suspense fallback={<React.Fragment />}>
              <AppRoot apolloClient={apolloClient}>
                <NavigationProvider
                  links={[
                    {
                      id: "dashboard",
                      icon: <Glyph of="dashboard" />,
                      contents: "Dashboard",
                      hint: "Federated Dashboard",
                      href: "/dashboard",
                    },
                    {
                      id: "switcher",
                      icon: <Glyph of="switcher" />,
                      contents: "Select Namespace...",
                      adornment: <Glyph of="select" />,
                      hint: "Switch Namespace",
                      onClick: () => {
                        apolloClient.mutate({ mutation: openSwitcher });
                      },
                    },
                  ]}
                  toolbarItems={[
                    {
                      id: "signout",
                      icon: <Glyph of="signout" />,
                      hint: "Sign-out",
                      onClick: () => invalidateTokens(apolloClient),
                    },
                  ]}
                >
                  <AppView client={apolloClient} />
                </NavigationProvider>

                <React.Suspense fallback={<React.Fragment />}>
                  {/* Alerts */}
                  <EntityLimitAlert />
                  <SystemStatusAlert />
                  <LicenseAlert />

                  {/* Global Dialogs */}
                  <ContextSwitcherKeybinding />
                  <PreferencesKeybinding />
                  <SystemStatusKeybinding />

                  {/* Global Keybindings */}
                  <ContextSwitcherDialog />
                  <PreferencesDialog />
                  <ChangePasswordDialog />
                  <SystemStatusDialog />

                  {/* Lifecycle */}
                  <ServiceWorker />
                </React.Suspense>
              </AppRoot>
            </React.Suspense>
          </AppProvider>
        </BrowserRouter>
      </URQLProvider>
    </ErrorBoundary>,
    document.getElementById("root"),
  );
};

// Ensure require polyfills are in place and then render the application
polyfill().then(renderApp);
