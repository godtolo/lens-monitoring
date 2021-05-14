import styles from "./installed-extensions.module.css";
import { Avatar } from "@material-ui/core";
import React, { useMemo } from "react";
import { ExtensionDiscovery, InstalledExtension } from "../../../extensions/extension-discovery";
import { ExtensionLoader } from "../../../extensions/extension-loader";
import { Icon } from "../icon";
import { List } from "../list/list";
import { MenuActions, MenuItem } from "../menu";
import { Spinner } from "../spinner";
import { ExtensionInstallationStateStore } from "./extension-install.store";
import { cssNames } from "../../utils";

interface Props {
  extensions: InstalledExtension[];
  uninstall: (extension: InstalledExtension) => void;
}

function getStatus(isEnabled: boolean) {
  return isEnabled ? "Enabled" : "Disabled";
}

export function InstalledExtensions({ extensions, uninstall }: Props) {
  if (!ExtensionDiscovery.getInstance().isLoaded) {
    return <div><Spinner /></div>;
  }

  if (ExtensionLoader.getInstance().userExtensions.size == 0) {
    // TODO: Add placeholder
    return <div>No extensions</div>;
  }

  const filters = [
    (extension: InstalledExtension) => extension.manifest.name,
    (extension: InstalledExtension) => getStatus(extension.isEnabled),
    (extension: InstalledExtension) => extension.manifest.version,
  ];

  const columns = useMemo(
    () => [
      {
        Header: "Extension",
        accessor: "extension",
        width: 200
      },
      {
        Header: "Version",
        accessor: "version",
      },
      {
        Header: "Status",
        accessor: "status"
      },
      {
        Header: "",
        accessor: "actions",
        disableSortBy: true,
        width: 20,
        className: "actions"
      }
    ], []
  );

  const data = useMemo(
    () => {
      return extensions.map(extension => {
        const { id, isEnabled, manifest } = extension;
        const { name, description, version } = manifest;
        const isUninstalling = ExtensionInstallationStateStore.isExtensionUninstalling(id);

        return {
          extension: (
            <div className="flex items-start">
              <div className="mr-4 mt-2">
                <Avatar/>
              </div>
              <div>
                <div className={styles.extensionName}>{name}</div>
                <div className={styles.extensionDescription}>{description}</div>
              </div>
            </div>
          ),
          version,
          status: (
            <div className={cssNames({[styles.enabled]: getStatus(isEnabled) == "Enabled"})}>
              {getStatus(isEnabled)}
            </div>
          ),
          actions: (
            <MenuActions usePortal toolbar={false}>
              {isEnabled ? (
                <MenuItem
                  disabled={isUninstalling}
                  onClick={() => extension.isEnabled = false}
                >
                  <Icon material="unpublished"/>
                  <span className="title">Disable</span>
                </MenuItem>
              ) : (
                <MenuItem
                  disabled={isUninstalling}
                  onClick={() => extension.isEnabled = true}
                >
                  <Icon material="check_circle"/>
                  <span className="title">Enable</span>
                </MenuItem>
              )}
              <MenuItem
                disabled={isUninstalling}
                onClick={() => uninstall(extension)}
              >
                <Icon material="delete"/>
                <span className="title">Uninstall</span>
              </MenuItem>
            </MenuActions>
          )
        };
      });
    }, [extensions]
  );

  return (
    <section>
      <List
        title="Manage your extensions in here."
        columns={columns}
        data={data}
        items={extensions}
        filters={filters}
      />
    </section>
  );
}
