/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import type { LensApiRequest } from "../../../router";
import { helmService } from "../../../helm/helm-service";
import { routeInjectionToken } from "../../../router/router.injectable";
import { getInjectable } from "@ogre-tools/injectable";

const rollbackReleaseRouteInjectable = getInjectable({
  id: "rollback-release-route",

  instantiate: () => ({
    method: "put",
    path: `${apiPrefix}/v2/releases/{namespace}/{release}/rollback`,

    handler: async (request: LensApiRequest): Promise<void> => {
      const { cluster, params, payload } = request;

      await helmService.rollback(cluster, params.release, params.namespace, payload.revision);
    },
  }),

  // @ts-ignore
  injectionToken: routeInjectionToken,
});

export default rollbackReleaseRouteInjectable;
