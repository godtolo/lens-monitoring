import { action, comparer, observable, toJS } from "mobx";
import { BaseStore } from "./base-store";
import migrations from "../migrations/hotbar-store";
import uuid from "uuid";

export interface HotbarItem {
  entity: {
    uid: string;
  };
  params?: {
    [key: string]: string;
  }
}

export interface Hotbar {
  id: string;
  name: string;
  items: HotbarItem[];
}

export interface HotbarStoreModel {
  hotbars: Hotbar[];
  activeHotbarId: string;
}

export class HotbarStore extends BaseStore<HotbarStoreModel> {
  @observable hotbars: Hotbar[] = [];
  @observable private _activeHotbarId: string;

  private constructor() {
    super({
      configName: "lens-hotbar-store",
      accessPropertiesByDotNotation: false, // To make dots safe in cluster context names
      syncOptions: {
        equals: comparer.structural,
      },
      migrations,
    });
  }

  get activeHotbarId() {
    return this._activeHotbarId;
  }

  set activeHotbarId(id: string) {
    if (this.getById(id)) {
      this._activeHotbarId = id;
    }
  }

  get activeHotbarIndex() {
    return this.hotbars.findIndex((hotbar) => hotbar.id === this.activeHotbarId);
  }

  @action protected async fromStore(data: Partial<HotbarStoreModel> = {}) {
    if (data.hotbars?.length === 0) {
      this.hotbars = [{
        id: uuid.v4(),
        name: "Default",
        items: []
      }];
    } else {
      this.hotbars = data.hotbars;
    }

    if (data.activeHotbarId) {
      if (this.getById(data.activeHotbarId)) {
        this.activeHotbarId = data.activeHotbarId;
      }
    }

    if (!this.activeHotbarId) {
      this.activeHotbarId = this.hotbars[0].id;
    }
  }

  getActive() {
    return this.getById(this.activeHotbarId);
  }

  getByName(name: string) {
    return this.hotbars.find((hotbar) => hotbar.name === name);
  }

  getById(id: string) {
    return this.hotbars.find((hotbar) => hotbar.id === id);
  }

  add(hotbar: Partial<Hotbar>) {
    hotbar.id = uuid.v4();

    if (!hotbar.items) {
      hotbar.items = [];
    }

    this.hotbars.push(hotbar as Hotbar);

    return hotbar as Hotbar;
  }

  remove(hotbar: Hotbar) {
    this.hotbars = this.hotbars.filter((h) => h !== hotbar);

    if (this.activeHotbarId === hotbar.id) {
      this.activeHotbarId = this.hotbars[0].id;
    }
  }

  switchToPrevious() {
    let index = hotbarStore.activeHotbarIndex - 1;

    if (index < 0) {
      index = hotbarStore.hotbars.length - 1;
    }

    hotbarStore.activeHotbarId = hotbarStore.hotbars[index].id;
  }

  switchToNext() {
    let index = hotbarStore.activeHotbarIndex + 1;

    if (index >= hotbarStore.hotbars.length) {
      index = 0;
    }

    hotbarStore.activeHotbarId = hotbarStore.hotbars[index].id;
  }

  toJSON(): HotbarStoreModel {
    const model: HotbarStoreModel = {
      hotbars: this.hotbars,
      activeHotbarId: this.activeHotbarId
    };

    return toJS(model, {
      recurseEverything: true,
    });
  }
}

export const hotbarStore = HotbarStore.getInstance<HotbarStore>();
