/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { createContainer } from "@ogre-tools/injectable";
import { registerInjectables } from "./register-injectables";

export const getDi = () => {
  const di = createContainer("main");

  return registerInjectables(di);
};
