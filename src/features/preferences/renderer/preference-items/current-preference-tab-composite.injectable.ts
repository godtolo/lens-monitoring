/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { PreferenceTab, PreferenceTypes } from "./preference-item-injection-token";
import type { Composite } from "../../../application-menu/main/menu-items/get-composite/get-composite";
import { filter, map } from "lodash/fp";
import { pipeline } from "@ogre-tools/fp";
import { normalizeComposite } from "../../../application-menu/main/menu-items/get-composite/normalize-composite/normalize-composite";
import preferencesCompositeInjectable from "./preferences-composite.injectable";
import type { PreferenceTabsRoot } from "./preference-tab-root";
import currentPreferenceTabIdInjectable from "./current-preference-tab-id.injectable";

const currentPreferenceTabCompositeInjectable = getInjectable({
  id: "current-preference-page-composite",

  instantiate: (di) => {
    const currentTabId = di.inject(currentPreferenceTabIdInjectable);
    const preferencesComposite = di.inject(preferencesCompositeInjectable);

    return computed(() => {
      const tabId = currentTabId.get();

      const tabComposites = pipeline(
        normalizeComposite(preferencesComposite.get()),
        map(([, composite]) => composite),
        filter(isPreferenceTab),
        filter(hasMatchingPathId(tabId)),
      );

      if (tabComposites.length === 0) {
        return undefined;
      }

      return tabComposites[0];
    });
  },
});

const isPreferenceTab = (
  composite: Composite<PreferenceTypes | PreferenceTabsRoot>,
): composite is Composite<PreferenceTab> => composite.value.kind === "tab";

const hasMatchingPathId =
  (preferenceTabId: string) =>
    ({ value: { pathId }}: Composite<PreferenceTab>) =>
      pathId === preferenceTabId;

export default currentPreferenceTabCompositeInjectable;
