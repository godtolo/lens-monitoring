/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./catalog.module.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { ItemListLayout } from "../item-object-list";
import { action, makeObservable, observable, reaction, runInAction, when } from "mobx";
import type { CatalogEntityStore } from "./catalog-entity-store/catalog-entity.store";
import { navigate } from "../../navigation";
import { MenuItem, MenuActions } from "../menu";
import type { CatalogEntityContextMenu, CatalogEntityContextMenuContext } from "../../api/catalog-entity";
import { HotbarStore } from "../../../common/hotbar-store";
import { ConfirmDialog } from "../confirm-dialog";
import { catalogCategoryRegistry, CatalogEntity } from "../../../common/catalog";
import { CatalogAddButton } from "./catalog-add-button";
import type { RouteComponentProps } from "react-router";
import { Notifications } from "../notifications";
import { MainLayout } from "../layout/main-layout";
import { prevDefault } from "../../utils";
import { CatalogEntityDetails } from "./catalog-entity-details";
import { browseCatalogTab, catalogURL, CatalogViewRouteParam } from "../../../common/routes";
import { CatalogMenu } from "./catalog-menu";
import { RenderDelay } from "../render-delay/render-delay";
import { Icon } from "../icon";
import { HotbarToggleMenuItem } from "./hotbar-toggle-menu-item";
import { Avatar } from "../avatar";
import { KubeObject } from "../../../common/k8s-api/kube-object";
import { getLabelBadges } from "./helpers";
import { withInjectables } from "@ogre-tools/injectable-react";
import catalogPreviousActiveTabStorageInjectable
  from "./catalog-previous-active-tab-storage/catalog-previous-active-tab-storage.injectable";
import catalogEntityStoreInjectable from "./catalog-entity-store/catalog-entity-store.injectable";

enum sortBy {
  name = "name",
  kind = "kind",
  source = "source",
  status = "status",
}

interface Props extends RouteComponentProps<CatalogViewRouteParam> {}

interface Dependencies {
  catalogPreviousActiveTabStorage: { set: (value: string ) => void }
  catalogEntityStore: CatalogEntityStore
}

@observer
class NonInjectedCatalog extends React.Component<Props & Dependencies> {
  @observable private contextMenu: CatalogEntityContextMenuContext;
  @observable activeTab?: string;

  constructor(props: Props & Dependencies) {
    super(props);
    makeObservable(this);
  }

  get routeActiveTab(): string {
    const { group, kind } = this.props.match.params ?? {};

    if (group && kind) {
      return `${group}/${kind}`;
    }

    return browseCatalogTab;
  }

  async componentDidMount() {
    this.contextMenu = {
      menuItems: observable.array([]),
      navigate: (url: string) => navigate(url),
    };
    disposeOnUnmount(this, [
      this.props.catalogEntityStore.watch(),
      reaction(() => this.routeActiveTab, async (routeTab) => {
        this.props.catalogPreviousActiveTabStorage.set(this.routeActiveTab);

        try {
          await when(() => (routeTab === browseCatalogTab || !!catalogCategoryRegistry.filteredItems.find(i => i.getId() === routeTab)), { timeout: 5_000 }); // we need to wait because extensions might take a while to load
          const item = catalogCategoryRegistry.filteredItems.find(i => i.getId() === routeTab);

          runInAction(() => {
            this.activeTab = routeTab;
            this.props.catalogEntityStore.activeCategory = item;
          });
        } catch (error) {
          console.error(error);
          Notifications.error(<p>Unknown category: {routeTab}</p>);
        }
      }, { fireImmediately: true }),
    ]);

    // If active category is filtered out, automatically switch to the first category
    disposeOnUnmount(this, reaction(() => catalogCategoryRegistry.filteredItems, () => {
      if (!catalogCategoryRegistry.filteredItems.find(item => item.getId() === this.props.catalogEntityStore.activeCategory.getId())) {
        const item = catalogCategoryRegistry.filteredItems[0];

        runInAction(() => {
          if (item) {
            this.activeTab = item.getId();
            this.props.catalogEntityStore.activeCategory = item;
          }
        });
      }
    }));
  }

  addToHotbar(entity: CatalogEntity): void {
    HotbarStore.getInstance().addToHotbar(entity);
  }

  removeFromHotbar(entity: CatalogEntity): void {
    HotbarStore.getInstance().removeFromHotbar(entity.getId());
  }

  onDetails = (entity: CatalogEntity) => {
    if (this.props.catalogEntityStore.selectedItemId) {
      this.props.catalogEntityStore.selectedItemId = null;
    } else {
      this.props.catalogEntityStore.onRun(entity);
    }
  };

  onMenuItemClick(menuItem: CatalogEntityContextMenu) {
    if (menuItem.confirm) {
      ConfirmDialog.open({
        okButtonProps: {
          primary: false,
          accent: true,
        },
        ok: () => {
          menuItem.onClick();
        },
        message: menuItem.confirm.message,
      });
    } else {
      menuItem.onClick();
    }
  }

  get categories() {
    return catalogCategoryRegistry.items;
  }

  @action
  onTabChange = (tabId: string | null) => {
    const activeCategory = this.categories.find(category => category.getId() === tabId);

    if (activeCategory) {
      navigate(catalogURL({ params: { group: activeCategory.spec.group, kind: activeCategory.spec.names.kind }}));
    } else {
      navigate(catalogURL({ params: { group: browseCatalogTab }}));
    }
  };

  renderNavigation() {
    return (
      <CatalogMenu activeItem={this.activeTab} onItemClick={this.onTabChange} />
    );
  }

  renderItemMenu = (entity: CatalogEntity) => {
    const onOpen = () => {
      this.contextMenu.menuItems = [];

      entity.onContextMenuOpen(this.contextMenu);
    };

    return (
      <MenuActions onOpen={onOpen}>
        <MenuItem key="open-details" onClick={() => this.props.catalogEntityStore.selectedItemId = entity.getId()}>
          View Details
        </MenuItem>
        {
          this.contextMenu.menuItems.map((menuItem, index) => (
            <MenuItem key={index} onClick={() => this.onMenuItemClick(menuItem)}>
              {menuItem.title}
            </MenuItem>
          ))
        }
        <HotbarToggleMenuItem
          key="hotbar-toggle"
          entity={entity}
          addContent="Add to Hotbar"
          removeContent="Remove from Hotbar"
        />
      </MenuActions>
    );
  };

  renderName(entity: CatalogEntity) {
    const isItemInHotbar = HotbarStore.getInstance().isAddedToActive(entity);

    return (
      <>
        <Avatar
          title={entity.getName()}
          colorHash={`${entity.getName()}-${entity.getSource()}`}
          src={entity.spec.icon?.src}
          background={entity.spec.icon?.background}
          className={styles.catalogAvatar}
          size={24}
        >
          {entity.spec.icon?.material && <Icon material={entity.spec.icon?.material} small/>}
        </Avatar>
        <span>{entity.getName()}</span>
        <Icon
          small
          className={styles.pinIcon}
          material={!isItemInHotbar && "push_pin"}
          svg={isItemInHotbar ? "push_off" : "push_pin"}
          tooltip={isItemInHotbar ? "Remove from Hotbar" : "Add to Hotbar"}
          onClick={prevDefault(() => isItemInHotbar ? this.removeFromHotbar(entity) : this.addToHotbar(entity))}
        />
      </>
    );
  }

  renderList() {
    const { activeCategory } = this.props.catalogEntityStore;
    const tableId = activeCategory ? `catalog-items-${activeCategory.metadata.name.replace(" ", "")}` : "catalog-items";

    if (this.activeTab === undefined) {
      return null;
    }

    return (
      <ItemListLayout
        className={styles.Catalog}
        tableId={tableId}
        renderHeaderTitle={activeCategory?.metadata.name || "Browse All"}
        isSelectable={false}
        isConfigurable={true}
        store={this.props.catalogEntityStore}
        sortingCallbacks={{
          [sortBy.name]: entity => entity.getName(),
          [sortBy.source]: entity => entity.getSource(),
          [sortBy.status]: entity => entity.status.phase,
          [sortBy.kind]: entity => entity.kind,
        }}
        searchFilters={[
          entity => [
            entity.getName(),
            entity.getId(),
            entity.status.phase,
            `source=${entity.getSource()}`,
            ...KubeObject.stringifyLabels(entity.metadata.labels),
          ],
        ]}
        renderTableHeader={[
          { title: "Name", className: styles.entityName, sortBy: sortBy.name, id: "name" },
          !activeCategory && { title: "Kind", sortBy: sortBy.kind, id: "kind" },
          { title: "Source", className: styles.sourceCell, sortBy: sortBy.source, id: "source" },
          { title: "Labels", className: `${styles.labelsCell} scrollable`, id: "labels" },
          { title: "Status", className: styles.statusCell, sortBy: sortBy.status, id: "status" },
        ].filter(Boolean)}
        customizeTableRowProps={entity => ({
          disabled: !entity.isEnabled(),
        })}
        renderTableContents={entity => [
          this.renderName(entity),
          !activeCategory && entity.kind,
          entity.getSource(),
          getLabelBadges(entity),
          <span key="phase" className={entity.status.phase}>{entity.status.phase}</span>,
        ].filter(Boolean)}
        onDetails={this.onDetails}
        renderItemMenu={this.renderItemMenu}
      />
    );
  }

  render() {
    if (!this.props.catalogEntityStore) {
      return null;
    }

    const selectedEntity = this.props.catalogEntityStore.selectedItem;

    return (
      <MainLayout sidebar={this.renderNavigation()}>
        <div className="p-6 h-full">
          {this.renderList()}
        </div>
        {
          selectedEntity
            ? <CatalogEntityDetails
              entity={selectedEntity}
              hideDetails={() => this.props.catalogEntityStore.selectedItemId = null}
              onRun={() => this.props.catalogEntityStore.onRun(selectedEntity)}
            />
            : (
              <RenderDelay>
                <CatalogAddButton
                  category={this.props.catalogEntityStore.activeCategory}
                />
              </RenderDelay>
            )
        }
      </MainLayout>
    );
  }
}

export const Catalog = withInjectables<Dependencies, Props>(
  NonInjectedCatalog,
  {
    getProps: (di, props) => ({
      catalogEntityStore: di.inject(catalogEntityStoreInjectable),

      catalogPreviousActiveTabStorage: di.inject(
        catalogPreviousActiveTabStorageInjectable,
      ),

      ...props,
    }),
  },
);
