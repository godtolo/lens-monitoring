/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import clusterFrameContextForNamespacedResourcesInjectable from "../../../renderer/cluster-frame-context/for-namespaced-resources.injectable";
import { getDiForUnitTesting } from "../../../renderer/getDiForUnitTesting";
import storesAndApisCanBeCreatedInjectable from "../../../renderer/stores-apis-can-be-created.injectable";
import directoryForUserDataInjectable from "../../app-paths/directory-for-user-data/directory-for-user-data.injectable";
import type { ApiManager } from "../api-manager";
import apiManagerInjectable from "../api-manager/manager.injectable";
import { KubeApi } from "../kube-api";
import { KubeObject } from "../kube-object";
import { KubeObjectStore } from "../kube-object.store";

class TestApi extends KubeApi<KubeObject> {
  protected async checkPreferredVersion() {
    return;
  }
}

class TestStore extends KubeObjectStore<KubeObject, TestApi> {

}

describe("ApiManager", () => {
  let apiManager: ApiManager;
  let di: DiContainer;

  beforeEach(() => {
    di = getDiForUnitTesting({ doGeneralOverrides: true });

    di.override(storesAndApisCanBeCreatedInjectable, () => true);
    di.override(directoryForUserDataInjectable, () => "/some-user-store-path");

    apiManager = di.inject(apiManagerInjectable);
  });

  describe("registerApi", () => {
    it("re-register store if apiBase changed", async () => {
      const apiBase = "apis/v1/foo";
      const fallbackApiBase = "/apis/extensions/v1beta1/foo";
      const kubeApi = new TestApi({
        objectConstructor: KubeObject,
        apiBase,
        kind: "foo",
        fallbackApiBases: [fallbackApiBase],
        checkPreferredVersion: true,
      });
      const kubeStore = new TestStore({
        context: di.inject(clusterFrameContextForNamespacedResourcesInjectable),
      }, kubeApi);

      apiManager.registerApi(apiBase, kubeApi);

      // Define to use test api for ingress store
      Object.defineProperty(kubeStore, "api", { value: kubeApi });
      apiManager.registerStore(kubeStore, [kubeApi]);

      // Test that store is returned with original apiBase
      expect(apiManager.getStore(kubeApi)).toBe(kubeStore);

      // Change apiBase similar as checkPreferredVersion does
      Object.defineProperty(kubeApi, "apiBase", { value: fallbackApiBase });
      apiManager.registerApi(fallbackApiBase, kubeApi);

      // Test that store is returned with new apiBase
      expect(apiManager.getStore(kubeApi)).toBe(kubeStore);
    });
  });
});
