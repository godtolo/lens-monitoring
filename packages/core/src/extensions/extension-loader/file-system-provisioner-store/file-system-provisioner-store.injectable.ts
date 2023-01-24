/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { registeredExtensionsInjectable } from "./registered-extensions.injectable";
import createBaseStoreInjectable from "../../../common/base-store/create-base-store.injectable";
import { action } from "mobx";
import { object } from "@k8slens/utilities";
import storeMigrationVersionInjectable from "../../../common/vars/store-migration-version.injectable";

const fileSystemProvisionerStoreInjectable = getInjectable({
  id: "file-system-provisioner-store",

  instantiate: (di) => {
    const registeredExtensions = di.inject(registeredExtensionsInjectable);
    const createBaseStore = di.inject(createBaseStoreInjectable);
    const storeMigrationVersion = di.inject(storeMigrationVersionInjectable);

    const store = createBaseStore({
      configName: "lens-filesystem-provisioner-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      projectVersion: storeMigrationVersion,
      fromStore: action(({ extensions = {}}) => {
        registeredExtensions.replace(object.entries(extensions));
      }),
      toJSON: () => ({
        extensions: Object.fromEntries(registeredExtensions),
      }),
    });

    return {
      load: () => store.load(),
    };
  },
});

export default fileSystemProvisionerStoreInjectable;
