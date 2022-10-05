/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import productNameInjectable from "../../../../../../common/vars/product-name.injectable";
import showAboutInjectable from "./show-about.injectable";
import applicationMenuItemInjectionToken from "../../application-menu-item-injection-token";
import isMacInjectable from "../../../../../../common/vars/is-mac.injectable";

const aboutMenuItemInjectable = getInjectable({
  id: "about-menu-item",

  instantiate: (di) => {
    const productName = di.inject(productNameInjectable);
    const showAbout = di.inject(showAboutInjectable);
    const isMac = di.inject(isMacInjectable);

    return {
      id: "about",
      parentId: isMac ? "primary-for-mac" : "help",
      orderNumber: isMac ? 10 : 40,
      label: `About ${productName}`,

      click() {
        showAbout();
      },
    };
  },

  injectionToken: applicationMenuItemInjectionToken,
});

export default aboutMenuItemInjectable;
