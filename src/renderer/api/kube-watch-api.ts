// Kubernetes watch-api client
// API: https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams

import type { KubeObjectStore } from "../kube-object.store";
import type { ClusterContext } from "../components/context";

import plimit from "p-limit";
import { comparer, IReactionDisposer, observable, reaction, when } from "mobx";
import { autobind, noop } from "../utils";
import { KubeApi } from "./kube-api";
import { KubeJsonApiData } from "./kube-json-api";
import { isDebugging, isProduction } from "../../common/vars";

export interface IKubeWatchEvent<T = KubeJsonApiData> {
  type: "ADDED" | "MODIFIED" | "DELETED" | "ERROR";
  object?: T;
}

export interface IKubeWatchSubscribeStoreOptions {
  namespaces?: string[]; // default: all accessible namespaces
  preload?: boolean; // preload store items, default: true
  waitUntilLoaded?: boolean; // subscribe only after loading all stores, default: true
  loadOnce?: boolean; // check store.isLoaded to skip loading if done already, default: false
}

export interface IKubeWatchLog {
  message: string | string[] | Error;
  meta?: object;
  cssStyle?: string;
}

@autobind()
export class KubeWatchApi {
  @observable context: ClusterContext = null;

  contextReady = when(() => Boolean(this.context));

  isAllowedApi(api: KubeApi): boolean {
    return Boolean(this.context?.cluster.isAllowedResource(api.kind));
  }

  preloadStores(stores: KubeObjectStore[], opts: { namespaces?: string[], loadOnce?: boolean } = {}) {
    const limitRequests = plimit(1); // load stores one by one to allow quick skipping when fast clicking btw pages
    const preloading: Promise<any>[] = [];

    for (const store of stores) {
      preloading.push(limitRequests(async () => {
        if (store.isLoaded && opts.loadOnce) return; // skip

        return store.loadAll({ namespaces: opts.namespaces });
      }));
    }

    return {
      loading: Promise.allSettled(preloading),
      cancelLoading: () => limitRequests.clearQueue(),
    };
  }

  subscribeStores(stores: KubeObjectStore[], opts: IKubeWatchSubscribeStoreOptions = {}): () => void {
    const { preload = true, waitUntilLoaded = true, loadOnce = false, } = opts;
    const subscribingNamespaces = opts.namespaces ?? this.context?.allNamespaces ?? [];
    const unsubscribeList: Function[] = [];
    let isUnsubscribed = false;

    const load = (namespaces = subscribingNamespaces) => this.preloadStores(stores, { namespaces, loadOnce });
    let preloading: boolean | ReturnType<typeof load> = preload && load();
    let cancelReloading: IReactionDisposer = noop;
    let ac = new AbortController();

    const subscribe = async (signal: AbortSignal) => {
      if (isUnsubscribed || signal.aborted) return;

      for (const store of stores) {
        if (!signal.aborted) {
          unsubscribeList.push(await store.subscribe());
        }
      }
    };

    let subscribeP: Promise<void>;

    if (preloading) {
      if (waitUntilLoaded) {
        subscribeP = preloading.loading
          .then(() => subscribe(ac.signal))
          .catch(error => {
            this.log({
              message: new Error("Loading stores has failed"),
              meta: { stores, error, options: opts },
            });
          });
      } else {
        subscribeP = subscribe(ac.signal);
      }

      // reload stores only for context namespaces change
      cancelReloading = reaction(() => this.context?.selectedNamespaces, namespaces => {
        if (typeof preloading === "object") {
          preloading.cancelLoading();
        }
        ac.abort();
        subscribeP.then(() => {
          unsubscribeList.forEach(unsubscribe => unsubscribe());
          unsubscribeList.length = 0;

          ac = new AbortController();
          preloading = load(namespaces);
          preloading.loading
            .then(() => subscribeP = subscribe(ac.signal));
        });
      }, {
        equals: comparer.shallow,
      });
    }

    // unsubscribe
    return () => {
      if (isUnsubscribed) return;
      isUnsubscribed = true;
      cancelReloading();

      if (typeof preloading === "object") {
        preloading.cancelLoading();
      }
      ac.abort();
      subscribeP.then(() => {
        unsubscribeList.forEach(unsubscribe => unsubscribe());
        unsubscribeList.length = 0;
      });
    };
  }

  protected log({ message, cssStyle = "", meta = {} }: IKubeWatchLog) {
    if (isProduction && !isDebugging) {
      return;
    }

    const logInfo = [`%c[KUBE-WATCH-API]:`, `font-weight: bold; ${cssStyle}`, message].flat().map(String);
    const logMeta = {
      time: new Date().toLocaleString(),
      ...meta,
    };

    if (message instanceof Error) {
      console.error(...logInfo, logMeta);
    } else {
      console.info(...logInfo, logMeta);
    }
  }
}

export const kubeWatchApi = new KubeWatchApi();
