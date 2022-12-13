/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import startMainApplicationInjectable from "./start-main-application/start-main-application.injectable";

interface AppConfig {
  di: DiContainer;
}

export function startApp(conf: AppConfig) {
  const { di } = conf;

  return di.inject(startMainApplicationInjectable);
}
