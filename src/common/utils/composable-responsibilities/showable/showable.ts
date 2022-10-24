/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IComputedValue } from "mobx";
import { isBoolean } from "../../type-narrowing";

export interface Showable {
  isShown: IComputedValue<boolean> | boolean;
}

export const isShown = (showable: Showable | {}) => {
  if (!("isShown" in showable)) {
    return true;
  }

  if (showable.isShown === undefined) {
    return true;
  }

  if (isBoolean(showable.isShown)) {
    return showable.isShown;
  }

  return showable.isShown.get();
};
