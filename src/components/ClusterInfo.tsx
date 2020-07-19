import * as React from "react";

import * as Components from "../harmonize/Component"

import { NodeInfo } from "./NodeInfo"

export interface ClusterProps { cluster: Components.Commander }
export class ClusterInfo extends React.Component<ClusterProps, {}> {
    render() {
        var rows = [];
        var commander = this.props.cluster;
        for (var i = 0; i < commander.nodes.length; i++) {
            var node = commander.nodes[i];
            rows.push(<NodeInfo key={i} node={node}></NodeInfo>);
        }

        return <div className="modal fade" id="clusterInfoModal" role="dialog" aria-labelledby="clusterInfoModalLabel"
            aria-hidden="true">
            <div className="modal-dialog modal-xl">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="clusterInfoModalLabel">Cluster Info</h5>
                        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <div className="form-row">
                            <div className="alert alert-secondary" role="alert">{this.props.cluster.id}</div>
                        </div>
                        <span>Node List</span>
                        <div className="border border-secondary d-flex flex-row " style={{ padding: '1em 0.5rem', margin: '0.2rem 0' }}>
                            {rows}
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>;
    }
}