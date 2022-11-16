/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import baseBundledBinariesDirectoryInjectable from "../../common/vars/base-bundled-binaries-dir.injectable";
import joinPathsInjectable from "../../common/path/join-paths.injectable";
import binaryNameInjectable from "../../common/utils/get-binary-name.injectable";

const helmBinaryPathInjectable = getInjectable({
  id: "helm-binary-path",

  instantiate: (di) => {
    const joinPaths = di.inject(joinPathsInjectable);
    const binaryName = di.inject(binaryNameInjectable, "helm");
    const baseBundledBinariesDirectory = di.inject(baseBundledBinariesDirectoryInjectable);

    return joinPaths(baseBundledBinariesDirectory, binaryName);
  },
});

export default helmBinaryPathInjectable;
