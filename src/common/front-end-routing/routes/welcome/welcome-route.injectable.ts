/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import packageJsonInjectable from "../../../vars/package-json.injectable";
import { frontEndRouteInjectionToken } from "../../front-end-route-injection-token";

const welcomeRouteInjectable = getInjectable({
  id: "welcome-route",

  instantiate: (di) => {
    const packageJson = di.inject(packageJsonInjectable);

    return {
      path: packageJson.config.welcomeRoute,
      clusterFrame: false,
      isEnabled: computed(() => true),
    };
  },

  injectionToken: frontEndRouteInjectionToken,
});

export default welcomeRouteInjectable;
