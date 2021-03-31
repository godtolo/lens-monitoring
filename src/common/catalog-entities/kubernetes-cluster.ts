import { observable } from "mobx";
import { catalogCategoryRegistry } from "../catalog-category-registry";
import { CatalogCategory, CatalogEntity, CatalogEntityActionContext, CatalogEntityContextMenuContext, CatalogEntityData, CatalogEntityMetadata, CatalogEntityStatus } from "../catalog-entity";
import { clusterDisconnectHandler } from "../cluster-ipc";
import { clusterStore } from "../cluster-store";
import { requestMain } from "../ipc";

export type KubernetesClusterSpec = {
  kubeconfigPath: string;
  kubeconfigContext: string;
};

export interface KubernetesClusterStatus extends CatalogEntityStatus {
  phase: "connected" | "disconnected";
}

export class KubernetesCluster implements CatalogEntity {
  public readonly apiVersion = "entity.k8slens.dev/v1alpha1";
  public readonly kind = "KubernetesCluster";
  @observable public metadata: CatalogEntityMetadata;
  @observable public status: KubernetesClusterStatus;
  @observable public spec: KubernetesClusterSpec;

  constructor(data: CatalogEntityData) {
    this.metadata = data.metadata;
    this.status = data.status as KubernetesClusterStatus;
    this.spec = data.spec as KubernetesClusterSpec;
  }

  getId() {
    return this.metadata.uid;
  }

  getName() {
    return this.metadata.name;
  }

  get cluster() {
    return clusterStore.getById(this.metadata.uid);
  }

  async onRun(context: CatalogEntityActionContext) {
    context.navigate(`/cluster/${this.metadata.uid}`);
  }

  async onDetailsOpen() {
    //
  }

  async onContextMenuOpen(context: CatalogEntityContextMenuContext) {
    context.menuItems = [
      {
        icon: "settings",
        title: "Settings",
        onClick: async () => context.navigate(`/cluster/${this.metadata.uid}/settings`)
      },
      {
        icon: "delete",
        title: "Delete",
        onClick: async () => clusterStore.removeById(this.metadata.uid)
      },
    ];

    if (this.status.active) {
      context.menuItems.unshift({
        icon: "link_off",
        title: "Disconnect",
        onClick: async () => {
          clusterStore.deactivate(this.metadata.uid);
          requestMain(clusterDisconnectHandler, this.metadata.uid);
        }
      });
    }
  }
}

export class KubernetesClusterCategory implements CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "Kubernetes Clusters"
  };
  public spec = {
    group: "entity.k8slens.dev",
    versions: [
      {
        name: "v1alpha1",
        entityClass: KubernetesCluster
      }
    ],
    names: {
      kind: "KubernetesCluster"
    }
  };
}

catalogCategoryRegistry.add(new KubernetesClusterCategory());
