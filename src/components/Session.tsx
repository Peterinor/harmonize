import * as React from "react";
import { BenchSession, BenchScene } from "../benching/Benching";
import { Scene } from "./Scene"
import { Cluster } from "./Cluster";

import * as serialize from 'form-serialize';
import { Commander } from "../harmonize/Component";

export interface SessionProps { session: BenchSession, cluster: Commander }

export class Session extends React.Component<SessionProps, {}> {
    constructor(props) {
        super(props);
        this.state = { t: Date.now() };
    }

    addScene() {
        var form = document.querySelector('#addSceneModal form');
        var sceneObj = serialize(form, { hash: true });
        var scene = new BenchScene();
        Object.assign(scene, sceneObj);
        if (sceneObj.headersString) {
            var headers: Array<string> = sceneObj.headersString.split(';');
            for (const header of headers) {
                var hs = header.split(':');
                scene.headers.set(hs[0], hs[1]);
            }
        }
        this.props.session.scenes.push(scene);
        this.setState({ t: Date.now() });

        console.log(sceneObj);
    }

    render() {

        if (!this.props.session) {
            return (<div className="border border-secondary" data-version={this.state["t"] || 0}>
                <div className="jumbotron jumbotron-fluid">
                    <div className="container">
                        <h4>load history session or add new session</h4>
                        <p className="lead">..................</p>
                    </div>
                </div>
            </div>);
        }

        var scenes = this.props.session.scenes.map((s, i) => {
            return <Scene key={i} scene={s} />;
        });

        var addScene = this.addScene.bind(this);
        return (<div className="border border-secondary" data-version={this.state["t"] || 0}>
            <div className="position-relative border border-secondary d-flex flex-row bd-highlight mb-3" style={{ padding: '1rem 0.2rem', margin: '1rem 0.2rem' }}>
                <span style={{ position: 'absolute', top: '-1rem', left: '0.5rem', background: 'white', padding: '0 0.5rem' }}>
                    Session: {this.props.session.id} / Scenes</span>
                <button type="button" className="btn btn-warning" data-toggle="modal" data-target="#addSceneModal"
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>Add Scene</button>
                {scenes}
            </div>
            <div className="modal fade" id="addSceneModal" role="dialog" aria-labelledby="addSceneModalLabel"
                aria-hidden="true">
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="addSceneModalLabel">New bench Scene</h5>
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <form>
                                <input type="hidden" name="sessionId" value={this.props.session.id} />
                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label htmlFor="input_scene_name">Name</label>
                                        <input type="text" className="form-control" id="input_scene_name" defaultValue="scene-1" name="name" />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label htmlFor="input_scene_method">Method</label>
                                        <select id="input_scene_method" className="form-control" defaultValue="POST" name="method">
                                            <option value="GET">GET</option>
                                            <option value="POST">POST</option>
                                            <option value="PUT">PUT</option>
                                            <option value="DELETE">DELETE</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="border border-secondary" style={{ padding: '0 0.5rem', margin: '0.2rem 0' }}>
                                    <span
                                        style={{ position: 'relative', top: '-1rem', background: 'white', padding: '0 0.5rem' }}>
                                        Parameters</span>
                                    <div className="form-group">
                                        <label htmlFor="input_scene_content_type">Content-Type</label>
                                        <input type="text" className="form-control" id="input_scene_content_type" defaultValue="application/json" name="contentType" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="input_scene_headers">Headers</label>
                                        <input type="text" className="form-control" id="input_scene_headers" name="headersString" placeholder="name1:value1;name2:value2" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="input_scene_url">Url</label>
                                        <input type="text" className="form-control" id="input_scene_url" defaultValue="http://localhost" name="url" />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="input_scene_query_body">query/body</label>
                                        <textarea className="form-control" id="input_scene_query_body" name="body"></textarea>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-primary" onClick={addScene} >Submit</button>
                        </div>
                    </div>
                </div>
            </div>

            {this.props.cluster && <Cluster cluster={this.props.cluster} />}
        </div>);
    }
}