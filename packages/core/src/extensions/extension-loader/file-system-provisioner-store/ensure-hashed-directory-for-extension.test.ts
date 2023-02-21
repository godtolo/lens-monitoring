/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ObservableMap } from "mobx";
import { observable, runInAction } from "mobx";
import { getDiForUnitTesting } from "../../../main/getDiForUnitTesting";
import type { EnsureHashedDirectoryForExtension } from "./ensure-hashed-directory-for-extension.injectable";
import ensureHashedDirectoryForExtensionInjectable from "./ensure-hashed-directory-for-extension.injectable";
import ensureDirInjectable from "../../../common/fs/ensure-dir.injectable";
import directoryForExtensionDataInjectable from "./directory-for-extension-data.injectable";
import directoryForUserDataInjectable from "../../../common/app-paths/directory-for-user-data/directory-for-user-data.injectable";

describe("ensure-hashed-directory-for-extension", () => {
  let ensureHashedDirectoryForExtension: EnsureHashedDirectoryForExtension;
  let ensureDirMock: jest.Mock;
  let registeredExtensions: ObservableMap<string, string>;

  beforeEach(() => {
    const di = getDiForUnitTesting({  doGeneralOverrides: true });

    ensureDirMock = jest.fn();

    di.override(ensureDirInjectable, () => ensureDirMock);
    di.override(directoryForExtensionDataInjectable, () => "some-directory-for-extension-data");
    di.override(directoryForUserDataInjectable, () => "/some-directory-for-user-data");

    ensureHashedDirectoryForExtension = di.inject(
      ensureHashedDirectoryForExtensionInjectable,
    );

    registeredExtensions = observable.map();
  });

  it("given registered extension exists, returns existing directory", async () => {
    runInAction(() => {
      registeredExtensions.set("some-extension-name", "some-directory");
    });

    const actual = await ensureHashedDirectoryForExtension(
      "some-extension-name",
      registeredExtensions,
    );

    expect(actual).toBe("some-directory");
  });

  it("given registered extension does not exist, returns random directory", async () => {
    const actual = await ensureHashedDirectoryForExtension(
      "some-extension-name",
      registeredExtensions,
    );

    expect(actual).toBe("some-directory-for-extension-data/12a427eae86fd78610c0404c3c1ef42cb28d8af1605552ed7cf30beaee21e876");
  });

  describe("given extension directory was saved based on extension's package.json path", () => {
    beforeEach(() => {
      runInAction(() => {
        registeredExtensions.set("/some-directory-for-user-data/node_modules/some-extension-name/package.json", "some-directory");
      });
      ensureDirMock.mockClear();
    });

    it("returns existing directory", async () => {
      const actual = await ensureHashedDirectoryForExtension(
        "some-extension-name",
        registeredExtensions,
      );

      expect(actual).toBe("some-directory");
    });

    it("ensure dir is called with some directory", async () => {
      await ensureHashedDirectoryForExtension(
        "some-extension-name",
        registeredExtensions,
      );

      expect(ensureDirMock).toHaveBeenCalledWith("some-directory");
    });

    it("is migrated to use the extension name as key", async () => {
      await ensureHashedDirectoryForExtension(
        "some-extension-name",
        registeredExtensions,
      );

      expect(registeredExtensions.get("some-extension-name")).toEqual("some-directory");
    });

    it("old key is removed", async () => {
      await ensureHashedDirectoryForExtension(
        "some-extension-name",
        registeredExtensions,
      );

      expect(registeredExtensions.has("/some-directory-for-user-data/node_modules/some-extension-name/package.json")).toEqual(false);
    });
  });
});
