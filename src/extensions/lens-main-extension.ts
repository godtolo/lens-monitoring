/**
 * Copyright (c) 2021 OpenLens Authors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to
 * use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 * the Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 * COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 * IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import { IpcPrefix, LensExtension } from "./lens-extension";
import { WindowManager } from "../main/window-manager";
import { getExtensionPageUrl } from "./registries/page-registry";
import { CatalogEntity, catalogEntityRegistry } from "../common/catalog";
import { IObservableArray } from "mobx";
import { IpcHandlerRegistration, MenuRegistration } from "./registries";
import { handleCorrect, ListenerEvent, ListVerifier, onCorrect, Rest } from "../common/ipc";
import { ipcMain, IpcMain } from "electron";

export class LensMainExtension extends LensExtension {
  appMenus: MenuRegistration[] = [];

  async navigate<P extends object>(pageId?: string, params?: P, frameId?: number) {
    const windowManager = WindowManager.getInstance();
    const pageUrl = getExtensionPageUrl({
      extensionId: this.name,
      pageId,
      params: params ?? {}, // compile to url with params
    });

    await windowManager.navigate(pageUrl, frameId);
  }

  addCatalogSource(id: string, source: IObservableArray<CatalogEntity>) {
    catalogEntityRegistry.addObservableSource(`${this.name}:${id}`, source);
  }

  removeCatalogSource(id: string) {
    catalogEntityRegistry.removeSource(`${this.name}:${id}`);
  }

  handleIpc<
    Handler extends (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any,
  >({ channel, ...reg }: IpcHandlerRegistration<Handler>): void {
    // This is to have a uniform length prefix so that two extensions cannot talk to each other's IPCs accidentally
    this.disposers.push(
      handleCorrect({
        channel: `extensions@${this[IpcPrefix]}:${channel}`,
        ...reg,
      })
    );
  }

  listenIpc<
    Listener extends (event: ListenerEvent<IpcMain>, ...args: any[]) => any
  >({
    channel,
    ...reg
  }: {
    channel: string,
    listener: Listener,
    verifier: ListVerifier<Rest<Parameters<Listener>>>,
  }): void {
    this.disposers.push(
      onCorrect({
        source: ipcMain,
        channel: `extensions@${this[IpcPrefix]}:${channel}`,
        ...reg,
      })
    );
  }
}
