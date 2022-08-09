/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { HelmReleaseDto } from "../../../../../common/k8s-api/endpoints/helm-releases.api";
import requestHelmReleasesInjectable from "../../../../../common/k8s-api/endpoints/helm-releases.api/list.injectable";
import type { HelmReleaseDetails } from "../../../../../common/k8s-api/endpoints/helm-releases.api/get-details.injectable";
import requestHelmReleaseDetailsInjectable from "../../../../../common/k8s-api/endpoints/helm-releases.api/get-details.injectable";
import type { AsyncResult } from "../../../../../common/utils/async-result";

export interface DetailedHelmRelease {
  release: HelmReleaseDto;
  details: HelmReleaseDetails;
}

export type RequestHelmRelease = (
  name: string,
  namespace: string
) => Promise<AsyncResult<DetailedHelmRelease>>;

const requestHelmReleaseInjectable = getInjectable({
  id: "call-for-helm-release",

  instantiate: (di): RequestHelmRelease => {
    const requestHelmReleases = di.inject(requestHelmReleasesInjectable);
    const requestHelmReleaseDetails = di.inject(requestHelmReleaseDetailsInjectable);

    return async (name, namespace) => {
      const [releases, details] = await Promise.all([
        requestHelmReleases(namespace),
        requestHelmReleaseDetails(name, namespace),
      ]);

      const release = releases.find(
        (rel) => rel.name === name && rel.namespace === namespace,
      );

      if (!release) {
        return {
          callWasSuccessful: false,
          error: `Release ${name} didn't exist in ${namespace} namespace.`,
        };
      }

      return { callWasSuccessful: true, response: { release, details }};
    };
  },
});

export default requestHelmReleaseInjectable;
