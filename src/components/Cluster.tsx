import * as React from "react";

import * as Components from "../harmonize/Component"

import { Node } from "./Node"

export interface ClusterProps { cluster: Components.Commander }
export class Cluster extends React.Component<ClusterProps, {}> {
    render() {
        var rows = [];
        var navItems = [];
        var tabContents = [];
        var commander = this.props.cluster;
        for (var i = 0; i < commander.nodes.length; i++) {
            var node = commander.nodes[i];
            rows.push(<Node key={i} node={node}></Node>);

            var node_id = 'a_' + node.id.replace(/[\.:]/g, '_');
            navItems.push(<li key={i} className="nav-item" role="presentation">
                <a className={"nav-link " + (i || "active")} id={node_id + "_tab"} data-toggle="tab"
                    href={"#" + node_id} role="tab" aria-controls={node_id} aria-selected={i ? "false" : "true"}>{node.id}</a>
            </li>);

            var shellOutput = node.shellOutput ? node.shellOutput.join('\r\n') : "....";
            tabContents.push(<div key={i} className={"tab-pane fade " + (i || "active show") + " text-light bg-dark text-monospace"}
                id={node_id} style={{ padding: '0.5em', height: '30rem', fontSize: "0.7em" }} role="tabpanel" aria-labelledby={node_id + "_tab"}>
                {shellOutput}
            </div>);
        }

        return <div className="row" style={{ margin: 0 }}>
            <div className="col-12" style={{ padding: '0.5em' }}>
                <ul className="nav nav-tabs" role="tablist">
                    {navItems}
                </ul>
                <div className="tab-content" style={{ minHeight: '30rem' }}>
                    {tabContents}
                </div>
            </div>
        </div >;
    }
}