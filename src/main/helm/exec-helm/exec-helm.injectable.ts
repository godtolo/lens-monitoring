/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import helmBinaryPathInjectable from "../helm-binary-path.injectable";
import type { AsyncResult } from "../../../common/utils/async-result";
import { getErrorMessage } from "../../../common/utils/get-error-message";
import execFileInjectable from "../../child-process/exec-file.injectable";

const execHelmInjectable = getInjectable({
  id: "exec-helm",

  instantiate: (di) => {
    const execFile = di.inject(execFileInjectable);
    const helmBinaryPath = di.inject(helmBinaryPathInjectable);

    return async (...args: string[]): Promise<AsyncResult<string>> => {
      try {
        const { stdout } = await execFile(helmBinaryPath, args);

        return { callWasSuccessful: true, response: stdout };
      } catch (error) {
        return { callWasSuccessful: false, error: getErrorMessage(error) };
      }
    };
  },
});


export default execHelmInjectable;
