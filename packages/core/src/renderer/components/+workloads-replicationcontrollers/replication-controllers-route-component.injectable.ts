/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ReplicationControllers } from "./replicationcontrollers";
import {
  routeSpecificComponentInjectionToken,
} from "../../routes/route-specific-component-injection-token";
import replicationControllersRouteInjectable
  from "../../../common/front-end-routing/routes/cluster/workloads/replicationcontrollers/replicationcontrollers-route.injectable";

const replicationControllersRouteComponentInjectable = getInjectable({
  id: "replicationcontroller-route-component",

  instantiate: (di) => ({
    route: di.inject(replicationControllersRouteInjectable),
    Component: ReplicationControllers,
  }),

  injectionToken: routeSpecificComponentInjectionToken,
});

export default replicationControllersRouteComponentInjectable;
