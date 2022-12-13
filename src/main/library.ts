/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { registerInjectables } from "./register-injectables";
import { afterApplicationIsLoadedInjectionToken } from "./start-main-application/runnable-tokens/after-application-is-loaded-injection-token";
import { beforeApplicationIsLoadingInjectionToken } from "./start-main-application/runnable-tokens/before-application-is-loading-injection-token";
import { beforeElectronIsReadyInjectionToken } from "./start-main-application/runnable-tokens/before-electron-is-ready-injection-token";
import { onLoadOfApplicationInjectionToken } from "./start-main-application/runnable-tokens/on-load-of-application-injection-token";
import * as extensionApi from "./extension-api";
import type { startApp } from "./start-app";

export { 
  registerInjectables,
  startApp,
  extensionApi,
  afterApplicationIsLoadedInjectionToken,
  beforeApplicationIsLoadingInjectionToken,
  beforeElectronIsReadyInjectionToken,
  onLoadOfApplicationInjectionToken,
};
