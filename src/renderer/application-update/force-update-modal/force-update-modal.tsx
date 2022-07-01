/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import React from "react";
import restartAndInstallUpdateInjectable from "../../components/update-button/restart-and-install-update.injectable";
import { Countdown } from "../../components/countdown/countdown";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import installUpdateCountdownInjectable from "./install-update-countdown.injectable";
import { Dialog } from "../../components/dialog";
import { Button } from "../../components/button";
import styles from "./force-update-modal.module.scss";

interface Dependencies {
  restartAndInstallUpdate: () => void;
  secondsTill: IComputedValue<number>;
}

const NonInjectedForceUpdateModal = observer(
  ({ restartAndInstallUpdate, secondsTill }: Dependencies) => (
    <Dialog isOpen={true} pinned>
      <div
        data-testid="must-update-immediately"
        className={styles.ForceUpdateModal}
      >
        <div className={styles.header}>
          <h2>Updating is required</h2>
        </div>

        <div className={styles.content}>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto
            culpa distinctio inventore sapiente sed. Consequatur debitis dicta
            dolorum expedita illum magni natus quae rem repudiandae rerum,
            similique suscipit velit voluptatum.
          </p>
        </div>

        <div className={styles.footer}>
          <Button
            primary
            data-testid="update-now-from-must-update-immediately-modal"
            onClick={restartAndInstallUpdate}
            label="Update"
          >
            {" "}
            (
            <Countdown
              secondsTill={secondsTill}
              data-testid="countdown-to-automatic-update"
            />
            )
          </Button>
        </div>
      </div>
    </Dialog>
  ),
);

export const ForceUpdateModal = withInjectables<Dependencies>(
  NonInjectedForceUpdateModal,

  {
    getProps: (di, props) => ({
      restartAndInstallUpdate: di.inject(restartAndInstallUpdateInjectable),
      secondsTill: di.inject(installUpdateCountdownInjectable),
      ...props,
    }),
  },
);
