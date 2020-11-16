import type { MenuRegistration } from "./registries/menu-registry";
import { observable } from "mobx";
import { LensExtension } from "./lens-extension"
import { WindowManager } from "../main/window-manager";
import { getPageUrl } from "./registries/page-registry"

export class LensMainExtension extends LensExtension {
  @observable.shallow appMenus: MenuRegistration[] = []

  async navigate(location?: string, frameId?: number) {
    const windowManager = WindowManager.getInstance<WindowManager>();
    const url = getPageUrl(this, location); // get full path to extension's page
    await windowManager.navigate(url, frameId);
  }
}
