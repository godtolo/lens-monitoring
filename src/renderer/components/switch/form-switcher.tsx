/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { FormControlLabelProps } from "@material-ui/core/FormControlLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { makeStyles } from "@material-ui/styles";
import { Switch } from "./switch";

const useStyles = makeStyles({
  root: {
    margin: 0,
    "& .MuiTypography-root": {
      fontSize: 14,
      fontWeight: 500,
      flex: 1,
      color: "var(--textColorAccent)",
    },
  },
});

/**
 * @deprecated Use <Switch/> instead from "../switch.tsx".
 */
export function FormSwitch(props: FormControlLabelProps & { children?: React.ReactNode }) {
  const classes = useStyles();

  const ClonedElement = React.cloneElement(props.control, {
    children: props.label,
  });

  return ClonedElement;
}
