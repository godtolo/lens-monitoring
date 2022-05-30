/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./drawer-item.scss";
import React from "react";
import { cssNames, displayBooleans } from "../../utils";

export interface DrawerItemProps extends React.HTMLAttributes<HTMLDivElement> {
  name: React.ReactNode;
  title?: string;
  labelsOnly?: boolean;
  hidden?: boolean;
  renderBoolean?: boolean; // show "true" or "false" for all of the children elements are "typeof boolean"
  valueTestId?: string;
}

export function DrawerItem({
  name,
  title,
  labelsOnly,
  children,
  hidden = false,
  className,
  renderBoolean,
  valueTestId,
  ...elemProps
}: DrawerItemProps) {
  if (hidden) {
    return null;
  }

  return (
    <div
      {...elemProps}
      className={cssNames("DrawerItem", className, { labelsOnly })}
      title={title}
    >
      <span className="name">{name}</span>
      <span className="value" data-testid={valueTestId}>{displayBooleans(renderBoolean, children)}</span>
    </div>
  );
}
