/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "../../api/catalog/entity/registry.injectable";
import catalogCategoryRegistryInjectable from "../../../common/catalog/category-registry.injectable";
import type { IComputedValue, IObservableValue } from "mobx";
import { computed, observable, reaction } from "mobx";
import type { CatalogEntity, CatalogCategory } from "../../api/catalog-entity";
import type { Disposer } from "../../utils";
import { disposer } from "../../utils";
import type { ItemListStore } from "../item-object-list";

export type CatalogEntityStore = ItemListStore<CatalogEntity, false> & {
  readonly entities: IComputedValue<CatalogEntity[]>;
  readonly activeCategory: IComputedValue<CatalogCategory | undefined>;
  readonly selectedItemId: IObservableValue<string | undefined>;
  readonly selectedItem: IComputedValue<CatalogEntity | undefined>;
  watch(): Disposer;
  onRun(entity: CatalogEntity): void;
};

export type ActiveCategory = {
  browseAll: true;
} | {
  browseAll: false;
  activeTab: string;
};

const catalogEntityStoreInjectable = getInjectable({
  id: "catalog-entity-store",

  instantiate: (di): CatalogEntityStore => {
    const entityRegistry = di.inject(catalogEntityRegistryInjectable);
    const catalogRegistry = di.inject(catalogCategoryRegistryInjectable);

    const activeCategory = observable.box<CatalogCategory>();
    const selectedItemId = observable.box<string >();
    const entities = computed(() => {
      const category = activeCategory.get();

      return category
        ? entityRegistry.getItemsForCategory(category, { filtered: true })
        : entityRegistry.filteredItems;
    });
    const selectedItem = computed(() => {
      const id = selectedItemId.get();

      if (!id) {
        return undefined;
      }

      return entities.get().find(entity => entity.getId() === id);
    });
    const loadAll = () => {
      const category = activeCategory.get();

      if (category) {
        category.emit("load");
      } else {
        for (const category of catalogRegistry.items) {
          category.emit("load");
        }
      }
    };

    return {
      entities,
      selectedItem,
      activeCategory,
      selectedItemId,
      watch: () => disposer(
        reaction(() => entities.get(), loadAll),
        reaction(() => activeCategory.get(), loadAll, { delay: 100 }),
      ),
      onRun: entity => entityRegistry.onRun(entity),
      failedLoading: false,
      getTotalCount: () => entities.get().length,
      isLoaded: true,
      isSelected: (item) => item.getId() === selectedItemId.get(),
      isSelectedAll: () => false,
      pickOnlySelected: () => [],
      toggleSelection: () => {},
      toggleSelectionAll: () => {},
      removeSelectedItems: async () => {},
    };
  },
});

export default catalogEntityStoreInjectable;
