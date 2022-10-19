/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import type { RegisteredAppPreference } from "./app-preferences/app-preference-registration";
import extensionPreferencesModelInjectable from "./extension-preference-model.injectable";
import { ExtensionPreferenceBlock } from "../../../features/preferences/renderer/compliance-for-legacy-extension-api/extension-preference-block";

interface Dependencies {
  model: IComputedValue<{
    preferenceItems: RegisteredAppPreference[];
    extensionName?: string;
    preferencePageTitle?: string;
  }>;
}

const NonInjectedExtensions = ({ model }: Dependencies) => {
  const { extensionName, preferenceItems, preferencePageTitle } = model.get();

  return (
    <section id="extensions">
      <h2 data-testid="extension-preferences-page-title">
        {preferencePageTitle}
      </h2>
      {!extensionName && (
        <div
          className="flex items-center"
          data-testid="error-for-extension-not-being-present"
        >
          No extension found
        </div>
      )}
      {preferenceItems.map((preferenceItem, index) => (
        <ExtensionPreferenceBlock
          key={`${preferenceItem.id}-${index}`}
          registration={preferenceItem}
          data-testid={`extension-preference-item-for-${preferenceItem.id}`}
        />
      ))}
    </section>
  );
};

export const Extensions = withInjectables<Dependencies>(
  observer(NonInjectedExtensions),

  {
    getProps: (di) => ({
      model: di.inject(extensionPreferencesModelInjectable),
    }),
  },
);
