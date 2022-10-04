/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getDiForUnitTesting } from "../../../getDiForUnitTesting";
import type { GetHelmReleaseResources } from "./get-helm-release-resources.injectable";
import getHelmReleaseResourcesInjectable from "./get-helm-release-resources.injectable";
import type { ExecHelm } from "../../exec-helm/exec-helm.injectable";
import execHelmInjectable from "../../exec-helm/exec-helm.injectable";
import type { AsyncFnMock } from "@async-fn/jest";
import asyncFn from "@async-fn/jest";
import type { ExecFileWithInput } from "./call-for-kube-resources-by-manifest/exec-file-with-input/exec-file-with-input.injectable";
import execFileWithInputInjectable from "./call-for-kube-resources-by-manifest/exec-file-with-input/exec-file-with-input.injectable";
import type { AsyncResult } from "../../../../common/utils/async-result";
import type { KubeJsonApiData } from "../../../../common/k8s-api/kube-json-api";

describe("get helm release resources", () => {
  let getHelmReleaseResources: GetHelmReleaseResources;
  let execHelmMock: AsyncFnMock<ExecHelm>;
  let execFileWithStreamInputMock: AsyncFnMock<ExecFileWithInput>;

  beforeEach(() => {
    const di = getDiForUnitTesting({ doGeneralOverrides: true });

    execHelmMock = asyncFn();
    execFileWithStreamInputMock = asyncFn();

    di.override(execHelmInjectable, () => execHelmMock);

    di.override(
      execFileWithInputInjectable,
      () => execFileWithStreamInputMock,
    );

    getHelmReleaseResources = di.inject(getHelmReleaseResourcesInjectable);
  });

  describe("when called", () => {
    let actualPromise: Promise<AsyncResult<KubeJsonApiData[], string>>;

    beforeEach(() => {
      actualPromise = getHelmReleaseResources(
        "some-release",
        "some-namespace",
        "/some-kubeconfig-path",
      );
    });

    it("calls for release manifest", () => {
      expect(execHelmMock).toHaveBeenCalledWith([
        "get", "manifest", "some-release", "--namespace", "some-namespace", "--kubeconfig", "/some-kubeconfig-path",
      ]);
    });

    it("does not call for resources yet", () => {
      expect(execFileWithStreamInputMock).not.toHaveBeenCalled();
    });

    it("when call for manifest resolves without resources, resolves without resources", async () => {
      await execHelmMock.resolve({
        callWasSuccessful: true,
        response: "",
      });

      const actual = await actualPromise;

      expect(actual).toEqual({
        callWasSuccessful: true,
        response: [],
      });
    });
  });
});
