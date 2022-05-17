/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { pipeline } from "@ogre-tools/fp";
import type {
  DiContainerForInjection,
  InjectionToken,
} from "@ogre-tools/injectable";
import { filter, map } from "lodash/fp";
import type { Runnable } from "./run-many-for";

export interface RunnableSync<TParameter = void> {
  run: RunSync<TParameter>;
  runAfter?: this;
}

type RunSync<Param> = (parameter: Param) => void;

export type RunManySync = <Param>(
  injectionToken: InjectionToken<Runnable<Param>, void>
) => RunSync<Param>;

export function runManySyncFor(di: DiContainerForInjection): RunManySync {
  return (injectionToken) => async (parameter) => {
    const allRunnables = di.injectMany(injectionToken);

    const recursedRun = (
      runAfterRunnable: RunnableSync<any> | undefined = undefined,
    ) =>
      pipeline(
        allRunnables,

        filter((runnable) => runnable.runAfter === runAfterRunnable),

        map((runnable) => {
          runnable.run(parameter);

          recursedRun(runnable);
        }),
      );

    recursedRun();
  };
}
