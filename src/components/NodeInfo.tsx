import * as React from "react";
import * as Components from "../harmonize/Component"

export interface NodeProps { node: Components.ClusterNode }

export class NodeInfo extends React.Component<NodeProps, {}> {
    render() {
        var node = this.props.node;
        return <div className="card" style={{ maxWidth: '15rem', marginRight: '0.1rem' }}>
            <div className="card-body">
                <h6 className="card-title">{node.id}</h6>
                <p className="card-text font-italic">{node.lastRespondTime}</p>
                <div className="card-text bg-light">
                    <ul>
                        {(node.availableBackends || []).map((n, idx) => <li key={idx}>{n.name}</li>)}
                    </ul>
                </div>
            </div>
        </div>;
    }
}