/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { preferenceItemInjectionToken } from "../preference-item-injection-token";
import { EditorPreferencePage } from "./editor-preference-page";

const editorPreferencePageInjectable = getInjectable({
  id: "editor-preference-page",

  instantiate: () => ({
    kind: "page" as const,
    id: "editor-page",
    parentId: "editor-tab",
    orderNumber: 0,
    Component: EditorPreferencePage,
  }),

  injectionToken: preferenceItemInjectionToken,
});

export default editorPreferencePageInjectable;
