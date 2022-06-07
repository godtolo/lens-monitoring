/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { asLegacyGlobalForExtensionApi } from "../../../extensions/as-legacy-globals-for-extension-api/as-legacy-global-object-for-extension-api";
import customResourceDefinitionStoreInjectable from "./definition.store.injectable";

/**
 * @deprecated use `di.inject(customResourceDefinitionStoreInjectable)` instead
 */
export const customResourceDefinitionStore = asLegacyGlobalForExtensionApi(customResourceDefinitionStoreInjectable);
