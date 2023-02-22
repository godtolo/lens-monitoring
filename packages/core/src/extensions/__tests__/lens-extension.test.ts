/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getApplicationBuilder } from "../../renderer/components/test-utils/get-application-builder";
import { LensMainExtension } from "../lens-main-extension";

describe("lens extension", () => {
  beforeEach(async () => {
    const builder = getApplicationBuilder();

    await builder.render();

    ext = new LensMainExtension({
      manifest: {
        name: "foo-bar",
        version: "0.1.1",
        engines: { lens: "^5.5.0" },
      },
      id: "/this/is/fake/package.json",
      absolutePath: "/absolute/fake/",
      manifestPath: "/this/is/fake/package.json",
      isBundled: false,
      isEnabled: true,
      isCompatible: true,
    });
  });

  describe("name", () => {
    it("returns name", () => {
      expect(ext.name).toBe("foo-bar");
    });
  });
});
