import "./endpoint-details.scss";

import React from "react";
import { observer } from "mobx-react";
import { DrawerTitle } from "../drawer";
import { KubeEventDetails } from "../+events/kube-event-details";
import { KubeObjectDetailsProps } from "../kube-object";
import { Endpoint } from "../../api/endpoints";
import { KubeObjectMeta } from "../kube-object/kube-object-meta";
import { EndpointSubsetList } from "./endpoint-subset-list";
import { kubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";

interface Props extends KubeObjectDetailsProps<Endpoint> {
}

@observer
export class EndpointDetails extends React.Component<Props> {
  render() {
    const { object: endpoint } = this.props;

    if (!endpoint) return;

    return (
      <div className="EndpointDetails">
        <KubeObjectMeta object={endpoint}/>
        <DrawerTitle title="Subsets"/>
        {
          endpoint.getEndpointSubsets().map((subset) => (
            <EndpointSubsetList key={subset.toString()} subset={subset} endpoint={endpoint} />
          ))
        }
      </div>
    );
  }
}

kubeObjectDetailRegistry.add({
  kind: "Endpoints",
  apiVersions: ["v1"],
  components: {
    Details: (props) => <EndpointDetails {...props} />
  }
});
kubeObjectDetailRegistry.add({
  kind: "Endpoints",
  apiVersions: ["v1"],
  priority: 5,
  components: {
    Details: (props) => <KubeEventDetails {...props} />
  }
});
