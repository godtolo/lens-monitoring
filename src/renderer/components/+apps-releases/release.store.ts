import isEqual from "lodash/isEqual";
import { action, observable, reaction, when } from "mobx";
import { autobind } from "../../utils";
import { HelmRelease, helmReleasesApi, IReleaseCreatePayload, IReleaseUpdatePayload } from "../../api/endpoints/helm-releases.api";
import { ItemStore } from "../../item.store";
import { Secret } from "../../api/endpoints";
import { secretsStore } from "../+config-secrets/secrets.store";
import { namespaceStore } from "../+namespaces/namespace.store";
import { Notifications } from "../notifications";

@autobind()
export class ReleaseStore extends ItemStore<HelmRelease> {
  releaseSecrets = observable.map<string, Secret>();

  constructor() {
    super();
    when(() => secretsStore.isLoaded, () => {
      this.releaseSecrets.replace(this.getReleaseSecrets());
    });
  }

  watchAssociatedSecrets(): (() => void) {
    return reaction(() => secretsStore.items.toJS(), () => {
      if (this.isLoading) return;
      const newSecrets = this.getReleaseSecrets();
      const amountChanged = newSecrets.length !== this.releaseSecrets.size;
      const labelsChanged = newSecrets.some(([id, secret]) => (
        !isEqual(secret.getLabels(), this.releaseSecrets.get(id)?.getLabels())
      ));

      if (amountChanged || labelsChanged) {
        this.loadFromContextNamespaces();
      }
      this.releaseSecrets.replace(newSecrets);
    });
  }

  watchSelecteNamespaces(): (() => void) {
    return reaction(() => namespaceStore.context.contextNamespaces, namespaces => {
      this.loadAll(namespaces);
    });
  }

  private getReleaseSecrets() {
    return secretsStore
      .getByLabel({ owner: "helm" })
      .map(s => [s.getId(), s] as const);
  }

  getReleaseSecret(release: HelmRelease) {
    return secretsStore.getByLabel({
      owner: "helm",
      name: release.getName()
    })
      .find(secret => secret.getNs() == release.getNs());
  }

  @action
  async loadAll(namespaces: string[]) {
    console.log("reloading releases", namespaces);
    this.isLoading = true;
    this.isLoaded = false;

    try {
      const items = await this.loadItems(namespaces);

      this.items.replace(this.sortItems(items));
      this.isLoaded = true;
    } catch (error) {
      console.error("Loading Helm Chart releases has failed", error);

      if (error.error) {
        Notifications.error(error.error);
      }
    } finally {
      this.isLoading = false;
    }
  }

  async loadFromContextNamespaces(): Promise<void> {
    return this.loadAll(namespaceStore.context.contextNamespaces);
  }

  async loadItems(namespaces: string[]) {
    const isLoadingAll = namespaceStore.context.allNamespaces?.length > 1
      && namespaceStore.context.cluster.accessibleNamespaces.length === 0
      && namespaceStore.context.allNamespaces.every(ns => namespaces.includes(ns));

    if (isLoadingAll) {
      return helmReleasesApi.list();
    } else {
      return Promise // load resources per namespace
        .all(namespaces.map(namespace => helmReleasesApi.list(namespace)))
        .then(items => items.flat());
    }
  }

  async create(payload: IReleaseCreatePayload) {
    const response = await helmReleasesApi.create(payload);

    if (this.isLoaded) this.loadFromContextNamespaces();

    return response;
  }

  async update(name: string, namespace: string, payload: IReleaseUpdatePayload) {
    const response = await helmReleasesApi.update(name, namespace, payload);

    if (this.isLoaded) this.loadFromContextNamespaces();

    return response;
  }

  async rollback(name: string, namespace: string, revision: number) {
    const response = await helmReleasesApi.rollback(name, namespace, revision);

    if (this.isLoaded) this.loadFromContextNamespaces();

    return response;
  }

  async remove(release: HelmRelease) {
    return super.removeItem(release, () => helmReleasesApi.delete(release.getName(), release.getNs()));
  }

  async removeSelectedItems() {
    if (!this.selectedItems.length) return;

    return Promise.all(this.selectedItems.map(this.remove));
  }
}

export const releaseStore = new ReleaseStore();
