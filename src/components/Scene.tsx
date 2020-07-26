import * as React from "react";
import { BenchScene } from "../benching/Benching";

export interface SceneProps { scene: BenchScene }

export class Scene extends React.Component<SceneProps, {}> {
    render() {
        var headers = [];
        Object.keys(this.props.scene.headers).forEach(k => {
            headers.push(k + ":" + this.props.scene.headers[k]);
        });
        return (<div className="card" style={{ minWidth: '12rem', maxWidth: '15rem', marginRight: '0.1rem' }}>
            <div className="card-body">
                <h6 className="card-title">{this.props.scene.method}  {this.props.scene.url}</h6>
                <h6 className="card-subtitle mb-2 text-muted">{headers.join(';')}</h6>
                <p className="card-text font-italic">{this.props.scene.contentType}</p>
                <p className="card-text bg-light">{this.props.scene.body}</p>
                <a href="#" className="card-link" style={{ position: 'absolute', top: '0.5em', right: '0.5em' }}>Edit</a>
            </div>
        </div>);
    }
}