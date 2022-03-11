/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { secretsApi } from "../../../../../../common/k8s-api/endpoints";
import { DrawerItem } from "../../../../drawer";
import { LocalRef, VolumeVariantComponent } from "../variant-helpers";

export const ContainerStorageInterface: VolumeVariantComponent<"csi"> = ({
  pod,
  variant: {
    driver,
    readOnly = false,
    fsType = "ext4",
    volumeAttributes = {},
    nodePublishSecretRef,
    controllerPublishSecretRef,
    nodeStageSecretRef,
    controllerExpandSecretRef,
  },
}) => (
  <>
    <DrawerItem name="Driver">
      {driver}
    </DrawerItem>
    <DrawerItem name="ReadOnly">
      {readOnly.toString()}
    </DrawerItem>
    <DrawerItem name="Filesystem Type">
      {fsType}
    </DrawerItem>
    <LocalRef
      pod={pod}
      title="Controller Publish Secret"
      ref={controllerPublishSecretRef}
      api={secretsApi}
    />
    <LocalRef
      pod={pod}
      title="Controller Expand Secret"
      ref={controllerExpandSecretRef}
      api={secretsApi}
    />
    <LocalRef
      pod={pod}
      title="Node Publish Secret"
      ref={nodePublishSecretRef}
      api={secretsApi}
    />
    <LocalRef
      pod={pod}
      title="Node Stage Secret"
      ref={nodeStageSecretRef}
      api={secretsApi}
    />
    {
      Object.entries(volumeAttributes)
        .map(([key, value]) => (
          <DrawerItem key={key} name={key}>
            {value}
          </DrawerItem>
        ))
    }
  </>
);
