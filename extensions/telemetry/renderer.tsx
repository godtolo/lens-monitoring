import { LensRendererExtension } from "@k8slens/extensions";
import { telemetryPreferencesStore } from "./src/telemetry-preferences-store"
import { TelemetryPreferenceHint, TelemetryPreferenceInput } from "./src/telemetry-preference"
import { tracker } from "./src/tracker"
import React from "react"

export default class TelemetryRendererExtension extends LensRendererExtension {
  async onActivate() {
    console.log("telemetry extension activated")
    tracker.start()
    await telemetryPreferencesStore.loadExtension(this)
  }

  appPreferences() {
    return [
      {
        title: "Telemetry & Usage Tracking",
        components: {
          Hint: () => <TelemetryPreferenceHint />,
          Input: () => <TelemetryPreferenceInput telemetry={telemetryPreferencesStore} />
        }
      }
    ]
  }

  onDeactivate() {
    console.log("telemetry extension deactivated")
  }
}
