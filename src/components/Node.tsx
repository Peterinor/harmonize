import * as React from "react";
import * as Components from "../harmonize/Component"

export interface NodeProps { node: Components.ClusterNode }

export class Node extends React.Component<NodeProps, {}> {
    render() {
        return <button type="button" className="btn btn-secondary btn-sm">{this.props.node.id}</button>;
    }
}