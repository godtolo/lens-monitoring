/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { docsUrl, supportUrl } from "../../../common/vars";
import { broadcastMessage } from "../../../common/ipc";
import type { MenuItemConstructorOptions } from "electron";
import { webContents } from "electron";
import loggerInjectable from "../../../common/logger.injectable";
import electronMenuItemsInjectable from "./electron-menu-items.injectable";
import updatingIsEnabledInjectable from "../../application-update/main/updating-is-enabled/updating-is-enabled.injectable";
import navigateToPreferencesInjectable from "../../../common/front-end-routing/routes/preferences/navigate-to-preferences.injectable";
import navigateToExtensionsInjectable from "../../../common/front-end-routing/routes/extensions/navigate-to-extensions.injectable";
import navigateToCatalogInjectable from "../../../common/front-end-routing/routes/catalog/navigate-to-catalog.injectable";
import navigateToWelcomeInjectable from "../../../common/front-end-routing/routes/welcome/navigate-to-welcome.injectable";
import navigateToAddClusterInjectable from "../../../common/front-end-routing/routes/add-cluster/navigate-to-add-cluster.injectable";
import stopServicesAndExitAppInjectable from "../../../main/stop-services-and-exit-app.injectable";
import isMacInjectable from "../../../common/vars/is-mac.injectable";
import { computed } from "mobx";
import showAboutInjectable from "./menu-items/primary-for-mac/show-about-application/show-about.injectable";
import reloadCurrentApplicationWindowInjectable from "../../../main/start-main-application/lens-window/reload-current-application-window.injectable";
import showApplicationWindowInjectable from "../../../main/start-main-application/lens-window/show-application-window.injectable";
import processCheckingForUpdatesInjectable from "../../application-update/main/process-checking-for-updates.injectable";
import openLinkInBrowserInjectable from "../../../common/utils/open-link-in-browser.injectable";
import productNameInjectable from "../../../common/vars/product-name.injectable";
import type { ApplicationMenuItemTypes } from "./menu-items/application-menu-item-injection-token";
import applicationMenuItemInjectionToken from "./menu-items/application-menu-item-injection-token";
import { filter, map, sortBy } from "lodash/fp";
import { pipeline } from "@ogre-tools/fp";
import type { Composite } from "./menu-items/get-composite/get-composite";
import getComposite from "./menu-items/get-composite/get-composite";

function ignoreIf(check: boolean, menuItems: MenuItemOpts[]) {
  return check ? [] : menuItems;
}

export interface MenuItemOpts extends MenuItemConstructorOptions {
  submenu?: MenuItemConstructorOptions[];
}

const applicationMenuItemsInjectable = getInjectable({
  id: "application-menu-items",

  instantiate: (di) => {
    const logger = di.inject(loggerInjectable);

    const productName = di.inject(productNameInjectable);
    const isMac = di.inject(isMacInjectable);
    const updatingIsEnabled = di.inject(updatingIsEnabledInjectable);
    const electronMenuItems = di.inject(electronMenuItemsInjectable);
    const showAbout = di.inject(showAboutInjectable);
    const showApplicationWindow = di.inject(showApplicationWindowInjectable);

    const reloadApplicationWindow = di.inject(
      reloadCurrentApplicationWindowInjectable,
    );

    const navigateToPreferences = di.inject(navigateToPreferencesInjectable);
    const navigateToExtensions = di.inject(navigateToExtensionsInjectable);
    const navigateToCatalog = di.inject(navigateToCatalogInjectable);
    const navigateToWelcome = di.inject(navigateToWelcomeInjectable);
    const navigateToAddCluster = di.inject(navigateToAddClusterInjectable);
    const stopServicesAndExitApp = di.inject(stopServicesAndExitAppInjectable);

    const processCheckingForUpdates = di.inject(
      processCheckingForUpdatesInjectable,
    );

    const openLinkInBrowser = di.inject(openLinkInBrowserInjectable);

    // Todo: find out what to do with this.
    // logger.info(`[MENU]: autoUpdateEnabled=${updatingIsEnabled}`);

    const allShown = pipeline(
      di.injectMany(applicationMenuItemInjectionToken),
      filter((x) => x.isShown !== false),
    );

    const roots = allShown.filter((x) => x.parentId === null);

    const toMenuItemOpt = (
      x: Composite<ApplicationMenuItemTypes>,
    ): MenuItemOpts => ({
      // @ts-ignore
      label: x.value.label,
      id: x.id,

      submenu: pipeline(
        x.children,
        sortBy(x => x.value.orderNumber),
        map(toMenuItemOpt),
      ),

      // @ts-ignore
      type: x.value.type,
      // @ts-ignore
      role: x.value.role,
      // @ts-ignore
      click: x.value.click,
      // @ts-ignore
      accelerator: x.value.accelerator,
    });

    const menuItems = pipeline(
      roots,

      map((root) =>
        getComposite({
          source: allShown,
          // @ts-ignore
          rootId: root.id,
          // @ts-ignore
          getId: (x) => x.id,
          // @ts-ignore
          getParentId: (x) => x.parentId,
        }),
      ),

      map(toMenuItemOpt),
    );

    return computed((): MenuItemOpts[] => {
      const fileMenu: MenuItemOpts = {
        label: "File",
        id: "file",
        submenu: [
          {
            label: "Add Cluster",
            accelerator: "CmdOrCtrl+Shift+A",
            id: "add-cluster",
            click() {
              navigateToAddCluster();
            },
          },
          ...ignoreIf(isMac, [
            { type: "separator" },
            {
              label: "Preferences",
              id: "preferences",
              accelerator: "Ctrl+,",
              click() {
                navigateToPreferences();
              },
            },
            {
              label: "Extensions",
              accelerator: "Ctrl+Shift+E",
              click() {
                navigateToExtensions();
              },
            },
          ]),
          { type: "separator" },
          ...ignoreIf(!isMac, [
            {
              role: "close",
              label: "Close Window",
              accelerator: "Shift+Cmd+W",
            },
          ]),
          ...ignoreIf(isMac, [
            {
              label: "Exit",
              accelerator: "Alt+F4",
              id: "quit",
              click() {
                stopServicesAndExitApp();
              },
            },
          ]),
        ],
      };
      const editMenu: MenuItemOpts = {
        label: "Edit",
        id: "edit",
        submenu: [
          { role: "undo" },
          { role: "redo" },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          { role: "delete" },
          { type: "separator" },
          { role: "selectAll" },
        ],
      };
      const viewMenu: MenuItemOpts = {
        label: "View",
        id: "view",
        submenu: [
          {
            label: "Catalog",
            accelerator: "Shift+CmdOrCtrl+C",
            id: "catalog",
            click() {
              navigateToCatalog();
            },
          },
          {
            label: "Command Palette...",
            accelerator: "Shift+CmdOrCtrl+P",
            id: "command-palette",
            click(_m, _b, event) {
              /**
               * Don't broadcast unless it was triggered by menu iteration so that
               * there aren't double events in renderer
               *
               * NOTE: this `?` is required because of a bug in playwright. https://github.com/microsoft/playwright/issues/10554
               */
              if (!event?.triggeredByAccelerator) {
                broadcastMessage("command-palette:open");
              }
            },
          },
          { type: "separator" },
          {
            label: "Back",
            accelerator: "CmdOrCtrl+[",
            id: "go-back",
            click() {
              webContents
                .getAllWebContents()
                .filter((wc) => wc.getType() === "window")
                .forEach((wc) => wc.goBack());
            },
          },
          {
            label: "Forward",
            accelerator: "CmdOrCtrl+]",
            id: "go-forward",
            click() {
              webContents
                .getAllWebContents()
                .filter((wc) => wc.getType() === "window")
                .forEach((wc) => wc.goForward());
            },
          },
          {
            label: "Reload",
            accelerator: "CmdOrCtrl+R",
            id: "reload",
            click() {
              reloadApplicationWindow();
            },
          },
          { role: "toggleDevTools" },
          { type: "separator" },
          { role: "resetZoom" },
          { role: "zoomIn" },
          { role: "zoomOut" },
          { type: "separator" },
          { role: "togglefullscreen" },
        ],
      };
      const helpMenu: MenuItemOpts = {
        role: "help",
        id: "help",
        submenu: [
          {
            label: "Welcome",
            id: "welcome",
            click() {
              navigateToWelcome();
            },
          },
          {
            label: "Documentation",
            id: "documentation",
            click: async () => {
              openLinkInBrowser(docsUrl).catch((error) => {
                logger.error("[MENU]: failed to open browser", { error });
              });
            },
          },
          {
            label: "Support",
            id: "support",
            click: async () => {
              openLinkInBrowser(supportUrl).catch((error) => {
                logger.error("[MENU]: failed to open browser", { error });
              });
            },
          },
          ...ignoreIf(isMac, [
            {
              label: `About ${productName}`,
              id: "about",
              click() {
                showAbout();
              },
            },
            ...ignoreIf(!updatingIsEnabled, [
              {
                label: "Check for updates",
                click() {
                  processCheckingForUpdates("periodic").then(() =>
                    showApplicationWindow(),
                  );
                },
              },
            ]),
          ]),
        ],
      };
      // Prepare menu items order
      const appMenu = new Map([
        ["file", fileMenu],
        ["edit", editMenu],
        ["view", viewMenu],
        ["help", helpMenu],
      ]);

      // Modify menu from extensions-api
      for (const menuItem of electronMenuItems.get()) {
        const parentMenu = appMenu.get(menuItem.parentId);

        if (!parentMenu) {
          logger.error(
            `[MENU]: cannot register menu item for parentId=${menuItem.parentId}, parent item doesn't exist`,
            { menuItem },
          );

          continue;
        }

        (parentMenu.submenu ??= []).push(menuItem);
      }

      if (!isMac) {
        appMenu.delete("mac");
      }

      return [...menuItems, ...appMenu.values()];
    });
  },
});

export default applicationMenuItemsInjectable;
