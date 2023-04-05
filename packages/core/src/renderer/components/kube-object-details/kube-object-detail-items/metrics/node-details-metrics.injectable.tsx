/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { nodeDetailsMetricsInjectionToken } from "@k8slens/metrics";
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterMetricsResourceType } from "../../../../../common/cluster-types";
import { kubeObjectDetailItemInjectionToken } from "../kube-object-detail-item-injection-token";
import { getMetricsKubeObjectDetailItemInjectable } from "./getMetricsKubeObjectDetailItem.injectable";

const nodeMetricsInjectable = getInjectable({
  id: "node-details-metrics",
  instantiate: (di) => {
    const getMetricsKubeObjectDetailItem = di.inject(getMetricsKubeObjectDetailItemInjectable);

    return getMetricsKubeObjectDetailItem(
      nodeDetailsMetricsInjectionToken,
      ClusterMetricsResourceType.Node,
    );
  },
  injectionToken: kubeObjectDetailItemInjectionToken,
});

export default nodeMetricsInjectable;
